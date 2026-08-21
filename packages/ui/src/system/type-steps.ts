import type { Size } from "./axes.ts";
import type { TypeSize } from "../components/text/text.tsx";

/**
 * The house composition steps for type a COMPONENT OWNS (§15, §25, §29).
 *
 * The standing rule is that a surface never sizes the type inside it — a card, a dialog's body,
 * a ground all hold the call site's words and the call site states their step. The exception is
 * type the SYSTEM owns, and ownership is what licenses the index to reach it: a dialog's title
 * and description exist because the a11y wiring forces them, an alert's because its whole
 * anatomy is closed, and a notice's message because a notice is an alert that does not
 * interrupt — one sentence in a fixed arrangement, not a composition somebody built.
 *
 * Shared so the members cannot drift: an alert, a dialog and a notice at the same index are the
 * same typography, which is what makes §15's confirm card and a size-3 dialog one thing.
 * Size 3 is the anchor and holds the values Dialog and AlertDialog shipped with (title 6,
 * body 3), so adopting them moved every index EXCEPT the one anybody had judged.
 *
 * **Promoted here on the third consumer (2026-08-21).** They lived in `system/floating.tsx`
 * while both consumers were floating panels; a notice floats over nothing, so importing a
 * step from the floating layer would have been a lie about where the rule comes from — and the
 * old names said `OVERLAY_`, which stopped being true in the same commit. The rule is
 * ownership, so the names say ownership.
 */
export const OWNED_TITLE_STEP: Record<Size, TypeSize> = {
  "1": "4",
  "2": "5",
  "3": "6",
  "4": "7",
};
export const OWNED_BODY_STEP: Record<Size, TypeSize> = {
  "1": "2",
  "2": "2",
  "3": "3",
  "4": "3",
};
