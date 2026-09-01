"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type KbdProps = Omit<
  React.ComponentPropsWithoutRef<"kbd">,
  "color" | "style" | "className"
> & {
  /** A step on the shared ramp. Optional with no default, for the same reason `Code` is: a
      key cap inside a sentence takes that sentence's step. */
  size?: TypeSize;
  /** Token names, never numbers, and semibold is the heaviest. Unset with no default, as
      `size` is. The box, the edge and the shadow are what say "key". The weight never was. */
  weight?: Weight;
  /** Picks an ink colour, as it does on all type. It changes the letters, not the cap. */
  emphasis?: Emphasis;
  /** Moves the ink and the fill onto that family. The edge is a grey relief line and does not
      follow the tone. Defaults to `neutral`. */
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
 * switch grips' own exception. It reads `--kbd-relief`'s VALUE, never the world switch, so
 * `depth` cannot move it. (This sentence named `--control-chrome` and a `surfaces` prop until
 * 2026-08-26: the cap left the lit control chrome for its own cap-scale relief on 2026-08-17 —
 * kbd.css records that reversal — and the Theme prop was renamed `depth` on 2026-08-10. A pane
 * still stands the relief down through `--kui-kbd-cast`, which is what "always" does not cover:
 * always is about the WORLD, and a material is a different axis.)
 *
 * **The stylesheet repeats Code's facts on purpose.** TextArea set the rule (LOG 2026-08-05):
 * the SECOND member of a family self-keys, the THIRD promotes it into the shared layer. Chip
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
    className: className ? `kui-type kui-atom kui-atom-box kui-kbd ${className}` : "kui-type kui-atom kui-atom-box kui-kbd",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <kbd {...(merged as React.ComponentPropsWithRef<"kbd">)}>{children}</kbd>;
}
