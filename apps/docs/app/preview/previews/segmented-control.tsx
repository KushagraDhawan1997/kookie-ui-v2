/**
 * The segmented control's preview spec (2026-08-24) — the seventh component through the
 * per-component structure, and it lands on the day two of its resting values changed.
 *
 * What this page has to make judgeable, beyond the usual ladder:
 *
 *   1. **The channel's gray moved** (2026-08-24). It left `--color-track` — which stays the
 *      instruments' deeper channel: the slider rail, the switch's off-track, the progress
 *      well — and now wears the same gray a TextField and a TextArea rest on. So the read is
 *      not "is this gray nice", it is "does it MATCH the field beside it and stay clear of the
 *      rail", which is a comparison, and a comparison needs the neighbours on the page. The
 *      States section opens with them.
 *   2. **The grip on a glass track** (2026-08-24). When the track IS the pane, the chosen
 *      segment stops being a near-white raised pebble and becomes the pane's own selection
 *      wash — the same token a glass menu lights a hovered row with — flat, with the chosen
 *      label back at the full ink. The case NEXT to it is deliberately different: a control
 *      inside somebody else's glass pane keeps its pigment grip and loses only its lift. Those
 *      two are told apart by the FILL, so Permutations puts them side by side over one bed.
 *
 * The old section in specimens.tsx had two demos: a size table and one toolbar row. Both
 * survive here, and everything the component gained since — the travelling grip, the glass
 * cases, the disabled stand-down, the Field supplying its index — has somewhere to be read.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  Progress,
  SegmentedControl,
  SegmentedItem,
  Separator,
  Slider,
  Stack,
  Surface,
  Switch,
  Text,
  TextArea,
  TextField,
  Theme,
  themeAxes,
  type SegmentedControlProps,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis (solid is the rung where light stops,
    shown as its own cell). A restated list would go stale the day the axis widens.

    A FUNCTION, not a module const: the standalone route imports this module on the server for
    its slug, and `themeAxes` is a client module's data — unreadable during server module
    evaluation. Deferred into render it only ever runs on the client, which is also why every
    section below is a component rather than a module-scope element tree. card.tsx carries the
    same note and the same reason. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** The specimen used everywhere the CONTENT is not the variable — three real words, one real
    accessible name, so a cell only ever differs by the axis under judgment. Three segments
    rather than two because the travelling grip has to have somewhere in the middle to pass. */
