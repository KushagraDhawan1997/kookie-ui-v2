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
 * The three queries, derived from the two boundaries. Exhaustive and INCLUSIVE-OVERLAPPING at
 * the boundaries, resolved downward — corrected 2026-08-26. This said "disjoint by
 * construction" while `classify()` three lines below has always said the opposite in as many
 * words ("at exactly a boundary both neighbouring queries match"), which is why it asks the
 * smaller class first. `max-width` and `min-width` are both inclusive, so the two neighbours
 * genuinely both answer ON a boundary; what "by construction" really buys is that regular is
 * "not narrow, not wide" spelled with the SAME two numbers, so a threshold correction cannot
 * open a gap or move an overlap off a boundary. Nothing on screen was ever wrong — no
 * consumer pairs two of these in CSS — but a reader taking "disjoint" at face value would
 * write a stylesheet that double-answers at 768 and 1200. The mounted law reads exact
 * membership at six widths, three of them boundaries.
 */
export const windowClassQueries: Record<WindowClass, string> = {
  narrow: `(max-width: ${windowClass.narrowMax})`,
  regular: `(min-width: ${windowClass.narrowMax}) and (max-width: ${windowClass.regularMax})`,
  wide: `(min-width: ${windowClass.regularMax})`,
};

/** One MediaQueryList per query per document, built on first client use and shared by every
 *  subscriber — a list is live (`.matches` tracks the viewport by itself), so there is
 *  nothing per-instance about it, and `classify` runs as the store snapshot on EVERY render
 *  of every consumer. Lazy because the module loads during SSR, where `window` does not
 *  exist and nothing calls this: the cache is browser-only by construction, so it is not
 *  cross-request module state. */
let mqls: Record<WindowClass, MediaQueryList> | undefined;
const lists = () =>
  (mqls ??= {
    narrow: window.matchMedia(windowClassQueries.narrow),
    regular: window.matchMedia(windowClassQueries.regular),
    wide: window.matchMedia(windowClassQueries.wide),
  });

/** Boundaries land downward: at exactly a boundary both neighbouring queries match (each
 *  is inclusive), and the smaller class is asked first — the same direction the narrow
 *  type band's inclusive max-width resolves, so 48rem is `narrow` in both systems. */
function classify(): WindowClass {
  const m = lists();
  if (m.narrow.matches) return "narrow";
  if (m.regular.matches) return "regular";
  return "wide";
}

function subscribe(onChange: () => void): () => void {
  // Both boundary queries, not all three: a class change is a boundary crossing, and two
  // boundaries have two edges. Listening to `regular` too would only fire duplicates.
  const m = lists();
  for (const l of [m.narrow, m.wide]) l.addEventListener("change", onChange);
  return () => {
    for (const l of [m.narrow, m.wide]) l.removeEventListener("change", onChange);
  };
}

/**
 * The window's size class, live. `null` on the server and during hydration's first paint —
 * see the module note; a first-paint shell belongs to CSS, not this hook.
 */
export function useWindowClass(): WindowClass | null {
  return React.useSyncExternalStore(subscribe, classify, () => null);
}
