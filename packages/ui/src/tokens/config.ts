/**
 * The authored token config. Every value in tokens.css derives from this file plus
 * the generator's laws — these are the only raw pixel constants in the system
 * (DECISIONS.md §12: raw px constants -> base scale -> semantic tokens).
 *
 * Step counts differ per family on purpose: each is set by that family's dynamic
 * range and perception, never copied across families (§6, "three count ceilings").
 *
 * EVERY NUMBER HERE IS A JUDGED TASTE VALUE (2026-08-23, Kushagra: *"Ive judged everything
 * we have so far"*). The values were designed, then looked at in apps/docs `/preview` and
 * `/matrix` and changed where the eye said so — which is what almost every dated entry in
 * CLAUDE.md records. Individual sites used to carry "v0, for the eye pass", written when the
 * eye pass was expected as one discrete event at the end; it never happened that way, it ran
 * continuously beside each component, and forty copies of the same stale claim is the
 * near-duplication this project deletes on sight. Stated once, here: these are taste, they
 * are one config line each, and they move whenever the eye says they should. Where something
 * genuinely has NOT been in front of a judgment, the site says so in its own words.
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
 * size 4 into a capsule. The surface band is an AUTHORED ladder per level — small is
 * unmoved, medium was re-priced 2026-08-19 and large came from the 2026-08-17 lab port, so
 * size 3 reads 8 / 24 / 40 rather than the old flat 8 / 16 / 24. (Corrected 2026-08-26,
 * audit: this claimed the band still anchored size 3 at each level's old flat value "so the
 * default card never moved", which both level rows below already contradict in their own
 * comments.)
 */
export const radiusLevels = {
  none: { steps: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], full: 0 },
  small: { steps: [0, 2, 3, 4, 5, 6, 5, 6, 8, 10, 12], full: 9999 },
  // Medium's surface half re-priced 2026-08-19 with the level LADDER judgment (Kushagra:
  // "small to medium jump is less compared to medium to large" — the default card read
  // 8 → 16 → 40, +8 then +24): 12/18/24/30/36, even +6 treads, puts the default card at
  // 8 → 24 → 40 — balanced +16 jumps. Medium's old size-3 anchor (16, the pre-lab flat
  // corner) retires the way large's did in the lab port. Small is judged fine and unmoved.
  medium: { steps: [0, 4, 6, 8, 10, 12, 12, 18, 24, 30, 36], full: 9999 },
  // The surface band (steps 6-10) is EVEN since 2026-08-19 (Kushagra, the Card manual
  // audit's first ladder judgment): 24/32/40/48 for the card sizes, 56 for the overlay-only
  // top, equal 8px treads. The lab port's band (20/25/40/45/50) held the lab's two judged
  // cells exactly (mini card 25, card 40 — drawn × 0.62, the lab's own engine-fallback
  // ratio, under the 1.613 corner knob) and extrapolated the rest — judged per CELL, never
  // as a LADDER, and as a ladder it ran +5/+15/+5: the bottom pair read alike, the top pair
  // read alike, four sizes read as two. Size 3 keeps the lab's 40 (the one card actually
  // judged at card scale); size 2 gives up its lab anchor to the ladder. Values are the
  // ARC (Safari) rendering; squircle engines scale by the knob, so the ratio holds in both.
  large: { steps: [0, 6, 8, 12, 14, 16, 24, 32, 40, 48, 56], full: 9999 },
  // The surface band caps at `large`'s values rather than medium's: capping lower would
  // make cards squarer as the dial turns up, which is what the level ladder must never do.
  full: { steps: [0, 9999, 9999, 9999, 9999, 9999, 24, 32, 40, 48, 56], full: 9999 },
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
 * rule.
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
 * law-tested, with size 4 down 33% from what shipped.
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
   * size 2 anchors near the target the same way the height ladder's own size 2 does.
   */
  readonly rowInset: readonly [number, number, number, number];
};

/**
 * §16 — the coarse geometry. Fine and coarse are two complete designed renderings of the
 * control family, the way light and dark are two renderings of colour: same index, same laws,
 * different placed values. The signal is what touches the screen (`pointer: coarse`), never
 * width.
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
 * §16 — the WCAG 2.2 SC 2.5.8 *Target Size (Minimum)* floor, Level AA, and the system's one
 * tier-1 locked number: "No designed cell in any pointer world at any density may fall below
 * it." Distinct from `touchTargetMin` above, which is SC 2.5.5's AAA/HIG figure and is a
 * tier-2 opt-out default rather than a floor.
 *
 * CHANGES 2026-08-26: minted because the floor was prose. §16 says the DESIGNED geometry
 * carries it and needs no runtime reserve — true of every control on the height ladder, and
 * false for the one family that leaves it. `.kui-floating-rows .kui-row` stands the skeleton's
 * `min-height` down to `auto` so a menu row can wear the designed row inset instead of a
 * control height, and at fine + compact + size 1 that sum is 16 + 2 + 2 = 20. This is NOT the
 * `max()` reserve §16 dropped: that one made a control's layout box differ from its painted
 * box (and so demanded a second element). This floors the painted box itself, so the two stay
 * identical and the row is genuinely 24 tall.
 */
export const targetMin = 24;

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
export const fontSize = [12, 14, 16, 18, 20, 24, 32, 44, 64] as const;
/** Paired designed values, not a derived ratio: ~1.5 through reading sizes, tightening toward ~1.1 at display. */
export const lineHeight = [16, 20, 24, 26, 28, 32, 40, 52, 70] as const;
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
 * wrong: an iPad in landscape rises and keeps its 64px display, and a narrow desktop window
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
   *  drift apart. It keeps the 48rem the band already had, and it is the ONE number in
   *  this file nobody has sat at and judged: its sibling below was judged by eye on
   *  2026-08-05 and this one was inherited. A shell exists now, so it is judgeable. */
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
 * own doubled entry at the bottom.
 */
export const iconSize = {
  fine: [16, 16, 20, 24],
  coarse: [20, 20, 24, 24],
} as const satisfies Record<"fine" | "coarse", readonly number[]>;

/**
 * §4, §8 — the STROKE a glyph is drawn at (2026-08-23, Kushagra: the icons "are too thin, we
 * need to find a way to match icons appropriate to what it needs. It needs to work with
 * regular typeface. Usually 1.75 stroke width works").
 *
 * **The report was "too thin"; the defect was that ONE number meant TWO weights.** Every glyph
 * in the repo said `strokeWidth="1.5"` — the seven the package draws itself, and the three in
 * the docs app — and they did not render alike, because a stroke is stated in VIEWBOX units
 * and the two sets are drawn on different grids:
 *
 *   package glyph   16 viewBox, 16px box -> scale 1.000 -> 1.50px painted
 *   Hugeicon        24 viewBox, 16px box -> scale 0.667 -> 1.00px painted
 *
 * So a select's chevron has been painting 50% heavier than the Hugeicon in the button beside
 * it since the day the docs installed an icon set, and the thin half is what Kushagra is
 * looking at. Raising the shared literal to 1.75 would have widened that gap, not closed it:
 * the package's own glyphs would have gone to 1.75px against the Hugeicons' 1.17px.
 *
 * What is constant is the PAINTED stroke, so that is what this states. `iconStroke` is the
 * number for the ecosystem's grid — 24, which Lucide, Hugeicons, Heroicons, Phosphor and
 * Feather all draw on — and `glyphStroke` converts it to the 16 the package's own glyphs use.
 * Both land on the same painted weight in the same box, which is the guarantee.
 *
 * **`iconStroke` is public, and that is the point.** §8 ships no icon set, so the glyphs beside
 * ours belong to whatever set the app installed, and a chevron that does not match them is the
 * one mismatch a consumer cannot fix from the outside. The system states the weight it draws
 * at; the app passes it to its own set.
 *
 * Why 1.75: it is v1 KookieUI's own settled number, in every documented example, and the
 * ecosystem brackets it (Heroicons and Hugeicons ship 1.5, Lucide and Feather 2). A nominal
 * stroke is not apparent weight — a font stem is rasterized with stem darkening and an SVG
 * stroke is not — so this is an eye value, not an arithmetic one, and no arithmetic is offered
 * for it.
 *
 * Neither rides the size index. A stroke lives inside the viewBox, so it already scales with
 * `iconSize` above: one number, four painted weights.
 */
export const iconGrid = 24;
/**
 * The stroke width for icons drawn on a 24-unit grid, which is what every icon set ships.
 *
 * It is public because this package ships no icon set: an app brings its own, and a chevron that
 * does not match the glyphs beside it is the one mismatch a consumer cannot fix from outside.
 * Pass this to your icon component and its weight will match the package's own. It does not ride
 * the size index — a stroke lives inside the viewBox, so it already scales with the box.
 */
export const iconStroke = 1.75;

/**
 * The same painted weight, restated for the 16-unit viewBox the package's own glyphs use. A
 * derivation rather than a second judged number: if the two were both hand-set they would
 * drift, which is the defect this pair exists to end.
 */
export const glyphStroke = (iconStroke * 16) / iconGrid;

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
 * at 4pt against a 28pt thumb for the same reason. Judged in the preview.
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
 * outside it, so a bar and a rail still read as the same kind of line. Judged in the
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
 * went back to the family's square (audit 2026-08-08). Judged in the preview.
 */
export const switchW = [34, 40, 44, 48] as const;

/**
 * §4 — the switch thumb's inset from its track, one designed value. The pre-scoping's own
 * sentence ("the THUMB is that track minus a designed inset") made literal: thumb diameter
 * = track − 2 × inset, all sizes, both worlds. Deriving the inset from the mark ladder was
 * tried on paper and refused: thumb = mark(n) reads as an identity but the coarse band's
 * 4/5 collapse drives the inset to ZERO at size 4 — a thumb flush with its track — so the
 * inset is the designed constant and the diameter is what derives.
 */
export const switchInset = 2;

/**
 * §26 — the segmented control's channel inset: the gap the track keeps around the segment it
 * carries. The thumb's diameter derives from it (segment height = track − 2 × inset), exactly
 * as the switch's does, so the gap is designed once and the box is what follows.
 *
 * It is numerically `switchInset` and it means the same thing — a grip sitting in a channel —
 * and it is deliberately NOT shared yet. This repo's rule is that the second member of a
 * family self-keys and the THIRD promotes (the field family on TextArea, the mark family on
 * the slider thumb): a shared inset would want a family name (`gripInset`), and renaming
 * `switchInset` to earn it is a change to a shipped token with one consumer. When a third
 * channel-and-grip control arrives, the promotion is the rename, and this entry goes with it.
 *
 * 2 rather than a pick from `slotInset` (3/3/4/4 fine default), which is the hosted-control
 * inset and would be the obvious reuse: a segment is a control hosted in a control, so the
 * rule fits — but `slotInset` is designed for a control hosted in a control that has a BORDER
 * between them, and it lands the segment at 24 in a 32 track where iOS holds 28. The track
 * here is an edgeless well (the switch's own argument, §19), so the inset is all the
 * separation there is and it prices tighter.
 */
export const segmentInset = 2;

/**
 * §26 — the tab rule: the thickness of the bar that marks the active tab, one designed value
 * for every size and both pointer worlds.
 *
 * One value rather than a ladder, for Progress's reason exactly (§11): the thickness a rule
 * needs to read as a rule is a perception floor, not a proportion of the box above it, and
 * the ladders that exist price fractions of boxes a tab does not have — `--slider-track-N` is
 * a quarter of the MARK, and a tab has no mark. Separator's shape instead: one thickness,
 * extent from the tab it marks.
 *
 * 2 rather than `--border-width`'s 1, because the rule is a SIGNAL and the hairline under it
 * is dress — a 1px accent line sitting on a 1px neutral line reads as a colour change in the
 * same object rather than a mark on top of it. Judged in the playground.
 */
