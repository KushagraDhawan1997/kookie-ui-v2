"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import type { Material, Size } from "../button/button.tsx";

export type TextAreaProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  // `children` is not the API even though a <textarea> can technically hold text: React's own
  // contract for form elements is `defaultValue`/`value`, and accepting both spellings for one
  // fact is the drift ENGINEERING §3 forbids.
  //
  // `cols` is the same character-count width hack the field's native `size` attribute is —
  // it predates CSS and collides with it. Width belongs to layout (`style`, or the Box that
  // owns the relationship). `rows` stays: it states content height in the content's own unit,
  // which is exactly what a multi-line control's initial height should be.
  "color" | "children" | "cols"
> & {
  size?: Size;
  /** §10 — backdrop defense, opt-in: zero CSS of its own, the control layer's material block
      re-derives the fill from whatever the component declared. */
  material?: Material;
};

/**
 * A multi-line text field (§4, §11). ONE element, unlike TextField — and that asymmetry is the
 * anatomy criterion (LOG 2026-08-04) applied twice with two answers. TextField's wrapper exists
 * because a slot forces it: the border cannot stay on the input once an icon sits inside it.
 * A textarea has no slots — an adornment floating over a scrolling paragraph is not a designed
 * position — so nothing non-visual forces a second element, and the border stays on the
 * <textarea>, which is then the labellable, form-associated, focusable box all by itself.
 * Every wrapper debt (caret redirect, slot layout, hosted focus) simply never exists here.
 *
 * Height is where a textarea leaves the control family: §4's height ladder is for fixed-height
 * controls, and this box grows with its content. Per §4 ("non-fixed-height components: padding
 * is the dimension"), the size index keeps every OTHER join — padding, radius, type, border —
 * and the block padding is derived so that a one-row textarea is byte-identical in geometry to
 * a TextField at the same index: 2·py + line + 2·border = the control height. The control
 * height survives as a floor (`min-height`), never a ceiling.
 *
 * No emphasis, no tone, for TextField's reason verbatim: loudness ranks actions, and a form
 * where one input is louder than the next names nothing. No `render` escape either — the one
 * element must stay a <textarea> or the platform wiring this component exists to preserve
 * (labelling, form association, selection, IME) goes with it. Refused by the type, which is
 * the law.
 *
 * Validity is state (`aria-invalid` standalone, Base UI's `data-invalid` inside a Field.Root)
 * and lands on this element directly — the shared layer's direct arm reads it, no `:has()` hop.
 * Disabled likewise: whichever route sets it (our prop, or Field.Root computing it at the
 * control), it lands here as the native attribute, and the shared remap reads `:disabled`.
 */
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { size = "2", material = "solid", className, ...props },
  ref,
) {
  return (
    <BaseInput
      ref={ref as React.Ref<HTMLElement>}
      render={<textarea />}
      className={className ? `kui-control kui-textarea ${className}` : "kui-control kui-textarea"}
      data-size={size}
      // Fixed identity, not API (the field's pattern): the tone indirection needs a family to
      // resolve --tone-border against, and the box is always bordered — the border is the
      // affordance.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // The props are textarea-shaped and Base UI's Input is typed over <input>; the render
      // swap above is what reconciles them at runtime (Base UI forwards everything to the
      // rendered element), so the cast asserts what the render prop already made true.
      {...(props as unknown as React.ComponentPropsWithoutRef<"input">)}
    />
  );
});
