/**
 * A component's page: the argument first, the reference after.
 *
 * The order is the decision. A generated prop table can only say what a component HAS, and
 * most of what this system is lives in what its components will not do — so `refusals` sits
 * above the table, and the table is the last thing on the page rather than the first. A
 * missing prop and a refused one look identical in an API dump; only one of them is a design.
 *
 * Both halves are mechanised, differently. The meaning half is the registry, hand-written and
 * held to an anti-stub floor. The mechanical half is generated from the package's own types
 * and protected by a drift law, so it cannot describe a prop that no longer exists — the
 * failure that shipped here in 2026-08-08 and was caught only because the page was TSX.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Code,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

import { Example } from "../../example";
import { InlineCode } from "../../../inline-code";
import { API } from "../api.generated";
import { PageFrame, PageTitle } from "../../page-frame";
import { propDescription } from "../prop-description";
import { BY_SLUG, ENTRIES } from "../registry";
import { humanLabel } from "../../label";

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
    ? { title: `${humanLabel(entry.name)} — KookieUI`, description: entry.blurb }
    : { title: "KookieUI" };
}

/**
 * THE PAGE READS AT THE CHAPTER'S STEP AND THE CHAPTER'S RANK (2026-09-01, Kushagra: "theyre
 * too small text, why low emphasis also").
 *
 * Every explanatory paragraph on this page was `size="2" emphasis="medium"` — the smallest
 * readable step in the rung §15 minted for "real information said quietly". That is the right
 * pair for meta and the wrong pair for the body of a page: these paragraphs ARE the component
 * reference, and a reader arriving from a chapter dropped two ramp steps and one ink rung
 * crossing a link. `mdx-components.tsx` states the rule one file over and states it as a rule —
 * "reading-length prose rests LOUD (§15: full contrast is the accessible resting state for
 * reading), so emphasis appears nowhere in this file's paragraphs" — so this was not a
 * different judgment, it was 42 pages that never met the sentence.
 *
 * What stays small and muted is what is genuinely meta: an axis's value list, which is a label
 * on the name beside it, the props table's type column, and the colophon.
 */

