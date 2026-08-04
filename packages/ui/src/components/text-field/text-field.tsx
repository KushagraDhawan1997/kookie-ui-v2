"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import type { Material, Size } from "../button/button.tsx";

export type TextFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  // `size` is ours — the index (§4). The native attribute is a character-count width hack that
  // predates CSS and would collide with it.
  "color" | "style" | "className" | "size"
> & {
  size?: Size;
  /** §10 — backdrop defense, opt-in: a search field over a hero image. Zero CSS of its own —
      the control layer's material block re-derives the fill from whatever the field declared. */
  material?: Material;
  /** Passive by convention — an icon, a unit, a currency mark. Clicking it lands the caret. */
  leading?: React.ReactNode;
  /** May be interactive: a clear button, a reveal toggle. A real button brings its own
      semantics, and the wrapper stands out of its way (§10's element-brings-interactivity). */
  trailing?: React.ReactNode;
  /** Applied to the WRAPPER — the element that is the control. */
  className?: string;
  /** Applied to the WRAPPER, so `width` sizes the field rather than the text inside it. */
  style?: React.CSSProperties;
};

/**
 * A text field (§4, §11). The visible control is the WRAPPER, not the input: a field that can
 * hold an icon inside its border cannot keep that border on the `<input>`, and once a wrapper
 * owns the border it owes three things no consumer can compose from outside — clicking anywhere
 * in the box must land the caret, the input's box must yield to the slots without breaking
 * `::placeholder` or autofill, and an interactive trailing control must stay reachable without
 * stealing the field's own focus. That is the anatomy criterion met (LOG 2026-08-04): the slots
 * are forced by something non-visual, so the system owns them.
 *
 * What it deliberately is not: it has no `emphasis` and no `tone`. Loudness ranks actions
 * against their siblings — a form where one field is louder than the next is incoherent, and a
 * "loud input" names nothing the system can mean. Construction (filled vs outlined) is an app
 * identity, not a per-field knob; if it ever ships it is a Theme prop, the way `surfaces` is.
 * Label, description and error are Base UI's `Field` parts, which already do the `aria-*`
 * wiring; the labelled layout around a field is a block.
 *
 * Validity is state, never a prop: inside a `Field.Root` Base UI writes `data-invalid`, and
 * standalone the platform spelling is `aria-invalid`. The stylesheet reads both.
 *
 * `ref` goes to the INPUT, which is what a caller reaches for — `.focus()`, `.select()`, the
 * value. Every unrecognised prop goes there too (`placeholder`, `value`, `onChange`, `name`,
 * `type`, `id`), so label association and form wiring behave natively.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { size = "2", material = "solid", leading, trailing, disabled, className, style, ...props },
  ref,
) {
  // Hit-target unification, the first of the wrapper's three debts. Only the padding and the
  // passive slots redirect: anything the user could have meant to click — a clear button, a
  // link, the input itself — is left alone, so a trailing control never loses its own press.
  // preventDefault stops the browser from moving focus to the wrapper first, which would blur
  // and refocus the input and collapse any selection the caller had set.
  const focusInput = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, [tabindex]")) return;
    const input = event.currentTarget.querySelector("input");
    if (!input) return;
    event.preventDefault();
    input.focus();
  }, []);

  return (
    <span
      className={className ? `kui-control kui-field ${className}` : "kui-control kui-field"}
      style={style}
      data-size={size}
      // Fixed identity, not API (the Card pattern): the tone indirection needs a family to
      // resolve --tone-border against, and the field is always bordered — on a field the
      // border is the affordance, not a rung of a ladder.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // Stamped from the prop rather than read off the input with :has(), because we own the
      // prop: the disabled tone remap then lands through the shared control layer for free.
      data-disabled={disabled || undefined}
      onMouseDown={focusInput}
    >
      {leading !== undefined && leading !== null ? (
        <span className="kui-field-slot" data-slot="leading">
          {leading}
        </span>
      ) : null}
      <BaseInput ref={ref} className="kui-field-input" disabled={disabled} {...props} />
      {trailing !== undefined && trailing !== null ? (
        <span className="kui-field-slot" data-slot="trailing">
          {trailing}
        </span>
      ) : null}
    </span>
  );
});
