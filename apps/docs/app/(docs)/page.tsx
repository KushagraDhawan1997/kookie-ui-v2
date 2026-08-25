import Link from "next/link";
import {
  Button,
  Flex,
  Grid,
  Heading,
  Link as KookieLink,
  Stack,
  Text,
} from "@kookie-ui/react";

import { PageFrame } from "./page-frame";
import { SECTIONS, chaptersIn } from "./chapters";

const CLAIMS = [
  {
    title: "Meaning, not appearance",
    body: "You choose what a thing means. You set a tone, a loudness and a size index. The theme resolves the colour, the length and the corner. There is no colour prop and no variant prop.",
    href: "/philosophy/component-families",
    label: "The component families",
  },
  {
    title: "Refusals with reasons",
    body: "A component refuses a margin, a shadow and a second loud control. Each refusal has a written reason and a stated alternative. Without that text, a missing prop and a refused prop look the same.",
    href: "/components",
    label: "Browse the components",
  },
  {
    title: "Guidelines that hold",
    body: "Most of the rules on this site are types, not advice, so you cannot write them wrong. Tests check the rest, including these pages: every chapter cites the specification, and a test resolves each citation.",
    href: "/philosophy/why-these-rules-hold",
    label: "Why these rules hold",
  },
];

const TOOLS = [
  {
    title: "Builder",
    body: "A composition editor with limits. The canvas renders real components and every distance is a token index from a closed list. It also runs the composition rules, so it reports a screen with two loud controls.",
    href: "/builder",
  },
  {
    title: "Preview",
    body: "Every shipped component in specimen tables: rungs against families, sizes against states, and the ten tone families across every component. The team reviews the visual result here.",
    href: "/preview",
  },
  {
    title: "Matrix",
    body: "The axis grid: size against density in each pointer world, with radius, depth and contrast switchable in place. Preview shows a component beside others; this shows whether one cell is correct.",
    href: "/matrix",
  },
];

/**
 * The front door.
 *
 * Composed under the house style it argues for, which is the least this page owes: one focal
 * action (Get started is the only loud thing here), differentiated rhythm, the §15 type ladder,
 * and no size 1 anywhere. If this page broke those rules, nothing else on the site would be
 * worth reading — and until 2026-08-25 it broke two of them.
 *
 * IT WAS BOXING AND RULING THE SAME BREAKS. Three `size 3` Cards held the claims, four
 * Separators divided the sections, and a `gap 7` sat between them: enclosure, a line and
 * distance all saying one thing, where §15 asks for whichever one of the three is doing the
 * work. The cards were the weakest of the three — a full-width pane around a heading and a
 * paragraph groups nothing that a column of text does not already group — so they went, the
 * rules went with them, and the distance was raised to the 48px the rest of the site now uses
 * for a section break.
 *
 * AND IT WAS SPELLING LINKS AS BUTTONS. Twenty-one bordered pills stood in for the site index,
 * three more sat inside the claims and three "Open →" buttons sat beside the tool names — 27
 * controls on a page with one thing to do. A button is a verb; a chapter is a place. The index
 * is `Row` now, which is the system's own list row (§21) and brings its own hover, and the
 * claims carry a plain `Link`. What survives as a Button is the one row that really is a set of
 * actions: the three at the top, ranked loud, medium, quiet.
 */
export default function Home() {
  return (
    <PageFrame width="62rem">
      <Stack gap="9">
        <Stack gap="6">
          <Stack gap="3" className="kd-prose">
            <Heading size="8" render={<h1 />}>
              A design system that means what it says
            </Heading>
            <Text size="5" render={<p />}>
              KookieUI sorts components by what they do, not by how they look. A ground, a
              surface, a control and a mark each take different props. What a component refuses
              is as designed as what it does. These pages state the rules, and the types enforce
              most of them, so you do not have to remember them.
            </Text>
          </Stack>
          <Flex gap="3" wrap="wrap">
            <Button
              size="3"
              tone="accent"
              emphasis="loud"
              render={<Link href="/start/installation" />}
            >
              Get started
            </Button>
            <Button
              size="3"
              emphasis="medium"
              render={<Link href="/philosophy/why-kookie-exists" />}
            >
              Read the argument
            </Button>
            <Button size="3" emphasis="quiet" bordered render={<Link href="/components" />}>
              Components
            </Button>
          </Flex>
        </Stack>

        <Stack gap="5">
          <Heading size="6" render={<h2 />}>
            Three claims
          </Heading>
          <Grid columns="repeat(auto-fit, minmax(15rem, 1fr))" gapX="6" gapY="6">
            {CLAIMS.map((claim) => (
              // `space-between` so the three links land on one baseline whatever the bodies
              // do. A grid of blocks with ragged bottoms has three end edges and therefore no
              // alignment; the cell stretches, so pushing the action down costs nothing.
              <Stack key={claim.title} gap="3" justify="space-between">
                <Stack gap="2">
                  <Heading size="4" render={<h3 />}>
                    {claim.title}
                  </Heading>
                  <Text size="3" emphasis="medium" render={<p />}>
                    {claim.body}
                  </Text>
                </Stack>
                <Flex>
                  <KookieLink size="3" render={<Link href={claim.href} />}>
                    {claim.label}
                  </KookieLink>
                </Flex>
              </Stack>
            ))}
          </Grid>
        </Stack>

        <Stack gap="5">
          <Heading size="6" render={<h2 />}>
            Everything on this site
          </Heading>
          <Stack gap="6">
            {SECTIONS.map((section) => {
              const chapters = chaptersIn(section.id);
              if (chapters.length === 0) return null;
              return (
                <Stack key={section.id} gap="3">
                  <Stack gap="2" className="kd-prose">
                    <Heading size="4" render={<h3 />}>
                      {section.title}
                    </Heading>
                    <Text size="3" emphasis="medium" render={<p />}>
                      {section.blurb}
                    </Text>
                  </Stack>
                  {/* Links, in a grid. `Row` was tried here first and read wrong: a row is a
                      member of a LIST and its resting state is transparent, so away from the
                      panel a menu or a sidebar gives it, twenty-one of them floated as stray
                      words with no affordance until the pointer arrived. A chapter is a place
                      and the thing that goes to a place is a link — which is also the one
                      spelling that says so while nobody is pointing at it. */}
                  <Grid columns="repeat(auto-fill, minmax(13rem, 1fr))" gapX="5" gapY="3">
                    {chapters.map((chapter) => (
                      <Flex key={chapter.slug}>
                        <KookieLink size="3" render={<Link href={`/${chapter.slug}`} />}>
                          {chapter.title}
                        </KookieLink>
                      </Flex>
                    ))}
                  </Grid>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <Stack gap="5">
          <Stack gap="2" className="kd-prose">
            <Heading size="6" render={<h2 />}>
              The workbench
            </Heading>
            <Text size="3" emphasis="medium" render={<p />}>
              The tools the team uses to judge this system. They are public, so you can check
              the claims on these pages yourself.
            </Text>
          </Stack>
          <Grid columns="repeat(auto-fit, minmax(15rem, 1fr))" gapX="6" gapY="6">
            {TOOLS.map((tool) => (
              <Stack key={tool.title} gap="3" justify="space-between">
                <Stack gap="2">
                  <Heading size="4" render={<h3 />}>
                    {tool.title}
                  </Heading>
                  <Text size="3" emphasis="medium" render={<p />}>
                    {tool.body}
                  </Text>
                </Stack>
                <Flex>
                  <KookieLink size="3" render={<Link href={tool.href} />}>
                    Open {tool.title}
                  </KookieLink>
                </Flex>
              </Stack>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </PageFrame>
  );
}