/**
 * A labelled block. Its own component because the page has six of them and they must not
 * drift — the same reason the package has a shared type layer.
 *
 * THE RULE UNDER THE HEADING IS GONE (2026-08-25). It sat inside a `gap 4` stack, so it had
 * 12px above it and 12px below: a line floating equidistant between a heading and the content
 * that heading introduces, dividing a thing from its own body. §15 asks for a separator only
 * where distance cannot group, and here distance groups perfectly well — 48px between sections
 * against 16px from a heading to its content is the asymmetry the brief asks for, and it is
 * the same interval a chapter's `h2` gets, so a component page and a chapter now read at one
 * rhythm instead of two.
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
    <Stack gap="5">
      <Stack gap="2" className="kd-prose">
        <Heading size="6" render={<h2 />}>
          {title}
        </Heading>
        {/* LOUD, like every other paragraph on the page (2026-09-01) — see the note on the
            page body below. A lead is the first sentence a reader reads in a section. */}
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

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  if (!entry) notFound();
  const api = API[entry.name];

  // 48rem, not the index's 62: this page is a reading column, and its figures — the specimen,
  // the fence — sit in the same column as the prose rather than beside it. At 62 the demo pane
  // ran 992px around four buttons, which is the empty-Card fault the index had, arriving one
  // route over. The props table is the one block that genuinely wants more, and it has its own
  // scroller for exactly that.
  return (
    <PageFrame width="48rem">
      <Stack gap="9">
      {/* THE METADATA USED TO SIT UP HERE beside the back link — `Control · §4, §8, §9`, at
          `size 2 quiet`, directly above the title. That is an eyebrow, which §15 refuses by
          name: the family and the spec sections are not what this page is called, and putting
          them where the title goes made two elements do one element's job on all 42 pages.
          They are facts about the component, so they went where the page's other facts are,
          in the colophon at the foot.

          THE BACK LINK LEFT TOO (2026-09-01, Kushagra). It survived that cut because
          navigation is a job — true, and it is the CHROME's job. Inline it put a control in
          the reading column and made all 42 pages open on a line that is not about the
          component; it lives in the pane's floating band now, beside the nav toggle, in
          `docs-back.tsx`. What is left here is the title and nothing above it. */}
      <PageTitle deck={<InlineCode text={entry.blurb} />}>{humanLabel(entry.name)}</PageTitle>

      <Section title="Example">
        <Example name={entry.slug} />
      </Section>

      {entry.axes.length ? (
        <Section
          title="Axes"
          lead="What each axis sets on this component. The system names the axes. This component decides what each one resolves to."
        >
          <Stack gap="5">
            {entry.axes.map((axis) => (
              <Stack key={axis.name} gap="2">
                <Flex gap="3" align="center" wrap="wrap">
                  <Code weight="medium">{axis.name}</Code>
                  {/* The one thing on this page that stays small and muted, and it earns it:
                      the value list is META about the name beside it, not a sentence. */}
                  <Text size="2" emphasis="medium">
                    {axis.values}
                  </Text>
                </Flex>
                <Text size="3" render={<p />}>
                  <InlineCode text={axis.note} />
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>
      ) : null}

      {entry.parts ? (
        <Section
          title="Parts"
          lead="Parts that the system owns. A component gets fixed parts only when it must wire an accessible name or announce a role. It does not get parts for layout."
        >
          <Stack gap="4">
            {entry.parts.map((part) => (
              <Stack key={part.part} gap="2">
                {/* THE `Flex` IS LOAD-BEARING (2026-09-01, Kushagra: "why is this full width,
                    the code I mean"). A `Stack` is a flex column and a flex column STRETCHES
                    its children, so an atom sitting in one directly is an atom the width of
                    the page — every part name on every page was a pill running wall to wall.
                    A row shrink-wraps what is in it, which is what the Axes block above was
                    already doing for a different reason and is why only this one looked wrong.
                    `align="start"` on the Stack would fix the chip and break the paragraph,
                    which would then shrink-wrap to its longest line. */}
                <Flex>
                  <Code weight="medium">{part.part}</Code>
                </Flex>
                <Text size="3" render={<p />}>
                  <InlineCode text={part.blurb} />
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>
      ) : null}

      <Section
        title="What it refuses, and why"
        lead="Each item below is a decision, not an omission. Each one states what to use instead."
      >
        <Stack gap="5">
          {entry.refusals.map((refusal) => (
            <Stack key={refusal.name} gap="2">
              <Text size="3" weight="medium">
                {refusal.name}
              </Text>
              <Text size="3" render={<p />}>
                <InlineCode text={refusal.why} />
              </Text>
            </Stack>
          ))}
        </Stack>
      </Section>

      {api && api.props.length ? (
        <Section
          title="Props"
          lead={
            api.element
              ? `A script generates this table from the types. The component also takes every prop of a <${api.element}>.`
              : "A script generates this table from the types."
          }
        >
          <Table size="2">
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>What it does</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {api.props.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell>
                    <Code size="2">
                      {prop.name}
                      {prop.optional ? "?" : ""}
                    </Code>
                  </TableCell>
                  <TableCell>
                    <Code size="2" emphasis="medium">
                      {prop.type}
                    </Code>
                  </TableCell>
                  <TableCell>
                    <InlineCode text={propDescription(prop)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      ) : null}

      <Section title="Everywhere">
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

      {/* The colophon, and the chapter pages' own footer one route over: a rule, then the
          facts about this page rather than about its subject. This is where the family and
          the spec citation went when they stopped being an eyebrow. */}
      <Stack gap="6">
        <Separator />
        <Text size="2" emphasis="quiet">
          {entry.family} · Specified in {entry.spec}.
        </Text>
      </Stack>
      </Stack>
    </PageFrame>
  );
}
