"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type CodeProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"code">,
  "color" | "style" | "className"
> & {
  /**
   * The text size step, from `1` to `9`. There's no default: unset, the code takes the text
   * size of the line around it. For example, `<Text size="2">the <Code>value</Code></Text>`
   * matches the text. Set it only when the code stands alone.
   */
  size?: TypeSize;
  /** The font weight, by name. `semibold` is the heaviest. There's no default: unset, the
      code takes the weight of the text around it. */
  weight?: Weight;
  /** The emphasis level of the text: `loud`, `medium` or `quiet`. It changes the text colour.
      Defaults to `loud`. */
  emphasis?: Emphasis;
  /** The colour family of the text and the fill. Defaults to `neutral`. */
  tone?: Tone;
  /** Renders the code as a different element. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
};

/**
 * Inline code (§11's inert atoms, §15): the type system's third family slot, wearing a fill.
 *
 * Three of its four axes arrive from the shared type layer with no rule of its own — the size
 * step joins the three paired scales, `weight` reads the token names, `emphasis` resolves as
 * the foreground roles. What it adds is the mono family and §11's "subtle fill": one fixed
 * treatment, not a rung. That is the Card sentence at atom scale — the fill is what a code
 * chip IS, so it is an identity, and a `loud` code chip filled with a solid would name
 * nothing the system means.
 *
 * **Inline only.** A code BLOCK is a different component: it owns overflow, wrapping, a
 * scroll container and eventually highlighting, none of which an inline atom can grow into
 * without becoming two components wearing one name. `<pre><Code/></pre>` is not blessed and
 * is not prevented — the escape is honest, the API just does not claim it.
 *
 * The chip keeps its fill across a line break (`box-decoration-break: clone`), which is the
 * one thing an inline fill gets wrong by default.
 */
export function Code({
  size,
  weight,
  emphasis,
  tone = "neutral",
  render,
  className,
  style,
  children,
  ref,
  ...props
}: CodeProps) {
  const merged = {
    ref,
    // Stamped only when chosen — an unset step means "inherit the line", which is the
    // default, so an attribute would turn the absence into a choice (the type join keys on
    // the attribute's presence).
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    "data-tone": tone,
    className: className ? `kui-type kui-atom kui-code ${className}` : "kui-type kui-atom kui-code",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <code {...(merged as React.ComponentPropsWithRef<"code">)}>{children}</code>;
}
