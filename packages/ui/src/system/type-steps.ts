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

/**
 * A BAND's title (§45) — one step above the words the same system writes in a `Notice` or an
 * alert, because a title names the thing you are looking at and a message merely says something.
 *
 * Derived rather than judged: it is `OWNED_BODY_STEP` moved up one, so the two ladders cannot
 * drift and neither carries a number the other does not explain. Measured against the row it
 * sits in, that is 16px in a 32px band at the resting index — the proportion macOS holds for a
 * document title in a toolbar.
 */
export const BAND_TITLE_STEP: Record<Size, TypeSize> = {
  "1": "3",
  "2": "3",
  "3": "4",
  "4": "4",
};

/**
 * The PAGE's own two steps (§15, §46).
 *
 * They are flat rather than indexed because a page has no index: there is one page step in an
 * app, and a map with one live entry is a mechanism for a variation that does not exist — which
 * is the argument that deleted a `size` prop from the docs' own title block before this was
 * promoted out of it (2026-08-29).
 *
 * `9` is the top of the ramp (2026-09-07, Kushagra: "for docs pages, the main heading, can we
 * make it one point bigger"). It was `8` — 40px, §15's own top-of-the-composition-ladder — on
 * the argument that `9` is a poster rather than a document. Judged on the real site, it is not:
 * a page title is the one piece of type with nothing above it, and at 8 it sat close enough to
 * the section headings under it that the page read as starting twice.
 * `4` is the deck: the most important sentence on the page, ranked under the title by size
 * alone and never by contrast, which is why it stays loud. Both numbers were judged by eye on
 * the documentation site across three page shapes (LOG 2026-08-27 → 2026-08-29) before they
 * came into the package.
 */
export const PAGE_TITLE_STEP: TypeSize = "9";
export const PAGE_DECK_STEP: TypeSize = "4";
