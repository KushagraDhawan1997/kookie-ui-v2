"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import type { Emphasis, Tone } from "../../system/axes.ts";
// Type-only, so nothing is imported at runtime: the two unions below are the type half of the
// lists `componentAxes` already derives from this config, and a hand-written copy of a list
// with one home is a copy that goes stale the day the home widens (2026-08-26 audit).
import type { fontSize, fontWeight } from "../../tokens/config.ts";

/**
 * §15 — the full ramp: type's dynamic range is wider than the control family's (§4).
 *
 * DERIVED from the ramp itself, one step per entry, 1-based because §4's rule is the index.
 * Prepending one slot and dropping key "0" is the whole trick, and it is deliberately not
 * `(typeof componentAxes.typeSize)[number]`: `.map` over a tuple widens to `string[]`, so that
 * spelling would type the prop as `string` and delete the closed union this line exists for.
 */
export type TypeSize = Exclude<Extract<keyof [unknown, ...typeof fontSize], `${number}`>, "0">;
/**
 * §15 — the closed weight set; token names, never numbers.
 *
 * THREE, not four: `bold` (700) is refused (2026-08-09, Kushagra — "we don't use bold, we
 * shouldn't"). Semibold is the top of the ladder and the resting weight of every heading, so
 * hierarchy is carried by SIZE and the ink roles, which is where this system already puts it.
 * A 700 face beside a 600 one at the same step is a fifth way to say "important" competing
 * with three that are already designed.
 *
 * Refused in the TYPE, not merely re-defaulted: a value left in the union is a value every
 * call site can re-introduce, and the decision would then hold only by memory (ENGINEERING
 * §1.3 — types are the refusals, enforced). An app that genuinely needs 700 has `style`, the
 * §13 escape every fenced resource uses; the set widens by config the day something real
 * forces it, which is the tone set's own rule — and DERIVING the union from `fontWeight` is
 * what makes "the set widens by config" true rather than a second edit somebody remembers:
 * a hand-written copy of a list with one home is exactly the entropy `componentAxes` exists
 * to end, and the builder's inspector already generates from the derived half.
 */
export type Weight = keyof typeof fontWeight;

export type TextProps = Omit<
  React.ComponentPropsWithoutRef<"span">,
  "color" | "style" | "className"
> & {
  /** A step on the type ramp. One index sets three things together: font size, line height
      and letter spacing, so a step can never change the size without the leading that makes
      it readable. There are nine steps here, against the four a control has, because reading
      covers a wider range. Defaults to 3, the body step. */
  size?: TypeSize;
  /** The weight, named rather than numbered, because a token is the system's to re-point and
      a `600` is not. There are three, and semibold is the heaviest: `bold` is refused across
      the system, since a 700 face is another way to say "important" competing with the size
      ramp and the ink colours. Defaults to regular. */
  weight?: Weight;
  /** On text, this picks an ink colour: loud is `--color-text`, medium is muted, quiet is
      faint. It rests loud, because full contrast is the correct resting state for reading.
      Quiet sits below the reading contrast floor on purpose, so never use it for a full line
      of text. */
  emphasis?: Emphasis;
  /** A meaning, never a colour name. The theme resolves the colour. Setting a tone moves the
      three emphasis levels onto that family's own inks. Unset, the text reads whatever ink
      colour its surface set. */
  tone?: Tone;
  /** Render into the element the document needs, such as a `<p>` or a `<label>`. */
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
