/**
 * The authored token config. Every value in tokens.css derives from this file plus
 * the generator's laws — these are the only raw pixel constants in the system
 * (DECISIONS.md §12: raw px constants -> base scale -> semantic tokens).
 *
 * Step counts differ per family on purpose: each is set by that family's dynamic
 * range and perception, never copied across families (§6, "three count ceilings").
 *
 * The boundary with color-config.ts, declared (2026-08-06): color-config.ts holds what the
 * OKLCH GENERATOR consumes — hues, ladders, deltas, floors, per-mode step picks. This file
 * holds everything else, INCLUDING literal colour strings that bypass the generator (the
 * glass edge/rim alphas, the shadow rows, the surface seal): a value lives by which machinery
 * reads it, not by whether it looks like a colour.
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
 *   steps 7-10  the overlay band (--radius-overlay-1..4 — size-indexed since 2026-08-10)
 * The control band is disjoint from both, and that is what lets `full` pill the controls
 * while capping surfaces. The overlay is deliberately NOT disjoint from the surface band: a
 * dialog wears the corner of the card one size up (see radiusOverlay), so the two families
 * share three steps and only the top one (10) belongs to the overlay alone. It is NOT what makes the
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

/** The level emitted on `:root`; the rest ship as `[data-radius]` blocks. FULL is the
    default since 2026-08-09 (Kushagra): pill controls and capsule rows are the system's
    resting identity, not an opt-in — the surface band caps at large's values by the
    level's own design, so cards stay cards while every control rounds fully. */
export const defaultRadiusLevel = "full" satisfies RadiusLevel;

/**
 * §6, §10 — surface radii are size-indexed picks into the surface band (decided 2026-08-04,
 * Kushagra: a size-1 card and a size-4 card should not wear the same corner). Density never
 * touches these — density reaches a card through padding (layout space); the corner follows
 * only the size index. The overlay band below follows the same rule since 2026-08-10.
 */
export const radiusSurface = [6, 7, 8, 9] as const;
/**
 * §6, §24 — the OVERLAY band, size-indexed since 2026-08-10 (shipped with Dialog).
 *
 * It was one step (`--radius-overlay`, step 10) under the sentence "a dialog has one size",
 * and that sentence died exactly the way the identical one about cards died on 2026-08-04:
 * Dialog takes the size index (Kushagra), so its padding and its width move with it, and a
 * size-1 dialog padded 12px wearing the same 32px corner as a size-4 one padded 32px is the
 * mismatch that amendment was written to end.
 *
 * The picks lean on the surface band by ONE step rather than minting a new band: a dialog is
 * a card that covers, so at any index it wears the corner of the card one size up, and the
 * top of the band (10) stays where `--radius-overlay` stood — so the value a dialog used to
 * wear is now what its largest size wears. Density never touches it, the surface band's own
 * rule. v0 for the eye pass.
 */
export const radiusOverlay = [7, 8, 9, 10] as const;

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
    rowInset: [2, 2, 3, 4],
  },
  default: {
    height: [28, 32, 40, 48],
    px: [8, 10, 13, 16],
    pxPill: [12, 14, 17, 20],
    radius: [1, 2, 3, 4],
    slotInset: [3, 3, 4, 4],
    rowInset: [4, 5, 5, 6],
  },
  comfortable: {
    height: [34, 40, 50, 60],
    px: [12, 14, 18, 22],
    pxPill: [14, 17, 21, 25],
    radius: [2, 3, 4, 5],
    slotInset: [3, 4, 5, 6],
    rowInset: [6, 6, 7, 8],
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
  /**
   * §21 — the block air a ROW keeps around its one line of text (added 2026-08-09, Kushagra:
   * the menu read uncomfortably sparse). A row does not ride the height ladder: a button
   * prices its box for standalone pressing, a row sits in a list, and the desktop systems
   * that feel right compress rows below button height by dropping the height entirely —
   * shadcn's item is py + line against an h-9 button, macOS runs ~24px rows under 28px
   * buttons. So the row's box IS its text line plus this inset (the mark family's own
   * argument: the box is a property of the type beside it), and the pointer answer arrives
   * through the type bands — coarse raises the line, so the same derivation prices both
   * worlds. Per size since the same day it landed (Kushagra: size 4 read "a bit cramped" at
   * a constant inset — air grows GENTLY with the index, flat at sizes 1-2, +1/+2 at the
   * top, so the ratio still falls as type grows; size 2 re-judged 28 -> 30 the same day —
   * the full 4px cut read too aggressive beside the 32px button). Fine default lands
   * 24/30/34/38 (one
   * notch under the buttons at every size, the shadcn/macOS relationship); coarse default
   * lands 36/40/44/48 — size 2 sits 4 under its button's 44, the stated cost of tighter
   * rows on touch, still far above the locked 24 floor. There is NO invented row floor:
   * size 2 anchors near the target the same way the height ladder's own size 2 does. v0.
   */
  readonly rowInset: readonly [number, number, number, number];
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
    rowInset: [6, 6, 7, 8],
  },
  default: {
    height: [36, 44, 52, 60],
    px: [10, 13, 16, 20],
    pxPill: [15, 18, 21, 25],
    radius: [2, 3, 4, 5],
    slotInset: [4, 4, 5, 5],
    rowInset: [8, 8, 9, 10],
  },
  comfortable: {
    height: [40, 48, 58, 68],
    px: [14, 17, 21, 25],
    pxPill: [17, 20, 24, 28],
    radius: [3, 4, 5, 5],
    slotInset: [4, 5, 6, 7],
    rowInset: [10, 10, 11, 12],
  },
} as const satisfies Record<DensityLevel, DensitySet>;

/**
 * §16 — the touch floor (Apple HIG 44pt; Material 48dp; fingerpad anthropometry). Raw px on
 * purpose: a physical floor, not a length that zooms.
 *
 * A §13 resource whose first stylesheet consumer arrived 2026-08-05: the mark family's hit
 * target reads `min(--kui-ct-h, var(--touch-target-min))` (checkbox.css — the §4 pseudo-element
 * reach). The `max()` RESERVE this was originally minted for stays dropped (§16); do NOT
 * reintroduce a runtime reserve on the strength of the token existing.
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
 * §18 — the window size classes: which SHELL should this app show. Three, not four (LOG
 * 2026-08-05): a class exists to pick the navigation shape — bottom bar, rail, sidebar —
 * and there are three shapes. Material's fourth and fifth classes exist to compensate for
 * not having container queries; our container tiers (§2) already answer "can this area
 * afford another pane". The set widens by config the day a real shell forces it (the tone
 * set's rule), and the waiting name is `expanded`.
 *
 * Measured against the WINDOW, never the screen — a user in windowed mode has a window,
 * not a device — and named for room, never hardware: a phone-shaped canvas inside a
 * desktop tool is a narrow window with no phone anywhere.
 *
 *   narrow   ≤ 48rem   one column, bottom bar; dialogs become sheets (later)
 *   regular  in between  rail navigation
 *   wide     ≥ 75rem   sidebar; everything a shell can use
 *
 * Boundaries land DOWNWARD (a window at exactly 48rem is narrow), matching the narrow
 * type band's inclusive max-width — same word, same number, same moment.
 */
export const windowClass = {
  /** The narrow/regular boundary. THE shared number: the narrow type band's media derives
   *  from it below, so "display type shrinks" and "the app goes to one column" cannot
   *  drift apart. v0 keeps the 48rem the band already had. */
  narrowMax: "48rem",
  /** The regular/wide boundary. 75rem (judged 2026-08-05, Kushagra — 64rem was too small):
   *  `wide` promises a sidebar, a real sidebar is ~260px, and at 1024 the content behind it
   *  would be narrower than a narrow window. At 1200, iPads in landscape (1024-1180) take
   *  the rail, half a 27" display (1280) and every fullscreen laptop take the sidebar, and
   *  content behind a sidebar never drops below ~920px. NOT 80rem: that would put the
   *  boundary exactly on 1280 — one of the most populated widths in the wild (half-27",
   *  WXGA fullscreen) — so the commonest desktop posture would sit on the knife edge and
   *  flip shells with a pixel of drag. A threshold sits in quiet territory between
   *  populations, never on top of one; almost nothing lands exactly on 1200. */
  regularMax: "75rem",
} as const;

