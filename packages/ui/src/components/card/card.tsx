"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";

export type CardProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** §4 — pads from the surface family; a surface has no height to own. */
  size?: Size;
  /** Render into an element you already have — an `<article>`, a link (§5). */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A shell (§10, §11, LOG 2026-08-04). One treatment, no variants: the opaque seal
 * (`--color-surface`), the border, the surface radius, the padding rhythm — Card is the place
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
export function Card({
  size = "3",
  render,
  className,
  style,
  children,
  ref,
  ...props
}: CardProps) {
  // §10 — the material is the THEME's, and `solid` if a glass ancestor already spent the
  // backdrop. Card takes no material prop: a card is not a place to choose what the app is
  // built of (2026-08-16).
  const material = useMaterial();
  // §10 — the lens. A glass pane's bezel bends its own backdrop, and the map is built for
  // THIS box, so it needs the mounted element. Additive by construction: on a browser that
  // cannot render it, or a solid surface, nothing is set and the CSS chain is untouched.
  const lensRef = useLensRef<HTMLElement>(material !== "solid", ref);
  const merged = {
    ref: lensRef,
    "data-size": size,
    // Fixed identity, not API. The tone indirection needs a family to resolve --tone-border,
    // which is the only reason neutral is named here: the fill is the opaque seal, not a tone
    // alpha. (--tone-a1 was the quiet fill until the 2026-08-04 retraction, and the generator
    // no longer emits that role at all.)
    "data-tone": "neutral",
    "data-emphasis": "quiet",
    "data-bordered": true,
    // Solid is the absence of a material, so it writes no attribute (§10).
    "data-material": material === "solid" ? undefined : material,
    className: className ? `kui-surface kui-card ${className}` : "kui-surface kui-card",
    style,
    ...props,
  };

  // `undefined` must stay `undefined`: composeRender keeps the render target's OWN children
  // when the caller passes none, and wrapping nothing in a scope would hand it an empty
  // element and wipe them (caught by the `render={<article>Post body</article>}` law).
  const body =
    children === undefined ? undefined : <GlassScope material={material}>{children}</GlassScope>;

  if (render) return composeRender(render, merged as never, body);

  return <div {...(merged as React.ComponentPropsWithRef<"div">)}>{body}</div>;
}
