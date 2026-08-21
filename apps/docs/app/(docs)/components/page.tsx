import Link from "next/link";
import { Card, Flex, Grid, Heading, Separator, Stack, Text } from "@kookie-ui/react";

import { ENTRIES, type Entry } from "./registry";

const FAMILIES: Entry["family"][] = ["Layout", "Type", "Control", "Surface", "Indicator"];

export const metadata = { title: "Components — KookieUI" };

export default function ComponentsIndex() {
  return (
    <Stack gap="7" style={{ maxWidth: "56rem" }}>
      <Stack gap="4">
        <Heading size="8" render={<h1 />}>
          Components
        </Heading>
        <Text size="4" emphasis="medium" render={<p />}>
          Every component the package exports, grouped by the family it belongs to. Each page
          states what the component is, the axes it exposes, and — the part that carries the
          argument — what it refuses and why.
        </Text>
      </Stack>

      {FAMILIES.map((family) => {
        const members = ENTRIES.filter((e) => e.family === family);
        if (members.length === 0) return null;
        return (
          <Stack key={family} gap="4">
            <Flex gap="4" align="center">
              <Heading size="5" render={<h2 />}>
                {family}
              </Heading>
              <Text size="1" emphasis="quiet">
                {members.length}
              </Text>
            </Flex>
            <Separator />
            {/* Definite tracks: a Box shrink-wrapping in a row collapses to zero width (the
                recorded §2 defect), so the grid hands each card a track instead. */}
            <Grid columns="repeat(auto-fill, minmax(15rem, 1fr))" gap="4">
              {members.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/components/${entry.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Card size="3">
                    <Stack gap="2">
                      <Text size="3" weight="medium">
                        {entry.name}
                      </Text>
                      <Text size="1" emphasis="quiet">
                        {entry.spec}
                      </Text>
                    </Stack>
                  </Card>
                </Link>
              ))}
            </Grid>
          </Stack>
        );
      })}
    </Stack>
  );
}
