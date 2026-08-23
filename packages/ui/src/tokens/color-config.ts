/**
 * §7 — the entire per-system colour input. Two knobs per tone (a hue angle and a chroma
 * shape) plus one lightness ladder per mode, shared by every hue. That sharing is the whole
 * mechanism by which "red step 9" and "blue step 9" read as the same step.
 *
 * Everything here is authored; nothing is a borrowed value. The generator turns it into
 * twelve steps per tone per mode with one law.
 *
 * The boundary with config.ts, declared (2026-08-06): this file holds what the OKLCH
 * generator CONSUMES — hues, ladders, deltas, floors, per-mode step picks. Colour-looking
 * literals the generator never reads (glass alphas, shadow rows, the surface seal) live in
 * config.ts: a value lives by which machinery reads it.
 */

/**
 * The spine. Twelve L values per mode, identical for every hue at steps 1-8 and 11-12.
 * Dark is a separately tuned ladder, not an inversion.
 *
 * Steps 9 and 10 are placeholders: the solid band is hue-aware (below) and overwrites them.
 * The large 8 -> 9 drop is the soft/solid discontinuity, placed on purpose.
 */
export const lightness = {
  // Steps 3-5 darkened .96/.945/.92 -> .95/.935/.91 (2026-08-03, judged by eye): the medium
  // fill read too faint on white. Moved as a band so the 3->4 hover and 4->5 press deltas
  // hold — darkening 3 alone would have collapsed the hover feedback to near zero.
  light: [0.99, 0.975, 0.95, 0.935, 0.91, 0.9, 0.87, 0.82, 0.62, 0.58, 0.52, 0.24],
  // Step 11 sits at .80 rather than .77 because at .77 the destructive text role measured
  // APCA Lc 57 on its own soft fill, under the Lc 60 body-text target. Law-tested below.
  dark: [0.17, 0.196, 0.23, 0.265, 0.3, 0.34, 0.4, 0.49, 0.62, 0.66, 0.8, 0.94],
} as const;

/**
 * The solid band (steps 9, 10, and the generated active state).
 *
 * A fixed L is mud for bright hues: saturated yellow, amber, lime, mint and sky do not exist
 * near L .62. Rather than hand-place those the way Radix does, the band leans toward the
 * hue's own cusp — the lightness at which that hue reaches peak chroma — by a fixed fraction.
 * Deep hues barely move; bright hues rise a long way. Still one law, still generated.
 *
 * `activeDelta` is the uniform L step from rest to pressed, so rest/hover/active are evenly
 * spaced by construction across every hue. Direction is mode-aware.
 */
export const solidBand = {
  light: { cuspPull: 0.9 },
  dark: { cuspPull: 0.9 },
} as const;

/**
 * How far hover and press move the solid, and — the part that matters — in which direction.
 *
 * **Away from the label's own lightness, never a fixed direction per mode.** A fixed rule
 * ("darken in light, lighten in dark") walks a fill toward its label half the time: it put
 * the destructive pressed state at APCA Lc 59 in dark mode, and dropped every dark-labelled
 * bright hue (yellow, lime, cyan) to the low fifties, because pressing darkened a fill that
 * was carrying black text. Moving away from the label makes hover and press *strictly more*
 * legible than rest, so only the resting fill has to clear the target and the interaction
 * states cannot silently fall through it.
 *
 * It also reads correctly: pressed separates further from its label rather than muddying into it.
 */
export const solidStateDeltas = { hover: 0.04, active: 0.08 } as const;

/**
 * Low-chroma solids take a larger step. A chromatic fill separates its states by lightness
 * *and* by the saturation shift that comes with it; a grey has only lightness, so the same
 * delta that reads clearly on blue is invisible on black. Widened until the three states are
 * distinguishable side by side, which is law-tested rather than eyeballed.
 */
export const lowChromaStateScale = 2.1;

/**
 * Step 10's offset from step 9 inside the twelve-step scale. Kept because the scale is the
 * Radix-compatibility surface and step 10 is part of it; the *role* `--accent-solid-hover` is
 * generated from the label-relative rule above and no longer maps to this step.
 */
export const step10Offset = -0.04;

