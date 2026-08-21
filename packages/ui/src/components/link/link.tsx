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
   * A step on the shared ramp. Optional with no default, which is `Code`'s rule: a word
   * inside a sentence has no size of its own. Unset, a link takes the font size, line height
   * and letter spacing of the sentence it sits in, so a link inside `<Text size="2">` matches
   * without the call site repeating the index. Set it only when the link stands alone.
   */
  size?: TypeSize;
  /** Token names, never numbers, and semibold is the heaviest. Unset with no default, for
      the same reason `size` is: a link inside a sentence keeps that sentence's weight, and
      the colour and the underline already set it apart. */
  weight?: Weight;
  /**
   * A meaning, never a colour name. It moves the ink onto that family, so a destructive link
   * is red words with a red underline.
   *
   * It defaults to `accent`, which is one of four places in the system where a component does
   * not rest neutral. A link is the one run of text whose job is to be found inside a
   * paragraph. The exception is about which family it picks, not about loudness, so the rule
   * that a screen has one focal action is untouched.
   */
  tone?: Tone;
  /** Render into the element you need, such as your framework's own link component or an
      `<a>` carrying `target` and `rel`. `Link` supplies the type treatment. The element and
      where it goes are yours. */
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
