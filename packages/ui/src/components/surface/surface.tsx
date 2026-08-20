"use client";

import * as React from "react";

import { composeRender, mergeRefs, type RenderElement } from "../../system/render.ts";
import { useClipWarning } from "../../system/clip.tsx";
import type { Size } from "../../system/axes.ts";

export type SurfaceProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "color" | "style" | "className"
> & {
  /** §4, §6 — padding and corner from the CONTAINER band, one step up from a card's. */
  size?: Size;
  /** Render into an element you already have — a `<section>`, an `<aside>`, a layout (§5). */
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
 *   no `backdrop` prop for the same reason: it is never the thing over content.
 * - **a shadow** — a hole in a plane throws none. Stated in the layer, not here.
 * - **`tone` / `emphasis`** — Card's own refusal, unchanged: a container ranks nothing.
 *
 * Everything about how it BEHAVES otherwise is the shared surface layer's: the corner band,
 * the padding rhythm, clipping, `bleed`, and re-scoped foreground colour. Its stylesheet does
 * not exist, exactly as Card's does not.
 */
export function Surface({ size = "3", render, className, style, children, ref, ...props }: SurfaceProps) {
  // A pane clips, so content wider than it is is not reachable at all (§3, 2026-08-21).
  const clipRef = useClipWarning("<Surface>");
  const merged = {
    ref: mergeRefs(ref, clipRef),
    "data-size": size,
    className: className ? `kui-surface kui-ground ${className}` : "kui-surface kui-ground",
    style,
    ...props,
  };

  // `undefined` must stay `undefined`: composeRender keeps the render target's OWN children
  // when the caller passes none — Card's law, and the reason a `render` target that carries
  // its own content is not silently emptied. There is no GlassScope wrap here, unlike Card:
  // a ground expresses no material, so it opens no scope and closes none. A Surface inside a
  // glass card leaves that card's scope exactly as it found it.
  return render ? (
    composeRender(render, merged as never, children)
  ) : (
    <div {...(merged as React.ComponentPropsWithRef<"div">)}>{children}</div>
  );
}
