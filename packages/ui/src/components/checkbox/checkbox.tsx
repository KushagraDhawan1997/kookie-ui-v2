"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import * as React from "react";

import type { Size } from "../button/button.tsx";

export type CheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  // The glyph is the component's, not the call site's — a checkbox with arbitrary children is
  // a checkbox that can be made to mean anything. The LABEL is not children either: it is a
  // sibling, because components never own the space between themselves and the next thing
  // (the non-negotiable), and a label that belongs to the control cannot be laid out by the
  // form that owns the row. The working pairing (the first spelling of this comment named
  // props Text does not have — audit 2026-08-05, D11 — and forgot the id it depends on):
  //
  //   <Checkbox id="terms" />
  //   <Text render={<label htmlFor="terms" />}>Accept the terms</Text>
  //
  // Base UI reads the association off the hidden input and wires aria-labelledby itself; a
  // label WRAPPING the checkbox works with no id at all.
  //
  // `render` goes for the reason it went on TextField, arrived at from the other side: there
  // the wrapper and the input are two elements and neither can move; here the one element must
  // stay Base UI's root, which owns the hidden input, the form association, the `indeterminate`
  // tri-state and the ARIA. Swapping it swaps all of that out silently.
  //
  // `nativeButton` goes WITH `render`, because it only describes an element `render` could
  // have produced. Left reachable it was worse than dead (audit 2026-08-05, D10): it flips
  // Base UI's wiring to expect a real <button> that can never exist here — the id moves off
  // the hidden input so no label can find it, and Space stops toggling. A prop whose every
  // value but the default breaks the component is not API.
  "children" | "render" | "className" | "nativeButton"
> & {
  size?: Size;
  /** Dresses the mark. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
};

/**
 * A checkbox (§4, §11) — the mark family's first member, and the first control in the system
 * whose painted box is not the height ladder's.
 *
 * It leaves that ladder because it is not a box that CONTAINS a label; it is one that sits
 * BESIDE one, so its size comes from the mark family (§4): one line of its label's type, which
 * is why it grows on a phone without a coarse ladder of its own — §17's handheld band raises
 * the type and the mark rides it. What it keeps from the ladder is the TARGET: the invisible
 * hit area is `--control-height-N`, so a checkbox is exactly as large a thing to aim at as the
 * Button beside it, and inherits the floor and target guarantees §16 already proved.
 *
 * No `tone` and no `emphasis`, which is the same refusal TextField made and for a stronger
 * reason: loudness ranks actions and a checkbox is not one, and a form where one checkbox is
 * a different colour from the next names nothing that the label could not say better. The one
 * tone it has is the one §11 assigns it — neutral off, accent on — and that is an identity
 * rather than an axis. No `material` either: a 20px square of blur is a 20px square.
 *
 * Indeterminate is Base UI's, and it is a real third state rather than a visual: the hidden
 * input carries it, so a parent checkbox over a partially-selected group submits and announces
 * correctly. The glyph swap is CSS reading `data-indeterminate` — no JS at interaction time.
 */
export const Checkbox = React.forwardRef<HTMLSpanElement, CheckboxProps>(function Checkbox(
  { size = "2", className, ...props },
  ref,
) {
  return (
    <BaseCheckbox.Root
      // The honest ref type (audit 2026-08-05, D12): Base UI's root renders a <span> with the
      // form input hidden beside it. This was typed HTMLButtonElement with a cast to make the
      // lie compile — so `ref.current.form` type-checked and was undefined at runtime. Every
      // sibling component names its real element; now this one does. The hidden input stays
      // reachable through Base UI's own `inputRef` prop when the form element itself is needed.
      ref={ref}
      className={className ? `kui-control kui-checkbox ${className}` : "kui-control kui-checkbox"}
      data-size={size}
      // Fixed identity, not API (TextField's pattern): the tone indirection needs a family to
      // resolve --tone-solid against for the ON state, and accent is what §11 assigns every
      // binary control. The resting box does NOT read this family — it wears --color-border,
      // the tone-independent hairline — which is what keeps "neutral off" true.
      data-tone="accent"
      data-bordered
      {...props}
    >
      {/* keepMounted, because the alternative is styling an element that is not there: with
          the default the indicator unmounts while unchecked, and the resting box would have
          no glyph to hide, no glyph to transition from when motion lands, and a different DOM
          shape in each state for a test to assert against. */}
      <BaseCheckbox.Indicator
        keepMounted
        render={
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden />
        }
      >
        {/* Both glyphs ship and CSS picks, so the tri-state costs no JS. Stroked rather than
            filled: a stroke scales across the ladder's 16-28px without the mitre artefacts a
            filled tick shows at the small end, and `currentColor` inherits the APCA-chosen
            pairing the checked fill sets. */}
        <path
          className="kui-checkbox-check"
          d="M4 8.5 6.75 11.25 12 5.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="kui-checkbox-dash"
          d="M4.25 8h7.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
});
