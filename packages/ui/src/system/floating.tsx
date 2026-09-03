/**
 * The floating family's shared JS mechanisms (§20, §22) — promoted from menu.tsx on the
 * second consumer (Select, 2026-08-09), the architecture sweep's own rule: the right
 * mechanism existing in one file and never promoted is the pattern every audit keeps
 * finding. CSS follows the second-member-self-keys rule; a JS mechanism with laws behind
 * it promotes on its second consumer, the way render.ts's helpers did.
 *
 * What lives here is exactly what every portalling component owes §20: the landing spot
 * that re-themes only when a React <Theme> chose the axes, and the ambient-direction
 * measurement that crosses the portal in both layers (CSS `dir` + Base UI's own
 * DirectionProvider context). The component roots stay the providers — a menu measures
 * off its trigger, a select off its trigger — because the trigger is the one in-flow
 * node such a component owns.
 */
import * as React from "react";

import { Theme, useThemeRooted } from "../theme/theme.tsx";
import { DEV } from "./dev.ts";

export type TextDirection = "ltr" | "rtl";

export type FloatingDirection = {
  /**
   * `null` MEANS NOBODY MEASURED, and it is not the same as `ltr` (2026-08-26, ultracode audit).
   *
   * The context default used to be the literal `"ltr"`, and `PortalScope` stamps whatever it
   * holds — so a portalling component that forgot to provide this context did not fall back to
   * "no opinion", it asserted the wrong one, and a stamped `ltr` OVERRIDES the `rtl` the portal
   * would have inherited from the document. That is the stale-stamp failure this file's own
   * `useAmbientDirection` comment records twice, and it shipped twice more anyway: Popover and
   * Tooltip were both written without the provider and both opened `dir="ltr"` panels inside
   * `<html dir="rtl">` apps, fixed the same day this was.
   *
   * Fixing the two call sites leaves the trap loaded for the next one, so the trap is removed
   * instead: an unmeasured direction is `null`, `PortalScope` stamps nothing, and the portal
   * inherits the document — which is the honest answer and the one `useAmbientDirection`'s own
   * document fallback already reaches for. `anchor` has spelled absence as `null` since it was
   * written; this is only its neighbour catching up.
   */
  direction: TextDirection | null;
  /** Attached to the trigger — the one in-flow node a floating component owns. */
  measure: (node: HTMLElement | null) => void;
  /** The measured trigger itself. The entry reads its box (the seed leans to the trigger's own
      middle), and reading it HERE — off the node the component already measures for direction —
      is what keeps the popup from reaching for `--anchor-width`, which floating-ui publishes
      too late for the seed frame (the 2026-08-09 corner collapse). */
  anchor: () => HTMLElement | null;
  /**
   * The SIZE of the silhouette the panel comes out of, when the thing that summoned it is not
   * an element (§42).
   *
   * Every family until ContextMenu was opened by a control, so the seed's box and the ambient
   * direction's node were the same thing and one accessor answered both. A context menu breaks
   * that pair: it is summoned at a POINT, and its trigger is a REGION — a canvas, a pane, a
   * whole window — so the element is still the right place to read the direction and the wrong
   * box entirely to fly out of. The two questions separate rather than the entry being
   * abandoned: `anchor` stays "which node is this component's in-flow one", and this is "what
   * does the panel come out of".
   *
   * A SIZE AND NOT A RECT, which is the whole of why this needs no event handler. The
   * positioner has already placed the panel AT the point — that is what a context menu's
   * positioner does — so the seed's position is the panel's own corner and there is nothing to
   * measure. The first spelling tracked the cursor through `contextmenu` and `pointerdown`
   * handlers on the region, and the "no JS at interaction time" law refused it, correctly: a
   * handler on every press over a canvas, to learn a coordinate the layout already knows.
   *
   * Unset everywhere else, where the trigger IS the silhouette and always was.
   */
  seedSize?: (() => { width: number; height: number } | null) | undefined;
};

/** The attributes a direction change can arrive on. `dir` is the platform's own spelling and
    `lang` rides with it in every i18n library's switch, so observing both costs nothing and
    catches the idiom as it is actually written. */
const DIRECTION_ATTRS = ["dir", "lang", "style", "class"];

/** What a component ROOT hands down: it measured, so the direction is never null. Every
    `DirectionProvider` in this package reads `.direction` off one of these. */
export type MeasuredDirection = FloatingDirection & { direction: TextDirection };

export const FloatingDirectionContext = React.createContext<FloatingDirection>({
  direction: null,
  measure: () => {},
  anchor: () => null,
});

/**
 * The root half of the direction mechanism (§20): the trigger's computed direction IS the
 * ambient one — the same read whether the app spelled it `dir` on an ancestor or `direction`
 * in CSS, which an attribute-only check would get wrong. LTR apps never see a state change,
 * and the server renders the ltr branch the client's first render also produces.
 *
 * It KEEPS measuring (fixed 2026-08-09, audit). One measurement in the ref callback is taken
 * at commit, and every library that switches language at runtime — the whole react-i18next /
 * next-intl idiom — sets `document.documentElement.dir` in an EFFECT, which runs strictly
 * after the render that would have re-measured. So the one read landed before the change and
 * never happened again: measured, a page switched to Arabic in place opened its panel at
 * 534-672px where the correct answer was 339-600px, mirrored trigger and un-mirrored panel,
 * and it did not recover on close and reopen. Worse than doing nothing, because the stale
 * `dir` the wrapper stamps OVERRIDES the document direction that portalled content would
 * otherwise have inherited correctly — removing the stamp from a stale panel fixed it
 * instantly, which is what proved the stamp was the thing that was wrong.
 *
 * A MutationObserver on the document element rather than a resize/interval poll: direction is
 * an attribute change, so the platform already has the event. Scoped to the one element every
 * such library writes to, and to the attributes a direction change can ride on, so an app that
 * never changes direction pays one observer and zero callbacks.
 */
export function useAmbientDirection(): MeasuredDirection {
  const [direction, setDirection] = React.useState<TextDirection>("ltr");
  const node = React.useRef<HTMLElement | null>(null);

  const read = React.useCallback(() => {
    /**
     * The document is the fallback, and Dialog is why (2026-08-10, §24).
     *
     * Every floating component until now owned a trigger, so "the trigger's computed
     * direction" was always readable. A dialog need not have one — `<Dialog open={…}>` driven
     * by app state is an ordinary shape, and a confirmation opened from a keyboard shortcut
     * has no in-flow node at all. With nothing measured this bailed and left the state at its
     * `ltr` initial value, which is not "unknown": PortalScope STAMPS the direction it holds,
     * and a stamped `ltr` overrides the `rtl` the portal would otherwise have inherited from
     * the document. That is the exact failure the runtime-switch fix above records — a stale
     * stamp being worse than no stamp — reached by a different road.
     *
     * `<html>` is the honest answer here rather than a guess: it is the ancestor of
     * `document.body`, so it is what the portal would inherit anyway, and reading its COMPUTED
     * direction still catches an app that spells the fact in CSS instead of on the attribute.
     */
    const el = node.current ?? (typeof document === "undefined" ? null : document.documentElement);
    if (!el) return;
    const ambient = getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr";
    setDirection((prev) => (prev === ambient ? prev : ambient));
  }, []);

  const measure = React.useCallback(
    (el: HTMLElement | null) => {
      node.current = el;
      read();
    },
    [read],
  );

  // Deliberately un-keyed: this runs after EVERY commit, which is what catches the direction
  // being changed on an ancestor the component re-rendered under. `read` sets state only when
  // the value actually differs, so a stable direction costs one style read and no re-render.
  React.useEffect(read);

  // And the observer catches the other half — a direction change with no React render at all,
  // which is the common case (a language switcher writing to <html> outside the tree).
  React.useEffect(() => {
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: DIRECTION_ATTRS,
    });
    return () => observer.disconnect();
  }, [read]);

  const anchor = React.useCallback(() => node.current, []);
  return React.useMemo<MeasuredDirection>(
    () => ({ direction, measure, anchor }),
    [direction, measure, anchor],
  );
}

/**
 * The portal's landing spot (§20).
 *
 * A portalled subtree loses every CSS attribute its author wrote above it, so the wrapper
 * re-stamps them — but only when a React `<Theme>` actually chose them. With no Theme in the
 * tree the axes are carried on the DOM instead (`<html data-appearance="dark">`, the
 * standalone path the emitted stylesheet promises and `card.browser.test.tsx` law-enforces),
 * and `<html>` is an ancestor of `document.body`, so they reach the portal already. A
 * wrapper that stamped anyway could not tell "nobody chose an appearance" from "someone
 * chose light", and overrode all six: measured, a dark/elevated/compact document opened a
 * white/flat/default menu, the exact "light card in a dark app" §20 was written to prevent
 * (audit 2026-08-09).
 *
 * The element exists in both branches because `dir` needs somewhere to live either way.
 */
export function PortalScope({ children }: { children: React.ReactNode }) {
  // `dir` is stamped in BOTH branches and always, not only when rtl: it is the ambient
  // direction the trigger measured, and stating it is what keeps a portalled panel from
  // silently taking the document's direction instead of its author's (§20).
  const { direction } = React.use(FloatingDirectionContext);
  const rooted = useThemeRooted();
  warnUnframed(rooted);
  const scope = (
    // Spread rather than `dir={direction}`, because `dir={null}` and `dir={undefined}` both
    // render no attribute while `exactOptionalPropertyTypes` refuses the second — and the
    // distinction being expressed at all is the point: an unmeasured direction states nothing,
    // so the portal keeps the document's.
    <div className="kui-portal" {...(direction ? { dir: direction } : {})}>
      {children}
    </div>
  );
  return rooted ? <Theme render={scope} /> : scope;
}

/** Said once per document, not once per open: an app either has a root Theme or it does not. */
let unframedSaid = false;

/**
 * THE STACKING FRAME NEEDS A ROOT `<Theme>`, and on the un-rooted path there is not one
 * (§20, measured 2026-08-22).
 *
 * `isolation: isolate` is declared on `.kui-theme:not(.kui-theme *)`, and it is what keeps an
 * app's z-indexes inside the app: with the frame in place a portalled panel is a later sibling
 * of it and paints above by DOM order, with no number ladder anywhere. The axes-on-`<html>`
 * path is supported and law-tested, and it renders no `.kui-theme` at all — so nothing
 * isolates, and any ordinary `position: sticky; z-index: 50` header competes with the portal
 * directly and wins, because the portal is `z-index: auto`. Measured: a fixed z-50 cover paints
 * OVER an open menu with no root Theme and UNDER it with one.
 *
 * This is a warning rather than a fix, and the restraint is the decision. Every repair that
 * works from inside the portal is a z-index big enough to out-rank the app's — the ladder §20
 * rejected on the record (MUI, Mantine and shadcn all ship one), and it would lose to the next
 * app that picks a bigger number. The frame is the mechanism; what was missing is that nothing
 * said so when it was absent. `warnOnFramedAncestor` cannot cover this, being Theme's own ref
 * callback and therefore silent exactly when there is no Theme.
 */
function warnUnframed(rooted: boolean): void {
  if (!DEV || rooted || unframedSaid || typeof document === "undefined") return;
  if (document.querySelector(".kui-theme")) return;
  unframedSaid = true;
  console.warn(
    "[kookie-ui] A floating panel opened with no <Theme> in the tree. The axes still reach it " +
      "from <html>, but the stacking frame does not exist: `isolation: isolate` is declared on " +
      "the outermost <Theme>, and without it any positioned element with a z-index will paint " +
      "over menus, selects and dialogs. Render a <Theme> at the root of the app.",
  );
}

/* ── Motion: the emergence recipe's one mechanism (§8, §22 — 2026-08-09) ─────────────────
 *
 * A panel unfurls out of a seed into its own box, which means the box has to be animated to
 * a length — and CSS still cannot interpolate to `auto` anywhere but Chromium
 * (`interpolate-size: allow-keywords` is unimplemented in Safari and Firefox as of
 * 2026-08), so the destination has to be measured. Two shapes were rejected before this one:
 * animating `scale` instead of size (the panel becomes a photograph being unrolled — the
 * rigid-body failure the whole grammar exists to avoid, LOG principle 10), and the grid
 * `0fr → 1fr` trick (pure CSS, but it forces `max-content` sizing on the rows, which is the
 * unbounded-row defect the audit closed on 2026-08-09).
 *
 * This does NOT breach §8's no-JS-at-interaction-time rule. That rule guards hover, press and
 * focus — states the browser can serve with no script, so they stay instant while the main
 * thread is busy. Opening a panel is already script: Base UI measures the anchor and writes
 * the position. One more measurement in the same commit is inside the sanctioned zone.
 */


