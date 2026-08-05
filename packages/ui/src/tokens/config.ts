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
 * §6 — the radius palettes, one per Theme `radius` level, index 0..10. Like density, a level
 * is a designed set rather than a multiplier: a factor cannot express `full`, which has to
 * make controls pills while *capping* surfaces so a dialog does not become a giant lens.
 *
 * The bands are disjoint on purpose:
 *   steps 1-5   the control band (density picks a step from here)
 *   steps 6-9   the surface band (--radius-surface-1..4 — size-indexed since 2026-08-04)
 *   step  10    the overlay (--radius-overlay)
 * That is what lets `full` pill the controls while capping surfaces. It is NOT what makes the
 * two axes layer safely — a browser test disproved that (§6, 2026-08-02): a custom property
 * reference resolves where it is declared, so the generator has to emit every (level x density)
 * cell rather than rely on the bands never colliding.
 *
 * The 10 step in the control band exists because controls live in 4-12, where the bare
 * 8 -> 12 jump was 1.5x with nothing between: every correction overshot, which is what turned
 * size 4 into a capsule. The surface band anchors size 3 at each level's old flat value
 * (small 8, medium 16, large 24) so the default card never moved; the rest are v0 by eye.
 */
export const radiusLevels = {
  none: { steps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], full: 0 },
  small: { steps: [0, 2, 3, 4, 5, 6, 5, 6, 8, 10, 12], full: 9999 },
  medium: { steps: [0, 4, 6, 8, 10, 12, 10, 12, 16, 20, 24], full: 9999 },
  large: { steps: [0, 6, 8, 12, 14, 16, 16, 20, 24, 28, 32], full: 9999 },
  // The surface band caps at `large`'s values rather than medium's: capping lower would
  // make cards squarer as the dial turns up, which is what the level ladder must never do.
  full: { steps: [0, 9999, 9999, 9999, 9999, 9999, 16, 20, 24, 28, 32], full: 9999 },
} as const;

export type RadiusLevel = keyof typeof radiusLevels;

/** The level emitted on `:root`; the rest ship as `[data-radius]` blocks. */
export const defaultRadiusLevel = "medium" satisfies RadiusLevel;

/**
 * §6, §10 — surface radii are size-indexed picks into the surface band (decided 2026-08-04,
 * Kushagra: a size-1 card and a size-4 card should not wear the same corner). Density never
 * touches these — density reaches a card through padding (layout space); the corner follows
 * only the size index. The overlay stays flat: a dialog has one size.
 */
export const radiusSurface = [6, 7, 8, 9] as const;
export const radiusOverlay = 10;

/**
 * §12 — the density sets. Density is not a multiplier: each level places its own control
 * family, so every rendered value is a designed point and any one cell can be corrected
 * without moving the other three in its level.
 *
 * `height` and `px` are raw px, the two numbers a control's box actually stands on; `radius`
 * is a step index into the radius palette. `px` left the space palette on 2026-08-05 — see
 * the note on the ladder below. The icon-label gap is NOT here (decided 2026-08-04,
 * Kushagra): density grows the box and holds the content, and type, the icon box, and the
 * gap binding them are one label cluster — `controlGap` below is size- and pointer-indexed
 * only.
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
 *
 * `px` is held the same way (~0.3), and for the same reason — it is the radius bug a second
 * time (judged 2026-08-05, Kushagra: "at size 2 to size 4 the horizontal padding seems a bit
 * too much"; LOG). It used to be a step index into the space palette, and that was the whole
 * defect: the palette is a LAYOUT rhythm, near-linear at the bottom and geometric at the top,
 * so through the control band it grows ~1.44x per step against a height ladder that grows
 * ~1.20x. Indexing one with the other cannot hold a fraction — default ran 0.286 -> 0.500,
 * and coarse/comfortable ran out of palette entirely, repeating a step so size 4 was padded
 * no wider than size 3. Radius solved this by widening its own palette inside the control
 * band; space cannot be widened without renumbering every layout pick, so control padding
 * joins `height` as a designed raw number. All six sets now sit in 0.24-0.38 of their box,
 * law-tested, with size 4 down 33% from what shipped. v0 for the eye pass.
 */
