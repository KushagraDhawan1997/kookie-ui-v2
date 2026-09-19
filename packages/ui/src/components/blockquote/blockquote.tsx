"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type BlockquoteProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<"blockquote">,
  "color" | "style" | "className"
> & {
  /** The text size step, from `1` to `9`. Defaults to `3`, the body size, as on `Text`. */
  size?: TypeSize;
  /** The font weight: `regular`, `medium` or `semibold`. Defaults to `regular`. */
  weight?: Weight;
  /** The emphasis level of the text, which sets its colour. Defaults to `loud`. Don't use
      `quiet` for a quote, because its contrast is too low to read easily. */
  emphasis?: Emphasis;
  /** The colour family of the text, such as `destructive`. The line at the side stays grey
      in every tone. */
  tone?: Tone;
  /** Renders the quote as a different element. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLQuoteElement>;
};

/**
 * A pulled quote (§11, §15): body copy set apart by a rule and an indent.
 *
 * The type family's third component and its cheapest — everything about how it READS comes
 * from the shared layer (the ramp, the weights, the emphasis rungs, the zeroed margin, the
 * body family slot), and what it adds is two declarations: the quiet hairline down its
 * leading edge and the indent that keeps the text off it.
 *
 * **The rule is tone-less on purpose.** A chosen `tone` re-scopes the ink trio — §11's rule
 * for this whole family, and nothing more. The hairline stays `--color-border`, the tone-less
 * paint Separator wears, because §7's edge order puts a quote's rule exactly where a
 * separator's sits: under both solved tiers, carrying no identity of its own. It is also the
 * only spelling that is safe — `var(--tone-border, …)` would inherit an ancestor's family
 * through the cascade, which is the action-at-a-distance trap this repo has paid for twice.
 * A quote whose bar carries meaning is a `Notice`, not a quote.
 *
 * No `cite` handling and no attribution slot: the footer under a quote is a sibling `<Text>`,
 * and `cite` is an ordinary attribute that passes straight through. Anatomy is system-owned
 * only where something non-visual forces it (§10), and nothing here does.
 */
export function Blockquote({
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
}: BlockquoteProps) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    // Only a CHOSEN tone stamps (§15, Text's rule): an unset quote has no family and reads
    // whatever foreground context its surface sets.
    "data-tone": tone,
    className: className
      ? `kui-type kui-blockquote ${className}`
      : "kui-type kui-blockquote",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <blockquote {...(merged as React.ComponentPropsWithRef<"blockquote">)}>{children}</blockquote>;
}