/**
 * THE WIDTH FLOOR IS THE TRIGGER'S LAYOUT BOX, AND IT OUTLIVES THE FLIGHT (§22, §23).
 *
 * The floor is `max(--floating-min-w, --anchor-width)`, and `--anchor-width` does not exist
 * until Base UI has placed the panel — so the entry publishes the number itself as
 * `--kui-anchor-w`, which the floor consults first (menu.css, select.css). The two must agree,
 * or the panel steps the moment one hands over to the other. They disagreed for two reasons at
 * once, and fixing either alone leaves the step (measured 2026-08-22).
 *
 * FIRST, WHEN. An open trigger holds its press (§8) and the press is a SPRING, so the scale at
 * the instant the entry measures depends on how the panel was opened: a real pointer press has
 * not started travelling yet (measured `scale: 1`, rect 400 on a 400px button) while a
 * `defaultOpen` panel is already holding it (measured `scale: 0.975`, rect 351 on a 360px
 * trigger). The raw rect is therefore a different quantity per input path, which is why this
 * function divides: what it publishes is the trigger's LAYOUT box in both, and that is the
 * fixed thing "never narrower than the trigger you pressed" was always about. This is the
 * 2026-08-10 spelling, restored — the 2026-08-17 reversal called it "predicting the scaled box"
 * on the premise that Base UI "reads `getScale(trigger)` and normalises the rect by it", which
 * is false: `getScale` appears in `internals/useAnchorPositioning.js` zero times, and
 * floating-ui's own `getBoundingClientRect(element, true, …)` divides by the OFFSET PARENT's
 * scale, never the reference's.
 *
 * SECOND, HOW LONG. floating-ui keeps re-measuring the anchor while the press travels —
 * measured, `--anchor-width` walking 400 → 388 → 390 over ~350ms — so a floor that is handed
 * back at release is handed to a number still in motion. The panel painted 400 for the whole
 * flight and snapped to 390 one frame after the release, roughly 300ms after it had visibly
 * stopped, which reads as a spontaneous glitch rather than as the tail of an entry (Kushagra:
 * *"it jumps a bit in width at the end"*, twice). So `--kui-anchor-w` is the one flight var the
 * release KEEPS. The pose-time strip still takes it, so a reopen re-measures.
 *
 * Divided rather than read off `offsetWidth`, which rounds to an integer: a third of a pixel is
 * the difference between a row's label fitting and wrapping, in one cell of twenty-four. An
 * anchor holding no press divides by 1 and passes through untouched.
 */
function restingAnchorWidth(anchor: HTMLElement, rectWidth: number): number {
  const scale = parseFloat(getComputedStyle(anchor).scale) || 1;
  return rectWidth / scale;
}

/**
 * THE PLACEMENT IS COMPUTED AGAINST THE TRIGGER'S RESTING BOX (§8, §22, 2026-08-25) — the
 * sentence `restingAnchorWidth` states one axis over, finally applied to the whole box, which
 * is what its own 2026-08-23 residue note said the fix would be.
 *
 * An open trigger HOLDS its press (§8): scale 0.975 and a 2px sink, arriving over ~150ms of
 * spring. The placement freezes earlier than that — the pin stops the positioner's resize
 * observer, and floating-ui's autoUpdate watches element resize and layout shift, never a
 * transform — so a constrained panel's room was measured mid-spring and the release's one
 * late re-solve then found ~2px more of it: the seam held and the panel's TOP popped by the
 * difference, one frame after the flight said it was done (Kushagra: "theres a small jump
 * still"). Measured as a pair: press held, a 2.00px release delta; press neutralized, zero.
 *
 * So the anchor handed to the positioner is a VIRTUAL element reporting the trigger's
 * UNTRANSFORMED layout box: every solve — first, mid-flight, post-release — computes the same
 * press-independent answer, and there is nothing left for the release to correct. The seed's
 * glue is untouched (it measures the REAL rect, because the silhouette sits on the pixels the
 * trigger is painted at), and the visible cost is only that a pressed trigger sits its own 2px
 * sink further from the seam while pressed — a static gap, not a motion.
 *
 * The inversion handles exactly the press's channels — the individual `scale` and `translate`
 * properties about the element's transform-origin — and stands down whole for a `transform`
 * matrix, which this system never puts on a trigger and cannot invert case-by-case. Individual
 * transform properties compose translate→rotate→scale about the origin, so the rendered
 * top-left corner is layout + T + O·(1 − s); verified against a live press to the hundredth
 * (layout 434.38 + 2 + 16·0.025 = 436.78 measured 436.77). `contextElement` is the real
 * trigger, so floating-ui still finds the scroll ancestors it must observe.
 */
function restingBox(el: HTMLElement): DOMRect {
  const rect = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  if (cs.transform !== "none" && cs.transform !== "") return rect;
  const scaleParts = cs.scale === "none" ? [1] : cs.scale.split(" ").map(parseFloat);
  const sx = scaleParts[0] ?? 1;
  const sy = scaleParts[1] ?? sx;
  const translateParts = cs.translate === "none" ? [0] : cs.translate.split(" ").map(parseFloat);
  const tx = translateParts[0] || 0;
  const ty = translateParts[1] || 0;
  if (sx === 1 && sy === 1 && tx === 0 && ty === 0) return rect;
  const [ox = 0, oy = 0] = cs.transformOrigin.split(" ").map(parseFloat);
  return new DOMRect(
    rect.left - tx - ox * (1 - sx),
    rect.top - ty - oy * (1 - sy),
    rect.width / sx,
    rect.height / sy,
  );
}

/** The virtual anchor for a family's Positioner. Reads the ambient trigger lazily, so the
    object can be created before the trigger has registered; resolves per solve, which rides
    the same seams floating-ui itself measures on (open, scroll, resize). */
export function useRestingAnchor(): {
  getBoundingClientRect: () => DOMRect;
  readonly contextElement: Element | undefined;
} {
  const { anchor } = React.use(FloatingDirectionContext);
  return React.useMemo(
    () => ({
      getBoundingClientRect() {
        const el = anchor();
        return el ? restingBox(el) : new DOMRect();
      },
      get contextElement() {
        return anchor() ?? undefined;
      },
    }),
    [anchor],
  );
}

/* ── The ENTRY runner — ONE mechanism for every panel that BECOMES (§8, §22, §24) ─────────
 *
 * Unified 2026-08-16 out of two runners written five days apart. They had converged on the
 * same job — pose the panel, measure where it is going, depart on the next frame, release by
 * the clock — and an audit found four defects that were nothing but the gap between the
 * twins: a laid-out guard that worked in one and was dead in the other, a flight registered
 * too late to be retired, a body measured after the writes that invalidate its layout, and a
 * listener whose removal only one of them reached. Each would have had to be fixed twice.
 *
 * The families differ in exactly one thing, and it is a property of the PANEL rather than of
 * the component: does it fly from the trigger that opened it (§22's silhouette) or pose as
 * its own designed seed and rise in place (§24)? That question is asked three times below and
 * nowhere else, so a fix cannot land on one family and miss the other.
 */

/** What a family tells the runner. Module constants, never inline literals — the ref callback
    memoises on this, and a fresh object per render would re-attach the whole mechanism. */
type FlightPlan = {
  /** The popup's family class; the body climbs to it. */
  readonly popup: string;
  /** The body's own class. */
  readonly body: string;
  /** Anchored panels fly from their trigger's silhouette; unanchored ones rise in place. */
  readonly fromAnchor: boolean;
  /**
   * Whether the panel's PLACEMENT depends on its own contents (§23, 2026-08-17).
   *
   * A menu is placed against its trigger and nothing else, so it can be posed on the frame it
   * mounts and measured a microtask later. A SELECT is placed against the row inside it — Base
   * UI overlaps the trigger so the chosen option lands on the value it replaces — and that
   * computation reads the panel's real box. Posed first, it reads a box shrunk to the
   * trigger's silhouette and places the panel against a list that is not there: measured, the
   * chosen row settled 66px below the trigger it is supposed to sit on.
   *
   * So the entry WAITS for the placement instead. Nothing is lost by waiting — the pose is
   * transparent until it is aimed, so those frames were never on screen — and nothing about
   * the gesture changes: a select flies out of its trigger exactly as a menu does, into a box
   * that happens to straddle the trigger rather than hang below it.
   */
  readonly placedByContent: boolean;
};

const FLOATING_PLAN: FlightPlan = {
  popup: "kui-floating",
  body: "kui-floating-body",
  fromAnchor: true,
  placedByContent: false,
};
const SELECT_PLAN: FlightPlan = {
  popup: "kui-floating",
  body: "kui-floating-body",
  fromAnchor: true,
  placedByContent: true,
};
const OVERLAY_PLAN: FlightPlan = {
  popup: "kui-overlay",
  body: "kui-overlay-body",
  fromAnchor: false,
  placedByContent: false,
};

/** Every custom property a flight may write, stripped as a SET at both ends: a reopen must not
    measure through the last flight's numbers, and a landed panel must answer to its own layout
    again. One list for both families — a name a family never writes is a no-op to remove, and
    a per-family list is exactly the kind of twin this runner exists to not have. */
const FLIGHT_VARS = [
  "--kui-fly-w",
  "--kui-fly-h",
  "--kui-fly-r",
  "--kui-fly-bw",
  "--kui-fly-bh",
  "--kui-anchor-w",
  "--kui-seed-w",
  "--kui-seed-h",
  "--kui-seed-r",
  "--kui-from-x",
  "--kui-from-y",
] as const;

/**
 * THE GAP BETWEEN A TRIGGER'S EDGE AND THE PANEL IT OPENS (§22, promoted 2026-08-29).
 *
 * One number for the whole anchored family, because it is one FACT about the family: two panels
 * opening from two buttons in one toolbar must sit at one distance from them. It cannot ride a
 * CSS token — Base UI takes a number, not a length — which is the `switchInset` precedent, so
 * this is where a designed constant lives when the cascade cannot carry it.
 *
 * It was four private `const SIDE_OFFSET = 4` declarations before this, one per member, and two
 * of them carried a comment saying the value was "deliberately shared rather than re-picked"
 * directly above their own copy. No law read it in any of them, so three could drift silently
 * while every comment in the package went on claiming they could not. Menu was the origin;
 * Select recorded its copy honestly as a second-member self-key (§23); Popover and Tooltip were
 * the third and fourth and recorded nothing. The CSS rule is that the second member self-keys
 * and the third promotes, and the JS rule (render.ts, PortalScope, the type-step maps) is that a
 * mechanism promotes on its second consumer — this was past both.
 *
 * A COVERING default — the panel pulled back over its anchor so the trigger visually became the
 * menu — was built and reverted 2026-08-15 (Kushagra): the silhouette departing across the small
 * gap read better than the morph in place. LOG carries it.
 */
export const SIDE_OFFSET = 4;

/**
 * The `data-instant` values that are still an OPEN or a CLOSE, and therefore still fly.
 *
 * Base UI stamps `data-instant` whenever a change "is not a reveal", and three of its values are
 * about the INPUT rather than about the change: `click` is any press with `detail === 0`, which
 * is every keyboard Enter and Space; `dismiss` is a keyboard Escape or an imperative close; and
 * `focus` is a focus-driven open or a focus-out close. An open is an open and a close is a
 * close, with the same physics for every input — stillness belongs to reduced motion alone (§8).
 *
 * THE STYLESHEET STATES THE SAME SET, and it has to: this guard decides whether the runner poses
 * the panel and surfaces.css decides whether any clock runs, so a value exempt in one home and
 * not the other is a panel that is posed and never animates, or animates out of nothing. The two
 * are held in agreement by a law that reads both sources (system/surfaces.test.ts).
 */
const FLIES_ANYWAY = new Set(["click", "dismiss", "focus"]);

