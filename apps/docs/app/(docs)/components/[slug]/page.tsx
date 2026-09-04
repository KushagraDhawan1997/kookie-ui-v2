/**
 * A component's page: a reference, in a reference's register.
 *
 * IT WAS AN ESSAY UNTIL 2026-09-05 (Kushagra, against Apple's own: "I do not like our
 * documentation… I'm not talking visually"). The complaint was register and addressability,
 * not layout. Every block on the old page was a paragraph of equal weight explaining why the
 * system decided what it decided, so a reader who arrived knowing a name had to read the page
 * to use it: no signature, no per-symbol anchor, no per-part props, and a deck that ran four
 * sentences. Four things follow, and this file is those four things.
 *
 * ONE SENTENCE, THEN THE SHAPE. An abstract says what the thing is; a declaration says how it
 * is written. A compound component's signature is its composition, which no page here had ever
 * shown — so the first thing a reader met was a live demo to reverse-engineer.
 *
 * SYMBOLS ARE GROUPED BY THE JOB THEY DO. "Filtering", "Listing the commands" — not a flat
 * dump. The grouping is the registry's, because which parts belong together is a fact about
 * the component and not about this renderer.
 *
 * EVERY SYMBOL IS ADDRESSABLE AND CARRIES ITS OWN PROPS. This half was a real defect rather
 * than a matter of register: `api.generated.ts` has held a table for every PART since it was
 * written, and the page rendered only the root's and threw the rest away — which is why
 * `filter` read as an axis of `Command` on a page that never said it is a prop of
 * `CommandContent`. A reader could not link a colleague to `CommandInput` either.
 *
 * A PROP CELL TAKES ITS FIRST SENTENCE. A JSDoc is the editor hover, where four sentences
 * about an inline array re-running the filter are what a developer wants; a table is a
 * scanning surface, where they are a wall (`propSummary`).
 *
 * WHAT IS NOT HERE. `axes` — every axis was a prop of some symbol, and the two texts were the
 * same sentence twice. `What it refuses, and why` stays: it is the one section a generated
 * table can never carry, and it is what this reference has that Apple's does not.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Code,
  Flex,
  Heading,
  Stack,
  Text,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

import { CodeSample } from "../../../../blocks/code-sample";
import { TableOfContents } from "../../../../blocks/table-of-contents";
import { Example } from "../../example";
import { InlineCode } from "../../../inline-code";
import { API } from "../api.generated";
import { PageFrame, PageTitle } from "../../page-frame";
import { propDescription, propSummary } from "../prop-description";
import { BY_SLUG, ENTRIES, type Entry } from "../registry";
import { humanLabel } from "../../label";
import { slugify } from "../../slug";
import type { TocEntry } from "../../toc";

export function generateStaticParams() {
  return ENTRIES.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  return entry
    ? { title: `${humanLabel(entry.name)} — KookieUI`, description: entry.abstract }
    : { title: "KookieUI" };
}

/**
 * The page's sections, named once.
 *
 * The contents column and the headings both read these, and both turn a title into an anchor
 * with `slugify`, so an entry that scrolls nowhere is not expressible. It was, for one build:
 * `referenceToc` emitted `#overview` while the `h2` rendering "Overview" carried no `id` at
 * all, and 1,019 laws were green over six dead links because none of them read an anchor.
 */
const SECTIONS = {
  declaration: "Declaration",
  overview: "Overview",
  example: "Example",
  topics: "Topics",
  props: "Props",
  refusals: "What it refuses, and why",
  everywhere: "Everywhere",
} as const;

/** A symbol's anchor. Lowercased name, so the link a reader copies is the name they searched. */
export const symbolId = (name: string) => name.toLowerCase();

/**
 * What stands in the gutter, built from the registry rather than from a file.
 *
 * `toc.ts` reads a chapter's SOURCE because a chapter is markdown on disk. This page has none
 * — it is a renderer over data — so the entries come from the same data the renderer walks.
 * Level 3 is the topic groups and stops there: the symbols are `h4`, and a contents list that
 * mirrors every heading stops being a summary, which is the rule `tableOfContents` states one
 * file over.
 */
export function referenceToc(entry: Entry): TocEntry[] {
  const at = (title: string, level: 2 | 3): TocEntry => ({ id: slugify(title), title, level });
  return [
    ...(entry.declaration ? [at(SECTIONS.declaration, 2)] : []),
    at(SECTIONS.overview, 2),
    at(SECTIONS.example, 2),
    ...(entry.topics
      ? [at(SECTIONS.topics, 2), ...entry.topics.map((topic) => at(topic.title, 3))]
      : [at(SECTIONS.props, 2)]),
    at(SECTIONS.refusals, 2),
    at(SECTIONS.everywhere, 2),
  ];
}

