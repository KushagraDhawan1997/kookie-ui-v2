"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type LinkProps = Omit<
  React.ComponentPropsWithoutRef<"a">,
  "color" | "style" | "className"
> & {
  /**
   * §15 — a step on the shared ramp. **Optional with no default**, Code's rule verbatim: an
   * inline atom has no size of its own. Unset, a link takes the font-size, line height and
   * letter spacing of the sentence it sits in, so a link inside `<Text size="2">` matches by
   * construction rather than by the call site repeating the index. Set it only when the link
   * stands alone.
   */
  size?: TypeSize;
  /** §15 — token names, never numbers, topping out at semibold. Unset with no default, for
      `size`'s reason: a link inside a sentence keeps that sentence's face, and the colour and
      the underline are already what set it apart. */
  weight?: Weight;
  /**
   * §7, §11, §15 — a semantic family, never a colour name. Re-scopes the ink onto that
   * family's ladder, so a destructive link is red words with a red underline.
   *
   * Defaults to `accent`, and this is one of §11's four named exceptions to "tone is neutral
   * for everything": a link is the one run of text whose job is to be found in a paragraph.
   * The exception is about the FAMILY, not about loudness — nothing here defaults to the loud
   * rung, so §11's one-focal-action guarantee is untouched.
   */
  tone?: Tone;
  /** Render into the element the document needs — a framework's own link component, or an
      `<a>` carrying `target` and `rel`. Link states the type treatment; the element and where
      it goes are the caller's. */
  render?: RenderElement;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLAnchorElement>;
};

/**
 * A link (§11's typography row, §15): the type family's one interactive member.
 *
 * Everything about how it READS arrives from the shared type layer with no rule of its own —
 * the ramp, the weights, the body family slot, the zeroed margin, and the tone indirection.
 * What `link.css` adds is the two things that make a link a link: the underline, and the
 * states.
 *
 * **It is not a `.kui-control`, and the absence is the design.** The control skeleton is a
 * BOX — a height ladder that is also a target, an inline padding, a corner, a cursor, and
 * `user-select: none`. An inline link has none of those and must not grow them: text inside a
 * sentence has to stay selectable, has to wrap across lines, and has to sit on the line box
 * its paragraph set. Opting in would mean overriding most of what opting in declares, which
 * is Progress's own argument one family over.
 *
 * **It grows no target**, for the same reason and with a citation: WCAG 2.2 SC 2.5.8 states an
 * inline exception — a target "in a sentence or its associated text" is exempt, because the
 * line box is not the component's to enlarge. §16's expansion serves a mark that has no
 * container; a link's container is the paragraph, and a paragraph may not grow.
 *
 * **`emphasis` is refused** (§11 gives the row a dash). Type's emphasis ladder resolves as
 * the ink roles, and the two lower rungs are defined against the reading floor — muted sits
 * at APCA Lc 60 and faint at 30, deliberately below it. A link is the one element whose job
 * is to be findable, so a rung that stands its colour down works against the only thing the
 * component is for. A link that should matter less is a SMALLER link, which `size` states.
 *
 * **There is no `:visited` style**, and that is a refusal rather than an omission. Browsers
 * restrict what `:visited` may paint and make `getComputedStyle` report the unvisited value,
 * for history-leak reasons that are correct. A rule no law in this repo can read is a rule
 * this repo does not ship (ENGINEERING §6). §11's row named the state before that constraint
 * was checked; the row is amended.
 */
export function Link({
  size,
  weight,
  tone = "accent",
  render,
  className,
  style,
  children,
  ref,
  ...props
}: LinkProps) {
  const merged = {
    ref,
    // Stamped only when chosen — an unset step means "inherit the line", so an attribute
    // would turn the absence into a choice (the type join keys on the attribute's presence).
    "data-size": size,
    "data-weight": weight,
    // Always stamped: the tone indirection is declared per family, never at :root, so the
    // default identity has to be written onto the element to resolve (ENGINEERING §2.1).
    "data-tone": tone,
    className: className ? `kui-type kui-link ${className}` : "kui-type kui-link",
    style,
    ...props,
  };

  if (render) return composeRender(render, merged as never, children);

  return <a {...(merged as React.ComponentPropsWithRef<"a">)}>{children}</a>;
}
