"use client";

import * as React from "react";

import type { Size } from "./axes.ts";
import { useTheme } from "../theme/theme.tsx";

/**
 * The size a component takes when it states none of its own (§4, §5, §28).
 *
 * THREE LAYERS, and the order is the design: what the caller said, else what the UNIT around
 * it said, else what the app said. Nothing below that — the final rest lives in
 * `themeDefaults.size`, which is the one place the number 2 is written.
 *
 * **The unit layer** is `SizeScopeContext`, and its providers are things a person sizes as one
 * object. `Field` was the first (§28): `<Field size="2">` sizing the label, the description,
 * the error AND the input is what a person means when they type it, and the alternative leaves
 * a size-4 input under a size-2 label with no way to state the pairing once. `Composer` joined
 * 2026-08-23 for the same reason — a size-4 box whose row of controls all sat at 2 is not a
 * size-4 anything (Kushagra, from the preview page).
 *
 * **The app layer is the Theme, added 2026-09-05**, and this file argued against it until the
 * day it shipped. The sentence that stood here was: providers are named units, not ambient
 * scopes, because "a unit is something you point at, and a theme is not". That is a good
 * argument about UNITS and it was never an argument about the app's own scale. Two things
 * answer it. The first is that every other question of this kind is already ambient from that
 * same element — density, pointer, radius, appearance, contrast, depth and material all reach
 * a control forty levels down and none of them is called action at a distance, because the
 * Theme is where an app states what it is. The second is the arithmetic: an app whose scale is
 * 3 had to write `size="3"` on every control it renders, and a value repeated at every call
 * site is not a default, it is a tax.
 *
 * **What still bounds it is unchanged, and it is what makes the widening safe:**
 *
 * 1. **An explicit prop always wins.** The caller's value is read first, so a component is
 *    never re-sized behind a stated number.
 * 2. **A unit beats the app.** `SizeScopeContext` is nearer, so a `<Field size="2">` inside a
 *    `<Theme size="4">` still sizes its own control at 2 — which is the whole reason the unit
 *    layer exists and the reason it did not collapse into the theme when the theme arrived.
 * 3. **`null` still means nobody asked.** The scope context's default is not a size — a
 *    defaulted context cannot be told apart from a Field that chose 2, which is what makes an
 *    inheritance bug invisible instead of merely wrong. The THEME may hold a real value because
 *    it is the outermost layer and has nothing further to defer to.
 *
 * **Who reads it is every family on the 1-4 index and nothing else.** The type family does
 * not: Text rests at 3, Heading at 6, on a ladder nine steps long rather than four, so it can
 * share neither this rest nor this range — a `size="4"` app would mean maxed-out controls
 * beside barely-larger-than-body text. The inert atoms (Code, Kbd, Badge, Avatar, Chip) rest
 * at NOTHING on purpose and take the line they sit in; a theme value reaching them would end
 * that. Both absences are law-asserted, because an absence nothing reads is an absence that
 * comes back.
 */
export const SizeScopeContext = React.createContext<Size | null>(null);

/**
 * Resolve a component's index: what the caller said, else what the unit said, else the app's.
 *
 * Read by every component on the 1-4 ladder — the control family, and the compounds beside it
 * (Card, Surface, Dialog, AlertDialog, Menu, Popover, Command, Tabs, Table, Tree, Row,
 * Accordion, Notice, Composer, Field, Shell, Breadcrumb, Attachment, CodeBlock). NOT by Text,
 * Heading or Blockquote, and not by the inert atoms.
 *
 * A hosted control — one in a TextField's slot — is unaffected by any of this:
 * `--kui-ct-hosted-height` is a registered length declared on the SLOT, so CSS sizes it from
 * its container whatever index it carries.
 */
export function useSize(explicit?: Size): Size {
  const scoped = React.useContext(SizeScopeContext);
  const theme = useTheme();
  return explicit ?? scoped ?? theme.size;
}