/**
 * The chroma curve, as a **fraction of the chroma actually available at that lightness**,
 * not as an absolute. Absolutes were wrong in both directions at once: every light step of
 * every hue asked for more than the gamut holds and was silently clamped (so the curve did
 * nothing there and hold-L-reduce-C was doing all the work, which is not what §7 describes),
 * while the solid band asked for *less* than the gamut holds — red sat at .17 where sRGB
 * allows .254, which is most of the dullness.
 *
 * Expressed against the boundary, the curve means what it says at every step, no step is
 * silently clipped, and every hue behaves the same way relative to its own possibilities.
 * It also makes P3 a pure config change: widen the boundary and everything follows.
 */
export const chromaCurve = [0.9, 0.92, 0.94, 0.96, 0.97, 0.98, 1.0, 1.0, 1.0, 1.0, 0.8, 0.55] as const;

/**
 * `--accent-label` sits between steps 11 and 12: enough weight to read as a UI label, enough
 * chroma to still say accent rather than ink. 0 is step 11, 1 is step 12.
 */
export const labelPosition = 0.45;

/**
 * Below this vividness a scale cannot carry prominence by saturation, so `--accent-solid`
 * resolves to step 12 instead of step 9 (§7). Keyed on chroma, not on the name "neutral",
 * so a desaturated brand accent is caught too.
 */
export const lowChromaThreshold = 0.18;

/**
 * `contrast="high"` (§7). A Theme-level **accessibility setting**, never a design knob and
 * never a per-component prop: it shifts values, it does not remap which step a role reads.
 *
 * The claim is **as much contrast as each colour permits**, not a fixed shift. Borders and text
 * move toward the extremes and the interaction spread widens, but every band is bounded by what
 * its hue can take: a bright hue's border band already sits at the cusp, so it does not move at
 * all and takes its gain in the text band instead. A band that stays put is the setting working,
 * not failing. The only real failure is a pairing that gets *worse*. A *chromatic* solid is deliberately untouched — that value is the brand
 * colour, it already clears the target by a wide margin, and pushing it would trade the user's
 * hue for contrast they did not need. A low-chroma solid does deepen, because it reads step 12
 * and there is no hue there to protect. Under this setting the label pairings must clear the
 * AAA-equivalent Lc 75 rather than the AA-equivalent Lc 60, which is law-tested.
 */
export const contrastHigh = {
  light: { border: -0.19, text: -0.14, stateSpread: 1.6 },
  dark: { border: 0.17, text: 0.12, stateSpread: 1.6 },
} as const;

/** Steps the high-contrast pass rewrites: the border band and the text band. */
export const contrastHighBands = { border: [5, 6, 7], text: [10, 11] } as const;

/**
 * Bounds the solid band may be pinned into (§7). A supplied brand colour reproduces exactly as
 * step 9 in light mode, but only inside this range: a near-white or near-black "brand colour"
 * was never usable as a solid fill, so it snaps to the nearest usable value instead.
 */
export const solidPinBounds = { min: 0.42, max: 0.92 } as const;

/**
 * The shipped tones (§9). A closed set, which is the first reason the CSS stays small:
 * a semantic core plus a few basic categorical families — six scales, never Radix's thirty.
 * `accent` is the user's brand hue.
 *
 * The basics (LOG 2026-08-04) are colour-as-data vocabulary — tags, calendars, charts,
 * badges — where the colour IS the information and a status name would be dishonest. They
 * are hue-authored, not pinned: the generator places them on the same spine as everything
 * else, which is what makes "blue step 9" and the brand's step 9 read as the same step.
 * The set widens here, by config, when a component forces it; the palette is never
 * pre-shipped.
 */
