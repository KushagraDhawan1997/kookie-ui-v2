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
          KookieUI is a taxonomy before it is a component library. Every component names a kind
          of thing that exists — a ground, a surface, a control, a mark — and what it refuses is
          as designed as what it does. These pages are that argument, and the system enforces
          most of it rather than asking you to remember it.
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
          Three claims, and where each one is answered
        </Heading>
        <Stack gap="4">
          {[
            {
              title: "Meaning, not appearance",
              body: "You choose what a thing is — a tone, a loudness, a size index — and the theme resolves the pigment, the length and the corner. There is no colour prop and no variant, because meaning and loudness are different questions and fusing them is how every system ends up with a value called secondary-outline-destructive.",
              href: "/philosophy/the-kinds-of-things",
              label: "The kinds of things",
            },
            {
              title: "Refusals with reasons",
              body: "A component that will not take a margin, a shadow or a second focal point is making an argument. Every refusal in this system is written down with the reason and the alternative, because a missing prop and a refused one look identical until somebody says which it is.",
              href: "/components",
              label: "Browse the components",
            },
            {
              title: "Guidelines that hold",
              body: "Most of the rules on this site are unexpressible to violate — they are types, not advice. The rest are checked by something that fails a build, including these pages: every chapter cites the specification it publishes and a law resolves the citation. What is genuinely taste is labelled as taste.",
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
            The instruments this system is judged with, kept public on purpose. A manifesto with
            the proof hidden is just a manifesto.
          </Text>
        </Stack>
        <Stack gap="4">
          {[
            {
              title: "Builder",
              body: "A constrained composition editor: the canvas is a live render of real components, every distance is a token index picked from a closed list, and the export is the React code a person would have written. It also runs the house style as live checks, so it will tell you a screen has two focal points before anyone else does.",
              href: "/builder",
            },
            {
              title: "Preview",
              body: "Every shipped component in dense specimen tables — rungs against families, sizes against states, the ten tones swept across every consumer — plus real screens composed from them. This is the surface the eye pass actually runs on.",
              href: "/preview",
            },
            {
              title: "Matrix",
              body: "The axis grid: size against density in each pointer world, with radius, depth and contrast switchable in place. Preview answers whether a component looks right beside the others; this answers whether a single cell is right.",
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