/** Which cancelled transition means the FLIGHT died, rather than a paint channel ending.
    Deliberately a list of what geometry IS, not of what paint is: an unlisted geometry channel
    costs a slightly late release (the clock still fires), while an unlisted paint channel
    would retire a live flight — the 2026-08-16 defect, and the asymmetry decides the default. */
const FLIGHT_GEOMETRY = /^(inline-size|block-size|width|height|translate|scale|padding|margin|border-.*-radius)/;

/** The placements where a panel lands BESIDE its trigger rather than over or under it — the
    positioner's own stamp, so the entry asks the question the placement already answered
    instead of asking the component what kind of thing it is. Both spellings: Base UI writes
    the logical pair for a submenu (measured: `inline-end`) and the physical pair is what an
    explicitly-sided consumer would get. */
const BESIDE = /^(inline-start|inline-end|left|right)$/;

/** A plain `<x>px <y>px` pair — the only form of `--transform-origin` we read a number out of. */
const PX_PAIR = /^\s*(-?[\d.]+)px\s+(-?[\d.]+)px\s*$/;

/**
 * Where the point that summoned a panel sits inside that panel's positioner, in the block axis.
 *
 * Base UI's `transformOrigin` middleware writes `--transform-origin` on the positioner every
 * time it places one, and for a cross-axis-shifted panel — the state a context menu enters
 * whenever it would overflow the bottom of the window — the y component IS the anchor point's
 * own offset. Reading it is how a summoned seed stays on the cursor without anyone tracking a
 * cursor. Every other form (the `calc(100% + …)` spellings the side placements publish, an
 * absent property, a value written by some future middleware) answers zero, which is the panel's
 * own corner and exactly what this returned before there was a reason not to.
 */
function summonedOriginY(positioner: HTMLElement): number {
  const match = PX_PAIR.exec(positioner.style.getPropertyValue("--transform-origin"));
  return match ? Number(match[2]) : 0;
}

/** The popup's CURRENT flight's release, so a new entry can retire the old one first
    (2026-08-16): a panel that is kept mounted can be reopened before the previous flight's
    clock has fired, and that stale timer — keyed on the very attributes the new flight also
    wears — would otherwise strip the new flight mid-air. Reached by the starting stamp, which
    is the only announcement left since the quick reopen became a catch (2026-08-20). */
const flights = new WeakMap<HTMLElement, () => void>();

