"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";

/** §15 — the full ramp: type's dynamic range is wider than the control family's (§4). */
export type TypeSize = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
/** §15 — the closed weight set; token names, never numbers. */
export type Weight = "regular" | "medium" | "semibold" | "bold";

export type TextProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  size?: TypeSize;
  weight?: Weight;
  /** §9, §15 — the one loudness axis, resolved for type as foreground roles: loud reads
      --color-text, medium the muted role, quiet the faint one. Rests loud — full contrast
      is the accessible resting state for reading, the inversion of the control default.
      Quiet is below body-copy contrast by design; never a reading-length line. */
  emphasis?: Emphasis;
  /** §7, §15 — a semantic family, never a colour name: the meaning is the API and the theme
      resolves the pigment. Re-scopes the emphasis ladder onto the family's ink trio.
      Unset means tone-less: the text reads whatever context its surface sets. */
  tone?: Tone;
  /** Render into the flow element the document needs — a `<p>`, a `<label>` (§5). */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
};

/**
 * Body copy (§15). A step on the ramp joins three designed pairs — font-size, line height,
 * letter spacing — at one index, and the family is the Theme's body slot. No tone: text
 * reads the foreground context its surface sets (§11), and `emphasis` picks WHICH role —
 * the same ladder controls resolve as fills and surfaces as dressing, resolved here as
 * reading hierarchy. On a loud surface the ladder collapses to the APCA-chosen contrast.
 *
 * Renders a span: flow is the layout layer's job, so Text takes no block opinion of its own.
 * The margin stays zero whatever element `render` names (§3).
 */
export function Text({
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
}: TextProps) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    // Only a CHOSEN tone stamps (the contrast lesson, §5): unset text has no family, it
    // reads its surface's context — and stays collapsible on a loud surface, where an
    // explicit tone deliberately survives.
    "data-tone": tone,
    className: className ? `kui-type kui-text ${className}` : "kui-type kui-text",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <span {...(merged as React.ComponentPropsWithRef<"span">)}>{children}</span>;
}
