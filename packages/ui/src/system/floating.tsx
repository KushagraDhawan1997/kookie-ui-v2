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
};

/** The attributes a direction change can arrive on. `dir` is the platform's own spelling and
    `lang` rides with it in every i18n library's switch, so observing both costs nothing and
    catches the idiom as it is actually written. */
const DIRECTION_ATTRS = ["dir", "lang", "style", "class"];

export const FloatingDirectionContext = React.createContext<FloatingDirection>({
  direction: "ltr",
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
export function useAmbientDirection(): FloatingDirection {
  const [direction, setDirection] = React.useState<TextDirection>("ltr");
  const node = React.useRef<HTMLElement | null>(null);

  const read = React.useCallback(() => {
    const el = node.current;
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

  return React.useMemo<FloatingDirection>(() => ({ direction, measure }), [direction, measure]);
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
