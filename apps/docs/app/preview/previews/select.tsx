/**
 * Select's preview spec — through the per-component structure 2026-08-22.
 *
 * Select is two things joined, and the sections below keep them apart because they are judged
 * against different neighbours. Its TRIGGER is a field: it wears the field identity, so the
 * thing it must agree with is the TextField beside it — same seal, same edge, same height,
 * same corner (§23). Its PANEL is a menu: the row family, the concentric corner, the floating
 * chrome, all arriving from Menu with nothing re-designed.
 *
 * The one thing that is neither is the PLACEMENT. A select's panel is item-aligned (2026-08-17):
 * the chosen row lands exactly on the value it replaces, and the rest of the list falls above
 * and below it. That is macOS's geometry, it is why the panel sometimes hangs above the
 * trigger or off to its left, and it is the single behaviour a reader is most likely to
 * mistake for a bug — so it gets its own demos rather than a sentence.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Flex,
  Heading,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  Separator,
  Stack,
  Text,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** A function, not a module const: the standalone route imports this module on the SERVER for
    its slug, and a module-scope read of client data fails the build (card.tsx's own note). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

type Size = "1" | "2" | "3" | "4";

/**
 * ONE canonical option set: two groups and a dead row.
 *
 * No Separator between the groups, and the absence is load-bearing (audit 2026-08-09). It was
 * here once, and it is what proved the composition illegal: the panel IS the listbox, a
 * listbox may hold only options and groups, and an accessibility scan reported exactly that —
 * from library markup a consumer could not fix from outside. The GROUP is the divider a
 * listbox has, and it divides in the accessibility tree as well as on screen.
 */
const REGION_ITEMS = {
  fra: "Frankfurt",
  ams: "Amsterdam",
  lhr: "London",
  cdg: "Paris",
  iad: "Washington DC",
  sfo: "San Francisco",
  gru: "São Paulo",
  nrt: "Tokyo",
  syd: "Sydney (at capacity)",
};

function RegionOptions() {
  return (
    <>
      <SelectGroup>
        <SelectLabel>Europe</SelectLabel>
        <SelectItem value="fra">Frankfurt</SelectItem>
        <SelectItem value="ams">Amsterdam</SelectItem>
        <SelectItem value="lhr">London</SelectItem>
        <SelectItem value="cdg">Paris</SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel>Americas</SelectLabel>
        <SelectItem value="iad">Washington DC</SelectItem>
        <SelectItem value="sfo">San Francisco</SelectItem>
        <SelectItem value="gru">São Paulo</SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel>Asia Pacific</SelectLabel>
        <SelectItem value="nrt">Tokyo</SelectItem>
        <SelectItem value="syd" disabled>
          Sydney (at capacity)
        </SelectItem>
      </SelectGroup>
    </>
  );
}

const SHORT_ITEMS = { private: "Private", team: "Team", public: "Public" };

