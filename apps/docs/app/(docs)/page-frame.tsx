import { Box, Stack } from "@kookie-ui/react";

import { SiteFooter } from "./site-footer";

/**
 * The frame every documentation page sits in (2026-08-25).
 *
 * Three facts, and they are the same three on every page, which is why they live here rather
 * than being restated three times and drifting.
 *
 * THE AIR ABOVE THE TITLE LEFT THIS FILE 2026-09-06, and so did the title. `Page` (§46) owns
 * both now: the air is its own, and the clearance under a floating band — which this frame
 * never had, so every title on the site was starting underneath the chrome — comes with it.
 * What stays here is what is genuinely the FRAME's rather than the page's.
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
    <Box pb="9" style={{ maxInlineSize: width, marginInline: "auto" }}>
      {/* THE FOOTER IS THE FRAME'S, NOT THE CHROME'S (2026-09-01). It was hung in the content
          pane first, which put one full-window block under a 40rem reading column — the exact
          mismatch that had just been fixed one route over. Here it takes whatever measure the
          page states, so every page's floor is that page's own width and nothing in
          `site-footer.tsx` knows any of the three numbers.

          `10` under it, against the `9` the pages use between their own sections: the footer is
          not another section, it is what the page ends at, and §15 asks the outer interval to
          be the larger one. */}
      <Stack gap="10">
        {children}
        <SiteFooter />
      </Stack>
    </Box>
  );
}
