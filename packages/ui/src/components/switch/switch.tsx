"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import * as React from "react";

import type { Size } from "../../system/axes.ts";

export type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  // The same closed edges Checkbox drew and Radio inherited (§4, §11; LOG 2026-08-06) —
  // each refusal named in DECISIONS as travelling to Switch:
  //
  // `children` — the thumb is the component's, and the LABEL is a sibling: a mark sits
  // beside its label, and the row that owns them both is what spaces them (the
  // non-negotiable). The working pairing:
  //
  //   <Switch id="wifi" />
  //   <Text render={<label htmlFor="wifi" />}>Wi-Fi</Text>
  //
  // Base UI reads the association off the hidden input; a label WRAPPING the switch works
  // with no id at all.
  //
  // `render` — the one element must stay Base UI's root, which owns the hidden input, the
  // form association and the `role="switch"` ARIA. `nativeButton` goes with it: it
  // describes an element `render` could have produced, and reachable it broke Space and
  // the label chain on Checkbox (audit D10).
  //
  // `readOnly` — the platform has no read-only selection control (LOG 2026-08-06: the
  // WHATWG defines the attribute for text fields and deliberately not here). DECISIONS
  // named the switch as the same question the day Checkbox refused it, and it takes the
  // same answer.
  "children" | "render" | "className" | "nativeButton" | "readOnly"
> & {
  size?: Size;
  /** Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /** The honest element: Base UI's root renders a <span> with the input hidden beside it. */
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * A switch (§4, §11) — the mark family's fourth member, and the SHIFTED one.
 *
 * Its track is mark(n + 1): one index up the family ladder, the identity every peer system
 * arrives at by hand (Radix's switch heights are their checkbox ladder moved up a step;
 * Material's track is 32 against an 18 checkbox). The shift lives in the shared size join,
 * so this component never states a size — and everything else arrives from the family too:
 * the invisible target is a control of its size capped at the touch floor, the ON state is
 * the accent identity §11 assigns every binary control, and the checked capsule catches the
 * elevated world's light through the family's own loud-rung rule.
 *
 * What is the switch's own: the capsule (role semantics — a round grip can only nest in a
 * curve, §6), the OFF state as a WELL (`--color-track`, the role minted with Slider whose
 * definition names this consumer — an off switch is the channel the thumb has not crossed,
 * not a small surface you read), and the thumb (`--color-thumb`, the grip role, casting
 * always like the slider's). With the well and the grip it leaves the look axis whole, the
 * slider's own sentence one control over: an instrument, shaped by what it does.
 *
 * No `tone`, no `emphasis`, no `material` — the Checkbox arguments verbatim (§11 assigns
 * the family its one tone as an identity, not an axis). A switch COMMITS immediately where
 * a checkbox waits for submit — which is a product semantics choice for the call site, never
 * a pointer response (§4's own note on why coarse never swaps one for the other).
 */
export function Switch({ size = "2", className, ref, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      ref={ref}
      className={
        className
          ? `kui-control kui-mark kui-switch ${className}`
          : "kui-control kui-mark kui-switch"
      }
      data-size={size}
      // Fixed identity, not API (Checkbox's pattern): the tone indirection needs a family to
      // resolve --tone-solid against for the ON state, and accent is what §11 assigns every
      // binary control. The resting box does NOT read this family — it wears the track well,
      // the tone-independent role — which is what keeps "neutral off" true.
      data-tone="accent"
      data-bordered
      {...props}
    >
      <BaseSwitch.Thumb className="kui-switch-thumb" />
    </BaseSwitch.Root>
  );
}
