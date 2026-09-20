"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
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
   * The size step of the toggle, from `1` to `4`. It matches a `Button` at the same step.
   * Unset, the toggle uses the `size` of the nearest `Field` or `Theme`.
   */
  size?: Size;
  /**
   * The meaning of the toggle's state, which sets its colour. Defaults to `neutral`. When
   * pressed, the toggle shows a soft fill in this tone. Use `destructive` if turning it on
   * does something dangerous.
   */
  tone?: Tone;
  /** Adds a thin border. The border shows in both states: unpressed it looks like an outline
   *  button, and pressed it also gets a fill. */
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
  /** Set `backdrop` when the toggle sits over other content, such as an image. The toggle then
   *  uses the theme's material. Unset, it follows the nearest `<Box backdrop>`. */
  backdrop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
};

export type ToggleProps = ComponentRefusals & ToggleBase & (IconOnly | { iconOnly?: false | undefined });

/**
 * A button that stays pressed (§11, §34). Bold in a formatting bar, "show hidden files" in a
 * toolbar, a filter that is on or off — one control, two states, `aria-pressed` from the
 * primitive.
 *
 * It wears Button's identity whole (`kui-button`: the size join, the ring, the disabled remap)
 * and adds exactly one fact: its emphasis is its STATE. Off is the quiet rung, on is the
 * medium rung of its own tone — the same soft wash a chosen Card or a selected tree row rests
 * on, so "this is on" is spelled once across the library. That is why there is no `emphasis`
 * prop: loudness is what the toggle is saying, so nobody else may say it.
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

export type ToggleGroupProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<typeof BaseToggleGroup>,
  // `multiple` is pinned on, not offered: a group where pressing one releases the rest is a
  // radio group announcing itself as something else, and §26 already decided that one —
  // it is `SegmentedControl`, which says `radiogroup` and moves the value with the arrows.
  "orientation" | "multiple"
> & {
  /** The direction in which the arrow keys move focus. Defaults to `horizontal`. This prop
   *  doesn't change the layout. Use `render` with a `Flex` or `Stack` to arrange the toggles. */
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
