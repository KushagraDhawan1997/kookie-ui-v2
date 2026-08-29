import Link from "next/link";
import {
  Flex,
  Grid,
  Heading,
  Link as KookieLink,
  Stack,
  Text,
} from "@kookie-ui/react";

import { PageFrame, PageTitle } from "./page-frame";
import { Wordmark } from "./wordmark";
import { SECTIONS, chaptersIn } from "./chapters";
import { ENTRIES } from "./components/registry";
import { BLOCKS } from "../../blocks";

/**
 * The front door.
 *
 * IT LED WITH A MANIFESTO UNTIL 2026-08-29, and it does not any more (Kushagra, holding it up
 * against Apple's HIG and Material's own front pages: "I dont think What this design system
 * claims should be the first thing user sees, or am I wrong"). He is not wrong, and both
 * references say the same thing: a title, one or two plain sentences, and then straight into
 * WAYFINDING — Apple's "Design fundamentals" and "Foundations of design" are a heading, a
 * sentence and a grid of real destinations, three times down the page; Material's is a line and
 * a Get started. Neither asks a visitor to agree with anything before they have seen a
 * component.
 *
 * WHY THE CLAIMS WENT RATHER THAN MOVING DOWN THE PAGE. Six cards, each stating a position in
 * three sentences, is a compressed second copy of a chapter that already argues the same thing
 * at length — Appearance and Colour are `foundations/color` and `philosophy/why-these-rules-
 * hold`, Responsiveness is `foundations/responsiveness`, Material and Motion are their own
 * chapters, and Correctness is the first paragraph of `philosophy/why-kookie-exists` almost
 * word for word. One home per fact is this repo's oldest rule, and the chapters are the home.
 * Kept at the foot of the page they would have been dead space too: a reader who has just been
 * handed the routes does not scroll past them to read a manifesto.
 *
 * WHAT STILL CARRIES THE POSITION is the deck — one sentence, above the fold, saying that this
 * gives you one way to say what something means and that the reason is what screens look like
 * months apart — and the Philosophy cell, which the index names and routes into.
 *
 * A CORRECTION IN THE OTHER DIRECTION, recorded because it was mine: I argued on 2026-08-28
 * that the site index duplicates the sidebar and should be cut. Apple's HIG has that exact
 * sidebar AND repeats the whole tree as tiles on its front page. Duplicating the navigation
 * visually is the reference pattern rather than a fault — a permanent nav is for returning to
 * a place, and a front-page index is for finding out what the places ARE.
 *
 * Composed under the house style it argues for, which is the least this page owes: no more
 * focal actions than the page has real ones (2026-08-28: zero), differentiated rhythm, the §15
 * type ladder, and no size 1 anywhere. If this page broke those rules, nothing else on the
 * site would be worth reading — and it has broken all three at one point or another.
 *
 * THE LADDER STEPPED DOWN WITH THE TITLE (2026-08-29, Kushagra). The title went `9` → `8`
 * when the mark arrived above it, and the steps under it did not move, so a 40px title sat one
 * step over a 30px section heading and the page lost its top two rungs to each other. The
 * whole ladder is one step lower: title `8`, section `6`, cell title `5`, body `3`.
 *
 * WHAT THIS COSTS, stated rather than buried: §15's house ladder is page `8`, section `7`,
 * card title `6`, body `3`, and this page now reads `8 / 6 / 5 / 3`. That brief is written for
 * a composed app surface — a card in a pane, a heading over a form — where the steps sit close
 * together and nothing separates them. A document puts a deck, a section break and 48px of
 * nothing between each rung, and at that spacing one step of the ramp is not a rank a reader
 * can see. THE REST OF THE SITE HAS ALWAYS AGREED with the section rung: a chapter's `h2` and
 * a component page's are both `6`. So the front door was the outlier at `7`, and what §15 owes
 * is the distinction — a page is not a pane — rather than any of these pages owing an
 * exception.
 *
 * IT WAS BOXING AND RULING THE SAME BREAKS. Cards held every group, Separators divided the
 * sections, and a `gap 7` sat between them: enclosure, a line and distance all saying one
 * thing, where §15 asks for whichever one of the three is doing the work.
 *
 * AND IT WAS SPELLING LINKS AS BUTTONS — twenty-seven controls on a page with one thing to do.
 * A button is a verb; a chapter is a place, and the thing that goes to a place is a link. The
 * top row of three went to ZERO on 2026-08-28 (Kushagra: "nothing has 3 CTAs — this isn't the
 * standard"): three clickable things side by side read as one CTA row whether or not the
 * middle one is a `<Button>`, and `Get started` pointed at the exact chapter the index below
 * already links to.
 */
