import { Box } from "@kookie-ui/react";

/**
 * The frame every documentation page sits in (2026-08-25).
 *
 * Three facts, and they are the same three on every page, which is why they live here rather
 * than being restated three times and drifting.
 *
 * AIR ABOVE THE TITLE. A page used to begin 24px under the header's hairline — the content
 * pane's own padding and nothing else — so every title started where the chrome stopped. A
 * title needs room to be a title; both references this site is measured against give it a
 * clear band of nothing. 32px on top of the pane's 24 puts the first baseline 56px down.
 *
 * AIR BELOW THE LAST BLOCK, for the opposite reason: a document that ends flush with the
 * viewport's edge cannot be scrolled to a comfortable resting position, so the last section is
 * always read jammed against the bottom of the window.
 *
 * ONE COLUMN, CENTRED IN THE PANE. The width is the caller's — a chapter is a reading column
 * with a table of contents beside it, a component page is prose over wide tables, the front
 * door is neither, and one number here would be wrong for two of the three. What is NOT the
 * caller's is the centring: at 1440 the old flush-left arrangement left 145px of dead pane on
 * the right and 24px between a vertical rule and the first character of every line. The
 * measure does not change; the leftovers are split.
 */
export function PageFrame({
  width,
  children,
}: {
  /** The page's own maximum, as a CSS length. It bounds the whole frame, so a page with a
      gutter column states the total rather than the reading column's share of it. */
  width: string;
  children: React.ReactNode;
}) {
  return (
    <Box pt="7" pb="9" style={{ maxInlineSize: width, marginInline: "auto" }}>
      {children}
    </Box>
  );
}