export const tones = {
  /** Not a brand colour: a hue and a near-zero chroma, which is all a tinted grey is. */
  neutral: { hue: 250, vividness: 0.04 },
  /** The user's brand colour, and it is BLUE again (2026-08-16, Kushagra) — blue's own
      recipe verbatim, so accent ≡ blue by construction and the two cannot drift apart.

      It was GREY between 2026-08-10 and today, and that experiment is worth stating rather
      than deleting: a grey brand meant `lowChromaThreshold` (0.18) routed `--accent-solid`
      to step 12 instead of step 9, so the primary button was near-black in light and
      near-white in dark. Nothing in the generator needed an exception then and nothing
      needs one now — the threshold is keyed on CHROMA, not on a family name, so it simply
      stops applying at full vividness. What the material work made plain is that a brand
      with no chroma has nothing to carry through a translucent veil: on glass the primary
      action arrived as smoke, and every tone in the sweep said something except the one
      that is meant to say the most.

      Either direction is one line: `{ hue: 250, vividness: 0.04 }` is the grey that was
      here, and any `{ hue, vividness }` or `{ color: "#hex" }` works the same way. */
  accent: { hue: 250, vividness: 1 },
  destructive: { color: "#E5484D" },
  blue: { hue: 250, vividness: 1 },
  green: { hue: 150, vividness: 1 },
  /** Pinned, not hue-authored: at hue 55 the generated solid cannot hold an APCA-clearing
      label, while this placed orange passes every law in both modes. */
  orange: { color: "#F76B15" },
  /** Joined 2026-08-05 at vividness 0.9, closing the absence LOG 2026-08-04 recorded. At full
      vividness the resting solid parks ON the gamut cusp, where any lightness move sheds
      chroma past the mud-guard and the states compress to .032 (< the .035 floor). Backing
      off the cusp by 10% is what buys the visible press state — the per-tone vividness knob
      doing its designed job, no law bent, no generator exception. Kushagra judged 0.9 against
      the refused full-vividness row and a Radix-lightness pin in the preview sweep; brighter
      ambers exist only by carrying a pin into dark (declined — this is the one he liked). */
  amber: { hue: 80, vividness: 0.9 },

  /* The semantic core completed (2026-08-05, Kushagra) — success, warning, info join the
     destructive they were always implied by. Each is its OWN family resolving to a pigment
     already judged and law-passed above, not an alias into it: names are meanings, and a
     meaning must stay independently correctable — success can drift toward teal someday
     without green (a colour-as-data name) moving with it. The accent/blue pair set the
     precedent: same hue, two names, two jobs. Gzip absorbs the duplicate scales. */
  success: { hue: 150, vividness: 1 },
  /** Warning is the amber question answered: the day amber earned membership (above) is the
      day warning stopped needing orange as a stand-in. */
  warning: { hue: 80, vividness: 0.9 },
  info: { hue: 250, vividness: 1 },
} as const;

/**
 * The tones that refuse their DILUTED roles (2026-08-23, Kushagra: *"an accent never paints a
 * 'faded' background. Accent is pure. You pick accent, and its the vibrant color you pick.
 * Your loudest buttons get it. Its the medium emphasis button, and quiet on hover, that lose
 * that."*).
 *
 * THE DISTINCTION IS FADING VERSUS PLACING, and it is what makes this a rule rather than a
 * preference. A family's soft rungs are its pigment at 11% alpha — measured, `--accent-soft`
 * in light is 89% page, and in DARK it is not even the same colour (`#001c4b`-ish at 90%
 * against a solid of `#0094fc`). That is a dilution: chroma and identity are what get spent.
 * The INK rungs are not — they hold full chroma and move LIGHTNESS until the hue can be read
 * on the bed it sits on, which is why the ink inverts between modes while the solid does not.
 * So the ink stays, the washes go, and the sentence is one line: accent appears at the top
 * rung or not at all.
 *
 * ACCENT-ONLY, and the asymmetry is the point rather than a special case. The other nine are
 * MEANINGS — a pale red still reads danger, so diluting one costs nothing it was carrying.
 * Accent is an IDENTITY: it is the one family a consumer chooses, and 11% of somebody's brand
 * is not their brand. The repo already half-knew this — `button.browser.test.tsx` and
 * `kbd.browser.test.tsx` both test through `blue` rather than `accent` with the comment
 * "accent is a CONFIGURED identity that may equal any family".
 *
 * The stated cost: `accent ≡ blue` stops holding at these roles. That equality was worth 539
 * bytes and was true by construction while accent was a colour family; it stops being true
 * the day accent becomes a ROLE, which is what this makes it. DECISIONS §11 carries the
 * amendment.
 */
export const undilutedTones = ["accent"] as const;

export type ToneName = keyof typeof tones;
export type Mode = keyof typeof lightness;

