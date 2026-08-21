"use client";

import * as React from "react";

import { composeRender, mergeRefs, type RenderElement } from "../../system/render.ts";
import type { Size } from "../../system/axes.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useClipWarning } from "../../system/clip.tsx";
import { CardScope, useInsideCard, useNestedCardWarning } from "../../system/nesting.tsx";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";

export type CardProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** Sets the padding and the corner. A card has no height of its own to set. */
  size?: Size;
  /**
   * Says whether something passes behind this card: a hero image, a canvas, a scrolling
   * feed. A card in ordinary flow sits on the page, where glass blurs nothing and still costs
   * a full backdrop read on every paint, so by default it renders solid whatever the theme's
   * material is. Unset, it follows the surrounding `<Box backdrop>` region. A menu or a
   * dialog always covers content, so neither needs this. The material itself is still the
   * theme's: this prop cannot pick one.
   */
  backdrop?: boolean;
  /** Render into an element you already have, such as an `<article>`, a button or a link. */
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
  backdrop,
  render,
  className,
  style,
  children,
  ref,
  ...props
}: CardProps) {
  // §10 — the material is the THEME's, expressed only where a backdrop exists (selectivity,
  // 2026-08-17): on-glass under a glass pane, solid on a solid pane or on the page's calm
  // ground, the theme's glass only where `backdrop` — the prop, or the ambient region —
  // states the placement. Card still takes no material prop: a card is not a place to
  // choose what the app is built of (2026-08-16).
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // §10 — the lens. A glass pane's bezel bends its own backdrop, and the map is built for
  // THIS box, so it needs the mounted element. Additive by construction: on a browser that
  // cannot render it, or a solid surface, nothing is set and the CSS chain is untouched.
  // `on-glass` excluded like every sibling consumer: an on-glass pane declares no
  // backdrop-filter at all, so a map built for it could never be substituted into anything.
  const lensRef = useLensRef<HTMLElement>(material !== "solid" && material !== "on-glass", ref);
  // A pane clips, so content wider than it is is not reachable at all (§3, 2026-08-21).
  // Dev-only, stripped in production.
  const clipRef = useClipWarning("<Card>");
  // A card does not go inside a card (2026-08-21). The nesting crosses a component boundary,
  // so nothing static can see it; the rendered tree is the only place the question can be
  // asked. Dev-only warning, and the builder and the reviewer refuse it outright.
  useNestedCardWarning(useInsideCard());
  const merged = {
    ref: mergeRefs(lensRef, clipRef),
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
  // when the caller passes none (caught by the `render={<article>Post body</article>}` law).
  // The pane scope wraps the composed RESULT, not just `children` — a render target that
  // keeps its own children must land inside the scope too, or a Button inside
  // `<Card render={<article><Button/></article>}>` on a glass card resolves the theme's
  // full material and paints a second backdrop-filter over the card's (audit 2026-08-18).
  // GlassScope is context only, so the wrap adds no DOM.
  const content = render ? (
    composeRender(render, merged as never, children)
  ) : (
    <div {...(merged as React.ComponentPropsWithRef<"div">)}>{children}</div>
  );

  return (
    <GlassScope material={material}>
      <CardScope>{content}</CardScope>
    </GlassScope>
  );
}
