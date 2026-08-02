"use client";

import * as React from "react";

import type { RenderElement } from "../../system/render.ts";
import type { Size } from "../button/button.tsx";

/** §10 — what a surface is made of: three designed thicknesses, like the emphasis ladder.
    `solid` is not a member — it is the seal, the absence of any material (the default). */
export type Material = "solid" | "thin" | "regular" | "thick";

export type CardProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** §4 — pads from the surface family; a surface has no height to own. */
  size?: Size;
  /** §10 — backdrop defense, opt-in always: over a solid parent it blurs nothing. */
  material?: Material;
  /** Render into an element you already have — an `<article>`, a link (§5). */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * A shell (§10, §11, LOG 2026-08-04). One treatment, no variants: the quiet alpha fill over
 * whatever it sits on, the border, the surface radius, the padding rhythm — Card is the place
 * the surface laws are enforced, with zero opinion about what goes inside.
 *
 * What it deliberately is not: it has no emphasis or tone (loudness ranks actions, and a
 * container is not an action — status surfaces like Callout carry tone because there it means
 * something), and no anatomy slots (anatomy is system-owned only where something non-visual
 * forces it — Dialog's a11y wiring, Callout's status semantics. A titled card is one layout
 * among many, and layouts are blocks, not components).
 *
 * The identity attributes below are constants, not props: the shell still resolves through
 * the shared surface layer like every surface, it just never lets a call site choose.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { size = "3", material = "solid", render, className, style, children, ...props },
  ref,
) {
  const merged = {
    ref,
    "data-size": size,
    // Fixed identity, not API: the tone indirection needs a family to resolve --tone-a1
    // and --tone-border, and a Card is always the neutral quiet bordered surface.
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the absence of a material, so it writes no attribute (§10).
    "data-material": material === "solid" ? undefined : material,
    className: className ? `kui-surface kui-card ${className}` : "kui-surface kui-card",
    style,
    ...props,
  };

  if (render) {
    return React.cloneElement(render, {
      ...merged,
      className: [render.props.className, merged.className].filter(Boolean).join(" "),
      style: { ...merged.style, ...render.props.style },
      children,
    });
  }

  return <div {...(merged as React.ComponentPropsWithRef<"div">)}>{children}</div>;
});