/**
 * §17 — the narrow signal, and now tunable on its own, which is half the point of the split:
 * "how close is this screen" and "how wide is this screen" no longer share a number...
 * except the one it shares on purpose: §18's narrow WINDOW boundary is the same number by
 * derivation, so the two `narrow`s are one word for one moment.
 */
export const narrowMedia = `(max-width: ${windowClass.narrowMax})`;

/**
 * §4 — the icon box, pulled by the size index, and priced per POINTER WORLD since 2026-08-10.
 *
 * Sizes 1 and 2 share 16 in the fine world: the grid the ecosystem draws on is 16/20/24, and a
 * 14px raster of a 24-grid icon blurs its strokes.
 *
 * **Density never touches it, and pointer does — and for a day those two were one sentence.**
 * The original read "NOT part of the density or pointer sets — the icon grid is a perception
 * floor, not a breathing-room choice", which is a correct DENSITY argument (a compact size 2
 * and a comfortable size 2 are the same control at different airiness, so the glyph inside
 * them is the same glyph) extended to pointer without a second argument. Pointer is not
 * breathing room: coarse means the screen is held close and touched, which is why it re-prices
 * the control box, type steps 1-4, the line box and the whole mark family. The icon was the
 * ONLY thing inside a control that the coarse world did not re-price — Kushagra caught it in
 * the playground, measured at size 2 default: the button grows 32 → 44, its label 14 → 16, its
 * checkbox sibling 16 → 20, and its glyph sat at 16 in both, reading thin against everything
 * around it. iOS scales SF Symbols with Dynamic Type for the same reason.
 *
 * The stroke needs no answer of its own: it lives inside the glyph's viewBox, so it scales
 * with the box. Nothing scaled because the box did not.
 *
 * The coarse ladder stays ON the ecosystem grid (20/24) rather than continuing it — 28 is not
 * a grid the icon sets draw for, and sizes 3 and 4 both landing on 24 mirrors the fine world's
 * own doubled entry at the bottom. v0, for the eye pass.
 */
export const iconSize = {
  fine: [16, 16, 20, 24],
  coarse: [20, 20, 24, 24],
} as const satisfies Record<"fine" | "coarse", readonly number[]>;

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
 * §4 — the MARK family: the painted box of a control that IS its own mark. A checkbox, a
 * radio, a switch's track, a slider's thumb — four controls whose visible box is not a
 * container for a label but the mark itself, sitting BESIDE one.
 *
 * It is one ladder because four separately designed ladders in the same visual weight class
 * will drift, and a checkbox beside a switch in one form has to read as the same size of
 * thing. The derivations off it are identities, never ratios (Kushagra, 2026-08-05: "I don't
 * like fraction" — the same objection that moved control padding off the space palette a day
 * earlier):
 *
 *   checkbox side = radio diameter = slider thumb = mark(n)
 *   switch track height                           = mark(n + 1)
 *
 * The one-index shift is what every peer system arrives at by hand: Radix's switch heights
 * (16/20/24) ARE their checkbox ladder (14/16/20) moved up a step, and Material's switch
 * track is 32 against an 18 checkbox. An index shift is a move this system already makes —
 * density shifts layout-space picks, the handheld band shifts type steps.
 *
 * **The ladder is the line box**, and that is why there are no numbers here. A mark occupies
 * exactly one line of the label it sits beside, so `--mark-N` resolves to `--line-height-N`.
 * Three things follow that no designed ladder would have given for free: the mark aligns with
 * its label by construction and never disturbs the text rhythm; it grows on a phone because
 * §17's handheld band raises the type, which is the honest version of what Spectrum does by
 * scaling every component 1.25x on touch; and there is nothing to keep in sync.
 *
 * The space palette was the first thing tried and it cannot hold this. Across a mark's entire
 * plausible range (14-30px) the palette offers exactly two rungs — 16 and 24 — so a four-step
 * ladder either repeats steps (16, 16, 24, 24) or overshoots (12, 16, 24, 32). That is the
 * control-padding failure verbatim, one family over, and Radix hit the same wall from the
 * other side: their switch size 2 is `calc(var(--space-5) * 5/6)` because they needed 20 and
 * the palette does not have it.
 *
 * Rendered: 16/20/24/26 fine, 20/24/26/28 coarse. Peer check — Material paints 18 (one size),
 * Radix 14/16/20, Fluent 16/20.
 *
 * FIVE entries for a four-size index (2026-08-08, with Switch): the fifth exists because the
 * switch's track is mark(n + 1), and at size 4 that identity points one step past the ladder's
 * top. `--mark-5` is the same sentence as the other four — the line box of type step 5 — and
 * the handheld band prices it like the rest, which is where the recorded wrinkle comes from:
 * the band collapses steps 4 and 5 onto one value, so under coarse a size-4 switch stands
 * exactly as tall as the size-4 checkbox beside it. Accepted, not papered over: the identity
 * holds in the fine world, and the coarse collapse is the type band's own fact.
 */
export const markSteps = [1, 2, 3, 4, 5] as const;

/**
 * §6 — the mark's own corner, as STEPS into the radius palette (corrected 2026-08-05).
 *
 * It first rode `--radius-control-N`, and that was the fraction bug a third time (after the
 * control corner itself and control padding). Those radii are designed to hold ~0.2 of the
 * HEIGHT ladder, and a mark is not on that ladder — so the corner held a fraction of a box the
 * control does not have. Measured against the shipped marks: 0.250 -> 0.385 across the index at
 * default density (Kushagra, by eye: "size 4 looks much more rounded than size 1"), and 0.462
 * at comfortable size 4, which is a circle in all but name — the one thing a checkbox must
 * never be (§6), reached by an AXIS rather than by a theme, so the `full` ceiling never saw it.
 *
 * Its own picks fix both halves. The fraction is a PER-LEVEL band (corrected 2026-08-06,
 * audit D13 — the first spelling claimed 0.17-0.25 "across every level", which is only the
 * default level's range): small runs 0.08-0.13, medium 0.17-0.25, large and full 0.25-0.38,
 * across both pointer worlds. What holds everywhere is the pair of invariants the laws carry
 * — no cell reaches half its box, and the spread across the size index stays under 1.4x per
 * level per world. It is DENSITY-INVARIANT like the mark itself: an airier form does not
 * change what a checkbox is, and the corner of an unchanged box has nothing to answer to.
 *
 * Steps rather than raw px, so the Theme radius levels still reach it — `none` must square a
 * mark like it squares everything else (§6's kill switch), and `small` and `large` should move
 * it. At `full` the band holds at `large`'s values, which is the surface band's own sentence
 * (§6: full means it stops getting rounder, never that it retreats) and is what keeps a
 * checkbox from becoming a radio.
 *
 * The residual spread is the palette's granularity: holding 0.25 exactly would need a 5 at
 * size 2 and a 6.5 at size 4, which the palette does not have and which a raw ladder could
 * only buy by going deaf to the levels.
 */
export const markRadius = [1, 1, 2, 2] as const;

/**
 * §4, §11 — the slider's track thickness, raw designed px per size. The space palette was
 * asked first, as it must be, and refuses this family the same way it refused the mark and
 * control padding: a track's plausible ladder wants 4/5/6/7, and between 4 and 8 the palette
 * has nothing, so a pick either repeats a step or doubles between sizes 2 and 3. A designed
 * raw number per size is the established answer (`height`, `px`, `pxPill`).
 *
 * The values hold ~0.25 of the FINE mark across the index (4/16, 5/20, 6/24, 7/26) — the
 * constant-fraction discipline the corner and padding laws already enforce, applied to the
 * one dimension a track has. Density- and pointer-invariant like the mark it serves: the
 * coarse world's extra target comes from the CONTROL's height (the slider root is a control
 * of its size and the whole box is pressable), not from a fatter line — iOS holds its track
 * at 4pt against a 28pt thumb for the same reason. v0, judged in the preview.
 */