export const density = {
  compact: {
    height: [24, 28, 34, 40],
    px: [6, 8, 10, 12],
    pxPill: [10, 12, 14, 16],
    radius: [1, 2, 2, 3],
    slotInset: [2, 3, 3, 4],
  },
  default: {
    height: [28, 32, 40, 48],
    px: [8, 10, 13, 16],
    pxPill: [12, 14, 17, 20],
    radius: [1, 2, 3, 4],
    slotInset: [3, 3, 4, 4],
  },
  comfortable: {
    height: [34, 40, 50, 60],
    px: [12, 14, 18, 22],
    pxPill: [14, 17, 21, 25],
    radius: [2, 3, 4, 5],
    slotInset: [3, 4, 5, 6],
  },
} as const;

export type DensityLevel = keyof typeof density;

/** One placed geometry: four heights and four inline paddings in raw px, plus step indices
 *  into the radius palette. */
export type DensitySet = {
  readonly height: readonly [number, number, number, number];
  /** Inline padding, raw px — a designed number, not a palette pick. See `density` above. */
  readonly px: readonly [number, number, number, number];
  /**
   * §4, §6 — the inline padding a BARE edge takes when the control is a pill (`radius="full"`).
   *
   * The correction is geometric, not taste: padding is measured at the vertical midline, where
   * a pill is widest, but the eye judges the gap at the text's cap line — where the corner
   * curve has already swung inward — so at r = height/2 the label reads crammed against the
   * cap (judged 2026-08-05, Kushagra). The safe maximum is half the height (the text starts
   * where the straight walls do, the capsule rule of thumb); these sit just under it, ~0.40 to
   * 0.44 of the box, because full half-height overshoots at the large sizes.
   *
   * Per SIDE, not per control: a side whose content starts with a slot — an icon, a hosted
   * clear button — keeps `px`, because the slot already stands between the text and the curve.
   * At every other radius level the token resolves to `px` and the split is inert.
   */
  readonly pxPill: readonly [number, number, number, number];
  readonly radius: readonly [number, number, number, number];
  /**
   * §4 — the inset a control keeps around anything it hosts in a slot: a clear button, a
   * password reveal, a unit label. One number for all four sides, and the hosted control's
   * height is derived from it rather than designed separately, so the two cannot drift.
   *
   * Designed rather than a fraction of the box (Kushagra, 2026-08-04): a fraction reads as a
   * ratio nobody chose, and this ladder already learned that lesson with radius, which is held
   * near a constant fraction precisely because letting it climb made size 4 a capsule.
   */
  readonly slotInset: readonly [number, number, number, number];
};

/**
 * §16 — the coarse geometry. Fine and coarse are two complete designed renderings of the
 * control family, the way light and dark are two renderings of colour: same index, same laws,
 * different placed values. The signal is what touches the screen (`pointer: coarse`), never
 * width. All values v0 until judged in the preview matrix.
 *
 * Size 2 anchors at the touch floor; size 1 stays deliberately under it, and NOTHING widens
 * it back: §16 dropped the `max(--touch-target-min, height)` reserve considered here, because
 * the designed geometry already carries both the locked 24 floor and the 44 target on the
 * default path, and a reserve would have flattened size 1 and size 2 to the same rendered box.
 * Every control is one element. Radius holds the same ~0.2 fraction of the box as the fine
 * world (§6).
 */
export const coarse = {
  compact: {
    height: [32, 38, 46, 54],
    px: [8, 10, 13, 16],
    pxPill: [13, 16, 19, 22],
    radius: [2, 3, 3, 4],
    slotInset: [3, 4, 4, 5],
  },
  default: {
    height: [36, 44, 52, 60],
    px: [10, 13, 16, 20],
    pxPill: [15, 18, 21, 25],
    radius: [2, 3, 4, 5],
    slotInset: [4, 4, 5, 5],
  },
  comfortable: {
    height: [40, 48, 58, 68],
    px: [14, 17, 21, 25],
    pxPill: [17, 20, 24, 28],
    radius: [3, 4, 5, 5],
    slotInset: [4, 5, 6, 7],
  },
} as const satisfies Record<DensityLevel, DensitySet>;