/**
 * 48rem, which was 62 and then 52.
 *
 * `PageFrame` states that the width is the caller's, because the front door is neither a
 * chapter nor a component page — and this page had never claimed a number of its own, so it
 * took the component index's 62. That ran a paragraph to 484px, roughly 65 characters a line,
 * at the top of the comfortable band and reading as a wall.
 *
 * 48rem IS A FLOOR, NOT A PREFERENCE, and the index grid is what sets it: two tracks at
 * `minmax(20rem, 1fr)` with a 32px gutter need 672px, and the frame is 768. Each column runs
 * about 45 characters a line, the bottom of the comfortable band — a section blurb is two
 * sentences rather than prose, which is what makes that liveable.
 *
 * THE TRACK LIST IS BACK ON THE GRID (2026-08-29), after a day in `prose.css`. It moved there
 * because the divided ground's separators had to know which edges touch, which means knowing
 * the column count — and it moved back the hour the ground did, because `auto-fit` needs no
 * count at all. A fixed two columns plus a container query plus an opted-in `<Box container>`
 * were three mechanisms standing in for one that ships in the box.
 */
export default function Home() {
  return (
    <PageFrame width="48rem">
      <Stack gap="10">
        {/* THE MASTHEAD: the mark, then the title, then the deck (2026-08-29, Kushagra).
            This is the one page that carries the mark in the reading column rather than only
            in the chrome, and it is why the title states `8` — see `PageTitle`.

            `4` (12px) between the mark and the title, against `6` (24px) from the title to
            its deck. The two are a LOCKUP: the mark says the name in a drawn letter and the
            title says it in words, so they are one unit and the deck is the sentence under
            that unit. Proximity's two-step rule is what keeps the three from reading as a
            column of equals, and it is why the interval below this block is `10` and not `8`
            — the mark added a line above, so the block is taller and needs more clearance
            under it than it did.

            The wrapper Stack was a `gap="8"` around ONE child before the mark existed, which
            is a distance that could never apply to anything. */}
        <Stack gap="4">
          <Wordmark size="9" />
          <PageTitle deck="A design system for React that covers the components, the rules behind them and the tools that check your screens against those rules. It gives you one way to say what something means, which is fewer choices than you may be used to and the reason screens built months apart still look like one product.">
            Kookie User Interface
          </PageTitle>
        </Stack>

        {/* NO HEADING OVER THIS (2026-08-29, Kushagra: "Do I need 'Everything on this site'
            now?" — no). It read as a section label while the claims were the section above it;
            with the claims gone the grid is the whole page, and a heading over the only thing
            on a page is a second title for it. Apple states its section headings because it has
            three groups; there is one here, and the deck already said what the page is.

            THE CELLS TOOK THE `h2` WITH IT. They were `h3` under that heading, and dropping it
            would have left the document going `h1` → `h3` — a level skipped, which is what a
            screen reader's outline reads. Each cell IS a top-level section of this page, so
            each states `h2` and keeps its size: the level is the structure and the step is the
            look, and this is the one page where they do not happen to line up.

            AND THE GROUND WENT TOO (Kushagra, same hour: "do we need it on main page? Keep a 2
            col layout, remove the surface and grid lines, just promote them one level up").
            The divided ground was built to hold CELLS OF ONE THING — six claims that were six
            faces of a single argument, where a rule between them says "these belong together
            and here is where one ends". Six destinations are not that. They are six separate
            places, and a pane around them says they are one region of the page when the page
            IS them. So the sections are promoted to the page: no ground, no rules, and DISTANCE
            carries the grouping, which is §15's own instruction to take whichever of enclosure,
            a line and distance is doing the work and only that one.

            WHAT IT BOUGHT BACK, and this is the tell that the shape was fighting the content:
            the container query and its `<Box container>` are both gone. `auto-fit` needs no
            column count, because nothing has to know which edges touch any more — that was the
            separators' requirement, not the layout's. Three mechanisms deleted for one that was
            already in the box.

            `9` (48px) between rows against `7` (32px) between columns: a row break is a bigger
            gap than a column gutter or the grid reads as one wandering list, and both are clear
            of the `4` inside a cell by the two steps proximity asks for. */}
        <Stack gap="8">
          {/* SIX SECTIONS: the four authored ones, then the component index and the workbench,
              which are places a reader goes without being chapters.

              The links inside stay an unbordered `Grid`: a pane around every chapter would
              turn a reading list into a stack of buttons, and `Row`'s own resting-transparent
              problem (below) would return one level down for the same reason it was rejected
              one level up. */}
          <Grid
            columns="repeat(auto-fit, minmax(20rem, 1fr))"
            gapX="7"
            gapY="9"
          >
            {SECTIONS.map((section) => {
              const chapters = chaptersIn(section.id);
              if (chapters.length === 0) return null;
              return (
                <Stack key={section.id} gap="4">
                  <Stack gap="3" className="kd-prose">
                    <Heading size="5" render={<h2 />}>
                      {section.title}
                    </Heading>
                    <Text size="3" emphasis="medium" render={<p />}>
                      {section.blurb}
                    </Text>
                  </Stack>
                  {/* ONE COLUMN (2026-08-29). These were an `auto-fill` grid, written when
                      the index was one full-width ground and each section had ~320px inside a
                      padded cell — one track, a list. Promoting the sections gave each column
                      ~368px, which fits two 176px tracks, and the list quietly became a
                      two-column table nobody asked for: reading order goes across instead of
                      down, and "The component families" wrapped onto two lines mid-list.

                      A section's chapters ARE a list, so it is a Stack and the number of
                      columns stops being a function of how much room the cell happens to have.
                      Foundations is ten rows tall and its row is therefore taller than the
                      Patterns cell beside it — the correct trade, and the one Apple's own
                      tile columns make.

                      `Row` was tried here first and read wrong: a row is a member of a LIST
                      and its resting state is transparent, so away from the panel a menu or a
                      sidebar gives it, twenty-one of them floated as stray words with no
                      affordance until the pointer arrived. A chapter is a place and the thing
                      that goes to a place is a link — which is also the one spelling that says
                      so while nobody is pointing at it. */}
                  <Stack gap="3" align="start">
                    {chapters.map((chapter) => (
                      <KookieLink
                        key={chapter.slug}
                        size="3"
                        render={<Link href={`/${chapter.slug}`} />}
                      >
                        {chapter.title}
                      </KookieLink>
                    ))}
                  </Stack>
                </Stack>
              );
            })}

            {/* The component index is not a section of chapters, so it is written here
                rather than added to `chapters.ts` — that registry drives the sidebar too,
                and a fifth entry there would invent a section the navigation does not
                have. The count is read off `ENTRIES` rather than typed, because a number
                in prose is the first thing to go stale. */}
            <Stack gap="4">
              <Stack gap="3" className="kd-prose">
                <Heading size="5" render={<h2 />}>
                  Components
                </Heading>
                <Text size="3" emphasis="medium" render={<p />}>
                  Every component in the package, grouped by family. Each page
                  tells you what the component is, which props it takes, and
                  what it will not do and why.
                </Text>
              </Stack>
              <Flex>
                <KookieLink size="3" render={<Link href="/components" />}>
                  All {ENTRIES.length} components
                </KookieLink>
              </Flex>
            </Stack>

            {/* The builder was a section of its own at the foot of this page until
                2026-08-29, which is where a reader met it after the index had already
                finished. It is a place, so it belongs among the places — and this is also
                the cell that keeps the front door honest about what the tools are: the
                builder is the shortest demonstration that the guidelines here are
                enforced rather than asserted. */}
            <Stack gap="4">
              <Stack gap="3" className="kd-prose">
                <Heading size="5" render={<h2 />}>
                  Workbench
                </Heading>
                <Text size="3" emphasis="medium" render={<p />}>
                  Build a screen by dragging real components into place, and
                  copy whole patterns out of it. Every size and distance comes
                  from the system&apos;s own scales, so you cannot draw what the
                  code could not express.
                </Text>
              </Stack>
              <Stack gap="3" align="start">
                <KookieLink size="3" render={<Link href="/builder" />}>
                  Builder
                </KookieLink>
                <KookieLink size="3" render={<Link href="/blocks" />}>
                  Blocks ({BLOCKS.length})
                </KookieLink>
              </Stack>
            </Stack>
          </Grid>
        </Stack>

      </Stack>
    </PageFrame>
  );
}