export const sliderTrack = [4, 5, 6, 7] as const;

/**
 * §11 — the progress bar's thickness. ONE designed value, no size index, and the absence of
 * the index is the decision (2026-08-08, shipped with Progress).
 *
 * The ladder above was asked first and refused, for the reason §6 used to kill the checkbox's
 * corner: its values hold ~0.25 of the FINE MARK, and a progress bar has no mark. Riding it
 * would make the bar hold a fraction of a box the component does not have — the fraction bug's
 * fifth instance, reached this time by inheritance rather than by arithmetic. Separator is the
 * precedent that fits instead: a line whose thickness is one designed value and whose extent is
 * the container's (§11 gives that row no axes at all).
 *
 * Withholding is also the reversible direction. Adding `size` later is additive; removing it is
 * an API break — so the open question ("does a bar have a size step, and does that promote the
 * track into a FAMILY the way the mark family promoted?") is recorded in DECISIONS rather than
 * spent here.
 *
 * 6 rather than the default rail's 5: a rail carries a grip, which lends it presence a bar has
 * to find in its own weight. It sits inside the rail ladder's designed range (4-7) rather than
 * outside it, so a bar and a rail still read as the same kind of line. v0, judged in the
 * playground — iOS holds 4pt, Material 4dp, Radix's middle size 6px.
 */
export const progressTrack = 6;

/**
 * §4, §6 — the switch's inline width, ONE designed ladder indexed by the TRACK'S mark step
 * (2 through 5), not by the size index. The track's height is mark(n + 1), so the width is
 * designed against the mark the track actually is — and both pointer worlds then derive
 * their cells through the same band picks that price the marks, so nothing is designed
 * twice: fine size n reads entry (n + 1) − 2, coarse size n reads entry pick(n + 1) − 2,
 * and a coarse switch widens exactly one entry for the same reason it rises one step.
 *
 * Rendered widths against their tracks: fine 34/40/44/48 over 20/24/26/28, coarse
 * 40/44/48/48 over 24/26/28/28 — every cell holds 1.67–1.71 of its height, beside iOS's
 * 1.65, Material's 1.63, Radix's 1.75. The peers publish fractions; these are designed
 * numbers that happen to sit in that band (the mark family's own rule: identities and
 * designed values, never a ratio in the chain). Raw px like the slider TRACK ladder — the
 * fourth family with no palette rung at its scale, not the fifth: the count was written
 * against a tree that still had `sliderThumbW`, which the same commit deleted when the grip
 * went back to the family's square (audit 2026-08-08). v0, judged in the preview.
 */
export const switchW = [34, 40, 44, 48] as const;

/**
 * §4 — the switch thumb's inset from its track, one designed value. The pre-scoping's own
 * sentence ("the THUMB is that track minus a designed inset") made literal: thumb diameter
 * = track − 2 × inset, all sizes, both worlds. Deriving the inset from the mark ladder was
 * tried on paper and refused: thumb = mark(n) reads as an identity but the coarse band's
 * 4/5 collapse drives the inset to ZERO at size 4 — a thumb flush with its track — so the
 * inset is the designed constant and the diameter is what derives. v0.
 */
export const switchInset = 2;

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
 * §8 — motion's SIGNAL clock: the one a colour or an opacity change rides.
 *
 * Motion has two clocks and they are not the same kind of thing (LOG 2026-08-09, principle 5).
 * A colour is a signal — it should be legible as fast as the eye can take it, so it eases and
 * it is short. Geometry is physics: a box that moves has mass, and it rides a spring (below).
 * Mixing them is what makes a system read as a slideshow.
 *
 * Ease-out because it responds immediately and settles; 120ms because hover feedback reads
 * laggy past ~150. Both values were designed 2026-08-03 and sat unread until the motion
 * system landed 2026-08-09; they are consumed now.
 */