/**
 * §7, §11 — the Lc targets the CONTROL EDGE is SOLVED to, per contrast level (decided
 * 2026-08-07, Kushagra; supersedes `markEdgeStep`, the per-mode step picks of 2026-08-06).
 *
 * The control edge is the resting hairline of a control whose identity needs it under the
 * outlined look: checkbox and radio (an unchecked mark IS its border — audit D2), and the
 * field family (an outlined field's fill is the seal it sits on, so its border is likewise
 * all there is). Cards and separators keep the quiet `--color-border`: a card has a body,
 * and its identity does not rest on its edge.
 *
 * SOLVED, not picked, and the dark ring is why (Kushagra: "it is what I would expect to be
 * when high contrast is on"). Light's ladder has a step near the fine-detail tier (9, Lc
 * 58.8) but dark's does not: step 9 misses at 42.1 and the scale folds back before 11, so
 * the nearest passing rung was Lc 66.5 — a third of the way to white, reading as
 * high-contrast at rest. Picking rungs couples the value to where the rungs happen to
 * fall; solving decouples it. The generator binary-searches the neutral recipe's lightness
 * for the value that just clears the target against BOTH the seal and the page, the
 * `--accent-label` precedent (generated between steps for exactly this reason).
 *
 * THE MODE SPLIT (§5, §7 — decided 2026-08-07, Kushagra: "APCA rule checks for high
 * contrast mode, taste over APCA rules in standard"; scope: borders and fills). `normal`
 * is a TASTE value: it happens to sit near an APCA tier today, but no law anchors it to a
 * floor, and the eye pass edits it freely — the number is a knob, the solve merely the
 * renderer that turns it into a hex the ladder cannot supply. The rulers had already split
 * on one hex (the light ring clears its APCA target while measuring 2.44:1 in WCAG 2
 * terms; the pick it replaced measured 3.17:1) — chasing both is chasing neither. `high`
 * is where the floors BIND: law-pinned to `apcaFloors.nonText`, emitted in the
 * contrast="high" scopes — the setting is the conformance surface for WCAG 1.4.11, and the
 * look-border stand-down routes `filled` through these same solved edges. OUTSIDE the
 * split, keeping their standard-mode floors: text, the focus ring, and the invalid edge —
 * signals, not dress. Second clause: taste stays contrast-INFORMED — the suite prints a
 * per-run report of every resting border and fill against its advisory tier, on both
 * meters, to catch how off we are without failing on it.
 *
 * DARK RESTS SOFTER (decided 2026-08-07, Kushagra — the first taste edit the split
 * exists to permit). Equal Lc across modes renders a heavier line in dark: a mid-grey
 * glows against a dark bed (the WCAG 2 meter agrees — the same Lc 46 measures 2.4:1 on
 * white and 6.4:1 on the dark page), and the peers ship dark borders far fainter than
 * light ones. So `normal` is per mode, dark one notch under light; `high` stays
 * mode-invariant, because conformance does not dim with the lights.
 */
export const controlEdgeLc = {
  /** The mark family: high is the tier above fine detail; normal is the v0 taste value. */
  mark: { normal: { light: 46, dark: 30 }, high: 60 },
  /** The field family: a field is a LARGE element (Kushagra, 2026-08-07 — "Text Field +
      Area being much larger than checkbox, they appear very dark"), so its resting value
      sits a tier below the mark's and its high-contrast answer is the fine-detail tier —
      a field under contrast="high" wears what a mark wears at rest, one ladder, offset by
      size class. */
  field: { normal: { light: 31, dark: 15 }, high: 46 },
} as const;

/**
 * §7, §11 — the step the TRACK WELL reads per mode: the low neutral bed a value runs in.
 * Slider's track now; the switch's off-track and the progress/meter tracks when they land —
 * the value-control family's second tone-independent role, minted beside the mark edge (now the solved control edge) for
 * the same structural reason: the off part of a value control is NEUTRAL by §11's own row
 * ("track low, fill accent" — the checkbox's "neutral off" one control over), and a component
 * stylesheet cannot say neutral without naming a family, which the role-not-family law forbids.
 *
 * Deliberately NOT held to the mark edge's non-text floor IN STANDARD MODE: a well is a region
 * the accent fill moves through, not a hairline identity — the slider's state is carried by the
 * fill (accent solid, APCA-passing) and the thumb (mark edge), and every platform ships the
 * remainder subtle (iOS systemFill, Radix gray-a3). Step 4 in both modes, v0 for the eye pass.
 * That is the standing rule's first clause: a resting fill is DRESS, held to no floor
 * (Kushagra, 2026-08-07 — "taste over APCA rules in standard").
 */