/**
 * §16 — the touch floor (Apple HIG 44pt; Material 48dp; fingerpad anthropometry). Raw px on
 * purpose: a physical floor, not a length that zooms.
 *
 * A §13 resource with no stylesheet consumer: the `max()` reserve this was minted for was
 * dropped (§16), so nothing reads it but its own drift test. Kept as the published number an
 * app can reach for; do NOT reintroduce a runtime reserve on the strength of it.
 */
export const touchTargetMin = 44;

/**
 * §4, §16 — mobile Safari's zoom threshold, and the second platform constant that is a raw
 * physical number rather than a designed one. **Safari zooms the whole page when a text input
 * under 16px takes focus**, which throws the layout off-centre and leaves the user pinching
 * back; it is the only way a control can break the page around it just by being tapped.
 *
 * It floors the INPUT's font size, never the control's box or its label. §17's handheld band
 * lifts the type ladder far enough that sizes 2 and up clear it wherever the pointer is
 * coarse — but size 1 is under the threshold in every band there is, so the floor is still
 * needed. The signal is the POINTER world, which is what "a finger touches this screen"
 * means, and the floor resolves to 0 on a fine pointer.
 *
 * Deliberately not solved by raising the type ladder: size 1 is the caption step, and a phone
 * that cannot render small secondary text has lost something real to fix one control.
 */
export const inputFontFloor = 16;

/** §15 — type. Nine steps: type's dynamic range is wider than the control family's. */
export const fontSize = [12, 14, 16, 18, 20, 24, 30, 40, 56] as const;
/** Paired designed values, not a derived ratio: ~1.5 through reading sizes, tightening toward ~1.1 at display. */
export const lineHeight = [16, 20, 24, 26, 28, 32, 38, 48, 62] as const;
/** Paired, in em so it tracks the size for free. ~0 through reading sizes, slightly negative at display. */
export const letterSpacing = [0, 0, 0, -0.005, -0.0075, -0.01, -0.015, -0.02, -0.025] as const;

/**
 * §17 — the two TYPE BANDS, and the reason there are two of them (split 2026-08-05).
 *
 * One band shipped from 2026-08-04 to 2026-08-05, called `handheld`, keyed on the conjunction
 * `(pointer: coarse) and (max-width: 48rem)`. It did two unrelated jobs at once:
 *
 *   reading steps 1-4 ROSE    16 -> 18   because a held screen is close to the eye
 *   display steps 8-9  FELL   56 -> 40   because a narrow screen is seven characters wide
 *
 * Those are different questions with different answers, and welding them together got the
 * middle of the range wrong in both directions. Kushagra caught it from Apple's own table
 * (LOG): "iOS, iPadOS Dynamic Type sizes" is ONE table — Body is 17pt on an iPhone and 17pt
 * on an iPad — so the reading question does not distinguish phone from tablet at all. Our
 * width gate did, and it excluded every iPad from the reading rise it should have had. Nor
 * did the gate even split phones from tablets: at 768px it separates an iPad mini in portrait
 * from every other iPad, which is where a threshold lands, not a boundary anyone designed.
 *
 * So: two bands, two signals, both still designed picks into the paired palettes above.
 *
 *   handheld  reading rises  signal: `pointer: coarse` — a finger is the primary input, so
 *                            there is no attached pointing device, so it is probably in a
 *                            hand. Apple's iOS/iPadOS 17pt against macOS 13pt. Carried by
 *                            the POINTER axis's own scopes since 2026-08-05, when the
 *                            `device` prop was dropped (LOG): pinning `pointer` forces the
 *                            whole coarse world, type included.
 *   narrow    display falls  signal: viewport width — the ORIGINAL justification for the
 *                            display cut was line length ("56px on a 375px screen is seven
 *                            characters a line"), which is a width fact and always was. It
 *                            now also fires on a squeezed desktop window, which the old rule
 *                            wrongly ignored.
 *
 * They compose, and the four cells come out right — including the two the single band got
 * wrong: an iPad in landscape rises and keeps its 56px display, and a narrow desktop window
 * cuts its display without touching its reading sizes.
 *
 * Each band emits only the steps it MOVES (the generator derives that set), so the two cannot
 * fight over a step and a band is cheap to add. Steps 5-7 are nobody's.
 *
 * Open, recorded in §17: the narrow band should arguably key on the CONTAINER — a heading in
 * a narrow sidebar on a wide monitor wraps just as badly — but re-pricing tokens inside a
 * container query has substitution problems the viewport version does not.
 */