export const motion = {
  duration: "120ms",
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/**
 * §8 — the spring family, motion's TRAVEL clock (designed 2026-08-09, judged by eye in the
 * motion lab; LOG "Motion's grammar is chosen: physics, not clips").
 *
 * The web animates with clips: a duration and a curve, time as the input. Apple attaches a
 * spring to the object — position, velocity, target — and time falls out. We cannot ship a
 * solver for every state change (that is JS at interaction time, §8's own rule), so we bake
 * the solver's OUTPUT into a `linear()` easing: a damped spring sampled at fixed intervals,
 * costing exactly what a cubic-bezier costs and reading like the real thing.
 *
 * Each entry is the physical model, never the sampled numbers — the numbers are the
 * generator's, and a law re-derives them. `zeta` is the damping ratio (the CHARACTER: how the
 * energy leaves) and `omega` the undamped frequency in radians per unit of normalised
 * progress (the SHAPE: how much of the settle happens inside the window). Wall-clock speed is
 * the transition's own duration, which is why one curve serves a 480ms panel and a 140ms
 * press.
 *
 * **Damping is sacred, and it is the one number never loosened for visibility** (LOG,
 * principle 9). Every curve here crosses its target exactly ONCE. A second crossing is a
 * ring, and a ringing interface reads mechanical — the failure that killed the first three
 * spellings of the switch. When a movement needs to be more visible, it gets more TRAVEL, not
 * less damping.
 *
 * `steps` is how many samples the curve is emitted with. Stiff needs fewer because it never
 * overshoots — there is no fine structure to miss — and every sample is bytes.
 */
export const springs = {
  /** Travel. ~6.8% overshoot, one crossing, a long soft tail — the calm the switch set. */
  calm: { zeta: 0.65, omega: 7.7, steps: 36 },
  /** A control recovering: ~10.7% overshoot, then a rebound that stops about 1% under its
      target — a hundredth of a pixel over the travel it actually carries, which is why this
      is not a ring. More life than calm, and still nowhere near the second VISIBLE excursion
      that makes motion read mechanical. It carries the hover rise and the release. */
  lively: { zeta: 0.58, omega: 10.835, steps: 36 },
  /** The press-down, and every EXIT: fast, weighted, decelerating, and it never overshoots.
      An exit that bounces is an object that did not mean to leave; an exit on `ease-in`
      slams, because ease-in ends at maximum velocity (LOG, principle 14). */
  stiff: { zeta: 0.85, omega: 4.706, steps: 24 },
  /** The heavy plane's arrival (§24, 2026-08-16, tuned on the lab's half-screen and 88vw
      panes: "a bit faster, a little more than 2%, with slight overshoot"). Mass forbids
      overshoot — every designed heavy system brakes BEFORE its target, because a heavy thing
      that overshoots does damage — so this spends almost the whole of damping's one-crossing
      allowance on the approach: ζ0.8 is ~1.5% of the travel, a single crossing, a calm
      return. Named for its manner rather than its consumer: a dialog is simply the first
      thing heavy enough to need it. */
  poised: { zeta: 0.8, omega: 8.75, steps: 36 },
  /** The alert's materialization (2026-08-15/16, tuned twice by eye: lively's 10.7% was
      too polite for a box arriving with a whole card's momentum, ζ0.5's ~16% carried a
      ~2.7% second excursion — visible, and the reversal restored damping's sacredness).
      ζ0.62: ~8.4% overshoot, second excursion ~0.7% — genuinely one crossing. */
  elastic: { zeta: 0.62, omega: 10.835, steps: 36 },
} as const;

/**
 * §22 — the floating family's own motion: the durations the emergence recipe is made of
 * (judged 2026-08-09 in the motion lab, on the real Menu; v0 for the eye pass).
 *
 * A panel does not appear, it BECOMES (LOG, principle 11): it starts as a small seed — a
 * circle the size of the trigger it came out of, because at a menu's inception the shape it
 * will take is not yet known — and unfurls into its own box. What makes that read as one
 * object rather than a rigid block is that its parts arrive at different times (principle
 * 10): the tall channel runs longest, the lateral reach lands sooner, the width sooner still.
 * Give them all one duration and the panel reads as a photograph being scaled.
 *
 * The exit is NOT the entry reversed. Three were built and judged side by side (motion lab,
 * 2026-08-09): folding back into the seed, mirroring the entry on a compressed clock, and
 * this one — the pane holds its geometry, settles back a hair, and dissolves. Kushagra chose
 * dissolve. The reason it wins is that an entry answers "where did this come from" and an
 * exit answers nothing: the viewer is already looking at the thing they dismissed, so
 * retracing the path spends 300ms narrating a fact nobody needs.
 */
/**
 * §8 — the control layer's own motion (judged 2026-08-09 in the motion lab; v0 for the eye
 * pass). Every number here is a clock except the last three, which are distances a press
 * moves through.
 *
 * **The press keeps its 2026-08-03 finding, and the two clocks are what let it.** An eased
 * press never reaches its colour inside a ~60ms tap, so the control reads dead on a phone —
 * which is why every transition was zeroed for six days. The resolution is not a compromise:
 * the press's PAINT is instant, exactly as that finding demands, and only its GEOMETRY rides
 * a spring. A tap gets its colour on the first frame and its travel is a physical fact
 * underneath, so nothing is waiting on a clock to tell the user they were heard.
 *
 * **Hover is asymmetric on purpose.** The light comes up fast and decays slow — 80ms in,
 * 220ms out. A symmetric hover reads as a lamp on a switch; this reads as a surface warming
 * under the pointer and cooling after it. It is also the honest asymmetry: arriving is a
 * thing the user did, and leaving is a thing they stopped doing.
 */
export const controlMotion = {
  /** Hover in — fast enough that the pointer never outruns it. */
  hoverIn: 80,
  /** Hover out — slow enough to read as cooling rather than switching off. */
  hoverOut: 220,
  /** The press's geometry. Short, and on the stiff spring: it must beat a ~60ms tap. */
  press: 140,
  /**
   * Everything a control's geometry does that is NOT a press — the hover rise, the settle back
   * down, a squashed mark springing out. Long and lively against the press's short and stiff,
   * which is the judged asymmetry (LOG 2026-08-09): a press is a hard stop under the finger
   * and a release is the object recovering, and giving them one clock flattens both.
   */
  rise: 550,
  /** How far a button lifts under the pointer. One pixel: the fill has already stepped, and
      this is the surface acknowledging a hand near it, not an animation. */
  hoverTravel: 1,
  /** A mark's glyph arriving — a tick is drawn, not switched on. */
  mark: 380,
  /** The switch thumb crossing its channel. The benchmark movement (LOG, principle 2). */
  travel: 420,
  /** The focus ring landing from outside, and how far outside it starts. Keyboard only by
      construction: `:focus-visible` is the selector, and on anything but a text input it
      means the keyboard. The eye must FIND focus after a Tab; it does not after a click. */
  ring: 260,
  ringLand: 4,
  /** How far a pressed button sinks, and how far it shrinks doing it. */
  pressTravel: 2,
  pressScale: 0.975,
  /** A pressed mark squashes rather than sinking — it has no depth to sink into. */
  pressSquash: 0.9,
  /**
   * How far a switch thumb leans toward where it is about to go, while held. Deformation
   * shares the travel's own properties (LOG, principle 4): the thumb is drawn by its two
   * edges, so leaning and crossing cannot sequence.
   *
   * Six, not three (Kushagra, 2026-08-09: *"switch might travel but it doesnt scale the thumb
   * like our example did, why did we spend hours refining that?"*). The first number was a
   * seventh of the thumb and simply could not be seen. The demo that earned this stretched
   * about 38% of the grip's own width, which is what makes the switch read as a physical thing
   * being pushed rather than a state being reported — six is that fraction at the small end of
   * the ladder and a quarter at the top. v0: a designed set per size is the next move if the
   * eye wants it even across the range.
   */
  thumbLean: 6,
} as const;

/**
 * §22 — the FALLBACK seed: the dot an ANCHORLESS panel unfurls out of (v0).
 *
 * Since 2026-08-15 the seed is the trigger's own measured silhouette (Kushagra: "make the
 * circle shape of trigger exactly, and make it start from where the trigger is, thats all"),
 * written per open as `--kui-seed-w/h/r` in system/floating.tsx — so this constant is only
 * what the seed rule's fallbacks resolve to when there is no anchor to photograph. The
 * designed-circle era (40 -> 72 -> 56, with a quadrant growth center, all judged 2026-08-15
 * and retired the same day) is in LOG.
 */
export const floatingSeed = 56;

/** The content's small arrival, echoing the box's own travel (2026-08-16, the family
    unification: the dialog's content rises as it prints and the menu's just appeared —
    "nice, but not of the same family"). v0. */
export const floatingEcho = 8;

export const floatingMotion = {
  /**
   * The vertical channel — the panel's height and its climb out of the seed — and it LEADS
   * (reversed 2026-08-09, Kushagra, judged in the playground: *"if menu opens to right,
   * trajectory should be to go down, then right… currently it seems going direction side
   * first, then down"*).
   *
   * The first spelling gave the tall channel the longest duration on the reasoning that a
   * panel's height has the furthest to go. That is true and it is the wrong thing to optimise:
   * the axis that finishes LAST is the one the eye reads as the direction of travel, so a slow
   * width made every menu unfurl sideways and then drop. A menu falls out of its trigger and
   * then opens; the vertical arrives first.
   */
  fall: 320,
  /** The horizontal channel — width, and the lateral travel — and it TRAILS, which is what
      makes the direction of travel legible. */
  spread: 480,
  /** The corner and the settle-scale, between the two. */
  corner: 380,
  /** The panel's own fade-in, and its rows'. Paint is signal: it does not ride a spring. */
  reveal: 200,
  /** Rows wait for the SHAPE, not just the commit (80 -> 280, 2026-08-15, Kushagra: the
      content must be "blurred out, empty" while the circle is still becoming the container,
      and show up "as the circle takes the shape" — at 80ms the rows printed onto a box that
      was still mostly circle, which is what made the entry read as a rectangle dropdown
      fading in). 280 starts the print as the fall (320) is landing; v0, judged live. */
  revealDelay: 280,
  /** Exit: the dissolve itself. */
  dissolve: 140,
  /** Exit: the hair of scale the pane settles back through while dissolving. */
  settle: 160,
} as const;

/**
 * §24 — the overlay family's own motion (2026-08-15, Kushagra: the floating entry's
 * PRINCIPLES applied to the dialog, never its animation — "the container is the same
 * surface"). A dialog is anchored to nothing, so there is no box to photograph and no
 * distance to close: its entry is a MATERIALIZATION. The grammar transfers whole — the box
 * becomes (geometry on the spring), presence is paint (a panel with no source fades in
 * honestly, on the fast clock), the content is one molten unit printing as the box lands,
 * and the exit dissolves because leaving is never the entry reversed. Its own clock names,
 * not borrows of the floating ones: the families share a grammar, not a token home. v0.
 */
/** The circle a dialog's surface forms from (2026-08-15, Kushagra: "the dialog container
    itself expanding from a circle in center") — the diameter of the clip the entry opens
    from. Its own constant, not a borrow of floatingSeed: shared grammar, separate homes. v0. */
export const overlaySeed = 64;

/** The dialog's ORIGIN (2026-08-15, Kushagra: "we know the origin of dropdown menu is
    trigger, whats the origin of this? It needs to move"). A dialog is summoned, not
    anchored: the circle forms this far BELOW its resting place and rises into it as it
    unfurls — motion that answers "where did this come from" with "it surfaced". Since the
    second round: the GAP below the dialog's BOTTOM edge (the runner knows the measured
    height, so the origin clears the final card entirely — at 48 from center the circle sat
    exactly on the bottom edge and the travel was invisible). v0. */
export const overlayLift = 32;

/** The content's own small arrival, echoing the container's origin (2026-08-15, Kushagra:
    the body read as animating left-to-right off the growing box's edge; it should arrive
    top-down like the container did) — the body starts this far below its resting place and
    rises as it prints. v0. */
export const overlayEcho = 8;

/**
 * §24 — the DIALOG's entry (2026-08-16, labbed on lab2's mass strip and locked from four
 * candidates). Not the alert's, and the split is the whole decision: the materialization
 * below is an ARRIVAL — travel, overshoot, a point origin — which is an interruption
 * announcing itself, and at modal mass the same inertia reads as the room moving rather than
 * a thing arriving. A dialog is SUMMONED, so it comes into focus rather than into view.
 *
 * The large-mass principles these numbers are: mass lowers frequency (the clocks stretch),
 * mass forbids overshoot (the spring is near-critical), mass shortens travel (there is none
 * in x or y — the scrim pushing the app back IS the arrival, §10), and mass softens onset (a
 * spring from rest has no instant velocity). All v0 for the eye pass.
 */
export const dialogMotion = {
  /** The box's arrival in DEPTH, and the content's coming into focus — one clock, because the
      content is part of the mass. */
  settle: 600,
  /** Paint: presence. A panel with no source fades in honestly (§8's two clocks). */
  reveal: 300,
} as const;

/**
 * The dialog entry's two distances (§24). `depth` is where the panel starts on the z-axis —
 * a scale, not a translate, because the only axis it travels is toward the viewer. `blur` is
 * how far out of focus its content starts: depth of field is a property of the mass, so what
 * is printed on the plane focuses WITH the plane. Blur is also the ONLY channel the system
 * may honestly animate here — a dialog's content is the consumer's (forms, whole workspaces),
 * and travel or print would presume an arrangement the system does not own.
 */
export const dialogEntry = {
  depth: 0.97,
  blur: 6,
} as const;

export const overlayMotion = {
  /** SPEED-matched to the menu, not time-matched (2026-08-16, Kushagra: same clocks read
      "snappy" here — the dialog covers roughly three times the menu's distance, so equal
      durations meant tripled velocity). The clocks run ~1.7x the floating family's (1.4x still read snappy on the return); what
      the two share is the spring and the grammar, and the perceived pace is what lands
      equal. */
  /** The box's becoming — the corner and the container's sharpening ride this. */
  materialize: 700,
  /** The axes are OUT OF PHASE, the floating family's own grammar (2026-08-15, Kushagra:
      one clock over asymmetric distances made the width read as a slide while the height
      sprang — measured, 504px against 53px of travel). The vertical leads, the width
      trails; two clocks is what makes both read as the same spring. */
  fall: 560,
  spread: 800,
  /** ZERO since 2026-08-16 (Kushagra: the hold left "a weird random square on the screen
      for a brief instant" — the seed must start growing AS it fades in, one event). The
      circle-ness now survives the growth by shape instead of by time: the pose corner is
      50%, so the box stays curvy while it opens. */
  hold: 0,
  /** The growth departs WITH the rise and the fade — the dropdown's own physics, copied
      whole (2026-08-15/16: staggering read as the wrong spring, and any hold left a shape
      lingering; the menu launches every channel together, and that concurrency IS the
      elasticity). 300 (rise fully, then grow) was a firework; 180 was still two events;
      120 with a 120 hold still lingered. */
  grow: 0,
  /** Paint: the panel's own fade, and the scrim's. */
  reveal: 200,
  /** The content prints as the box lands — held molten until here. */
  revealDelay: 160,
  /** The content's own channels (sharpen + echo) run at THIS pace — the menu content's
      own, not the box's: the box clocks are speed-matched to a big journey (above), but
      content travels ~8px in both families, so equal TIME is what makes the two prints
      read as one sentence (2026-08-16). */
  print: 380,
  /** Exit: the dissolve, and the hair of settle it carries (the floating exit's grammar,
      restated in the family's own numbers). */
  dissolve: 140,
  settle: 160,
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
  // A material owns FOUR parts, not one (2026-08-05, Kushagra: blur + a borrowed border reads
  // "cheap"): the body (alpha + filter), its own EDGE (a translucent hairline of light — the
  // opaque tone border on glass was the sticker), the RIM (a top inner highlight; the scene's
  // one light source falls downward, the same model the shadow palette commits to), and
  // SEPARATION — which stays the APP's (depth="elevated"), never the pane's: a flat
  // world's glass has edge and glint, no lift (the weld was built and reversed 2026-08-05).
  // Edge and rim are white alphas per thickness, rising with it: thicker glass catches more
  // light. All v0, judged in the preview.
  //
  // THE TWO SEAMS WHERE ELEVATION MEETS THE MATERIAL (§10, decided 2026-08-07 — the
  // four-worlds frame applied to glass; what makes blur read as substance is light
  // RESPONDING to it): under a sun, a pane CATCHES harder — `rimLifted` is the elevated
  // world's brighter glint per thickness — and what a pane CASTS is the app's shadow
  // TRANSMITTED: glass passes light, so its shadow is the surface row faded by
  // `transmission` (thin passes most, thick least; the generator derives the faded rows
  // from the palette, so there is still exactly one source of shadow truth).
  // alphaHigh is contrast="high"'s answer per thickness: MORE opaque, never fully — the
  // ladder keeps its three visibly distinct thicknesses, each just defending harder. The
  // near-opaque fallbackAlpha below stays what reduced-transparency means; high contrast is
  // a different preference and gets its own designed row (judged 2026-08-05, Kushagra: the
  // first cut reused fallbackAlpha and collapsed all three thicknesses into one).
  light: {
    thin: { alpha: [34, 42, 50], alphaHigh: [55, 62, 69], filter: "blur(2.4px) saturate(172.5%) brightness(1.03)", edge: 0.5, rim: 0.35, rimLifted: 0.42 },
    regular: { alpha: [49, 57, 65], alphaHigh: [82, 87, 92], filter: "blur(4px) saturate(207%) brightness(1.05)", edge: 0.6, rim: 0.45, rimLifted: 0.52 },
    thick: { alpha: [65, 69, 72], alphaHigh: [94, 96, 97], filter: "blur(5.6px) saturate(241.5%) brightness(1.06)", edge: 0.7, rim: 0.55, rimLifted: 0.62 },
  },
  dark: {
    thin: { alpha: [52, 60, 68], alphaHigh: [60, 67, 74], filter: "blur(2.4px) saturate(175.5%) brightness(0.92)", edge: 0.1, rim: 0.06, rimLifted: 0.12 },
    regular: { alpha: [67, 74, 81], alphaHigh: [86, 90, 94], filter: "blur(4px) saturate(195%) brightness(0.9)", edge: 0.14, rim: 0.1, rimLifted: 0.18 },
    thick: { alpha: [80, 82, 84], alphaHigh: [95, 96, 97], filter: "blur(5.6px) saturate(208%) brightness(0.88)", edge: 0.18, rim: 0.14, rimLifted: 0.24 },
  },
  /** How much of the app's shadow a pane lets survive (§10's transmission seam): glass
      passes light, so its cast is the surface row FADED — thin passes most, thick least,
      and even thick keeps less than a solid slab. Mode-independent: transmission is a
      property of the pane, not of the night. v0, judged in the preview. */
  transmission: { thin: 0.35, regular: 0.55, thick: 0.75 },
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
 * §22, §23 — the FLOATING panel's interior padding, ONE pick into layout space (the
 * surfacePadding sentence at panel scale: density reaches it through the layer, no set of
 * its own). Renamed from menuPadding on the second consumer (Select, 2026-08-09): the fact
 * was never the menu's — every floating panel breathes by it, and a select popup consuming
 * a menu-named token would be the two-homes drift wearing a component's name. One value
 * and not a size-indexed family: the panel's rows answer the size axis, its breathing room
 * does not (v0). Index 2 = 4px at default density.
 */
export const floatingPadding = 2;

/**
 * §22, §23 — the floating panel's minimum width, raw px through --scale (the switchW
 * precedent: no palette rung lives at this scale). The rendered floor is max(this, the
 * trigger's own width via --anchor-width): a panel is never narrower than the thing that
 * opened it — the size-match argument applied to geometry — and never comically narrow
 * under an icon-only trigger. ≈ shadcn's 8rem. Renamed from menuMinWidth with the padding
 * above. v0.
 */
export const floatingMinWidth = 112;

/**
 * §10, §24 — the SCRIM: the dialog backdrop's dim and its blur, minted 2026-08-10 with
 * Dialog and designed long before it (§10's material table has carried this row, unemitted,
 * since 2026-08-04).
 *
 * It is not a material and does not join that ladder: a material defends a FOREGROUND's
 * legibility by mixing the component's own fill, and this defends nothing — it pushes the
 * app back so the thing on top of it is unambiguously the thing you are using. So it is one
 * designed pair per mode rather than three thicknesses, and its colour is black in both
 * modes rather than a mix of anything (a scrim that took the page's colour would vanish in
 * dark, where the page is already near-black — the one place "dim the app" needs the most
 * help). Dark leans HARDER for exactly that reason: a 40% veil over a dark page moves almost
 * nothing.
 *
 * The blur is 4px and deliberately below §10's 12px defense floor — the scrim only needs the
 * app to stop reading as legible content behind the dialog, not to be frosted out, and a
 * heavy blur on a full-viewport backdrop is the most expensive thing this library could
 * paint. `prefers-reduced-transparency` and `contrast="high"` share one answer: drop the
 * blur, take `fillHigh` (the app goes further back by pigment rather than by defocus).
 * v0 for the eye pass.
 */
export const scrim = {
  light: { fill: "rgb(0 0 0 / 0.4)", filter: "blur(4px)", fillHigh: "rgb(0 0 0 / 0.62)" },
  dark: { fill: "rgb(0 0 0 / 0.55)", filter: "blur(4px)", fillHigh: "rgb(0 0 0 / 0.75)" },
} as const;

/**
 * §24 — the OVERLAY pane's width, one designed raw-px ladder on the size index (the switchW
 * and floatingMinWidth precedent: no palette rung lives at this scale, and a width is not a
 * distance BETWEEN things, so layout space is the wrong layer).
 *
 * Named for the family rather than for Dialog because the size join that publishes it lives
 * in the shared surface layer — per-size spellings belong there, the switch join's rule, and
 * a component stylesheet naming `data-size` is a law failure (recipes.test.ts). The values
 * are priced for a dialog, which is the family's first member; a member that wants a
 * different relationship to the window states its own, exactly as it would its own padding.
 *
 * It is a MAXIMUM, not a width: the viewport pads itself by a layout-space gutter and the
 * popup takes the lesser of this and the room that is left, so a 360px-wide phone shows a
 * size-4 dialog at 360 minus its gutters rather than clipping one. Density- and
 * pointer-invariant on purpose: how wide a modal should be is a question about content and
 * reading measure, and neither axis is asking that question — a comfortable app does not
 * want a wider dialog, it wants more air inside the one it has, which is what the size
 * index's padding already gives it.
 *
 * The steps are the shapes real dialogs take: a confirm (1), a short form (2), the default
 * settings pane (3), a wide editor (4). v0 for the eye pass.
 */
export const overlayWidth = [360, 440, 560, 720] as const;

/**
 * §25 — the ALERT's width, one designed raw-px ladder on the size index, and a FIXED width
 * rather than a maximum: an alert's content is closed (title, description, two actions), so
 * its box does not stretch to content the way a dialog's may — the component states the
 * width and the words wrap to it, which is also what makes the 50/50 action row hold its
 * shape. Strictly narrower than the dialog of the same index at every step (law-tested): an
 * alert interrupts with a question, it does not host work. The viewport's gutter still wins
 * on a narrow window. v0 for the eye pass.
 */
export const alertWidth = [280, 320, 360, 400] as const;

/**
 * §24 — the gutter between the dialog and the window edge, ONE pick into layout space (the
 * floatingPadding sentence at overlay scale). It is what keeps a dialog off the edge on a
 * phone, so it answers density through the layer like every other distance. Index 6 = 24px
 * at default density.
 */
export const dialogInset = 6;

/**
 * §13 — the shadow palette: a RESOURCE, never an axis (LOG 2026-08-04; redesigned and
 * widened to FIVE rows 2026-08-07 with the four-worlds frame, §19). One ladder ordered by
 * height: 1 is the inset well, 2 is the CONTROL row (small drop, button scale — added
 * because the palette had no rung at control scale, and a bespoke shadow hidden inside a
 * chrome role would have been a second source of shadow truth), 3-5 lift further (the old
 * 2-4, renumbered while nothing is published). No semantic component may read these —
 * escapes and blocks reach the palette through `style`; the elevated world consumes it
 * through the chrome roles (--surface-chrome, --control-chrome). Dark rows run heavier:
 * dark pages swallow shadow.
 */
export const shadow = {
  // SHARP by construction (researched 2026-08-04; anatomy redesigned 2026-08-07): every
  // drop row is the same TWO-PART anatomy at a different height — a CONTACT line (small
  // offset, near-zero blur, the crisp dark line right under the edge) plus an AMBIENT halo
  // (larger offset/blur, negative spread, low alpha). The contact line is what reads sharp;
  // the ambient is what reads raised. Rules that survive from the first design: one light
  // source (x always 0, y grows with the row), negative spread on the reaching layer, depth
  // as offset growth rather than fog. v0 values, judged in the preview.
  light: [
    "inset 0 1px 1px rgb(0 0 0 / 0.12), inset 0 2px 4px rgb(0 0 0 / 0.06)",
    // Row 2's two edge rules (Kushagra, from the preview: "a dark line at top, a light at
    // bottom"): the CONTACT hugs — no negative spread, so no bright seam opens between the
    // bottom edge and its own shadow — and the AMBIENT stays strictly below the top edge
    // (blur − offset − pull-in < 0; at exactly 0 it kisses the edge and reads as a fringe).
    "0 1px 1px rgb(0 0 0 / 0.1), 0 2px 4px -2.5px rgb(0 0 0 / 0.08)",
    "0 1px 1px -0.5px rgb(0 0 0 / 0.11), 0 3px 8px -3px rgb(0 0 0 / 0.11)",
    "0 2px 2px -1px rgb(0 0 0 / 0.11), 0 8px 16px -5px rgb(0 0 0 / 0.12)",
    "0 3px 3px -1.5px rgb(0 0 0 / 0.11), 0 16px 32px -8px rgb(0 0 0 / 0.14)",
  ],
  // Same geometry — the light source does not move at night — with alpha carrying the load,
  // because a dark page swallows shadow.
  dark: [
    "inset 0 1px 1px rgb(0 0 0 / 0.5), inset 0 2px 4px rgb(0 0 0 / 0.25)",
    "0 1px 1px rgb(0 0 0 / 0.45), 0 2px 4px -2.5px rgb(0 0 0 / 0.35)",
    "0 1px 1px -0.5px rgb(0 0 0 / 0.45), 0 3px 8px -3px rgb(0 0 0 / 0.4)",
    "0 2px 2px -1px rgb(0 0 0 / 0.45), 0 8px 16px -5px rgb(0 0 0 / 0.45)",
    "0 3px 3px -1.5px rgb(0 0 0 / 0.45), 0 16px 32px -8px rgb(0 0 0 / 0.5)",
  ],
} as const;

/**
 * §5/§10 — the elevated world's dressing, COMPOSED from the palette, never restating it:
 * shadow = elevation, one lighting model, and row 3 is its single source of truth — tune
 * `shadow[..][2]` and every elevated SURFACE follows. (Row 3, not 2, since the palette gained
 * the control drop at row 2 and renumbered, 2026-08-07 — this line still said `[1]` for a day
 * afterwards, which pointed whoever came to tune a card's depth at every button, field and
 * slider handle instead. controlChrome below is the one that reads row 2.) The edge is NOT
 * special: elevated
 * surfaces keep the same `--tone-border` as flat ones — which is what keeps them sharp and
 * what lets contrast="high" reach the edge through the tone system, free (two earlier
 * attempts failed: an inset ring painted inside the transparent border and read as two
 * lines; a raw-alpha border went soft and fell outside the contrast system). The top edge
 * stays lighter because the palette's shadows all fall downward. Dark adds the one thing a
 * drop shadow cannot express — the inset top rim-light a dark fill needs. v0, by eye.
 */
export const surfaceChrome = {
  light: "var(--shadow-3)",
  dark: "inset 0 1px 0 rgb(255 255 255 / 0.05), var(--shadow-3)",
} as const;

/**
 * §5, §19 — the elevated world reaches CONTROLS (decided 2026-08-07, the four-worlds frame;
 * deliberately reverses the 2026-08-06 "a button stays flat" negative law). Elevation's
 * membership sentence splits by what light does: the CAST still dresses only boxes that
 * establish a plane (cards — surfaceChrome above), but in a world with a light source a
 * raised control is lit too — it casts the palette's control row and CATCHES light on its
 * top. A field stays unlit (a well is content of a plane); a CHECKED mark catches the loud
 * button's gradient — the checked fill is the mark family's loud rung (§11) — and never
 * casts; the slider thumb casts ALWAYS — flat world included — as role semantics (§6's
 * kill-switch exception pattern): a grip that does not sit above its rail stops reading
 * as a grip. It reads this row's VALUE, not the world switch.
 *
 * controlChrome is the cast: the one shadow every solid control shares, composed from the
 * palette's control row — never a bespoke value, so escapes reach the same shadow at
 * --shadow-2 and there is exactly one source of shadow truth. Dark prepends the rim-light,
 * the surface chrome's own sentence one scale down.
 */
export const controlChrome = {
  // BOTH modes carry the crisp inset rim (researched 2026-08-07: Primer's shadow-highlight,
  // the tactile-button recipes — the top catch that reads as a machined edge is a 1px inset
  // LINE, not a gradient wash; light shipped without it and its buttons read as fills with
  // shadows rather than objects). The rim lives in the chrome, so every rung that casts
  // also catches the edge — the gradient is a separate, loud-only statement.
  light: "inset 0 1px 0 rgb(255 255 255 / 0.25), var(--shadow-2)",
  dark: "inset 0 1px 0 rgb(255 255 255 / 0.06), var(--shadow-2)",
} as const;

/**
 * The CATCH half (§19): light from above, painted as background-image layers over whatever
 * fill the rung chose — tone-independent by construction, one recipe lights every tone.
 * Layer 1 is the catch (white fading from the top edge), layer 2 the seat (a faint dark
 * settle at the bottom). NOT a shadow: flat worlds declare `none`, and a gradient list can
 * hold it where a shadow list cannot (the material rim's own reasoning, §10). The light
 * never moves with state — the fill steps beneath it. v0 alphas, judged in the preview.
 */
export const controlLight = {
  // The two layers OVERLAP through the middle (catch fades to zero at 55%, seat starts
  // rising at 45%) — the first cut ended the catch at 45% and started the seat at 62%,
  // which cut the fill into three zones whose boundaries read as LINES on a pale medium
  // fill (Kushagra, on sight). A gradient may never leave a visible shelf: every stop
  // sits where its layer's alpha is already near zero.
  light:
    "linear-gradient(rgb(255 255 255 / 0.08), rgb(255 255 255 / 0) 62%), linear-gradient(rgb(0 0 0 / 0) 38%, rgb(0 0 0 / 0.05))",
  dark: "linear-gradient(rgb(255 255 255 / 0.08), rgb(255 255 255 / 0.01) 62%), linear-gradient(rgb(0 0 0 / 0) 38%, rgb(0 0 0 / 0.10))",
} as const;

/**
 * §21/§22 — the FLOATING chrome: the third chrome role, and the first one BOTH worlds
 * declare. A shadow under a card is expression (ranks it against siblings — the app's
 * `surfaces` choice), a shadow under a menu is information (the popup genuinely covers
 * other content, and the cast states "above, not part of") — and facts don't turn off
 * with the style switch (Kushagra, 2026-08-09: "shadow is information"). Elevated reads
 * row 5 — the palette's top, because a floating pane sits above everything, lifted cards
 * included (row 4 shipped first and read too low beside the panel it covers; Kushagra,
 * same day) — with dark's inset rim, surfaceChrome's sentence two rows up. Flat is
 * DERIVED, never a second authored shadow: the same row through `fadeShadow` at the
 * factor below (the §10 transmission precedent), quieter because a flat world states
 * depth rather than simulating it — but never none, because overlap is a fact in every
 * world. v0, judged in the playground in both worlds and both modes.
 */
export const floatingChrome = {
  light: "var(--shadow-5)",
  dark: "inset 0 1px 0 rgb(255 255 255 / 0.05), var(--shadow-5)",
} as const;

/** How much of the floating cast a FLAT world keeps (0..1). Applied to the palette row by
    the generator — one source of shadow truth, the flat value can never drift from the
    elevated one. v0. */
export const floatingFlatFactor = 0.5;

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

/**
 * §19 — the look axis: the resting dress of the one-look families. An app identity chosen
 * once at Theme, never a per-component knob — the same tier as `depth`.
 *
 * It is asked TWICE, of two family groups (`surfaceLook` and `controlLook`, split 2026-08-10;
 * see `lookAxes`), because one answer could not say what every real interface says: a plain
 * card holding filled inputs. Under one axis the two moved together, one neutral step apart,
 * and a filled field on a filled card read as mush. The values below are unchanged by the
 * split — what changed is which of them a single Theme prop can move.
 *
 * The criterion is the border's JOB (decided 2026-08-06): on a control, a border is RANK —
 * Button's `bordered` half-step reorders loudness between call sites and stays a prop; on a
 * one-look family it ranks nothing (a form where one field is louder than the next names
 * nothing), so it is DRESS, and dress belongs to the app. Each family resolves the axis on
 * its own terms — the sentence emphasis already has — which is also the membership law:
 * a family is dressed because its sheet consumes these roles, and only for that reason.
 *
 * `outlined` is the identity: exactly the chrome each family declared before the axis
 * existed, so the default is byte-identical to a world without it. `filled` trades the
 * hairline for a darkened well, one neutral step apart per family — surfaces lightest,
 * fields one darker, marks darkest (Kushagra's hierarchy, 2026-08-06).
 *
 * The field family DID have no hover slots, and the sentence justifying that has since been
 * measured false for one member (audit 2026-08-09). It read "its fill does not move, the
 * border and ring carry its states" — true of a text input, where the ring is a MODE keyed on
 * the caret being inside. Select's trigger is field-shaped and PRESSED: its ring is the
 * skeleton's `:focus-visible`, so it appears for a keyboard and never for a pointer, and the
 * trigger computed rest = hover = press = open, byte-identical across seven properties, with
 * nothing else in the package reading `data-popup-open` on a button. The slots exist now and
 * the pin stays where it was earned: text-field.css and text-area still pin all three sources
 * to the resting fill, so a field a caret enters is untouched, and only the member that is
 * pressed consumes the steps (select.css, law-tested in both directions).
 *
 * The steps are DERIVED, not judged: outlined reuses the surface roles verbatim (the same
 * three the surface and mark families already map), and filled walks the same +1/+2 the two
 * sibling families walk from their own resting step. The dark ladder ends one past the edge
 * step, which is the posture `surface` already ships in dark (fill-active 5, edge 5) — the
 * precedent is what makes this a derivation rather than a fourth opinion. v0 all the same.
 *
 * The FILL values are var() references that bake at the Theme element (§6, substitution-at-
 * declaration) — correct by co-location, because Theme stamps both look attributes beside
 * data-appearance on one element. The BORDERS cannot bake there: the tone system lives on
 * the component ([data-tone], the invalid/disabled remaps, contrast="high"), so outlined's
 * border is `initial` — the role stands down and the consumption site's fallback
 * (var(--tone-border), var(--mark-edge)) resolves AT THE ELEMENT. The material edge's own
 * pattern (§10), reused. Neutral only by the tone-set rule: an accent-tinted value joins as
 * a value on this axis the day a real app wants it, never as a second prop. v0, eye pass
 * pending.
 */
export const look = {
  outlined: {
    surface: {
      fill: "var(--color-surface)",
      "fill-hover": "var(--color-surface-hover)",
      "fill-active": "var(--color-surface-active)",
      border: "initial",
    },
    field: {
      fill: "var(--color-surface)",
      "fill-hover": "var(--color-surface-hover)",
      "fill-active": "var(--color-surface-active)",
      border: "initial",
    },
    mark: {
      fill: "var(--color-surface)",
      "fill-hover": "var(--color-surface-hover)",
      "fill-active": "var(--color-surface-active)",
      border: "initial",
    },
  },
  filled: {
    surface: {
      fill: "var(--dress-surface-fill)",
      "fill-hover": "var(--dress-surface-fill-hover)",
      "fill-active": "var(--dress-surface-fill-active)",
      border: "var(--dress-surface-edge)",
    },
    field: {
      fill: "var(--dress-field-fill)",
      "fill-hover": "var(--dress-field-fill-hover)",
      "fill-active": "var(--dress-field-fill-active)",
      border: "var(--dress-field-edge)",
    },
    mark: {
      fill: "var(--dress-mark-fill)",
      "fill-hover": "var(--dress-mark-fill-hover)",
      "fill-active": "var(--dress-mark-fill-active)",
      border: "var(--dress-mark-edge)",
    },
  },
} as const;

/**
 * §19 — which Theme prop moves which family (split 2026-08-10, Kushagra).
 *
 * The axis was one prop until a screenshot settled it: a white card holding grey filled
 * inputs — the most ordinary form on the web — was unreachable, because `filled` moved the
 * card and the field together, one neutral step apart, and one step is mush. The fix is not
 * new pigment (`look` above is untouched); it is that the question gets asked separately of
 * the two groups a designer actually decides separately.
 *
 * The grouping is the one the code already had. `field` and `mark` move together because a
 * filled input beside an outlined checkbox reads as an accident, not as a statement; `surface`
 * is alone because a card, a menu and a dialog are one kind of thing. Refused on the way:
 * taking the surface family OUT of the axis instead (cheaper, and it delivers the same
 * screenshot — but it forecloses the tinted surfaces `filled` is meant to grow into), and one
 * OBJECT-valued prop (partial overrides would need merge semantics no other axis has, and an
 * inline object literal is a fresh identity every render — the memo bug of 2026-08-06).
 *
 * Both halves keep the same values, so an app that sets both to the same thing is exactly the
 * world that shipped before the split. The both-filled cell is still one step apart and still
 * mush; the split neither causes nor fixes it, and it is on the eye-pass list.
 */
export const lookAxes = {
  surface: ["surface"],
  control: ["field", "mark"],
} as const satisfies Record<string, readonly (keyof (typeof look)["outlined"])[]>;

/**
 * §19 — what `filled` actually paints, PER APPEARANCE. The look block above is one block on
 * purpose (co-location: Theme stamps data-look beside data-appearance on a single element,
 * and a raw `[data-look]` div must resolve under any ancestor appearance), so it can hold
 * only mode-blind mappings. The mode-specific pigment has to arrive by indirection, exactly
 * the way `--color-surface` already carries the seal — which is what these roles are.
 *
 * They exist because sharing one set of neutral INDICES across both modes is a bug this
 * system has now shipped three times. `surfaceColor` records the second instance in its own
 * comment (dark's hover equalled its rest, because the steps were hard-coded for both modes
 * while the dark seal sat at --neutral-2). The look axis was the third and worst: `filled`
 * asked for --neutral-2/3/4 on the surface family, and in DARK those are precisely
 * --color-surface/-hover/-active, so `filled` resolved byte-identically to `outlined` and the
 * axis did nothing but delete the card's border. An index is not a colour; it means the
 * opposite thing in the two modes, and only a per-mode table can say which.
 *
 * The direction is stated rather than implied. In light a higher step is DARKER, in dark it
 * is LIGHTER — so "recessed" and "raised" are opposite arithmetic per mode, and the ladders
 * below are not each other's copy. A filled card is one step off the seal in both modes; a
 * field and a mark sit further from their bed; the TRACK moves the other way from everything
 * else, because a well is the one part that reads as sunk INTO its surface.
 *
 * The edges are deliberately inside `contrastHighBands.border` ([5, 6, 7]). That is what
 * keeps `contrast="high"` reaching a filled component's boundary for free: the role holds a
 * var() reference, the high-contrast pass re-declares those very steps, and substitution at
 * the element does the rest. A softer edge outside the band would have been an accessibility
 * escape that silently stopped working — which is the shape of the defect this replaces,
 * where `filled` set `border: transparent` and left contrast="high" nothing to strengthen.
 *
 * Kushagra's calls, 2026-08-06, judged against the preview's outlined/filled pair: a filled
 * surface KEEPS a border ("filled surfaces can have slight border, but their main pull is
 * filled bg, not border"), so `filled` is no longer a trade — the fill is the signal and the
 * hairline merely softens. v0, eye pass pending.
 */
export const dress = {
  light: {
    surface: { fill: 2, "fill-hover": 3, "fill-active": 4, edge: 5 },
    field: { fill: 3, "fill-hover": 4, "fill-active": 5, edge: 5 },
    mark: { fill: 4, "fill-hover": 5, "fill-active": 6, edge: 7 },
  },
  dark: {
    surface: { fill: 3, "fill-hover": 4, "fill-active": 5, edge: 5 },
    field: { fill: 4, "fill-hover": 5, "fill-active": 6, edge: 5 },
    mark: { fill: 5, "fill-hover": 6, "fill-active": 7, edge: 7 },
  },
} as const;

/**
 * §15 — closed weight set; `light` deferred until something needs it, and `bold` (700)
 * REMOVED 2026-08-09 (Kushagra: "we don't use bold, we shouldn't"). Semibold tops the ladder
 * and every heading rests there; hierarchy is size and the ink roles, both already designed.
 * The token goes with the value — an emitted `--font-weight-bold` nothing may consume is a
 * lever waiting to be pulled by hand, which is the fenced-resource mistake §13 exists to stop.
 */
export const fontWeight = { regular: 400, medium: 500, semibold: 600 } as const;

/** §15 — three family slots. Theme props are the only place a stack is written. */
export const fontFamily = {
  body: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  heading: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

/**
 * §15 — the mono optical correction (2026-08-08, Kushagra; v0 for the eye pass). Mono faces
 * run wider with a taller x-height, so at the same font-size they read a step large beside
 * the body face (GitHub prose sets 85%, Radix Themes 0.9em). Applied to the mono atoms'
 * FONT-SIZE only, in both size arms (inherited and stated) — the line box stays the step's,
 * so vertical rhythm never moves. Rejected: `font-size-adjust` (the principled x-height
 * normalizer, but the right aspect constant depends on which platform font the system stack
 * resolved, which config cannot know).
 */
export const monoScale = 0.925;

/**
 * §15 — the key cap's own factor (2026-08-08, Kushagra; v0 for the eye pass). Kbd left the
 * mono slot the day after joining it: a mono cell draws symbols like ⌘ compact to fit its
 * fixed advance, which is why the command glyph read too small — and the platform sets
 * shortcuts in the UI sans (macOS menus), as does Radix (0.75–0.8em in a padded cap). So
 * the cap wears the BODY family with a deeper discount than the chip's: small glyphs in a
 * roomy cap is what makes a key read as a key rather than as highlighted text.
 */
export const kbdScale = 0.9;

/**
 * §6, §15 — the atom corner (2026-08-08, Kushagra: every sized component's corner scales
 * with it, and the atoms' did not — Code at size 9 wore the same 4px as size 1). The atoms
 * are not on the height ladder, so a control-band pick would hold a fraction of a box they
 * do not have (the fraction wall's sixth instance, caught by inheritance again); their box
 * is a property of their glyphs — the em argument the family already made for padding and
 * the cap floor — so the corner is EM, one designed value per radius level (Radix reaches
 * the same place as `radius-factor * 0.35em`). The raw em text substitutes at USE, so each
 * atom's corner prices against its own font by construction; density never touches it.
 * `full` pills a one-line chip (~half the cap's face). v0 for the eye pass.
 */
export const radiusAtom = { none: 0, small: 0.2, medium: 0.35, large: 0.45, full: 0.75 } as const;
