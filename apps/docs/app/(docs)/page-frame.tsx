import { Box, Heading, Stack, Text } from "@kookie-ui/react";

import { SiteFooter } from "./site-footer";

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

/**
 * The page's title and its deck (2026-08-27).
 *
 * ONE HOME FOR ONE INTERVAL. Six pages each stated `<Stack gap="3">` around an `h1` and a
 * deck — six copies of a claim about how far a title sits from the sentence under it, which
 * is six places to correct and five places to miss. It is one relationship, so it is one
 * component now, and the number below is the only place it is written.
 *
 * THE NUMBER WAS THE CARD'S. §15's house intervals state title→description at `2`, and that
 * interval was measured on a card: a 24px title over 16px body. Applied unchanged to a 40px
 * title over a 20px deck it is the rule-written-for-one-element defect this repo keeps
 * finding — measured, 8px declared and ~16px of optical whitespace under a title whose own
 * lines are 48px apart, so the deck read as a third line of the title rather than as the
 * sentence beneath it.
 *
 * `6` (24px) instead — judged by eye at 1440 against 12, 16 and 24 (Kushagra, 2026-08-27).
 * `5` was tried first and shipped for an hour; 24px is what a 40px title actually wants.
 *
 * WHAT THE CALLER STILL OWES: the interval BELOW this block. Proximity asks the two distances
 * to differ by at least two layout-space steps, so a page putting something directly under the
 * deck states `8` or more — not `7`, which at 32px reads as almost the same distance twice.
 *
 * NEITHER CHILD TAKES THE READING MEASURE, and that reverses what this block used to do. The
 * title and the deck were both held to `--kd-measure`, a pixel number derived from a character
 * count at BODY size — and a measure is characters, so one pixel cap cannot be right at two
 * ends of a nine-step scale. Measured on the front door at 1440, in an 832px column: the title
 * held 19 characters a line and the deck 64, against a comfortable band of 45–75. The block had
 * three right edges, title 559, deck 622 and container 832, and the shortest belonged to the
 * largest type on the page.
 *
 * The fix is not a second cap. It is that the CAP WAS CHASING THE TYPE: at 20px, filling an
 * 832px column costs 85 characters, which is past the ceiling — so the deck was shrunk to fit a
 * measure instead of being sized so the column IS one. At `6` it came to 70 characters on the
 * front door, 61 in a chapter and 69 on a component page, all inside the band and all filling
 * their column. So the cap is gone from both children and the deck went up one step.
 *
 * DOWN ONE STEP AGAIN, TO `5` (Kushagra, 2026-08-28, by eye) — `6` read too close to the title
 * itself once the two sat this near each other at `TITLE_GAP`. `5` only WIDENS the character
 * count past the 70/61/69 figures above, so the band argument still holds; nothing here re-
 * checks whether a narrower page still fills its column, because a smaller face fills it with
 * room to spare rather than running short.
 *
 * AND DOWN ONE MORE, TO `4`, when the title went to `8` (2026-08-29, Kushagra) — `5` was
 * judged under a 56px title, and it is the sentence directly under a 40px one now. This
 * shipped for an hour as a two-entry MAP keyed on a title `size` prop, and the prop went with
 * it: there is one title step in this app, so a map with one live entry is a mechanism for a
 * variation that does not exist. What the map got right survives as a sentence — a deck is
 * ranked against its own title, so the two cannot be chosen apart.
 *
 * THE COST, on chapters rather than on the front door: the deck is now one ramp step over the
 * body (18px against 16) where it was two. Size is the only thing ranking it — the deck is
 * loud and the body under it is loud — so if a chapter starts reading flat at the top, this is
 * the line to look at first.
 *
 * AND ON A CHAPTER THE POINT IS NOW MOOT, which is the better answer (2026-09-01): that page's
 * COLUMN is the measure, so the title and the deck are held to it by the box they sit in rather
 * than by a cap of their own — one right edge for the title, the deck, the prose and every
 * figure. This block still states no width, and that is what let the chapter change its mind
 * without touching this file. The paragraphs above stay because they are still the reason a cap
 * does not belong HERE, and because the pages whose column is deliberately wider than a reading
 * column — a component page, the front door — are still the case they were written about.
 */
const TITLE_GAP = "6";

export function PageTitle({
  children,
  deck,
}: {
  /** The page's title. Rendered as the page's one `h1`. */
  children: React.ReactNode;
  /** The sentence under it, set well above the body — this is the most important sentence on
      the page. */
  deck: React.ReactNode;
}) {
  return (
    <Stack gap={TITLE_GAP}>
      {/* `8`, DOWN FROM `9`, AND IT IS THE WHOLE APP (2026-08-29, Kushagra). It landed on the
          front door alone, as a `size` prop, on the argument that only that page sets the mark
          above its title — which was a reason for that page to be FIRST, never a reason for it
          to be the only one. 56px is a poster; 40px is a document, and a docs site is
          documents. The prop went with the exception: one answer, stated once.

          IT ALSO PUT THE FRONT DOOR BACK IN LINE WITH THE REST OF THE SITE. A chapter's `h2`
          is `6` and a component page's is `6`, so both already read title-then-two-ramp-steps
          while the front door alone read `9 / 7`. At `8 / 6` every page states one interval,
          and a section heading is the same size wherever a reader meets one. */}
      <Heading size="8" render={<h1 />}>
        {children}
      </Heading>
      {/* LOUD AGAIN (Kushagra, 2026-08-28, later the same day) — reversed from the MEDIUM call
          directly above, which argued size alone was enough to rank the deck under the title
          without also dropping its contrast. Left standing rather than deleted, because the
          size argument is still true and still why the deck does not need QUIET's 2026-08-25
          mistake repeated: it was never about rank being illegible, it was that the sentence
          under the title is the one most readers see first, and that sentence should read at
          full strength like the rest of body copy does. */}
      <Text size="4" render={<p />}>
        {deck}
      </Text>
    </Stack>
  );
}
