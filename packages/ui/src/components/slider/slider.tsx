"use client";

import { Slider as BaseSlider } from "@base-ui/react/slider";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useControlSize } from "../../system/control-size.ts";

export type SliderProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSlider.Root>,
  // The anatomy is the component's, not the call site's: a slider is five elements (root,
  // control, track, fill, thumb) wired by Base UI, and none of them can move — TextField's
  // argument, with more elements. `children` and `render` go together for that reason.
  //
  // `orientation` is refused rather than passed through: horizontal is the designed
  // geometry — the root rides the control height ladder, the track ladder holds a fraction
  // of the fine mark, and none of those numbers were placed for a vertical box. Vertical
  // ships the day something forces it, as its own designed set (the tone-set rule), not as
  // a prop that renders undesigned geometry today.
  //
  // `thumbAlignment` is a fixed identity, not API: `edge` — the thumb stays inside the
  // track's ends (iOS, Material, Radix all hold the handle inside the rail), and exposing
  // the knob would make the track's endpoints a per-call-site opinion.
  "children" | "render" | "className" | "orientation" | "thumbAlignment"
> & {
  /**
   * The control height ladder, taken on the root, because the root is the control: the whole
   * strip is pressable, so a slider is exactly as tall a target as the Button beside it. The
   * same index then sizes the parts through the families they belong to, with the thumb on the
   * mark ladder. Defaults to 2.
   */
  size?: Size;
  /** Dresses the root. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /**
   * Names the value for assistive technology. It lands on the thumb's hidden range input. Inside a
   * `Field` the field's label wires itself instead. A range slider names both thumbs with the same
   * string, plus Base UI's per-thumb value text. Something that needs "Minimum" and "Maximum" is a
   * composition of a Field and two labelled sliders, not a prop here.
   */
  "aria-label"?: string;
  /** The root div — what `className` and `style` dress. The VALUE is `onValueChange`'s. */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A slider (§4, §11): track low, fill accent, thumb from the mark family.
 *
 * The whole box is the control — the root takes the size index and the control height, so a
 * slider stands exactly as tall a target as the Button beside it (44 on the coarse default
 * path, the 24 floor everywhere, §16) with no mechanism of its own: pressing anywhere in
 * that box moves the nearest thumb. The THUMB is the family's third member — `mark(n)` square,
 * one line of the label's type, a CIRCLE (the capsule tried 2026-08-07 was reverted 2026-08-08,
 * too wide by eye), and resting as every mark rests (its own fill role and the
 * mark edge) — so a slider's handle and the checkbox above it in one form read as the same
 * size of thing by construction. The track is the family's off part: neutral through the
 * `--color-track` role, §11's "track low"; the fill is `--tone-solid` under the stamped
 * accent identity, so it greys through the shared disabled remap like every fill.
 *
 * No `tone` and no `emphasis` — the value is not an action, and a form where one slider is
 * louder than the next names nothing (TextField's argument). No `material`: a 5px line of
 * blur is a 5px line. Range sliders are the same component: pass an array value and a thumb
 * renders per entry.
 *
 * The one layout fact: a track has no intrinsic width, so the root fills its container's
 * inline size. Constrain it with the Box that owns the row, never with a prop here.
 */
export function Slider({
  size: sizeProp,
  className,
  "aria-label": ariaLabel,
  ref,
  ...props
}: SliderProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useControlSize(sizeProp);
  const values = props.value ?? props.defaultValue;
  const thumbs = Array.isArray(values) ? values.length : 1;
  return (
    <BaseSlider.Root
      ref={ref}
      className={className ? `kui-control kui-slider ${className}` : "kui-control kui-slider"}
      data-size={size}
      // Fixed identity (§11, the binary controls' pattern): the FILL is the accent part, the
      // way a checkbox's tick is. The track never reads this family — it wears --color-track,
      // the tone-independent well — which is what keeps "track low" neutral.
      data-tone="accent"
      thumbAlignment="edge"
      {...props}
    >
      <BaseSlider.Control className="kui-slider-control">
        <BaseSlider.Track className="kui-slider-track">
          <BaseSlider.Indicator className="kui-slider-fill" />
          {Array.from({ length: thumbs }, (_, i) => (
            <BaseSlider.Thumb
              key={i}
              index={i}
              aria-label={ariaLabel}
              className="kui-mark kui-slider-thumb"
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
