/**
 * List's preview spec (2026-09-12) — the prose list promoted from the docs' `.kd-list`.
 *
 * A type-family member, so most of the axes a control is judged on do not exist here: it is
 * inert, it paints no fill, and it has no box of its own. What the eye judges is the three
 * things the component adds — the indent, the rhythm between items, the marker's ink — at
 * each step of the ramp, and whether a nested list really does take the line it sits in.
 *
 * THREE OF THOSE JUDGEMENTS HAVE A CASE OF THEIR OWN SINCE THE AUDIT (2026-09-12), because
 * each of the three defects it found was invisible in an open column at size 3 and obvious one
 * container over: the indent is judged where a box CLIPS, the marker's ink is judged on a
 * NUMBER rather than a disc, and nesting is judged through a PORTAL.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Code,
  Flex,
  Grid,
  Heading,
  List,
  ListItem,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Text,
} from "@kookie-ui/react";

import { Demo, SpecTable } from "../pieces";
import type { ComponentPreview } from "./types";

/** The type steps a list is realistically set at — the reading steps, not the display ones. */
const STEPS = ["2", "3", "4", "5"] as const;

const ITEMS = ["Invite your team", "Connect a repository", "Deploy the first build"] as const;

function Sizes() {
  return (
    <Stack gap="6">
      <Demo label="Bulleted — the indent and the item rhythm at each reading step">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
          {STEPS.map((size) => (
            <List key={size} size={size}>
              {ITEMS.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </List>
          ))}
        </Grid>
      </Demo>
      <Demo label="Numbered — the same steps; the number must fit the indent">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
          {STEPS.map((size) => (
            <List key={size} size={size} ordered>
              {ITEMS.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </List>
          ))}
        </Grid>
      </Demo>
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      <SpecTable
        wide
        cols={["Bulleted", "Numbered"]}
        rows={(["loud", "medium"] as const).map((emphasis) => ({
          label: emphasis,
          cells: [
            <List key="ul" size="2" emphasis={emphasis}>
              {ITEMS.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </List>,
            <List key="ol" size="2" emphasis={emphasis} ordered>
              {ITEMS.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </List>,
          ],
        }))}
      />
      {/* Two-digit numbers are the indent's hardest case: `start` moves what the numbers SAY,
          so a list resumed after a paragraph lands on the edge of the room the indent has. */}
      <Demo label="Resumed at 9, and counting down — `start` and `reversed`">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5">
          <List size="3" ordered start={9}>
            <ListItem>Rotate the signing key</ListItem>
            <ListItem>Revoke the old key</ListItem>
            <ListItem>Confirm the webhook still verifies</ListItem>
          </List>
          <List size="3" ordered reversed>
            <ListItem>Composer</ListItem>
            <ListItem>Command</ListItem>
            <ListItem>Tree</ListItem>
          </List>
        </Grid>
      </Demo>
      {/* THE INDENT IS JUDGED WHERE A BOX CLIPS (audit 2026-09-12). A marker hangs in the
          indent, and a pane clips (§3) — so a marker the indent does not hold is not a marker
          hanging into the margin, it is a marker that has been deleted. The old value held a
          disc at one step and nothing at any other: "10." painted as "0." here, and at compact
          the bullets went entirely. Judge that every number and every disc is whole, and that
          the words still start on one line. */}
      <Demo label="Two-digit numbers, and discs, in a container that clips">
        <Flex gap="5" align="flex-start" wrap="wrap">
          <Box maxWidth="15rem">
            <Card size="1">
              <List size="1" ordered start={9}>
                <ListItem>Rotate the signing key</ListItem>
                <ListItem>Revoke the old key</ListItem>
                <ListItem>Confirm the webhook</ListItem>
              </List>
            </Card>
          </Box>
          <Box maxWidth="15rem">
            <Card size="1">
              <List size="1">
                <ListItem>Rotate the signing key</ListItem>
                <ListItem>Revoke the old key</ListItem>
              </List>
            </Card>
          </Box>
        </Flex>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* Self-nesting is SUPPORTED: a List inside a ListItem indents one level with no prop,
          the platform cycles the bullet, and the sub-list states no step or ink of its own.
          Judge that the size-2 medium parent's sub-lists stay at 2 and stay muted. */}
      <Demo label="Three levels deep — a size-2 medium list; the sub-lists take its line">
        <List size="2" emphasis="medium">
          <ListItem>
            Billing
            <List>
              <ListItem>Invoices</ListItem>
              <ListItem>
                Payment methods
                <List>
                  <ListItem>Cards</ListItem>
                  <ListItem>Bank transfer</ListItem>
                </List>
              </ListItem>
            </List>
          </ListItem>
          <ListItem>Members</ListItem>
        </List>
      </Demo>
      <Demo label="A numbered procedure with a bulleted step inside it">
        <List size="3" ordered>
          <ListItem>Open the project settings</ListItem>
          <ListItem>
            Under Domains, add both records
            <List>
              <ListItem>
                <Code>A</Code> pointing at the load balancer
              </ListItem>
              <ListItem>
                <Code>CNAME</Code> for the <Code>www</Code> subdomain
              </ListItem>
            </List>
          </ListItem>
          <ListItem>Wait for the check to turn green</ListItem>
        </List>
      </Demo>
      {/* Hosted where it usually lands: inside a card, beside a heading. What must NOT change
          is the left edge — the heading and the markers share none, the words indent. */}
      {/* A LIST IN A PANEL IS NOT A NESTED LIST (audit 2026-09-12). The panel is a portal and
          React context crosses one, so a list opened from inside an item counted as nested: it
          stamped no step, no weight and no ink, and then had no `<li>` above it to inherit a
          line from — 14px at the browser's own leading. Open it, and judge it against the same
          list standing beside it: the two must be one list rendered twice. */}
      <Demo label="A list inside a popover opened from inside a list">
        <Flex gap="6" align="flex-start">
          <List size="3">
            <ListItem>Rotate the signing key</ListItem>
            <ListItem>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button size="2" emphasis="quiet" bordered>
                      What this revokes
                    </Button>
                  }
                />
                <PopoverContent>
                  <Stack gap="2">
                    <PopoverTitle>What this revokes</PopoverTitle>
                    <List size="3">
                      <ListItem>Every session signed with the old key</ListItem>
                      <ListItem>Webhooks sent before today</ListItem>
                    </List>
                  </Stack>
                </PopoverContent>
              </Popover>
            </ListItem>
          </List>
          <Box maxWidth="16rem">
            <Card size="2">
              <List size="3">
                <ListItem>Every session signed with the old key</ListItem>
                <ListItem>Webhooks sent before today</ListItem>
              </List>
            </Card>
          </Box>
        </Flex>
      </Demo>
      <Demo label="Inside a card, under its heading">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="3">
              <Heading size="4" render={<h3 />}>
                Before you migrate
              </Heading>
              <List size="2">
                <ListItem>Export your API keys</ListItem>
                <ListItem>Pause scheduled jobs</ListItem>
                <ListItem>Tell your team the date</ListItem>
              </List>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function Tones() {
  return (
    <Stack gap="6">
      <SpecTable
        wide
        cols={["Bulleted — the words move, the disc stays furniture", "Numbered — the words and the numbers move together"]}
        rows={(["accent", "destructive", "success"] as const).map((tone) => ({
          label: tone,
          cells: [
            <List key="ul" size="2" tone={tone}>
              <ListItem>Three checks passed</ListItem>
              <ListItem>One deploy is waiting</ListItem>
            </List>,
            <List key="ol" size="2" tone={tone} ordered>
              <ListItem>Three checks passed</ListItem>
              <ListItem>One deploy is waiting</ListItem>
            </List>,
          ],
        }))}
      />
      {/* A TONE MOVES THE FAMILY AND NEVER THE RUNG (§15, audit 2026-09-12). A nested list that
          states only a tone used to drop its parent's rung and paint the family's LOUD ink, so
          a footnote under muted copy shouted. Judge that the red line is the same WEIGHT of ink
          as the grey one above it — a family apart, not a rung apart. */}
      <Demo label="A tone inside a medium list moves the family, not the rung">
        <List size="2" emphasis="medium">
          <ListItem>Three checks passed</ListItem>
          <ListItem>
            One deploy is waiting
            <List tone="destructive">
              <ListItem>The staging build failed twice</ListItem>
            </List>
          </ListItem>
        </List>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      <Demo label="What a plan includes — the list carries the comparison">
        <Box maxWidth="22rem">
          <Card size="3">
            <Stack gap="5">
              <Stack gap="2">
                <Flex justify="space-between" align="baseline">
                  <Heading size="4" render={<h3 />}>
                    Pro
                  </Heading>
                  <Text size="3">$20 / month</Text>
                </Flex>
                <List size="2" emphasis="medium">
                  <ListItem>Unlimited projects</ListItem>
                  <ListItem>Preview deploys on every branch</ListItem>
                  <ListItem>Audit log kept for 90 days</ListItem>
                </List>
              </Stack>
              <Button tone="accent" emphasis="loud">
                Upgrade
              </Button>
            </Stack>
          </Card>
        </Box>
      </Demo>
      <Demo label="Release notes — a heading, a sentence, the changes">
        <Box maxWidth="32rem">
          <Stack gap="3">
            <Heading size="6" render={<h2 />}>
              Version 0.9
            </Heading>
            <Text size="3">Shruti Bhatia shipped the list this week.</Text>
            <List size="3">
              <ListItem>Numbered and bulleted lists from one component</ListItem>
              <ListItem>
                Nested lists take their parent’s size and ink
              </ListItem>
              <ListItem>
                <Code>start</Code> and <Code>reversed</Code> pass through on a numbered list
              </ListItem>
            </List>
          </Stack>
        </Box>
      </Demo>
    </Stack>
  );
}

export const listPreview: ComponentPreview = {
  slug: "list",
  name: "List",
  sections: {
    sizes: { body: <Sizes /> },
    states: {
      absent:
        "A list is inert: no hover, press, focus or disabled state of its own. A link inside an item carries its own states.",
    },
    materials: {
      absent:
        "A list paints no fill, so a material has nothing to veil. On a glass pane it reads the pane's foreground roles like any other text.",
    },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: { body: <Tones /> },
    inUse: { body: <InUse /> },
  },
};
