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

export const FloatingDirectionContext = React.createContext<FloatingDirection>({
  direction: "ltr",
  measure: () => {},
});

/**
 * The root half of the direction mechanism (§20): one measurement, taken in a ref callback
 * at commit, feeding both layers. The trigger's computed direction IS the ambient one —
 * the same read whether the app spelled it `dir` on an ancestor or `direction` in CSS,
 * which an attribute-only check would get wrong. LTR apps never see a state change, and
 * the server renders the ltr branch the client's first render also produces.
 */
export function useAmbientDirection(): FloatingDirection {
  const [direction, setDirection] = React.useState<TextDirection>("ltr");
  const measure = React.useCallback((node: HTMLElement | null) => {
    if (!node) return;
    const ambient = getComputedStyle(node).direction === "rtl" ? "rtl" : "ltr";
    setDirection((prev) => (prev === ambient ? prev : ambient));
  }, []);
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
