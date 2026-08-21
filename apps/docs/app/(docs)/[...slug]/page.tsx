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
import { Box, Flex, Heading, Separator, Stack, Text } from "@kookie-ui/react";

import { ProseFlow } from "../../../mdx-components";
import { BY_SLUG, CHAPTERS, neighbours, SECTIONS } from "../chapters";
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
    <Flex gap="7" align="flex-start" style={{ maxWidth: "74rem" }}>
      <Stack gap="7" style={{ maxWidth: "46rem", minWidth: 0, flex: 1 }}>
      <Stack gap="4">
        <Text size="2" emphasis="quiet">
          {section?.title}
        </Text>
        <Heading size="8" render={<h1 />}>
          {chapter.title}
        </Heading>
        <Text size="4" emphasis="medium" render={<p />}>
          {chapter.blurb}
        </Text>
      </Stack>

      <ProseFlow>
        <Content />
      </ProseFlow>

      {/* What this chapter publishes. Not a footnote — it is the claim the whole site rests
          on: these pages are a re-voicing of a spec that governs the code, not prose written
          alongside it. A law resolves every reference against the real document. */}
      <Stack gap="3">
        <Separator />
        <Text size="2" emphasis="quiet">
          Specified in {chapter.spec.join(", ")}.
        </Text>
      </Stack>

      {(prev ?? next) ? (
        <Flex gap="4" justify="space-between" wrap="wrap">
          {prev ? (
            <Stack gap="1">
              <Text size="2" emphasis="quiet">
                Previous
              </Text>
              <Text size="3" render={<Link href={`/${prev.slug}`} className="kd-link" />}>
                {prev.title}
              </Text>
            </Stack>
          ) : (
            <span />
          )}
          {next ? (
            <Stack gap="1" style={{ textAlign: "end" }}>
              <Text size="2" emphasis="quiet">
                Next
              </Text>
              <Text size="3" render={<Link href={`/${next.slug}`} className="kd-link" />}>
                {next.title}
              </Text>
            </Stack>
          ) : null}
        </Flex>
      ) : null}
      </Stack>
      <OnThisPage entries={toc} />
    </Flex>
  );
}
