/**
 * Tabs' preview spec — Tabs shipped 2026-08-18 (§26) and grew its travelling highlight
 * 2026-08-23, which is what this page mostly exists to make judgeable.
 *
 * A specimen table cannot show the thing this component is about. The rule under the active
 * tab is ONE object drawn by its two inline edges, and the edge facing the destination takes
 * the shorter clock — 320ms against 480 — so it stretches toward the tab you picked and
 * gathers itself as the far edge catches up. Over a two-tab hop that stretch is a few pixels
 * and reads as a photograph being slid; it is only legible over a LONG jump, which is why
 * several bars below are deliberately wide and one of them has eight tabs. Everything on this
 * page that says "click" is asking to be clicked.
 *
 * The second thing it has to answer is the confusion the component lives inside (§26's own
 * opening sentence): a tab bar switches what is UNDER it, a segmented control sets a value in
 * place, and reaching for the wrong one is the actual mistake. They stand together twice —
 * in Sizes, where the two boxes must agree, and In use, where each does its own job.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  SegmentedItem,
  Separator,
  Stack,
  Surface,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import { BellIcon, ChartIcon, FolderIcon, HomeIcon, SettingsIcon, UsersIcon } from "../../icons";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis. A FUNCTION, not a module const: the
    standalone route imports this module on the server for its slug, and `themeAxes` is a client
    module's data — unreadable during server module evaluation. card.tsx carries the same note
    and the same reason, and it is why every section below is a component rather than a
    module-scope element tree. Tabs paint no material of their own (see the Materials section);
    this list is here because a bar dropped INSIDE a glass pane inherits two roles that pane
    re-points, which is judged in Nesting. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** A workspace's real sections, and what is actually under each one. Eight of them, so a jump
    from the first to the last is a long travel — the only distance at which the stretch is
    visible. The third entry is there because a tab bar is only half a specimen: what a bar is
    FOR is the thing that changes underneath it, and a panel reading "Billing lives here" would
    be the demo declining to show that. */
const WORKSPACE: readonly (readonly [string, string, string])[] = [
  ["overview", "Overview", "Nine services across two environments, all healthy."],
  ["activity", "Activity", "Priya merged the audit findings an hour ago. Dan opened two issues."],
  ["members", "Members", "Four people, two of them admins. Three seats left on this plan."],
  ["integrations", "Integrations", "GitHub and Linear are connected. Slack was disconnected on Tuesday."],
  ["notifications", "Notifications", "Email goes to every admin when a deploy fails or a check goes red."],
  ["billing", "Billing", "Pro, $240 a month, renewing on 1 September."],
  ["audit", "Audit log", "Every settings change made in the last 90 days, newest first."],
  ["danger", "Danger zone", "Transfer this workspace to another owner, or delete it and everything in it."],
];

/** The eight-tab bar, at whatever index is asked for. `Tabs` itself owns no layout, so the
    bar is the only box here. */