/**
 * §45 — the toolbar group's well: the gap the capsule keeps around the controls it holds.
 *
 * A `ToolbarGroup` is the segmented control's track with no selection in it — an edgeless well
 * that hosts N controls — so the geometry is §4's hosted-control rule and the inset is the only
 * designed number: the hosted box is the group minus two of these, exactly as a segment is.
 *
 * It is numerically `segmentInset` and `switchInset` and it is deliberately its own constant,
 * on `tabInset`'s argument one entry down: those two are the wall of a channel a GRIP sits
 * in, and this is the wall of a container around plain buttons. Three facts that
 * agree on a number today and have no reason to move together — the promotion rule ("the second
 * member self-keys, the third promotes") is about one fact reaching a third consumer, not about
 * three unrelated 2s.
 */
export const toolbarGroupInset = 2;

export const tabRule = 2;

/**
 * §26 — how far a tab stands OFF the rule it sits on (2026-08-23, Kushagra: the tabs "have the
 * same height as controls, and so they touch the tab lines, when there should be that offset,
 * making the tab hover area smaller, so 28px instead of 32").
 *
 * A tab shipped riding the full control height, so its box ended exactly on the hairline: a
 * hovered tab's fill ran into the line, and the bar read as one welded object rather than as
 * labels standing on a rule. The bar keeps the ladder — a tab bar must still stand level with
 * the controls in the row it sits in — and the TAB is what shrinks, symmetrically, so the
 * label stays centred and the gap exists at the top as well (a tab that only cleared the line
 * below would sit visibly high in its own bar).
 *
 * The precedent Kushagra named is the segment, which is 28 in a 32 track by exactly this
 * subtraction, and it is the same number: 2. Deliberately NOT `segmentInset` reused, and this
 * is the one place that distinction is worth writing down — `segmentInset` is the wall of an
 * edgeless WELL around a grip, priced tighter than `slotInset` for that reason (see its own
 * entry), while this is clearance between a label's box and a line it must not touch. Two
 * facts that agree on a number today and have no reason to move together; the promotion rule
 * ("the second member self-keys, the third promotes") is about one fact reaching a third
 * consumer, not about three unrelated 2s.
 */
export const tabInset = 2;

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

/* Every state change is instant, so this file carries no durations, easings or springs. Motion
   was removed 2026-09-20; docs/archive/motion-v1.md records it. */

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
 * device (§10). Judged against the photo backdrop in the preview.
 */
/**
 * The GLINT's shape (§10, 2026-08-24): the specular is a BAND of light on the bezel, not a
 * hairline. The band is the bezel itself — one geometry, two renderings: the displacement map
 * bends the backdrop across it, and this mask lets the mode's own ring conic light it, peaking
 * at the lip and feathering inward at `falloff`. Colour and intensity stay in the ring tokens
 * (per mode, per thickness, solved at the element), which is what keeps the map colourless and
 * an appearance flip correct with no JS. kube.io's specular is the method's source (credited):
 * theirs is confined to ~1-2px; iOS's reads wider, which is what `band` prices. Its second
 * consumer — the generator's flat-band gradients for the bare textarea — died 2026-08-25
 * with the TextArea wrapper; the hook (the mask and the rim clip) is the one reader now,
 * and this stays in config because the numbers are judged, not because they fan out.
 */
export const glint = {
  /** the band's width as a fraction of the rung's bezel. 0.5 since 2026-08-25 (Kushagra) —
      judged back DOWN from 1.5 on the bench: the wide band read as a wash, and the light
      belongs at the lip. 1.0 since 2026-08-27 (Kushagra, the bench's band dial at 2x),
      judged AFTER the bezel narrowed 4x the same day: the whole lip lights now, and in
      pixels the band is still narrower than the 0.5 it replaces was on the old lip
      (3-6.5px against 6-13). The wash verdict was about pixels, not the fraction.
      The lip widened back to 12/18/26 on 2026-09-17 and the band went with it. Narrowing it
      to 0.3 was built and reverted the same day — the edge he was reading on menus was the
      lens's bend, not this band. */
  band: 1.0,
  /** feather: alpha = (1 - t)^falloff across the band — HIGHER hugs the lip tighter, with a
      longer soft tail. 2.2 read as haze on a plain ground; 3 was the correction; 4 with the
      wider band (same day, same feedback) keeps the mass at the edge while the reach grows. */
  falloff: 4,
  /** saturation of the displaced backdrop re-emitted inside the rim (kube's 4-9 range; the
      edge catches the content's own colour, not only white light). Chromium-only, because it
      lives in the lens filter. SHIPS OFF — judged the day it was built (2026-08-24, Kushagra:
      "the one thing I have issue with is rim saturation, Id like it off"); at 0 the stage is
      never built, and the bench's dial is how it comes back for a look. */
  rimSaturate: 0,
} as const;

