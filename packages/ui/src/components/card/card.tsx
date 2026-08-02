"use client";

import * as React from "react";

import type { RenderElement } from "../../system/render.ts";
import type { Size, Tone } from "../button/button.tsx";

/** §10 — how high a surface floats. Semantic levels, each one shadow recipe, never a number. */
export type Elevation = "flat" | "raised" | "floating" | "overlay";
/** §10 — what a surface is made of. Two recipes, not a magnitude dial; solid is the absence. */
export type Material = "solid" | "thin" | "thick";
/** §10 — surfaces speak the same loudness axis as controls, resolved through the alpha ramp. */
export type SurfaceEmphasis = "loud" | "medium" | "quiet";

export type CardProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** §4 — pads from the surface family; a surface has no height to own. */
  size?: Size;
  tone?: Tone;
  emphasis?: SurfaceEmphasis;
  /** §10 — containment; on by default, because §11 makes `quiet + bordered` the canonical card. */
  bordered?: boolean;
  elevation?: Elevation;
  /** §10 — backdrop defense, opt-in always: over a solid parent it blurs nothing. */
  material?: Material;
  /** Render into an element you already have — an `<article>`, a link (§5). */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * The canonical surface (§10, §11): tone × emphasis × bordered × elevation × material, every
 * cell resolved by the shared surface layer — Card ships not one line of CSS of its own.
 *
 * Fills come from the alpha ramp, so nested Cards differentiate by compositing (§10). Medium
 * and loud are tone-forward and re-scope the foreground context (`--color-text`) for their
 * children. Defaults are §11's row: neutral, quiet + bordered, raised, solid — and material
 * stays opt-in everywhere because its bad case looks fine on the demo page.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    size = "3",
    tone = "neutral",
    emphasis = "quiet",
    bordered = true,
    elevation = "raised",
    material = "solid",
    render,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const merged = {
    ref,
    "data-size": size,
    "data-tone": tone,
    "data-emphasis": emphasis,
    "data-bordered": bordered || undefined,
    "data-elevation": elevation,
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