function useFlight(plan: FlightPlan) {
  const { anchor, seedSize } = React.use(FloatingDirectionContext);
  return React.useCallback(
    (node: HTMLDivElement | null) => {
      const popup = node?.closest<HTMLElement>(`.${plan.popup}`);
      if (!node || !popup) return undefined;

      /**
       * The entry runs per OPEN, not per mount (2026-08-10, Kushagra: *"animation on select
       * only once. Next time, its instant"*). A menu unmounts its panel on close, so every
       * open is a fresh mount and the entry re-ran by accident of lifecycle; a select keeps
       * its panel mounted forever after the first open — the mounted options are its label
       * store — so the node is born once and every reopen found a panel that had already
       * flown. What is being animated is Base UI's OPEN, so the observer at the bottom, never
       * React's lifecycle, is what says "again".
       */
      const begin = () => {
        // Suppression is total (§8): under reduced motion the panel is simply there, and the
        // measurement that only serves the animation is not taken either.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // Base UI asks for instant when the change is not a reveal — reopening into an
        // already-open group, a dismissal the pointer already committed to. The stylesheet
        // zeroes every clock there, so a posed entry would never transition and a release
        // read off a clock of zero would strip the pose before it was ever seen.
        // `click` is EXEMPT (2026-08-19, with the stylesheet's matching guard): Base UI 1.7
        // stamps instantType "click" whenever the trigger press has nativeEvent.detail === 0
        // — every keyboard Enter/Space, and every programmatic .click() — so the keyboard
        // lost the entry flight wholesale (audit 2026-08-18). An open is an open; the
        // keyboard gets the same physics, and stillness belongs to reduced-motion alone.
        //
        // `dismiss` is EXEMPT TOO (2026-08-22, and the two exemptions must stay in step with
        // the stylesheet's — this is the pair the §20 agreement clause is about). Menu's store
        // sets it on CLOSE, for a keyboard Escape or an imperative close, and only ever
        // recomputes it inside its own `setOpen`. So a CONTROLLED `<Menu open>` reopened from
        // app state never clears it: the stamp from the previous Escape is still on the popup
        // at the next mount, and both halves of the old guard read it as instant — the runner
        // returned before posing and the stylesheet zeroed every clock. Measured: state-open
        // fresh flew at w=67, state-open after one Escape did not fly at all and sat at 112,
        // and a real trigger press flew again. A command palette driven from a store lost its
        // animation after the first Escape and looked like it had randomly stopped working.
        // A stamp that means "this CLOSE was not a reveal" says nothing about an open.
        //
        // `focus` is EXEMPT TOO (2026-08-29, the ultracode audit — same clause, third value,
        // and it is the LAST input-class stamp Base UI has). It is written on two opposite
        // gestures and both are reveals: the shared open-change path stamps it for a
        // `triggerFocus` OPEN — every keyboard-focused tooltip, so a keyboard user got no entry
        // at all where a pointer user got the silhouette — and `PopoverStore.setOpen` stamps it
        // for a `focusOut` CLOSE, which is the ordinary way a keyboard leaves a non-modal panel,
        // so tabbing out blinked the panel away in one frame against ~135ms for an outside
        // press. It carries `dismiss`'s third defect with it: a CONTROLLED popover syncs its
        // open state through `useControlledProp` and never runs `setOpen`, so the stamp from one
        // focus-out is still on the popup at the next state-driven open and the entry was gone
        // for the rest of the page's life.
        //
        // What is NOT exempt stays not exempt, and both are the same sentence from the other
        // side: `delay` means the group is already warm (a toolbar's second tooltip, which every
        // platform shows instantly), `trigger-change` means the panel MOVED between triggers
        // rather than being revealed, and `tracking-cursor` is a panel following the pointer.
        // None of those is an input class.
        const instant = popup.getAttribute("data-instant");
        if (instant !== null && !FLIES_ANYWAY.has(instant)) return;

        // The previous flight retires only once THIS one is certain (2026-08-16 audit):
        // retiring above the bails meant a begin that could not fly still killed a live
        // flight, leaving the panel pinned to a box with no clock coming for it.
        flights.get(popup)?.();

        /**
         * The POSE stamps synchronously — it is the panel's first styled frame — while the
         * MEASUREMENT waits for a microtask, and both halves are load-bearing. A ref callback
         * runs BEFORE the commit's layout effects, so a popup measured here can be a
         * half-laid-out sliver (measured: ~90px wide, content-height tall — the flight then
         * targeted the sliver, animated "only vertically", and snapped to the real card at
         * release). A microtask runs after every layout effect and still before paint, so the
         * numbers are real and the pose is still the first thing painted.
         */
        popup.removeAttribute("data-aimed");
        // `data-seed` alone is the VISIBILITY gate; `data-unfurling` is what applies the pose's
        // geometry. A panel placed against its own contents gets only the gate here, because
        // the pose is exactly what would corrupt its placement (see `placedByContent` below) —
        // it is invisible either way, and the geometry lands with the measurement.
        if (!plan.placedByContent) popup.setAttribute("data-unfurling", "");
        popup.setAttribute("data-seed", "");

        /**
         * A PROVISIONAL aim, immediately (2026-08-16, Kushagra: *"I click a dropdown menu and
         * then it shifts page"* — on the first open of each one, never after).
         *
         * `data-aimed` gates PAINT, and paint is not what the browser scrolls to. Until the
         * real aim lands — a microtask for the measurement and a frame for floating-ui's
         * placement — the popup is laid out wherever its unplaced positioner sits, which is
         * the top of the document: measured at y = −2116 while the viewport was at 2116. Base
         * UI focuses the selected row inside the panel during exactly that window, and the
         * browser scrolls the page to reveal the focused element. An invisible panel in the
         * wrong place still drags the page to it.
         *
         * It happens ONCE per select because a select keeps its panel mounted, so every later
         * open already has a placement and no unaimed window at all. The window grew when the
         * runners were unified — the anchored one used to measure synchronously — which is
         * why this surfaced then.
         *
         * The provisional offset needs no placement, which is the whole point: it is the
         * trigger's rect against the popup's OWN current rect, so it lands the box on the
         * trigger from wherever it happens to be. `data-aimed` is deliberately NOT stamped
         * here — the box moves, the paint does not — because floating-ui will move the base
         * position out from under this offset and a visible panel would jump. Being roughly
         * right is enough to keep focus from scrolling; being exactly right is the real aim's
         * job, one frame later.
         */
        /**
         * The page's scroll, and whether it is ours to protect (2026-08-16).
         *
         * The entry TRAVELS: the panel's first frame sits on its trigger, some tens of pixels
         * from where it will settle. Base UI focuses the selected row during that window, and
         * the browser scrolls the page to reveal the focused element AT ITS FLIGHT POSITION —
         * so the page keeps whatever it gained once the panel travels on. Measured on a select
         * whose trigger is mid-page: 8px on a three-row panel, 38px on a taller one, and ZERO
         * with the travel removed, which is what identifies the cause as the gesture itself
         * rather than any single attribute of it.
         *
         * Guarded on the trigger being FULLY IN VIEW when the entry begins, which is what
         * keeps a legitimate reveal legitimate: a panel anchored to a trigger you can see never
         * needs the page to move (the positioner flips it rather than overflow it), while a
         * trigger that is off-screen — a programmatic open, a keyboard shortcut — genuinely may.
         */
        const parked = { x: window.scrollX, y: window.scrollY, protect: false };
        const roughlyOnTrigger = (trigger: HTMLElement | null) => {
          if (!trigger) return;
          /* A SUMMONED PANEL TRAVELS NOWHERE. Its silhouette sits at its own corner, because
             the positioner already put that corner on the point — so the offset is zero and
             the panel simply grows out of where it is. */
          if (seedSize?.()) {
            popup.style.setProperty("--kui-from-x", "0px");
            popup.style.setProperty("--kui-from-y", "0px");
            return;
          }
          const triggerBox = trigger.getBoundingClientRect();
          const popupBox = popup.getBoundingClientRect();
          popup.style.setProperty("--kui-from-x", `${triggerBox.left - popupBox.left}px`);
          popup.style.setProperty("--kui-from-y", `${triggerBox.top - popupBox.top}px`);
        };
        if (plan.fromAnchor) {
          const trigger = anchor();
          if (trigger) {
            const box = trigger.getBoundingClientRect();
            parked.protect =
              box.top >= 0 &&
              box.left >= 0 &&
              box.bottom <= window.innerHeight &&
              box.right <= window.innerWidth;
          }
          // Only for a panel that is posed from this frame: an unposed one is already sitting
          // where it belongs, so there is nothing to aim it at.
          if (!plan.placedByContent) roughlyOnTrigger(trigger);
        }
        /**
         * And the page is HELD for the entry's opening frames, in the scroll event itself.
         *
         * Restoring on a frame instead lets the browser paint the scrolled position first, and
         * a flash that comes back reads worse than the drift it fixes. A scroll handler runs
         * inside the rendering update, before paint, so the page never renders anywhere but
         * where it was parked — measured per frame across a whole entry, the offset from the
         * parked position never exceeds a pixel. Armed only while the entry is opening (four
         * frames covers the focus and any reveal that trails it), and only when the trigger was
         * fully in view, so nothing a user does outside that window is fought.
         *
         * This is one half of the reveal (2026-08-17). The other is the flying box refusing to
         * be a scroll container at all — `overflow: clip`, in surfaces.css — and the two were
         * written as load-bearing together: the browser reveals a focused row by scrolling the
         * nearest scrollable ancestor and then continuing outward, so closing either door alone
         * just moves the symptom to the other.
         *
         * MEASURED INERT, AND NOT LAW-READ (2026-08-23, the floating-motion audit). This
         * paragraph used to end "both are law-read at once, per frame, in
         * select.browser.test.tsx", and the law's own docstring said the same. Only ONE half is:
         * the law's `spread` assertion catches the clip, and its page half never fires. Deleting
         * this whole block changes nothing the suite can see, and instrumenting the law's exact
         * fixture shows why — `parked.protect` is true, so the listener IS armed, and the
         * browser then dispatches ZERO scroll events. The audit reports the same across seven
         * harness fixtures (selected index 0/15/29 × trigger at 5%/50%/92% of the viewport,
         * click and keyboard) and six opens in the running app.
         *
         * The reason it cannot fire is in its own guard: it arms only when the trigger was
         * FULLY IN VIEW, and in exactly that case the element Base UI focuses — the popup,
         * posed onto that trigger — is in view too, so a reveal has nothing to scroll.
         *
         * It is kept rather than deleted, and that is a decision waiting on a judgment rather
         * than an argument: the symptom it was written for was real and reported (2026-08-17,
         * *"opening some dropdown menus shift or move the page"*), the cost of keeping it is
         * one listener for four frames, and no law can be written for a mechanism that never
         * fires — a passing law here would be the vacuity this repo keeps finding. If it goes,
         * `parked` and its `protect` flag go with it.
         */
        if (parked.protect) {
          const hold = () => window.scrollTo(parked.x, parked.y);
          window.addEventListener("scroll", hold);
          let frames = 0;
          const release = () => {
            if (frames++ < 4) return void requestAnimationFrame(release);
            window.removeEventListener("scroll", hold);
          };
          requestAnimationFrame(release);
        }

        const poseAndFly = () => {
          // A panel landed by other means before this ran — the harness's settle(), a
          // dismissal — no longer wears the pose, and the entry stands down rather than
          // re-posing a panel that has already arrived.
          if (!popup.isConnected || !popup.hasAttribute("data-seed")) return;

          /**
           * Everything below happens inside ONE pinned window, and the pin is not hygiene.
           * Reading a box FLUSHES style, which makes whatever is computed at that instant the
           * baseline the transition machinery compares against: without the pin the browser
           * saw pose → natural (a real change, so it began animating the panel BACKWARDS into
           * its seed) and then natural → pose when the attribute went back on. With
           * transitions off both flushes are inert and the window ends on the style it
           * started with, so nothing has changed by the time the pin comes off.
           */
          const pinned = [popup, node];
          for (const el of pinned) el.style.setProperty("transition", "none", "important");

          /**
           * Base UI's own inline HEIGHT comes off for the flight, and goes back on at release
           * (§23, 2026-08-17).
           *
           * An item-aligned select is laid out as `height: 100%` of a positioner the library
           * has sized, which is how the panel fills a constrained box and scrolls the chosen
           * row onto the trigger. An inline declaration beats every rule in the stylesheet, so
           * the flight's block-size channel was simply dead: measured, `--kui-seed-h: 31.2px`
           * written, the pose matching, and the panel 70px tall for every frame of an entry
           * that was supposed to unfurl out of its trigger.
           *
           * Taken rather than fought: an `!important` in the family's own sheet would win the
           * cascade and leave the library's intent unstated, and the flight only borrows the
           * axis for the length of the entry. The value is put back exactly as it was found.
           */
          const borrowed = popup.style.height;
          if (borrowed) popup.style.removeProperty("height");

          /**
           * The OVERFLOW is borrowed too, and the scroll offset with it (2026-08-22 audit).
           *
           * surfaces.css declares `overflow: clip` on the flying box and states as a finished
           * measurement that it is what stops a select's contents sliding. It is not, on a
           * select: Base UI spreads `LIST_FUNCTIONAL_STYLES` — `position: relative`,
           * `max-height: 100%`, `overflow: hidden auto` — as the popup's React `style` prop
           * whenever the item-aligned placement is active and no `Select.List` is rendered,
           * which is this package's shipped shape. An inline declaration beats every rule in
           * every stylesheet, so the flight's clip computed `hidden auto` and the box was a
           * scroll container for the whole entry — measured `hidden auto` / `relative` on a
           * select against `clip` / `absolute` on a menu, same rules, one negative control.
           *
           * The consequence is the one the clip exists to prevent: Base UI scrolls the chosen
           * row onto the trigger, and while the box is deliberately far smaller than the list
           * the browser clamps that offset down frame by frame — measured `scrollTop` 165
           * through the flight and 0 once settled, the contents visibly sliding under a growing
           * frame and the chosen row landing 43px off the trigger it exists to sit on.
           *
           * The repair is the cascade's own currency rather than a fight inside it: an
           * `!important` in the family's sheet would win and leave the library's intent
           * unstated (refused when the same question came up for the borrowed height, §23), so
           * the runner writes `clip` INLINE for the length of the flight and hands back exactly
           * what it found — snapshot-and-restore, on the third property that needs it.
           */
          const borrowedOverflow = popup.style.overflow;
          const heldScroll = popup.scrollTop;
          /**
           * …and where the offset IS the placement, it is carried as LAYOUT for the length of
           * the flight (2026-08-22, Kushagra: a select near the top of the window still "jumps
           * the selected item to correct position after opening").
           *
           * The clip above ends the sliding by making the box unable to hold an offset at all,
           * and for a menu that is the whole truth — its panel does not scroll, its viewport
           * does. A select is the one member whose own box scrolls, and there the offset is not
           * incidental: an item-aligned panel puts the chosen row ON the trigger, and the row
           * is only there BECAUSE of that offset. Abolishing it runs the entry with the list at
           * the top and delivers the placement in one step at the end — measured on a 48-row
           * list, 301 at the seed, 0 for every frame of the unfurl, 301 again on release.
           *
           * Writing it back with the pose was the first repair and it is not enough, for a
           * reason that is arithmetic rather than a competing writer. The entry poses the
           * CONTENT as well as the box, and a scaled element contributes its SCALED size to the
           * scrollable overflow — so mid-flight `scrollHeight` is smaller than the settled
           * list's while `clientHeight` races toward full. Where the two converge the maximum
           * offset collapses toward zero and the browser clamps the placement away; it is not
           * allowed to hold a position that no longer exists. Measured on a panel constrained
           * by the window's top edge: settled 21, then 15, 9, 3 across the flight, and 21 again
           * on release — the jump, at the shipped clocks. No listener can win there (asserting
           * an offset into a box whose maximum is 0 lands on 0, every time), and a LONG list
           * hides it completely, because a box that never catches its content never clamps.
           * That is why the 48-row case read as fixed while this one did not, and it is the
           * degenerate-fixture rule turned on a repair rather than on a law.
           *
           * So the box keeps the clip that makes it unscrollable, and the offset is said in a
           * currency the flight cannot invalidate: a negative block margin on the body. Layout
           * is not clamped by anything and cannot be taken back. It says exactly what the
           * scroll offset said — the chosen row sits on the trigger — and hands over to the
           * real offset on landing, in that order, so no frame is painted holding neither.
           */
          const flyingBody = popup.querySelector<HTMLElement>(".kui-floating-body");

          // The pose comes off for the read, and the WHOLE of it. Overriding just the two
          // sizes was the first cut and it measured a panel narrower than the one that would
          // settle, because `min-inline-size: 0` is part of the seed too. Our own vars come
          // off with it: a reopen still wears the last flight's numbers, and a natural box
          // measured through those is the previous flight's box.
          popup.removeAttribute("data-seed");
          popup.removeAttribute("data-unfurling");
          for (const name of FLIGHT_VARS) popup.style.removeProperty(name);

          const trigger = plan.fromAnchor ? anchor() : null;
          const positioner = plan.fromAnchor ? popup.parentElement : null;

          /**
           * Laid out, or not yet? A panel's natural box can never be smaller than its family's
           * designed seed (a floating panel's width floor alone is nearly three of them), so a
           * reading at or under the pose means the positioner has not been sized yet — a block
           * child of a zero-width box measures as its own padding, and the entry would fly
           * toward 10px.
           *
           * The pose is measured THROUGH THE BOX, never parsed off the token: read as a
           * computed custom property, `--floating-seed` answers the unresolved string
           * `calc(56px * var(--scale))`, so `parseFloat` gave NaN, `|| 0` pinned it to zero
           * and this guard meant `width <= 0` — dead from the day it was written until the
           * 2026-08-16 audit measured it. And it is read BEFORE the silhouette vars go on, so
           * the comparison is against the DESIGNED seed rather than against the trigger: a
           * select's panel is routinely exactly as wide as the trigger it flies from, and a
           * silhouette-sized pose would bail on the commonest open in the library.
           */
          popup.setAttribute("data-unfurling", "");
          popup.setAttribute("data-seed", "");
          const pose = popup.getBoundingClientRect().width;
          popup.removeAttribute("data-seed");
          popup.removeAttribute("data-unfurling");
          if (popup.getBoundingClientRect().width <= pose) {
            // The borrow is given back on THIS path too (2026-08-22 audit). It was taken
            // above and only ever restored in `release()`, which this return never reaches —
            // so a panel that bailed here lost Base UI's inline height for the whole open,
            // the same defect as the positioner's one screen down, on the arm nobody walks.
            if (borrowed) popup.style.height = borrowed;
            for (const el of pinned) el.style.removeProperty("transition");
            return;
          }

          // Base UI's starting stamp comes OFF and does not go back on (2026-08-10). It used
          // to be the pose's key, removed to measure and restored by hand — which works only
          // while the library still intends to remove it: Menu's clearing frame lands after
          // ours, Select's does not, and a select's panel sat at its seed forever. The pose is
          // ours now, and it comes off on our own frame.
          popup.removeAttribute("data-starting-style");

          /**
           * The trigger's HELD width goes on before the natural box is read, because the box
           * depends on it: a panel's floor is "never narrower than the trigger", spelled
           * through floating-ui's `--anchor-width`, which does not exist yet on a first open —
           * so the natural box measured content-only (~140px against a ~620px trigger) and the
           * real floor landed only at release, the panel visibly re-expanding a beat after it
           * felt done. Held rather than resting: an open trigger holds its press (§8) and
           * floating-ui measures anchors WITH their transforms, so two floors reading the same
           * trigger at different moments disagreed by 2.5% and the panel stepped at release.
           */
          /* A POINT HAS NO CORNER AND NO WIDTH TO FLOOR (§42). When the family publishes a
             seed box of its own, it is because the panel was summoned rather than opened: the
             silhouette is a zero-size rect at the cursor, so the corner is `0px` (there is no
             box to have one) and the anchor-width floor is skipped, which is right twice over —
             a point's width is zero, and a point-placed panel never wears `kui-floating-anchored`
             in the first place. */
          const summoned = seedSize?.() ?? null;
          if (summoned) {
            popup.style.setProperty("--kui-seed-w", `${summoned.width}px`);
            popup.style.setProperty("--kui-seed-h", `${summoned.height}px`);
            popup.style.setProperty("--kui-seed-r", "0px");
          } else if (trigger) {
            const box = trigger.getBoundingClientRect();
            const corner = getComputedStyle(trigger).borderTopLeftRadius;
            // The trigger's LAYOUT box, kept for the panel's life — both halves argued in the
            // block above the runner.
            popup.style.setProperty("--kui-anchor-w", `${restingAnchorWidth(trigger, box.width)}px`);
            // And the seed IS this box (§22's morph, 2026-08-15): its width, its height and
            // its corner, so the panel's first frame is the trigger's own silhouette sitting
            // exactly over it. The POSITION is measured further down, once the positioner has
            // been placed.
            popup.style.setProperty("--kui-seed-w", `${box.width}px`);
            popup.style.setProperty("--kui-seed-h", `${box.height}px`);
            popup.style.setProperty("--kui-seed-r", corner);
          }

          // Subpixel, and that is not fussiness: `offsetWidth` rounds to an integer, and a
          // third of a pixel was the whole difference between "Alpha" fitting its row and
          // wrapping to a second line, in one cell of twenty-four. Both boxes are read in this
          // one window and the body is read FIRST of the two writes that follow — it is a
          // block child, so measured after the pose is back it measures the pose, not the
          // panel, which is the bug this ordering exists to make impossible.
          const natural = popup.getBoundingClientRect();
          const bodyBox = node.getBoundingClientRect();

          popup.style.setProperty("--kui-fly-w", `${natural.width}px`);
          popup.style.setProperty("--kui-fly-h", `${natural.height}px`);
          /**
           * The panel's RESTING corner, published for two readers: the lens (system/refraction),
           * and the tooltip's pose, whose seed is the landed box itself (tooltip.css, §32).
           *
           * It is read here and nowhere else because here is the only moment it exists. A
           * flying panel's `border-radius` is mid-transition between the seed's corner and its
           * own, so anything downstream that asks the element gets an answer that is true for
           * one frame; this line is on the un-posed box, three statements before the pose goes
           * on, in the same window `natural` is measured in and for the same reason.
           *
           * Why the lens wants it: it builds its displacement map from a box AND a corner, and
           * with no way to know either during a flight it simply waited for the flight to end —
           * so a glass panel arrived with no refraction and then gained it in one frame, which
           * a person sees as the backdrop behind it snapping (2026-08-23, Kushagra: "material
           * behind menu jumps after it settles"). Given the settled geometry it can build the
           * map the panel will land wearing and wear it the whole way, and the seam becomes a
           * cache hit rather than a new filter.
           */
          popup.style.setProperty("--kui-fly-r", getComputedStyle(popup).borderTopLeftRadius);
          // The body's own width, so its text cannot re-break while the box is still moving —
          // a line that re-breaks mid-flight is two animations fighting. Read off the DOM
          // rather than re-derived from the padding token: the panel's padding is
          // `max(--floating-p, the focus ring's reach)`, and reconstructing that here is the
          // audits' own lesson about arithmetic that agrees with itself.
          popup.style.setProperty("--kui-fly-bw", `${bodyBox.width}px`);
          // …and its HEIGHT, for the one thing that cannot be said any other way: half of it
          // (2026-08-29). A CENTRED body is pinned by its own centre — `inset: 50%` plus a
          // half-size negative margin — because the two-insets-and-`auto`-margins spelling it
          // replaces can only centre a box that FITS, and this one is held at its landed size
          // while the pane is still growing into it. A percentage margin would need no
          // measurement and is not available: percentage margins resolve against the
          // containing block's INLINE size on both axes, so the block arm would centre by a
          // fraction of the panel's width.
          popup.style.setProperty("--kui-fly-bh", `${bodyBox.height}px`);

          /**
           * The POSITIONER is held at the panel's final box for the whole flight (§22,
           * 2026-08-10, Kushagra: *"it opens and then as it animates it realises it must open
           * on the other side, so it switches mid animation"*). It shrink-wraps the popup, so
           * while the panel grew the collision question was re-asked against every
           * intermediate size — a seed genuinely fits beside a trigger near the right edge and
           * the full panel genuinely does not, so `data-align` reported `start` for the first
           * frames and flipped a third of the way in, taking the transform-origin, the lean
           * and the body's pin with it. Identified by the attribute rather than by position in
           * the tree: a law would rather fail than a silent `if` quietly do nothing.
           */
          /**
           * SNAPSHOT AND RESTORE, never enumerate (2026-08-22 audit). The first spelling put
           * the pin on and `removeProperty`'d both names at release, on this block's own
           * premise that the positioner "shrink-wraps the popup" — true of a menu's, false of
           * an item-aligned select's, whose height is BASE UI'S: `SelectPopup` writes
           * `positionerElement.style.height` and then `height: 100%` on the popup, and its own
           * `clearStyles` runs only on close. So the release deleted the constraint the panel
           * is sized BY, and `100%` resolved against an auto-height parent: measured, a 30-row
           * select settled 910px tall inside an 800px window with `clientHeight ===
           * scrollHeight` — not scrollable, a third of the list unreachable, and the chosen row
           * 163px from the trigger it exists to sit on. Reduce Motion was correct throughout,
           * because the runner bails before any of this, which is the tell.
           *
           * The flight does not own this element's style. It borrows two properties and hands
           * back exactly what it found — `borrowed` above is that shape for the popup's own
           * height, twelve lines up, and it was never generalised to the element beside it.
           */
          const heldWidth = positioner?.style.width ?? "";
          const heldHeight = positioner?.style.height ?? "";
          if (positioner?.hasAttribute("data-side")) {
            positioner.style.width = `${natural.width}px`;
            positioner.style.height = `${natural.height}px`;
          }

          popup.setAttribute("data-unfurling", "");
          popup.setAttribute("data-seed", "");
          // The strip above took the provisional offset with it (one list, both ends — see
          // FLIGHT_VARS). Put it back with the pose: the window this closes is the whole
          // reason it exists, and leaving it open here only moves the page a frame later.
          roughlyOnTrigger(trigger);
          // The flying box either cannot hold an offset, or holds exactly the one the placement
          // needs — never anything in between (see the borrow above). Written with the pose, so
          // no frame is ever painted with the wrong one in it.
          popup.style.overflow = "clip";
          if (heldScroll && flyingBody) flyingBody.style.marginBlockStart = `${-heldScroll}px`;
          void popup.offsetWidth; // land the pose as the baseline while the pin still holds
          for (const el of pinned) el.style.removeProperty("transition");

          /**
           * THE TARGET IS CORRECTED AT DEPARTURE, because the room does not exist yet when the
           * box is measured (2026-08-23 audit; Kushagra had reported the symptom twice, on a
           * select and then on a menu).
           *
           * `natural` above is read in the microtask, which is the right moment for React's
           * layout and the wrong one for floating-ui's: `computePosition` resolves from a
           * promise, and until it does, Base UI's seeded `--available-width/-height` still say
           * `100vw`/`100vh`. So a panel with more content than room measures its natural box
           * through a cap that is still the whole viewport — measured, a 40-item menu wrote
           * `--kui-fly-h: 800px` for a panel that settles at 393.4.
           *
           * Nothing looks wrong at the START of that flight, which is how it survived three
           * audits: the box grows toward 800 and `max-height: var(--available-height)` simply
           * clamps what gets painted. What it costs is the CLOCK. The panel hits its real
           * ceiling at ~56ms of a 460ms `fall` and then stands still, while `inline-size` on
           * the 680ms `spread` travels for another third of a second — so the box drops open in
           * three frames and then unfurls sideways, which is the exact order §22 reversed on
           * 2026-08-09 for being unreadable, and there is no spring curve left to see.
           *
           * Clamped, never re-aimed: this can only make the target SMALLER, so a panel with
           * room to spare is untouched and it cannot become a second placement mechanism
           * arguing with floating-ui's.
           *
           * WHY IT LIVES HERE, and it is not a preference. By departure the positioner already
           * carries `data-side` and a real room — one frame is enough, measured. And departure
           * is the last moment a correction is FREE: the line below arms `transitioncancel` as
           * the dismissal signal, so any later write to a flight var cancels the running
           * `block-size` transition and is read as a dismissal. Tried it — re-fitting every
           * frame for twenty frames released the flight at frame five and snapped the panel
           * open, which is worse than the defect. The pose still pins `transition: none` at
           * this point, so this write starts nothing that could be cancelled.
           *
           * THE RESIDUE, stated rather than hidden: the room is not still. It follows the
           * TRIGGER's own press-release spring — measured 391 climbing to a 393.65 overshoot
           * and settling at 393.4 — so a target taken at departure is ~2.4px under where the
           * panel finally rests, and it takes that last 2.4px when the flight releases. That is
           * 0.6% of the panel, on a box that has been still for 400ms, and the alternative is
           * the loop above that destroys the flight. If it ever needs closing, the fix is the
           * same sentence `restingAnchorWidth` states one axis over: ask the trigger for its
           * resting box, not its pressed one.
           */
          const fitToRoom = () => {
            if (!positioner) return;
            /**
             * NOT WHERE BASE UI OWNS THE HEIGHT (2026-08-23, Kushagra: *"this bug is back"*,
             * measured the same hour the clamp shipped).
             *
             * `--available-height` is the room on ONE SIDE of the trigger, which is the panel's
             * cap exactly when the panel sits on one side of it. An item-aligned select does
             * not: the whole point of that placement is that the list extends above AND below,
             * so Base UI sizes the positioner itself and lays the popup out as `height: 100%`
             * of it. Clamping there aims the flight at the wrong number by more than a factor
             * of two — measured on a 48-row select in a 900px window, `--kui-fly-h` corrected
             * 880 → 425, the panel landed at 425 and then jumped to 880 when the flight
             * released.
             *
             * `heldHeight` is the discriminator and it already exists: it is the POSITIONER's
             * own inline height, snapshotted before the pose overwrites it, so it is non-empty
             * exactly where the library sized this panel and empty where the panel sizes
             * itself. Two near-misses, both measured rather than reasoned: `borrowed` is the
             * same idea read off the POPUP, and Base UI writes nothing there in this case
             * (`popup.style.height` is `""` while the positioner carries `880px`); and asking
             * `data-side` fails differently, because an item-aligned select stamps `none`,
             * which `hasAttribute` reads as present — the test three lines up.
             */
            if (heldHeight) return;
            const room = getComputedStyle(positioner);
            const fit = (name: string, axis: string, measured: number) => {
              const available = parseFloat(room.getPropertyValue(axis));
              if (!Number.isFinite(available) || available <= 0 || available >= measured) return;
              popup.style.setProperty(name, `${available}px`);
            };
            fit("--kui-fly-h", "--available-height", natural.height);
            fit("--kui-fly-w", "--available-width", natural.width);
          };

          /**
           * …AND THE PIN IS CORRECTED TOO, at the aim, or the release inherits the lie
           * (2026-08-25, Kushagra: a constrained top-opening menu, *"after animation
           * completes, it jumps to correct position"*).
           *
           * The positioner is pinned at `natural` — measured in the microtask, through Base
           * UI's seeded `100vh`, so on a panel with more content than room the pin holds the
           * UNCLAMPED box for the whole flight. `fitToRoom` corrects the flight's TARGETS and
           * never touched the pin, and which side pays depends on which edge the placement
           * anchors: below the trigger the excess extends harmlessly downward, above it the
           * anchored edge is the BOTTOM, so a stale height puts the positioner's top exactly
           * the excess too high. The flight never shows it — a top-side flying popup is glued
           * to the positioner's bottom (`inset-block-end: 0`, surfaces.css) — and the release
           * does: the pose comes off, the popup returns to flow against the positioner's TOP,
           * and floating-ui's re-solve is a frame behind. Measured: one painted frame at
           * top = -191 for a panel that rests at 5, a 196px flash — natural 640 minus the
           * room's 443.8, which is why it needs "opens upward" AND "has to scroll" at once.
           *
           * Corrected AT THE AIM, never at departure, and the moment is the mechanism: the
           * seed is still invisible (`data-aimed` is not stamped), so floating-ui can re-solve
           * the transform against the corrected box with nothing on screen to move. The same
           * write at departure shifts the anchor edge under a panel that is already flying —
           * the flash again, mid-flight. The aim then WAITS for the positioner to hold still
           * (whenPlaced's own shape, capped the same way), because departing before the
           * re-solve lands anchors the flight to a box still in motion.
           *
           * The guards are fitToRoom's, for fitToRoom's reasons: `heldHeight` skips a
           * positioner whose height is Base UI's (the item-aligned select — correcting that
           * one with a one-sided room is the 2026-08-23 bug by another door), and a positioner
           * this runner never pinned is one it must not start managing.
           */
          const fitPin = () => {
            if (!positioner?.hasAttribute("data-side") || heldHeight) return;
            const room = getComputedStyle(positioner);
            const fit = (prop: "height" | "width", axis: string) => {
              /**
               * ONLY a real length, and the suffix check is load-bearing: Base UI seeds
               * `--available-height: 100vh` until floating-ui's promise resolves, and
               * `parseFloat` reads that string as ONE HUNDRED — measured, the first spelling
               * pinned the positioner at 100px, floating-ui found that box fits below the
               * trigger, and the whole panel flipped to the wrong side. A seeded value means
               * the room is not known yet; a later aim asks again. (`fitToRoom` runs at
               * departure, where the values are always real — this runs at the aim, where
               * they may not be.)
               */
              const raw = room.getPropertyValue(axis).trim();
              if (!raw.endsWith("px")) return;
              const available = parseFloat(raw);
              /**
               * Compared against the CURRENT inline pin, never a closure's snapshot: `begin`
               * can run more than once for one open (the commit and the starting stamp), so
               * there can be more than one of these closures alive, each with its own idea of
               * `natural`. Reading the pin off the element makes the correction idempotent
               * across all of them — the second caller finds `available >= pinned` and does
               * nothing.
               */
              const pinned = parseFloat(positioner.style[prop]);
              if (!Number.isFinite(available) || available <= 0) return;
              if (!Number.isFinite(pinned) || available >= pinned) return;
              positioner.style[prop] = `${available}px`;
              // The observable that a correction happened — the departure gate reads it off
              // the element for the same multi-closure reason. Removed at release with the
              // pin it annotates.
              positioner.style.setProperty("--kui-pin-fit", "1");
            };
            fit("height", "--available-height");
            fit("width", "--available-width");
          };

          /**
           * THE BODY'S SINK (2026-08-25, Kushagra: *"Just see the shift"* — two screenshots
           * of one open, the flight showing the list's END and the rest frame its TOP).
           *
           * A bottom-pinned flying body (a top-opening panel, or a side panel aligned end)
           * holds the list's LAST row at the seam, and rest is `scrollTop 0` — the TOP
           * window. On a list that fits those are the same rows; on a list taller than its
           * landed viewport they differ by exactly the overflow, and the release frame
           * teleported the content by it (measured: the first row at -113 through the flight
           * and 41 at rest — the box fix above had made this the only jump left). The sink is
           * that overflow, and surfaces.css turns it into an origin-shift-plus-translate that
           * holds the RESTING window's last row at the seam under every squish factor, so the
           * landing frame IS the resting frame. (An inset was the first spelling and cannot
           * work: the squish is a scale and an inset is unscaled, measured as a blank panel
           * sliding into place.)
           *
           * MEASURED AT THE AIM AND BASELINED WITHOUT A CLOCK, and both halves were paid
           * for. Written at departure, the transition's before-style had never held the sink,
           * so the echo's ~8px arrival became a several-hundred-pixel slide of the whole
           * list — the value must be the body's computed baseline BEFORE the depart frame
           * retargets the channels. And the body's translate transition is live while
           * seeded, so the write lands under `transition: none`, flushed, and handed back —
           * the body is `opacity: 0` the whole time, so nothing shows. The overflow itself
           * is read off the REST state (pose off, one synchronous block, nothing painted —
           * the poseAndFly measure's own trick), because a posed viewport's scrollHeight is
           * a lie by construction; and only once the room is a real length (fitPin's own
           * suffix lesson), or the rest it measures is the 100vh-capped one.
           *
           * The side/align cases mirror surfaces.css's two bottom-pinned body arms by name —
           * that file already restates the box's case analysis for the body, and this is the
           * table's third home, kept adjacent by this comment so a widened arm widens here.
           */
          const fitSink = () => {
            if (!flyingBody || flyingBody.style.getPropertyValue("--kui-body-sink")) return;
            const side = positioner?.getAttribute("data-side") ?? "";
            const align = positioner?.getAttribute("data-align") ?? "";
            const bottomPinned =
              side === "top" ||
              (align === "end" &&
                (side === "right" || side === "left" || side === "inline-end" || side === "inline-start"));
            if (!bottomPinned || !positioner) return;
            const raw = getComputedStyle(positioner).getPropertyValue("--available-height").trim();
            if (!raw.endsWith("px")) return; // the room is not known yet — a later aim asks again
            /**
             * The WHOLE measure runs with the clocks suppressed, and that was paid for too:
             * stripping the pose attributes is a style change on elements whose transition
             * lists are live, so the "rest" box it exposes is the block-size transition's
             * FIRST instant — the seed's own 32px, measured, and an overflow of the whole
             * list minus a padding. The poseAndFly measure never met this because the pose's
             * own `transition: none` inline suppression is still standing at that moment;
             * this borrows the same window and hands back exactly what it found.
             */
            const suppressed: HTMLElement[] = [popup, flyingBody];
            const held = suppressed.map((el) => el.style.transition);
            for (const el of suppressed) el.style.transition = "none";
            popup.removeAttribute("data-unfurling");
            popup.removeAttribute("data-seed");
            void popup.offsetWidth; // the natural box, with no clock running
            const viewport = popup.querySelector<HTMLElement>(".kui-scroll-viewport");
            const overflow = viewport
              ? Math.max(0, viewport.scrollHeight - viewport.clientHeight)
              : 0;
            popup.setAttribute("data-unfurling", "");
            popup.setAttribute("data-seed", "");
            if (overflow > 0) flyingBody.style.setProperty("--kui-body-sink", `${overflow}px`);
            void popup.offsetWidth; // the re-pose and the sink land as one baseline
            suppressed.forEach((el, i) => {
              const t = held[i];
              if (t) el.style.transition = t;
              else el.style.removeProperty("transition");
            });
          };

          /**
           * Released on arrival BY THE CLOCK, never by a channel's `transitionend`
           * (2026-08-10): the morph's seed is the trigger's width and a select's trigger is
           * routinely exactly as wide as its panel — equal start and end means no transition,
           * no event, and pins that outlive the flight forever. Any single channel can be
           * motionless for the same reason, so no channel is safe to wait on. The deadline is
           * read off the popup's own computed transition list, so the clocks keep their one
           * home in the tokens and this cannot drift from them.
           */
          let released = false;
          const release = () => {
            if (released) return;
            released = true;
            // Keyed on the STATE as well as the flag: the browser suite lands panels by
            // stripping the flight attribute directly, and a timeout that fired afterwards
            // would remove style the running law had just written.
            if (!popup.hasAttribute("data-unfurling")) return;
            // EVERY flight var but the floor. `--kui-anchor-w` is not a pose, it is the
            // trigger's layout width, and the settled panel's floor is the same sentence as the
            // flying one's — stripping it handed the floor to `--anchor-width`, which is still
            // travelling with the press, and the box stepped (see the block above the runner).
            // The pose-time strip above still takes it, so a reopen re-measures.
            for (const name of FLIGHT_VARS) {
              if (name !== "--kui-anchor-w") popup.style.removeProperty(name);
            }
            /**
             * THE PARENT IS PUT BACK BEFORE THE PANEL IS, and the order is the creep's cause
             * (2026-08-22). The popup's restored height is `100%` — of the positioner — so
             * restoring the panel first points it at whatever the parent currently holds, and
             * the transition that is still declared on height carries it there. Correcting the
             * parent afterwards is a frame too late: the panel is already travelling.
             */
            /**
             * ONE ARM, AND IT SERVES THE ITEM-ALIGNED SELECT TOO (2026-08-26, the ultracode
             * audit — measured, not argued).
             *
             * This restore shipped with a second `else if (positioner && heldHeight)` arm
             * whose comment named exactly one subject: "an item-aligned select's positioner
             * height is Base UI's". That arm could never run for it. `data-side` is Base UI's
             * PLACED signal and an item-aligned select stamps the string `none` — which
             * `hasAttribute` reads as present, the fact this same file records 190 lines up as
             * the reason `data-side` is the wrong discriminator for `fitToRoom`. So the case
             * the second arm documented satisfied the FIRST one, and the arm had no reachable
             * input at all: `heldHeight` is non-empty only where Base UI wrote an inline
             * positioner height, which only that placement does, and that placement is placed.
             *
             * Instrumented at the release of a 30-row item-aligned select: `IF[side=none,
             * held=780px] |h=780px |w=[] |pin=[] |win=800` — the `if` taken, Base UI's own
             * 780px handed back, the pose's width and the correction marker both gone, and
             * `ELSE[…]` never once printed.
             *
             * The 2026-08-22 argument the dead arm carried is kept, because it is why the
             * height is restored at all rather than left to the pin (Kushagra: after the entry
             * "settles, it scrolls down a bit internally, ever so slightly"). Base UI re-solves
             * that height whenever the popup's size changes, and during the flight the popup's
             * size is a lie by construction — measured, 349px before takeoff and 353px by the
             * time the flight released, so the panel landed where it aimed and then `height:
             * 100%` grew the last 4px against the newer parent. On a scrolling panel that is
             * not cosmetic: a box growing is the list's own room shrinking, and the maximum
             * offset fell 21 → 17 one pixel per pixel. Writing the value back at POSE time is a
             * no-op — setting an inline style to what it already holds prevents nobody from
             * writing a different one later — so the correction has to land after the writer
             * has finished, which is here.
             */
            if (positioner?.hasAttribute("data-side")) {
              // Put back what was found, which is `""` where the runner was the only writer
              // and Base UI's own length where it was not (see the snapshot above). The
              // correction marker leaves with the pin it annotates (fitPin).
              positioner.style.width = heldWidth;
              positioner.style.height = heldHeight;
              positioner.style.removeProperty("--kui-pin-fit");
            }
            if (borrowed) popup.style.height = borrowed;
            // Overflow first, THEN the offset: a box that is still `clip` has nowhere to put a
            // scroll position, so restoring in the other order silently writes zero.
            if (borrowedOverflow) popup.style.overflow = borrowedOverflow;
            else popup.style.removeProperty("overflow");
            // The layout stand-in comes off FIRST, and the order is load-bearing the other way
            // round from how it reads. Both writes are in one synchronous block, so no frame is
            // painted between them and there is no gap to guard — but a negative margin
            // SHORTENS the scrollable content by its own size, so setting the offset while it
            // is still applied asks for a position the box cannot hold and the browser clamps
            // it. Measured with the order reversed: the flight held the row perfectly and it
            // jumped 61px on the frame it landed — the original defect moved to the end.
            if (flyingBody) flyingBody.style.removeProperty("margin-block-start");
            /**
             * The sink leaves UNDER A SUPPRESSED CLOCK (see fitSink). The body's translate
             * transition is declared at rest too, so removing the var — or the arm that
             * consumes it — retargets translate by the whole overflow and ANIMATES it:
             * measured, the settled list sliding several hundred pixels after the flight had
             * said it was finished. The strip, the attributes and the reflow land in one
             * unpainted block; the last flight frame and the first resting frame show the
             * same rows at the same pixels, which is the sink's whole contract.
             */
            const bodyTransition = flyingBody?.style.transition ?? "";
            if (flyingBody) {
              flyingBody.style.transition = "none";
              flyingBody.style.removeProperty("--kui-body-sink");
            }
            if (heldScroll) popup.scrollTop = heldScroll;
            popup.removeAttribute("data-aimed");
            popup.removeAttribute("data-seed");
            popup.removeAttribute("data-unfurling");
            if (flyingBody) {
              void flyingBody.offsetWidth;
              if (bodyTransition) flyingBody.style.transition = bodyTransition;
              else flyingBody.style.removeProperty("transition");
            }
            popup.removeEventListener("transitioncancel", onCancel);
          };

          /**
           * Dismissed mid-flight: the box never reaches its target at all, and the pins must
           * not wait out a clock that no longer describes anything on screen. Only a GEOMETRY
           * channel's cancellation says the flight died (2026-08-16): the exit RESTATES the
           * entry's moving channels precisely so the becoming continues under the dissolve, so
           * a cancellation there is real — while a paint channel that the exit does not
           * restate would otherwise retire a live flight and snap the box to full size,
           * measured at 169 → 303px inside two frames.
           */
          const onCancel = (event: TransitionEvent) => {
            if (event.target !== popup) return;
            if (!FLIGHT_GEOMETRY.test(event.propertyName)) return;
            release();
          };

          // Registered with the flight, not at departure (2026-08-16 audit): a reopen arriving
          // in the frames before this flight departs must find it here to retire it, or two
          // flights run on one element and the loser strips the winner.
          flights.set(popup, release);

          /**
           * The silhouette's POSITION (§22, 2026-08-15, Kushagra: the panel must start
           * *"exactly where the trigger is"*). Measured, not derived: the trigger's screen rect
           * against the popup's own laid-out position — the positioner's rect (floating-ui's
           * placement, transforms included) plus the popup's layout offset inside it, which a
           * translate never moves. Both offsets are read before either write, because a write
           * between two reads forces a synchronous layout for the second.
           *
           * It gets a microtask of its OWN, on top of the measurement's — tried inline during
           * the unification and reverted by measurement, which is why the hop is written down
           * here rather than left to look redundant. The measurement's microtask clears the
           * commit's layout effects, but floating-ui's placement resolves asynchronously
           * after them: aimed inline, `data-side` is not yet on the positioner, the aim
           * returns early and the panel departs unaimed — measured at 5px off a bottom-start
           * trigger and 43px off an end-aligned one. The first spelling of all had the
           * opposite failure (measured synchronously, before layout effects, reading a
           * positioner whose transform was still wherever the last frame left it — judged in
           * the lab: *"going all over the page"*), so the aim wants BOTH deferrals and then
           * one more chance on the frame below.
           */
          const aim = () => {
            if (!trigger || !positioner?.hasAttribute("data-side")) return;
            if (!popup.hasAttribute("data-seed")) return;
            // The pin correction rides the aim because this is the first moment `data-side`
            // exists (see fitPin above). The offset written below is consistent with whatever
            // geometry this frame holds — pin corrected, transform still settling included —
            // because every read and the write are one synchronous block; it is the NEXT
            // frame's geometry that can strand it, which is the departure gate's job.
            fitPin();
            fitSink();
            const positionerBox = positioner.getBoundingClientRect();
            const triggerBox = trigger.getBoundingClientRect();
            const insetLeft = popup.offsetLeft;
            const insetTop = popup.offsetTop;
            /**
             * A panel that lands BESIDE its trigger flies from the SEAM, not from the whole
             * silhouette (§22, 2026-08-17, Kushagra: *"the way submenu appears is quite
             * aggressive… it ends up traveling a lot, especially if dropdown menu is wide"*).
             *
             * The silhouette is honest only where the panel LANDS on the thing it came out of:
             * a menu hangs off its button, a select straddles its field, and in both the first
             * frame is the trigger's own body about to lift. A submenu never lands on its row —
             * it lands beside the panel the row is in — so photographing the row starts the
             * panel somewhere it will never be, and the unfurl runs backwards. Measured on a
             * 365px menu: the seed was 353 x 30 at x=10 and the panel is 92 x 73 at x=376, so
             * it slid 366px right while shrinking to a quarter of its width, overshooting to
             * 398 on the way. Both numbers ARE the parent panel's width, which is why it gets
             * worse the wider the menu is.
             *
             * So the seed keeps the row's height and corner — the edge they share is real, and
             * the submenu does emerge at the row's own line — and gives up the width
             * photograph, falling back to the family's designed seed. The x offset is ZERO:
             * the positioner already holds the panel's start edge at its final place, so the
             * seed simply begins there and grows outward. That also makes it direction-blind
             * for free, which the measured offset was not: no left/right decision is taken, so
             * RTL is the same code (the seed is a SIZE and nothing else — surfaces.css).
             *
             * Decided HERE rather than where `--kui-seed-w` is written, because this is the
             * first moment the placement is certain: the aim returns early until the positioner
             * carries `data-side`, and the pose is invisible until the aim stamps `data-aimed`,
             * so no frame can paint the wrong seed.
             */
            /* A SUMMONED PANEL IS THE SAME SENTENCE AS `beside` ON THE INLINE AXIS (§42). The
               submenu case gives up its x offset because the positioner already holds the
               panel's start edge at its final place; a context menu's positioner holds that
               edge there too, because it was placed against the point rather than against an
               element. So the seed begins where the panel is and grows outward — no travel,
               and direction-blind for free, for the same reason. A flipped `data-align="end"`
               needs no arm here either: the panel's own origin table answers which corner it
               grows from (surfaces.css).

               THE BLOCK AXIS IS NOT THE SAME SENTENCE, and it shipped as one (audit
               2026-09-02). "The corner is on the point" is true of an UNSHIFTED panel: a
               context menu's positioner runs `shift({ crossAxis })` with `flip.mainAxis`
               disabled, so a panel that would overflow the bottom slides UP the block axis
               while `data-side` stays `bottom` and nothing in the placement attributes says
               it moved. Measured in the builder at a click 408px down a 800px window: the
               panel lands at top 301 — 107px above the pointer — and the seed was painted at
               its corner, so the panel grew out of a point a third of its own height above
               the cursor, at full opacity.

               Base UI publishes the correction we need: its `transformOrigin` middleware
               already detects this state (`|shift.y| > sideOffset`) and writes the anchor
               point's own y, in the positioner's coordinates, into `--transform-origin`. We
               READ that rather than re-deriving it — the alternative is tracking the cursor,
               which is the spelling "no JS at interaction time" refused when this component
               was built. The unshifted case publishes `0px -0px` and resolves to the same
               zero it always did; anything that is not a plain px pair (a `calc(100% + …)`
               form, which the side placements use) falls back to zero, which is the value
               this line held before and is never worse than it. */
            const summonedHere = seedSize?.() ?? null;
            const beside = BESIDE.test(positioner.getAttribute("data-side") ?? "");
            popup.style.setProperty(
              "--kui-from-x",
              summonedHere || beside
                ? "0px"
                : `${triggerBox.left - (positionerBox.left + insetLeft)}px`,
            );
            popup.style.setProperty(
              "--kui-from-y",
              summonedHere
                ? `${summonedOriginY(positioner) - insetTop}px`
                : `${triggerBox.top - (positionerBox.top + insetTop)}px`,
            );
            if (beside) popup.style.removeProperty("--kui-seed-w");
            // The visibility gate: a silhouette painted before this write sits wherever the
            // last layout left it — measured, one frame at x=2275 — so the pose stays
            // transparent until it is placed. An unanchored panel is placed by construction
            // and never wears this attribute at all.
            popup.setAttribute("data-aimed", "");
          };
          if (trigger) queueMicrotask(aim);

          let departPrevious = "";
          let departWaited = 0;
          const depart = () => {
            /**
             * A CORRECTED PIN'S FLIGHT DEPARTS ONLY FROM A STILL BOX (see fitPin). The
             * correction makes floating-ui re-solve the transform a frame or two later, and a
             * top-side seed is glued to the positioner by an offset measured on an earlier
             * frame — so a departure while the box is still moving anchors the whole flight
             * to a position the next frame takes away (measured: the seed at 651 for a
             * trigger at 450, and the flight ran from there). Each waited frame RE-AIMS, so
             * the seed keeps riding the geometry as it settles and the last frame before
             * departure is always glued to the box the flight will actually fly on. Keyed on
             * the element's own marker, not a closure flag (fitPin says why), and capped so a
             * box that never settles departs anyway — the pre-correction behavior. Uncapped
             * panels carry no marker and never spend a frame here.
             */
            if (
              trigger &&
              popup.hasAttribute("data-seed") &&
              positioner?.style.getPropertyValue("--kui-pin-fit") &&
              departWaited < 10
            ) {
              const box = positioner.getBoundingClientRect();
              const key = `${Math.round(box.top)}x${Math.round(box.left)}x${Math.round(box.height)}x${Math.round(box.width)}`;
              if (key !== departPrevious) {
                departPrevious = key;
                departWaited += 1;
                aim();
                return void requestAnimationFrame(depart);
              }
            }
            // The glue watcher retires with the seed it glues (see below): after this frame
            // the pose is off and a positioner write is floating-ui's ordinary business.
            glueObserver?.disconnect();
            glueObserver = null;
            // Before the pose comes off and before the listener below is armed — see fitToRoom.
            fitToRoom();
            popup.removeAttribute("data-seed");
            // The dismissal listener arms HERE, the frame the flight departs, and never at
            // begin (2026-08-16): a flight born while an exit is still dying cancels that
            // exit's own transitions the moment the pose's `transition: none` lands, and a
            // listener armed earlier caught those dying events as a dismissal and released the
            // newborn flight on the spot.
            popup.addEventListener("transitioncancel", onCancel);
            // The deadline is read HERE, after the pose is off: the pose pins
            // `transition: none` — so the aim's writes cannot start cancellable transitions —
            // which means a posed read would see zero-length spans and release the flight at
            // birth. Un-posed, the computed list is the flight's own.
            const style = getComputedStyle(popup);
            const delays = style.transitionDelay.split(",");
            const spans = style.transitionDuration
              .split(",")
              .map((d, i) => parseFloat(d) + parseFloat(delays[i % delays.length] ?? "0"));
            window.setTimeout(release, Math.max(...spans, 0) * 1000 + 50);
          };

          /**
           * THE GLUE FOLLOWS THE POSITIONER, in the microtask, never a frame behind
           * (2026-08-25, with the pin correction). A seeded panel's translate is measured
           * against the positioner's box, and floating-ui re-solves that box asynchronously
           * after the pin correction — inside the SAME frame or the next one, in no order a
           * rAF can stand on. A re-aim scheduled per frame loses exactly when the transform
           * lands after it and before paint: the seed paints one frame wherever the moved box
           * left it — 200px off its trigger, at full opacity. A MutationObserver on the
           * positioner's style runs after the write and BEFORE the paint, so the glue is
           * re-laid in the same rendering update that moved the box and no stale frame can
           * exist. Self-terminating: the seed coming off is the last moment a stale glue can
           * paint, and the departure disconnects it on that exact frame.
           */
          let glueObserver: MutationObserver | null = null;
          if (trigger && positioner) {
            glueObserver = new MutationObserver(() => {
              if (!popup.hasAttribute("data-seed")) {
                glueObserver?.disconnect();
                glueObserver = null;
                return;
              }
              aim();
            });
            glueObserver.observe(positioner, { attributes: true, attributeFilter: ["style"] });
          }

          // The pose holds for one painted frame and then comes off, which is what starts the
          // flight. An ANCHORED panel spends a second frame first, and the frame is the
          // re-aim's: floating-ui's own positioning can land a beat after the measurement, so
          // the corrected offset must be painted once before the transition reads it as its
          // start. A panel with nothing to aim at has nothing to correct, and taking that
          // frame anyway delayed it for no reason — measured, it left the alert still posed
          // when its own exit law arrived.
          if (trigger) {
            requestAnimationFrame(() => {
              aim();
              requestAnimationFrame(depart);
            });
          } else {
            requestAnimationFrame(depart);
          }
        };

        /**
         * WHEN the entry runs, and the two answers are a property of the panel (§23,
         * 2026-08-17).
         *
         * A microtask is the right moment for a panel placed against its trigger: it runs after
         * the commit's layout effects, so the boxes are real, and still before paint, so the
         * pose is the first thing the eye gets. A ref callback is too early — measured, a
         * half-laid-out sliver ~90px wide, and the flight targeted the sliver.
         *
         * A panel placed against its own CONTENTS cannot use it. Base UI computes a select's
         * overlap from the panel's real box, and a microtask lands before that computation, so
         * the pose was on the panel while it was being placed and the placement came out
         * against a silhouette: the chosen row settled 66px below the trigger it exists to sit
         * on. The entry waits for the box to hold still instead, capped so a placement that
         * never settles cannot hold the panel forever. Nothing is on screen during the wait —
         * the pose is transparent until it is aimed.
         */
        if (plan.placedByContent) {
          let previous = "";
          let waited = 0;
          const whenPlaced = () => {
            if (!popup.isConnected || !popup.hasAttribute("data-seed")) return;
            const box = popup.getBoundingClientRect();
            const key = `${Math.round(box.top)}x${Math.round(box.height)}`;
            const placed = popup.parentElement?.hasAttribute("data-side") ?? false;
            if ((!placed || key !== previous) && waited < 12) {
              previous = key;
              waited += 1;
              return void requestAnimationFrame(whenPlaced);
            }
            poseAndFly();
          };
          requestAnimationFrame(whenPlaced);
        } else {
          queueMicrotask(poseAndFly);
        }
      };

      // The first open begins in THIS commit — not on the starting stamp, which Base UI writes
      // from a layout effect that runs after ref callbacks, one microtask too late for the
      // pose to be the panel's first painted frame. Guarded on `hidden` so a panel that mounts
      // CLOSED (kept-mounted) is not posed while `display: none` reports every box as zero.
      if (!popup.hidden) begin();

      const observer = new MutationObserver((records) => {
        // The pose is on: this flight is already ours, and the stamp that just moved is one
        // of our own writes coming back through the filter.
        if (popup.hasAttribute("data-seed")) return;
        if (popup.hasAttribute("data-starting-style")) return begin();
        /**
         * The QUICK REOPEN is CAUGHT, not replayed (2026-08-20, Kushagra: *"on second quick
         * click it does show wrong animation"* — and it did).
         *
         * A reopen that lands mid-dissolve finds the popup still mounted: Base UI flips it
         * back with no fresh mount and no starting stamp at all (the measured stream is
         * data-closed off → data-open on → data-ending-style off), so nothing below announces
         * an open and no flight begins. That is the whole of the fix. The panel is already on
         * screen, already at its natural box, already placed; the ending stamp leaving takes
         * the exit's target styles off, and the paint clock carries it back to rest from
         * wherever the dissolve had got to.
         *
         * It replayed the entry here from 2026-08-16 until this was measured, on the reading
         * that a reopen with no birth was an open that had lost its animation. What that
         * bought was a JUMP: the pose is the trigger's silhouette, so a panel dissolving at
         * 355 x 98 and 58% opacity became 239 x 32 at full opacity in the next frame — 116px
         * narrower and 66px shorter, instantly, three times out of three — and then unfurled
         * again. An entry is how a panel ARRIVES, and this one has never left; the reversal is
         * the gesture being taken back, and a taken-back gesture continues from where it is
         * rather than starting over. Every interruptible animation on every platform reads
         * this way, and §8's own two clocks already say it: the box is physics, and physics
         * does not teleport.
         *
         * So the reopen is told from the OPEN by what the panel was doing when `data-open`
         * arrived. A kept-mounted panel is reopened with no starting stamp at all, so the
         * arrival IS its only announcement and deleting the branch outright took its ordinary
         * second open with it — measured by select's own law, "the entry ran once per
         * lifetime". The two cases separate cleanly at that instant: mid-dissolve the ending
         * stamp is still ON (the panel is on screen, coming apart), and on a real open it is
         * long gone.
         *
         * The ARRIVAL, never the presence — `data-open` is true for the whole life of every
         * ordinary open, and a state that is true continuously cannot announce an event (the
         * first spelling of this in 2026-08-16 re-posed panels that had already flown, measured
         * as an alert re-blurring its own content at exit). `oldValue` is what makes it an
         * edge, which is why the observer asks for it.
         */
        const opened = records.some(
          (record) =>
            record.attributeName === "data-open" &&
            record.oldValue === null &&
            popup.hasAttribute("data-open"),
        );
        /**
         * EXCEPT WHEN THE ANCHOR MOVED (audit 2026-09-02). Every member the catch was written
         * against reopens on the same anchor — a menu's trigger, a select's field, a popover's
         * button — so "already placed" is true and continuing from where it is is right. A
         * SUMMONED panel is the family's first member whose second gesture carries a NEW place:
         * right-click here, right-click there, and Base UI closes and reopens the same mounted
         * popup at the far point. The catch then produced the exact thing the 2026-08-20
         * reversal was made to stop — measured with a real right-click, the same popup element
         * moved 289px inline and 155px block between two frames, at full opacity, with no seed
         * and no unfurl. So the rule is stated as what it always meant: a taken-back gesture
         * continues from where it is; a gesture aimed somewhere else is a new arrival.
         *
         * A summoned panel has no taken-back gesture to protect. The only way to reopen one is
         * to summon it AGAIN — the panel covers its own region and Base UI's backdrop covers
         * the rest, so the second press is always a fresh right-click, and a fresh right-click
         * is an arrival wherever it lands. That is why this asks whether the panel is summoned
         * rather than comparing two placements: the placement at the instant this observer runs
         * is the OLD one (floating-ui has not re-measured yet), so a comparison here would read
         * the box the panel is leaving and answer "unmoved" for every reopen.
         */
        const summoned = seedSize?.() != null;
        if (opened && (summoned || !popup.hasAttribute("data-ending-style"))) begin();
        /**
         * The catch keeps the BOX's flight, not the list's browsing (2026-08-25, Kushagra:
         * a constrained menu reopened "scrolled" — the top rows clipped above the panel's
         * own edge, only ever seen on the quick second press).
         *
         * A caught reopen continues from where the panel is because physics does not
         * teleport — but the viewport's scroll offset is not physics, it is what the
         * person had scrolled to before dismissing. A slow second press gets a fresh mount
         * and the list at its top; a quick one got the stale offset, so TIMING decided
         * what the same gesture showed. Measured: dismiss a scrolled menu, reopen
         * mid-dissolve, `scrollTop` 196 on arrival against 0 on any open a beat slower.
         *
         * Anchored on the REVOCATION — the ending stamp leaving while the panel is open —
         * never on the arrival, because the arrival is still mid-dissolve: the exit poses
         * the body, a scaled body contributes its SCALED size to the scrollable overflow,
         * and a reset written into that geometry is taken back when the content grows out
         * of it (measured: `scrollTop = 0` at the arrival, 132 again by the next frame).
         * The stamp leaving is when the popup's rules are its own again; on an ordinary
         * exit it never leaves while the panel is open — the popup unmounts wearing it —
         * so this edge IS the caught reopen, the same instant the catch laws read.
         *
         * Scoped to the popup's OWN anatomy — the direct-child chain — because a
         * popover's content is the caller's, and a ScrollArea THEY composed keeps whatever
         * position they gave it (`querySelector` without `:scope >` would reach it). A
         * select is untouched by construction: its own box scrolls and there the offset
         * IS the placement, which the caught reopen must keep.
         */
        const revoked = records.some(
          (record) => record.attributeName === "data-ending-style" && record.oldValue !== null,
        );
        if (revoked && popup.hasAttribute("data-open") && !popup.hasAttribute("data-ending-style")) {
          const viewport = popup.querySelector<HTMLElement>(
            ":scope > .kui-scroll-area > .kui-scroll-viewport",
          );
          if (viewport) viewport.scrollTop = 0;
        }
      });
      observer.observe(popup, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["data-starting-style", "data-open", "data-ending-style"],
      });
      return () => {
        observer.disconnect();
        // Unmounted mid-flight: the pending clock and the listener go with the panel rather
        // than outliving it on a node React is discarding.
        flights.get(popup)?.();
      };
    },
    [anchor, seedSize, plan],
  );
}

