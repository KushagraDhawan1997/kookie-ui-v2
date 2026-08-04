"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import { mergeRefs } from "../../system/render.ts";
import type { Material, Size } from "../button/button.tsx";

export type TextFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  // `size` is ours — the index (§4). The native attribute is a character-count width hack that
  // predates CSS and would collide with it.
  //
  // `children` is omitted because a void element has none: it was typed here and spread onto
  // the `<input>`, so `<TextField>x</TextField>` type-checked and then threw at render — the
  // API promised something the DOM cannot do. The slots are the way in (§4).
  "color" | "style" | "className" | "size" | "children"
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
/**
 * What React would actually PAINT in a slot. The guard used to be `!== undefined && !== null`,
 * which let the two commonest ways of writing "no adornment" through — `{isSearch && <Icon/>}`
 * evaluates to `false`, and an empty string is what a unit or currency slot holds before the
 * caller has one — and each rendered an empty `<span>` that still bought a full gap of dead
 * space beside the value. `0` is content and stays.
 */
const filled = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== "";

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { size = "2", material = "solid", leading, trailing, disabled, className, style, ...props },
  ref,
) {
  // The field's OWN input, held so the caret redirect below cannot land somewhere else. The
  // forwarded ref still reaches the same node — neither wins (§3).
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Hit-target unification, the first of the wrapper's three debts. Only the padding and the
  // passive slots redirect: anything the user could have meant to click — a clear button, a
  // link, the input itself — is left alone, so a trailing control never loses its own press.
  // preventDefault stops the browser from moving focus to the wrapper first, which would blur
  // and refocus the input and collapse any selection the caller had set.
  //
  // The guard is a FOCUSABILITY list, not a tag list: `[tabindex]` is what catches the
  // role-based widgets the tag names miss, and a `role="button"` without one is not operable
  // by keyboard either, so there is nothing there to protect. `label` is here because the
  // platform already redirects a click on it, to a control that may not be ours.
  const focusInput = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, [tabindex], [contenteditable]"))
      return;
    // Not `querySelector("input")`: a leading slot holding any input of its own — a country
    // code, a unit selector — is earlier in the tree, and clicking the field's padding would
    // have put the caret in the adornment instead of the value.
    const input = inputRef.current;
    if (!input) return;
    event.preventDefault();
    input.focus();
  }, []);

  // Memoised on the caller's ref: a fresh callback ref every render would be detached with
  // null and reattached on each one, and Base UI reads the node in effects that would then run
  // against a momentarily empty ref.
  const setInput = React.useMemo(() => mergeRefs(ref, inputRef), [ref]);

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
      // Stamped from our own prop, which is only HALF the answer and used to claim to be all
      // of it: inside a `Field.Root disabled` the flag never passes through this component at
      // all — Base UI computes `fieldDisabled || disabledProp` on the input — so the wrapper,
      // which is the element that paints, was never told. The shared layer now also reads the
      // state off the input with `:has()`, exactly the way `invalid` has always been read one
      // line below. The attribute stays because it is the cheap path and because consumers
      // style on it; the two are OR'd, never compared.
      data-disabled={disabled || undefined}
      onMouseDown={focusInput}
    >
      {filled(leading) ? (
        <span className="kui-field-slot" data-slot="leading">
          {leading}
        </span>
      ) : null}
      <BaseInput ref={setInput} className="kui-field-input" disabled={disabled} {...props} />
      {filled(trailing) ? (
        <span className="kui-field-slot" data-slot="trailing">
          {trailing}
        </span>
      ) : null}
    </span>
  );
});