export const material = {
  // THE MIRROR PASS (2026-09-21, Kushagra: "this doesn't look glass ... Thick glass with a lot
  // of refraction + blur"). SUPERSEDES the clear pass below on every number it names:
  //   - The BLUR LEFT THESE ROWS. `filter` carries saturation and brightness only; the blur is
  //     `lens.<rung>.blur` in refraction.tsx and runs INSIDE the lens filter, BEFORE the bend.
  //     The stylesheet's chain is `lens, then filter`, so a CSS blur here lands after the
  //     displacement and erases the bend it paid for — measured: a 12px bend under blur(4px)
  //     drew no visible lip at all. `frost` is the lens-less engines' row and keeps its blur,
  //     at the values judged for those engines (8/16/24, controls 4/8/13.7, regions 12/20/28).
  //   - Veil 12/16/22% light and 20/28/36% dark (states +6), saturation 150/165/180%,
  //     brightness 1.06 light and 1.02 dark. Judged over the photograph, countryside and
  //     pattern beds and the docs' own theme popover, both appearances.
  //   - A REGION'S ×1.5 BLUR MOVED WITH IT: `regionBlur` in refraction.tsx. It lived in the CSS
  //     row; dropping it on the way would have been a silent change to the shell panes, the
  //     sheet and the composer, which nobody judged that day.
  //
  // THE CLEAR PASS (2026-09-17, Kushagra: "its not glass, its a fancy blur. I want glass,
  // clear, clean thick transparent glass"). The veil, the blur and the saturation were what
  // read as frost, so all three came down and the LIP took the thickness (refraction.tsx):
  // veil 2/4/6% light and 8/12/16% dark, blur 3/4/5px on panes and 1.5/2/2.5 on controls,
  // saturation 115/120/125%. Brightness went UP (light 1.12-1.14, dark 1.04-1.06), because a
  // clear pane over a scrim otherwise takes the scrim's grey. Each number was judged in the
  // playground over the pattern bed and a thin dialog over a photograph; 1.2 brightness and
  // blur 1/1.5/2 were both tried and walked back. The `frost` rows keep their blur and now
  // share everything else with the clear row — one material rendered two ways. Some of the
  // prose below describes the frost-era numbers; this paragraph and the rows are current.
  //
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
  // `edge` and `sheen` are white alphas per thickness, rising with it: thicker glass catches
  // more light. All judged in the preview. `sheen` is the rim's — the rim is three background
  // layers (grain, bloom, sheen) and this one number prices the two that are light, the bloom
  // deriving from it. There is NO separate `rim` alpha: the 1px top edge line it used to
  // price was deleted 2026-08-17 when the conic ring took the edge, and the six orphaned
  // numbers were deleted with the sentence that described them (2026-08-26 audit — they had
  // read as a live tuning lever for nine days, in the one file whose header promises that
  // every number here moves something).
  //
  // THE SEAM WHERE ELEVATION MEETS THE MATERIAL (§10, decided 2026-08-07 — the four-worlds
  // frame applied to glass; what makes blur read as substance is light RESPONDING to it):
  // what a pane CASTS is the app's shadow TRANSMITTED: glass passes light, so its shadow is
  // the surface row faded by
  // `transmission` (thin passes most, thick least; the generator derives the faded rows
  // from the palette, so there is still exactly one source of shadow truth).
  // alphaHigh is contrast="high"'s answer per thickness: MORE opaque, never fully — the
  // ladder keeps its three visibly distinct thicknesses, each just defending harder. The
  // near-opaque fallbackAlpha below stays what reduced-transparency means; high contrast is
  // a different preference and gets its own designed row (judged 2026-08-05, Kushagra: the
  // first cut reused fallbackAlpha and collapsed all three thicknesses into one).
  //
  // RE-PRICED 2026-08-20 (Kushagra): "the rule isn't make everything even more high
  // contrast, it's ensure a baseline across" — so the row RAISES A FLOOR, which means the
  // rung furthest from it moves furthest. The old row did the opposite and the numbers say
  // so: thin moved least (+21 light, +8 dark) while regular moved most (+33 / +19), so the
  // gap between thin and regular nearly DOUBLED under the setting (15 -> 27 light,
  // 15 -> 26 dark) instead of closing, and thick landed at 94-97% — solid in all but name,
  // spending the material's identity on the rung that needed help least.
  //
  // Now thin travels furthest (+38 / +24) and thick least (+21 / +10), the gaps compress to
  // 8 and 6, and thick stays glass at 86 / 90. The three rungs are still three — the
  // monotonicity law walks every column and would fail on a collapse — they are simply
  // three defended things rather than three degrees of defence. Judged in the
  // playground.
  /* CONTROL-scale material (lab 2026-08-14, Kushagra: "control surfaces need their own
     parameters"; ported 2026-08-17). A 40px pane is not a 210px card: the card's blur turns
     a small window to mud, and its veil prices milk the label ink doesn't need. So the row
     re-prices `alpha` and the filters, and NOTHING ELSE: a control has no sheen of its own,
     because the pane's wash is a floodlight on a coin — a control's rim is grain and the
     edge catch alone (`rim(0)`, generate.ts, with the measurement that settled it: a loud
     accent button under the pane recipe went pale blue with a halo). What a glass control
     does carry is the louder rungs' wash, and that is `controlWash` below, not a per-
     thickness number. The six `control.sheen` values that sat here reached no output and
     were deleted with this sentence (2026-08-26 audit). Values are the lab's EFFECTIVE
     numbers (written × the frost dial and mode knobs), the extraction rule every material
     number in this file already follows. filterHover: on glass, hover is LIGHT, not a fill
     step — the veil holds and only brightness moves (lab 2026-08-14, "hover mode looks
     weird": the quiet-hover was laying an opaque pastel over the pane). */
  /* THE PANE ROW DID NOT MOVE, and the branch that proposed moving it is why this sentence
     exists (merged 2026-09-18). It raised the pane veils to 40/56/70 light against the
     pre-clear 34/49/65, on a real finding — a muted line over the photograph was the weakest
     text on the page — but it was built the day before the glass became CLEAR (§10,
     2026-09-17), so its whole ladder argues against a row that no longer exists. The MECHANISM
     came across and the values did not: the veils here are the clear ones, judged, and the
     region below is derived from them rather than from the branch's. The legibility finding is
     NOT closed by that choice — it is the first thing to check in the bench, and if it holds,
     the answer is the region's own alpha, not a denser pane. */
  /* REGION-scale material (2026-09-18, Kushagra: a composer, a popover, a shell sidebar "need
     opaqueness that is more than buttons, and we generally need more glass around edges for
     these too because these are bigger areas"). The third scale of ONE material — the same
     oak, a thicker slab: a region holds paragraphs you must read over scrolling content, so
     its veil is denser and its blur reaches further, and its lip is wider (`lensScale` in
     refraction.tsx multiplies the bezel). NOT a thickness rung — a region at thin is still
     thin, and there is still no rung above thick. One alpha (a region is never pressed).
     Members stamp `kui-region`: the shell panes, Sheet, Composer. DERIVED, not judged: the
     alpha is the pane's own top rung (its pressed value), so a resting region is as dense as
     a pressed pane and the ladder reads control < pane < region with no invented number; the
     frost is the pane's + 4, and the lensed blur is the pane's × 1.5 (`regionBlur` in
     refraction.tsx since 2026-09-21, when the blur moved into the lens — THE MIRROR PASS above). Every one of those is a first cut
     for the bench. */
  light: {
    thin: { alpha: [12, 18, 24], alphaHigh: [72, 77, 82], filter: "saturate(150%) brightness(1.06)", frost: "blur(8px) saturate(150%) brightness(1.06)", sheen: 6, control: { alpha: 14, filter: "saturate(150%) brightness(1.06)", frost: "blur(4px) saturate(150%) brightness(1.06)", filterHover: "saturate(150%) brightness(1.02)", filterLoud: "saturate(190%) brightness(1.04)" }, region: { alpha: 24, filter: "saturate(150%) brightness(1.06)", frost: "blur(12px) saturate(150%) brightness(1.06)" } },
    regular: { alpha: [16, 22, 28], alphaHigh: [80, 84, 88], filter: "saturate(165%) brightness(1.06)", frost: "blur(16px) saturate(165%) brightness(1.06)", sheen: 9, control: { alpha: 18, filter: "saturate(165%) brightness(1.06)", frost: "blur(8px) saturate(165%) brightness(1.06)", filterHover: "saturate(165%) brightness(1.02)", filterLoud: "saturate(190%) brightness(1.04)" }, region: { alpha: 28, filter: "saturate(165%) brightness(1.06)", frost: "blur(20px) saturate(165%) brightness(1.06)" } },
    thick: { alpha: [22, 28, 34], alphaHigh: [86, 89, 92], filter: "saturate(180%) brightness(1.06)", frost: "blur(24px) saturate(180%) brightness(1.06)", sheen: 12, control: { alpha: 24, filter: "saturate(180%) brightness(1.06)", frost: "blur(13.7px) saturate(180%) brightness(1.06)", filterHover: "saturate(180%) brightness(1.02)", filterLoud: "saturate(190%) brightness(1.04)" }, region: { alpha: 34, filter: "saturate(180%) brightness(1.06)", frost: "blur(28px) saturate(180%) brightness(1.06)" } },
  },
  dark: {
    thin: { alpha: [20, 28, 36], alphaHigh: [76, 80, 84], filter: "saturate(150%) brightness(1.02)", frost: "blur(8px) saturate(150%) brightness(1.02)", sheen: 2, control: { alpha: 22, filter: "saturate(150%) brightness(1.02)", frost: "blur(4px) saturate(150%) brightness(1.02)", filterHover: "saturate(150%) brightness(1.08)", filterLoud: "saturate(180%) brightness(1)" }, region: { alpha: 36, filter: "saturate(150%) brightness(1.02)", frost: "blur(12px) saturate(150%) brightness(1.02)" } },
    regular: { alpha: [28, 36, 44], alphaHigh: [84, 87, 90], filter: "saturate(165%) brightness(1.02)", frost: "blur(16px) saturate(165%) brightness(1.02)", sheen: 3, control: { alpha: 30, filter: "saturate(165%) brightness(1.02)", frost: "blur(8px) saturate(165%) brightness(1.02)", filterHover: "saturate(165%) brightness(1.08)", filterLoud: "saturate(180%) brightness(1)" }, region: { alpha: 44, filter: "saturate(165%) brightness(1.02)", frost: "blur(20px) saturate(165%) brightness(1.02)" } },
    thick: { alpha: [36, 44, 52], alphaHigh: [90, 92, 94], filter: "saturate(180%) brightness(1.02)", frost: "blur(24px) saturate(180%) brightness(1.02)", sheen: 4, control: { alpha: 38, filter: "saturate(180%) brightness(1.02)", frost: "blur(13.7px) saturate(180%) brightness(1.02)", filterHover: "saturate(180%) brightness(1.08)", filterLoud: "saturate(180%) brightness(1)" }, region: { alpha: 52, filter: "saturate(180%) brightness(1.02)", frost: "blur(28px) saturate(180%) brightness(1.02)" } },
  },
  /** How much of the app's shadow a pane lets survive (§10's transmission seam): glass
      passes light, so its cast is the surface row FADED — thin passes most, thick least.
      Mode-independent: transmission is a property of the pane, not of the night.

      THE VALUES ARE THE LAB'S, read off its judged alphas 2026-08-17 (regular glass casts
      .08/.09/.08 against the solid card's .1/.11 — a ratio of ~0.8). The 0.35/0.55/0.75
      that stood here were frost-era numbers: with near-clear glass they made a pane cast
      HALF its solid twin's shadow, so the two visibly disagreed on the one bed where the
      convergence rule says they must not. Near-clear stone passes most of the light. */
  transmission: { thin: 0.6, regular: 0.8, thick: 0.9 },

  /* THE RING (lab, ported 2026-08-17): the pane's edge is a 1px conic LIGHT, not a pigment
     hairline — bright facing the light, cool flanks, faint on the shade side, a warm collect
     opposite. Conic, not linear (lab 2026-08-15: a linear gradient cannot wrap a ring — its
     bright band terminates where the corner curves away; a conic's first and last stops
     meet, so there is no seam). The angle is the light model's fixed 165°; the pointer-
     tracked version stays in the lab (JS at interaction time, and a second light model).
     a = facing the light, b = flanks, c = shade side, d = warm collect. */
  /* HOW THE LIP IS LIT (2026-09-11, Kushagra: the edge highlight). `conic` measures the light
     as an angle from the box's CENTRE; `linear` measures it along a DIRECTION, so it is
     constant perpendicular to that direction and a wide pane's top edge is lit evenly along
     its length instead of collecting the catch into a blob at one end. See `linearRing` in
     generate.ts for the geometry and for why the two stop lists are not interchangeable.
     One line; it moves the ring, the glint and both control rows together. */
  lipModel: "linear" as "conic" | "linear",
  ring: {
    /* LIGHT'S SHADE SIDE IS DARK (2026-08-24, Kushagra: a glass segmented control, field and
       card all vanish on a light ground — "if they didnt have that hairline, they would blend
       with background too", pointing at iOS's Edit button and All/Missed control).
       Every stop here used to be WHITE — 0.95 / 0.34 / 0.1 / 0.26 — which is a lit lip
       photographed against a dark room: on a photograph it reads, on the page it is white on
       white and the element has no boundary at all. Dark mode never showed it, because there
       a white lip is the whole story.
       The model is corrected rather than the value nudged: a lip is BRIGHT where the light
       hits it and DARK where it does not, and on a bright ground the shade is what draws the
       edge. So `a` keeps the catch and the other three go to pigment, anchored on the glass
       border this system already designed for light (glassInk.light.border, 0.12). The ring
       composites over the pane's own veil, so the dark arc reads whatever the backdrop is
       doing behind it. */
    light: { a: "rgb(255 255 255 / 0.95)", b: "rgb(0 0 0 / 0.07)", c: "rgb(0 0 0 / 0.15)", d: "rgb(10 5 0 / 0.11)", opacity: 1 },
    dark: { a: "rgb(255 255 255 / 0.7)", b: "rgb(210 230 255 / 0.16)", c: "rgb(255 255 255 / 0.3)", d: "rgb(255 245 235 / 0.14)", opacity: 1 },
  },
  /* The SPECTRAL FOLD IS GONE (2026-08-25, Kushagra — three verdicts in one day: rim-saturate
     off, "dont like this blue band", "text field isnt fixed still"). Thick's ring used to fold
     red/blue split stops into itself (the lab's .l2-thick::after); at 1px on a plain ground the
     blue arc read as a coloured hairline on every thick field and pane, and the band had already
     refused the same stops as pink haze the day before. Every thickness now builds its ring from
     the palette above; the `ringSpectral` table and the generator's spectral branch are deleted
     rather than parked behind a flag (the curtain's rule — a mechanism with no consumer is the
     entropy this repo keeps paying for). */
  /* DARK CONTROLS CARRY MORE SPECULAR, NOT LESS (lab 2026-08-15, Kushagra: "not enough";
     ported 2026-08-24 with the glint) — a small dark pane's rim is most of its evidence, and
     the one ring row was priced for 340px cards, so a dark glass button wore a card's faint
     lip. The lab's judged answer: roughly double the card's dark peaks, still under light's.
     LIGHT has no row here on purpose — a light control's lip is the pane's, the lab never
     split them, and the generator emits the shared value so the two cannot drift. One row for
     all three thicknesses, the lab's own shape (its dark buttons overrode a/b/c/d once).
     NO LONGER DOUBLE (2026-09-21): the pane's dark lip went to 0.7 in the mirror pass — a
     thick slab needs a lit rim, and its shade side catches light too (0.3) — and the controls
     were judged "good as they are" the same day. The law holds what is left of the rule: a
     control's catch is never dimmer than the pane's. */
  ringControlDark: { a: "rgb(255 255 255 / 0.72)", b: "rgb(210 230 255 / 0.22)", c: "rgb(255 255 255 / 0.08)", d: "rgb(255 245 235 / 0.2)" },

  /* THE POOL IS A BEVEL since 2026-09-21 (the mirror pass, Kushagra: "glass doesn't feel
     'thick', it should feel thick"). Five layers, in list order: a crisp 1px catch on the top
     edge, a fainter 1px bounce on the bottom edge, a soft glow under the top edge, the bottom
     shade, and a wide inner rim glow. Two lit edges with shade between them is what reads as
     a slab with depth; the three-layer pool below read as a film. Controls take the same five
     at half the reach. LIGHT HAS FOUR: its bottom shade was judged out the same day ("it looks
     dirty at the bottom in light mode, that gray gradient there is not good") — on a light
     pane a black wash is dirt, where on a dark one it is depth, so dark keeps it. The history below describes the pool this replaced.
     THE POOL was three layers from 2026-09-17 (the clear pass): the bottom shade, a soft inner
     rim glow (22px on panes, 10px on controls), and a 1px top catch. With the veil gone the
     glass had nothing left saying it has a body; the glow gathers light at the rim so the
     centre can stay clear. An all-edges DARK shade was tried in its place and reverted the
     same day — it read as a vignette, not as glass.
     THE POOL (lab, ported 2026-08-17): the shade that settles at a pane's bottom INSIDE it —
     matter, not elevation, so it lives in both depth worlds and joins the cast in the one
     box-shadow list. Surfaces take the card geometry, controls the button's. The SOLID
     surface's pool is its seat line (light only — lab's dark solid has none): the crisp
     1px settle under an opaque slab. */
  pool: {
    // The SOLID seat is DEAD (2026-08-17, Kushagra): paired with the contact shadow it drew
    // two lines hugging the bottom edge — the "double line" on every elevated solid card.
    // The lab's .l2-solid does carry it, but at the app's card sizes the two never merge the
    // way they do on the lab's 340px specimen, and the doubled edge is worse than the lost
    // seat. The GLASS pools stay: soft inner washes, not lines.
    light: { surface: "inset 0 2px 1px -1px rgb(255 255 255 / 0.95), inset 0 -2px 1px -1px rgb(255 255 255 / 0.6), inset 0 6px 10px -4px rgb(255 255 255 / 0.5), inset 0 0 18px 2px rgb(255 255 255 / 0.22)", control: "inset 0 2px 1px -1px rgb(255 255 255 / 0.95), inset 0 -2px 1px -1px rgb(255 255 255 / 0.6), inset 0 3px 5px -2px rgb(255 255 255 / 0.5), inset 0 0 8px 1px rgb(255 255 255 / 0.22)", solid: "0 0 0 0 transparent" },
    dark: { surface: "inset 0 2px 1px -1px rgb(255 255 255 / 0.45), inset 0 -2px 1px -1px rgb(255 255 255 / 0.2), inset 0 6px 10px -4px rgb(255 255 255 / 0.1), inset 0 -16px 24px -14px rgb(0 0 0 / 0.4), inset 0 0 18px 2px rgb(255 255 255 / 0.06)", control: "inset 0 2px 1px -1px rgb(255 255 255 / 0.45), inset 0 -2px 1px -1px rgb(255 255 255 / 0.2), inset 0 3px 5px -2px rgb(255 255 255 / 0.1), inset 0 -8px 12px -8px rgb(0 0 0 / 0.4), inset 0 0 8px 1px rgb(255 255 255 / 0.06)", solid: "0 0 0 0 transparent" },
  },
  /** §10 — the SOLID pane's own lighting (2026-08-17, measured off the lab's .l2-solid):
      matte per the lock — grain plus ONE sheen washing down to 55%, no bloom, no 1px top
      catch. It had been borrowing the regular GLASS rim (bloom + 45% sheen + a 0.52 white
      catch line), which is a glass recipe: in dark the catch stacked on the old inset
      rim-light and drew the "weird boundary" double edge, and in light the bloom read as a
      glow no matte slab has. Percent sheen alphas, the glass cells' own unit.

      Dark went 10 → 6 (2026-08-30, Kushagra: the dark card is "too light at the top" —
      measured, the sheen nearly doubled the lip's luminance, L≈27 body to L≈50). 6 keeps
      the solid-over-thick-glass relation light already has: light solid 30 over thick's
      25.5 is ~1.18×, and dark thick's 4.95 × 1.18 ≈ 6. One line to tune. */
  sealSheen: { light: 30, dark: 6 },
  /** §10 — the GROUND's own lighting (2026-08-26). A ground stood down its lighting WHOLE on
      2026-08-21 because one ingredient was wrong: the grain is a fixed white overlay, so it
      lifted a dark ground by 0.042 against tonal steps of ~0.011 — four times the whole
      ladder. Deleting the recipe deleted the concept along with the offending value, and what
      was left is the only opaque box in the library with no light on it at all.

      It is lit as what it IS: a ground is a RECESS — a hole in a plane, which is why it casts
      nothing — so the light from above is blocked at its top wall and reaches its floor. That
      is the same inversion the ring already states for a raised lip (bright top, shade bottom),
      and applying the pane's own direction here would light a dent as if it stuck out.

      **IT LIGHTENS AND NEVER DARKENS (2026-08-26, Kushagra: "I wanted the recess to be
      communicated by not darkening the top band ... keep that darker tone as what it is right
      now, but lighten up the rest").** The first cut painted the wall as a black wash over the
      fill, which reads as a band laid ON the box rather than as the box being recessed —
      loudest exactly where the box is small, because the band is a fixed distance and a code
      well is 130px tall where a page region is 600. So there is no dark layer at all: the
      ground's own colour IS the wall, showing at the top edge where nothing lightens it, and a
      single white wash lifts everything below it. One gradient, one number per mode.

      **`--color-ground` is deliberately NOT moved to do this**, and the reason is not
      aesthetic: since the 2026-08-26 audit that value is a BED in the high-contrast edge solve
      (`color.test.ts` measures the solved control and field edges against the page, the seal
      and the ground). Baking the wall into the token would move a conformance input to buy a
      taste change. The wash is where taste belongs.

      **What this costs, stated because it bounds the values:** lightening-only has very little
      headroom in either mode. In light the page is pure white, so the whole range from the
      ground to the page is 0.033. In dark the ground sits only 0.011 under the card it holds,
      and lifting the floor past that would put the cards DARKER than the ground holding them —
      the inversion §10 records as the reason the ground is an absolute pair. So the dent here
      is shallower than a darkening one could be, by construction, and a law holds the floor
      under the card rather than trusting the number.

      NO GRAIN. That is the 2026-08-21 finding kept rather than re-argued — a bed has no tooth,
      and the measurement that condemned it has not changed.

      The ramp is stated in PIXELS: it is the depth of a wall, a fixed physical distance, and a
      ground can be a whole page region where a percentage would turn it into a half-screen
      wash. Values are taste, one config line each. */
  groundRim: {
    light: { lift: 40, liftTo: 14 },
    dark: { lift: 0.5, liftTo: 14 },
  },
  /** §10 — the WASHES a glass CONTROL's louder rungs keep (lab, rendered values 2026-08-17):
      the pane-minus-wash rule holds for the box itself, but the lab's grid gives the filled
      rungs their own light — loud sheen 10, medium 8 (bloom rides at ×1.4 in the recipe);
      dark a whisper. Quiet is bare and keeps nothing. Emitted as bloom+sheen gradient pairs
      (--material-control-wash-*) that the loud/medium glass arms point --kui-ct-light at. */
  controlWash: { loud: { light: 10, dark: 4 }, medium: { light: 8, dark: 3 } },
  /** Where backdrop-filter is unavailable or transparency is reduced: near-opaque, still a mix
      so a whisper of the backdrop survives where that is safe. */
  fallbackAlpha: 95,

  /** The ON-GLASS alpha (§10, 2026-08-16): what a member paints when a pane below it already
      spent the backdrop. Glass does not stack, so this element must not filter — but going
      fully opaque makes it a slab sitting on light, which is what a dialog's Cancel button
      looked like. It keeps the veil and drops the filter, so it reads as part of the pane it
      sits on rather than as a hole in it. One number for every thickness on purpose: it is a
      fact about the element's OWN translucency, and the pane under it has already decided how
      much of the world gets through. */
  onGlassAlpha: 62,
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
 * The shape: compact and comfortable shift steps 1-8 by one; the gutter band (9-12: 48/64/
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
 * same day when the layer arrived: one lever, not two). At default: 16 / 24 / 32 / 40.
 *
 * SHIFTED UP ONE PICK 2026-09-07 (Kushagra: "I like what Surface subscribes to"), the same day
 * the ground's +1 join was deleted. Those two moves are one decision: a ground used to read
 * this ladder one step up, so 16/24/32 were the numbers actually being looked at on every
 * ground on the site, and collapsing the two consumers onto one ladder had to pick which of the
 * two sets of values survived. The ground's did. A Card is what moves — 16 → 24 at the default
 * index — which is also the answer to "spacing seems a bit less" earlier the same day.
 *
 * The top rung is a real 40 rather than the 32 the old arrangement produced: the ground
 * saturated at 4 only because a +1 ran off the end of the ladder, which is an artifact and not
 * a design. */
export const surfacePadding = [5, 6, 7, 8] as const;

/**
 * §10, §22, §23 — the PANEL band: the interior padding of a surface SMALLER than a card, as
 * picks into layout space (the `surfacePadding` sentence at panel scale — density reaches every
 * floating pane through one lever, no set of its own). At default: 8 / 12 / 16 / 24.
 *
 * IT REPLACES `floatingPadding`, one flat pick, on 2026-09-07 (Kushagra: "we need a spacing
 * scale for surfaces that are smaller than cards — popover uses card, command uses menu, command
 * seems to need more and popover seems to need less"). Measured, the library had exactly two
 * answers and nothing between them: a card's 16/24/32/40 and a flat 4. So a popover — a small
 * panel holding one thought — was padded like a document, and a palette standing alone over a
 * dimmed app was padded like a menu item's neighbour.
 *
 * THE VALUES ARE NOT NEW, and that is the argument for them: they are the command palette's own
 * search bar, designed and judged by eye on 2026-09-05 when that bar became a pane and needed an
 * inset that was neither a card's nor a menu's. A band that already exists at one call site is a
 * band, and promoting it is cheaper than inventing a second set of numbers that would have to be
 * judged against it.
 *
 * INDEXED, which reverses `floatingPadding`'s own sentence — "one value and not a size-indexed
 * family: the panel's rows answer the size axis, its breathing room does not". That held while
 * every consumer was a pane hugging rows, where the row's inset does the breathing. It stopped
 * holding the day a popover joined the family: a popover holds CONTENT, its rows are nobody's,
 * and a pane whose whole interior is the caller's has nothing else to answer the index with.
 */
export const panelPadding = [3, 4, 5, 6] as const;

/**
 * §22, §23 — the floating panel's minimum width, raw px through --scale (the switchW
 * precedent: no palette rung lives at this scale). The rendered floor is max(this, the
 * trigger's own width via --anchor-width): a panel is never narrower than the thing that
 * opened it — the size-match argument applied to geometry — and never comically narrow
 * under an icon-only trigger. ≈ shadcn's 8rem. Renamed from menuMinWidth with the padding
 * above.
 */
export const floatingMinWidth = 112;

/**
 * §31, §32 — the TOOLTIP's own inset, a pair of picks into layout space (v0, eye pass
 * pending).
 *
 * A pair rather than one number, and the argument is the row family's own (2026-08-16): a
 * one-line box asks two different questions on its two axes — how much air the LINE gets, and
 * how much the WORDS get — and answering both with one value is what made a trailing chip sit
 * equally off the top and bottom and visibly farther from the end. So block is tighter than
 * inline, which is what every platform's tooltip does.
 *
 * Picks rather than raw lengths, like `panelPadding`: density reaches a tooltip through the
 * layer, so a compact app gets a compact tooltip with nothing designed twice. Index 2 = 4px and
 * index 4 = 12px at default density, which puts a step-2 label in a 28px chip — the proportion
 * shadcn reaches with px-3 py-1.5 at a smaller step.
 */
export const tooltipPadding = { block: 2, inline: 4 } as const;

/**
 * §32 — the tooltip's maximum width, raw px through --scale (the `floatingMinWidth`
 * precedent: no palette rung lives at this scale, and a width is not a rhythm).
 *
 * A tooltip that runs the width of the window is a paragraph, and a paragraph is not a
 * tooltip — this is the cap that makes a long label wrap into a small block instead. v0.
 */
export const tooltipMaxWidth = 240;

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
 * The blur is 8px, which OUT-FROSTS the whole material ladder on purpose (2026-08-17): the
 * judged glass is near-clear at 2.4/4/5.6, because a lens re-states a backdrop where blur
 * only hides it — and a scrim has no lens and no legibility to defend, it has an app to push
 * back. §10's old 12px defense floor is cited nowhere here any more; it was retired the day
 * the lens shipped (2026-08-16), so the ceiling against `thick` is what binds instead.
 * `prefers-reduced-transparency` and `contrast="high"` share one answer: drop the blur, take
 * `fillHigh` (the app goes further back by pigment rather than by defocus).
 */
export const scrim = {
  // THE LAB'S SCRIM (2026-08-17, judged 2026-08-15 in lab2 and never ported): far less
  // pigment than the first cut (0.18/0.32 against 0.4/0.55 — the veil does the readability
  // work, the scrim only states recession), blur 8 with desaturation carrying the push-back,
  // and dark leaning through brightness as well. fillHigh keeps the conformance posture:
  // more pigment, no defocus change.
  light: { fill: "rgb(0 0 0 / 0.18)", filter: "blur(8px) saturate(0.8)", fillHigh: "rgb(0 0 0 / 0.62)" },
  dark: { fill: "rgb(0 0 0 / 0.32)", filter: "blur(8px) saturate(0.8) brightness(0.9)", fillHigh: "rgb(0 0 0 / 0.75)" },
  /** THE WELL — the ground a receding frame goes back INTO (§27, 2026-09-06), and the scrim's
      own idea at its limit, which is why it lives here rather than beside the surfaces.

      A drawer pushes the app back twice over: the scrim dims what is still on screen, and the
      frame itself scales away from the viewer. What that second move REVEALS has to be darker
      than the scrimmed frame or the depth inverts — a bright ring around a dimmed page reads
      as the frame lifting toward you. So it is the scrim's pigment with the alpha spent: the
      same statement ("the app is behind this"), made by the surface the app is no longer
      covering. One value for both modes, because it is the absence of the app rather than a
      shade of it. Not `--color-page`: the page is a colour the library has twice declined to
      own, and this is not the page — it is what is under the page. */
  well: "#0b0b0c",
} as const;

/**
 * §10 — QUIET PAINT ON GLASS IS ALPHA, NOT PIGMENT (lab 2026-08-15, ported 2026-08-17).
 * A pigment grey is an absolute colour: over a bright backdrop an opaque mid-grey is DARKER
 * than what is behind it and the dim semantic inverts — the disabled row read emphasised.
 * On glass, "quiet" must mean "more backdrop through the letters": same ink, less alpha.
 * Stated as a ROLE REMAP on the pane (the system's own pattern for disabled and invalid),
 * so rows, labels, separators, keycaps and plain Text inherit the corrected role with no
 * rule of their own. Solid keeps the pigments: on an opaque panel they are right.
 */
export const glassInk = {
  light: {
    muted: "rgb(0 0 0 / 0.62)",
    faint: "rgb(0 0 0 / 0.42)",
    border: "rgb(0 0 0 / 0.12)",
    disabled: "rgb(0 0 0 / 0.32)",
    wash: "rgb(0 0 0 / 0.05)",
    /* THE GRIP on a pane (2026-08-24, Kushagra: "Week is selected but its barely visible on
       thin, month is hover and its extremely dark, so much more contrast than the selected
       thumb"). The chosen thumb had been painting `wash` — the HOVER value itself — so the
       persistent state and the transient one were one colour by construction and could never
       rank.

       It went WHITE first, on the solid control's relationship (track recedes, grip catches
       light), and that was the ring's mistake one component over: on a LIGHT ground nothing
       is lightened into visibility, because there is no headroom above the pane. Kushagra,
       against iOS's All/Missed: "the selected thumb is still very white, see iOS's" — where
       the selected segment is a subtle GREY, darker than the capsule around it. So light
       draws its grip with SHADE like its ring does, and only dark keeps the catch; each mode
       moves away from its own ground rather than toward one shared idea of "raised".

       Its first shade value was 0.14 and read "too dark" (Kushagra) — iOS's selected segment
       sits a few percent off its capsule, not a visible slab. Light's WASH came down with it
       (0.07 -> 0.05) rather than the grip moving alone: the two are a RATIO, and at 0.09
       against 0.07 the ranking would have been arithmetic nobody could see. The pair holds
       2x. The wash is the same token a glass menu lights a row with, so that got subtler
       too — the same argument, one component over. */
    grip: "rgb(0 0 0 / 0.1)",
    kbdFill: "rgb(0 0 0 / 0.05)",
    kbdEdge: "rgb(0 0 0 / 0.1)",
    kbdInk: "rgb(0 0 0 / 0.58)",
  },
  dark: {
    muted: "rgb(255 255 255 / 0.72)",
    faint: "rgb(255 255 255 / 0.45)",
    border: "rgb(255 255 255 / 0.16)",
    disabled: "rgb(255 255 255 / 0.38)",
    wash: "rgb(255 255 255 / 0.12)",
    /* See light's note. Dark's pane is already dark, so the grip needs less white to stand
       clear of a 12% wash — and too much reads as a lit slab rather than a piece of the
       same glass. */
    grip: "rgb(255 255 255 / 0.26)",
    kbdFill: "rgb(255 255 255 / 0.1)",
    kbdEdge: "rgb(255 255 255 / 0.16)",
    kbdInk: "rgb(255 255 255 / 0.75)",
  },
} as const;

/**
 * §10 — dark FLOATING panes LIGHTEN, they never subtract (lab 2026-08-15, ported
 * 2026-08-17; the system's own "in dark, height is lightness", and macOS dark menus do the
 * same): the veil lifts toward white instead of sinking toward black. Light floating veils
 * are the in-flow veils — only dark splits. `base` is the percent of surface mixed toward
 * white before the alpha mix; alphas per thickness.
 */
export const floatingDark = { base: 88, alpha: { thin: 46, regular: 62, thick: 78 } } as const;

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
 * settings pane (3), a wide editor (4).
 */
export const overlayWidth = [360, 440, 560, 720] as const;

/**
 * §25 — the ALERT's width, one designed raw-px ladder on the size index, and a FIXED width
 * rather than a maximum: an alert's content is closed (title, description, two actions), so
 * its box does not stretch to content the way a dialog's may — the component states the
 * width and the words wrap to it, which is also what makes the 50/50 action row hold its
 * shape. Strictly narrower than the dialog of the same index at every step (law-tested): an
 * alert interrupts with a question, it does not host work. The viewport's gutter still wins
 * on a narrow window.
 */
export const alertWidth = [280, 320, 360, 400] as const;

/**
 * §24 — the gutter between the dialog and the window edge, ONE pick into layout space (the
 * panelPadding sentence at overlay scale). It is what keeps a dialog off the edge on a
 * phone, so it answers density through the layer like every other distance. Index 6 = 24px
 * at default density.
 */
export const dialogInset = 6;

/**
 * §27 — the SHELL's designed pane geometry: the app frame's default widths (and the bottom
 * pane's height), raw px through --scale (the overlayWidth genus: no palette rung lives at
 * pane scale, and a pane's extent is not a distance BETWEEN things, so layout space is the
 * wrong layer). These are DEFAULTS, not a ladder — a pane's width is the app's content
 * speaking, which is why §27 sanctions the raw-number prop as the system's first: the prop
 * overrides by writing the SAME custom property the stylesheet reads (`--kui-shell-w` /
 * `--kui-shell-h`), which is deliberately the whole future resize architecture — a later
 * drag writes where the prop writes, and nothing about this shape is revisited when it
 * lands. Density- and pointer-invariant on purpose: a pane is a room, not a control, and
 * how much of the window a nav column takes is not a breathing-air question. Inherited
 * from v1's judged values.
 */
export const shellWidth = { sidebar: 288, inspector: 320, bottom: 200 } as const;

/**
 * §27 — how far one arrow key moves a resize handle, and the floor a pane may be dragged to.
 *
 * These join `shellWidth` as sanctioned raw numbers for the same reason it is one: a pane's
 * extent has no ladder to consult, so the step across it has none either. The step is a
 * KEYBOARD affordance and nothing else — a pointer drag is continuous — so it is chosen to
 * move a 288px column visibly without needing thirty presses to cross it.
 *
 * `min` is a floor rather than a designed width: below it a nav column stops being able to
 * hold a row's text and the pane becomes a smear the user cannot recover from, which is the
 * failure the 2026-08-16 audit found in the overlay panes and fixed with a cap. An app that
 * wants a different floor states `minWidth`, and an app that wants none still gets this one,
 * because a resize with no floor is a way to destroy a layout by accident.
 */
export const shellResize = { step: 16, min: 160 } as const;

/**
 * §27 — the RAIL is not in the table above, and its absence is the decision (2026-08-20,
 * Kushagra: "Rail is sidebar but thin, and so therefore will have a different layout and
 * anatomy"). The table's own reason for existing — "a pane's width is the app's content
 * speaking" — is true of the sidebar, the inspector and the bottom pane, and false of the
 * rail: a rail's width is its ITEM's box plus the air around it, and nothing else can decide
 * it. Shipped, it was 64 in both pointer worlds while its contents were 32 fine and 44
 * coarse, so the column did not answer the axis its own contents answer — the 2026-08-10
 * icon-box finding one level up. The rule had been argued for three panes and applied to a
 * fourth it does not describe. So the sidebar takes a WIDTH and the rail takes a SIZE, its
 * extent derives in the stylesheet from `--control-height-N`, and 64 stops being a number
 * anybody inherited.
 *
 * THE AIR IS THE PANE'S OWN PADDING (2026-08-21). `shellNavInset` used to state it: 4px,
 * drawn by each nav row and rail square as a MARGIN, because the pane it sat in had no
 * padding to give it. Every pane pads now — Card's own ladder, priced by the index the pane
 * was given — so the row sits inside that padding and the second number is gone. The paint
 * is what the padding insets; the hit area is not (§16's expander, the mark family's own
 * mechanism), so the whole column still takes the press — the expander simply reaches out
 * by the pane's padding instead of by a number of its own.
 */

/**
 * §27 — the floating shell's gap, ONE pick into layout space (the dialogInset sentence at
 * shell scale). Floating IS the gap — panes that are not touching — so the distance is the
 * system's and answers density through the one layer every distance goes through. There is
 * deliberately NO consumer-facing gap prop and no override variable (v1 documented
 * overriding `--shell-inset-gap`, which is how a shell drifts off its own app's rhythm).
 * The stylesheet spends it as HALF on the frame's padding and half on every pane's margin,
 * so the spacing is even by construction — pane-to-pane and pane-to-edge — at every pane
 * combination, including the absent ones (v1 put whole margins on each pane and the
 * doubling between neighbours was a spacing nobody chose). Index 3 = 8px at default
 * density.
 */
export const shellGap = 3;

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
  // SHARP by construction (researched 2026-08-04; anatomy redesigned 2026-08-07, and again
  // 2026-08-16 when the material lab's depth was adopted whole). Every drop row is the same
  // THREE-PART anatomy at a different height:
  //   CONTACT — 0 1px 2px, no spread: the crisp dark line right under the edge, what reads
  //     sharp. Constant across the ladder, because contact does not change with height: an
  //     object either touches its bed or it does not.
  //   DROP — mid offset and blur, negative spread: the body of the shadow, what reads raised.
  //   BLAST — the far, wide, heavily pulled-in reach (up to 32px/80px at the top rung). This
  //     is the layer the palette did not have and the layer the lab's depth is mostly made
  //     of; the old ladder topped out at 16px/32px, less than half this reach, which is why
  //     ported glass read flat beside the lab it came from.
  // Rules that survive every redesign: one light source (x always 0, y grows with the row),
  // negative spread on both reaching layers, depth as offset growth rather than fog.
  //
  // The ladder is ordered by REACH and the chrome roles pick their rung (surfaceChrome takes
  // the top, floatingChrome the middle) — the lab prices a shadow by the size of the box
  // casting it, "a smaller caster owes a smaller shadow, or it reads swollen", and a card is
  // a bigger box than a menu. The palette stays one ordered resource; which rung a family
  // reads is the role's job, which is what the roles are for.
  light: [
    "inset 0 1px 1px rgb(0 0 0 / 0.12), inset 0 2px 4px rgb(0 0 0 / 0.06)",
    // Row 2, the CONTROL rung — the lab's button (5/14, 12/30). Its two edge rules still
    // hold (Kushagra, from the preview: "a dark line at top, a light at bottom"): the
    // contact hugs — no negative spread, so no bright seam opens between the bottom edge and
    // its own shadow — and no reaching layer may cross the top edge.
    "0 1px 2px rgb(0 0 0 / 0.1), 0 5px 14px -4px rgb(0 0 0 / 0.1), 0 12px 30px -8px rgb(0 0 0 / 0.09)",
    // Row 3, the FLOATING rung — the lab's menu (8/22, 18/48).
    "0 1px 2px rgb(0 0 0 / 0.1), 0 8px 22px -6px rgb(0 0 0 / 0.1), 0 18px 48px -14px rgb(0 0 0 / 0.09)",
    // Row 4 — the lab's SOLID card, VERBATIM (2026-08-17, measured off .l2-solid: contact
    // 0.1 + one 24/64 drop at 0.11, no middle layer — the interpolated 10/26 rung that stood
    // here made a solid card read visibly heavier than the lab's, because two stacked drops
    // are darker than one even at matched alphas).
    "0 1px 2px rgb(0 0 0 / 0.1), 0 24px 64px -12px rgb(0 0 0 / 0.11)",
    // Row 5, the SURFACE rung — the lab's card (12/32, 32/80), the deepest thing it casts.
    "0 1px 2px rgb(0 0 0 / 0.1), 0 12px 32px -8px rgb(0 0 0 / 0.11), 0 32px 80px -16px rgb(0 0 0 / 0.1)",
  ],
  // Same geometry — the light source does not move at night — with alpha carrying the load,
  // because a dark page swallows shadow. The lab's dark panels run 0.3-0.4 against light's
  // 0.06-0.11, roughly four times the pigment for the same geometry.
  dark: [
    "inset 0 1px 1px rgb(0 0 0 / 0.5), inset 0 2px 4px rgb(0 0 0 / 0.25)",
    "0 1px 2px rgb(0 0 0 / 0.4), 0 5px 14px -4px rgb(0 0 0 / 0.36), 0 12px 30px -8px rgb(0 0 0 / 0.3)",
    "0 1px 2px rgb(0 0 0 / 0.4), 0 8px 22px -6px rgb(0 0 0 / 0.36), 0 18px 48px -14px rgb(0 0 0 / 0.3)",
    "0 1px 2px rgb(0 0 0 / 0.4), 0 24px 64px -12px rgb(0 0 0 / 0.45)",
    "0 1px 2px rgb(0 0 0 / 0.4), 0 12px 32px -8px rgb(0 0 0 / 0.4), 0 32px 80px -16px rgb(0 0 0 / 0.34)",
  ],
} as const;

