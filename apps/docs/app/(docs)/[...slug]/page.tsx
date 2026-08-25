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
import {
  Box,
  Flex,
  Heading,
  Link as KookieLink,
  Separator,
  Stack,
  Text,
} from "@kookie-ui/react";

import { ProseFlow } from "../../../mdx-components";
import { BY_SLUG, CHAPTERS, neighbours, SECTIONS } from "../chapters";
import { PageFrame } from "../page-frame";
import { chapterToc } from "../toc";

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
 * NOT in the Shell's inspector, which is the pane that looks like it should hold this. An
 * inspector rests closed by design — its `auto` means "closed until asked for" — and a table
 * of contents nobody opens is a table of contents nobody reads. It is also per-page state,
 * and the inspector lives in the layout.
 *
 * So it is a sticky aside inside the chapter's own two-column flow, and `prose.css` drops it
 * below the width where the two columns stop fitting. Shown only where there is enough
 * structure to be worth scanning.
 */
function OnThisPage({ entries }: { entries: { id: string; title: string; level: 2 | 3 }[] }) {
  if (entries.length < 3) return null;
  return (
    <Box className="kd-toc" render={<aside aria-label="On this page" />}>
      <Stack gap="3">
        <Text size="2" emphasis="quiet">
          On this page
        </Text>
        <Stack gap="2">
          {entries.map((entry) => (
            <Box key={entry.id} pl={entry.level === 3 ? "3" : "0"}>
              <Text
                size="2"
                emphasis={entry.level === 3 ? "quiet" : "medium"}
                render={<a href={`#${entry.id}`} className="kd-toc-link" />}
              >
                {entry.title}
              </Text>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const chapter = BY_SLUG.get(slug.join("/"));
  if (!chapter) notFound();

  const section = SECTIONS.find((candidate) => candidate.id === chapter.section);
  const toc = chapterToc(chapter.source);
  const { prev, next } = neighbours(chapter.slug);
  const { Content } = chapter;

  return (
    <PageFrame width="62rem">
      <Flex gap="7" align="flex-start">
        <Stack gap="8" style={{ maxWidth: "46rem", minWidth: 0, flex: 1 }}>
          {/* THE SECTION NAME USED TO SIT HERE, at `size 2 quiet`, and it was an eyebrow: two
              elements doing one element's job, which §15 refuses by name and this renderer
              was publishing on every page of the site. It said nothing the reader did not
              already have — the navigation shows the section with the current chapter lit
              inside it — and it cost the title the top of its own page. The fact survives in
              the footer, where it sits beside the citation and has a job.

              `kd-prose` for the reading measure alone: the deck is prose and belongs on the
              same column as the prose under it, and the class is where that width is stated. */}
          <Stack gap="3" className="kd-prose">
            <Heading size="8" render={<h1 />}>
              {chapter.title}
            </Heading>
            {/* LOUD, and one step up (2026-08-25). This is the most important sentence on the
                page and it was rendered FAINTER than the body it introduces — 18px muted over
                16px loud — so it read as a caption under the title rather than as the deck it
                is. §15 already says reading-length prose rests loud; this was the one place on
                the site that did not. */}
            <Text size="5" render={<p />}>
              {chapter.blurb}
            </Text>
          </Stack>

          <ProseFlow>
            <Content />
          </ProseFlow>

          {/* The footer: a rule, the way on, and the colophon. Set apart at the page's largest
              interval because it is furniture rather than reading — and it carries the claim
              the whole site rests on, which is that these pages re-voice a specification that
              governs the code rather than being prose written alongside it. A law resolves
              every citation against the real document. */}
          <Box mt="7">
            <Stack gap="6">
              <Separator />
              {(prev ?? next) ? (
                <Flex gap="4" justify="space-between" wrap="wrap">
                  {prev ? (
                    <Stack gap="1">
                      <Text size="2" emphasis="quiet">
                        Previous
                      </Text>
                      <KookieLink size="3" render={<Link href={`/${prev.slug}`} />}>
                        {prev.title}
                      </KookieLink>
                    </Stack>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Stack gap="1" style={{ textAlign: "end" }}>
                      <Text size="2" emphasis="quiet">
                        Next
                      </Text>
                      <KookieLink size="3" render={<Link href={`/${next.slug}`} />}>
                        {next.title}
                      </KookieLink>
                    </Stack>
                  ) : null}
                </Flex>
              ) : null}
              <Text size="2" emphasis="quiet">
                {section?.title} · Specified in {chapter.spec.join(", ")}.
              </Text>
            </Stack>
          </Box>
        </Stack>
        <OnThisPage entries={toc} />
      </Flex>
    </PageFrame>
  );
}
