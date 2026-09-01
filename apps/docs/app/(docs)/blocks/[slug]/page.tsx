import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heading, Stack, Text } from "@kookie-ui/react";

import { CodeSample } from "../../../../blocks/code-sample";
import { BLOCK_BY_SLUG, BLOCKS } from "../../../../blocks";
import { isLang } from "../../../../blocks/highlight";
import { PageFrame, PageTitle } from "../../page-frame";

/**
 * One block's page: what it is, the block running live, then every file a consumer copies —
 * shown by the code-sample block itself, so the first block documents itself with itself.
 *
 * The sources are read off disk, never restated (the example frame's own rule: one file
 * cannot disagree with itself). Scoped to the blocks subfolder deliberately — Turbopack
 * traces the whole project into the server bundle when it cannot statically bound a
 * filesystem read (the constraint `example.tsx` and `toc.ts` both document).
 */
const BLOCKS_ROOT = path.join(process.cwd(), "blocks");

const readBlockFile = (name: string): string =>
  readFileSync(path.join(BLOCKS_ROOT, name), "utf8");

/** A file's fence language, from its extension. The registry law holds every listed file to
    an extension this map answers, so an unlisted kind fails the suite rather than this page. */
const langOf = (name: string): string => {
  const ext = name.slice(name.lastIndexOf(".") + 1);
  return ext === "css" ? "css" : ext === "ts" ? "ts" : "tsx";
};

export function generateStaticParams() {
  return BLOCKS.map((block) => ({ slug: block.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const block = BLOCK_BY_SLUG.get(slug);
  return block
    ? { title: `${block.title} — Blocks — KookieUI`, description: block.blurb }
    : { title: "KookieUI" };
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const block = BLOCK_BY_SLUG.get(slug);
  if (!block) notFound();

  return (
    <PageFrame width="48rem">
      <Stack gap="9">
        {/* THE DECK WAS `size 3 medium` HERE and `size 5` loud on every other page of the
            site (2026-08-27) — the same role in two spellings, which is the similarity rule
            broken on the one page nobody compared against its siblings. The 2026-08-25 call
            was that a deck rests LOUD and one step up; this page was written after it and
            missed it. `PageTitle` is what makes the spelling unrepeatable. */}
        <PageTitle deck={block.blurb}>{block.title}</PageTitle>

        {/* The demo sits directly on the page — NOT on a Card (caught by Kushagra's eye,
            2026-08-26). A code sample's well is a Surface, a ground, and a ground sits IN
            the page; wrapping one in a card is the ground-inside-object nesting the ontology
            forbids, and it is the Example frame's own exception (a specimen that roots its
            own pane is never wrapped). A future block whose demo has no pane of its own can
            revisit per entry. */}
        {await block.demo()}

        {/* 32px between file figures against 12px inside one (label to well) — the two-step
            differentiation §15 asks for, widened from 16/8 by eye (Kushagra, 2026-08-26). */}
        <Stack gap="7">
          {/* The heading stays with its own line — a heading belongs to what follows. */}
          <Stack gap="3">
            <Heading size="6" render={<h2 />}>
              Files
            </Heading>
            <Text size="3" render={<p />}>
              Copy these into your app. The paths are this site&apos;s; put them wherever your
              code lives and fix the imports between them.
            </Text>
          </Stack>
          {block.files.map((file) => {
            const lang = langOf(file);
            if (!isLang(lang)) notFound();
            return (
              // The bound is the well's own default now (`CODE_MAX_LINES`) — this route
              // judged the number first, and a bound is not a property of this route.
              <CodeSample
                key={file}
                code={readBlockFile(file)}
                lang={lang}
                title={`blocks/${file}`}
              />
            );
          })}
        </Stack>
      </Stack>
    </PageFrame>
  );
}
