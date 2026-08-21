"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";

import { useLensRef } from "../../system/refraction.tsx";
import type { Size } from "../../system/axes.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { useControlSize } from "../../system/control-size.ts";

export type SegmentedControlProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  // Refused with Radio's own (LOG 2026-08-06): the platform has no read-only selection
  // control, and a segmented control is a selection control wearing a different box.
  "readOnly" | "className"
> & {
  /**
   * The control height ladder, set on the track, because the track is the control: a segmented
   * control stands level with a Button of the same size in the toolbar beside it. Each segment
   * derives its own box from that channel, which is the track minus a fixed inset, and states no
   * index of its own, so the two boxes cannot disagree. It sits on the root, never on a segment: a
   * bar of mixed sizes is not a thing anyone means.
   */
  size?: Size;
  /** Dresses the track. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /**
   * Says content passes behind this control, so it shows the theme's material instead of resolving
   * solid. A `<Box backdrop>` region answers this for a whole toolbar. This is the one-off escape,
   * and it is Button's own prop.
   */
  backdrop?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export type SegmentedItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  // `tone` and `emphasis` are refused for the binary controls' reason (§11): the family has
  // ONE tone as an identity, and a segment that is louder than its neighbours is not a
  // segmented control. `readOnly` inherits Radio's refusal.
  //
  // `nativeButton` and `render` are closed by the same argument radio.tsx, checkbox.tsx and
  // switch.tsx all state, and reopening them here was never argued anywhere — code, §26, LOG
  // or registry (audit 2026-08-19, D10). `nativeButton` was measured breaking the control it
  // is set on: `<SegmentedItem nativeButton>` renders `type="button"` on a span and that
  // segment can no longer be chosen with Space or Enter, which is audit D10 reproduced on the
  // same Base UI primitive it was closed on. `render` measured harmless — the hidden input,
  // the role and keyboard selection all survive `render={<div/>}` — and is closed anyway,
  // because the one element must stay Base UI's root, which owns the input and the group
  // membership. `children` is the one the family refuses that this component keeps, and that
  // one IS argued, below.
  "readOnly" | "className" | "nativeButton" | "render"
> & {
  /** Dresses the segment. Outer spacing is the caller's Box, never this. */
  className?: string;
};

/**
 * A segmented control (§26) — one choice among a few, shown all at once.
 *
 * **It is a RADIO GROUP, and that is the load-bearing decision.** Base UI offers two
 * primitives that could carry this box: `ToggleGroup`, which announces `role="group"` holding
 * `aria-pressed` buttons, and `RadioGroup`, which announces `role="radiogroup"`. A view
 * switcher is picking one of several, which is what a radio group IS — and the arrow keys
 * then select as they move, which is the behaviour every platform's segmented control has.
 * The multi-select formatting case (bold / italic / underline) is genuinely a set of toggle
 * buttons and is genuinely a DIFFERENT component: §11 lists Toggle Button on its own row.
 *
 * It also closes the question the 2026-08-06 audit deferred — how selection state is spelled
 * on a control the system did not have yet. The docs' own pickers convey a choice through
 * tone alone, so the accessibility tree is byte-identical before and after it changes. This
 * is the answer: a real role, from the primitive, not an aria attribute bolted on.
 *
 * The TRACK is the control (§4): it rides the height ladder, so a segmented control stands
 * level with a Button of the same size beside it in a toolbar, and each segment derives its
 * box from the channel — the switch's sentence one control over, and §4's hosted-control rule
 * with N hosts rather than one.
 */
export function SegmentedControl({
  size: sizeProp,
  className,
  backdrop,
  ref,
  children,
  ...props
}: SegmentedControlProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useControlSize(sizeProp);
  // §10 — the TRACK is the pane, and the only pane here. It expresses the theme's material
  // where a backdrop exists and resolves solid everywhere else (selectivity, 2026-08-17), and
  // it scopes its subtree, so every segment inside a glass track resolves `on-glass`: the
  // veil's alpha, no second backdrop-filter, no second lens. One glass per stack, structurally
  // — nobody types anything, and a segmented control cannot be built wrong here.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLDivElement>(
    material !== "solid" && material !== "on-glass",
    ref,
  );
  return (
    <BaseRadioGroup
      ref={lensRef}
      className={
        className
          ? `kui-control kui-segmented ${className}`
          : "kui-control kui-segmented"
      }
      data-size={size}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // NEUTRAL, and stamped rather than omitted (audit 2026-08-19, D5). It shipped as
      // `accent` on the stated reason that the chosen segment's rule needed a family to
      // resolve against — measured, that rule reads `--color-thumb`, `--color-thumb-label`
      // and `--grip-cast`, no tone role at all, and flipping the attribute left the chosen
      // segment byte-identical. What the stamp actually reached was the quiet rung on every
      // segment: an unchosen one hovered accent blue, and in dark it inverted the direction
      // of the state change entirely — a light wash going to a near-opaque navy block, on a
      // component whose type refuses `tone` because the family has one identity.
      //
      // Omitting it is not the fix either: `--tone-*` exists only inside a `[data-tone]`
      // block, so a bare segment's hover source resolves to nothing and the hover disappears
      // — which is the sibling's own defect, measured the same day (Tabs, D3).
      data-tone="neutral"
      {...props}
    >
      <GlassScope material={material}>{children}</GlassScope>
    </BaseRadioGroup>
  );
}

/**
 * One segment (§26) — a control hosted in a control, and the system already has that rule.
 *
 * There is no separate indicator element, and the absence is deliberate. Base UI's Tabs ships
 * one because it measures the active tab for you; RadioGroup ships none, so a gliding thumb
 * here would mean writing the measurement ourselves — a mechanism whose only consumer is a
 * motion that has not been designed yet, which is the entropy this repo keeps paying for (the
 * curtain, deleted 2026-08-17). The selected segment paints its own box: no JS at interaction
 * time, and the honest thing to draw when nothing travels. When the motion pass wants one
 * object gliding between homes, the measuring hook arrives with it and this stays internal.
 *
 * `children` is OPEN, where every mark refuses it: a mark sits beside its label and a segment
 * CONTAINS its own, which is the whole difference between the two boxes.
 */
export function SegmentedItem({ className, ...props }: SegmentedItemProps) {
  return (
    <BaseRadio.Root
      // Quiet is the resting rung: bare at rest, entering the ramp at hover — the same rung a
      // tab wears, and for the same reason. The chosen segment re-sources the fill below.
      data-emphasis="quiet"
      className={
        className ? `kui-control kui-segment ${className}` : "kui-control kui-segment"
      }
      {...props}
    />
  );
}
