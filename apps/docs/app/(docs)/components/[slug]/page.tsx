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
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
} from "@kookie-ui/react";

import { Example } from "../../example";
import { API } from "../api.generated";
import { BY_SLUG, ENTRIES } from "../registry";

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
    ? { title: `${entry.name} — KookieUI`, description: entry.blurb }
    : { title: "KookieUI" };
}

/** A labelled block. Its own component because the page has six of them and they must not
    drift — the same reason the package has a shared type layer. */
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
    <Stack gap="4">
      <Stack gap="2">
        <Heading size="6" render={<h2 />}>
          {title}
        </Heading>
        {lead ? (
          <Text size="3" emphasis="medium" render={<p />}>
            {lead}
          </Text>
        ) : null}
      </Stack>
      <Separator />
      {children}
    </Stack>
  );
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = BY_SLUG.get(slug);
  if (!entry) notFound();
  const api = API[entry.name];

  return (
    <Stack gap="7" style={{ maxWidth: "52rem" }}>
      <Stack gap="4">
        <Flex gap="3" align="center">
          <Button size="1" emphasis="quiet" render={<Link href="/components" />}>
            ← Components
          </Button>
          <Text size="2" emphasis="quiet">
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
        <Example name={entry.slug} />
      </Section>

      {entry.axes.length ? (
        <Section
          title="Axes"
          lead="What each axis resolves to on this component. The axis names are the system's; what they mean here is this component's."
        >
          <Stack gap="5">
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
                <Text size="2" emphasis="medium" render={<p />}>
                  {axis.note}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>
      ) : null}

      {entry.parts ? (
        <Section
          title="Parts"
          lead="Anatomy the system owns. A component gets fixed parts only where something non-visual forces them — an accessible name to wire, a role to announce — never for arrangement alone."
        >
          <Stack gap="4">
            {entry.parts.map((part) => (
              <Stack key={part.part} gap="2">
                <Code size="2" weight="medium">
                  {part.part}
                </Code>
                <Text size="2" emphasis="medium" render={<p />}>
                  {part.blurb}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Section>
      ) : null}

      <Section
        title="What it refuses, and why"
        lead="Each of these is a decision, not an omission. Where the system says no, it says what to do instead."
      >
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

      {api && api.props.length ? (
        <Section
          title="Props"
          lead={
            api.element
              ? `Generated from the types. It also takes every prop of a <${api.element}>, which the platform documents better than we would.`
              : "Generated from the types."
          }
        >
          <Box className="kd-table-wrap">
            <Text size="2" render={<table className="kd-table" />}>
              <thead>
                <tr>
                  <th>
                    <Text size="2" weight="medium">
                      Prop
                    </Text>
                  </th>
                  <th>
                    <Text size="2" weight="medium">
                      Type
                    </Text>
                  </th>
                  <th>
                    <Text size="2" weight="medium">
                      What it does
                    </Text>
                  </th>
                </tr>
              </thead>
              <tbody>
                {api.props.map((prop) => (
                  <tr key={prop.name}>
                    <td>
                      <Code size="2">
                        {prop.name}
                        {prop.optional ? "?" : ""}
                      </Code>
                    </td>
                    <td>
                      <Code size="2" emphasis="medium">
                        {prop.type}
                      </Code>
                    </td>
                    <td>{prop.doc}</td>
                  </tr>
                ))}
              </tbody>
            </Text>
          </Box>
        </Section>
      ) : null}

      <Section title="Everywhere">
        <Stack gap="3">
          <Text size="2" emphasis="medium" render={<p />}>
            Rules this component inherits rather than states, because every component in the
            system does:
          </Text>
          <Text size="2" render={<ul className="kd-list" />}>
            {[
              "It owns no outer spacing. Distance between siblings is the container's gap; the escape is a Box.",
              "Its size is an index, never a measurement — the same numeral means different things on different ladders, and that is deliberate.",
              "Its appearance is resolved output. You choose meaning and loudness; the theme resolves the pigment.",
              "Its states are stylesheet work. No JavaScript runs on hover, press or focus.",
              "className and style are forwarded, and consumer style merges last — escapes win, visibly.",
            ].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </Text>
        </Stack>
      </Section>
    </Stack>
  );
}