export const typeBands = {
  /** Handheld: steps 1-4 rise one index. 5-9 are identity and are not emitted. */
  handheld: [2, 3, 4, 5, 5, 6, 7, 8, 9],
  /** Narrow: steps 8-9 fall. 1-7 are identity and are not emitted. Steps 4/5 and 7/8 still
   *  collapse to one rendered value on a phone, where both bands apply — the price compact
   *  already pays in layout space (§12). */
  narrow: [1, 2, 3, 4, 5, 6, 7, 7, 8],
} as const;

/**
 * §17 — the handheld signal. `pointer`, not `any-pointer`: the PRIMARY input being a finger
 * is what says there is no attached pointing device. A 1920px Windows laptop with a trackpad
 * reports `fine` and stays desktop; detach the keyboard from a Surface and it reports
 * `coarse`, which is correct — it is a slab in someone's hands. A stylus reports `fine` too.
 *
 * Deliberately the same query the pointer axis reads (§16): since the `device` prop was
 * dropped (2026-08-05, LOG), coarse means handheld with no daylight between them, and the
 * band rides the pointer axis's own [data-pointer] scopes rather than an attribute of its
 * own. The cases that wanted the two apart — a touch-only kiosk read from two metres, a POS
 * terminal at desk distance — are deliberately not designed for; the LOG records what to
 * bring back if that changes.
 */
export const handheldMedia = "(pointer: coarse)";

/**
 * §17 — the narrow signal, and now tunable on its own, which is half the point of the split:
 * "how close is this screen" and "how wide is this screen" no longer share a number. v0 keeps
 * the 48rem the conjunction used, so exactly one thing changed in this commit.
 */
export const narrowMedia = "(max-width: 48rem)";

/**
 * §4 — the icon box, pulled by the size index. Sizes 1 and 2 share 16: the grid the ecosystem
 * draws on is 16/20/24, and a 14px raster of a 24-grid icon blurs its strokes. Deliberately
 * NOT part of the density or pointer sets — the icon grid is a perception floor, not a
 * breathing-room choice, so a compact size 2 and a comfortable size 2 carry the same icon.
 */
export const iconSize = [16, 16, 20, 24] as const;

/**
 * §4, §12 — the icon-label gap, pulled by the size index. Like the icon box above, it is
 * part of the LABEL CLUSTER and deliberately not in the density sets (decided 2026-08-04,
 * Kushagra): density grows the box and holds the content — type, icon, and the gap binding
 * them move together or not at all. It IS pointer-indexed (§16): the coarse world is a full
 * size step larger and the cluster spreads with its box. Steps into the space palette.
 */
export const controlGap = {
  fine: [2, 3, 3, 4],
  coarse: [3, 4, 4, 5],
} as const;

/**
 * §8, §13 — the chrome widths. One value each, size- and density-independent: containment and
 * focus are constant facts about a control, not things that get louder as it gets bigger.
 *
 * They are here rather than spelled inline because the hand-authored layers had them as raw
 * `1px` / `2px` literals, which broke the tokens-only rule and, more concretely, made them the
 * only geometry in a control that ignored `--scale` — a bordered button at scale 2 doubled its
 * height, padding, radius and type while keeping a 1px hairline.
 */
export const borderWidth = 1;
export const focusRing = { width: 2, offset: 2 } as const;

/**
 * §8 zeroed every transition pending the motion system, and recipes.test.ts makes that a law
 * — so NOTHING reads these two tokens today. They are emitted as the designed values waiting
 * for that system, not as a shipped transition: editing `duration` changes nothing anywhere,
 * and a reader debugging a "missing" 120ms ease in the browser is chasing a token with no
 * consumer. Ease-out because it responds immediately and settles; 120ms because hover feedback
 * reads laggy past ~150.
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
  /* Disabled reverts to the arrow: the hand promises a response the control will not give.
     Not `not-allowed` — it scolds, and no native platform uses it. */
  disabled: "default",
  /* A field is a place to put a caret, not a thing to press (§8, the cursors block): the box
     wears the I-beam, including its padding and its passive slots, because clicking any of
     them puts you in the same text. */
  text: "text",
} as const;

