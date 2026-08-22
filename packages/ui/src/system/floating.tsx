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

export type TextDirection = "ltr" | "rtl";

export type FloatingDirection = {
  direction: TextDirection;
  /** Attached to the trigger — the one in-flow node a floating component owns. */
  measure: (node: HTMLElement | null) => void;
  /** The measured trigger itself. The entry reads its box (the seed leans to the trigger's own
      middle), and reading it HERE — off the node the component already measures for direction —
      is what keeps the popup from reaching for `--anchor-width`, which floating-ui publishes
      too late for the seed frame (the 2026-08-09 corner collapse). */
  anchor: () => HTMLElement | null;
};

/** The attributes a direction change can arrive on. `dir` is the platform's own spelling and
    `lang` rides with it in every i18n library's switch, so observing both costs nothing and
    catches the idiom as it is actually written. */
const DIRECTION_ATTRS = ["dir", "lang", "style", "class"];

export const FloatingDirectionContext = React.createContext<FloatingDirection>({
  direction: "ltr",
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
export function useAmbientDirection(): FloatingDirection {
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
  return React.useMemo<FloatingDirection>(
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
  const scope = (
    <div className="kui-portal" dir={direction}>
      {children}
    </div>
  );
  return useThemeRooted() ? <Theme render={scope} /> : scope;
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
  "--kui-fly-bw",
  "--kui-anchor-w",
  "--kui-seed-w",
  "--kui-seed-h",
  "--kui-seed-r",
  "--kui-from-x",
  "--kui-from-y",
] as const;

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

/** The popup's CURRENT flight's release, so a new entry can retire the old one first
    (2026-08-16): a panel that is kept mounted can be reopened before the previous flight's
    clock has fired, and that stale timer — keyed on the very attributes the new flight also
    wears — would otherwise strip the new flight mid-air. Reached by the starting stamp, which
    is the only announcement left since the quick reopen became a catch (2026-08-20). */
const flights = new WeakMap<HTMLElement, () => void>();

function useFlight(plan: FlightPlan) {
  const { anchor } = React.use(FloatingDirectionContext);
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
        const instant = popup.getAttribute("data-instant");
        if (instant !== null && instant !== "click") return;

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
         * be a scroll container at all — `overflow: clip`, in surfaces.css — and the two are
         * load-bearing together: the browser reveals a focused row by scrolling the nearest
         * scrollable ancestor and then continuing outward, so closing either door alone just
         * moves the symptom to the other. Both are law-read at once, per frame, in
         * select.browser.test.tsx, which is the only member whose open focuses anything.
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
          if (trigger) {
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
          const bodyWidth = node.getBoundingClientRect().width;

          popup.style.setProperty("--kui-fly-w", `${natural.width}px`);
          popup.style.setProperty("--kui-fly-h", `${natural.height}px`);
          // The body's own width, so its text cannot re-break while the box is still moving —
          // a line that re-breaks mid-flight is two animations fighting. Read off the DOM
          // rather than re-derived from the padding token: the panel's padding is
          // `max(--floating-p, the focus ring's reach)`, and reconstructing that here is the
          // audits' own lesson about arithmetic that agrees with itself.
          popup.style.setProperty("--kui-fly-bw", `${bodyWidth}px`);

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
          // The flying box is not a scroll container, whatever the element's own inline style
          // says (see the borrow above). Written with the pose, so no frame is ever painted
          // with an offset in it.
          popup.style.overflow = "clip";
          void popup.offsetWidth; // land the pose as the baseline while the pin still holds
          for (const el of pinned) el.style.removeProperty("transition");

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
            if (borrowed) popup.style.height = borrowed;
            // Overflow first, THEN the offset: a box that is still `clip` has nowhere to put a
            // scroll position, so restoring in the other order silently writes zero.
            if (borrowedOverflow) popup.style.overflow = borrowedOverflow;
            else popup.style.removeProperty("overflow");
            if (heldScroll) popup.scrollTop = heldScroll;
            popup.removeAttribute("data-aimed");
            popup.removeAttribute("data-seed");
            popup.removeAttribute("data-unfurling");
            if (positioner?.hasAttribute("data-side")) {
              // Put back what was found, which is `""` where the runner was the only writer
              // and Base UI's own length where it was not (see the snapshot above).
              positioner.style.width = heldWidth;
              positioner.style.height = heldHeight;
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
            const beside = BESIDE.test(positioner.getAttribute("data-side") ?? "");
            popup.style.setProperty(
              "--kui-from-x",
              beside ? "0px" : `${triggerBox.left - (positionerBox.left + insetLeft)}px`,
            );
            popup.style.setProperty("--kui-from-y", `${triggerBox.top - (positionerBox.top + insetTop)}px`);
            if (beside) popup.style.removeProperty("--kui-seed-w");
            // The visibility gate: a silhouette painted before this write sits wherever the
            // last layout left it — measured, one frame at x=2275 — so the pose stays
            // transparent until it is placed. An unanchored panel is placed by construction
            // and never wears this attribute at all.
            popup.setAttribute("data-aimed", "");
          };
          if (trigger) queueMicrotask(aim);

          const depart = () => {
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
        if (opened && !popup.hasAttribute("data-ending-style")) begin();
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
    [anchor, plan],
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

/** Box's own spelling and its own scar: an ABSENT `process` means dev (audit 2026-08-08). */
const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";

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