export const trackWellStep = { light: 4, dark: 4 } as const;

/**
 * §7 — the same well under `contrast="high"`, which is the rule's SECOND clause: high contrast
 * is the conformance surface, and every resting boundary the user can ask to strengthen must
 * actually move there.
 *
 * The well had no high-contrast answer at all until audit 2026-08-08, and Switch is what made
 * that a conformance hole rather than a taste one. The slider's exemption was argued as "a well
 * is a region the APCA-passing fill moves through" — true of a slider, where the fill and the
 * thumb carry the state. An OFF switch has no fill portion: the well IS the whole control. So
 * `--color-track` was byte-identical across the contrast axis in both appearances, and in light
 * that left a ~1.2:1 track under a white thumb on a white page — a control distinguished from
 * its background by nothing but a 0.1-alpha drop shadow, with no setting a user could reach.
 *
 * Step 6 rather than a solve: unlike the control edge (a hairline, whose one job is its own
 * contrast, so it is binary-searched to `controlEdgeLc`), the well is a REGION, and its
 * neighbours — the accent fill it hosts and the near-white grip that crosses it — are already
 * held to their own floors. What it owes is separation from the page, which a band step gives
 * directly: 6 sits inside `contrastHighBands.border`, so it is itself re-priced under high
 * contrast and the well moves twice. v0 for the eye pass, like its standard-mode sibling.
 */
export const trackWellStepHigh = { light: 6, dark: 6 } as const;

/**
 * §11 — the THUMB's fill per mode, the value-control family's third tone-independent role
 * (decided 2026-08-07, Kushagra: "dark shouldn't be dark"). A grip's one job is to be the
 * most findable object on the rail, and every platform keeps the handle LIGHT in dark mode
 * (iOS ships it white) — ours went dark as a side effect of pinning the thumb to the seal,
 * and a seal-dark handle on a dark rail was nearly invisible. Light keeps the seal; dark
 * takes the near-white end of its own ladder. A role, not a family name at the consumption
 * site — the slider stamps `accent`, so a neutral fill can only arrive this way (the track
 * well's own sentence one part over).
 */
export const thumbFill = { light: "var(--color-surface)", dark: "var(--neutral-12)" } as const;

/**
 * §11, §26 — the ink that pairs with the grip, added 2026-08-19 after the segmented control's
 * audit found the chosen segment's label painted in its own fill.
 *
 * `thumbFill` was designed for grips that carry NO text — a slider's handle, a switch's thumb —
 * and "the most findable object on the rail" sends it near-white in BOTH modes. The segmented
 * control is its first consumer with a label on it, and in dark `--color-thumb` (neutral-12)
 * and `--color-text` (neutral-ink, which IS neutral-12) are the same value by construction:
 * measured 1.00:1, APCA 0.0, and `contrast="high"` moves neither. A blank pill where the
 * current value should be.
 *
 * Both entries are values the generator has ALREADY solved, not new judged colours. In light
 * the grip is the seal, so its ink is the seal's ink. In dark the grip is neutral-12, which is
 * exactly what `--neutral-solid` resolves to for a low-chroma family — so `--neutral-contrast`
 * is already the APCA-chosen pairing for this fill, minted for it and reused rather than
 * re-solved. Stated per mode because the fill it answers to is stated per mode.
 */
export const thumbLabel = {
  light: "var(--color-text)",
  dark: "var(--neutral-contrast)",
} as const;

/**
 * The APCA floors (§7) — WCAG-anchored, so NOT taste numbers: body is the AA-equivalent Lc 60
 * every label pairing must clear, aaa the Lc 75 `contrast="high"` raises it to, nonText the
 * Lc 45 floor for the focus ring and the invalid edge (WCAG 1.4.11's territory). WHERE they
 * bind changed 2026-08-07 (the mode split, above): resting borders and fills answer to taste
 * in standard mode, so nonText binds a control edge only in the contrast="high" scopes; text
 * and the two signal roles keep their standard-mode floors. One home because the generator
 * READS them (the state-direction flip is gated on the label law) and the laws assert
 * against them — and they were spelled five separate times across the two. Lowering one is
 * an accessibility decision, not tuning; a law pins the values themselves.
 */
