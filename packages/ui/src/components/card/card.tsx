"use client";

import * as React from "react";

import { composeRender, useMergedRefs, type RenderElement } from "../../system/render.ts";
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
  /**
   * Render into an element you already have, and let that element decide what the card does.
   * An `<article>` stays inert. A button or a link presses, and takes the control state
   * machine whole, disabled included. A `<label>` wrapped around a `Radio` or a `Checkbox`
   * makes the whole card the target of that control, and the chosen card takes the selected
   * edge. There is no `selected` prop and no `interactive` prop, because the element already
   * says which of these it is.
   */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * An object with its own plane. One treatment and no variants: the opaque fill, the surface
 * radius and the padding. Card is where the surface rules are enforced, and it has no opinion
 * about what goes inside it.
 *
 * It carries no emphasis and no tone. Loudness ranks actions and a container is not an action;
 * a Notice carries tone because there the tone is the category of the message.
 *
 * It has no anatomy slots. The system owns an anatomy only where something non-visual forces
 * one, such as a dialog's accessibility wiring or a notice's status role. A titled card is one
 * layout among many, and a layout is something you compose.
 *
 * What it DOES is decided by the element `render` gives it, never by a prop. As a button or a
 * link it presses, and it takes the control state machine whole, disabled included. As the
 * label of a radio or a checkbox it can be chosen, and the system supplies the edge while the
 * primitive supplies the keyboard, the form value and the announcement.
 *
 * The identity attributes below are constants rather than props: the card resolves through the
 * shared surface layer like every surface, and it never lets a call site choose.
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
  // The hook takes the MATERIAL and picks the rung (2026-08-23): thin, regular and thick are
  // three different pieces of glass and bend by three different amounts, and the two spellings
  // that bend by nothing — `solid`, the seal, and `on-glass`, which declares no backdrop-filter
  // for a map to be prepended to — are answered in the ladder rather than at twelve call sites.
  const lensRef = useLensRef<HTMLElement>(material, ref);
  // A pane clips, so content wider than it is is not reachable at all (§3, 2026-08-21).
  // Dev-only, stripped in production.
  const clipRef = useClipWarning("<Card>");
  // A card does not go inside a card (2026-08-21). The nesting crosses a component boundary,
  // so nothing static can see it; the rendered tree is the only place the question can be
  // asked. Dev-only warning, and the builder and the reviewer refuse it outright.
  useNestedCardWarning(useInsideCard());
  // Memoised by the hook, and it is not hygiene — `useMergedRefs` (system/render.ts) states
  // what an unstable ref costs a lens-bearing pane.
  const setRoot = useMergedRefs(lensRef, clipRef);
  const merged = {
    /**
     * THE CONSUMER'S PROPS COME FIRST, so the identity below cannot be overridden (2026-08-26
     * audit). TypeScript exempts hyphenated JSX attribute names from excess-property checking,
     * so `<Card data-emphasis="loud" data-tone="destructive">` compiles with no error whatever
     * the type says — and with the spread LAST it reached the DOM and re-grew the tone-forward
     * rungs this component exists without: a solid red card, the `variant` axis §9 deleted,
     * back from a call site. Dialog and AlertDialog already state the rule this way. A
     * consumer's `data-testid`, `id`, `role` and handlers still land; only the keys below —
     * the ones the card IS — stop being reachable.
     */
    ...props,
    ref: setRoot,
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
