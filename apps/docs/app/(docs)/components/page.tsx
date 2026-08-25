import Link from "next/link";
import { Box, Flex, Grid, Heading, Stack, Text } from "@kookie-ui/react";

import { InlineCode } from "../../inline-code";
import { PageFrame } from "../page-frame";
import { ENTRIES, type Entry } from "./registry";

const FAMILIES: Entry["family"][] = ["Layout", "Type", "Control", "Surface", "Indicator"];

export const metadata = { title: "Components — KookieUI" };

/**
 * The opening sentence of a blurb, which is what an index entry can carry.
 *
 * Read off the blurb rather than stored beside it, so there is no second field to fall out of
 * step with the page the row leads to — the same reason the example's pane is derived from its
 * source. A blurb runs to three sentences on the components that need them; the first is
 * always the one that says what the thing IS, because the anti-stub law makes a real sentence
 * the floor and that is the sentence people write first.
 */
function opener(blurb: string): string {
  return /^(.*?[.!?])(\s|$)/.exec(blurb)?.[1] ?? blurb;
}

/**
 * The component index.
 *
 * WHAT THIS PAGE USED TO BE, and why it is not any more (2026-08-25): 42 `size 3` Cards, each
 * one holding a name and the DECISIONS sections it implements at `size 1`. Two faults at once.
 * The card was ~80% air — a 120px box around two short lines is a box drawn for its own sake,
 * and §15's closure rule says not to box what alignment already groups: a grid of names needs
 * no borders to read as a group. And the thing inside the box was the wrong thing. `§11, §15`
 * is bookkeeping; it tells a reader looking for "the one that switches panels" nothing at all,
 * and it was set at the one type step §15 retires from composed surfaces.
 *
 * A row carries the name and what the component IS, which is what makes an index scannable —
 * and it is what tells the near-twins apart at a glance, which is this system's own stated
 * difficulty: Tabs against SegmentedControl, Card against Surface, Dialog against AlertDialog.
 * The spec reference did not disappear; it is on the component's own page, where the reader
 * has asked for it.
 */
export default function ComponentsIndex() {
  return (
    <PageFrame width="62rem">
      <Stack gap="9">
        <Stack gap="3" className="kd-prose">
          <Heading size="8" render={<h1 />}>
            Components
          </Heading>
          <Text size="5" render={<p />}>
            Every component the package exports, grouped by the family it belongs to. Each page
            states what the component is, the axes it exposes, and — the part that carries the
            argument — what it refuses and why.
          </Text>
        </Stack>

        {FAMILIES.map((family) => {
          const members = ENTRIES.filter((e) => e.family === family);
          if (members.length === 0) return null;
          return (
            <Stack key={family} gap="5">
              {/* No rule under the heading. A separator divides where distance cannot, and
                  here distance already does it: 48px between families against 16px from a
                  heading to its own grid is the asymmetry §15 asks for, and a line on top of
                  it would be the second mechanism the brief refuses. */}
              <Flex gap="3" align="center">
                <Heading size="6" render={<h2 />}>
                  {family}
                </Heading>
                <Text size="2" emphasis="quiet">
                  {members.length}
                </Text>
              </Flex>
              {/* Definite tracks: a Box shrink-wrapping in a row collapses to zero width (the
                  recorded §2 defect), so the grid hands each entry a track instead. */}
              <Grid columns="repeat(auto-fill, minmax(17rem, 1fr))" gapX="6" gapY="5">
                {members.map((entry) => (
                  <Box
                    key={entry.slug}
                    className="kd-index-item"
                    render={<Link href={`/components/${entry.slug}`} />}
                  >
                    <Stack gap="1">
                      <Text size="3" weight="medium" className="kd-index-name">
                        {entry.name}
                      </Text>
                      <Text size="2" emphasis="medium" className="kd-index-blurb">
                        <InlineCode text={opener(entry.blurb)} />
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Stack>
          );
        })}
      </Stack>
    </PageFrame>
  );
}
