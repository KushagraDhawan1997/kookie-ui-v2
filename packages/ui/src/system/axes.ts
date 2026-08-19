// The component axis vocabulary (§4, §7, §9, §10) — the closed unions every control speaks.
//
// Moved out of button.tsx 2026-08-06: six components, the public index and the shared layer's
// own laws were importing the system's vocabulary from a component, which inverted §12's
// dependency direction (tokens → system → components). Button declared these first only because
// it shipped first; the vocabulary was never Button's. system/ is where mechanisms live
// (ENGINEERING §2), and a shared type is a mechanism.

import { tones, type ToneName } from "../tokens/color-config.ts";
import { fontSize, fontWeight, space } from "../tokens/config.ts";

/** §4 — an index, not a measurement. Closed, because a scale with an escape is not a scale.
    A value list too, because the laws walk the index and were each spelling it out.

    ONE union across three unrelated ladders, deliberately (decided 2026-08-06): Button and
    the fields read it as the control height index, Card as the surface padding + corner
    index, Checkbox as the mark index. They share a numeral, not a scale — which is exactly
    what "an index, not a measurement" means, so splitting the type would encode in the API a
    sameness the system never promised. */
export const SIZES = ["1", "2", "3", "4"] as const;
export type Size = (typeof SIZES)[number];

/** §7 — the tone families, derived from the config rather than restated (the audit lesson:
    a local literal here kept ladder holes invisible to CI). A component never names a
    colour, only a family; the semantic core plus the basic categorical set live in
    color-config.ts and widen there. */
export type Tone = ToneName;

/** §9 — loudness, three rungs, because a rung that is not visibly distinct is not a rung.
    A value list, not just a union: the laws iterate the rungs, and two law files were
    restating this literal with the same warning comment about restating literals. */
export const RUNGS = ["loud", "medium", "quiet"] as const;
export type Emphasis = (typeof RUNGS)[number];

/** §10 — backdrop defense: three designed thicknesses, like the emphasis ladder. `solid` is
    not a member — it is the seal, the absence of any material (the default, always safe). */
export const MATERIALS = ["solid", "thin", "regular", "thick"] as const;
export type Material = (typeof MATERIALS)[number];

/** The thicknesses that actually paint a veil — `solid` is the absence of one. */
export const GLASS_MATERIALS = MATERIALS.filter((m) => m !== "solid");

/** ENGINEERING §3 — the adornment wrapper's value set. The shared layer keys rules on both the
    attribute's PRESENCE (wrapper layout, icon box, hosted geometry) and its VALUE (the pill
    padding reset, the field's slot inset): a value outside this union would take the first
    family and silently lose the second — a partial, invisible failure. So the spelling is a
    type, not a per-component string literal — and a value list, because the contract law walks
    every sheet and source asserting no other spelling exists. */
export const SLOT_NAMES = ["leading", "trailing"] as const;
export type SlotName = (typeof SLOT_NAMES)[number];

/** §7 — the tone families as a runtime list, derived from the config the way the type is.
    Existed only as a hand copy in two docs files until 2026-08-19; the builder made a
    derivable list load-bearing (its inspector generates from it), which is the "real need"
    the recorded-open export decision was waiting on. */
export const TONES = Object.keys(tones) as ToneName[];

/**
 * EVERY COMPONENT AXIS AND EVERY VALUE IT TAKES — `themeAxes`'s sentence one layer down
 * (2026-08-19, forced by the builder). One lowercase object, because the docs' coverage
 * laws take uppercase value exports as components; the shape mirrors `themeAxes` on purpose.
 *
 * Nothing here is authored: every list DERIVES from the single home that already owns it —
 * the axis lists above, the tone table, and config's type and space scales. `typeSize` and
 * `space` are index lists ("1".."9", "1".."12") because §4's rule is the index, and the
 * resolver's own range check (resolve.ts) is keyed on `space.length` exactly as this is.
 */
export const componentAxes = {
  size: SIZES,
  tone: TONES,
  emphasis: RUNGS,
  material: MATERIALS,
  weight: Object.keys(fontWeight) as (keyof typeof fontWeight)[],
  typeSize: fontSize.map((_, i) => String(i + 1)),
  space: space.map((_, i) => String(i + 1)),
} as const;
