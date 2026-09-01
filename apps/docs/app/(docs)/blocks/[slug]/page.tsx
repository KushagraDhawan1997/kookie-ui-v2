import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stack, Text } from "@kookie-ui/react";

import { Specimen } from "../../../../blocks/specimen";
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

        {/* EVERY DEMO IS A SPECIMEN, AND THE FIGURE CARRIES THE FILES (2026-09-01, Kushagra:
            "each footer should be presented in a specimen component… and each footer will have
            specimen, and actually every block, even code block and specimen, which is it,
            itself").

            The demos sat bare on the page with a separate `Files` section under them, and that
            section is gone: a reader looking at the footer they liked had to scroll past two
            more footers to reach the code, and the code was one long column of every file
            whether or not they wanted all of them. The figure is the pairing this site already
            uses everywhere else — the thing running, its source beneath — and a block being
            several files is what made the code half take tabs.

            THE SAME FILES UNDER EVERY DEMO, and it is worth naming rather than hiding: three
            footers means the same two files rendered three times. They are read off disk, so
            nothing can drift, and each well is bounded and scrollable rather than three screens
            of code — but if that reads as repetition on a block with many demos, the change is
            to hand the files to the first figure alone, which is one condition here.

            THE FIGURE KEEPS ITS PAPER. A block's demo brings whatever it brings — a footer on a
            ground is a `Surface`, and a ground goes INSIDE the paper, which is the rule the
            Example frame states for a `Surface` example ("a ground on paper is an ordinary
            arrangement"). So nothing here has to know what kind of thing each demo is.

            The label is a `Text` and not a heading: these are figures inside a section, and a
            heading would put "Level with the page" in the document outline. */}
        <Stack gap="9">
          {await Promise.all(
            block.demos.map(async (demo) => (
              <Stack key={demo.label} gap="4">
                <Text size="2" emphasis="medium">
                  {demo.label}
                </Text>
                <Specimen
                  {...(demo.pane === undefined ? {} : { pane: demo.pane })}
                  {...(demo.fill === undefined ? {} : { fill: demo.fill })}
                  sources={block.files.map((file) => {
                    const lang = langOf(file);
                    if (!isLang(lang)) notFound();
                    return { name: file, code: readBlockFile(file), lang };
                  })}
                >
                  {await demo.render()}
                </Specimen>
              </Stack>
            )),
          )}
        </Stack>

        {/* WHERE THE FILES GO, which the figures no longer say for themselves. A sentence
            rather than a section: the code is in every figure above, and what a reader still
            needs to be told is that the paths are this site's. */}
        <Text size="3" emphasis="medium" render={<p />}>
          The tabs above are the files. Copy them into your app — the paths are this
          site&apos;s, so put them wherever your code lives and fix the imports between them.
        </Text>
      </Stack>
    </PageFrame>
  );
}