export const apcaFloors = {
  body: 60,
  aaa: 75,
  /** APCA's fine-detail non-text tier — thin lines, pictograms. The WCAG 3:1 equivalent. */
  nonText: 45,
  /** APCA's tier for LARGE/solid semantic non-text. A big element is identifiable with less
      boundary contrast than a small one; the guidance says so explicitly, and it is why a
      field's border and a checkbox's ring are held to different floors (2026-08-07). */
  nonTextLarge: 30,
} as const;

/**
 * The mud-guard (§7): states keep at least this fraction of the resting chroma, which is what
 * stops an excursion from washing a hue out or driving it olive. This is the number the amber
 * decision reasons about by name (LOG 2026-08-05 — the cusp halts travel at .032 against the
 * .035 floor, refused by .003) and it lived as a local const inside the state solve.
 */
export const chromaFloor = 0.75;

/**
 * The ink ladder's TARGETS (§7, §15; rewritten 2026-08-10, Kushagra, measuring the shipped
 * rungs by eye: *"there's not a lot of contrast difference between the three"*).
 *
 * The rungs are stated as contrast, not as picked steps or picked percentages, and every
 * family reaches them the same way: its own loud ink faded toward transparent, by an amount
 * SOLVED per family per mode. That is the `--accent-label` / `--control-edge` precedent, and
 * it is what removes the last exception here — neutral used to take designed steps (12/11/10)
 * while every chroma family faded a fixed 74/52%, so the two answered different questions and
 * neither answered "how much contrast". Measured before the change, on a card: light ran
 * 103 / 78 / 65 and dark 94 / 67 / 36 — in light the top rung sat twice as far from the middle
 * as the middle sat from the bottom, which is the unevenness the eye caught.
 *
 * **Loud is not solved.** It stays the family's one designed text colour (neutral 12, a chroma
 * family's 11) and measures ~103 light / ~94 dark; Kushagra's call, and the right one — that
 * value is the accessible resting state for reading, and solving it would put the system's
 * most-used ink at the mercy of a target number.
 *
 * The two solved rungs, and what they are FOR (this half is the design, not the arithmetic):
 * - `muted` at 60 — exactly `apcaFloors.body`, which is not a coincidence. This is the rung
 *   for text that is real information said quietly: a placeholder, a panel's group label, a
 *   timestamp. It lands on the reading floor rather than under it.
 * - `faint` at 30 — `apcaFloors.nonTextLarge`, and BELOW the reading floor on purpose. It is
 *   the exception rung: a menu option that cannot be chosen, something deliberately stood
 *   down. Never a reading-length line, and never a placeholder — that was the role's old job
 *   and it moved up to `muted` the day these targets landed.
 *
 * Solved against the HARDER of the two beds the ink sits on (the seal and the page), the way
 * `solveControlEdge` already is, so the target is a floor on both rather than an average. The
 * cost is stated rather than hidden: the fade is an alpha, so ink on a FILLED card composites
 * against a bed it was not solved for and reads slightly under target. That is the same trade
 * the ink fade already made, and the per-run contrast report is where it stays visible.
 */
export const inkLc = { muted: 60, faint: 30 } as const;

/* `edgeHoverMix` LIVED HERE 2026-08-10 → 2026-08-17 (the boundary-hover step for the two
 * pinned-fill families) and left with the rule that consumed it: the fill-first flip gave
 * fields and marks designed fill steps, hover became one step in one currency, and a config
 * value no rule reads is a lever waiting to be pulled by hand (the `bold` removal's own
 * sentence). DECISIONS §8 records the reversal. */

/**
 * The per-mode step the focus ring and the invalid edge read (§8) — the third and first
 * members of the family the control edge completed: a role whose job is a contrast guarantee
 * against the page picks its step per mode, because dark's solid band cannot keep the promise
 * (step 9 on a near-black page is |Lc| 22, the shipped WCAG 2.4.11 failure of 2026-08-03;
 * step 11 is the band designed to be legible against the page). `solid` rather than a number
 * in light: the ring IS the brand colour where the brand colour already clears the floor.
 */
export const focusRingStep = { light: "solid", dark: "11" } as const;
export const invalidEdgeStep = { light: "solid", dark: "11" } as const;
