"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import * as React from "react";

import { Spinner } from "../spinner/spinner.tsx";

/** §4 — an index, not a measurement. Closed, because a scale with an escape is not a scale. */
export type Size = "1" | "2" | "3" | "4";
/** §7 — the semantic families. A component never names a colour, only a role. */
export type Tone = "neutral" | "accent" | "destructive";
/** §9 — loudness, three rungs, because a rung that is not visibly distinct is not a rung. */
export type Emphasis = "loud" | "medium" | "quiet";

export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  size?: Size;
  tone?: Tone;
  emphasis?: Emphasis;
  /** §10 — containment, orthogonal to loudness: `quiet + bordered` is the old outline. */
  bordered?: boolean;
  /** Blocks interaction and shows a Spinner, without ever hiding the label (§8). */
  loading?: boolean;
  /** Leading slot. Swapped for the Spinner while loading, so nothing shifts (§8). */
  icon?: React.ReactNode;
  /** Trailing slot — a chevron, a count. Never replaced by the Spinner. */
  iconEnd?: React.ReactNode;
  /** Keep focus when the button becomes disabled mid-interaction. */
  focusableWhenDisabled?: boolean;
  render?: React.ReactElement;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The primary control (§9, §11). Base UI supplies the semantics — real `<button>`, keyboard
 * behaviour, `data-disabled` — and every visible decision is ours, resolved through the token
 * layer: `tone` picks a family, `emphasis` picks a loudness, `size` joins five scales at one
 * index, and the stylesheet does the rest with no JS at interaction time.
 *
 * No margin prop, by construction (§3): outer spacing belongs to the layout that owns the
 * relationship. `<Box m="4"><Button/></Box>` is the honest spelling.
 *
 * Defaults are `medium` and `neutral` (§11): nothing is loud-and-accent by accident, so a
 * screen has one focal point unless somebody deliberately asks for a second.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size = "2",
    tone = "neutral",
    emphasis = "medium",
    bordered = false,
    loading = false,
    disabled = false,
    icon,
    iconEnd,
    children,
    className,
    ...props
  },
  ref,
) {
  // The Spinner takes the icon's place when there is one — same box, zero shift — and joins
  // the label when there is not. The label never goes: a button that stops saying what it is
  // doing is worse than one that changes width (§8).
  const leading = loading ? <Spinner /> : icon;

  return (
    <BaseButton
      ref={ref}
      disabled={disabled}
      aria-busy={loading || undefined}
      data-size={size}
      data-tone={tone}
      data-emphasis={emphasis}
      data-bordered={bordered || undefined}
      data-loading={loading || undefined}
      className={className ? `kui-control kui-button ${className}` : "kui-control kui-button"}
      {...props}
    >
      {leading}
      {children}
      {iconEnd}
    </BaseButton>
  );
});