/**
 * The panel's body — the element that unfurls (§22).
 *
 * It is a second element inside the popup and it is not a part: the caller cannot reach it,
 * name it or fill it. It exists because the content has to SQUISH while the box grows —
 * judged twice in the demo: with the content held static the panel reads as a shutter opening
 * over a finished page, and with it squishing the panel reads as one body unfurling. You
 * cannot scale a box's contents without a box holding them. That is the same sanction
 * Spinner's `<span>` has (§8): mechanically forced, invisible to the API.
 *
 * It also owns the width pin, so text cannot re-wrap mid-flight.
 */
export function FloatingBody({ children }: { children: React.ReactNode }) {
  const attach = useFlight(FLOATING_PLAN);
  return (
    /**
     * `role="presentation"` because this box is a MOTION mechanism inside a widget whose
     * children are specified (2026-08-10). A `role="menu"` owns menuitems and a `role="listbox"`
     * owns options; an unmarked div between them is a structural violation, and Select's own
     * law reported it the moment the wrapper arrived — Menu had shipped with the same hole on
     * 2026-08-09 and no law that could see it.
     */
    <div className={FLOATING_PLAN.body} role="presentation" ref={attach}>
      {children}
    </div>
  );
}

/**
 * A select's panel body (§23) — the same element, opened rather than flown.
 *
 * It wears the floating family's own class, because everything the class carries is about how
 * a panel LOOKS and how its content is held; the only thing that differs is the gesture, and
 * the gesture is the runner's, not the element's. Split out as its own component rather than
 * as a prop on FloatingBody so the choice is made once, in the component that knows it, and
 * never passed down a tree where a caller could reach it.
 */