function Range({
  "aria-label": label = "Date range",
  ...props
}: Omit<SegmentedControlProps, "children" | "defaultValue">) {
  return (
    <SegmentedControl defaultValue="week" aria-label={label} {...props}>
      <SegmentedItem value="day">Day</SegmentedItem>
      <SegmentedItem value="week">Week</SegmentedItem>
      <SegmentedItem value="month">Month</SegmentedItem>
    </SegmentedControl>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The ladder, identical words at every index. What moves is the TRACK's rung and the
          channel inside it: each segment is the channel minus a designed inset on all four
          sides, and the segments stamp no index of their own — they read the height from the
          track through the cascade, which is what makes it impossible for the two boxes to
          disagree about what size they are. */}
      <Demo label="Every index, identical words">
        <Flex gap="5" align="center" wrap="wrap">
          {SIZES.map((size) => (
            <Range key={size} size={size} aria-label={`Date range ${size}`} />
          ))}
        </Flex>
      </Demo>

      {/* The reason the TRACK rides the height ladder rather than the segments (§4, §26): a
          segmented control has to stand level with the Button and the field beside it in a
          toolbar. One row per index, so an uneven rung shows as a step in the row rather than
          as a number nobody measures. The package asserts this against a mounted Button's
          RENDERED box, and it was wrong in all 24 cells once — the skeleton's transparent
          border still occupies layout — so the row is worth looking at. */}
      <Demo label="Standing level with its neighbours, at every index">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center" wrap="wrap">
              <Box width="3.5rem">
                <Text size="1" emphasis="quiet">
                  Size {size}
                </Text>
              </Box>
              <Range size={size} aria-label={`Toolbar range ${size}`} />
              <Button size={size} emphasis="quiet" bordered>
                Filter
              </Button>
              <TextField size={size} placeholder="Search" aria-label={`Search ${size}`} />
              <Button size={size}>New report</Button>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* How many segments there are is the caller's, and the channel divides between them:
          each segment takes an equal share of the track until its own label's minimum binds,
          which is the case the travelling grip MEASURES rather than divides. Two, three and
          five at one index, so the divide is the only thing changing. */}
      <Demo label="Two, three, five — the channel divides between them">
        <Flex gap="5" align="center" wrap="wrap">
          <SegmentedControl defaultValue="list" aria-label="Layout">
            <SegmentedItem value="list">List</SegmentedItem>
            <SegmentedItem value="grid">Grid</SegmentedItem>
          </SegmentedControl>
          <Range aria-label="Date range, three" />
          <SegmentedControl defaultValue="wed" aria-label="Day of week">
            <SegmentedItem value="mon">Mon</SegmentedItem>
            <SegmentedItem value="tue">Tue</SegmentedItem>
            <SegmentedItem value="wed">Wed</SegmentedItem>
            <SegmentedItem value="thu">Thu</SegmentedItem>
            <SegmentedItem value="fri">Fri</SegmentedItem>
          </SegmentedControl>
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* REST, and the reason it is the first thing on this page (2026-08-24, Kushagra: "I see
          no reason for it to be any other color than text fields or areas"). The channel left
          `--color-track` for the field family's own resting gray: one value for a text field, a
          text area and this track. The instruments KEPT the deeper channel — only the segmented
          control moved — so the right column is not a mismatch, it is the distance the decision
          preserved.

          What still separates this track from a field is the EDGE, not the value: a field wears
          the dress hairline and a well has none. That is the pair to read here, left to right. */}
      <Demo label="Rest — the track wears the field's gray, while the instruments keep the deeper channel">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="6" gapY="5" style={{ alignItems: "start" }}>
          <Stack gap="4">
            <Text size="2" emphasis="medium">
              One gray — and only the hairline separates the field from the track
            </Text>
            <Range aria-label="Report range" />
            <TextField defaultValue="Weekly digest" aria-label="Report name" />
            <TextArea rows={2} defaultValue="Sent every Monday at nine." aria-label="Report notes" />
          </Stack>
          <Stack gap="4">
            <Text size="2" emphasis="medium">
              One step deeper — the instruments did not move
            </Text>
            <Slider defaultValue={40} aria-label="Sample rate" />
            <Flex gap="3" align="center">
              <Switch defaultChecked aria-label="Email me a copy" />
              <Text size="2">Email me a copy</Text>
            </Flex>
            <Progress value={62} aria-label="Building the digest" />
          </Stack>
        </Grid>
      </Demo>

      {/* THE GRIP TRAVELS (2026-08-23). One object drawn by its two inline edges, and the edge
          FACING the destination takes the shorter clock — 320ms against 480, both on one spring,
          so the whole asymmetry lives in the two durations. The grip therefore stretches toward
          where it is going and gathers itself as the far edge catches up.

          The track is stated WIDE on purpose: the recipe only reads over a long journey, so the
          demo to run is the far segment from the far segment. The width lands on the TRACK and
          not on a Box around it, because `.kui-segmented` is an inline-flex box that hugs its
          segments — a wider parent gives it nothing to fill.

          THE KEYBOARD IS NOT EXEMPTED, and that is visible in the mechanism rather than claimed:
          the measurement watches Base UI's `data-checked` stamp and never asks how the selection
          was made, so an arrow key flies the grip exactly as a click does. Tab in and hold an
          arrow — selection follows focus, which is the radio group's own behaviour and the whole
          reason this component is one. */}
      <Demo label="The grip travels — click the far segment, then arrow back through it">
        <SegmentedControl
          defaultValue="overview"
          aria-label="Report section"
          style={{ inlineSize: "34rem" }}
        >
          <SegmentedItem value="overview">Overview</SegmentedItem>
          <SegmentedItem value="traffic">Traffic</SegmentedItem>
          <SegmentedItem value="revenue">Revenue</SegmentedItem>
          <SegmentedItem value="retention">Retention</SegmentedItem>
        </SegmentedControl>
      </Demo>

      {/* HOVER, and the half that is a PIN rather than an absence (2026-08-23, Kushagra,
          watching a real click: the hover fill "is on top, so as I click on a segment, and it
          animates, the hover continues to stay… making it look very weird"). The segments paint
          above the grip — that is what puts a label over it — so a chosen segment that still
          answered the pointer left a static wash sitting exactly where the grip was travelling
          to. The chosen segment now paints nothing in any state: hovering the thing you already
          picked promises something a click cannot deliver. */}
      <Demo label="Hover an unchosen segment, then the chosen one — only one of them answers">
        <Flex gap="5" align="center" wrap="wrap">
          <Range aria-label="Chart range" />
        </Flex>
      </Demo>

      {/* The two states with nothing to fly between. A group with no value paints NO grip — it
          is hidden rather than parked at the start of the track — and the first choice is then
          PLACED rather than flown, because there is no seat it came from. Pick one in the left
          control and watch it arrive without travelling. */}
      <Demo label="No value, no grip — and the first choice is placed, never flown">
        <Flex gap="5" align="center" wrap="wrap">
          <SegmentedControl aria-label="Unset range">
            <SegmentedItem value="day">Day</SegmentedItem>
            <SegmentedItem value="week">Week</SegmentedItem>
            <SegmentedItem value="month">Month</SegmentedItem>
          </SegmentedControl>
          <Range aria-label="Set range" />
        </Flex>
      </Demo>

      {/* DEAD, at every index, live beside dead so the four changes are readable at all: the
          channel recedes, the grip dims, BOTH labels dim, and the grip stops casting. The
          component has to state that dim itself — all three of its resting colours are non-tone
          roles, and the shared disabled remap rewrites tone ROLES, so before it was written a
          disabled control measured byte-identical to a live one everywhere except the cast and
          the cursor. The grip dims rather than melting into its own channel: which segment is
          chosen must survive the state that says you cannot change it. */}
      <Demo label="Live beside dead — the channel, the grip and both labels stand down together">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="5" align="center" wrap="wrap">
              <Box width="3.5rem">
                <Text size="1" emphasis="quiet">
                  Size {size}
                </Text>
              </Box>
              <Range size={size} aria-label={`Live range ${size}`} />
              <Range size={size} disabled aria-label={`Disabled range ${size}`} />
            </Flex>
          ))}
        </Stack>
      </Demo>
    </Stack>
  );
}

