import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Heading, Page, Stack, Text } from "@kookie-ui/react";

import { Specimen } from "../../../../blocks/specimen";
import { TableOfContents, type TocEntry } from "../../../../blocks/table-of-contents";
import { BLOCK_BY_SLUG, BLOCKS, type BlockEntry } from "../../../../blocks";
import { BLOCK_EXAMPLES } from "../../../../examples/blocks";
import { isLang } from "../../../../blocks/highlight";
import { PageFrame } from "../../page-frame";
import { slugify } from "../../slug";
import { blockLang, readBlockSource, readBlockUsageSource } from "../source";

/**
 * One block's page: what it is, the block running live, how you call it, then every file a
 * consumer copies — shown by the code-sample block itself, so the first block documents itself
 * with itself.
 *
 * The sources are read off disk, never restated (the example frame's own rule: one file cannot
 * disagree with itself). The reader lives in `../source` since the markdown twin became its
 * second consumer — it carries the subfolder scoping this page used to state, and the reason.
 */
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

/** The page's sections, named once. The contents column and the headings both read these and
    both turn a title into an anchor with `slugify`, so an entry that scrolls nowhere is not
    expressible — the component reference's own arrangement, and the defect it records. */
const SECTIONS = {
  examples: "Examples",
  usage: "Usage",
  files: "Files",
} as const;

/**
 * What stands in the gutter, built from the registry rather than from a file — a block page is
 * a renderer over data and has no markdown to read.
 *
 * THE DEMOS ARE LEVEL 3, and that is what changed to make this list possible. Their labels were
 * a `Text` on the argument that they are figures inside a section; the argument was right about
 * figures and wrong about this page, which had no section for them to be inside — the demos ARE
 * its structure. Now they sit under one `Examples` heading, which is the shape the component
 * reference already uses for its variants.
 */
function blockToc(block: BlockEntry): TocEntry[] {
  const at = (title: string, level: 2 | 3): TocEntry => ({ id: slugify(title), title, level });
  return [
    at(SECTIONS.examples, 2),
    ...block.demos.map((demo) => at(demo.label, 3)),
    at(SECTIONS.usage, 2),
    at(SECTIONS.files, 2),
  ];
}

/** A labelled block. The two intervals are the component reference's, for its reason: a lead
    twice as close to its heading as the content is, so it reads as part of the heading. */
function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="6">
      <Stack gap="4" className="kd-prose">
        <Heading size="6" render={<h2 id={slugify(title)} />}>
          {title}
        </Heading>
        {lead ? (
          <Text size="3" render={<p />}>
            {lead}
          </Text>
        ) : null}
      </Stack>
      {children}
    </Stack>
  );
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const block = BLOCK_BY_SLUG.get(slug);
  if (!block) notFound();

  const Usage = BLOCK_EXAMPLES[block.slug];
  if (!Usage) notFound();

  const files = block.files.map((file) => {
    const lang = blockLang(file);
    if (!isLang(lang)) notFound();
    return { name: file, code: readBlockSource(file), lang };
  });

  return (
    /* The reserve for the contents column, and nothing else — the chapter renderer and the
       component reference both wear this same class, which is where the two distances live. */
    <Box className="kd-chapter">
      <PageFrame width="var(--kd-measure)">
        <Page title={block.title} description={block.blurb} style={{ minWidth: 0 }}>
          {/* EVERY DEMO IS A SPECIMEN, AND THE FIGURE CARRIES THE FILES (Kushagra: "each footer
              should be presented in a specimen component… and each footer will have specimen,
              and actually every block, even code block and specimen, which is it, itself").

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
              Example frame states for a `Surface` example. So nothing here has to know what kind
              of thing each demo is. */}
          <Section title={SECTIONS.examples}>
            <Stack gap="9">
              {await Promise.all(
                block.demos.map(async (demo) => (
                  <Stack key={demo.label} gap="4">
                    {/* A HEADING, NOT A LABEL. It was a `Text` while these were figures inside a
                        section; they are the section now, and a contents list can only point at
                        something the document outline actually contains. */}
                    <Heading size="4" render={<h3 id={slugify(demo.label)} />}>
                      {demo.label}
                    </Heading>
                    <Specimen
                      {...(demo.pane === undefined ? {} : { pane: demo.pane })}
                      {...(demo.fill === undefined ? {} : { fill: demo.fill })}
                      sources={files}
                    >
                      {await demo.render()}
                    </Specimen>
                  </Stack>
                )),
              )}
            </Stack>
          </Section>

          {/* THE CALL SITE (Kushagra: "a block page should also have an example specimen of using
              that block").

              Everything above shows the block RUNNING and hands over the block's own source; none
              of it shows the six lines a reader writes once they have copied it. This is that,
              and it is a real file — imported and rendered, then read off disk and shown — so the
              picture and the snippet cannot part company and `tsc` checks the snippet. */}
          <Section
            title={SECTIONS.usage}
            lead="What you write once the files are in your app."
          >
            <Specimen
              fill
              sources={[{ code: readBlockUsageSource(block.slug), lang: "tsx" }]}
            >
              {await Usage()}
            </Specimen>
          </Section>

          {/* WHERE THE FILES GO, which the figures no longer say for themselves. A sentence
              rather than a listing: the code is in every figure above, and what a reader still
              needs to be told is that the paths are this site's. */}
          <Section title={SECTIONS.files}>
            <Text size="3" emphasis="medium" render={<p />} className="kd-prose">
              The tabs in every figure above are the files. Copy them into your app — the paths
              are this site&apos;s, so put them wherever your code lives and fix the imports
              between them.
            </Text>
          </Section>
        </Page>
      </PageFrame>

      {/* THE GUTTER'S CONTENT IS THE BLOCK, and this file states only the column — the split the
          chapter renderer and the component reference both draw, and the block law's own line: a
          block may not decide a distance. */}
      <div className="kd-toc-column">
        <TableOfContents entries={blockToc(block)} className="kd-toc" />
      </div>
    </Box>
  );
}
