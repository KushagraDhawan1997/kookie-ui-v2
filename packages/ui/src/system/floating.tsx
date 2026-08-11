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
 * The panel's natural box, read with the seed neutralised — the popup's, and its body's.
 *
 * Both are read inside the SAME neutralised window on purpose. The body is a block child, so
 * its width is whatever the popup gives it: read it after the seed is back and it measures
 * the seed, not the panel. That is the bug this function's shape exists to make impossible.
 */
function measureNaturalBox(popup: HTMLElement, body: HTMLElement) {
  // The seed is one attribute, so the whole of it comes off for the read — sizes AND the
  // stood-down width floor. Overriding just the two sizes was the first cut and it measured a
  // panel narrower than the one that would settle, because `min-inline-size: 0` is part of the
  // seed too: the body got pinned to that width and "Alpha" wrapped to two lines in a 42px row.
  //
  // Transitions are pinned off across the whole window, and that is not hygiene — it is the
  // difference between a working entry and a broken one. Reading `offsetWidth` FLUSHES style,
  // which makes whatever is computed at that instant the baseline the transition machinery
  // compares against. Without the pin the browser saw seed → natural (a real change, so it
  // started animating the panel BACKWARDS into its seed) and then natural → seed when the
  // attribute went back on. Measured, that is what the row-cell law caught: a panel mid-flight
  // toward a 40px box, its rows wrapped to two lines. With transitions off, both flushes are
  // inert, and the style the window ends on is the one it started with — so nothing has
  // changed by the time the pin comes off, and the entry begins where it should.
  const pinned = [popup, body];
  for (const el of pinned) el.style.setProperty("transition", "none", "important");

  /**
   * Base UI's attribute comes OFF and does not go back on (fixed 2026-08-10).
   *
   * The seed used to be keyed on `data-starting-style`, which React owns: this function removed
   * it to measure and then put it back by hand. That works only while the library still intends
   * to remove it — Menu's clearing frame lands after ours, so the hand-written attribute is
   * duly cleaned up. Select's does not, so the panel kept a starting style nobody would ever
   * take off and sat at 40px forever. Writing an attribute the framework owns is a bet on
   * timing, and the bet was already lost in the second component to use the mechanism.
   *
   * The seed is ours now, removed by us on the next frame. It also decouples the entry from a
   * third-party lifecycle, which is what it should always have been.
   */
  popup.removeAttribute("data-starting-style");
  // OURS comes off too, and forgetting it was the rename's whole cost (2026-08-10). React
  // invokes a ref callback twice in StrictMode — which every Next dev server turns on — so this
  // runs a second time on a popup that is already wearing the seed it set the first time. The
  // old code neutralised `data-starting-style`, which WAS the seed's key, so the second read
  // was still a natural one. Keyed on `data-seed` and not clearing it, the second read measured
  // the seed and pinned `--kui-floating-w` to 40px: every menu in the app opened as a circle
  // and stayed one, while the suite — which does not double-invoke — stayed green.
  popup.removeAttribute("data-seed");
  // Subpixel, and that is not fussiness. `offsetWidth` rounds to an integer, so a panel that
  // wants 115.33px gets pinned to 115 — and measured, a third of a pixel was the whole
  // difference between "Alpha" fitting its row and wrapping to a second line, in one cell of
  // twenty-four. A measurement that feeds a length must be as precise as the length.
  const popupBox = popup.getBoundingClientRect();
  const box = { w: popupBox.width, h: popupBox.height, bw: body.getBoundingClientRect().width };
  popup.setAttribute("data-seed", "");
  void popup.offsetWidth; // land the seed as the baseline while the pin still holds

  for (const el of pinned) el.style.removeProperty("transition");
  return box;
}

