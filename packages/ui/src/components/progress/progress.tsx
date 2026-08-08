"use client";

import { Progress as BaseProgress } from "@base-ui/react/progress";
import * as React from "react";

export type ProgressProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseProgress.Root>,
  // The anatomy is the component's, not the call site's — TextField's sentence with two
  // elements instead of three. The root must stay the `role="progressbar"` box (it is what
  // AT reads, and Base UI hangs the value context off it) and the indicator must stay the
  // fill inside it; `render` would have to silently mean one of them. `children` goes with
  // it: a bar has no content, and the label beside one is a sibling Text, the way a
  // checkbox's label is a sibling.
  //
  // Base UI's `Progress.Label` and `Progress.Value` parts are deliberately not surfaced.
  // The anatomy criterion (§10, LOG 2026-08-04) admits system-owned slots only where
  // something NON-VISUAL forces them — Dialog's focus wiring, Callout's status role. Neither
  // part clears it: a label is `aria-label` or a `<Text>` with `id`, and a formatted value is
  // a `<Text>`. Both would be anatomy bought for layout, which is what kookie-blocks is for.
  "children" | "render" | "className"
> & {
  /** Dresses the bar. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /**
   * Names the task for AT. Required in spirit but not by the type: inside a `Field.Root`, or
   * with a visible heading wired through `aria-labelledby`, a second name is noise.
   */
  "aria-label"?: string;
  /** The root — the `role="progressbar"` box, and what `className`/`style` dress. */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A progress bar (§11, §19): a well and a fill — "a rail with no grip".
 *
 * Two elements. The root IS the well (`--color-track`, the neutral role minted with Slider for
 * exactly this pair of consumers) and the indicator is the fill (`--tone-solid` under a stamped
 * accent identity, §11's binary-controls pattern). Base UI's `Progress.Track` part is skipped
 * rather than wrapped: it exists to be the positioned parent of the indicator, and the root
 * already is one — a third div would be anatomy with no job.
 *
 * **Outside the look axis, whole** (§19's instrument rule, predicted for this component twice
 * before it existed): the axis dresses things whose resting state is a surface with a boundary,
 * and a bar has none. It is a channel and a level, shaped by what it reports rather than by the
 * app's identity — so no `--look-*` role is consumed and a mounted law pins every part unmoved
 * across both looks, beside Slider's and Switch's.
 *
 * **No target mechanism, because there is nothing to hit.** Every other §16 consumer grew one;
 * a progress bar is not interactive, takes no focus and answers no pointer, so the box is the
 * paint and the 24/44 floors have no claim on it.
 *
 * **No `size`, and the absence is a decision** (config's `progressTrack` carries the argument):
 * the slider's track ladder holds a fraction of the MARK, and a bar has no mark. One designed
 * thickness, extent from the container — Separator's shape. Whether a bar earns the index, and
 * whether that would promote the track into a family, is recorded open in DECISIONS.
 *
 * `value={null}` is indeterminate and animates — the Spinner's category (motion that IS the
 * content, not a response to a state change, so §8's zeroed-transition law is untouched) and
 * therefore the Spinner's reduced-motion answer: slowed, never stopped.
 *
 * The one layout fact, inherited from Slider for the same reason: a bar has no intrinsic width,
 * so the root fills its container's inline size. Constrain it with the Box that owns the row.
 */
export function Progress({ className, ref, ...props }: ProgressProps) {
  return (
    <BaseProgress.Root
      ref={ref}
      className={className ? `kui-progress ${className}` : "kui-progress"}
      // A fixed identity, not an axis (§11, the binary controls' pattern): the FILL is the
      // accent part the way a checkbox's tick is. The WELL never reads this family — it wears
      // `--color-track`, the tone-independent role — which is what keeps "track low" neutral
      // under the stamp. Whether a bar should carry tone as colour-as-data (a failed upload in
      // `destructive`) is a real question and an open one; it is not answered by leaving the
      // attribute off.
      data-tone="accent"
      {...props}
    >
      <BaseProgress.Indicator className="kui-progress-fill" />
    </BaseProgress.Root>
  );
}
