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
 */
export const markSteps = [1, 2, 3, 4] as const;

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
  // A material owns FOUR parts, not one (2026-08-05, Kushagra: blur + a borrowed border reads
  // "cheap"): the body (alpha + filter), its own EDGE (a translucent hairline of light — the
  // opaque tone border on glass was the sticker), the RIM (a top inner highlight; the scene's
  // one light source falls downward, the same model the shadow palette commits to), and
  // SEPARATION (a pane with content behind it is above it — it composes var(--shadow-2) on its
  // own authority, so glass floats even in a flat world). Edge and rim are white alphas per
  // thickness, rising with it: thicker glass catches more light. All v0, judged in the preview.
  // alphaHigh is contrast="high"'s answer per thickness: MORE opaque, never fully — the
  // ladder keeps its three visibly distinct thicknesses, each just defending harder. The
  // near-opaque fallbackAlpha below stays what reduced-transparency means; high contrast is
  // a different preference and gets its own designed row (judged 2026-08-05, Kushagra: the
  // first cut reused fallbackAlpha and collapsed all three thicknesses into one).
  light: {
    thin: { alpha: [30, 38, 46], alphaHigh: [55, 62, 69], filter: "blur(5px) saturate(130%) brightness(1.02)", edge: 0.5, rim: 0.35 },
    regular: { alpha: [64, 72, 80], alphaHigh: [82, 87, 92], filter: "blur(16px) saturate(165%) brightness(1.06)", edge: 0.6, rim: 0.45 },
    thick: { alpha: [88, 92, 95], alphaHigh: [94, 96, 97], filter: "blur(32px) saturate(210%) brightness(1.12)", edge: 0.7, rim: 0.55 },
  },
  dark: {
    thin: { alpha: [38, 46, 54], alphaHigh: [60, 67, 74], filter: "blur(5px) saturate(130%) brightness(0.95)", edge: 0.1, rim: 0.06 },
    regular: { alpha: [71, 78, 85], alphaHigh: [86, 90, 94], filter: "blur(16px) saturate(165%) brightness(0.88)", edge: 0.14, rim: 0.1 },
    thick: { alpha: [92, 94, 96], alphaHigh: [95, 96, 97], filter: "blur(32px) saturate(210%) brightness(0.78)", edge: 0.18, rim: 0.14 },
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

/**
 * §19 — the look axis: the resting dress of the one-look families. An app identity chosen
 * once at Theme (`look`), never a per-component knob — the same tier as `surfaces`.
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
 * fields one darker, marks darkest (Kushagra's hierarchy, 2026-08-06). The field has no
 * hover slots on purpose: its fill does not move, the border and ring carry its states.
 * The FILL values are var() references that bake at the Theme element (§6, substitution-at-
 * declaration) — correct by co-location, because Theme stamps data-look beside
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
    field: { fill: "var(--color-surface)", border: "initial" },
    mark: {
      fill: "var(--color-surface)",
      "fill-hover": "var(--color-surface-hover)",
      "fill-active": "var(--color-surface-active)",
      border: "initial",
    },
    track: { fill: "initial" },
  },
  filled: {
    surface: {
      fill: "var(--dress-surface-fill)",
      "fill-hover": "var(--dress-surface-fill-hover)",
      "fill-active": "var(--dress-surface-fill-active)",
      border: "var(--dress-surface-edge)",
    },
    field: { fill: "var(--dress-field-fill)", border: "var(--dress-field-edge)" },
    mark: {
      fill: "var(--dress-mark-fill)",
      "fill-hover": "var(--dress-mark-fill-hover)",
      "fill-active": "var(--dress-mark-fill-active)",
      border: "var(--dress-mark-edge)",
    },
    track: { fill: "var(--dress-track-fill)" },
  },
} as const;

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
    field: { fill: 3, edge: 5 },
    mark: { fill: 4, "fill-hover": 5, "fill-active": 6, edge: 7 },
    // Darker than the card it is cut into: in light, sunk means further DOWN the ramp.
    track: { fill: 6 },
  },
  dark: {
    surface: { fill: 3, "fill-hover": 4, "fill-active": 5, edge: 5 },
    field: { fill: 4, edge: 5 },
    mark: { fill: 5, "fill-hover": 6, "fill-active": 7, edge: 7 },
    // Darker than the card, which in dark means further UP toward the page, not down it.
    //
    // Step 1, not 2, and the reason is the thumb (2026-08-07). The thumb left the look axis —
    // a grip keeps its identity while the app's dress changes — so it is now the SEAL in both
    // looks, and dark's seal is --neutral-2. A filled rail at 2 would therefore be the handle's
    // own colour again: exactly the 1.000:1 collision the track joined the axis to fix, walked
    // back in through the other door. The rail sits at the page step instead, which reads as a
    // deeper well inside a filled card (itself at 3) and leaves the handle a clear step above it.
    track: { fill: 1 },
  },
} as const;

/** §15 — closed weight set; `light` deferred until something needs it. */
export const fontWeight = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** §15 — three family slots. Theme props are the only place a stack is written. */
export const fontFamily = {
  body: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  heading: "var(--font-body)",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