/**
 * The width the anchor will PAINT at while the panel is open — its rect corrected from the
 * scale it is at to the scale it is heading to (§22, §23, 2026-08-10).
 *
 * An open trigger HOLDS THE PRESS (§8), and floating-ui measures anchors WITH their
 * transforms — the very fact the held press relies on to still the panel — so Base UI's
 * `--anchor-width` settles at the trigger's scaled box. This measurement runs on the open's
 * first frame, when the press transition has not visibly moved, so a raw rect reads the
 * RESTING width: the flight then targets a floor 2.5% wider than the one the settled panel
 * falls to at release, and the panel visibly compressed the moment it finished (measured
 * 402 -> 392 on a wide trigger). The two floors must agree by INPUT, not by timing.
 *
 * The end of the running scale transition is the held value; an anchor with no scale in
 * flight (a submenu's trigger row, a settled reopen) divides and multiplies by the same
 * number and passes through untouched. Never keyed on which family the anchor belongs to —
 * the transition itself says whether this anchor deforms.
 */
function heldAnchorWidth(anchor: HTMLElement, rectWidth: number): number {
  const current = parseFloat(getComputedStyle(anchor).scale) || 1;
  let target = current;
  for (const animation of anchor.getAnimations?.() ?? []) {
    if (
      typeof CSSTransition !== "undefined" &&
      animation instanceof CSSTransition &&
      animation.transitionProperty === "scale" &&
      animation.effect instanceof KeyframeEffect
    ) {
      const to = animation.effect.getKeyframes().at(-1)?.scale;
      const parsed = parseFloat(String(to));
      if (Number.isFinite(parsed)) target = parsed;
    }
  }
  return (rectWidth / current) * target;
}

/**
 * The panel's body — the element that unfurls (§22).
 *
 * It is a second element inside the popup and it is not a part: the caller cannot reach it,
 * name it or fill it. It exists because the content has to SQUISH while the box grows —
 * Kushagra, judged twice in the demo: with the content held static the panel reads as a
 * shutter opening over a finished page, and with it squishing the panel reads as one body
 * unfurling. You cannot scale a box's contents without a box holding them. That is the same
 * sanction Spinner's `<span>` has (§8): mechanically forced, invisible to the API.
 *
 * It also owns the width pin. Text must not re-wrap mid-flight — a line that re-breaks while
 * the panel is still moving is two animations fighting — so the body is pinned to the
 * measured content width for the flight and released when the box settles.
 */
