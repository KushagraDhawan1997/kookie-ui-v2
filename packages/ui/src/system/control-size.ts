"use client";

import * as React from "react";

import type { Size } from "./axes.ts";

/**
 * The size a control takes when it states none of its own (§28).
 *
 * TWO providers, and both are UNITS a person sizes as one thing. `Field` was the first: a
 * control inside a labelled field is part of one unit — `<Field size="2">` sizing the label,
 * the description, the error AND the input is what a person means when they type it, and the
 * alternative leaves a size-4 input under a size-2 label with no way to state the pairing once.
 * `Composer` joined 2026-08-23 for the same reason: `<Composer size="4">` is one box, and a
 * size-4 box whose row of controls all sat at 2 is not a size-4 anything (Kushagra, from the
 * preview page). What is NOT a provider stays the list it always was — Theme, Box, and every
 * surface — because a unit is something you point at, and a theme is not.
 *
 * **This is the mechanism §28 names as the component's riskiest half, and the reason is
 * written into the repo four times over**: `--kui-h` collided across two layers because a
 * name inherited silently, the material veil inherited into nested panes twice, and both
 * `@property inherits: false` guards exist because of it. Silent inheritance is this
 * project's most-repeated defect. Three things bound it here, and each has a law:
 *
 * 1. **Providers are named units, not ambient scopes.** Theme does not supply it, `Box` does
 *    not, no surface does. A control can only inherit a size from a Field or a Composer it is
 *    actually inside, so the reach is one wrapper deep and visible in the markup that put it
 *    there. Adding a third provider is a decision with a call site behind it, the same bar the
 *    reader list below carries.
 * 2. **An explicit prop always wins.** `useControlSize` reads the caller's value first and
 *    the context only when the caller stated nothing, so a control is never re-sized behind
 *    a stated number.
 * 3. **`null` means nobody asked.** The context default is not `"2"` — a defaulted context
 *    cannot be told apart from a Field that chose 2, which is what makes an inheritance bug
 *    invisible instead of merely wrong.
 *
 * If it does not survive its laws, the fallback is API-compatible: Field prices only its own
 * text and every control keeps the default it has today (§28).
 */
export const ControlSizeContext = React.createContext<Size | null>(null);

/**
 * Resolve a control's index: what the caller said, else what the Field said, else the control
 * family's own rest at 2 (§4).
 *
 * Read by Button since 2026-08-23; still NOT by Card, Dialog or the type family.
 *
 * The old exclusion argued that "a button beside that control is a sibling in the form's layout
 * and takes the form's index, not the field's" — and that is right about a button BESIDE the
 * field, which is exactly the button React context cannot reach. What it did reach was a button
 * INSIDE the unit, and there the rule inverts: a composer's row is inside the composer, so
 * `<Composer size="4">` holding size-2 buttons was the index failing to mean anything. Widening
 * still required a call site, which is the bar this paragraph has always set; the composer is
 * that call site.
 *
 * A hosted button — one in a TextField's slot — is unaffected either way: `--kui-ct-hosted-height`
 * is a registered length declared on the SLOT, so CSS sizes it from its container whatever index
 * it carries.
 */
export function useControlSize(explicit?: Size): Size {
  const inherited = React.useContext(ControlSizeContext);
  return explicit ?? inherited ?? "2";
}