function ShortOptions() {
  return (
    <>
      <SelectItem value="private">Private</SelectItem>
      <SelectItem value="team">Team</SelectItem>
      <SelectItem value="public">Public</SelectItem>
    </>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* THE AGREEMENT THAT DEFINES THE COMPONENT (§23): the trigger is field-shaped, so at
          every index it must be indistinguishable in seal, edge, height and corner from the
          TextField beside it. Read the row across, not down — a step that is right in the
          ladder and wrong against its neighbour is still wrong. */}
      <SpecTable
        wide
        cols={["Select", "TextField beside it"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Select key="s" size={size as Size} defaultValue="lhr" items={REGION_ITEMS}>
              <SelectTrigger placeholder="Pick a region" aria-label="Region" />
              <SelectContent>
                <RegionOptions />
              </SelectContent>
            </Select>,
            <TextField key="t" size={size as Size} placeholder="Type here" aria-label="Free text" />,
          ],
        }))}
      />
      {/* The PANEL's own ladder, which is the row family's and not the field's: rows take the
          control cells' padding and type, and their height from the text line plus a designed
          inset (§21). Open each and read the rows against the trigger that opened them. */}
      <Demo label="Open each — the panel answers the same index the trigger wears">
        <Flex gap="3" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <Select size={size as Size} defaultValue="team" items={SHORT_ITEMS}>
                <SelectTrigger placeholder="Visibility" aria-label="Visibility" />
                <SelectContent>
                  <ShortOptions />
                </SelectContent>
              </Select>
            </Stack>
          ))}
        </Flex>
      </Demo>
      {/* And the corner, read as one system: the panel's is CONCENTRIC — its rows' corner plus
          its padding — while the trigger's is the control band's, so the two are deliberately
          different numbers arrived at by one rule. */}
      <Demo label="The panel's concentric corner against the trigger's control corner">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <Card size={size as Size} style={{ width: 168 }}>
                <Select size={size as Size} defaultValue="private" items={SHORT_ITEMS}>
                  <SelectTrigger placeholder="Visibility" aria-label="Visibility" />
                  <SelectContent>
                    <ShortOptions />
                  </SelectContent>
                </Select>
              </Card>
            </Stack>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* THE THREE RESTING STATES of the trigger, side by side because each is only legible
          against the others: a placeholder INVITES and is set in the muted ink; a value is
          CONTENT and reads at full strength; a dead trigger stands both down. The chevron is
          muted in all three and never mirrors. */}
      <Demo label="Placeholder, value, stood down — the placeholder must not read as a value">
        <Flex gap="4" align="center" wrap="wrap">
          <Select items={REGION_ITEMS}>
            <SelectTrigger placeholder="Pick a region" aria-label="Empty" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
          <Select defaultValue="fra" items={REGION_ITEMS}>
            <SelectTrigger placeholder="Pick a region" aria-label="Chosen" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
          <Select defaultValue="fra" items={REGION_ITEMS} disabled>
            <SelectTrigger placeholder="Pick a region" aria-label="Stood down" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
          <Select items={REGION_ITEMS} disabled>
            <SelectTrigger placeholder="Stood down, empty" aria-label="Stood down and empty" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
        </Flex>
      </Demo>
      {/* THE PLACEMENT, and it is the behaviour most likely to be mistaken for a defect. The
          panel is ITEM-ALIGNED (2026-08-17): the chosen row lands on the value it replaces, so
          a value near the end of the list opens a panel that hangs mostly ABOVE the trigger,
          and one near the start hangs below. The panel also sits a little to the left, because
          the rows reserve a gutter for the tick and the trigger has no equivalent — that is
          the alignment working. Open all three in turn. */}
      <Demo label="First value, middle value, last value — the chosen row lands on the trigger every time">
        <Flex gap="4" align="center" wrap="wrap">
          {(["fra", "sfo", "nrt"] as const).map((value) => (
            <Select key={value} defaultValue={value} items={REGION_ITEMS}>
              <SelectTrigger placeholder="Pick a region" aria-label={`Opens at ${value}`} />
              <SelectContent>
                <RegionOptions />
              </SelectContent>
            </Select>
          ))}
        </Flex>
      </Demo>
      {/* …and the same placement with nowhere to go: put a select near the bottom of the
          window and open it. The panel must stay inside the viewport rather than aligning the
          row off-screen, and the entry must still be the family's unfurl — the placement
          changes where the flight lands, never what the flight is (§23, the curtain that was
          built, judged and deleted). */}
      <Demo label="Scroll this to the window's edge and open it — the placement gives way, the entry does not">
        <Flex gap="4" align="center">
          <Select defaultValue="nrt" items={REGION_ITEMS}>
            <SelectTrigger placeholder="Pick a region" aria-label="Near an edge" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
        </Flex>
      </Demo>
      {/* A LIST TALLER THAN THE WINDOW. The panel scrolls, and the scroll ARROWS Base UI pairs
          with item alignment are refused (§23): they are a mouse-only affordance, and wheel,
          trackpad and keyboard already move the list. Open it and scroll — and check that
          opening it did not move the PAGE, which is the defect this shape kept producing
          (2026-08-17: the browser answers a focus by scrolling it into view, and both doors
          are now shut). */}
      <Demo label="A long list — it scrolls, there are no arrows, and the page must not move">
        <Flex gap="4" align="center">
          <Select
            defaultValue="m24"
            items={Object.fromEntries(
              Array.from({ length: 48 }, (_, i) => [`m${i}`, `Machine ${String(i + 1).padStart(2, "0")}`]),
            )}
          >
            <SelectTrigger placeholder="Pick a machine" aria-label="Machine" />
            <SelectContent>
              {Array.from({ length: 48 }, (_, i) => (
                <SelectItem key={i} value={`m${i}`}>
                  Machine {String(i + 1).padStart(2, "0")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Flex>
      </Demo>
      {/* THE ROW'S STATES, in one open panel: the chosen row wears the accent SOLID on its
          tick while its label stays neutral; the dead row keeps its reserved gutter; the group
          labels sit OUT-dented from the option text by exactly that gutter, which is macOS's
          own posture and deliberate (§23). Arrow through it with the keyboard. */}
      <Demo label="One panel, every row kind — the tick is the mark, not a louder label">
        <Flex gap="4" align="center">
          <Select defaultValue="sfo" items={REGION_ITEMS}>
            <SelectTrigger placeholder="Pick a region" aria-label="Every row kind" />
            <SelectContent>
              <RegionOptions />
            </SelectContent>
          </Select>
        </Flex>
      </Demo>
      {/* INVALID is a field-family state and arrives from the shared layer, not from anything
          Select owns — which is why it is shown in a Field, the unit that actually announces
          it. Read the trigger's boundary against the live one beside it, and check that the
          chevron and the value do not change with it: an invalid select is still a select. */}
      <Demo label="Invalid, inside the unit that announces it — only the boundary moves">
        <Flex gap="5" align="flex-start" wrap="wrap">
          <Box width="16rem">
            <Field>
              <FieldLabel>Region</FieldLabel>
              <Select defaultValue="fra" items={REGION_ITEMS}>
                <SelectTrigger placeholder="Pick a region" />
              <SelectContent>
                <RegionOptions />
              </SelectContent>
              </Select>
              <FieldDescription>Latency is measured from your last deploy.</FieldDescription>
            </Field>
          </Box>
          <Box width="16rem">
            <Field>
              <FieldLabel>Region</FieldLabel>
              <Select items={REGION_ITEMS}>
                <SelectTrigger placeholder="Pick a region" aria-invalid />
                <SelectContent>
                  <RegionOptions />
                </SelectContent>
              </Select>
              <FieldDescription>Latency is measured from your last deploy.</FieldDescription>
              <FieldError match={true}>Choose a region before deploying.</FieldError>
            </Field>
          </Box>
        </Flex>
      </Demo>
      {/* WIDTH, both facts together (audit 2026-08-09): a trigger grows to fit its chosen value
          unless something bounds it, and inside a bound it ellipsizes rather than pushing out.
          The panel is floored at the trigger's width and never narrower — so the bounded case
          is the one to read, where a wide panel opens from a narrow trigger. */}
      <Demo label="A long value — unbounded it grows, bounded it ellipsizes, and the panel floors at the trigger">
        <Stack gap="4">
          <Flex gap="4" align="center">
            <Select
              defaultValue="long"
              items={{ long: "someone.with.a.long.name@example-company.com", short: "Short" }}
            >
              <SelectTrigger placeholder="Unbounded" aria-label="Unbounded" />
              <SelectContent>
                <SelectItem value="long">someone.with.a.long.name@example-company.com</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
          <Box maxWidth="14rem">
            <Select
              defaultValue="long"
              items={{ long: "someone.with.a.long.name@example-company.com", short: "Short" }}
            >
              <SelectTrigger placeholder="Bounded" aria-label="Bounded" />
              <SelectContent>
                <SelectItem value="long">someone.with.a.long.name@example-company.com</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </Box>
        </Stack>
      </Demo>
      {/* An unbreakable option, which is the other half of the same question: a row is
          `inline-size: 100%` with nothing bounding its CONTENT until it was fixed, and one long
          address gave the panel 90px of sideways scroll with the highlight stopping short of
          the words it was highlighting. It must wrap inside the panel instead. */}
      <Demo label="An option with no break in it — it wraps inside the panel, it does not push out">
        <Box maxWidth="16rem">
          <Select
            defaultValue="a"
            items={{ a: "eu-west-1.production.internal.acme-corporation.example", b: "Short" }}
          >
            <SelectTrigger placeholder="Pick a host" aria-label="Host" />
            <SelectContent>
              <SelectItem value="a">eu-west-1.production.internal.acme-corporation.example</SelectItem>
              <SelectItem value="b">Short</SelectItem>
            </SelectContent>
          </Select>
        </Box>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* TWO SURFACES, ONE AXIS, and this is the section that has to show both. The panel
          floats over content by definition, so it is glass whenever the theme is; the TRIGGER
          sits in flow, so it expresses the material only where content passes behind it —
          §10's selectivity, which is what `backdrop` and a marked region state. On the plain
          page the trigger is correctly SOLID and the panel is not. */}
      <Demo label="Over the page — the panel takes the material, the in-flow trigger does not">
        <Flex gap="4" align="center" wrap="wrap">
          <Select defaultValue="team" items={SHORT_ITEMS}>
            <SelectTrigger placeholder="Solid" aria-label="Solid" />
            <SelectContent>
              <ShortOptions />
            </SelectContent>
          </Select>
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <Select defaultValue="team" items={SHORT_ITEMS}>
                <SelectTrigger placeholder={cap(material)} aria-label={material} />
                <SelectContent>
                  <ShortOptions />
                </SelectContent>
              </Select>
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* …and on a bed, where the region IS marked, so the trigger expresses too. This is the
          composition the axis exists for, and until the placement rule shipped this exact bed
          showed an opaque white dropdown beside a translucent field — which was the defect,
          not the specimen. Read the trigger against the TextField beside it: the field family
          agreement has to survive the veil. */}
      <Demo label="On a marked region — the trigger is glass too, and must still match the field">
        <BedSurface bed={bed("photo")} minHeight="220px">
          <Flex gap="4" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Flex gap="3" align="center">
                  <Select defaultValue="team" items={SHORT_ITEMS}>
                    <SelectTrigger placeholder={cap(material)} aria-label={material} />
                    <SelectContent>
                      <ShortOptions />
                    </SelectContent>
                  </Select>
                  <TextField placeholder="…and the field" aria-label="Field beside it" />
                </Flex>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
      {/* The panel over a busy bed, opened long: rows are text at close spacing, so a veil that
          lets too much through turns a list of place names into noise. The group labels are the
          quietest ink in the panel and therefore the first thing to fail. */}
      <Demo label="A long panel over a busy bed — the group labels fail first">
        <BedSurface bed={bed("swirl")} minHeight="220px">
          <Flex gap="4" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Select defaultValue="sfo" items={REGION_ITEMS}>
                  <SelectTrigger placeholder={cap(material)} aria-label={material} />
                  <SelectContent>
                    <RegionOptions />
                  </SelectContent>
                </Select>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      {/* Size × material on the TRIGGER, which is the cell nobody sees otherwise: a glass field
          at size 1 has the least area in the family for a veil to establish itself in, and the
          field's fill is the one the material has to mix from. Marked region, so every trigger
          here expresses. */}
      <BedSurface bed={bed("country")} minHeight="0px">
        <Box style={{ padding: "var(--layout-space-5)", width: "100%" }}>
          <SpecTable
            wide
            cols={["Solid", ...glassMaterials().map(cap)]}
            rows={SIZES.map((size) => ({
              label: `size ${size}`,
              cells: [
                <Select key="solid" size={size as Size} defaultValue="team" items={SHORT_ITEMS}>
                  <SelectTrigger placeholder="Visibility" aria-label="Solid" />
                  <SelectContent>
                    <ShortOptions />
                  </SelectContent>
                </Select>,
                ...glassMaterials().map((material) => (
                  <Theme key={material} material={material}>
                    <Select size={size as Size} defaultValue="team" items={SHORT_ITEMS}>
                      <SelectTrigger placeholder="Visibility" aria-label={material} />
                      <SelectContent>
                        <ShortOptions />
                      </SelectContent>
                    </Select>
                  </Theme>
                )),
              ],
            }))}
          />
        </Box>
      </BedSurface>
      {/* Size × the chosen row's placement: the panel's row height changes with the index, so
          the offset that lands the chosen row on the trigger is a different number in every
          cell. Open each with the same middle value — the row must sit on the trigger at all
          four sizes, not near it. */}
      <SpecTable
        wide
        cols={["Opens at a middle value"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Select key="p" size={size as Size} defaultValue="iad" items={REGION_ITEMS}>
              <SelectTrigger placeholder="Pick a region" aria-label={`size ${size}`} />
              <SelectContent>
                <RegionOptions />
              </SelectContent>
            </Select>,
          ],
        }))}
      />
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* WHERE IT BELONGS is inside a Field, and this is the ordinary case: the field supplies
          the label, the description, the error and the SIZE — the index reaches the control by
          context (§28), so nothing states it twice. Read the label's step against the trigger's
          value: they are the same step by derivation, not by a table. */}
      <Demo label="Inside a field — one index prices the label, the description and the control">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Box key={size} width="15rem">
              <Field size={size as Size}>
                <FieldLabel>Region</FieldLabel>
                <Select defaultValue="lhr" items={REGION_ITEMS}>
                  <SelectTrigger placeholder="Pick a region" />
                  <SelectContent>
                    <RegionOptions />
                  </SelectContent>
                </Select>
                <FieldDescription>Closest to your users.</FieldDescription>
              </Field>
            </Box>
          ))}
        </Flex>
      </Demo>
      {/* A SELECT INSIDE A MODAL is the composition that can actually break: both portal, so
          §20's stacking frame orders them by DOM position rather than by a z-index ladder. Open
          the dialog, then the select inside it — the panel must land above the dialog's panel,
          and dismissing the panel must not dismiss the dialog under it. */}
      <Demo label="Opened inside a dialog — above the panel, and Escape closes only the list">
        <Flex gap="3" align="center">
          <Dialog size="3">
            <DialogTrigger render={<Button emphasis="medium">New environment</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>New environment</DialogTitle>
                  <DialogDescription>It is created empty and can be deleted later.</DialogDescription>
                </Stack>
                <Stack gap="5">
                  <Field size="3">
                    <FieldLabel>Name</FieldLabel>
                    <TextField placeholder="staging" />
                  </Field>
                  <Field size="3">
                    <FieldLabel>Region</FieldLabel>
                    <Select defaultValue="fra" items={REGION_ITEMS}>
                      <SelectTrigger placeholder="Pick a region" />
                      <SelectContent>
                        <RegionOptions />
                      </SelectContent>
                    </Select>
                  </Field>
                </Stack>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button size="3" tone="accent" emphasis="loud">Create</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* HOSTED IN A GLASS CARD: one glass per stack (§10), so the card spends the backdrop and
          the trigger inside it resolves SOLID — while the panel, which portals out of that
          scope and floats over the page, is glass again. That reversal is the mechanism
          working, and it is the one place a reader might read it as a leak. */}
      <Demo label="In a glass card — the trigger goes solid, and its panel is glass again">
        <Theme material="regular">
          <BedSurface bed={bed("country")} minHeight="240px">
            <Card size="3" backdrop style={{ maxWidth: 360 }}>
              <Stack gap="5">
                <Text size="3" weight="medium">
                  Share this set
                </Text>
                <Field size="3">
                  <FieldLabel>Who can open it</FieldLabel>
                  <Select defaultValue="team" items={SHORT_ITEMS}>
                    <SelectTrigger placeholder="Choose" />
                    <SelectContent>
                      <ShortOptions />
                    </SelectContent>
                  </Select>
                </Field>
              </Stack>
            </Card>
          </BedSurface>
        </Theme>
      </Demo>
      {/* SELF-NESTING gets an explicit verdict, as every component's does, and here it is not
          even expressible: a listbox may hold only options and groups, so a select inside a
          select is markup the accessibility tree rejects before taste gets a turn. Two
          dependent choices are two selects side by side, the second re-keyed by the first. */}
      <Demo label="A select inside a select — refused; two dependent choices are two selects">
        <Stack gap="4">
          <Card size="2" style={{ maxWidth: 520 }}>
            <Stack gap="2">
              <Text size="2" weight="medium">
                Nothing goes inside the panel but options
              </Text>
              <Text size="2" emphasis="medium">
                The panel is the listbox. A control inside it is markup an accessibility scan
                reports as a violation — the same rule that keeps a Separator out. Chained
                choices are two controls, side by side.
              </Text>
            </Stack>
          </Card>
          <Flex gap="3" align="flex-end" wrap="wrap">
            <Box width="14rem">
              <Field>
                <FieldLabel>Continent</FieldLabel>
                <Select defaultValue="eu" items={{ eu: "Europe", am: "Americas", ap: "Asia Pacific" }}>
                  <SelectTrigger placeholder="Choose" />
                  <SelectContent>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="am">Americas</SelectItem>
                    <SelectItem value="ap">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Box>
            <Box width="14rem">
              <Field>
                <FieldLabel>Region</FieldLabel>
                <Select defaultValue="fra" items={{ fra: "Frankfurt", ams: "Amsterdam", lhr: "London" }}>
                  <SelectTrigger placeholder="Choose" />
                  <SelectContent>
                    <SelectItem value="fra">Frankfurt</SelectItem>
                    <SelectItem value="ams">Amsterdam</SelectItem>
                    <SelectItem value="lhr">London</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Box>
          </Flex>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* The real job: a form where the select is one control among several and reads as none
          of them in particular. That is the whole argument for the field identity — if the
          select is findable at a glance in this card, it has failed. */}
      <Demo label="A form — the select must not stand out from the fields around it">
        <Card size="3" style={{ maxWidth: 560 }}>
          <Stack gap="6">
            <Stack gap="2">
              <Heading size="6">New project</Heading>
              <Text size="3" emphasis="medium">
                You can change any of this later.
              </Text>
            </Stack>
            <Stack gap="5">
              <Field size="3">
                <FieldLabel>Name</FieldLabel>
                <TextField placeholder="acme-web" />
                <FieldDescription>Lowercase, no spaces.</FieldDescription>
              </Field>
              <Field size="3">
                <FieldLabel>Visibility</FieldLabel>
                <Select defaultValue="private" items={SHORT_ITEMS}>
                  <SelectTrigger placeholder="Choose" />
                  <SelectContent>
                    <ShortOptions />
                  </SelectContent>
                </Select>
                <FieldDescription>Private projects are billed the same.</FieldDescription>
              </Field>
              <Field size="3">
                <FieldLabel>Region</FieldLabel>
                <Select defaultValue="fra" items={REGION_ITEMS}>
                  <SelectTrigger placeholder="Pick a region" />
                  <SelectContent>
                    <RegionOptions />
                  </SelectContent>
                </Select>
              </Field>
            </Stack>
            <Separator />
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered>
                Cancel
              </Button>
              <Button tone="accent" emphasis="loud">
                Create project
              </Button>
            </Flex>
          </Stack>
        </Card>
      </Demo>
      {/* A FILTER BAR, the other common shape: several selects in a row, each already carrying
          a value, so none of them is inviting anything. The judgment is whether a row of
          triggers reads as settings rather than as a row of buttons. */}
      <Demo label="A filter bar — several selects in a row, all already answered">
        <Card size="2" style={{ maxWidth: 640 }}>
          <Flex gap="3" align="center" wrap="wrap">
            <Select size="2" defaultValue="7d" items={{ "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days" }}>
              <SelectTrigger placeholder="Period" aria-label="Period" />
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Select size="2" defaultValue="fra" items={REGION_ITEMS}>
              <SelectTrigger placeholder="Region" aria-label="Region" />
              <SelectContent>
                <RegionOptions />
              </SelectContent>
            </Select>
            <Select size="2" defaultValue="all" items={{ all: "All statuses", ok: "Succeeded", fail: "Failed" }}>
              <SelectTrigger placeholder="Status" aria-label="Status" />
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ok">Succeeded</SelectItem>
                <SelectItem value="fail">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="2" emphasis="quiet" bordered>
              Reset
            </Button>
          </Flex>
        </Card>
      </Demo>
      {/* …and on media, where the trigger is on glass and its panel floats over the photograph.
          The last thing to check, because it is the composition with the most going on. */}
      <Demo label="On a media page — a glass trigger, a panel over the photograph">
        <BedSurface bed={bed("bloom")} minHeight="300px">
          <Flex align="flex-end" style={{ padding: "var(--layout-space-6)" }}>
            <Box backdrop>
              <Card size="2" backdrop style={{ maxWidth: 380 }}>
                <Stack gap="4">
                  <Stack gap="1">
                    <Text size="3" weight="medium">
                      Autumn set
                    </Text>
                    <Text size="2" emphasis="medium">
                      24 photographs, 1.2 GB
                    </Text>
                  </Stack>
                  <Field size="2">
                    <FieldLabel>Who can open it</FieldLabel>
                    <Select defaultValue="team" items={SHORT_ITEMS}>
                      <SelectTrigger placeholder="Choose" />
                      <SelectContent>
                        <ShortOptions />
                      </SelectContent>
                    </Select>
                  </Field>
                  <Flex gap="3">
                    <Button size="2" tone="accent" emphasis="loud">
                      Copy link
                    </Button>
                    <Button size="2" emphasis="quiet" bordered>
                      Done
                    </Button>
                  </Flex>
                </Stack>
              </Card>
            </Box>
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

export const selectPreview: ComponentPreview = {
  slug: "select",
  name: "Select",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§23, the TextField sentence): a form control does not rank and does not editorialize. Loudness orders actions, and a form where one field shouts is a form pointing at itself — so neither the trigger nor its rows take a family. The one tone a select carries is the ACCENT on the chosen row's tick, which is the system's identity rather than a choice, and it is judged in States with the rest of the row kinds.",
    },
    inUse: { body: <InUse /> },
  },
};
