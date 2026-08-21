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
  /** §15 — token names, never numbers, topping out at semibold (`bold` is refused
      system-wide). Unset with no default, as `size` is: a cap quoted inside a sentence takes
      that sentence's face. The box, the edge and the cast are what say "key" — the weight was
      never carrying it. */
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
 * A key cap (§11's inert atoms, §15): Code's fill and tone facts, in its own family and box.
 *
 * It shipped as "Code plus an edge" and left that identity the next day (2026-08-08): a mono
 * cell draws symbols like ⌘ compact to fit its fixed advance, and the platform sets shortcuts
 * in the UI sans (macOS menus; Radix's cap is sans too). So the cap wears `--font-body` at its
 * own `kbdScale`, in a box exactly one line tall (`block-size: 1lh`) — which is what gives it
 * a face without ever spreading the line it sits in. What it still shares with the chip: the
 * subtle fill, the tone indirection, and the type join.
 *
 * The hairline says the thing is a physical key rather than a quoted value. It is the
 * tone-aware `--tone-border`, not the solved control or field edge: those tiers exist for
 * controls whose identity RESTS on their edge (§7's edge order), and a cap has a fill to
 * carry it.
 *
 * **It casts always** — flat world included (2026-08-08, reversing the day-one refusal): a key
 * cap is a picture of a raised physical object, so depth here is role semantics, the slider and
 * switch grips' own exception. It reads `--control-chrome`'s VALUE, never the world switch, so
 * `surfaces` cannot move it.
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
