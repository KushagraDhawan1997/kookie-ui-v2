/**
 * One renderer over the chapter registry. Adding a chapter is adding a row and a file; no
 * page is ever written for it.
 *
 * The catch-all sits at the docs root, so it answers `/start/principles` and
 * every other `<section>/<name>` pair. `/components` and `/components/<slug>` are static
 * segments and win over it, which is Next's own specificity rule and the reason the component
 * reference can keep its own renderer.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Page } from "@kookie-ui/react";

import { ProseFlow } from "../../../mdx-components";
import { BY_SLUG, CHAPTERS } from "../chapters";
import { PageFrame } from "../page-frame";
import { chapterToc, type TocEntry } from "../toc";
import { TableOfContents } from "../../../blocks/table-of-contents";

export function generateStaticParams() {
  return CHAPTERS.map((chapter) => ({ slug: chapter.slug.split("/") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = BY_SLUG.get(slug.join("/"));
  if (!chapter) return { title: "KookieUI" };
  return { title: `${chapter.title} — KookieUI`, description: chapter.blurb };
}

/**
 * "On this page", in the gutter the reading measure leaves over.
 *
 * THE BLOCK IS WHERE THE ARRANGEMENT LIVES (2026-09-04, Kushagra: "I dont think this is a
 * complete component yet, and I think it should be a block"). It was written inline here with
 * four rules in `prose.css` beside it, and it had no current state at all — a list of headings
 * with nothing saying which one you were at, which is most of what a table of contents is for.
 * `blocks/table-of-contents.tsx` carries the rank, the rail and the observer, and states in
 * full why it is not a `NavTree` and why the current item is marked the way `Tabs` marks one.
 *
 * WHAT STAYS HERE IS THE COLUMN, and the split is the block law's own line: a block may not
 * decide a distance. How wide this gutter is and where the two-column arrangement stops fitting
 * are measurements about this page's layout rather than about anything's box, so `prose.css`
 * states them on `kd-toc` and hands the class over.
 *
 * NOT in the Shell's inspector, which is the pane that looks like it should hold this. An
 * inspector rests closed by design — its `auto` means "closed until asked for" — and a table of
 * contents nobody opens is a table of contents nobody reads. It is also per-page state, and the
 * inspector lives in the layout. So it is a sticky aside inside the chapter's own two-column
 * flow, shown only where there is enough structure to be worth scanning.
 */
function OnThisPage({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 3) return null;
  return (
    /* TWO ELEMENTS, because they hold two facts: the COLUMN is placed — out of the article's
       flow, at the pane's end, as tall as the chapter — and the nav inside it holds still while
       the page scrolls. One element cannot do both, since sticky is in-flow positioning. */
    <div className="kd-toc-column">
      <TableOfContents entries={entries} className="kd-toc" />
    </div>
  );
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const chapter = BY_SLUG.get(slug.join("/"));
  if (!chapter) notFound();

  const toc = chapterToc(chapter.source);
  const { Content } = chapter;

  return (
    /* ONE COLUMN, ONE WIDTH (2026-09-01, Kushagra: "I dont like that the title + specimen +
       the page desc. have a different width than prose").

       The column was 46rem and the prose inside it 40, so the title, the deck and every figure
       ran 96px past the sentences — two right edges on a page whose whole job is reading. The
       frame IS the measure now, so the title, the deck, every figure and the footer under them
       all end where the sentences end. `prose.css` carries why the text is what gives.

       THE FRAME NO LONGER CARRIES THE CONTENTS' COLUMN (2026-09-05). It was `40 + 3 + 14`, one
       box holding both, which is why the pair drifted left of the pane's own end as the window
       grew. The chapter reserves that same 17rem on the end side and the frame centres in what
       is left, so this number is the reading measure and nothing else — and the reading column
       lands where it already did at every width. `prose.css` carries the reserve, the pin and
       the width where the arrangement stops fitting; the gutter's own reason (2026-09-04, "the
       horizontal space between the table of contents and the page is too less") moved there
       with it. */
    <Box className="kd-chapter">
      <PageFrame width="var(--kd-measure)">
        <Page
          title={chapter.title}
          description={chapter.blurb}
          style={{ minWidth: 0 }}
        >
          {/* THE SECTION NAME USED TO SIT HERE, at `size 2 quiet`, and it was an eyebrow: two
              elements doing one element's job, which §15 refuses by name and this renderer
              was publishing on every page of the site. It said nothing the reader did not
              already have — the navigation shows the section with the current chapter lit
              inside it — and it cost the title the top of its own page. The fact survives in
              the footer, where it sits beside the citation and has a job.

              `kd-prose` for the reading measure alone: the deck is prose and belongs on the
              same column as the prose under it, and the class is where that width is stated. */}
          <ProseFlow>
            <Content />
          </ProseFlow>

        </Page>
      </PageFrame>
      <OnThisPage entries={toc} />
    </Box>
  );
}
