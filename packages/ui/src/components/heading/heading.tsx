"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type HeadingProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /** The text size step, from `1` to `9`, the same steps as `Text`. Defaults to `6`, the size
      for a card title. It doesn't change the heading level: use `render` for that. */
  size?: TypeSize;
  /** The font weight: `regular`, `medium` or `semibold`. Defaults to `medium`. There's no
      `bold`: use a larger `size` to make a heading stronger. */
  weight?: Weight;
  /** The emphasis level of the text, which sets its colour, as on `Text`. Use `medium` for a
      muted section label. */
  emphasis?: Emphasis;
  /** The meaning of the heading, which sets its colour family, such as `destructive`. */
  tone?: Tone;
  /** Renders the heading as a different element. Use it to set the heading level, such as
      `render={<h1/>}`. The text size doesn't change. Defaults to `<h2>`. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLHeadingElement>;
};

/**
 * A heading on the same ramp as Text (§15) — one type system, not two: the size index means
 * the same thing on both, and only the family slot and the resting weight differ. Visual size
 * and outline level are deliberately independent axes: `size` prices the type, `render` names
 * the document structure, so a sidebar's `h2` can sit at size 4 while the hero's sits at 8.
 *
 * Renders an `<h2>` by default — a page rarely wants a second `h1`, so the safe default is
 * the level a section actually reaches for. Like Text: no tone, no emphasis, no margin
 * (§3, §11).
 */
export function Heading({
  size = "6",
  weight = "medium",
  emphasis = "loud",
  tone,
  render,
  className,
  style,
  children,
  ref,
  ...props
}: HeadingProps) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    // Stamped only when chosen — see Text.
    "data-tone": tone,
    className: className ? `kui-type kui-heading ${className}` : "kui-type kui-heading",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <h2 {...(merged as React.ComponentPropsWithRef<"h2">)}>{children}</h2>;
}
