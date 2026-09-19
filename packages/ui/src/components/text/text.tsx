"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
// Type-only, so nothing is imported at runtime: the two unions below are the type half of the
// lists `componentAxes` already derives from this config, and a hand-written copy of a list
// with one home is a copy that goes stale the day the home widens (2026-08-26 audit).
import type { fontSize, fontWeight } from "../../tokens/config.ts";

/**
 * A text size step, from `"1"` to `"9"`. Text has more steps than controls, which have four.
 */
export type TypeSize = Exclude<Extract<keyof [unknown, ...typeof fontSize], `${number}`>, "0">;
/**
 * A font weight, by name: `regular`, `medium` or `semibold`. There's no `bold`. To show that
 * something is important, use a larger size or a stronger emphasis level.
 */
export type Weight = keyof typeof fontWeight;

export type TextProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  /** The text size step, from `1` to `9`. Defaults to `3`, the body size. Each step sets the
      font size, the line height and the letter spacing together. */
  size?: TypeSize;
  /** The font weight: `regular`, `medium` or `semibold`. Defaults to `regular`. There's no
      `bold`. */
  weight?: Weight;
  /** The emphasis level of the text, which sets its colour. Defaults to `loud`, the full text
      colour. `medium` is muted and `quiet` is faint. Don't use `quiet` for text that people
      must read, because its contrast is low. */
  emphasis?: Emphasis;
  /** The meaning of the text, which sets its colour family, such as `destructive`. The
      emphasis levels then use colours from that family. Unset, the text uses the colour of
      the surface it sits on. */
  tone?: Tone;
  /** Renders the text as a different element, such as a `<p>` or a `<label>`. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * Body copy (§15). A step on the ramp joins three designed pairs — font-size, line height,
 * letter spacing — at one index, and the family is the Theme's body slot. No tone: text
 * reads the foreground context its surface sets (§11), and `emphasis` picks WHICH role —
 * the same ladder controls resolve as fills and surfaces as dressing, resolved here as
 * reading hierarchy. On a loud surface the ladder collapses to the APCA-chosen contrast.
 *
 * Renders a span: flow is the layout layer's job, so Text takes no block opinion of its own.
 * The margin stays zero whatever element `render` names (§3).
 */
export function Text({
  size = "3",
  weight = "regular",
  emphasis = "loud",
  tone,
  render,
  className,
  style,
  children,
  ref,
  ...props
}: TextProps) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    // Only a CHOSEN tone stamps (the contrast lesson, §5): unset text has no family, it
    // reads its surface's context — and stays collapsible on a loud surface, where an
    // explicit tone deliberately survives.
    "data-tone": tone,
    className: className ? `kui-type kui-text ${className}` : "kui-type kui-text",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <span {...(merged as React.ComponentPropsWithRef<"span">)}>{children}</span>;
}