export function SelectBody({ children }: { children: React.ReactNode }) {
  const attach = useFlight(SELECT_PLAN);
  return (
    <div className={SELECT_PLAN.body} role="presentation" ref={attach}>
      {children}
    </div>
  );
}

/* ── The overlay family's shared surface (§24, §25 — promoted 2026-08-21) ───────────────
   Three mechanisms Dialog grew and AlertDialog needed the same hour. The JS rule is the one
   render.ts set: a mechanism with laws behind it promotes on its SECOND consumer, where CSS
   would let the second member self-key. All three are here because both members are overlay
   panels and neither is the other's parent. */

/**
 * Why an overlay is opening or closing.
 *
 * The strings are Base UI's own and are kept rather than translated: they are already plain,
 * and a mapping table would be a second home for one fact plus a way to drift. What is NOT
 * taken from Base UI is the type — this union is declared here, so the package's surface is
 * the package's, and the laws provoke a real Escape, a real outside press and a real close
 * press and read the string back, which is what catches a rename upstream.
 *
 * ONE union for both members, because Base UI declares one: `AlertDialogRootChangeEventReason`
 * is `DialogRoot.ChangeEventReason`, character for character. An alert simply never emits
 * `outside-press`, since it refuses that dismissal — an absence at runtime, not in the type.
 */
