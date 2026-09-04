"use client";

import * as React from "react";

import { composeRender, useMergedRefs, type RenderElement } from "../../system/render.ts";
import { useClipWarning } from "../../system/clip.tsx";
import { BackdropContext } from "../../theme/theme.tsx";
import type { Size } from "../../system/axes.ts";
import { useSize } from "../../system/size.ts";

export type SurfaceProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** Sets the padding and the corner, one step larger than a card at the same index, because
      a container needs a larger corner than the things inside it. */
  size?: Size;
  /** Render into an element you already have, such as a `<section>`, an `<aside>` or a
      layout primitive. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * A ground (§10, 2026-08-20). The second thing a surface can be, and the pair that completes
 * the family: **a Card is an object, a Surface is a ground.** An object seals, catches light
 * and casts; a ground is what an object sits on.
 *
 * Two shapes, one statement — a bounded region of a page that holds cards, and a bed inside a
 * card that holds something quieter. Before this every one of those was a hand-painted div
 * picking a raw neutral, a radius and a hairline at the call site, which is how the builder's
 * own canvas came to wear a smaller corner than the cards inside it.
 *
 * **It takes no axis at all, and the absence is the design.** No fill, no border toggle, no
 * tone, no emphasis, no material, no shadow — the ground and the hairline are the component,
 * not choices in it. That is deliberate protection: with a `fill`/`edge` vocabulary the first
 * thing anyone would reach for is a seal plus a hairline, which is the outlined card deleted
 * on 2026-08-19, reachable again from every call site. The failure a system cannot recover
 * from is not somebody building something DIFFERENT — it is somebody building the same thing
 * a second way, which then drifts out of reach of a fix. A ground cannot pass for a card, so
 * it cannot start that.
 *
 * What it refuses and why:
 *
 * - **`material`** — glass exists to defend a pane against something passing BEHIND it, and a
 *   ground's backdrop is its own parent, which is not a backdrop. Inside a glass card it
 *   simply participates in the scope already there (`on-glass`, no second filter). It takes
 *   no `backdrop` prop for the same reason: it is never the thing over content. What it does
 *   do is CLOSE a backdrop region: the ground is opaque, so a card sitting on it is not over
 *   content and resolves solid, exactly as it would on a solid pane. A member that states its
 *   own `backdrop` still gets the theme's material.
 * - **a shadow** — a hole in a plane throws none. Stated in the layer, not here.
 * - **`tone` / `emphasis`** — Card's own refusal, unchanged: a container ranks nothing.
 *
 * Everything about how it BEHAVES otherwise is the shared surface layer's: the corner band,
 * the padding rhythm, clipping, `bleed`, and re-scoped foreground colour. Its stylesheet does
 * not exist, exactly as Card's does not.
 */
export function Surface({ size: sizeProp, render, className, style, children, ref, ...props }: SurfaceProps) {
  const size = useSize(sizeProp);
  // A pane clips, so content wider than it is is not reachable at all (§3, 2026-08-21).
  const clipRef = useClipWarning("<Surface>");
  const setRoot = useMergedRefs(ref, clipRef);
  const merged = {
    /**
     * THE CONSUMER'S PROPS COME FIRST, and the two `undefined`s below are the identity — do
     * not delete them as no-ops (2026-08-26 audit). This component's whole design is that it
     * takes NO axis; TypeScript exempts hyphenated attribute names from excess-property
     * checking, so `<Surface data-emphasis="loud" data-tone="destructive">` compiles clean,
     * and the surface layer's rungs are element-keyed and declared AFTER the ground's own
     * block — equal specificity, later in the file — so it painted `--tone-solid`: a solid red
     * ground, from a call site, with no error anywhere. Card answers this by stamping its
     * identity over the spread; a ground's identity is the ABSENCE of one, so it stamps the
     * absence. Every other prop a consumer owns still lands.
     */
    ...props,
    "data-tone": undefined,
    "data-emphasis": undefined,
    ref: setRoot,
    "data-size": size,
    className: className ? `kui-surface kui-ground ${className}` : "kui-surface kui-ground",
    style,
  };

  // `undefined` must stay `undefined`: composeRender keeps the render target's OWN children
  // when the caller passes none — Card's law, and the reason a `render` target that carries
  // its own content is not silently emptied.
  const content = render ? (
    composeRender(render, merged as never, children)
  ) : (
    <div {...(merged as React.ComponentPropsWithRef<"div">)}>{children}</div>
  );

  /**
   * A GROUND CLOSES THE REGION, and that is not the same as opening a pane scope (§10,
   * 2026-08-26 audit).
   *
   * There is deliberately no `GlassScope` here: a ground expresses no material, so it must not
   * touch `PaneContext` — a Surface inside a glass card leaves that card's scope exactly as it
   * found it, and its members stay `on-glass`. But the ground PAINTS, opaquely and by
   * construction (`--color-ground`, no material arm can reach it), so it seals whatever passes
   * behind it exactly as a solid pane does. Without this reset a `<Box backdrop>` region leaked
   * straight through it and a card sitting on the ground resolved the theme's thickness: real
   * glass, a full backdrop read per paint, blurring a flat opaque colour — which is precisely
   * what the selectivity rule exists to stop. The escape is unchanged: a member that states its
   * own `backdrop`, or opens a fresh region inside, still resolves the theme's material.
   */
  return <BackdropContext.Provider value={false}>{content}</BackdropContext.Provider>;
}
