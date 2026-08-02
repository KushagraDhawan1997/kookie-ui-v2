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

/**
 * §6 — the radius palettes, one per Theme `radius` level, index 0..7. Like density, a level
 * is a designed set rather than a multiplier: a factor cannot express `full`, which has to
 * make controls pills while *capping* surfaces so a dialog does not become a giant lens.
 *
 * The bands are disjoint on purpose:
 *   steps 1-5  the control band (density picks a step from here)
 *   steps 6-7  the surface band (--radius-surface, --radius-overlay)
 * That is what lets `full` pill the controls while capping surfaces. It is NOT what makes the
 * two axes layer safely — a browser test disproved that (§6, 2026-08-02): a custom property
 * reference resolves where it is declared, so the generator has to emit every (level x density)
 * cell rather than rely on the bands never colliding.
 *
 * The 10 step exists because controls live in 4-12, where the bare 8 -> 12 jump was 1.5x
 * with nothing between: every correction overshot, which is what turned size 4 into a capsule.
 */
export const radiusLevels = {
  none: { steps: [0, 0, 0, 0, 0, 0, 0, 0], full: 0 },
  small: { steps: [0, 2, 3, 4, 5, 6, 8, 12], full: 9999 },
  medium: { steps: [0, 4, 6, 8, 10, 12, 16, 24], full: 9999 },
  large: { steps: [0, 6, 8, 12, 14, 16, 24, 32], full: 9999 },
  // The surface band caps at `large`'s values rather than medium's: capping lower would
  // make cards squarer as the dial turns up, which is what the level ladder must never do.
  full: { steps: [0, 9999, 9999, 9999, 9999, 9999, 24, 32], full: 9999 },
} as const;

export type RadiusLevel = keyof typeof radiusLevels;

/** The level emitted on `:root`; the rest ship as `[data-radius]` blocks. */
export const defaultRadiusLevel = "medium" satisfies RadiusLevel;

/** §6 — surfaces have no size index, so they take flat references from the surface band. */
export const radiusSurface = 6;
export const radiusOverlay = 7;

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
 * Radius is held near a constant fraction of the box (~0.2) rather than allowed to climb
 * with the size index. Letting it climb is what made size 4 read as a capsule and made
 * compact, which reuses radii on smaller boxes, come out rounder than default. Comfortable
 * shifts one palette step, never two.
 */
export const density = {
  compact: {
    height: [24, 28, 34, 40],
    px: [2, 3, 4, 5],
    gap: [1, 2, 2, 3],
    radius: [1, 2, 2, 3],
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
    radius: [2, 3, 4, 5],
  },
} as const;

export type DensityLevel = keyof typeof density;

/** One placed geometry: four heights, plus step indices into the space and radius palettes. */
export type DensitySet = {
  readonly height: readonly [number, number, number, number];
  readonly px: readonly [number, number, number, number];
  readonly gap: readonly [number, number, number, number];
  readonly radius: readonly [number, number, number, number];
};

/**
 * §16 — the coarse geometry. Fine and coarse are two complete designed renderings of the
 * control family, the way light and dark are two renderings of colour: same index, same laws,
 * different placed values. The signal is what touches the screen (`pointer: coarse`), never
 * width. All values v0 until judged in the preview matrix.
 *
 * Size 2 anchors at the touch floor; size 1 stays deliberately under it — the reserve
 * (`max(--touch-target-min, height)` on the control's layout box, landing with Button) covers
 * the remainder, which is what keeps size 1 and size 2 distinct instead of both flattening
 * to 44. Radius holds the same ~0.2 fraction of the box as the fine world (§6).
 */
export const coarse = {
  compact: {
    height: [32, 38, 46, 54],
    px: [3, 4, 5, 6],
    gap: [2, 3, 3, 4],
    radius: [2, 3, 3, 4],
  },
  default: {
    height: [36, 44, 52, 60],
    px: [4, 5, 6, 7],
    gap: [3, 4, 4, 5],
    radius: [2, 3, 4, 5],
  },
  comfortable: {
    height: [40, 48, 58, 68],
    px: [5, 6, 7, 7],
    gap: [4, 4, 5, 5],
    radius: [3, 4, 5, 5],
  },
} as const satisfies Record<DensityLevel, DensitySet>;

/**
 * §16 — the touch floor (Apple HIG 44pt; Material 48dp; fingerpad anthropometry). Raw px on
 * purpose: a physical floor, not a length that zooms — and a `max()` against it in component
 * CSS is what no consumer root-font-size game can drag a target below.
 */
export const touchTargetMin = 44;

/** §15 — type. Nine steps: type's dynamic range is wider than the control family's. */
export const fontSize = [12, 14, 16, 18, 20, 24, 30, 40, 56] as const;
/** Paired designed values, not a derived ratio: ~1.5 through reading sizes, tightening toward ~1.1 at display. */
export const lineHeight = [16, 20, 24, 26, 28, 32, 38, 48, 62] as const;
/** Paired, in em so it tracks the size for free. ~0 through reading sizes, slightly negative at display. */
export const letterSpacing = [0, 0, 0, -0.005, -0.0075, -0.01, -0.015, -0.02, -0.025] as const;

/**
 * §4 — the icon box, pulled by the size index. Sizes 1 and 2 share 16: the grid the ecosystem
 * draws on is 16/20/24, and a 14px raster of a 24-grid icon blurs its strokes. Deliberately
 * NOT part of the density or pointer sets — the icon grid is a perception floor, not a
 * breathing-room choice, so a compact size 2 and a comfortable size 2 carry the same icon.
 */
export const iconSize = [16, 16, 20, 24] as const;

/**
 * §8's one canonical interaction transition, and only that. The wider motion system —
 * duration families, overlay enter/exit, the reduced-motion law — is deferred (§8), so these
 * two values exist to make hover and press feel like one gesture, not to be a scale.
 * Ease-out: responds immediately, settles. 120ms because hover feedback reads laggy past ~150.
 */
export const motion = {
  duration: "120ms",
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * §8 — the pointer's own feedback, tokenised because the first one is genuinely contested.
 *
 * Native desktop buttons use an arrow, and a purist reading says the hand belongs to links.
 * On the web that distinction collapsed decades ago: users read the hand as "this responds",
 * and every system a consumer has used — Primer, Material, Ant, Bootstrap — shows it. The
 * human factor here is a learned convention, and refusing it makes a control read as inert.
 *
 * `progress` rather than `wait` while loading: it says the system is busy but the interface
 * still is not frozen, which is exactly the state a loading button is in.
 */
export const cursor = {
  button: "pointer",
  loading: "progress",
} as const;

/** §15 — closed weight set; `light` deferred until something needs it. */
export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** §15 — three family slots. Theme props are the only place a stack is written. */
export const fontFamily = {
  body: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  heading: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