export function FloatingBody({ children }: { children: React.ReactNode }) {
  const { anchor } = React.use(FloatingDirectionContext);
  const attach = React.useCallback((node: HTMLDivElement | null) => {
    const popup = node?.closest<HTMLElement>(".kui-floating");
    if (!node || !popup) return undefined;

    /**
     * The entry runs per OPEN, not per mount (fixed 2026-08-10, Kushagra: *"animation on
     * select only once. Next time, its instant"*).
     *
     * This ref callback runs when the popup's DOM node is BORN, and the two members are born
     * differently: a menu unmounts its panel on close, so every open is a fresh mount and the
     * entry re-ran by accident of lifecycle. A select keeps its panel mounted forever after
     * the first open — the mounted options are its label store — so the node is born once,
     * the callback ran once, and every reopen found a panel that had already flown. The
     * mechanism was keyed to React's lifecycle when the thing it animates is Base UI's OPEN,
     * so it watches the attribute Base UI stamps at the start of every open transition
     * (`data-starting-style` — stamped per open, on remount and reopen alike) and begins the
     * flight each time it appears.
     */
    const begin = () => {
        // Suppression is total (§8): under reduced motion the panel is simply there, and the
        // measurement that only serves the animation is not taken either.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // Base UI asks for instant when the change is not a reveal; the stylesheet zeroes every
        // clock under data-instant, so a seeded entry would never transition — and a release
        // that waits on `transitionend` would wait forever, leaving the pins outliving the
        // flight they serve.
        if (popup.hasAttribute("data-instant")) return;

        /**
       * Laid out, or not yet? (2026-08-10, the reopen probe.) On a reopen the popup and its
       * positioner are freshly mounted, and this can run before floating-ui has given the
       * positioner any size — a block child of a zero-width box measures as its own padding
       * (10px), and the entry then flies TOWARD 10px: the panel visibly shrank. A panel's
       * natural box can never be smaller than the seed (the width floor alone is nearly
       * three seeds), so a reading at or under the seed means "not laid out yet", and the
       * bail must happen BEFORE any attribute moves: Base UI's starting stamp is still on
       * the popup, and the observer below retries this begin when the stamp — or the layout
       * it waits for — lands.
       */
      const seedPx = parseFloat(getComputedStyle(popup).getPropertyValue("--floating-seed")) || 0;
      if (popup.getBoundingClientRect().width <= seedPx) return;

      // The trigger's width goes on FIRST, because the measurement depends on it (2026-08-10,
      // the first-open pop): the panel's floor is "never narrower than the trigger", spelled
      // through floating-ui's --anchor-width — which does not exist yet on a first open, so
      // the natural box measured content-only (~140px against a ~620px trigger), the flight
      // targeted it, and the real floor landed only at release: the panel visibly re-expanded
      // a beat after it felt done. Ours is synchronous, the floor chains consult it first,
      // and the release removes it so a settled panel answers to floating-ui's own number.
      // It is the HELD width, not the rect (2026-08-10, the compression jump): the two floors
      // must agree on the trigger's open-state box, or the release is a visible step.
      const trigger = anchor();
      if (trigger) {
        const box = trigger.getBoundingClientRect();
        popup.style.setProperty("--kui-anchor-w", `${heldAnchorWidth(trigger, box.width)}px`);
        // And the seed IS this box (the morph, 2026-08-10): its width, its height, and its
        // corner, so the panel's first frame is the trigger's own silhouette sitting exactly
        // over it. Dimensions only — never the trigger's position, which is the one reading
        // that would race the positioner. The overlay is exact by construction instead: the
        // seed is pinned to the panel's anchored corner, and that corner is the trigger's.
        popup.style.setProperty("--kui-seed-w", `${box.width}px`);
        popup.style.setProperty("--kui-seed-h", `${box.height}px`);
        popup.style.setProperty("--kui-seed-r", getComputedStyle(trigger).borderTopLeftRadius);
      }

      const { w, h, bw } = measureNaturalBox(popup, node);
      popup.style.setProperty("--kui-floating-w", `${w}px`);
      popup.style.setProperty("--kui-floating-h", `${h}px`);
      // The body's own width, so its text cannot re-break while the box is still moving. Read
      // off the DOM rather than re-derived from the padding token: the panel's padding is
      // `max(--floating-p, the focus ring's reach)`, and reconstructing that here is the
      // audits' own lesson about arithmetic that agrees with itself.
      popup.style.setProperty("--kui-floating-bw", `${bw}px`);
      // The panel scrolls when it is too tall for the room (`overflow-y: auto`), and setting
      // either overflow axis away from `visible` computes the OTHER one to `auto` as well — so
      // for the whole flight, while the box is deliberately smaller than what it holds, both
      // scrollbars are live. On a platform with classic scrollbars that is a bar appearing for
      // 400ms and a 15px reflow of every row. This says what is true — the box is not its own
      // size yet — and the stylesheet clips while it holds.
      /**
       * And the POSITIONER is held at the panel's final box for the whole flight (§22,
       * 2026-08-10, Kushagra: *"it opens and then as it animates it realises it must open on the
       * other side, so it switches mid animation"*).
       *
       * The positioner is the element the anchoring library measures, and it shrink-wraps the
       * popup — so while the panel grew, the collision question was being re-asked against every
       * intermediate size. A 40px seed genuinely fits beside a trigger near the right edge and a
       * 209px panel genuinely does not, so the answer was honest and it changed: `data-align`
       * reported `start` for the first frames and flipped a third of the way in, taking the
       * transform-origin, the lean and the body's pin with it.
       *
       * Proved by exclusion rather than argued: at a trigger where even the SEED cannot fit
       * start-aligned, the panel reports `end` from the first frame and never flips — so this is
       * not the placement arriving late, it is the placement being recomputed correctly against
       * a box that is lying about how big it will be. Pinned HERE, in the same callback as the
       * measurement, because a pin applied even one frame later is already too late: the first
       * placement has been computed and the flip has only been moved earlier.
       *
       * Identified by the attribute rather than by position in the tree: `parentElement` is the
       * positioner for both floating components today, and a law would rather fail than a silent
       * `if` quietly do nothing on the third.
       */
      const positioner = popup.parentElement;
      if (positioner?.hasAttribute("data-side")) {
        positioner.style.width = `${w}px`;
        positioner.style.height = `${h}px`;
      }
        popup.setAttribute("data-unfurling", "");
      // And the seed comes off on the next frame, which is what starts the flight. One frame,
      // not a timeout: the browser needs exactly one paint at the seed for the transition to
      // have somewhere to travel from.
      requestAnimationFrame(() => popup.removeAttribute("data-seed"));

      // Released on arrival — BY THE CLOCK, not by a channel's transitionend (changed
      // 2026-08-10, the morph's own consequence). The old release waited on the inline-size
      // transition to end, inline-size being the longest channel; the morph's seed is the
      // TRIGGER'S width, and a select's trigger is routinely exactly as wide as its panel —
      // equal start and end means no transition, no event, and pins that outlive the flight
      // forever (measured: the first-open law timed out with data-unfurling still set).
      // Any single channel can be motionless for the same reason (a panel exactly one seed
      // tall, a gapless side), so no channel is safe to wait on. The deadline is read off the
      // popup's own computed transition list — duration plus delay, the longest pair — so the
      // clocks keep their one home in the tokens and this cannot drift from them.
      let released = false;
      const release = () => {
        if (released) return;
        // Keyed on the STATE, not only the flag: the browser suite lands panels by stripping
        // the flight attribute directly (settle()), and a timeout that fired afterwards would
        // remove style the running law had just written — the flag alone cannot see that.
        if (!popup.hasAttribute("data-unfurling")) {
          released = true;
          return;
        }
        released = true;
        popup.style.removeProperty("--kui-floating-w");
        popup.style.removeProperty("--kui-floating-h");
        popup.style.removeProperty("--kui-floating-bw");
        popup.style.removeProperty("--kui-anchor-w");
        popup.style.removeProperty("--kui-seed-w");
        popup.style.removeProperty("--kui-seed-h");
        popup.style.removeProperty("--kui-seed-r");
        if (positioner?.hasAttribute("data-side")) {
          positioner.style.removeProperty("width");
          positioner.style.removeProperty("height");
        }
        popup.removeAttribute("data-unfurling");
        popup.removeEventListener("transitioncancel", onCancel);
      };
      // Dismissed mid-flight: the box never reaches its target at all, and the styles must
      // not wait out a clock that no longer describes anything on screen.
      const onCancel = (event: TransitionEvent) => {
        if (event.target === popup) release();
      };
      const style = getComputedStyle(popup);
      const spans = style.transitionDuration.split(",").map((d, i) => {
        const delays = style.transitionDelay.split(",");
        return parseFloat(d) + parseFloat(delays[i % delays.length] ?? "0");
      });
      window.setTimeout(release, Math.max(...spans, 0) * 1000 + 50);
      popup.addEventListener("transitioncancel", onCancel);
    };

    // The first open begins SYNCHRONOUSLY in this commit — not on the starting stamp, which
    // Base UI writes from a layout effect that runs after ref callbacks, one microtask too
    // late for the seed to be the panel's first painted frame. Guarded on `hidden` so a panel
    // that mounts CLOSED (kept-mounted) is not measured while display: none reports every box
    // as zero.
    if (!popup.hidden) begin();
    // Every open after: the observer's microtask runs after the commit that un-hides the
    // panel, so the measurement reads a laid-out box. The data-seed guard keeps the mount
    // path from beginning twice — the stamp lands there AFTER the synchronous begin above,
    // while a reopen finds the seed long since released.
    const observer = new MutationObserver(() => {
      if (popup.hasAttribute("data-starting-style") && !popup.hasAttribute("data-seed")) begin();
    });
    observer.observe(popup, { attributes: true, attributeFilter: ["data-starting-style"] });
    return () => observer.disconnect();
  }, [anchor]);

  return (
    /**
     * `role="presentation"` because this box is a MOTION mechanism inside a widget whose
     * children are specified (2026-08-10). A `role="menu"` owns menuitems and a `role="listbox"`
     * owns options; an unmarked div between them is a structural violation, and Select's own
     * law reported it the moment the wrapper arrived — Menu had shipped with the same hole on
     * 2026-08-09 and no law that could see it. Marking it presentational takes it out of the
     * accessibility tree and leaves the rows owned by the panel, which is what the markup
     * already meant.
     */
    <div className="kui-floating-body" role="presentation" ref={attach}>
      {children}
    </div>
  );
}
