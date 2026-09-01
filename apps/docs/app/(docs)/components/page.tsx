import Link from "next/link";
import { Flex, Grid, Heading, Link as KookieLink, Stack, Text } from "@kookie-ui/react";

import { PageFrame, PageTitle } from "../page-frame";
import { ENTRIES, type Entry } from "./registry";
import { humanLabel } from "../label";

const FAMILIES: Entry["family"][] = ["Layout", "Type", "Control", "Surface", "Indicator"];

export const metadata = { title: "Components — KookieUI" };

/**
 * The component index.
 *
 * PLAIN LINK LISTS, IN THE FRONT DOOR'S OWN SHAPE (2026-08-30, Kushagra: "rewrite components
 * page to be like main one — simple lists no fancy card"). The page has been three things:
 * 42 `size 3` Cards holding a name and DECISIONS section numbers (boxes that were ~80% air
 * around bookkeeping, retired 2026-08-25); then name-plus-opening-sentence cards, briefly on
 * a `<Surface>` ground and then in open space (2026-08-28/29). What killed the cards is the
 * front door's own argument, which this page now simply inherits: a component page is a
 * PLACE, and the thing that goes to a place is a link — a grid of pressable panes turns an
 * index into a wall of buttons, and beside the home page's quiet columns the two indexes
 * read as two different sites.
 *
 * WHAT THE CARDS WERE CARRYING, stated rather than lost silently: each one showed the
 * blurb's opening sentence, the "what it IS" line that tells the near-twins apart (Tabs
 * against SegmentedControl, Card against Surface). That line lives on the component's own
 * page, one click away, where the reader has asked for it — the same trade the front door
 * makes when it lists chapter titles without their first paragraphs.
 *
 * The layout is the home page's verbatim: 48rem frame, `auto-fit minmax(20rem, 1fr)` cells,
 * 32px gutters against 48px row breaks, `gap 4` inside a cell and `gap 3` between links —
 * distance doing all the grouping, no ground, no rules. A family's list is a single column
 * on the front door's own 2026-08-29 reasoning (reading order goes down, not across), so
 * Control at fifteen rows stands taller than Surface beside it — the correct trade, and the
 * one Apple's tile columns make. The count beside each heading is read off the registry,
 * because a number in prose is the first thing to go stale.
 */
export default function ComponentsIndex() {
  return (
    <PageFrame width="48rem">
      <Stack gap="10">
        <PageTitle deck="Every component in the package, grouped by family. Each page tells you what the component is, which props it takes, and what it will not do and why.">
          Components
        </PageTitle>

        <Grid columns="repeat(auto-fit, minmax(20rem, 1fr))" gapX="7" gapY="9">
          {FAMILIES.map((family) => {
            const members = ENTRIES.filter((e) => e.family === family);
            if (members.length === 0) return null;
            return (
              <Stack key={family} gap="4">
                {/* No rule under the heading, and no ground under the list: 48px between
                    families against 16px from a heading to its own list is the asymmetry
                    §15 asks for, and distance is the one mechanism doing the work. */}
                <Flex gap="3" align="center">
                  <Heading size="5" render={<h2 />}>
                    {family}
                  </Heading>
                  <Text size="2" emphasis="quiet">
                    {members.length}
                  </Text>
                </Flex>
                <Stack gap="3" align="start">
                  {members.map((entry) => (
                    <KookieLink
                      key={entry.slug}
                      size="3"
                      render={<Link href={`/components/${entry.slug}`} />}
                    >
                      {humanLabel(entry.name)}
                    </KookieLink>
                  ))}
                </Stack>
              </Stack>
            );
          })}
        </Grid>
      </Stack>
    </PageFrame>
  );
}
