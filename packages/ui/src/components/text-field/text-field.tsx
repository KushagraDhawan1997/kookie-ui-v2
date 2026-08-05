"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import { filled, mergeRefs } from "../../system/render.ts";
import type { Material, Size } from "../button/button.tsx";

/**
 * The `type` values a text FIELD is (§4). A closed union, the way `size` is one — because
 * `type` on the native element is not one axis but a component selector: `hidden` renders no
 * box at all, `checkbox`, `radio`, `range`, `color` and `file` each render a different control
 * with its own anatomy, and `submit` and `button` are buttons.
 *
 * Unconstrained, `<TextField type="hidden" />` produced a **visible empty bordered box**, which
 * is the whole argument in one render: the wrapper is what draws the border and the height, and
 * a wrapper cannot honour a type it was never told about. The ones left here are the values for
 * which "a box you type text into" is the right control. Date and time are absent on purpose —
 * they render a native picker inside the box and are a component, not a value of this one.
 */
export type TextFieldType = "text" | "email" | "password" | "search" | "tel" | "url" | "number";

export type TextFieldProps = Omit<
  React.ComponentPropsWithoutRef<"input">,
  // `size` is ours — the index (§4). The native attribute is a character-count width hack that
  // predates CSS and would collide with it.
  //
  // `children` is omitted because a void element has none: it was typed here and spread onto
  // the `<input>`, so `<TextField>x</TextField>` type-checked and then threw at render — the
  // API promised something the DOM cannot do. The slots are the way in (§4).
  "color" | "style" | "className" | "size" | "children" | "type"
> & {
  size?: Size;
  /** Narrowed from the platform's open list — see {@link TextFieldType}. */
  type?: TextFieldType;
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
 *
 * **There is no `render` escape, and that is the decision, not the omission it looked like**
 * (recorded 2026-08-05). Everywhere else in this system `render` swaps the one element that IS
 * the component — `<Card render={<article/>}/>`. Here there are two, and neither can move: the
 * wrapper exists to hold a border that the input cannot hold once a slot sits inside it, and
 * the input has to stay an `<input>` or the platform wiring this component exists to preserve
 * — labelling, autofill, form association, the `type` behaviours — goes with it. `render`
 * would have to mean one of them, silently. It is refused by the type, which is the law.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    size = "2",
    material = "solid",
    leading,
    trailing,
    disabled,
    className,
    style,
    "aria-describedby": describedBy,
    ...props
  },
  ref,
) {
  // The field's OWN input, held so the caret redirect below cannot land somewhere else. The
  // forwarded ref still reaches the same node — neither wins (§3).
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Slot content REACHES the accessibility tree, described rather than merely present (§4,
  // 2026-08-05). Before this, a "$" or a "USD" in a slot was announced — if at all — as loose
  // text with no relationship to the field beside it, so a screen-reader user heard "edit
  // text, blank" and a stray currency mark somewhere in the form. Describing rather than
  // labelling is the right relationship: an adornment qualifies the value, it does not name
  // the field, and a label is the caller's (Base UI's `Field.Label`, or a `<label for>`).
  // A slot holding a control contributes its own name here too — mildly redundant, since the
  // control also announces itself in the tab order, and better than silence.
  const slotId = React.useId();

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

  const hasLeading = filled(leading);
  const hasTrailing = filled(trailing);
  // Appended to the caller's own, never replacing it: `aria-describedby` takes a list, and a
  // field inside a `Field.Root` already has a description id on it that must survive.
  const describedByAll =
    [describedBy, hasLeading && `${slotId}-l`, hasTrailing && `${slotId}-t`]
      .filter(Boolean)
      .join(" ") || undefined;

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
      {hasLeading ? (
        <span className="kui-field-slot" data-slot="leading" id={`${slotId}-l`}>
          {leading}
        </span>
      ) : null}
      <BaseInput
        ref={setInput}
        className="kui-field-input"
        disabled={disabled}
        aria-describedby={describedByAll}
        {...props}
      />
      {hasTrailing ? (
        <span className="kui-field-slot" data-slot="trailing" id={`${slotId}-t`}>
          {trailing}
        </span>
      ) : null}
    </span>
  );
});
