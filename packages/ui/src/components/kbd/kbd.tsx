"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type KbdProps = Omit<
  React.ComponentPropsWithoutRef<"kbd">,
  "color" | "style" | "className"
> & {
  /** §15 — a step on the shared ramp. Optional with no default, for Code's reason: a key cap
      quoted inside a sentence takes that sentence's step. */
  size?: TypeSize;
  weight?: Weight;
  /** §9, §15 — the foreground roles, as for all type. */
  emphasis?: Emphasis;
  /** §7, §15 — re-scopes the ink trio, the fill and the edge onto the family. Defaults to
      `neutral`, stamped rather than omitted (the tone indirection has no :root default). */
  tone?: Tone;
  /** Render into the element the document needs. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
};

/**
 * A key cap (§11's inert atoms, §15): Code plus an edge, which is the whole difference.
 *
 * §11 gives the two atoms one row because they are one treatment — a mono glyph on a subtle
 * fill — and the key cap's extra is a hairline that says the thing is a physical key rather
 * than a quoted value. It is the tone-aware `--tone-border`, not the solved control or field
 * edge: those tiers exist for controls whose identity RESTS on their edge (§7's edge order),
 * and a cap has a fill to carry it.
 *
 * No shadow, and that is the elevation deletion holding where a peer library would reach for
 * it: a key cap is the classic "just a tiny inset shadow" case, and depth here is the app's
 * (`surfaces`), never a component's own idea.
 *
 * **The stylesheet repeats Code's facts on purpose.** TextArea set the rule (LOG 2026-08-05):
 * the SECOND member of a family self-keys, the THIRD promotes it into the shared layer. Badge
 * and Tag are the third and fourth atoms on §11's list; whichever lands first is what pulls
 * the mono chip's box into a layer of its own.
 */
export function Kbd({
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
}: KbdProps) {
  const merged = {
    ref,
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    "data-tone": tone,
    className: className ? `kui-type kui-kbd ${className}` : "kui-type kui-kbd",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <kbd {...(merged as React.ComponentPropsWithRef<"kbd">)}>{children}</kbd>;
}
