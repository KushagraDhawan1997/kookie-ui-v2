"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";

import type { Size } from "../../system/axes.ts";

export type RadioProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  // The same closed edges Checkbox drew, inherited rather than re-argued (§4, §11; LOG
  // 2026-08-06 records each refusal travelling to Radio by name):
  //
  // `children` — the dot is the component's, and the LABEL is a sibling: a mark sits beside
  // its label, and the row that owns them both is what spaces them (the non-negotiable).
  // The working pairing:
  //
  //   <Radio value="pro" id="plan-pro" />
  //   <Text render={<label htmlFor="plan-pro" />}>Pro</Text>
  //
  // Base UI reads the association off the hidden input; a label WRAPPING the radio works
  // with no id at all.
  //
  // `render` — the one element must stay Base UI's root, which owns the hidden input, the
  // group membership and the ARIA. `nativeButton` goes with it: it describes an element
  // `render` could have produced, and reachable it broke Space and the label chain on
  // Checkbox (audit D10).
  //
  // `readOnly` — the platform has no read-only selection control (LOG 2026-08-06: the
  // WHATWG defines the attribute for text fields and deliberately not here; Material and
  // Ant never shipped one). Checkbox refused it and Radio inherits the refusal.
  "children" | "render" | "className" | "nativeButton" | "readOnly"
> & {
  /** §4 — the MARK ladder, the checkbox's index verbatim: `mark(n)` is one line of the label
      beside it, and the diameter is that square's, so a radio and the checkbox above it in a
      form are the same size of thing by construction rather than by two ladders agreeing. The
      painted box leaves the control height ladder; the TARGET does not — it stays a control of
      this size capped at the touch floor (§16). Density never touches it: a mark is content,
      and it grows only where the type it matches grows (§17). */
  size?: Size;
  /** Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /** The honest element: Base UI's root renders a <span> with the input hidden beside it. */
  ref?: React.Ref<HTMLSpanElement>;
};

export type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  // Refused with Radio's own: a read-only GROUP is the same platform absence one level up.
  "readOnly"
>;

/**
 * The shared state for a set of radios (§4, §11): one name, one value, roving focus. Renders
 * Base UI's `role="radiogroup"` div and nothing else — the group owns no layout and no
 * appearance, so stacking its radios is the caller's Stack (`gap="5"`: stacked marks need 12
 * real pixels, §4's spacing rule, and 5 is the smallest index that holds it at every density).
 * `render` stays open — the group is one swappable element, so `render={<Stack gap="5"/>}`
 * is the sanctioned way to make the group BE the layout.
 */
export function RadioGroup(props: RadioGroupProps) {
  return <BaseRadioGroup {...props} />;
}

/**
 * A radio (§4, §11) — the checkbox's shape sibling, and the mark family's second member.
 *
 * Everything structural arrives from the family (system/recipes.css since the third member
 * landed): the box is one line of the label it sits beside, the invisible target is a control
 * of its size capped at the touch floor, the resting identity is the seal and the mark edge,
 * and the ON state is the accent identity §11 assigns every binary control. What is Radio's
 * own is the SHAPE — the one control in the band that IS a circle, because shape is role
 * semantics here (§6): a circular checkbox reads as a radio, and a square radio would read
 * as a checkbox, so the circle holds at every Theme radius level, `none` included.
 *
 * No `tone`, no `emphasis`, no `material` — the Checkbox arguments verbatim (§11 assigns the
 * family its one tone as an identity, not an axis). Selection state is the group's: a radio
 * checks when the group's value matches its `value`.
 */
export function Radio({ size = "2", className, ref, ...props }: RadioProps) {
  return (
    <BaseRadio.Root
      ref={ref}
      className={
        className ? `kui-control kui-mark kui-radio ${className}` : "kui-control kui-mark kui-radio"
      }
      data-size={size}
      // Fixed identity, not API (Checkbox's pattern): the tone indirection needs a family to
      // resolve --tone-solid against for the ON state, and accent is what §11 assigns every
      // binary control. The resting box does NOT read this family — it wears the mark edge,
      // the tone-independent role — which is what keeps "neutral off" true.
      data-tone="accent"
      data-bordered
      {...props}
    >
      {/* keepMounted, for the reason Checkbox records: the resting state must have a glyph to
          hide, motion needs something to animate when it lands, and the DOM keeps one shape
          in every state for a law to assert against. */}
      <BaseRadio.Indicator
        keepMounted
        render={
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden />
        }
      >
        {/* The dot: filled, ~44% of the box — the iOS/Material proportion — centred by the
            viewBox. `currentColor` inherits the APCA-chosen pairing the checked fill sets,
            exactly as the checkbox's tick does. */}
        <circle cx="8" cy="8" r="3.5" fill="currentColor" />
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  );
}