export type OverlayOpenChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "imperative-action"
  | "none";

/**
 * The second argument to an overlay's `onOpenChange`, and the reason it exists: without it a
 * panel can be told that it closed and never why, so the most ordinary guard a form dialog
 * owes — "you have unsaved changes" — could not be written at all (measured 2026-08-21).
 *
 * `cancel()` refuses the change. Deliberately narrower than Base UI's own details object: it
 * publishes the three members that mean something at this layer and leaves the rest.
 */
export type OverlayOpenChangeDetails = {
  /** Why it is changing — an outside press, Escape, a close button, the trigger. */
  reason: OverlayOpenChangeReason;
  /** The native event behind it. */
  event: Event;
  /** Refuse the change. A panel that must ask before closing calls this and asks. */
  cancel: () => void;
};

/** Base UI's details, narrowed to what this package publishes. Structural, not a copy: the
    fields are read straight off the object Base UI passes, never rebuilt from a table. */
export function overlayOpenChange(
  handler: (open: boolean, details: OverlayOpenChangeDetails) => void,
): (open: boolean, details: { reason: string; event: Event; cancel: () => void }) => void {
  return (open, details) =>
    handler(open, {
      reason: details.reason as OverlayOpenChangeReason,
      event: details.event,
      cancel: details.cancel,
    });
}


