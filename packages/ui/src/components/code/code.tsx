"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type CodeProps = Omit<
  React.ComponentPropsWithoutRef<"code">,
  "color" | "style" | "className"
> & {
  /**
   * §15 — a step on the shared ramp. **Optional with no default**, which is the one thing
   * this component does differently from Text: an inline atom has no size of its own. Unset,
   * it takes the font-size, line height and letter spacing of the line it sits in, so
   * `<Text size="2">the <Code>value</Code></Text>` matches by construction rather than by the
   * call site remembering to repeat the index. Set it only when the chip stands alone.
   */
  size?: TypeSize;
  weight?: Weight;
  /** §9, §15 — resolved for type as foreground roles, the same three the surrounding copy
      reads. Unset rests loud: code is a literal, and a literal that has faded is a legibility
      loss with nothing gained. */
  emphasis?: Emphasis;
  /** §7, §15 — re-scopes both the ink trio AND the chip's own fill onto the family, because
      an atom that carries a fill has a second thing to tint. Defaults to `neutral`, stamped
      rather than omitted (ENGINEERING §2.1: an identity a component fixes is still stamped —
      and here it must be, since the tone indirection is declared per family, never at :root). */
  tone?: Tone;
  /** Render into the element the document needs. */
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
    className: className ? `kui-type kui-code ${className}` : "kui-type kui-code",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <code {...(merged as React.ComponentPropsWithRef<"code">)}>{children}</code>;
}
