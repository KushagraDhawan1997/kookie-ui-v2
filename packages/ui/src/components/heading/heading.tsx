"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type HeadingProps = Omit<
  React.ComponentPropsWithoutRef<"h2">,
  "color" | "style" | "className"
> & {
  size?: TypeSize;
  weight?: Weight;
  /** §9, §15 — the type ladder: a muted eyebrow or section label without leaving the axis. */
  emphasis?: Emphasis;
  /** §7, §15 — a semantic family for the ink, never a colour name (see Text). */
  tone?: Tone;
  /** Name the real outline level — `render={<h1/>}`, `<h3/>` — without moving the ramp (§5). */
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
