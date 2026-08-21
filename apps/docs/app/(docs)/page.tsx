import Link from "next/link";
import { Button, Card, Flex, Heading, Separator, Stack, Text } from "@kookie-ui/react";

import { SECTIONS, chaptersIn } from "./chapters";

/**
 * The front door.
 *
 * Composed under the house style it argues for, which is the least this page owes: one focal
 * action (Get started is the only loud thing here), differentiated rhythm (7 between sections,
 * 4 inside them, 2 binding a heading to its sentence), the §15 type ladder, and no size 1
 * anywhere. If this page broke those rules, nothing else on the site would be worth reading.
 */
export default function Home() {
  return (
    <Stack gap="7" style={{ maxWidth: "52rem" }}>
      <Stack gap="4">
        <Heading size="8" render={<h1 />}>
          A design system that means what it says
        </Heading>
        <Text size="4" emphasis="medium" render={<p />}>
          KookieUI is a taxonomy first and a component library second. Each component names a
          kind of thing: a ground, a surface, a control, a mark. What a component refuses is as
          designed as what it does. These pages state the rules. The system enforces most of
          them, so you do not have to remember them.
        </Text>
        <Flex gap="3" wrap="wrap">
          <Button
            size="3"
            tone="accent"
            emphasis="loud"
            render={<Link href="/start/installation" />}
          >
            Get started
          </Button>
          <Button size="3" emphasis="medium" render={<Link href="/philosophy/why-kookie-exists" />}>
            Read the argument
          </Button>
          <Button size="3" emphasis="quiet" bordered render={<Link href="/components" />}>
            Components
          </Button>
        </Flex>
      </Stack>

      <Separator />

      <Stack gap="4">
        <Heading size="6" render={<h2 />}>
          Three claims, and where to read about each
        </Heading>
        <Stack gap="4">
          {[
            {
              title: "Meaning, not appearance",
              body: "You choose what a thing means. You set a tone, a loudness and a size index. The theme resolves the colour, the length and the corner. There is no colour prop and no variant prop. Meaning and loudness are separate questions, and one prop that answers both produces values such as secondary-outline-destructive.",
              href: "/philosophy/the-kinds-of-things",
              label: "The kinds of things",
            },
            {
              title: "Refusals with reasons",
              body: "A component refuses a margin, a shadow and a second loud control. Each refusal has a written reason and a stated alternative. Without that text, a missing prop and a refused prop look the same.",
              href: "/components",
              label: "Browse the components",
            },
            {
              title: "Guidelines that hold",
              body: "You cannot express most of the rules on this site incorrectly, because they are types rather than advice. A test checks the rest, including these pages: each chapter cites the specification, and a test resolves every citation. The pages mark each judgment as a judgment.",
              href: "/philosophy/why-these-rules-hold",
              label: "Why these rules hold",
            },
          ].map((claim) => (
            <Card key={claim.title} size="3">
              <Stack gap="3">
                <Stack gap="2">
                  <Heading size="5" render={<h3 />}>
                    {claim.title}
                  </Heading>
                  <Text size="3" emphasis="medium" render={<p />}>
                    {claim.body}
                  </Text>
                </Stack>
                <Flex>
                  <Button size="2" emphasis="quiet" bordered render={<Link href={claim.href} />}>
                    {claim.label}
                  </Button>
                </Flex>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Stack>

      <Separator />

      <Stack gap="4">
        <Heading size="6" render={<h2 />}>
          Everything on this site
        </Heading>
        <Stack gap="5">
          {SECTIONS.map((section) => {
            const chapters = chaptersIn(section.id);
            if (chapters.length === 0) return null;
            return (
              <Stack key={section.id} gap="3">
                <Stack gap="2">
                  <Heading size="5" render={<h3 />}>
                    {section.title}
                  </Heading>
                  <Text size="3" emphasis="medium" render={<p />}>
                    {section.blurb}
                  </Text>
                </Stack>
                <Flex gap="2" wrap="wrap">
                  {chapters.map((chapter) => (
                    <Button
                      key={chapter.slug}
                      size="2"
                      emphasis="quiet"
                      bordered
                      render={<Link href={`/${chapter.slug}`} />}
                    >
                      {chapter.title}
                    </Button>
                  ))}
                </Flex>
              </Stack>
            );
          })}
        </Stack>
      </Stack>

      <Separator />

      <Stack gap="4">
        <Stack gap="2">
          <Heading size="6" render={<h2 />}>
            The workbench
          </Heading>
          <Text size="3" emphasis="medium" render={<p />}>
            The tools the team uses to judge this system. They are public, so you can check the
            claims on these pages yourself.
          </Text>
        </Stack>
        <Stack gap="4">
          {[
            {
              title: "Builder",
              body: "A composition editor with limits. The canvas renders real components. Every distance is a token index from a closed list. The export is the React code a developer would write. It also runs the composition rules, so it reports a screen with two loud controls.",
              href: "/builder",
            },
            {
              title: "Preview",
              body: "Every shipped component in specimen tables: rungs against families, sizes against states, and the ten tone families across every component. It also holds complete screens built from them. The team reviews the visual result here.",
              href: "/preview",
            },
            {
              title: "Matrix",
              body: "The axis grid: size against density in each pointer world. You can switch radius, depth and contrast in place. Preview shows a component next to others. This shows whether one cell is correct.",
              href: "/matrix",
            },
          ].map((tool) => (
            <Stack key={tool.title} gap="2">
              <Flex gap="3" align="center" wrap="wrap">
                <Text size="3" weight="medium">
                  {tool.title}
                </Text>
                <Button size="1" emphasis="quiet" render={<Link href={tool.href} />}>
                  Open →
                </Button>
              </Flex>
              <Text size="3" emphasis="medium" render={<p />}>
                {tool.body}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