/**
 * §5/§10 — the elevated world's dressing, COMPOSED from the palette, never restating it:
 * shadow = elevation, one lighting model, and row 4 is its single source of truth — tune
 * `shadow[..][3]` and every elevated SURFACE follows. (CORRECTED 2026-08-26, audit: this said
 * "row 3 / `shadow[..][2]`" while the declaration eight lines down had read `var(--shadow-4)`
 * since the 2026-08-17 lab port — the same one-revision staleness it had already been fixed
 * for once, when it said `[1]` after the 2026-08-07 renumber. Row 5 is the GLASS transmit
 * source, not this. controlChrome below no longer reads a palette row at all.) The edge is NOT
 * special: elevated
 * surfaces keep the same `--tone-border` as flat ones — which is what keeps them sharp and
 * what lets contrast="high" reach the edge through the tone system, free (two earlier
 * attempts failed: an inset ring painted inside the transparent border and read as two
 * lines; a raw-alpha border went soft and fell outside the contrast system). The top edge
 * stays lighter because the palette's shadows all fall downward. Dark adds the one thing a
 * drop shadow cannot express — the inset top rim-light a dark fill needs. By eye.
 */
export const surfaceChrome = {
  // Row 4, not 5 (2026-08-17, Kushagra, judged against the lab's calm bed): a SOLID card
  // casts the lab's solid row — one 24/64 drop — while row 5's two stacked drops belong to
  // GLASS, whose per-thickness transmitted rows (--surface-chrome-thin/regular/thick) still
  // derive from row 5 and are untouched. Dark's inset rim-light is gone for the same
  // judgment: the lab's dark solid has no rim-light, and stacked with the solid lighting's
  // top catch it doubled into the "weird boundary" line.
  light: "var(--shadow-4)",
  dark: "var(--shadow-4)",
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
 * controlChrome is the cast: the one shadow every solid control shares. AUTHORED WHOLE, not
 * composed from a palette row (corrected 2026-08-26, audit — this said "composed from the
 * palette's control row, never a bespoke value, so escapes reach the same shadow at
 * --shadow-2", which the 2026-08-17 lab port had already made false: the declaration below is
 * the lab's lit rung written out, and its own comment says so). The palette's row 2 survives
 * as the GLASS transmit source only, which is the same division surfaceChrome draws between
 * rows 4 and 5. Dark prepends the rim-light, the surface chrome's own sentence one scale down.
 */
export const controlChrome = {
  // THE LAB'S LIT RUNG, VERBATIM (2026-08-17, Kushagra: "buttons look horrible" — measured
  // against .l2-lit). What stood here was the glass button's palette row plus a white inset
  // rim the lab never wrote: the 12/30 blast layer read swollen on a 32px box and the rim
  // drew a machined line the lab's gradient catch already says better. The lab's solid
  // button is contact + ONE 8/20 drop + a bottom shade folded into the pigment — and the
  // shade is per-rung (medium melts it to 0.04, the fog rule) and per-state (a press
  // tightens the blast toward the page), which is what the `medium` and `active` variants
  // below carry. Dark's lock: no bottom shade, heavier air. The palette's row 2 survives as
  // the GLASS transmit source (--control-chrome-thin/regular/thick), the same division the
  // surface chrome drew between row 4 and row 5.
  light: "0 1px 2px rgb(0 0 0 / 0.1), 0 8px 20px -6px rgb(0 0 0 / 0.16), inset 0 -1px 0 rgb(0 0 0 / 0.12)",
  dark: "0 1px 2px rgb(0 0 0 / 0.4), 0 8px 20px -6px rgb(0 0 0 / 0.42)",
} as const;

/**
 * §10 — which palette row a GLASS pane transmits, per family (2026-08-17). This used to be
 * DERIVED by parsing `var(--shadow-N)` out of the chrome roles, which welded two different
 * facts together: what a SOLID member casts (the lit chrome above, now the lab's literal
 * values) and what a GLASS member lets through (the lab's glass anatomy — the two-drop rows).
 * The weld broke the day the solid chrome moved off its row: the surface transmit would have
 * silently followed it down to row 4. Stated on its own, 1-indexed into `shadow`.
 */
export const glassTransmitRows = { surface: 5, control: 2 } as const;

/** The lit rung's MEDIUM variant (§19's fog rule, lab 2026-08-14: inside a pale pastel the
    0.12 shade read as a drawn line — it melts to 0.04; dark carries no shade, so its medium
    is the resting chrome verbatim). */
/** The lit rung's PRESS variant (lab): a pressed control reads as closer to the page, so its
    blast is tighter than at rest. */
export const controlChromeActive = {
  light: "0 1px 1px rgb(0 0 0 / 0.1), 0 3px 8px -3px rgb(0 0 0 / 0.14), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
  dark: "0 1px 1px rgb(0 0 0 / 0.4), 0 3px 8px -3px rgb(0 0 0 / 0.36)",
} as const;

/**
 * The CATCH half (§19): light from above, painted as a background-image layer over whatever
 * fill the rung chose — tone-independent by construction, one recipe lights every tone.
 * NOT a shadow: flat worlds declare `none`, and a gradient list can hold it where a shadow
 * list cannot (the material rim's own reasoning, §10). The light never moves with state —
 * the fill steps beneath it.
 */
export const controlLight = {
  // THE LAB'S CATCH, VERBATIM since 2026-08-17 (.l2-lit): one white wash falling from the
  // top to 60%, no gradient seat — the seat is the chrome's inset shade, stated once. The
  // two-layer catch+seat that stood here drew its own shelf lines on a pale medium fill.
  // Dark's lock: a near-white fill has little for white light to add, so a whisper.
  light: "linear-gradient(180deg, rgb(255 255 255 / 0.16), transparent 60%)",
  dark: "linear-gradient(180deg, rgb(255 255 255 / 0.07), transparent 60%)",
} as const;

/**
 * The keycap's RELIEF (2026-08-17, Kushagra — the lens applied to Kbd): the pane treatment
 * stopped being the exception and became the base. A bare cap had kept the pre-material
 * identity — a drawn --tone-border plus the full lit control chrome, which reads as a small
 * floating button. A key is pressed INTO the surface it sits on, so its base is the relief:
 * a top-face catch plus a whisper of drop, cap-scale, and an alpha edge instead of a solved
 * hairline. Alpha on purpose — the same values read on any bed, which is what let the pane
 * rule keep only its `none` cast override.
 */
/**
 * The GRIP's cast (2026-08-17, Kushagra: the slider thumb "still reads old") — the two
 * grips (slider thumb, switch thumb) cast ALWAYS by role semantics, and until today they
 * read --control-chrome, which the lab port turned into the lit BUTTON chrome: an
 * 8px/20px blast plus an inset bottom shade, priced for a 32-44px box. Under a 16-28px
 * cap that blast is swollen ("a smaller caster owes a smaller shadow") and the inset
 * shade draws a line inside a white circle. Cap-scale contact + a short drop, per mode;
 * the kbdRelief's sentence one role over.
 */
/**
 * THE DEAD DIM (2026-08-17, Kushagra: "is it a rule we can use elsewhere? minimal entropy")
 * — the disabled treatment for roles OUTSIDE the tone system. Tone roles dim through the one
 * dead palette (the shared disabled remap); the roles minted for role semantics
 * (--color-thumb, --color-track) have no palette row to stand down to, and each had grown —
 * or was about to grow — its own number. One factor, consumed as
 * `color-mix(in srgb, var(--role) var(--disabled-dim), transparent)`: alpha, so the dimmed
 * part recedes relative to its LOCAL ground, the same reason the dead palette went to the
 * alpha ramp the same day. 70 is the judged switch-thumb value; a melt to the tone system is
 * the recorded failure (LOG: one indistinguishable capsule).
 */
export const disabledDim = 70;

/**
 * THE RUNGS ON GLASS (§10, 2026-09-19) — the numbers the glass rung rules in recipes.css had
 * typed inline since the 2026-08-17 lab port. A loud PANE member is its own solid, chroma
 * boosted, at a high alpha (backlit stained glass, not a painted button); a loud member ON a
 * pane keeps its lightness and takes a smaller boost, its alpha stepping with state; a medium
 * member on a pane carries its soft pigment at the lab's judged steps, so hover moves within
 * the rung and never climbs into loud's band. The values are the lab's RENDERED ones (the
 * extraction rule), unchanged by the move — one home now, one config line each.
 */
export const glassRungs = {
  loudPane: { lightness: 1.04, chroma: 1.6, alpha: 0.8 },
  loudOnGlass: { chroma: 1.1, alpha: { rest: 0.88, hover: 0.93, active: 0.96 } },
  mediumOnGlass: { rest: 55, hover: 62, active: 70 },
} as const;

/** The dividers drawn across a control's own fill. The split button's is the label's own ink
    at this share, so one line reads on every emphasis and tone; a joined group's seam across
    a loud fill is the ground at this share, because the full ground reads as a cut. Both were
    inline percentages in their stylesheets until 2026-09-19. */
export const dividerMix = { splitButton: 30, loudSeam: 25 } as const;

/**
 * §8 — the dead palette's alpha steps, PER MODE (2026-08-19). One rule: dead recedes from
 * live, one ramp step under the live wells' RESTING step in its own mode. The single a3 that
 * preceded this table delivered that only in dark (live soft rests at a4 there); in light the
 * live trio rests at a3, so a disabled button's box was byte-identical to a live medium
 * button's and the dead state rode on label colour alone (audit 2026-08-18). The border
 * recedes the same way — the old opaque --neutral-6 out-contrasted a live field's a4 edge in
 * dark, making the one disabled control the strongest boundary on the row.
 *
 * Light's border moved 3 -> 2 on 2026-08-24, WITH the live edge: the field hairline lightened
 * to a3 that day (the `dress` table), which put the dead border exactly ON the live one — a
 * disabled field byte-identical to a live field at the boundary, the mounted laws' own
 * failure. The rule is recession, so the dead border follows the live edge down.
 */
export const disabledSteps = {
  light: { fill: 2, border: 2, ink: 8 },
  dark: { fill: 3, border: 3, ink: 8 },
} as const;

export const gripCast = {
  light: "0 1px 2px rgb(0 0 0 / 0.16), 0 2px 6px -1px rgb(0 0 0 / 0.18)",
  dark: "0 1px 2px rgb(0 0 0 / 0.5), 0 2px 6px -1px rgb(0 0 0 / 0.4)",
} as const;

/**
 * The SCROLLBAR (2026-08-17, with ScrollArea): overlay posture — no drawn track, a capsule
 * thumb floating over content, visible only while scrolling or hovering (macOS's own
 * arrangement). The thumb is a non-tone instrument role over unknown ground, so its fill is
 * the ALPHA ramp (the disabled-dim rule's sibling): it reads on the page, on a dark card's
 * pooled bottom, and on glass, with one number. Size and inset are raw designed px — a
 * scrollbar has no size index (Progress's sentence: no box of its own to ride).
 */
export const scrollbar = {
  /** 7 → 5 (2026-08-26, Kushagra: thinner, package-wide). Judged by eye like every number
      here; the capsule radius derives from it. */
  size: 5,
  inset: 2,
  /** Alpha-ramp steps: resting thumb, and the darker one under the pointer's grip. */
  thumbStep: 6,
  thumbActiveStep: 8,
  /** The scroll-edge fade's reach (2026-08-29, opt-in per ScrollArea): how far content fades
      toward an edge that has more behind it. A MASK length, not a colour — the fade dissolves
      the content itself, so the pane's own fill shows through and one number reads on the
      seal, the ground, glass and a photograph alike. It also bounds the ramp-in: the fade
      grows from nothing over the first `fade` pixels of scrolling, which is what keeps the
      resting edge clean. Judged by eye like everything here; 32 → 48 on 2026-09-07, judged
      against the code wells on the documentation site the day the reach stopped leaking into
      them (see the nesting stand-down in `scroll-area.css`), which is the first day the
      designed number was what those blocks actually rendered. */
  fade: 48,
} as const;

export const kbdRelief = {
  light: {
    edge: "rgb(0 0 0 / 0.08)",
    relief: "inset 0 1px 0 rgb(255 255 255 / 0.4), 0 1px 2px rgb(0 0 0 / 0.1)",
  },
  dark: {
    edge: "rgb(255 255 255 / 0.1)",
    relief: "inset 0 1px 0 rgb(255 255 255 / 0.08), 0 1px 2px rgb(0 0 0 / 0.4)",
  },
} as const;

/**
 * §21/§22 — the FLOATING chrome: the third chrome role, and the first one BOTH worlds
 * declare. A shadow under a card is expression (ranks it against siblings — the app's
 * `surfaces` choice), a shadow under a menu is information (the popup genuinely covers
 * other content, and the cast states "above, not part of") — and facts don't turn off
 * with the style switch (Kushagra, 2026-08-09: "shadow is information"). Elevated reads
 * row 3 — the MENU rung (2026-08-16, adopting the lab's depth: it prices a cast by the size
 * of the box throwing it, "a smaller caster owes a smaller shadow, or it reads swollen", and
 * a menu is a smaller box than the card that now takes the top rung). This reverses the
 * 2026-08-09 read that a floating pane must sit above everything: the palette is ordered by
 * REACH, not by rank, and a panel's authority comes from covering what is under it, not from
 * out-casting a card three times its size. Dark keeps its inset rim, surfaceChrome's
 * sentence two rows up.
 *
 * FLAT CASTS NOTHING — floating panes included (2026-08-19, Kushagra, reversing the
 * 2026-08-09 "coverage is information, never none" amendment and its half-strength fade).
 * The old rule held that a covering pane owes SOME shadow in every world; what retired it
 * is that flat grew its own separation vocabulary the day before — the hairline returns in
 * flat (surfaces.css, 2026-08-19) — so a menu's boundary is drawn in flat's own language
 * and the faded cast was a second voice saying the same thing. The emitted flat value is
 * the list-legal no-op layer, not `none` (a `none` in a fallback chain poisons it).
 */
export const floatingChrome = {
  light: "var(--shadow-3)",
  dark: "inset 0 1px 0 rgb(255 255 255 / 0.05), var(--shadow-3)",
} as const;

/**
 * §10 — the seal: what an opaque surface is filled with. Paper ABOVE the page, never the
 * page itself — a card sealed at --neutral-1 is invisible where it lives most. Light is
 * pure white, and since 2026-08-25 the light PAGE derives from this rest value, so card and
 * page share one white and a card separates by cast or hairline, never by fill; dark steps
 * up the ladder. The Radix panel answer.
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
 * THE GROUND (§10, 2026-08-20) — the second thing a surface can be, and the one the system
 * has been missing since it had surfaces at all.
 *
 * A Card is an OBJECT: it seals, it catches light, it casts. A ground is what an object sits
 * ON — a bounded region of a page that holds cards (the builder's canvas), or a bed inside a
 * card that holds something quieter (a code block, a settings group). Until now every one of
 * those was a hand-painted div picking a raw neutral, a radius and a hairline at the call
 * site, which is how the builder's own canvas ended up with a SMALLER corner than the cards
 * inside it.
 *
 * **It is an absolute pair, not an alpha, and that was measured rather than assumed.** The
 * obvious design is a relative step down from whatever is behind it — one value, adapts
 * anywhere, flips direction by mode for free (the alpha ramp's own property, §7). It is
 * wrong in dark, and the arithmetic says so: dark's alpha ramp is built from white, so a
 * ground over the dark page (--neutral-1, #0f0f10) lands around #161617 while the CARD it
 * holds is --neutral-2 (#141516). The cards would be darker than the ground holding them —
 * the nesting inverted, in exactly the mode where it is hardest to see.
 *
 * **A ground steps OFF the page, away from whichever extreme that mode's page sits against**
 * (2026-08-21, Kushagra, judged on screen; corrected from "darker in both modes"). Down from
 * near-white in light, up from near-black in dark. Both directions of the platform argument
 * were checked and they disagree — Apple's ladders go LIGHTER as you nest deeper in dark
 * (systemBackground #000 → #1C1C1E → #2C2C2E) while GitHub's `canvas.inset` goes DARKER than
 * `canvas.default` — and darker-in-both was taken first, on the reasoning that it makes the
 * word mean one thing.
 *
 * **It was unreachable in dark and shipped as a collapse.** The page is --neutral-1, the last
 * rung there is, so there was nothing below it to step to and the ground was set equal to the
 * page. Light hides this because the card's fill is pure white, which is not on the grey ramp
 * at all — a free step that lets the page sit on rung 1 and still leave rung 2 underneath for
 * a ground. Dark has no equivalent: the card cannot be "pure black", so it takes rung 2, the
 * page takes rung 1, and there is no rung 0. Measured, a dark ground and the dark page were
 * one value, and the region was bounded by its hairline and the pane sheen alone.
 *
 * So dark's ground is now a value BETWEEN the two rungs — midway between --neutral-1 (#0f0f10)
 * and --neutral-2 (#141516) — which is the one place the ladder has room. Light is untouched:
 * it already had room and it already read.
 *
 * The two modes therefore differ in DIRECTION and that is not an inconsistency to tidy away.
 * A page is at an extreme of its own ramp in both, and a ground's job is to step off it; the
 * only direction that exists is away from the extreme, which is down in light and up in dark.
 *
 * **It is an absolute pair, not an alpha**, for the reason measured above — and the collapse
 * does not change that: a relative step still inverts the nesting in dark.
 *
 * Judged like every colour here.
 */
export const groundColor = {
  /* ONE RUNG UP, 2026-08-28 (Kushagra: a light ground "doesnt look good, its 'too' gray").
     Not a taste correction so much as a consequence nobody followed through: the paragraph
     above reasons that light "already had room" because "the page sits on rung 1 and still
     leaves rung 2 underneath for a ground" — and the page STOPPED sitting on rung 1 on
     2026-08-25, when it took the seal's own pure white. The ground stayed on rung 2, so the
     one step it is supposed to be from the page silently became two.

     Measured against dark, which is the mode that was tuned deliberately: a dark ground sits
     0.011 in lightness off its page and reads. Light's sat 0.033 — three times the distance,
     in the mode with a harder ceiling. At --neutral-1 it is 0.013, which is the same order as
     the step dark was judged at.

     THIS MOVES A CONFORMANCE INPUT, which the groundRim note above warns about: the ground is
     a BED in the high-contrast edge solve, so `color.test.ts` re-measures the solved control
     and field edges against it. That is the reason to state the move here rather than paint
     around it in a stylesheet — the solve gets to see it. */
  light: "var(--neutral-1)",
  /* Midway between --neutral-1 (#0f0f10) and --neutral-2 (#141516) — a literal because there is
     no rung there, which is the whole finding. Judged at a quarter of the way (#101112) first
     and it read too dark; the midpoint only became judgeable once the ground stopped wearing
     the pane lighting, because grain and sheen were swamping a 0.011 step (see surfaces.css). */
  dark: "#121213",
} as const;

/**
 * THE PAGE (§10, §13, 2026-08-20) — the ground the library has always presupposed and never
 * named. The seal's own comment calls a card "paper above the page"; until now there was no
 * page, so an app painting its own background reached past the roles and picked a raw palette
 * step, which is the one thing this system forbids everywhere else. apps/docs did exactly
 * that, in the file that judges every other value by eye.
 *
 * **The library still paints nothing**, and that is not a gap either — the page is the app's
 * call, stated twice (LOG 2026-08-09/10). This is a NAME, in the same class as `--shadow-1`:
 * published in the token contract, read by no component, and a law forbids one from reading
 * it. Theme does not apply it; a Theme that painted a background would make every nested
 * appearance scope repaint the page.
 *
 * **One value, not two, and the second was retired before it was written.** The plan carried
 * a pair — a plain page and a darker one for screens made of cards, which is Apple's own
 * split (systemBackground vs systemGroupedBackground, alternating in light and identical in
 * dark). The pair collapsed when `groundColor` landed: a page made of cards is exactly what a
 * ground is, so an app wanting the Settings look paints `--color-ground` and the second name
 * never existed. One fact, one home — and the two roles read as the pair they are: content
 * sits on the page, cards sit on the ground.
 *
 * (This clause used to add "which is the page's own value in dark". That was true only while
 * the dark ground had collapsed onto the page, and it stopped being true on 2026-08-21 — the
 * argument for ONE name never rested on the two being equal, only on their meaning one thing.)
 *
 * THE MODE'S BRIGHTEST GROUND, not a palette step (2026-08-25, Kushagra: --neutral-1's
 * #fcfcfc "reads dull as is"). Light is the seal's own white — DERIVED from
 * `surfaceColor.light.rest`, one home, so the two cannot drift — which means a resting card
 * on the page separates by cast (elevated, the default) or hairline (flat), never by fill:
 * Apple's own light mode, and the collapse dark already accepted for ground-on-page
 * (2026-08-20). Dark stays `--neutral-1`, the palette's darkest step. In each mode there is
 * nowhere further to go, which is what makes it a page.
 */
export const pageColor = {
  light: surfaceColor.light.rest,
  dark: "var(--neutral-1)",
} as const;

/**
 * §19 — the look axis is DELETED (surfaceLook 2026-08-20, controlLook 2026-08-19, both
 * Kushagra). What it governed survives; the PROP is what died, in two steps for two
 * different reasons.
 *
 * `controlLook` died because the fill-first flip (2026-08-17) made its two values
 * byte-identical — fields and marks wear the dress unconditionally, reading the
 * `--dress-field-*` / `--dress-mark-*` roles below directly.
 *
 * `surfaceLook` died because its second value never earned its keep: `filled` (the darkened
 * card, a soft dress edge) shipped 2026-08-06 as a derivation, stayed v0, was never judged
 * and never used by a real screen — while the lab port (2026-08-17) made `outlined` the
 * judged identity: the pane is BORDERLESS at rest, its edge is light (ring on glass, pool
 * and cast on solid), and conformance gets a pigment hairline by stand-down. An axis whose
 * default is the only value anyone has ever seen is a lever every call site can reach and
 * none has needed. Deleting it forecloses the 2026-08-10 "tinted surfaces" future the split
 * was priced on — accepted: a tinted surface identity can return as a Theme value the day a
 * real app wants one, and its return does not need this prop to have survived.
 *
 * What remains in code: the surface family reads its own roles directly (`--color-surface`
 * and its two states), and its resting pigment edge is `--surface-edge: transparent` —
 * emitted in the appearance scopes, stood down to `initial` by the contrast="high" pass and
 * by `depth="flat"` (no light means the line is back), so the consumption fallback
 * `var(--tone-border)` resolves AT THE ELEMENT, where the tone lives. The material edge's
 * own pattern (§10), unchanged.
 */

/**
 * §19 — the fill-first dress, PER APPEARANCE: what a field and a mark rest on. Unconditional
 * since controlLook's deletion (2026-08-19) — these are not an axis's values, they are the
 * two families' resting identity, and the sheets read them directly.
 *
 * Per appearance because sharing one set of neutral INDICES across both modes is a bug this
 * system has now shipped three times. `surfaceColor` records the second instance in its own
 * comment (dark's hover equalled its rest, because the steps were hard-coded for both modes
 * while the dark seal sat at --neutral-2). The look axis was the third and worst: `filled`
 * asked for --neutral-2/3/4 on the surface family, and in DARK those are precisely
 * --color-surface/-hover/-active, so `filled` resolved byte-identically to `outlined` and the
 * axis did nothing but delete the card's border. An index is not a colour; it means the
 * opposite thing in the two modes, and only a per-mode table can say which.
 *
 * The edges owe `contrast="high"` nothing from this table: the HC pass stands
 * `--dress-field-edge` and `--dress-mark-edge` down to `initial`, so the consumption site's
 * fallback (var(--tone-border)) resolves at the element, where the HC declarations have
 * already strengthened the tone borders. (An older sentence here claimed the edges sat inside
 * contrastHighBands.border and were reached by re-declaration — stale since the fill-first
 * flip softened the field edge out of that band, 2026-08-17.) In standard mode a dress edge
 * is DRESS (2026-08-07's rule): taste, held to no floor.
 *
 * The SURFACE family's rows died with `surfaceLook` (2026-08-20): they were `filled`'s
 * pigment, and `filled` was never judged or used. A card rests on the seal and its edge is
 * light (§10, the lab port) — see the §19 note above for what replaced the axis.
 */
export const dress = {
  light: {
    /* Fields: edge softened one step with the fill-first flip (2026-08-17), and one more
       2026-08-24 (Kushagra: "the text field and hairline feel bit darker than they should
       be") — the edge now EQUALS the fill, and the hairline still reads because the border
       area composites the same alpha twice (~13% over a 6.7% fill). The FILL holds at 3,
       pinned from both sides: it went to 2 on 2026-08-17 and CAME BACK ("a bit too light"),
       and it already equals the reference medium button's --neutral-soft in this mode — the
       hairline on top is what pushed the impression past the button. The ramp has no half
       step below (dark's a2 is literally transparent), so a lighter field means moving a3
       itself, a call about the whole ramp rather than this table. */
    field: { fill: 3, "fill-hover": 4, "fill-active": 5, edge: 3 },
    mark: { fill: 4, "fill-hover": 5, "fill-active": 6, edge: 7 },
  },
  dark: {
    field: { fill: 3, "fill-hover": 4, "fill-active": 5, edge: 4 },
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
 * §15 — the mono optical correction (2026-08-08, Kushagra). Mono faces
 * run wider with a taller x-height, so at the same font-size they read a step large beside
 * the body face (GitHub prose sets 85%, Radix Themes 0.9em). Applied to the mono atoms'
 * FONT-SIZE only, in both size arms (inherited and stated) — the line box stays the step's,
 * so vertical rhythm never moves. Rejected: `font-size-adjust` (the principled x-height
 * normalizer, but the right aspect constant depends on which platform font the system stack
 * resolved, which config cannot know).
 */
export const monoScale = 0.925;

/**
 * §15 — the key cap's own factor (2026-08-08, Kushagra). Kbd left the
 * mono slot the day after joining it: a mono cell draws symbols like ⌘ compact to fit its
 * fixed advance, which is why the command glyph read too small — and the platform sets
 * shortcuts in the UI sans (macOS menus), as does Radix (0.75–0.8em in a padded cap). So
 * the cap wears the BODY family with a deeper discount than the chip's: small glyphs in a
 * roomy cap is what makes a key read as a key rather than as highlighted text.
 */
export const kbdScale = 0.9;

/**
 * §15 — the chip's own factor (2026-08-23; v0 for the eye pass). A chip sits BESIDE the
 * thing it marks rather than inside a sentence, and it is secondary to it: the label is what
 * you read, the chip is what you glance at. Small glyphs in a roomy pill are what make that
 * relationship legible, which is the cap's argument arriving at the third atom.
 *
 * It equals `kbdScale` today and is deliberately NOT the same constant — `segmentInset` and
 * `switchInset` set that precedent (§26). Both mean "discount the glyphs so the box has a
 * face", and they are free to diverge the moment either is judged on its own: the cap's is
 * about symbols like ⌘ drawing full-size in the sans, the chip's is about rank.
 */
export const chipScale = 0.9;

/**
 * §11, §35 — the initials' share of the disc (2026-08-31). An avatar's box is one line of
 * the name beside it (`1lh`, the atom box's height), and the INITIALS are drawn at this
 * share of that box — of the box, not of the type step, because the ramp's line ratio falls
 * from 1.33 to 1.107 up the ladder and a constant discount on the step fills the disc at the
 * top while leaving a face at the bottom. Radix parks two letters at half the box; this
 * lands just under. Taste, one home: here.
 */
export const avatarScale = 0.45;

/**
 * §35 — the avatar box past the control ladder (2026-09-15). Sizes 1-4 ARE
 * `--control-height-1..4`, so an avatar stands level with the Button beside it and answers
 * density and pointer the same way; 5-9 continue the ladder in raw px for a face that stands
 * alone. Taste, one home: here.
 */
export const avatarSizes = [56, 64, 80, 96, 128] as const;

/**
 * §35 — how far a later avatar in a group sits over the one before it, as a share of the
 * box (`1lh`), so the overlap grows with the size the way the ring around each face does.
 * Mantine, Chakra and Ant sit near a third of the diameter; a quarter here, judged in the playground 2026-08-31 — at a third the next disc clipped the initials it covered. Taste, one home: here.
 */
export const avatarOverlap = 0.25;

/**
 * §38 — the BADGE's box, as a share of the line it sits in (2026-08-31). A badge is the
 * platform's badge: the count or the dot that waits on a thing until you look. It has no
 * ladder of its own — it is a share of the line beside it, the atom argument — and one number
 * prices both forms: the dot is a disc this tall, the count is a pill this tall. iOS parks its
 * badge near a third of the icon; on a text line a third reads as a speck, so this sits well
 * over half (0.6 was judged too small 2026-08-31). Taste, one home: here.
 */
export const badgeBox = 0.7;

/**
 * §38 — the count's digits, as a share of the LINE (not of the box, so both numbers move
 * against one reference and the eye can move either alone). Taste, one home: here.
 */
export const badgeText = 0.48;

/**
 * §38 — the LIFT that seats the badge's centre on the cap centre, as a share of the FONT SIZE
 * of the line it sits in (2026-09-01, Kushagra: "Badge isnt vertically aligned"; re-based off
 * the line by the ultracode audit the same day). `vertical-align: middle` parks the centre at
 * half the parent's x-height, and the gap to the cap centre is (cap - x-height)/2 — both of
 * them shares of the FONT. The first spelling made it a share of the LINE, which is a
 * different quantity: the ramp's line/font ratio falls from 1.33 to 1.11, so one fraction of
 * the line was right at steps 1-4 (0.2-0.3px out) and 2.41px low at step 9. Measured against
 * the parent font's own cap metrics, 0.095 lands every step of the ramp inside a quarter of a
 * pixel. A relative offset, so it moves the PAINT and the line cannot grow around it. Taste,
 * one home: here.
 */
export const badgeLift = 0.095;

/**
 * §35, §38 — the LINE a badge pinned to an avatar is priced against, as a share of the face
 * (2026-08-31, judged in the playground: a pinned badge that took the face's own line came out
 * 60% of the face and covered the initials). The badge stays a share of its line; the slot
 * hands it a smaller line, so the pinned badge lands near a third of the face — where iOS
 * parks its own — with the badge's numbers untouched. Taste, one home: here.
 */
export const avatarBadge = 0.55;

/**
 * §35, §38 — how far a pinned badge steps PAST the face, per axis, as a share of its slot's
 * line (2026-09-01, Kushagra: the corner badges "feel too inside"). Flush at the corner, a
 * badge's centre sits ~0.065 of the face INSIDE the rim (the corner of a square inscribing a
 * circle); 0.1 of the slot line ≈ 0.055 of the face per axis puts the centre on the rim —
 * where iOS hangs its own — so the disc reads pinned to the face's edge rather than stuck on
 * it. Taste, one home: here.
 */
export const avatarBadgeOut = 0.1;

/**
 * §39 — the breadcrumb's punctuation, as a share of the LINE it sits on (2026-09-01). A
 * breadcrumb is not a control, so the designed icon ladder (`--kui-ct-icon`) prices a box it
 * does not have — the fraction wall's ninth instance, reached by inheritance rather than by
 * arithmetic. A glyph standing between two runs of words is a property of the line those
 * words set, which is the mark family's rule (`--mark-N` IS `--line-height-N`) and the atoms'
 * `1lh` box arriving at a third family.
 *
 * The SEPARATOR alone reads it. The ellipsis was priced here too until 2026-09-01, when it
 * became a real control (an icon-only Button opening a Menu) and its glyph joined the icon
 * ladder every other glyph inside a control takes — which is the right ladder for it, because
 * it now has a control box to hang on where the chevron still does not. Judged against the
 * caps beside it, where a chevron as tall as a capital reads as a control and one at half the
 * cap reads as a comma. Taste, one home: here.
 */
export const breadcrumbGlyph = 0.75;

/**
 * §6, §15 — the atom corner (2026-08-08, Kushagra: every sized component's corner scales
 * with it, and the atoms' did not — Code at size 9 wore the same 4px as size 1). The atoms
 * are not on the height ladder, so a control-band pick would hold a fraction of a box they
 * do not have (the fraction wall's sixth instance, caught by inheritance again); their box
 * is a property of their glyphs — the em argument the family already made for padding and
 * the cap floor — so the corner is EM, one designed value per radius level (Radix reaches
 * the same place as `radius-factor * 0.35em`). The raw em text substitutes at USE, so each
 * atom's corner prices against its own font by construction; density never touches it.
 * `full` pills a one-line chip (~half the cap's face) — which is what Chip and Badge ARE, and
 * what CODE is not: see `atomRadiusFamily` in generate.ts for the one member that holds.
 */
export const radiusAtom = { none: 0, small: 0.2, medium: 0.35, large: 0.45, full: 0.75 } as const;
