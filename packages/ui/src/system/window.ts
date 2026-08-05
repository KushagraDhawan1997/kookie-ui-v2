"use client";

/**
 * §18 — window size classes: which shell should this app show.
 *
 * The one viewport question in the system. Container tiers (§2) answer "how much room does
 * this component have" against the nearest container, deliberately; nothing answered "which
 * interface should this app show" — bottom bar vs rail vs sidebar — which is decided once,
 * at the top, against the window. This module is that answer, and it is the whole of it:
 * no token moves with the window class (spacing is nobody's, type already answers width
 * through the narrow band, geometry is the pointer axis's — §16, §17). A class picks a
 * SHELL, and a shell is components, which is why this is a hook and not a stylesheet.
 *
 * Three classes, named for room, never hardware (LOG 2026-08-05): a user in windowed mode
 * has a window, not a device. Boundaries land downward — a window at exactly 48rem is
 * narrow — matching the narrow type band's inclusive max-width, with which the narrow
 * boundary shares its number BY DERIVATION (config.ts): one word, one moment.
 *
 * SSR returns `null`, honestly, and stays null through first paint BY DESIGN (LOG
 * 2026-08-05): no pre-paint stamp can fix it — React's first client render must match the
 * server HTML, so the null branch paints first regardless of what a script stamped. A
 * first-paint shell is CSS-shaped instead: both navigations in the HTML, the exported
 * boundary queries picking which shows. This hook serves decisions AFTER mount.
 */
import * as React from "react";

import { windowClass } from "../tokens/config.ts";

export type WindowClass = "narrow" | "regular" | "wide";

/**
 * The three queries, derived from the two boundaries. Exhaustive and disjoint by
 * construction: regular is "not narrow, not wide", spelled with the same two numbers, so a
 * threshold correction cannot open a gap or an overlap between classes.
 */
export const windowClassQueries: Record<WindowClass, string> = {
  narrow: `(max-width: ${windowClass.narrowMax})`,
  regular: `(min-width: ${windowClass.narrowMax}) and (max-width: ${windowClass.regularMax})`,
  wide: `(min-width: ${windowClass.regularMax})`,
};

/** Boundaries land downward: at exactly a boundary both neighbouring queries match (each
 *  is inclusive), and the smaller class is asked first — the same direction the narrow
 *  type band's inclusive max-width resolves, so 48rem is `narrow` in both systems. */
function classify(): WindowClass {
  if (window.matchMedia(windowClassQueries.narrow).matches) return "narrow";
  if (window.matchMedia(windowClassQueries.regular).matches) return "regular";
  return "wide";
}

function subscribe(onChange: () => void): () => void {
  // Both boundary queries, not all three: a class change is a boundary crossing, and two
  // boundaries have two edges. Listening to `regular` too would only fire duplicates.
  const lists = [
    window.matchMedia(windowClassQueries.narrow),
    window.matchMedia(windowClassQueries.wide),
  ];
  for (const l of lists) l.addEventListener("change", onChange);
  return () => {
    for (const l of lists) l.removeEventListener("change", onChange);
  };
}

/**
 * The window's size class, live. `null` on the server and during hydration's first paint —
 * see the module note; a first-paint shell belongs to CSS, not this hook.
 */
export function useWindowClass(): WindowClass | null {
  return React.useSyncExternalStore(subscribe, classify, () => null);
}
