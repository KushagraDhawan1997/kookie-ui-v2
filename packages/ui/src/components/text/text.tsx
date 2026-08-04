"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";

/** §15 — the full ramp: type's dynamic range is wider than the control family's (§4). */
export type TypeSize = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
/** §15 — the closed weight set; token names, never numbers. */
export type Weight = "regular" | "medium" | "semibold" | "bold";

export type TextProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  size?: TypeSize;
  weight?: Weight;
  /** Render into the flow element the document needs — a `<p>`, a `<label>` (§5). */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Body copy (§15). A step on the ramp joins three designed pairs — font-size, line height,
 * letter spacing — at one index, and the family is the Theme's body slot. No tone, no
 * emphasis: text reads the foreground context its surface sets (§11), and decoration beyond
 * the ramp (a muted aside, an inline code face) is the call site's `style` against the role
 * tokens, spelled where review sees it.
 *
 * Renders a span: flow is the layout layer's job, so Text takes no block opinion of its own.
 * The margin stays zero whatever element `render` names (§3).
 */
export const Text = React.forwardRef<HTMLSpanElement, TextProps>(function Text(
  { size = "3", weight = "regular", render, className, style, children, ...props },
  ref,
) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    className: className ? `kui-type kui-text ${className}` : "kui-type kui-text",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <span {...(merged as React.ComponentPropsWithRef<"span">)}>{children}</span>;
});
