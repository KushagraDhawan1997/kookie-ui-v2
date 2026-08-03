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
/** §10 — backdrop defense: three designed thicknesses, like the emphasis ladder. `solid` is
    not a member — it is the seal, the absence of any material (the default, always safe). */
export type Material = "solid" | "thin" | "regular" | "thick";

export type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "color" | "style" | "className"
> & {
  size?: Size;
  tone?: Tone;
  emphasis?: Emphasis;
  /** §10 — containment, orthogonal to loudness: `quiet + bordered` is the old outline. */
  bordered?: boolean;
  /** §10, §11 — backdrop defense, opt-in always: for a control floating over media. While a
      material is on it owns the fill; the rung's dressing returns when it comes off. Over a
      solid parent it blurs nothing and reads as a smudge — the default is the safe seal. */
  material?: Material;
  /** Blocks interaction and shows a Spinner, without ever hiding the label (§8). */
  loading?: boolean;
  /** Leading slot. Swapped for the Spinner while loading, so nothing shifts (§8). */
  icon?: React.ReactNode;
  /** Trailing slot — a chevron, a count. Never replaced by the Spinner. */
  iconEnd?: React.ReactNode;
  /** Keep focus when the button becomes disabled mid-interaction. */
  focusableWhenDisabled?: boolean;
  /**
   * Whether the rendered element really is a `<button>`. Inferred from `render` and almost
   * never worth passing: it exists because Base UI branches its whole a11y contract on it, and
   * getting it wrong is silent. See the note on the `render` escape below.
   */
  nativeButton?: boolean;
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
    material = "solid",
    loading = false,
    disabled = false,
    focusableWhenDisabled,
    nativeButton,
    render,
    icon,
    iconEnd,
    children,
    className,
    ...props
  },
  ref,
) {
  // Base UI branches its ENTIRE a11y contract on `nativeButton`, which defaults to true, and
  // we never forwarded it — so `render={<a/>}`, a composition our own laws bless, shipped
  // `type="button"` on an anchor (where `type` means the linked resource's MIME type) and, when
  // disabled, the inert `disabled` attribute with no `aria-disabled` and tabindex 0: a
  // focusable, unannounced dead link. With it false, Base UI emits role + aria-disabled
  // instead. Inferred from the render element, overridable for the custom-component case we
  // cannot inspect.
  const isNativeButton = nativeButton ?? (render === undefined || render.type === "button");
  // The Spinner takes the icon's place when there is one — same box, zero shift — and joins
  // the label when there is not. The label never goes: a button that stops saying what it is
  // doing is worse than one that changes width (§8).
  const leading = loading ? <Spinner /> : icon;

  return (
    <BaseButton
      ref={ref}
      render={render}
      nativeButton={isNativeButton}
      // Loading blocks activation WITHOUT the native attribute: focusableWhenDisabled is forced
      // true here, which sends Base UI down the aria-disabled branch, and activation is stopped
      // by its preventDefault handlers instead. That is deliberate — the control stays focusable
      // and keeps its place in the tab order when a press flips it into loading (§8). Unlike
      // `pointer-events: none` the element still hit-tests, which is what makes the busy cursor
      // show. The plain `disabled` path does write the native attribute.
      disabled={disabled || loading}
      focusableWhenDisabled={focusableWhenDisabled ?? loading}
      aria-busy={loading || undefined}
      data-size={size}
      data-tone={tone}
      data-emphasis={emphasis}
      data-bordered={bordered || undefined}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
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