function Materials() {
  const GLASS = glassMaterials();
  const order = ["solid", ...GLASS].join(", ");
  return (
    <Stack gap="6">
      {/* THE BOARD, and the place the 2026-08-24 grip change is judged: solid beside every
          thickness, over every standard bed, with the track ITSELF as the pane each time.

          On glass the grip is no longer a near-white pebble. It is `--material-row-wash`, the
          exact token a glass menu lights a hovered row with, so the two agree by construction;
          the cast stands down, because a pane has one lift; and the chosen label returns to the
          full ink, since the near-white label colour was minted against the near-white fill and
          has nothing to sit on once the fill is a wash. The solid cell on the left is the
          control for all of it.

          Each cell pins its material with a nested Theme, so the board reads the same whatever
          the panel says. The beds are backdrop regions, so expression needs no prop on any
          control (§10 selectivity). The cell order is DERIVED from the axis, which is why the
          caption can name it without going stale. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={`${b.name} — ${order}, left to right`}>
          <BedSurface bed={b}>
            <Theme material="solid">
              <Range aria-label={`${b.name}, solid`} />
            </Theme>
            {GLASS.map((m) => (
              <Theme key={m} material={m}>
                <Range aria-label={`${b.name}, ${m}`} />
              </Theme>
            ))}
          </BedSurface>
        </Demo>
      ))}
    </Stack>
  );
}

function Permutations() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* Size × material over the pattern — flat illustrated shapes with hard edges, which is
          the ground where a wrong alpha or a dead blur is most visible. The question is whether
          the wash still reads as a grip at size 1, where the channel is at its shallowest, and
          whether the chosen label still separates from its two neighbours at every thickness. */}
      <Demo label="Size × material — over the pattern">
        <BedSurface bed={bed("pattern")} minHeight="560px">
          <Grid columns="repeat(4, minmax(0, max-content))" gapX="5" gapY="5">
            {(["solid", ...GLASS] as const).map((m) =>
              SIZES.map((size) => (
                <Theme key={`${m}-${size}`} material={m}>
                  <Range size={size} aria-label={`${m}, size ${size}`} />
                </Theme>
              )),
            )}
          </Grid>
        </BedSurface>
      </Demo>

      {/* THE TWO GLASS CASES, and they are deliberately different (2026-08-24, Kushagra: "When
          glass, segmented control's thumb should render as neutral gray like hover in menu, and
          the entire control gets glass").

          On the LEFT the track is the pane: the grip is the pane's own selection wash, flat,
          under the full ink. On the RIGHT the same control sits inside somebody else's glass
          card, where it resolves its solid appearance at the pane's alpha — so the grip keeps
          its pigment and loses only its lift, because a pane has one lift and the grips left the
          world switch precisely so no world could strip them.

          THE FILL IS WHAT TELLS THEM APART. A rule that washed both cases would look plausible
          and would be wrong, which is why both are read here rather than one. Shown over two
          beds — bright detail and a near-black bloom — because the wash is a low-alpha ink, so
          how much of it survives is a question about what is behind the pane. */}
      {[bed("photo"), bed("bloom")].map((b) => (
        <Demo
          key={b.id}
          label={`${b.name} — the track IS the pane, beside the same control inside one`}
        >
          <BedSurface bed={b}>
            <Theme material="regular">
              <Range aria-label={`${b.name}, glass track`} />
            </Theme>
            <Theme material="regular">
              <Card size="3">
                <Stack gap="3">
                  <Text size="2" emphasis="medium">
                    Inside a glass card
                  </Text>
                  <Range aria-label={`${b.name}, inside a glass card`} />
                </Stack>
              </Card>
            </Theme>
          </BedSurface>
        </Demo>
      ))}

      {/* Dead × material. Two rules meet on one element here: the disabled stand-down dims the
          grip from the pigment role, and the glass rule replaces that fill with the pane's wash
          — so the question this cell asks is whether a dead glass control still reports which
          segment is chosen. Live above, dead below, at one index, over a bed with real detail
          behind it. */}
      <Demo label="Live × dead × material — the grip has to stay findable in both">
        <BedSurface bed={bed("country")} minHeight="300px">
          <Grid columns="repeat(4, minmax(0, max-content))" gapX="5" gapY="5">
            {(["solid", ...GLASS] as const).map((m) => (
              <Theme key={`live-${m}`} material={m}>
                <Range aria-label={`${m}, live`} />
              </Theme>
            ))}
            {(["solid", ...GLASS] as const).map((m) => (
              <Theme key={`dead-${m}`} material={m}>
                <Range disabled aria-label={`${m}, disabled`} />
              </Theme>
            ))}
          </Grid>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* HOSTED IN A FIELD (§28). A Field states the index once for the whole unit — the label,
          the description and the control — and the segmented control reads it through context,
          so neither control below states a `size` of its own. An explicit prop on the control
          would still win; that is the bound the mechanism ships with. The Field also names the
          group: Base UI's RadioGroup takes the field label's id as its `aria-labelledby`, which
          is why there is no `aria-label` here to argue with it. */}
      <Demo label="In a Field — the unit states the index once, and the control takes it">
        <Flex gap="6" wrap="wrap" align="flex-start">
          <Box width="17rem">
            <Field size="1">
              <FieldLabel>Density</FieldLabel>
              <SegmentedControl defaultValue="comfortable">
                <SegmentedItem value="compact">Compact</SegmentedItem>
                <SegmentedItem value="comfortable">Comfortable</SegmentedItem>
              </SegmentedControl>
              <FieldDescription>Applies to every table in this workspace.</FieldDescription>
            </Field>
          </Box>
          <Box width="17rem">
            <Field size="3">
              <FieldLabel>Density</FieldLabel>
              <SegmentedControl defaultValue="comfortable">
                <SegmentedItem value="compact">Compact</SegmentedItem>
                <SegmentedItem value="comfortable">Comfortable</SegmentedItem>
              </SegmentedControl>
              <FieldDescription>Applies to every table in this workspace.</FieldDescription>
            </Field>
          </Box>
        </Flex>
      </Demo>

      {/* HOSTED ON THE TWO SOLID PANES, judged for what must NOT change. A Card is an object and
          a Surface is a ground; on the page's own ground neither of them is glass, so the
          control inside resolves solid and the grip keeps both its pigment and its lift. The
          channel keeps the same gray it wears bare. What differs is only what it is read
          against, which is the point of putting them beside each other. */}
      <Demo label="On a card and on a ground — nothing about the control moves">
        <Flex gap="5" wrap="wrap" align="flex-start">
          <Card size="3">
            <Stack gap="3">
              <Text size="2" emphasis="medium">
                On a card
              </Text>
              <Range aria-label="Range on a card" />
            </Stack>
          </Card>
          <Surface size="3">
            <Stack gap="3">
              <Text size="2" emphasis="medium">
                On a ground
              </Text>
              <Range aria-label="Range on a ground" />
            </Stack>
          </Surface>
        </Flex>
      </Demo>

      {/* SELF-NESTING: the verdict is no, and it does not need a mechanism to enforce it. A
          segment holds its own label and nothing else — a second control inside one would put a
          radio group inside a radio, which announces nothing a person can act on and gives one
          box two answers. Two choices are TWO controls standing side by side in the same row,
          which is what people reach for a nested one to do. Shown rather than only stated,
          because the alternative is the useful half. */}
      <Demo label="Two choices are two controls — never segments inside a segment">
        <Card size="3">
          <Flex gap="4" align="center" wrap="wrap">
            <SegmentedControl defaultValue="grid" aria-label="Layout">
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
            </SegmentedControl>
            {/* No vertical rule between them: a Separator takes its extent from its container,
                and in a row centred on its cross axis there is nothing for it to take. The gap
                is the separation, which is the same answer the toolbar in `In use` gives. */}
            <SegmentedControl defaultValue="recent" aria-label="Sort">
              <SegmentedItem value="recent">Recent</SegmentedItem>
              <SegmentedItem value="name">Name</SegmentedItem>
              <SegmentedItem value="size">Size</SegmentedItem>
            </SegmentedControl>
          </Flex>
        </Card>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* The job the component exists for: a view switcher in a panel header, standing level
          with the search field and the action beside it. One focal action on the pane — the
          segmented control sets a value and ranks nothing, which is why it can sit beside a loud
          button without competing with it. */}
      <Demo label="A panel header — the switcher, the search and the one action">
        <Box maxWidth="34rem">
          <Card size="3">
            <Stack gap="5">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>
                  Projects
                </Heading>
                <Text size="2" emphasis="medium">
                  Fourteen active, three archived this month.
                </Text>
              </Stack>
              <Flex gap="3" align="center" wrap="wrap">
                <SegmentedControl defaultValue="grid" aria-label="Layout">
                  <SegmentedItem value="list">List</SegmentedItem>
                  <SegmentedItem value="grid">Grid</SegmentedItem>
                  <SegmentedItem value="board">Board</SegmentedItem>
                </SegmentedControl>
                <TextField placeholder="Search projects" aria-label="Search projects" />
                <Button tone="accent" emphasis="loud">
                  New project
                </Button>
              </Flex>
              <Separator />
              <Stack gap="3">
                {[
                  ["Checkout rewrite", "Updated 20 minutes ago"],
                  ["Design tokens", "Updated yesterday"],
                  ["Billing migration", "Updated on Tuesday"],
                ].map(([name, when]) => (
                  <Flex key={name} gap="3" align="center" justify="space-between">
                    <Text size="2">{name}</Text>
                    <Text size="2" emphasis="quiet">
                      {when}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A TOOLBAR OVER CONTENT, which is the composition the 2026-08-24 grip change was made
          for. Each control here is its own pane over the photograph, so the segmented track IS
          the glass and the chosen segment is the pane's own wash rather than a white pebble
          floating on it. Nothing in this markup asks for glass: the bed is a backdrop region and
          the theme states the thickness. */}
      <Demo label="A toolbar over content — the track is the pane, so the grip is the pane's wash">
        <BedSurface bed={bed("country")}>
          <Theme material="regular">
            <Flex gap="3" align="center" wrap="wrap">
              <SegmentedControl defaultValue="map" aria-label="Map style">
                <SegmentedItem value="map">Map</SegmentedItem>
                <SegmentedItem value="satellite">Satellite</SegmentedItem>
                <SegmentedItem value="terrain">Terrain</SegmentedItem>
              </SegmentedControl>
              <Button emphasis="quiet" bordered>
                Layers
              </Button>
              <Button tone="accent" emphasis="loud">
                Share
              </Button>
            </Flex>
          </Theme>
        </BedSurface>
      </Demo>

      {/* Settings, where a segmented control is at its most honest: two or three named answers,
          all worth showing, and the value takes effect where you are standing. Each row is a
          Field, so the label names the group and the index is stated once for the unit. */}
      <Demo label="A preferences panel — one row, one answer, no dialog in the way">
        <Box maxWidth="30rem">
          <Card size="3">
            <Stack gap="5">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>
                  Appearance
                </Heading>
                <Text size="2" emphasis="medium">
                  Changes apply to this browser only.
                </Text>
              </Stack>
              <Stack gap="4">
                <Field>
                  <FieldLabel>Theme</FieldLabel>
                  <SegmentedControl defaultValue="system">
                    <SegmentedItem value="light">Light</SegmentedItem>
                    <SegmentedItem value="dark">Dark</SegmentedItem>
                    <SegmentedItem value="system">System</SegmentedItem>
                  </SegmentedControl>
                </Field>
                <Field>
                  <FieldLabel>Sidebar</FieldLabel>
                  <SegmentedControl defaultValue="expanded">
                    <SegmentedItem value="expanded">Expanded</SegmentedItem>
                    <SegmentedItem value="collapsed">Collapsed</SegmentedItem>
                  </SegmentedControl>
                  <FieldDescription>Collapsed keeps the icons and hides the names.</FieldDescription>
                </Field>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const segmentedControlPreview: ComponentPreview = {
  slug: "segmented-control",
  name: "Segmented control",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11, §26): the family has one identity, so neither the track nor a segment takes tone — a segment redder or louder than its neighbours is not a segmented control, and multi-select formatting is a set of toggle buttons, a different component. The root stamps data-tone=\"neutral\" itself, which is load-bearing rather than incidental: a control that stamps no family has no hover step at all, and a family stamped on an ancestor would otherwise reach every segment. The only chromatic thing on the control is the focus ring, which is the accent family on every control in the package and is not a sweep.",
    },
    inUse: { body: <InUse /> },
  },
};
