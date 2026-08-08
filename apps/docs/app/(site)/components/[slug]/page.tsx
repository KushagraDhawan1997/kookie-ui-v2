import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Button,
  Card,
  Code,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
} from "@kookie-ui/react";

import { BY_SLUG, ENTRIES } from "../registry";

export function generateStaticParams() {
  return ENTRIES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  return { title: entry ? `${entry.name} — KookieUI` : "KookieUI" };
}

/** A labelled block. Its own component because the page has four of them and they must not
    drift — the same reason the package has a shared type layer. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="4">
      <Heading size="4" render={<h2 />}>
        {title}
      </Heading>
      <Separator />
      {children}
    </Stack>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  if (!entry) notFound();

  return (
    <Stack gap="7" style={{ maxWidth: "48rem" }}>
      <Stack gap="4">
        <Flex gap="3" align="center">
          <Button size="1" emphasis="quiet" render={<Link href="/components" />}>
            ← Components
          </Button>
          <Text size="1" emphasis="quiet">
            {entry.family} · {entry.spec}
          </Text>
        </Flex>
        <Heading size="8" render={<h1 />}>
          {entry.name}
        </Heading>
        <Text size="4" emphasis="medium" render={<p />}>
          {entry.blurb}
        </Text>
      </Stack>

      <Section title="Example">
        <Card size="4">{entry.example}</Card>
      </Section>

      <Section title="Axes">
        <Stack gap="4">
          {entry.axes.map((axis) => (
            <Stack key={axis.name} gap="2">
              <Flex gap="3" align="center" wrap="wrap">
                <Code size="2" weight="medium">
                  {axis.name}
                </Code>
                <Text size="2" emphasis="medium">
                  {axis.values}
                </Text>
              </Flex>
              {axis.note ? (
                <Text size="2" emphasis="quiet" render={<p />}>
                  {axis.note}
                </Text>
              ) : null}
            </Stack>
          ))}
        </Stack>
      </Section>

      {entry.parts ? (
        <Section title="Parts">
          <Stack gap="4">
            {entry.parts.map((p) => (
              <Stack key={p.part} gap="2">
                <Code size="2" weight="medium">
                  {p.part}
                </Code>
                <Text size="2" emphasis="medium" render={<p />}>
                  {p.blurb}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>
      ) : null}

      <Section title="What it refuses, and why">
        <Stack gap="5">
          {entry.refusals.map((refusal) => (
            <Stack key={refusal.name} gap="2">
              <Text size="3" weight="medium">
                {refusal.name}
              </Text>
              <Text size="2" emphasis="medium" render={<p />}>
                {refusal.why}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Section>

      <Section title="Everywhere">
        <Stack gap="3">
          <Text size="2" emphasis="medium" render={<p />}>
            Rules this component inherits rather than states, because every component in the
            system does:
          </Text>
          <Stack gap="2">
            {[
              "It owns no outer spacing. Distance between siblings is the container's gap; the escape is a Box.",
              "Its size is an index, never a measurement — the same numeral means different things on different ladders, and that is deliberate.",
              "Its appearance is resolved output. You choose meaning and loudness; the theme resolves the pigment.",
              "Its states are stylesheet work. No JavaScript runs on hover, press or focus.",
              "className and style are forwarded, and consumer style merges last — escapes win, visibly.",
            ].map((line) => (
              <Flex key={line} gap="3">
                <Text size="2" emphasis="quiet">
                  ·
                </Text>
                <Text size="2" emphasis="medium">
                  {line}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Section>
    </Stack>
  );
}
