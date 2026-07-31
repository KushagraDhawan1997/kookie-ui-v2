/**
 * The authored token config. Every value in tokens.css derives from this file plus
 * the generator's laws — these are the only raw pixel constants in the system
 * (DECISIONS.md §12: raw px constants -> base scale -> semantic tokens).
 *
 * Step counts differ per family on purpose: each is set by that family's dynamic
 * range and perception, never copied across families (§6, "three count ceilings").
 */

/** §3 — space palette. Hybrid curve: fine and near-linear at the bottom, geometric at the top. */
export const space = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 96, 128] as const;

/** §6 — radius palette, index 0..6. Geometric (~1.4), capped where the curve goes visually flat. */
export const radius = [0, 4, 6, 8, 12, 16, 24] as const;

/** §6 — semantic radius: the space step each role references. Consistency by reference, not coincidence. */
export const radiusControl = [1, 2, 3, 4] as const; // radius step per size index 1..4
export const radiusSurface = 4;
export const radiusOverlay = 5;

/** §4 — fixed-height controls, anchor-derived so one knob moves the set. */
export const controlHeight = { base: 32, ratios: [0.875, 1, 1.25, 1.5] } as const;

/** §3 — control inline padding, size-indexed, referencing the space palette. No vertical padding exists. */
export const controlPaddingX = [3, 4, 5, 6] as const; // space step per size index 1..4

/**
 * §12 — control internal gap (icon to label). Density-affected like control padding:
 * a tighter control tightens what is inside it, not just its box.
 */
export const controlGap = [2, 3, 3, 4] as const; // space step per size index 1..4

/** §15 — type. Nine steps: type's dynamic range is wider than the control family's. */
export const fontSize = [12, 14, 16, 18, 20, 24, 30, 40, 56] as const;
/** Paired designed values, not a derived ratio: ~1.5 through reading sizes, tightening toward ~1.1 at display. */
export const lineHeight = [16, 20, 24, 26, 28, 32, 38, 48, 62] as const;
/** Paired, in em so it tracks the size for free. ~0 through reading sizes, slightly negative at display. */
export const letterSpacing = [0, 0, 0, -0.005, -0.0075, -0.01, -0.015, -0.02, -0.025] as const;

/** §15 — closed weight set; `light` deferred until something needs it. */
export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** §15 — three family slots. Theme props are the only place a stack is written. */
export const fontFamily = {
  body: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  heading: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
