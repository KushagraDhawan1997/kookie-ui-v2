import Link from "next/link";

import { Footer } from "../../blocks/footer";
import { CHAPTERS, SECTIONS } from "./chapters";
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
          {/* The long form, and one step down from the masthead's: the name signs the page off
              here rather than heading it, and the extra two words are the emphasis. */}
          <Wordmark form="full" size="7" />
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
      note="MIT licensed. © 2026 Kushagra Dhawan."
    />
  );
}
