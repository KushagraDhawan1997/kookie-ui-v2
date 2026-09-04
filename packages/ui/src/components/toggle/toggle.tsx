"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import * as React from "react";

import type { Size, Tone } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { slot } from "../../system/render.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import type { IconOnly } from "../button/button.tsx";

type ToggleBase = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className" | "value"
> & {
  /**
   * An index into the control family, never a measurement — Button's own prop, because a
   * toggle IS a button that holds its state. Defaults to `2`, or to the index of the Field it
   * sits in.
   */
  size?: Size;
  /**
   * What the state means, not what colour it is. Defaults to `neutral`: a pressed toggle rests
   * on the soft wash of its own family, so a toolbar of neutral toggles reads as one set and a
   * `destructive` toggle says what being on does.
   */
  tone?: Tone;
  /** Adds a hairline. Orthogonal to the pressed state: an unpressed bordered toggle is the old
   *  outline button, and pressing it fills the same box. */
  bordered?: boolean;
  /** Whether the toggle is on. The controlled counterpart of `defaultPressed`. */
  pressed?: boolean;
  /** Whether the toggle starts on. The uncontrolled counterpart of `pressed`. */
  defaultPressed?: boolean;
  /** Fires when the pressed state changes, with the new state. */
  onPressedChange?: (pressed: boolean) => void;
  /** The value this toggle contributes to a `ToggleGroup`. Unused outside one. */
  value?: string;
  /** The slot before the label, usually an icon. */
  leading?: React.ReactNode;
  /** The slot after the label. */
  trailing?: React.ReactNode;
  /** Says that content passes behind this toggle, so the theme's material can show. Unset, it
   *  follows the surrounding `<Box backdrop>` region. */
  backdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export type ToggleProps = ToggleBase & (IconOnly | { iconOnly?: false | undefined });

/**
 * A button that stays pressed (§11, §34). Bold in a formatting bar, "show hidden files" in a
 * toolbar, a filter that is on or off — one control, two states, `aria-pressed` from the
 * primitive.
 *
 * It wears Button's identity whole (`kui-button`: the size join, the press travel, the ring,
 * the disabled remap) and adds exactly one fact: its emphasis is its STATE. Off is the quiet
 * rung, on is the medium rung of its own tone — the same soft wash a chosen Card or a selected
 * tree row rests on, so "this is on" is spelled once across the library. That is why there is
 * no `emphasis` prop: loudness is what the toggle is saying, so nobody else may say it.
 *
 * Picking ONE of several is a `SegmentedControl` (a radio group); a set of independent
 * on/off switches in a row is a `ToggleGroup` of these.
 */
export function Toggle({
  size: sizeProp,
  tone = "neutral",
  bordered = false,
  backdrop,
  iconOnly,
  leading,
  trailing,
  children,
  className,
  ref,
  ...props
}: ToggleProps) {
  const size = useSize(sizeProp);
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  const lensRef = useLensRef<HTMLElement>(material, ref);
  return (
    <BaseToggle
      ref={lensRef}
      // The emphasis rides Base UI's resolved state rather than a prop of our own, because
      // inside a `ToggleGroup` the pressed state lives in the group, and a local mirror would
      // be a second home for it. The render function is the one place both cases are visible.
      render={(renderProps, state) => (
        <button {...renderProps} data-emphasis={state.pressed ? "medium" : "quiet"} />
      )}
      data-size={size}
      data-tone={tone}
      data-bordered={bordered || undefined}
      data-icon-only={iconOnly || undefined}
      data-material={material === "solid" ? undefined : material}
      className={
        className ? `kui-control kui-button kui-toggle ${className}` : "kui-control kui-button kui-toggle"
      }
      {...props}
    >
      <GlassScope material={material}>
        {slot(leading, "leading")}
        {children}
        {slot(trailing, "trailing")}
      </GlassScope>
    </BaseToggle>
  );
}

export type ToggleGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>,
  // `multiple` is pinned on, not offered: a group where pressing one releases the rest is a
  // radio group announcing itself as something else, and §26 already decided that one —
  // it is `SegmentedControl`, which says `radiogroup` and moves the value with the arrows.
  "orientation" | "multiple"
> & {
  /** The axis the arrow keys walk. The group draws nothing, so the layout is the caller's
   *  Flex or Stack; this only tells the keyboard which way the toggles run. Defaults to
   *  `horizontal`. */
  orientation?: "horizontal" | "vertical";
};

/**
 * The shared state for a set of toggles (§34): a `role="group"` div, roving focus, and one
 * value array. Every toggle in it is independent — bold AND italic — which is the only thing
 * a toggle group is for. Pick-one-of-several is a radio group, and this library spells that
 * `SegmentedControl`, so there is no `multiple` prop to get wrong.
 *
 * It owns no layout and no appearance. `render` stays open, so `render={<Flex gap="2"/>}`
 * is how the group becomes the row it lays out.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  return <BaseToggleGroup multiple {...props} />;
}
