/**
 * One renderer over the chapter registry. Adding a chapter is adding a row and a file; no
 * page is ever written for it.
 *
 * The catch-all sits at the docs root, so it answers `/philosophy/why-kookie-exists` and
 * every other `<section>/<name>` pair. `/components` and `/components/<slug>` are static
 * segments and win over it, which is Next's own specificity rule and the reason the component
 * reference can keep its own renderer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Button, Flex, Stack } from "@kookie-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { ProseFlow } from "../../../mdx-components";
import { BY_SLUG, CHAPTERS, neighbours } from "../chapters";
import { PageFrame, PageTitle } from "../page-frame";
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
  return <TableOfContents entries={entries} className="kd-toc" />;
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const chapter = BY_SLUG.get(slug.join("/"));
  if (!chapter) notFound();

  const toc = chapterToc(chapter.source);
  const { prev, next } = neighbours(chapter.slug);
  const { Content } = chapter;

  return (
    /* ONE COLUMN, ONE WIDTH (2026-09-01, Kushagra: "I dont like that the title + specimen +
       the page desc. have a different width than prose").

       The column was 46rem and the prose inside it 40, so the title, the deck and every figure
       ran 96px past the sentences — two right edges on a page whose whole job is reading. The
       column is the measure now, and the frame is that plus the gutter the table of contents
       sits in (40 + 3 + 14), so the pair still centres on the pane rather than the column
       drifting left of it. `prose.css` carries why the text is what gives and not the column.

       THE GUTTER IS 3rem SINCE 2026-09-04 (Kushagra: the horizontal space between the table of
       contents and the page "is too less"). It was 2, which is the interval this system uses
       BETWEEN things inside one region — and these are two columns a reader moves between, so
       the distance has to say they are separate rather than adjacent. The frame grew by exactly
       the same step: the three numbers are one sum, and changing the gutter without it would
       have taken the difference out of the measure, which is the one number here that is not
       ours to spend. */
    <PageFrame width="57rem">
      <Flex gap="9" align="flex-start">
        <Stack gap="8" style={{ maxWidth: "var(--kd-measure)", minWidth: 0, flex: 1 }}>
          {/* THE SECTION NAME USED TO SIT HERE, at `size 2 quiet`, and it was an eyebrow: two
              elements doing one element's job, which §15 refuses by name and this renderer
              was publishing on every page of the site. It said nothing the reader did not
              already have — the navigation shows the section with the current chapter lit
              inside it — and it cost the title the top of its own page. The fact survives in
              the footer, where it sits beside the citation and has a job.

              `kd-prose` for the reading measure alone: the deck is prose and belongs on the
              same column as the prose under it, and the class is where that width is stated. */}
          <PageTitle deck={chapter.blurb}>{chapter.title}</PageTitle>

          <ProseFlow>
            <Content />
          </ProseFlow>

          {/* THE WAY ON, AND NOTHING ELSE (2026-09-03, Kushagra: "what is this Getting started ·
              Specified in §5, §13 kinda thing at bottom of each docs, hate it, remove it… remove
              that separator, just use one button with chevron + label").

              THREE THINGS WENT. The colophon — the section name and the spec citation — was
              furniture that told a reader nothing they could act on: the navigation already shows
              which section this chapter is in with the current page lit inside it, and a citation
              into a document the reader cannot open is a note to ourselves published on every
              page of the site. **The claim it carried is still true and still checked** — a law
              resolves every `chapter.spec` entry against the real §, and `chapters.ts` still
              states them — so what left is the printing of it, not the guarantee.

              THE `Previous` / `Next` LABELS WERE EYEBROWS, which §15 refuses by name: two
              elements doing one element's job, a size-2 line above the thing that already says
              what it is. The direction is what the chevron is for, and it is on the side the
              reader is going.

              AND THE SEPARATOR WENT WITH THEM. §15's rule is that a rule earns its place only
              where DISTANCE cannot group — which was not the case here, since the footer already
              sits at the page's largest interval. It was drawing a line across a gap that was
              already doing the work, which is the footer block's own finding one route over.

              A QUIET BUTTON RATHER THAN A LINK, and the difference is what the row is for: a link
              is a word inside a sentence and this is a place to press at the end of a page. It is
              a real `<a>` through `render`, so the address, the middle-click and the keyboard are
              the platform's. */}
          <Box mt="7">
            <Flex gap="4" justify="space-between" align="center" wrap="wrap">
              {prev ? (
                <Button
                  emphasis="quiet"
                  leading={<ChevronLeftIcon />}
                  render={<Link href={`/${prev.slug}`} />}
                >
                  {prev.title}
                </Button>
              ) : (
                /* Holds the start wall: one child and `space-between` pushes it to the wrong
                   one, which is the same fault the footer block answers the same way. */
                <span />
              )}
              {next ? (
                <Button
                  emphasis="quiet"
                  trailing={<ChevronRightIcon />}
                  render={<Link href={`/${next.slug}`} />}
                >
                  {next.title}
                </Button>
              ) : null}
            </Flex>
          </Box>
        </Stack>
        <OnThisPage entries={toc} />
      </Flex>
    </PageFrame>
  );
}