function WideBar({ size = "2", defaultValue = "overview" }: { size?: "1" | "2" | "3" | "4"; defaultValue?: string }) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList size={size} aria-label="Workspace settings">
        {WORKSPACE.map(([value, label]) => (
          <TabsTab key={value} value={value}>
            {label}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* THE BAR KEEPS THE LADDER AND THE TAB STANDS OFF IT (2026-08-23). Read across a row
          rather than down the column: at one index the bar, the segmented control's track and
          the Button are one height, because a tab bar has to stand level with the controls in
          the toolbar it sits in. At the default density on a fine pointer that is 28/32/40/48,
          and the TAB inside the bar is 24/28/36/44 — the same rung less `tabInset` at both
          block edges, which is exactly the subtraction that gives a segment 28 in a 32 track. */}
      <SpecTable
        cols={["Tab bar", "Segmented control", "Button"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Tabs key="tabs" defaultValue="overview">
              <TabsList size={size} aria-label={`Size ${size}`}>
                <TabsTab value="overview">Overview</TabsTab>
                <TabsTab value="activity">Activity</TabsTab>
                <TabsTab value="members">Members</TabsTab>
              </TabsList>
            </Tabs>,
            <SegmentedControl key="seg" size={size} defaultValue="list" aria-label={`View, size ${size}`}>
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
            </SegmentedControl>,
            <Button key="btn" size={size}>
              New project
            </Button>,
          ],
        }))}
      />

      {/* The inset has no paint of its own, so the only way to SEE it is to make the tab draw
          its own box: hover one. The fill stops short of the hairline at the bottom and short
          of the bar's top edge by the same amount, which is the symmetry the number was chosen
          for — clearing only the line below would leave every label sitting visibly high in its
          own bar. Before this the tab ran the full rung and a hovered tab's fill welded itself
          to the line. */}
      <Demo label="Hover a tab at each index — its fill stops short of the hairline, by the same amount top and bottom">
        <Stack gap="5">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center">
              <Box width="4rem">
                <Text size="2" emphasis="quiet">
                  size {size}
                </Text>
              </Box>
              <Tabs defaultValue="overview">
                <TabsList size={size} aria-label={`Hover, size ${size}`}>
                  <TabsTab value="overview">Overview</TabsTab>
                  <TabsTab value="activity">Activity</TabsTab>
                  <TabsTab value="members">Members</TabsTab>
                  <TabsTab value="billing">Billing</TabsTab>
                </TabsList>
              </Tabs>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* The index is stamped ONCE, on the list. A bar of tabs at mixed sizes is not a thing
          anyone means, so there is no per-tab size to get wrong; each tab derives its box from
          the bar it is in. What DOES move with the index, in one read: the label's step, the
          tab's inline padding, and the bar's height. The rule's thickness does not — it is one
          designed value at every size, because the thickness a rule needs to read as a rule is
          a perception floor rather than a proportion of the box above it. */}
      <Demo label="What the index moves, and what it deliberately does not — the rule is the same 2px at every size">
        <Stack gap="5">
          {SIZES.map((size) => (
            <WideBar key={size} size={size} defaultValue="members" />
          ))}
        </Stack>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* Rest, active, hover, press, focus — all on one bar, because a tab's states are only
          legible against the other tabs in the same bar. The active one is marked by INK and
          the rule and by nothing else: no louder fill, which would make it read as a button
          among links, and no heavier label, because semibold is wider than medium and the bar
          would reflow every time you switched. Tab into it from the keyboard for the ring. */}
      <Demo label="Rest, active, hover, press, focus — click, hold, and tab into the bar">
        <Box maxWidth="34rem">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Project">
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="activity">Activity</TabsTab>
              <TabsTab value="members">Members</TabsTab>
              <TabsTab value="billing">Billing</TabsTab>
            </TabsList>
          </Tabs>
        </Box>
      </Demo>

      {/* THE HEADLINE. Click Overview, then Danger zone, and watch the rule: the edge facing
          where it is going leaves first on 320ms and the far edge follows on 480, so the object
          pours across the bar and collects itself on arrival rather than sliding as a rigid
          photograph. Then go back the other way — the two clocks swap, because the leading edge
          is whichever one faces the destination. Both edges ride the same spring; the whole
          asymmetry is the two durations.

          Direction is the one fact a stylesheet cannot work out for itself — CSS knows the value
          a property is animating TO and never the value it left — and Base UI publishes it as
          `data-activation-direction` on the indicator, which is why Tabs needed no JavaScript of
          its own for any of this. */}
      <Demo label="The long travel — click Overview, then Danger zone, then back">
        <WideBar />
      </Demo>

      {/* Its `none` is exactly the first paint: no previous tab, so no direction, so neither
          transition rule matches and the rule is PLACED where it belongs instead of flying in
          from the bar's start. Reload the page and watch this bar: the rule is already under
          Billing, and it has not moved to get there. */}
      <Demo label="First paint is placed, not flown — reload the page and nothing flies in">
        <WideBar defaultValue="billing" />
      </Demo>

      {/* The keyboard is NOT exempted, and the stylesheet is the evidence: the transitions are
          keyed on `data-activation-direction` alone, and nothing in the file asks how the
          selection was made. Arrow keys move focus without selecting here (Base UI's
          `activateOnFocus` defaults to false), so Enter or Space is what commits — and the rule
          travels exactly as it does under a click. Focus a tab, arrow to the far end, press
          Enter. Its sibling one component over selects as the arrows move, which is the
          behavioural difference between a tab bar and a radio group. */}
      <Demo label="Focus the first tab, arrow to the last, press Enter — the same travel, from the keyboard">
        <WideBar />
      </Demo>

      {/* Disabled, on one tab rather than the whole bar, because that is the shape it occurs in:
          a section this workspace has not enabled. The dead dress is the shared control layer's,
          not this component's — a tab is a `.kui-control` and inherits the remap. */}
      <Demo label="One tab disabled — it keeps its place in the bar and stops answering">
        <Box maxWidth="34rem">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Project with a disabled section">
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="activity">Activity</TabsTab>
              <TabsTab value="audit" disabled>
                Audit log
              </TabsTab>
              <TabsTab value="billing">Billing</TabsTab>
            </TabsList>
          </Tabs>
        </Box>
      </Demo>

      {/* A tab as a link, which is the routed-tabs case every app has. The anchor carries no
          `type` attribute and Space still activates it — `nativeButton` is inferred from the
          element being rendered, which is the `type="button"`-on-an-anchor trap this package has
          now closed on five components. It also wears no underline: the control skeleton states
          that, and it is load-bearing exactly here. */}
      <Demo label="A tab rendered as a link — no underline, no type attribute, and Space still works">
        <Box maxWidth="34rem">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Routed">
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="activity" render={<a href="#tabs-states" />}>
                Activity
              </TabsTab>
              <TabsTab value="members">Members</TabsTab>
            </TabsList>
          </Tabs>
        </Box>
      </Demo>

      {/* The panel is a state of its own and it is the one nobody remembers: Base UI makes it
          focusable so a keyboard user can reach content holding no focusable child, and a
          focusable element with no visible focus state is a WCAG 2.4.7 failure. Tab past the
          last tab and the panel takes the system's ring. It paints nothing else — a region of
          the page that drew its own box would be a Card. */}
      <Demo label="Tab past the bar and the panel itself takes the ring — the only thing it paints">
        <Box maxWidth="34rem">
          <Tabs defaultValue="overview">
            <TabsList aria-label="Panels">
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="activity">Activity</TabsTab>
            </TabsList>
            <Box pt="5">
              <TabsPanel value="overview">
                <Text size="3">Nine services deployed, all healthy. Last release was Tuesday.</Text>
              </TabsPanel>
              <TabsPanel value="activity">
                <Text size="3">Priya merged the audit findings. Dan opened two issues.</Text>
              </TabsPanel>
            </Box>
          </Tabs>
        </Box>
      </Demo>
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      {/* Travel × size. The rule is one designed thickness at every index while the bar is not,
          so the ratio of mark to box changes across the ladder — the cross to hunt for is a
          rung where the rule reads as a different weight of statement. Jump each of these from
          one end to the other; a stretch that is right at size 2 and wrong at size 4 shows here
          and nowhere else. */}
      <Demo label="The same jump at every index — click the first tab, then the last, in each bar">
        <Stack gap="6">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="2" emphasis="quiet">
                size {size}
              </Text>
              <WideBar size={size} />
            </Stack>
          ))}
        </Stack>
      </Demo>

      {/* Travel × OVERFLOW, which is the cell the both-edges spelling was reverted over and
          then returned on. The rule is drawn from `--active-tab-left` and `--active-tab-width`
          — the pair Base UI computes in ONE coordinate space — with the second edge DERIVED as
          `calc(100% - left - width)`. Drawn instead from Base UI's own `--active-tab-right`,
          which is `scrollWidth − left − width` in the list's SCROLL space while CSS resolves
          `right` against the containing block's PADDING box, it collapsed to zero width the
          moment the bar stopped fitting (audit 2026-08-19; measured on a bar overflowing by
          61px, the derived spelling spans 91.69 against a 91.67 tab where the old one drew 0).

          The narrow twin puts the list's own box at 22rem with more tabs than that, which is
          the regime where the two coordinate spaces disagree — and it is the ordinary
          narrow-window path, not an exotic one. Billing is active in both, so the read is one
          comparison: scroll the second bar across and the rule must sit on Billing exactly as
          it does in the first. The hairline stops at 22rem because that is where the list's
          box stops; the tabs past it are the overflow. */}
      <Demo label="A bar that fits, and the same bar that does not — scroll the second one and the rule must still sit exactly on Billing">
        <Stack gap="5">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">
              Room to spare
            </Text>
            <WideBar defaultValue="billing" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">
              The same bar in a 22rem column — scroll it sideways
            </Text>
            <Box maxWidth="22rem" style={{ overflowX: "auto" }}>
              <WideBar defaultValue="billing" />
            </Box>
          </Stack>
        </Stack>
      </Demo>

      {/* Travel × the OS's stillness setting, which is a cross nothing on this page can flip for
          you. Turn Reduce Motion on and click through this bar: the rule places itself under the
          new tab with no flight at all. The guard is spelled as the same elements at the same
          specificity later in the file, so it wins by source order rather than by arithmetic
          anyone has to redo — and the shared control stand-down cannot reach it, because the
          rule is a sibling of the tabs rather than a thing inside one. */}
      <Demo label="With Reduce Motion on, the rule is placed rather than flown — turn it on in the OS and click through">
        <WideBar />
      </Demo>
    </Stack>
  );
}

