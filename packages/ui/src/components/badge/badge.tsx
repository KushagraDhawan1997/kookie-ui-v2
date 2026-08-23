"use client";

import * as React from "react";

import { composeRender, filled, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
import type { TypeSize, Weight } from "../text/text.tsx";

export type BadgeProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  /**
   * A step on the shared ramp. Optional with no default, for the same reason `Code` and `Kbd`
   * are: a badge takes the size of the line it sits beside, so a badge next to a card title is
   * bigger than one in a table row without either call site repeating the index. Set it only
   * when the badge stands alone.
   */
  size?: TypeSize;
  /** Token names, never numbers, and semibold is the heaviest. Unset with no default, as
      `size` is: the fill and the pill are what mark a badge out, never the weight. */
  weight?: Weight;
  /** Picks an ink colour, the same three the surrounding copy uses. It moves the letters, not
      the fill — a badge that faded its box would be reading one axis two ways. */
  emphasis?: Emphasis;
  /**
   * The family, and this is the axis a badge exists for. `success` for a finished job,
   * `destructive` for a failed one, `warning` for one that needs attention, `info` for one
   * that is merely running. It moves the INK, and the chip stays grey. That reversed on
   * 2026-08-23 (Kushagra, from the tone x emphasis board: *"why do these buttons continue to
   * have a light filter?"*): no family paints a faded wash any more, so a badge's box is one
   * neutral whatever category it carries and the category arrives in the letters. Measured, a
   * `destructive` chip is byte-identical to a `neutral` one and only the word is red.
   *
   * `Notice` deliberately did NOT follow, and that is the line the change was drawn along: a
   * badge's chip reads `--tone-soft` and a Notice's box reads `--tone-a3`, so a tone-forward
   * SURFACE keeps its tint while a chip loses one. Defaults to `neutral`.
   */
  tone?: Tone;
  /** Render into the element the document needs. */
  render?: RenderElement;
  /** The word, or the count. A badge with nothing in it is refused by this type: see below. */
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
};

/**
 * A badge (§11's inert atoms, §15): a short word or a count that states what the thing beside
 * it IS right now.
 *
 * It is the family's third atom, and what it is made of says most of what it is. `Code` quotes
 * a literal in the mono face and belongs to its sentence. `Kbd` names a key, in a box with an
 * edge and relief, because a key is a physical object. A badge is that same box with neither —
 * flat, because a badge is printed ON the thing it marks rather than sitting on top of it — and
 * what it carries instead is the TONE. That is the whole point of it: the semantic families
 * exist so that "failed" and "running" and "done" are one vocabulary across a product, and this
 * is the atom that spends them.
 *
 * **Tone is the category, not the volume** (§29's sentence, one family over). There are no fill
 * rungs and no `variant`: a badge does not come in loud. Ranking is what emphasis does for
 * actions, and two badges of different loudness on one screen say something about importance
 * that neither of them means. A failed deploy is `destructive` whether or not it is the most
 * important thing on the page.
 *
 * **Size is the line it sits beside**, unset by default, which is the atom family's rule.
 *
 * **It does not know where it goes.** Apple's notification badge sits ON its container — a tab,
 * an app icon, a row — and that is a position, which no component in this system owns (§3). Put
 * it where it belongs: in the flex row beside a title, in a table cell, or absolutely placed by
 * a `<Box>` over the thing it counts.
 *
 * **What it refuses**: a fill ladder (above), a dismissal (a badge you can remove is a control
 * with a keyboard model, not an inert atom — that component is not built), a `count` prop with
 * its own overflow rule (formatting a number is the app's job, and "99+" is a product decision),
 * and emptiness — a bare coloured dot is colour carrying meaning on its own, which is the thing
 * WCAG 1.4.1 exists about and the same argument that keeps a `Link` underlined.
 */
export function Badge({
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
}: BadgeProps) {
  const merged = {
    ref,
    // Stamped only when chosen — an unset step means "take the line beside me", which is the
    // default, so an attribute would turn the absence into a choice (the type join keys on the
    // attribute's presence).
    "data-size": size,
    "data-weight": weight,
    "data-emphasis": emphasis,
    "data-tone": tone,
    className: className
      ? `kui-type kui-atom kui-atom-box kui-badge ${className}`
      : "kui-type kui-atom kui-atom-box kui-badge",
    style,
    ...props,
  };

  /**
   * AN EMPTY BADGE RENDERS NOTHING (2026-08-23, ultracode audit).
   *
   * The refusal was written and never enforced: `<Badge tone="success">{done && "New"}</Badge>`
   * type-checks under `--strict`, and when the condition is false it rendered a 23 x 16 green
   * lozenge with no text — a coloured dot, which is exactly the thing the refusal names (WCAG
   * 1.4.1, and the same reason a Link stays underlined). `{""}`, `{null}`, `{false}` and
   * `{undefined}` all reached it; only a bare `<Badge/>` was a type error.
   *
   * The TYPE cannot close this, which is why it is a runtime answer: the commonest way to write
   * a conditional badge is `{cond && "New"}`, whose type is `string | false` and which is a
   * legitimate thing to write. So the component answers the way the slot mechanism already
   * does — `filled()` is the same question the icon slots ask, and it is the same helper.
   *
   * Rendering nothing rather than throwing: a badge that has nothing to say is a badge that
   * should not be there, and taking down the page over it would be a worse trade than the
   * absence. `0` counts as content and stays, which is `filled()`'s own rule and correct here —
   * a badge reading "0" is a real thing to say.
   */
  if (!filled(children)) return null;

  if (render) return composeRender(render, merged as never, children);

  return <span {...(merged as React.ComponentPropsWithRef<"span">)}>{children}</span>;
}
