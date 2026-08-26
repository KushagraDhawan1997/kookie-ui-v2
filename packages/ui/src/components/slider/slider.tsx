"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useControlSize } from "../../system/control-size.ts";
import { useAmbientDirection } from "../../system/floating.tsx";
import { mergeRefs } from "../../system/render.ts";

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
  /**
   * RTL is React context here, and nothing else on the page can supply it (added 2026-08-26).
   *
   * Base UI's slider reads direction from `DirectionContext`: the control maps a pointer's x
   * to a value with it, the thumb maps ArrowLeft/ArrowRight to +/- with it, and the handle's
   * own offset is written from it. Its only setter is `DirectionProvider`, which nothing in
   * this repo rendered outside the floating family — so `useDirection()` answered `'ltr'` in
   * an `<html dir="rtl">` document while this file's logical properties mirrored correctly:
   * the rail ran right-to-left and the drag, the arrows and the handle all ran left-to-right.
   *
   * The ROOT's own computed direction is what is measured, not the document's — a slider
   * always has an in-flow node, and `useAmbientDirection`'s document fallback exists for the
   * floating members that need not — so a subtree flipped by `dir` on an ancestor is answered
   * too. `DirectionProvider` renders no DOM, so the wrapper costs nothing in the tree.
   */
  const dir = useAmbientDirection();
  // Memoised because `mergeRefs` returns a fresh closure and an unstable ref callback detaches
  // and re-attaches every render (shell.tsx carries the same note). `dir.measure` is stable.
  const rootRef = React.useMemo(() => mergeRefs(ref, dir.measure), [ref, dir.measure]);
  /**
   * `aria-invalid` reaches the node AT calls the slider (added 2026-08-26, audit R5).
   *
   * The prop spreads onto Base UI's root, which is `role="group"` — the thing a screen reader
   * announces as the slider is the hidden `<input type="range">` inside the thumb, and that
   * carried `aria-label | aria-orientation | aria-valuenow` and no validity at all. Inside a
   * `Field.Root` Base UI wires the state itself; standalone, the platform spelling reached
   * nothing, and `render`/`children` are refused so no call site could repair it.
   *
   * It has to be written onto the node rather than passed: `SliderThumb` builds its input's
   * props from a fixed list and everything else it is handed lands on the thumb's DIV, so
   * forwarding the attribute the way `aria-label` is forwarded would put it one element off
   * the announced one. `inputRef` is the only seam the primitive offers. Keyed on the value,
   * so the callback re-attaches exactly when the state changes and never per render — and it
   * runs at commit, not at interaction time.
   *
   * The root keeps its copy: the shared invalid remap selects `[aria-invalid="true"]` on
   * `.kui-control`, so removing it there would take the paint with it.
   */
  const invalid = props["aria-invalid"];
  const nameInvalid = React.useCallback(
    (input: HTMLInputElement | null) => {
      if (!input) return;
      if (invalid === undefined || invalid === false || invalid === "false") {
        input.removeAttribute("aria-invalid");
      } else {
        input.setAttribute("aria-invalid", invalid === true ? "true" : String(invalid));
      }
    },
    [invalid],
  );
  return (
    <DirectionProvider direction={dir.direction}>
      <BaseSlider.Root
        ref={rootRef}
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
                inputRef={nameInvalid}
                className="kui-mark kui-slider-thumb"
              />
            ))}
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
    </DirectionProvider>
  );
}