/**
 * A labelled block, and its two intervals are this page's own (2026-09-04, Kushagra: "why is
 * there less spacing between Topics and next para, but correct spacing between any other
 * heading and its next content").
 *
 * §15 states title→description at `2`, and that interval was measured on a CARD: a 16px title
 * over 14px words. At 4px under a 24px heading a lead reads as a second line of that heading,
 * while a section with no lead sat 16px from its content — so the same page put a heading at
 * two distances from what it introduces. `PageTitle` already records the same finding one
 * element up, where 40px over 20px needed `6`.
 *
 * 12 then 24: the content sits twice as far as the lead, which is what makes the lead belong
 * to the heading rather than float between the two, and 24px is also what a topic group takes
 * below.
 */
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
        {/* THE ANCHOR IS `slugify(title)`, the same function `referenceToc` calls above. Two
            spellings of one identity is how a contents entry comes to scroll nowhere, which is
            why `slug.ts` exists — and is what six dead links measured here before this line. */}
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

/**
 * A props table.
 *
 * SIZE 3, LIKE EVERY OTHER SENTENCE ON THE PAGE (2026-09-04, Kushagra). A table's index prices
 * the cell inset AND the type step, so a `2` set the one column that is real prose — what the
 * prop does — two ramp steps under the paragraph above it.
 *
 * THE CELLS' `Code` STATES NO SIZE. It is optional on that component precisely so an atom can
 * take the line it sits in, which is the table's own step.
 */
