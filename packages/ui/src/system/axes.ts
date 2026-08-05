// The component axis vocabulary (§4, §7, §9, §10) — the closed unions every control speaks.
//
// Moved out of button.tsx 2026-08-06: six components, the public index and the shared layer's
// own laws were importing the system's vocabulary from a component, which inverted §12's
// dependency direction (tokens → system → components). Button declared these first only because
// it shipped first; the vocabulary was never Button's. system/ is where mechanisms live
// (ENGINEERING §2), and a shared type is a mechanism.

import type { ToneName } from "../tokens/color-config.ts";

/** §4 — an index, not a measurement. Closed, because a scale with an escape is not a scale. */
export type Size = "1" | "2" | "3" | "4";

/** §7 — the tone families, derived from the config rather than restated (the audit lesson:
    a local literal here kept ladder holes invisible to CI). A component never names a
    colour, only a family; the semantic core plus the basic categorical set live in
    color-config.ts and widen there. */
export type Tone = ToneName;

/** §9 — loudness, three rungs, because a rung that is not visibly distinct is not a rung. */
export type Emphasis = "loud" | "medium" | "quiet";

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
    type, not a per-component string literal. */
export type SlotName = "leading" | "trailing";
