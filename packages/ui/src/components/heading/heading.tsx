"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type HeadingProps = Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  /** A step on the same ramp `Text` reads. One type system, not two, so the index means the
      same thing on both. It sets the type and nothing else: the document outline level is
      `render`'s job, which is what lets a sidebar's `h2` sit at 4 while the hero's sits at 8.
      Defaults to 6, the card-title step. */
  size?: TypeSize;
  /** Token names, never numbers. It rests at semibold, which is also the heaviest weight in
      the system, because `bold` is refused. A heading gets its weight from the step it stands
      on and the ink colour it wears, never from a heavier face. */
  weight?: Weight;
  /** Picks an ink colour, the same three `Text` uses. Use it for a muted section label. */
  emphasis?: Emphasis;
  /** A meaning for the ink, never a colour name. The theme resolves the colour. */
  tone?: Tone;
  /** Name the real outline level, such as `render={<h1/>}`, without moving the type step. */
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
  weight = "semibold",
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
