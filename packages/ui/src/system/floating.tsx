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
import { ListInkContext } from "./list-context.ts";

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
   * document fallback already reaches for. An unmeasured direction spells absence as `null`,
   * which is what the trigger node itself has always done.
   */
  direction: TextDirection | null;
  /** Attached to the trigger — the one in-flow node a floating component owns. */
  measure: (node: HTMLElement | null) => void;
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

  /* The trigger node stays private (2026-09-20). It was published as an `anchor()` accessor for
     `useRestingAnchor` and for the flight's seed measurement, and both were motion: the resting
     anchor existed because the press SPRING scaled the trigger mid-placement, and with no press
     scale a trigger never moves. `read()` still needs `node` for the ambient direction, so the
     ref is load-bearing and only the accessor was dead. */
  return React.useMemo<MeasuredDirection>(() => ({ direction, measure }), [direction, measure]);
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
      {/* A PORTALLED SUBTREE IS NOT INSIDE THE THING THAT OPENED IT (§15, §20, audit
          2026-09-12). React context follows the React tree, and a portal is the one place where
          that tree and the DOM disagree — so a `<List>` in a panel opened from inside a
          `<ListItem>` read as a NESTED list: it stamped no step, no weight and no ink, and then
          had no `<li>` anywhere above it to inherit a line from, which is 14px at
          `line-height: normal` against the 16/24 the same list renders at outside one.

          Reset rather than re-stamped, which is `GlassScope`'s own sentence at the portal
          (2026-08-16): what crosses into a panel is what the app said, never what the thing
          behind it happened to be doing. This is the only context in the package whose value is
          a claim about the DOM ancestry rather than about the app, so it is the only one that
          has to be said here. */}
      <ListInkContext.Provider value={null}>{children}</ListInkContext.Provider>
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
 * A COVERING default — the panel pulled back over its anchor — was built and reverted 2026-08-15
 * (Kushagra). LOG carries it.
 */
export const SIDE_OFFSET = 4;

/**
 * The panel's body (§22): one box between the popup and its content.
 *
 * It is not a part — the caller cannot reach it, name it or fill it — and it carries the
 * family's resting rules: a menu's separators take the panel's rhythm through it (menu.css), and
 * a tooltip inverts its ink on it (tooltip.css). Motion was removed 2026-09-20;
 * docs/archive/motion-v1.md records it.
 */
export function FloatingBody({ children }: { children: React.ReactNode }) {
  return (
    /**
     * `role="presentation"` because this box sits inside a widget whose children are specified
     * (2026-08-10). A `role="menu"` owns menuitems and a `role="listbox"` owns options; an
     * unmarked div between them is a structural violation, and Select's own law reported it the
     * moment the wrapper arrived — Menu had shipped with the same hole on 2026-08-09 and no law
     * that could see it.
     */
    <div className="kui-floating-body" role="presentation">
      {children}
    </div>
  );
}

/* ── The overlay family's shared surface (§24, §25 — promoted 2026-08-21) ───────────────
   What Dialog grew and AlertDialog needed the same hour. The JS rule is the one render.ts set:
   a mechanism with laws behind it promotes on its SECOND consumer, where CSS would let the
   second member self-key. It is here because both members are overlay panels and neither is
   the other's parent. */

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
 * The overlay panel's body (§25): one box between the pane and its content, and the element
 * the alert's own layout arranges — its lines of text and its two actions (alert-dialog.css).
 * `role="presentation"` for FloatingBody's reason.
 */
export function OverlayBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="kui-overlay-body" role="presentation">
      {children}
    </div>
  );
}
