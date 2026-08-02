/**
 * §7 — the entire per-system colour input. Two knobs per tone (a hue angle and a chroma
 * shape) plus one lightness ladder per mode, shared by every hue. That sharing is the whole
 * mechanism by which "red step 9" and "blue step 9" read as the same step.
 *
 * Everything here is authored; nothing is a borrowed value. The generator turns it into
 * twelve steps per tone per mode with one law.
 */

/**
 * The spine. Twelve L values per mode, identical for every hue at steps 1-8 and 11-12.
 * Dark is a separately tuned ladder, not an inversion.
 *
 * Steps 9 and 10 are placeholders: the solid band is hue-aware (below) and overwrites them.
 * The large 8 -> 9 drop is the soft/solid discontinuity, placed on purpose.
 */
export const lightness = {
  light: [0.99, 0.975, 0.96, 0.945, 0.92, 0.9, 0.87, 0.82, 0.62, 0.58, 0.52, 0.24],
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
 * The shipped tones (§9). A closed set, which is the first reason the CSS stays small:
 * five or six scales, never Radix's thirty. `accent` is the user's brand hue.
 */
export const tones = {
  neutral: { hue: 250, vividness: 0.04 },
  accent: { hue: 267, vividness: 1 },
  destructive: { hue: 25, vividness: 1 },
} as const;

export type ToneName = keyof typeof tones;
export type Mode = keyof typeof lightness;