/**
 * §10 — the material recipes: three designed thicknesses, like the emphasis ladder
 * (amended 2026-08-04, Kushagra — was two). thin / regular / thick, Apple's own naming for
 * the same scale; solid is not a member, it is the seal — the absence of any material.
 * Alpha is the percentage the component's OWN fill is mixed toward transparent — material is
 * a fill modifier, never a colour (LOG 2026-08-04). It named `--neutral-1` under the white-veil
 * model that shipped for hours and was retracted the same day; nothing mixes the page colour
 * now, and neither recipes.css nor surfaces.css mentions `--neutral-1` at all. Designed points, not a dial; blur radii provisional until measured on a mid-tier
 * device (§10). v0 values judged against the photo backdrop in the preview.
 */
export const material = {
  // The ladder is monotone in every lever — alpha, blur, saturation, brightness push — so
  // thickness reads as one dimension. Thin is a veil: the backdrop's structure ghosts
  // through on purpose (its blur sits below §10's 12px defense floor, which applies to the
  // defending recipes, not the minimal one). Thick approaches the seal without reaching it:
  // alpha stays translucent because past ~.9 you should have used solid.
  //
  // The alphas are what the consuming layer mixes the component's OWN fill toward
  // transparent at (revised 2026-08-04, Kushagra — was a white veil): material is a fill
  // modifier, so a loud accent button under glass is translucent accent-9 and the quiet
  // rung is bare blur. `alpha` is [rest, hover, active] — §8's +1/+2 step rule translated
  // to the one ramp glass has, its mix percentage: interaction steps the veil toward its
  // own seal (the control coming forward), the filter never moves (a blur change re-samples
  // and shimmers). hover/active exist for CONTROLS wearing material — a static surface only
  // ever reads index 0. Monotone across thicknesses must hold per column, not just at rest,
  // so thickness still reads as one dimension mid-interaction.
  light: {
    thin: { alpha: [30, 38, 46], filter: "blur(5px) saturate(130%) brightness(1.02)" },
    regular: { alpha: [64, 72, 80], filter: "blur(16px) saturate(165%) brightness(1.06)" },
    thick: { alpha: [88, 92, 95], filter: "blur(32px) saturate(210%) brightness(1.12)" },
  },
  dark: {
    thin: { alpha: [38, 46, 54], filter: "blur(5px) saturate(130%) brightness(0.95)" },
    regular: { alpha: [71, 78, 85], filter: "blur(16px) saturate(165%) brightness(0.88)" },
    thick: { alpha: [92, 94, 96], filter: "blur(32px) saturate(210%) brightness(0.78)" },
  },
  /** Where backdrop-filter is unavailable or transparency is reduced: near-opaque, still a mix
      so a whisper of the backdrop survives where that is safe. */
  fallbackAlpha: 95,
} as const;

/**
 * §3, §12 — LAYOUT SPACE (decided 2026-08-04, Kushagra): the semantic layer between every
 * "distance between things" and the raw space palette, and the thing that makes `gap="4"`
 * mean "step 4 of this density's rhythm" rather than a frozen alias for 16px — the same move
 * contrast makes on colour roles. Each density level is a designed set of PICKS into the
 * untouched palette (indices are 1-based space steps; `default` is the 1:1 identity map).
 *
 * The boundary, drawn once: layout space is consumed by everything expressing distance
 * BETWEEN elements or from a container edge to its content — Box/Flex/Stack/Grid `gap`,
 * `p`, `m`, and surface padding. Raw space remains the palette plus the control family's
 * own picks: control innards already answer density through the designed sets (§12), and
 * routing them through this layer would compress a compact button twice.
 *
 * v0 shape: compact and comfortable shift steps 1-8 by one; the gutter band (9-12: 48/64/
 * 96/128) HOLDS at identity, so §12's original protection — compact must not collapse page
 * gutters — survives as a placed choice instead of a hard rule. Pointer never touches this
 * layer (§16: a phone needs more content per inch, not less). All picks await the eye.
 */
export const layoutSpace = {
  compact: [1, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12],
  default: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  comfortable: [2, 3, 4, 5, 6, 7, 8, 9, 9, 10, 11, 12],
} as const satisfies Record<DensityLevel, readonly number[]>;

