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

/** §6 — surfaces have no size index, so they take flat radius references. */
export const radiusSurface = 4;
export const radiusOverlay = 5;

/**
 * §12 — the density sets. Density is not a multiplier: each level places its own control
 * family, so every rendered value is a designed point and any one cell can be corrected
 * without moving the other three in its level.
 *
 * `height` is raw px, the anchor a control actually stands on. `px`, `gap`, and `radius`
 * are step indices into the space and radius palettes, never restated numbers (§6).
 *
 * The ladder is built so one density step moves the box about one size step while the
 * label holds: compact size 2 stands where default size 1 does, comfortable size 2 where
 * default size 3 does, and all three set their label at font-size 2. That is the whole
 * point of the axis — `size` would have moved the type too.
 *
 * Compact keeps default's radii on purpose: a fixed corner reads boxy when the box grows,
 * not when it shrinks, so only the airy end needs its own.
 */
export const density = {
  compact: {
    height: [24, 28, 34, 40],
    px: [2, 3, 4, 5],
    gap: [1, 2, 2, 3],
    radius: [1, 2, 3, 4],
  },
  default: {
    height: [28, 32, 40, 48],
    px: [3, 4, 5, 6],
    gap: [2, 3, 3, 4],
    radius: [1, 2, 3, 4],
  },
  comfortable: {
    height: [34, 40, 50, 60],
    px: [4, 5, 6, 7],
    gap: [3, 4, 4, 5],
    radius: [3, 4, 5, 6],
  },
} as const;

export type DensityLevel = keyof typeof density;

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
