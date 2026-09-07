import Link from "next/link";

import { Surface } from "@kookie-ui/react";

import { Footer } from "../../blocks/footer";
import { CHAPTERS, SECTIONS } from "./chapters";
import { WebMcp } from "./webmcp";
import { Wordmark } from "./wordmark";

/**
 * This site's own footer, and the footer block's first real consumer (2026-09-01, Kushagra:
 * "lets add footer to the pages, dogfood it, use the wordmark instead of raw name").
 *
 * DOGFOODING IN THE ONLY SENSE THAT COUNTS: it is the same file a reader copies off
 * `/blocks/footer`, with no docs-only variant beside it. What that already found is recorded in
 * `blocks/footer.tsx` — the resting ink was written in the block's stylesheet and lost to the
 * package's own `data-emphasis` rule, which a demo could have hidden and a real page did not.
 *
 * THE COLUMNS ARE THE NAVIGATION'S OWN DATA. Both this and the sidebar read `CHAPTERS` and
 * `SECTIONS`, so the footer cannot list a chapter that does not exist or miss one that does; a
 * hand-written list here would be the sidebar's contents in a second home, which is the fault
 * this repo spends most of its time removing. `Reference` is the one hand-written column,
 * because those three destinations are not chapters and there is no list to derive them from.
 *
 * IT SITS ON A GROUND (2026-09-06, Kushagra: "Can we wrap our footer in Surface?"), which is the
 * block's own mechanism used exactly as written: the block draws no pane and says a footer that
 * wants one is `<Surface><Footer/></Surface>` at the call site, so this is one element here and
 * not a prop or a branch in `blocks/footer.tsx`.
 *
 * IT REVERSES WHAT THIS FILE SAID, and the argument it reverses was that a floor under a reading
 * column reads as one more card at the end of the article. Looked at, it does not: the ground is
 * a step UNDER the page rather than a card on it, so the footer reads as the page's floor and
 * the article stops where the pane starts — which is the one thing 40rem of unbounded links at
 * the end of a chapter never said. What is true of the old argument is that the pane now shares
 * its fill with the code wells above it, since `CodeBlock` is a `Surface` too; on a chapter dense
 * with samples the floor is the same material as the last three blocks over it. Stated rather
 * than defended: if that reads wrong, the repair is this one element, not a change in the block.
 *
 * WHERE IT RENDERS is `PageFrame`, not the chrome, and that is the whole reason this is a
 * component rather than four lines in `docs-chrome.tsx`. A footer hung in the pane would be the
 * one full-window block under a 40rem reading column — the mismatch Kushagra had just had fixed
 * one route over. Inside the frame it takes whatever measure the page states, so a chapter's
 * floor is the chapter's width and a component page's is the component page's, with nothing
 * here knowing either number.
 */
export function SiteFooter() {
  const groups = SECTIONS.map((section) => ({
    title: section.title,
    links: CHAPTERS.filter((chapter) => chapter.section === section.id).map((chapter) => ({
      label: chapter.title,
      href: `/${chapter.slug}`,
    })),
  })).filter((section) => section.links.length > 0);

  return (
    /* IT TAKES THE PAGE'S APPEARANCE. A pinned `appearance="dark"` stood here for a day and is
       gone: a floor that is dark while the page above it is light is a region that has stopped
       being the system, and the ground already says everything the pinned mode was saying — a
       step under the page, in whichever mode the reader chose. */
    <Surface>
      <Footer
        brand={
          /* The mark, not the word typed out again. `Wordmark` is where the face, the weight and
             the collapsed line box live; the link is the only fact that belongs to this
             placement, and the accessible name is the link's because the glyph is decoration
             doing a logo's job — the same arrangement the sidebar's header states. */
          <Link
            href="/"
            /* The NAME MATCHES WHAT IS DRAWN. The glyph is `aria-hidden`, so the link states the
               name — and a link whose visible words and announced name disagree is the failure
               SC 2.5.3 is about, even where the visible words are decoration. The sidebar says
               "KookieUI" because that is the form it draws. */
            aria-label="Kookie User Interface"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {/* UP FROM THE MASTHEAD'S RATHER THAN DOWN, AND ONE STEP OFF THE TOP (2026-09-01,
                Kushagra: "its too small"; `9` → `8` on 2026-09-06). It shipped at `7` on the
                argument that a footer signs a page off rather than heading it — which reasons
                about the ROLE and ignores the room: the masthead sits in a 288px sidebar and
                this sits in the page's own column, so the step that reads as a mark there reads
                as a caption here. `9` answered that and then overshot it when the face changed:
                the step that measured 344px of ink under PP Playground measured 654 under Telma,
                which sets wider and heavier — most of the column, which is a masthead rather
                than a sign-off. `8` keeps the mark well above the sidebar's and stops it filling
                the line it ends on. */}
            <Wordmark form="full" size="8" />
          </Link>
        }
        groups={[
          ...groups,
          {
            title: "Reference",
            links: [
              { label: "All components", href: "/components" },
              { label: "Blocks", href: "/blocks" },
              { label: "GitHub", href: "https://github.com/KushagraDhawan1997/kookie-ui-v2" },
            ],
          },
        ]}
        /* THE SIGN-OFF, PLUS WHAT THIS PAGE OFFERS AN AGENT (§47).

           `WebMcp` renders null on every browser that does not implement the proposal, which is
           every browser today — so for a reader this is the copyright line it has always been.
           It sits inside `note` rather than in a row of its own because a capability nobody has
           asked for does not get a region: it is a fact about the page, said where the other
           facts about the page are said, in the quiet rung §15 minted for exactly that.

           IT MOUNTS HERE BECAUSE THE FOOTER IS ON EVERY DOCUMENTATION PAGE and is the last
           thing the frame renders, so registration happens after everything a reader came for.
           One mount, so "are the tools registered" has one answer rather than one per surface
           that wants to say so. */
        note={
          <>
            MIT licensed. © 2026 Kushagra Dhawan.
            <WebMcp />
          </>
        }
      />
    </Surface>
  );
}