/**
 * A panel with no name is announced as its role and nothing else (measured 2026-08-21:
 * `role="dialog"` with `aria-labelledby` null and `aria-label` null, and `role="alertdialog"`
 * the same). Base UI wires the name when a Title mounts, and until that day there was no
 * second route — `aria-label` type-checked on the content part and was dropped, so the obvious
 * repair silently did nothing and BOTH routes were dead at once, which is most of why nobody
 * had noticed one of them was missing.
 *
 * A warning and not a thrown error: a name is an accessibility obligation rather than a
 * structural one, and a half-built panel in a scratch file should still render.
 *
 * It reads the DOM rather than the props, on purpose. The name can arrive by either route and
 * one of them is Base UI's, so the element is the only place both answers are visible.
 */
export function useNameWarning(what: string): (node: HTMLDivElement | null) => void {
  const seen = React.useRef(false);
  return React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!DEV || !node || seen.current) return;
      // After paint: Base UI stamps `aria-labelledby` when the Title child registers, which
      // has not happened while the popup's own ref is being attached.
      requestAnimationFrame(() => {
        if (seen.current || !node.isConnected) return;
        if (node.getAttribute("aria-labelledby") || node.getAttribute("aria-label")) return;
        seen.current = true;
        console.warn(
          `[kookie-ui] A <${what}> has no accessible name: a screen reader announces it as ` +
            `"${node.getAttribute("role") ?? "dialog"}" and nothing else. Add a <${what}Title>, ` +
            `or pass aria-label to <${what}Content> when the panel genuinely has no visible title.`,
        );
      });
    },
    [what],
  );
}

/* The panel type steps MOVED to `system/type-steps.ts` on their third consumer (2026-08-21).
   Notice owns its message the way an alert owns its description, and a notice floats over
   nothing — so a step imported from the floating layer would misname where the rule comes
   from. The rule is OWNERSHIP, and the names say so now. */

/**
 * The unanchored panel's body (§24) — the same runner without an anchor to fly from.
 *
 * A dialog-shaped surface comes from nothing, so there is no silhouette to photograph and no
 * position to aim; the pose is its family's designed seed and the box still BECOMES. The
 * wrapper is §10's mechanically-forced sanction, as above: the content must be held and
 * printed as ONE unit, and you cannot hold children without a box holding them.
 */
export function OverlayBody({ children }: { children: React.ReactNode }) {
  const attach = useFlight(OVERLAY_PLAN);
  return (
    <div className={OVERLAY_PLAN.body} role="presentation" ref={attach}>
      {children}
    </div>
  );
}