function Nesting() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* What typically hosts a bar: a card, with the panels under it. What must NOT change is
          the bar's own geometry — the hairline runs the pane's inner width and the tabs start on
          the same vertical as the heading above them.

          And what must not be reached for: `mx="bleed"` on the bar, to run the hairline to the
          pane's edges. It would take the labels with it, and the list may not answer that with
          inline padding of its own — `--active-tab-left` is measured from the list's BORDER box
          while the rule resolves against its PADDING box, so any inline padding on the list
          silently shifts every rule by its own width. The line stopping where the content stops
          is the honest version. */}
      <Demo label="A bar inside a card — the hairline runs the pane's inner width, and nothing bleeds">
        <Box maxWidth="34rem">
          <Card size="3" render={<Stack gap="4" />}>
            <Stack gap="2">
              <Heading size="4" render={<h3 />}>
                Kookie UI
              </Heading>
              <Text size="2" emphasis="medium">
                Nine services, two environments.
              </Text>
            </Stack>
            <Tabs defaultValue="overview">
              <TabsList aria-label="Project">
                <TabsTab value="overview">Overview</TabsTab>
                <TabsTab value="activity">Activity</TabsTab>
                <TabsTab value="members">Members</TabsTab>
              </TabsList>
              <Box pt="4">
                <TabsPanel value="overview">
                  <Text size="3">All nine services healthy. Last release Tuesday at 14:20.</Text>
                </TabsPanel>
                <TabsPanel value="activity">
                  <Text size="3">Priya merged the audit findings an hour ago.</Text>
                </TabsPanel>
                <TabsPanel value="members">
                  <Text size="3">Four people, two of them admins.</Text>
                </TabsPanel>
              </Box>
            </Tabs>
          </Card>
        </Box>
      </Demo>

      {/* The bar's hairline and a Separator are ONE object (§7): the line under a tab bar and
          the line between two things are the same statement, so they take the same
          `--color-border` and a law asserts the two resolve one colour. Judged here rather than
          asserted, because what a reader notices is two lines in one card that do not look like
          the same line. Read down the pane: the bar's hairline, then the separators between the
          rows under it. */}
      <Demo label="The bar's hairline beside real separators — they must read as one line, not two">
        <Box maxWidth="34rem">
          <Card size="3" render={<Stack gap="4" />}>
            <Tabs defaultValue="members">
              <TabsList aria-label="People">
                <TabsTab value="members">Members</TabsTab>
                <TabsTab value="invites">Invites</TabsTab>
              </TabsList>
            </Tabs>
            <Stack>
              {(
                [
                  ["Priya Raman", "Admin"],
                  ["Dan Whitfield", "Member"],
                  ["Sofia Marchetti", "Member"],
                ] as const
              ).map(([name, role], i) => (
                <React.Fragment key={name}>
                  {i > 0 ? <Separator /> : null}
                  <Flex py="3" gap="3" align="center" justify="space-between">
                    <Text size="2">{name}</Text>
                    <Text size="2" emphasis="quiet">
                      {role}
                    </Text>
                  </Flex>
                </React.Fragment>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* THE ONLY WAY TABS MEET GLASS, and the reason the Materials section is a written
          absence. A bar is four colours — the active label's ink, the inactive label's ink, the
          hairline, and the accent under the active tab — and it paints no fill and no box, so
          `material` never reaches it. A glass pane re-points TWO of those four for its whole
          subtree: `--color-text-muted`, which every inactive label reads, and `--color-border`,
          which the hairline is. `--color-text` is not among them, so what changes on glass is
          the DISTANCE between an active label and a resting one — which is the entire way this
          component says which tab you are on. The component that expresses nothing is therefore
          the one a veil reaches most, and this is where to look for it.

          One glass per stack is structural: the card spends the backdrop and the bar inside it
          pays nothing. */}
      {GLASS.map((m) => (
        <Demo key={m} label={`A bar inside a ${m} pane — the inactive ink and the hairline are the pane's now`}>
          <BedSurface bed={bed("photo")}>
            <Theme material={m}>
              <Card size="3" render={<Stack gap="4" />} style={{ width: "26rem" }}>
                <Stack gap="2">
                  <Heading size="4" render={<h3 />}>
                    {cap(m)}
                  </Heading>
                  <Text size="2" emphasis="medium">
                    The pane defends against the photograph; the bar inside it does not have to.
                  </Text>
                </Stack>
                <Tabs defaultValue="overview">
                  <TabsList aria-label={`On ${m} glass`}>
                    <TabsTab value="overview">Overview</TabsTab>
                    <TabsTab value="activity">Activity</TabsTab>
                    <TabsTab value="members">Members</TabsTab>
                  </TabsList>
                </Tabs>
              </Card>
            </Theme>
          </BedSurface>
        </Demo>
      ))}

      {/* What a tab HOSTS. A tab is a `.kui-control`, so an svg child takes the control layer's
          icon box and the gap between glyph and label is the skeleton's — nothing here is a tab
          part, and there is no leading/trailing slot to reach for. The glyph rides `currentColor`,
          which means it walks the same muted-to-full ink ladder the label does when the tab
          becomes the active one. That is the read: at rest the icon must be exactly as quiet as
          the words beside it. */}
      <Demo label="Tabs holding glyphs — the icon takes the ink ladder with the label, never its own colour">
        <Box maxWidth="34rem">
          <Tabs defaultValue="overview">
            <TabsList aria-label="With glyphs">
              <TabsTab value="overview">
                <HomeIcon />
                Overview
              </TabsTab>
              <TabsTab value="reports">
                <ChartIcon />
                Reports
              </TabsTab>
              <TabsTab value="members">
                <UsersIcon />
                Members
              </TabsTab>
              <TabsTab value="settings">
                <SettingsIcon />
                Settings
              </TabsTab>
            </TabsList>
          </Tabs>
        </Box>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. It RENDERS correctly and there is
          no rule against it: a panel paints nothing, so a second bar inside one is just a bar,
          and each list is its own measuring frame — the inner rule is positioned against the
          inner list, so the two cannot interfere. The verdict is the component's own definition
          rather than a taste call: if what is under the second bar genuinely changes, it is
          Tabs, and this composition is right. If the second bar only sets a value in the page
          you are already on — a range, a unit, a density — it is a segmented control, and two
          tab bars stacked would be the page saying "where am I" twice. */}
      <Demo label="Tabs inside a tab panel — legitimate when the inner thing genuinely switches too">
        <Box maxWidth="36rem">
          <Tabs defaultValue="reports">
            <TabsList aria-label="Workspace">
              <TabsTab value="overview">Overview</TabsTab>
              <TabsTab value="reports">Reports</TabsTab>
              <TabsTab value="members">Members</TabsTab>
            </TabsList>
            <Box pt="5">
              <TabsPanel value="overview">
                <Text size="3">Nine services, all healthy.</Text>
              </TabsPanel>
              <TabsPanel value="reports">
                <Tabs defaultValue="usage">
                  <TabsList size="1" aria-label="Report">
                    <TabsTab value="usage">Usage</TabsTab>
                    <TabsTab value="errors">Errors</TabsTab>
                    <TabsTab value="latency">Latency</TabsTab>
                  </TabsList>
                  <Box pt="4">
                    <TabsPanel value="usage">
                      <Text size="3">1.2M requests this week, up 8 percent.</Text>
                    </TabsPanel>
                    <TabsPanel value="errors">
                      <Text size="3">Fourteen 5xx responses, all from the image resizer.</Text>
                    </TabsPanel>
                    <TabsPanel value="latency">
                      <Text size="3">p95 at 240ms, unchanged since Tuesday.</Text>
                    </TabsPanel>
                  </Box>
                </Tabs>
              </TabsPanel>
              <TabsPanel value="members">
                <Text size="3">Four people, two of them admins.</Text>
              </TabsPanel>
            </Box>
          </Tabs>
        </Box>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* THE PAIR, doing their real jobs on one screen — which is the only honest way to show
          the distinction, because side by side with nothing under them they look like the same
          control drawn twice. The bar switches what the page shows; the segmented control sets
          how the chosen thing is drawn and the page stays where it is. If the thing under it
          changes, it is Tabs. */}
      <Demo label="Both, on one screen — the bar switches the page, the segmented control sets a value in place">
        <Box maxWidth="42rem">
          <Surface size="3" render={<Stack gap="5" />}>
            <Stack gap="2">
              <Heading size="5" render={<h3 />}>
                Payments API
              </Heading>
              <Text size="3" emphasis="medium">
                Nine services across two environments.
              </Text>
            </Stack>
            <Tabs defaultValue="reports">
              <TabsList aria-label="Workspace">
                <TabsTab value="overview">Overview</TabsTab>
                <TabsTab value="reports">Reports</TabsTab>
                <TabsTab value="members">Members</TabsTab>
                <TabsTab value="settings">Settings</TabsTab>
              </TabsList>
              <Box pt="5">
                <TabsPanel value="overview">
                  <Text size="3">All nine healthy. Last release Tuesday at 14:20.</Text>
                </TabsPanel>
                <TabsPanel value="reports">
                  <Stack gap="4">
                    <Flex gap="3" align="center" justify="space-between">
                      <Text size="3" weight="medium">
                        Requests
                      </Text>
                      <SegmentedControl defaultValue="week" aria-label="Range">
                        <SegmentedItem value="day">Day</SegmentedItem>
                        <SegmentedItem value="week">Week</SegmentedItem>
                        <SegmentedItem value="month">Month</SegmentedItem>
                      </SegmentedControl>
                    </Flex>
                    <Text size="3" emphasis="medium">
                      1.2M this week, up 8 percent on the week before.
                    </Text>
                  </Stack>
                </TabsPanel>
                <TabsPanel value="members">
                  <Text size="3">Four people, two of them admins.</Text>
                </TabsPanel>
                <TabsPanel value="settings">
                  <Text size="3">Anyone with the link can read. Two integrations are connected.</Text>
                </TabsPanel>
              </Box>
            </Tabs>
          </Surface>
        </Box>
      </Demo>

      {/* A settings screen, which is the bar's most ordinary job and the one that genuinely
          needs eight sections. One focal action on the pane, and it belongs to the section
          showing rather than to the frame — click along the bar and the button stays where the
          work is. This is also the composition the travel was designed against: Overview to
          Danger zone is the long jump. */}
      <Demo label="A settings screen — eight sections, one action, and the switch is the only chrome">
        <Box maxWidth="52rem">
          <Surface size="3" render={<Stack gap="5" />}>
            <Stack gap="2">
              <Heading size="5" render={<h3 />}>
                Workspace settings
              </Heading>
              <Text size="3" emphasis="medium">
                Changes apply to everyone in this workspace.
              </Text>
            </Stack>
            <Tabs defaultValue="notifications">
              <TabsList aria-label="Settings">
                {WORKSPACE.map(([value, label]) => (
                  <TabsTab key={value} value={value}>
                    {label}
                  </TabsTab>
                ))}
              </TabsList>
              <Box pt="5">
                {WORKSPACE.map(([value, , copy]) => (
                  <TabsPanel key={value} value={value}>
                    <Stack gap="4">
                      <Text size="3" emphasis="medium">
                        {copy}
                      </Text>
                      <Flex gap="3" justify="flex-end">
                        <Button
                          tone={value === "danger" ? "destructive" : "accent"}
                          emphasis="loud"
                        >
                          {value === "danger" ? "Delete workspace" : "Save changes"}
                        </Button>
                      </Flex>
                    </Stack>
                  </TabsPanel>
                ))}
              </Box>
            </Tabs>
          </Surface>
        </Box>
      </Demo>

      {/* A card whose whole header is a bar, with glyphs — an inbox, where the tabs are three
          views of one list. The counts are part of each label's own TEXT, deliberately: a
          `<Text>` dropped inside a tab states `--color-text` for itself, so it would sit at full
          strength beside a muted label and then fail to step when its tab became the active one.
          A tab's label is one run of text and the ink ladder moves all of it. Narrow on purpose:
          this is about the width at which a real bar starts to run out of room. */}
      <Demo label="A bar as a card's header — three views of one list">
        <Box maxWidth="26rem">
          <Card size="3" render={<Stack gap="4" />}>
            <Tabs defaultValue="unread">
              <TabsList size="1" aria-label="Inbox">
                <TabsTab value="unread">
                  <BellIcon />
                  Unread (12)
                </TabsTab>
                <TabsTab value="mentions">
                  <UsersIcon />
                  Mentions (2)
                </TabsTab>
                <TabsTab value="archive">
                  <FolderIcon />
                  Archive
                </TabsTab>
              </TabsList>
              <Box pt="4">
                <TabsPanel value="unread">
                  <Stack gap="3">
                    <Text size="2">Deploy 4a91c2 failed on staging.</Text>
                    <Separator />
                    <Text size="2">Priya requested a review on the audit branch.</Text>
                  </Stack>
                </TabsPanel>
                <TabsPanel value="mentions">
                  <Text size="2">Dan mentioned you in Reports.</Text>
                </TabsPanel>
                <TabsPanel value="archive">
                  <Text size="2">Nothing archived this week.</Text>
                </TabsPanel>
              </Box>
            </Tabs>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const tabsPreview: ComponentPreview = {
  slug: "tabs",
  name: "Tabs",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: {
      absent:
        "A tab bar paints no fill and no box, so there is nothing behind it to defocus and material never reaches it (§26) — law-asserted, in as many words: under a glass theme the list, every tab and the rule all compute backdrop-filter: none and carry no data-material. Tabs meet glass only from ABOVE, when a glass pane HOLDS them, and that case is real: a bar is four colours — the active label's ink, the inactive label's ink, the hairline, and the accent under the active tab — and a glass pane re-points two of them for its whole subtree, --color-text-muted and --color-border. So the component that expresses nothing is the one a veil reaches most, which is judged in Nesting rather than here. The sibling that IS a pane is the segmented control, whose track expresses the material and scopes its subtree.",
    },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11, §26): a bar where one tab is a different family names nothing, and the tab that matters is already marked — by ink and the rule, which is a state rather than a rung a call site picks. The labels read the TONE-LESS foreground roles (--color-text active against --color-text-muted at rest) rather than the ink trio, so a bar dropped onto a tone-forward surface follows that surface exactly as Text does. Each tab stamps data-tone=\"neutral\", and the stamp is load-bearing rather than decorative: the roles inherit, so an unstamped bar inside a destructive section hovered red. The one family in the component is the accent on the RULE, which is the system's identity for a selected thing and is judged in States with the travel.",
    },
    inUse: { body: <InUse /> },
  },
};
