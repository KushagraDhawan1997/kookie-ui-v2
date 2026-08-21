"use client";

import * as React from "react";

import type { Size } from "./axes.ts";

/**
 * The size a control takes when it states none of its own (§28).
 *
 * `Field` is the only provider, and that narrowness is the design rather than an omission.
 * A control inside a labelled field is part of one unit — `<Field size="2">` sizing the
 * label, the description, the error AND the input is what a person means when they type it,
 * and the alternative leaves a size-4 input under a size-2 label with no way to state the
 * pairing once.
 *
 * **This is the mechanism §28 names as the component's riskiest half, and the reason is
 * written into the repo four times over**: `--kui-h` collided across two layers because a
 * name inherited silently, the material veil inherited into nested panes twice, and both
 * `@property inherits: false` guards exist because of it. Silent inheritance is this
 * project's most-repeated defect. Three things bound it here, and each has a law:
 *
 * 1. **One provider.** Theme does not supply it, `Box` does not, no surface does. A control
 *    can only inherit a size from a Field it is actually inside, so the reach is one wrapper
 *    deep and visible in the markup that put it there.
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
 * Deliberately NOT read by Button, Card, Dialog or the type family. A Field holds the control
 * its label names; a button beside that control is a sibling in the form's layout and takes
 * the form's index, not the field's. Widening the set of readers is a decision with a call
 * site behind it, not a convenience.
 */
export function useControlSize(explicit?: Size): Size {
  const inherited = React.useContext(ControlSizeContext);
  return explicit ?? inherited ?? "2";
}