function Props({ name }: { name: string }) {
  const api = API[name];
  const props = api?.props ?? [];
  if (!props.length) {
    // AN EMPTY STATEMENT RATHER THAN AN EMPTY SPACE, at the page's reading rung: this is a
    // sentence ABOUT the symbol, the same rank as the summary above it.
    //
    // TWO ARMS, because "declares nothing" means two different things and the first spelling
    // guessed at both. `Spinner` renders a `<span>` and takes every prop of one; `Stack` and
    // `Tabs` publish no element at all — their props arrive from a shared type (Box's, for
    // Stack) or from the primitive underneath. Eighteen symbols land here, and saying "the
    // element it renders" was wrong for eight of them.
    return (
      <Text size="3" render={<p />}>
        <InlineCode
          text={
            api?.element
              ? `It declares no props of its own. It takes every prop of a \`<${api.element}>\`.`
              : "It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on."
          }
        />
      </Text>
    );
  }
  return (
    <Stack gap="3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>What it does</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell>
                <Code>
                  {prop.name}
                  {prop.optional ? "?" : ""}
                </Code>
              </TableCell>
              <TableCell>
                <Code emphasis="medium">{prop.type}</Code>
              </TableCell>
              <TableCell>
                <InlineCode text={propSummary(propDescription(prop))} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {api?.element ? (
        <Text size="3" render={<p />}>
          <InlineCode text={`It also takes every prop of a \`<${api.element}>\`.`} />
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * One symbol: its name, what it is, and what it takes.
 *
 * The name is a heading rather than a chip, which is what makes the anchor honest — a reader
 * lands on a heading and reads downward rather than mid-paragraph. It is still set as `Code`,
 * because the thing the heading names is an identifier.
 */
function Symbol({ name, summary }: { name: string; summary: string }) {
  return (
    <Stack gap="3">
      <Stack gap="2" className="kd-prose">
        {/* THE `Flex` IS LOAD-BEARING: a flex column stretches its children, so an atom placed
            directly in a Stack runs wall to wall. */}
        <Flex>
          <Heading size="4" render={<h4 id={symbolId(name)} />}>
            <Code size="3" weight="medium">
              {name}
            </Code>
          </Heading>
        </Flex>
        <Text size="3" render={<p />}>
          <InlineCode text={summary} />
        </Text>
      </Stack>
      <Props name={name} />
    </Stack>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  if (!entry) notFound();

  const summaries = new Map<string, string>([
    [entry.name, entry.abstract],
    ...(entry.parts ?? []).map((part) => [part.part, part.blurb] as const),
  ]);

  return (
    /* THE CHAPTER'S FRAME, EXACTLY (2026-09-04, Kushagra: "but we fixed it on other pages,
       should be the same, and it needs ToC too").

       This page was `48rem` with prose capped at the `40rem` measure inside it, so it had two
       right edges — measured at 1440, paragraphs ending at x=1036 and the props table at 1164.
       That is the fault chapters fixed on 2026-09-01, where the answer was that the COLUMN is
       the measure and the leftover is a gutter.

       57rem is one sum and not three numbers: the measure, the gap, and the contents column
       (40 + 3 + 14). The props table pays for it and the bill was measured first — squeezed to
       640 five of Command's six tables still fit and one overflows by 12px, which it scrolls,
       and a table that needs more room scrolls at either width. */
    <PageFrame width="57rem">
      <Flex gap="9" align="flex-start">
        <Stack gap="9" style={{ maxWidth: "var(--kd-measure)", minWidth: 0, flex: 1 }}>
          {/* THROUGH `InlineCode`, like every other prose field on the page. It shipped bare for
              one build and `/components/flex` printed "Box with `display: flex`" with the
              backticks in it — caught by sweeping the rendered pages, not by the suite, because
              the law that reads this file's rendered fields had lost the deck from its list when
              the deck's own name changed. The field is back in that list. */}
          <PageTitle deck={<InlineCode text={entry.abstract} />}>{humanLabel(entry.name)}</PageTitle>

          {entry.declaration ? (
            <Section title={SECTIONS.declaration}>
              {await CodeSample({ code: entry.declaration, lang: "tsx" })}
            </Section>
          ) : null}

          <Section title={SECTIONS.overview}>
            <Stack gap="4" className="kd-prose">
              {entry.overview.map((paragraph) => (
                <Text key={paragraph} size="3" render={<p />}>
                  <InlineCode text={paragraph} />
                </Text>
              ))}
            </Stack>
          </Section>

          <Section title={SECTIONS.example}>
            <Example name={entry.slug} />
          </Section>

          {entry.topics ? (
            /* TOPICS IS THE INDEX AND THE REFERENCE AT ONCE, and on one page that is
               deliberate. Apple's Topics list a symbol and its abstract, and the symbol's own
               page repeats both — which is right when the two are a click apart and is the
               same sentence twice when they are 200px apart. So the group heading introduces
               the symbols directly. */
            <Section
              title={SECTIONS.topics}
              lead="Every symbol this component exports, grouped by the job it does. Each one carries the props it declares; each one has an anchor of its own."
            >
              <Stack gap="8">
                {entry.topics.map((topic) => (
                  <Stack key={topic.title} gap="6">
                    <Heading size="5" render={<h3 id={slugify(topic.title)} />}>
                      {topic.title}
                    </Heading>
                    {topic.symbols.map((name) => (
                      <Symbol key={name} name={name} summary={summaries.get(name) ?? ""} />
                    ))}
                  </Stack>
                ))}
              </Stack>
            </Section>
          ) : (
            /* ONE SYMBOL, SO NO GROUPING, and the absence is the design: a component with no
               parts has nothing to group, and a "Topics" heading over a single table would be
               an index of one. */
            <Section
              title={SECTIONS.props}
              lead="Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here."
            >
              <Props name={entry.name} />
            </Section>
          )}

          <Section
            title={SECTIONS.refusals}
            lead="Each item below is a decision, not an omission. Each one states what to use instead."
          >
            {/* A LIST, AND AN UNORDERED ONE (2026-09-04, Kushagra: "shouldn't it be a numbered
                list or something"). It rendered as name-over-paragraph blocks, the same shape
                the symbols above take, so short items read as more sections rather than as one
                list. NOT NUMBERED: a number claims a sequence or a rank, and a refusal has
                neither — nobody cites one by its position.

                `InlineCode` on the NAME because the names are two kinds of thing and the
                writing knows it: an identifier keeps its code spelling (`modal`, `readOnly`,
                `FieldControl`), a phrase is capitalised because a list item starts a line. */}
            <Text size="3" render={<ul className="kd-list" />}>
              {entry.refusals.map((refusal) => (
                <li key={refusal.name}>
                  <Text size="3" weight="medium" render={<span />}>
                    <InlineCode text={refusal.name} />
                  </Text>
                  {" — "}
                  <InlineCode text={refusal.why} />
                </li>
              ))}
            </Text>
          </Section>

          <Section title={SECTIONS.everywhere}>
            <Stack gap="3" className="kd-prose">
              <Text size="3" render={<p />}>
                This component inherits the rules below. Every component in the system does.
              </Text>
              <Text size="3" render={<ul className="kd-list" />}>
                {[
                  "It sets no outer spacing. The container sets the gap between siblings. Use a Box to add space.",
                  "Its size is an index, not a measurement. The same number means different things on different ladders.",
                  "You choose the meaning and the loudness. The theme resolves the colour.",
                  "CSS resolves every state. No JavaScript runs on hover, press or focus.",
                  "It forwards className and style. Your style merges last, so your value wins.",
                ].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </Text>
            </Stack>
          </Section>
        </Stack>

        {/* THE GUTTER'S CONTENT IS THE BLOCK, and this file states only the column — the split
            the chapter renderer already draws, and the block law's own line: a block may not
            decide a distance. `kd-toc` carries the width, the stickiness and the window where
            two columns stop fitting. */}
        <TableOfContents entries={referenceToc(entry)} className="kd-toc" />
      </Flex>
    </PageFrame>
  );
}