/**
 * §10, §12 — surface padding as picks into LAYOUT SPACE (semantic reference, never a raw
 * px). Density reaches a card exclusively through the layout-space layer — this family
 * carries no per-level sets of its own (the 2026-08-04 morning mechanism, superseded the
 * same day when the layer arrived: one lever, not two). v0 at default: 12 / 16 / 24 / 32.
 */
export const surfacePadding = [4, 5, 6, 7] as const;

/**
 * §13 — the shadow palette: a RESOURCE, never an axis (LOG 2026-08-04). Four rows on the
 * system's one index shape; 1 is the inset well, 2-4 lift. No semantic component may read
 * these — elevation stayed deleted, and Box's shadow prop died with it (layout components
 * do not paint). Escapes and blocks reach the palette through `style`; the elevated world
 * consumes it through --surface-chrome. Dark rows run heavier: dark pages swallow shadow.
 */
export const shadow = {
  // SHARP by construction, not by taste adjectives (researched 2026-08-04). Three rules:
  //
  // 1. NEGATIVE SPREAD on the reaching layer — it pulls the shadow in under the element so
  //    depth drops BELOW instead of haloing sideways. This is the entire difference between
  //    crisp (shadcn/Tailwind) and foggy (2015 Material); rows 2-4 take Tailwind's sm/md/lg
  //    geometry verbatim, because row 2 is literally the card shadow judged sharp by eye.
  // 2. One light source: x is always 0, y grows with the row.
  // 3. Depth is offset growth, never more fog — blur stays proportional to offset.
  light: [
    "inset 0 1px 2px rgb(0 0 0 / 0.1)",
    "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  ],
  // Same geometry — the light source does not move at night — with alpha carrying the load,
  // because a dark page swallows shadow.
  dark: [
    "inset 0 1px 2px rgb(0 0 0 / 0.45)",
    "0 1px 3px rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
    "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
    "0 10px 15px -3px rgb(0 0 0 / 0.45), 0 4px 6px -4px rgb(0 0 0 / 0.45)",
  ],
} as const;

/**
 * §5/§10 — the elevated world's dressing, COMPOSED from the palette, never restating it:
 * shadow = elevation, one lighting model, and row 2 is its single source of truth — tune
 * `shadow[..][1]` and every elevated surface follows. The edge is NOT special: elevated
 * surfaces keep the same `--tone-border` as flat ones — which is what keeps them sharp and
 * what lets contrast="high" reach the edge through the tone system, free (two earlier
 * attempts failed: an inset ring painted inside the transparent border and read as two
 * lines; a raw-alpha border went soft and fell outside the contrast system). The top edge
 * stays lighter because the palette's shadows all fall downward. Dark adds the one thing a
 * drop shadow cannot express — the inset top rim-light a dark fill needs. v0, by eye.
 */
export const surfaceChrome = {
  light: "var(--shadow-2)",
  dark: "inset 0 1px 0 rgb(255 255 255 / 0.05), var(--shadow-2)",
} as const;

/**
 * §10 — the seal: what an opaque surface is filled with. Paper ABOVE the page, never the
 * page itself — a card sealed at --neutral-1 is invisible where it lives most. Light is
 * pure white over the #fcfcfc page; dark steps up the ladder. The Radix panel answer.
 *
 * All three rungs live here per mode, because the hover and active steps were previously
 * hard-coded to --neutral-2 and --neutral-3 for BOTH modes while the dark seal itself was
 * --neutral-2. So in dark, rest and hover were the same token and therefore the same pixels:
 * an interactive card had no hover feedback at all, and a glass card's hover mixed toward a
 * colour it was already sitting on. Rest is unchanged in both modes — dark moves only the two
 * states that were broken, so nothing that was judged by eye needs re-judging.
 */
export const surfaceColor = {
  light: { rest: "#ffffff", hover: "var(--neutral-2)", active: "var(--neutral-3)" },
  dark: { rest: "var(--neutral-2)", hover: "var(--neutral-3)", active: "var(--neutral-4)" },
} as const;

/** §15 — closed weight set; `light` deferred until something needs it. */
export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** §15 — three family slots. Theme props are the only place a stack is written. */
export const fontFamily = {
  body: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  heading: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
