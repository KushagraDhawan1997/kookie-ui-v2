/**
 * Combobox's preview spec (2026-09-12).
 *
 * A combobox is judged against two neighbours, and the sections keep them apart the way Select's
 * spec does. Its FIELD is a text field you type into, so the thing it must agree with is the
 * TextField beside it — same seal, same edge, same height, same corner, same focus ring — and the
 * Select trigger beside that, which is the same family pressed rather than entered. Its PANEL is
 * Select's panel hanging below the field rather than item-aligned over it, so the row family, the
 * concentric corner and the tick all arrive from there.
 *
 * The one behaviour that is neither is FILTERING: the letters narrow the list and never become the
 * value. Every demo that can show that is written so typing is the thing to try.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
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
  SelectItem,
  SelectTrigger,
  Separator,
  Stack,
  Text,
  TextField,
  Theme,
  themeAxes,
  type ComboboxOptionGroup,
} from "@kookie-ui/react";

import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** A function, not a module const: the standalone route imports this module on the server for
    its slug (card.tsx's own note). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

type Size = "1" | "2" | "3" | "4";

/* ── The canonical data: a flat list, a grouped list, and options whose label is not the value ── */

const REGIONS: readonly string[] = [
  "Frankfurt",
  "Amsterdam",
  "London",
  "Paris",
  "Washington DC",
  "San Francisco",
  "São Paulo",
  "Tokyo",
  "Sydney",
];

/** Sydney is the dead row in every list that has one — at capacity, still announced. */
const AT_CAPACITY = "Sydney";

const REGION_GROUPS: readonly ComboboxOptionGroup<string>[] = [
  { value: "Europe", items: ["Frankfurt", "Amsterdam", "London", "Paris"] },
  { value: "Americas", items: ["Washington DC", "San Francisco", "São Paulo"] },
  { value: "Asia Pacific", items: ["Tokyo", "Sydney"] },
];

type Zone = { value: string; label: string };

/** The option the time zone demos start on — held by name, so the default is the same object the
    list holds (Base UI compares options by identity). */
const MUMBAI: Zone = { value: "Asia/Kolkata", label: "Mumbai" };

const TIMEZONES: readonly Zone[] = [
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  MUMBAI,
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
];

const MACHINES: readonly string[] = Array.from({ length: 48 }, (_, i) => `Machine ${String(i + 1).padStart(2, "0")}`);

/* ── Ordinary call sites, spelled once so every demo below is the same combobox ─────────────── */

function RegionCombobox({
  size,
  defaultValue,
  disabled,
  readOnly,
  placeholder = "Search regions",
  label,
  invalid,
}: {
  size?: Size;
  defaultValue?: string | null;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  invalid?: boolean;
}) {
  return (
    <Combobox
      items={REGIONS}
      {...(size !== undefined ? { size } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
      {...(disabled ? { disabled } : {})}
      {...(readOnly ? { readOnly } : {})}
    >
      <ComboboxInput
        placeholder={placeholder}
        {...(label !== undefined ? { "aria-label": label } : {})}
        {...(invalid ? { "aria-invalid": true } : {})}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size={size ?? "2"}>No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item} disabled={item === AT_CAPACITY}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function GroupedRegions({ size, defaultValue, label }: { size?: Size; defaultValue?: string; label?: string }) {
  return (
    <Combobox
      items={REGION_GROUPS}
      {...(size !== undefined ? { size } : {})}
      {...(defaultValue !== undefined ? { defaultValue } : {})}
    >
      <ComboboxInput placeholder="Search regions" {...(label !== undefined ? { "aria-label": label } : {})} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size={size ?? "2"}>No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(group: ComboboxOptionGroup<string>) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item} disabled={item === AT_CAPACITY}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function TimezoneCombobox({ size }: { size?: Size }) {
  return (
    <Combobox items={TIMEZONES} defaultValue={MUMBAI} {...(size !== undefined ? { size } : {})}>
      <ComboboxInput placeholder="Search cities" />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size={size ?? "2"}>No city matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(zone: Zone) => (
            <ComboboxItem key={zone.value} value={zone}>
              {zone.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/* ── Sections ──────────────────────────────────────────────────────────────────────────────── */

function Sizes() {
  return (
    <Stack gap="6">
      {/* THE AGREEMENT THAT DEFINES THE FIELD: at every index the combobox must be
          indistinguishable in seal, edge, height and corner from the TextField beside it, and from
          the Select trigger beside that. Read across, not down. */}
      <SpecTable
        wide
        cols={["Combobox", "TextField", "Select"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <RegionCombobox key="c" size={size as Size} label="Region" />,
            <TextField key="t" size={size as Size} placeholder="Type here" aria-label="Free text" />,
            <Select key="s" size={size as Size} items={{ fra: "Frankfurt", lhr: "London" }}>
              <SelectTrigger placeholder="Pick a region" aria-label="Region" />
              <SelectContent>
                <SelectItem value="fra">Frankfurt</SelectItem>
                <SelectItem value="lhr">London</SelectItem>
              </SelectContent>
            </Select>,
          ],
        }))}
      />
      {/* The PANEL's ladder is the row family's: open each and read the rows against the field
          that opened them. The panel must never be narrower than its field. */}
      <Demo label="Open each — the panel answers the index the field wears">
        <Flex gap="3" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="2" emphasis="quiet">
                size {size}
              </Text>
              <RegionCombobox size={size as Size} defaultValue="London" label={`Region, size ${size}`} />
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
      {/* THE RESTING STATES of the field: empty invites in the muted ink, a value reads at full
          strength, read-only drops the well and keeps the value, disabled stands both down. */}
      <Demo label="Empty, chosen, read-only, disabled — only the empty one should invite typing">
        <Flex gap="4" align="center" wrap="wrap">
          <RegionCombobox label="Empty" />
          <RegionCombobox defaultValue="Frankfurt" label="Chosen" />
          <RegionCombobox defaultValue="Frankfurt" readOnly label="Read-only" />
          <RegionCombobox defaultValue="Frankfurt" disabled label="Disabled" />
        </Flex>
      </Demo>
      {/* FILTERING, the component's reason to exist. Type "o": the list narrows and the first match
          is highlighted, so Enter picks it. Type "zz": the panel says nothing matched instead of
          closing on you. Clear the field: the list comes back whole. */}
      <Demo label={'Type "o", then Enter — then type "zz" and read the empty message'}>
        <Flex gap="4" align="center">
          <RegionCombobox label="Filtering" />
        </Flex>
      </Demo>
      {/* The FOCUS RING is a mode here, as on a TextField: it shows however the caret arrived, and
          it stays on the field while the panel is open, because the caret never leaves it. The
          chevron is the pointer's way in and takes no ring of its own. */}
      <Demo label="Click the chevron, then the field — the ring is the field's, the list never takes focus">
        <Flex gap="4" align="center">
          <RegionCombobox label="Focus" />
        </Flex>
      </Demo>
      {/* Every row kind in one panel: group labels out-dented by the tick's gutter, the chosen row's
          tick in the accent glyph with a neutral label, the dead row keeping its gutter. */}
      <Demo label="Groups, a chosen row, a dead row — the tick is the mark, not a louder label">
        <Flex gap="4" align="center">
          <GroupedRegions defaultValue="San Francisco" label="Every row kind" />
        </Flex>
      </Demo>
      {/* A list taller than the window: it scrolls inside the panel, the highlight is kept in view
          as you arrow through it, and the field does not move. */}
      <Demo label="A long list — arrow down past the fold; the highlight stays in view, the field stays put">
        <Flex gap="4" align="center">
          <Combobox items={MACHINES}>
            <ComboboxInput placeholder="Search machines" aria-label="Machine" />
            <ComboboxContent>
              <ComboboxEmpty>
                <Text size="2">No machine matches.</Text>
              </ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Flex>
      </Demo>
      {/* INVALID is a field-family state from the shared layer, shown inside the unit that
          announces it. Only the boundary moves; the chevron and the value do not. */}
      <Demo label="Invalid, inside the unit that announces it — only the boundary moves">
        <Flex gap="5" align="flex-start" wrap="wrap">
          <Box width="16rem">
            <Field>
              <FieldLabel>Region</FieldLabel>
              <RegionCombobox defaultValue="Paris" />
              <FieldDescription>Latency is measured from your last deploy.</FieldDescription>
            </Field>
          </Box>
          <Box width="16rem">
            <Field>
              <FieldLabel>Region</FieldLabel>
              <RegionCombobox invalid />
              <FieldDescription>Latency is measured from your last deploy.</FieldDescription>
              <FieldError match={true}>Choose a region before deploying.</FieldError>
            </Field>
          </Box>
        </Flex>
      </Demo>
      {/* Options whose label is not their value: the field shows the label, the form submits the
          value. Pick one and read the field. */}
      <Demo label="Labels that are not values — the field shows the city, the form submits the zone">
        <Flex gap="4" align="center">
          <TimezoneCombobox />
        </Flex>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The panel floats over content by definition, so it is glass whenever the theme is; the
          FIELD sits in flow and expresses the material only where content passes behind it. On
          the plain page the field is correctly solid and the panel is not. */}
      <Demo label="Over the page — the panel takes the material, the in-flow field does not">
        <Flex gap="4" align="center" wrap="wrap">
          <RegionCombobox defaultValue="Tokyo" label="Solid" />
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <RegionCombobox defaultValue="Tokyo" placeholder={cap(material)} label={material} />
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* On a marked region the field expresses too, and must still match the TextField beside it
          through the veil. */}
      <Demo label="On a marked region — the field is glass too, and must still match the TextField">
        <BedSurface bed={bed("photo")} minHeight="220px">
          <Flex gap="4" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Flex gap="3" align="center">
                  <RegionCombobox placeholder={cap(material)} label={material} />
                  <TextField placeholder="…and the field" aria-label="Field beside it" />
                </Flex>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
      {/* A grouped panel over a busy bed: the group labels are the quietest ink and fail first. */}
      <Demo label="A grouped panel over a busy bed — the group labels fail first">
        <BedSurface bed={bed("swirl")} minHeight="220px">
          <Flex gap="4" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <GroupedRegions defaultValue="Paris" label={material} />
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
      {/* Size × material on the FIELD over a marked region — a glass field at size 1 has the least
          area for a veil, and the chevron is the slot most likely to read differently. */}
      <BedSurface bed={bed("country")} minHeight="0px">
        {/* A CELL CANNOT MAKE A FIELD NARROWER THAN ITS OWN INPUT (audit 2026-09-12). The X5
            repair below — the Theme cell passing its stretch on — was necessary and not
            sufficient: measured at 1440, nine glass fields still painted 202/233/268px inside
            a 186px cell and over the column beside them.

            The floor is the FIELD FAMILY's, not this component's, so it is not the demo's to
            argue with. A `.kui-field` is a flex box holding a bare `<input>`, and an input's
            min-content width is its UA intrinsic size (~20 characters) — `min-width: 0` in
            text-field.css lets the input SHRINK inside a sized wrapper, but the wrapper's own
            min-content still includes it, which is what a grid item's automatic minimum
            resolves to. Measured in a 186px cell: TextField 186 (its floor is ~178, so it fits
            by luck), Combobox 204 — the same floor plus the chevron. So a `wide` track, which
            promises `minmax(0, 1fr)`, was asking every field for a width the family cannot
            give.

            The table states the field's own width instead and SCROLLS inside the bed, which is
            the house answer for wide content and keeps every cell judgeable at its real size —
            the point of this board, since a veil is what is being read. Whether a field should
            be able to shrink below its input at all is the system's standing question (the
            mirror of the NumberField audit's N2, which asks for a floor rather than against
            one); it is recorded, not settled here. */}
        <Box style={{ padding: "var(--layout-space-5)", width: "100%", minInlineSize: 0, overflowX: "auto" }}>
          <SpecTable
            cols={["Solid", ...glassMaterials().map(cap)]}
            rows={SIZES.map((size) => ({
              label: `size ${size}`,
              cells: [
                <RegionCombobox key="solid" size={size as Size} defaultValue="London" label="Solid" />,
                // THE THEME IS THE GRID ITEM, so it owes the stretch onward (audit 2026-09-12,
                // X5). `SpecTable wide` stretches its items, and it stretched the Theme's div
                // — which is a block box, so the inline-flex field inside it kept its intrinsic
                // width and simply overflowed: measured 172/202/233/268px against a 159px
                // Solid cell, each size-4 field's right edge past the next column and the bed
                // scrolling 921 against 852. A one-item grid passes `stretch` through on the
                // inline axis, which is the only axis the cell is asking about.
                ...glassMaterials().map((material) => (
                  <Theme key={material} material={material} style={{ display: "grid" }}>
                    <RegionCombobox size={size as Size} defaultValue="London" label={material} />
                  </Theme>
                )),
              ],
            }))}
          />
        </Box>
      </BedSurface>
      {/* Size × filtering: the empty message takes a row's band at every index, and the panel's
          height changes as you type without the field moving. Type "zz" in each. */}
      <SpecTable
        wide
        cols={["Type to narrow, then type nonsense"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [<GroupedRegions key="g" size={size as Size} label={`size ${size}`} />],
        }))}
      />
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* Inside a Field, the ordinary case: the field supplies the label, description and SIZE. */}
      <Demo label="Inside a field — one index prices the label, the description and the control">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Box key={size} width="15rem">
              <Field size={size as Size}>
                <FieldLabel>Region</FieldLabel>
                <RegionCombobox defaultValue="Amsterdam" />
                <FieldDescription>Closest to your users.</FieldDescription>
              </Field>
            </Box>
          ))}
        </Flex>
      </Demo>
      {/* Inside a modal, both portal: the panel must land above the dialog, and Escape must close
          only the list. */}
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
                    <GroupedRegions defaultValue="Frankfurt" />
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
      {/* Hosted in a glass card: the card spends the backdrop, so the field resolves solid, while
          the panel portals out over the page and is glass again. */}
      <Demo label="In a glass card — the field goes solid, and its panel is glass again">
        <Theme material="regular">
          <BedSurface bed={bed("country")} minHeight="240px">
            <Card size="3" backdrop style={{ maxWidth: 360 }}>
              <Stack gap="5">
                <Text size="3" weight="medium">
                  Share this set
                </Text>
                <Field size="3">
                  <FieldLabel>Time zone</FieldLabel>
                  <TimezoneCombobox />
                </Field>
              </Stack>
            </Card>
          </BedSurface>
        </Theme>
      </Demo>
      {/* Self-nesting is not expressible: the panel is a listbox, which holds only options and
          groups. Two dependent choices are two controls side by side. */}
      <Demo label="A combobox inside a combobox — refused; two dependent choices are two controls">
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
              <FieldLabel>City</FieldLabel>
              <RegionCombobox defaultValue="London" />
            </Field>
          </Box>
        </Flex>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* A form where the combobox is one field among several and reads as none of them in
          particular — findable at a glance only by its chevron. */}
      <Demo label="A form — the combobox must not stand out from the fields around it">
        <Card size="3" style={{ maxWidth: 560 }}>
          <Stack gap="6">
            <Stack gap="2">
              <Heading size="6">Invite a teammate</Heading>
              <Text size="3" emphasis="medium">
                They get access to this workspace only.
              </Text>
            </Stack>
            <Stack gap="5">
              <Field size="3">
                <FieldLabel>Name</FieldLabel>
                <TextField placeholder="Shruti Bhatia" />
              </Field>
              <Field size="3">
                <FieldLabel>Office</FieldLabel>
                <GroupedRegions defaultValue="London" />
                <FieldDescription>Sets their default deploy region.</FieldDescription>
              </Field>
              <Field size="3">
                <FieldLabel>Time zone</FieldLabel>
                <TimezoneCombobox />
              </Field>
            </Stack>
            <Separator />
            <Flex gap="3" justify="flex-end">
              <Button size="3" emphasis="quiet" bordered>
                Cancel
              </Button>
              <Button size="3" tone="accent" emphasis="loud">
                Send invite
              </Button>
            </Flex>
          </Stack>
        </Card>
      </Demo>
      {/* A filter bar: a long option set a select would make you scroll, beside controls that
          already carry a value. */}
      <Demo label="A filter bar — the long list is the one you type into">
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
            <Combobox items={MACHINES}>
              <ComboboxInput placeholder="Any machine" aria-label="Machine" />
              <ComboboxContent>
                <ComboboxEmpty>
                  <Text size="2">No machine matches.</Text>
                </ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Button size="2" emphasis="quiet" bordered>
              Reset
            </Button>
          </Flex>
        </Card>
      </Demo>
    </Stack>
  );
}

export const comboboxPreview: ComponentPreview = {
  slug: "combobox",
  name: "Combobox",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused, on Select's and TextField's sentence: a form control does not rank and does not editorialize, so neither the field nor its rows take a family. The one colour a combobox carries is the ACCENT on the chosen row's tick, which is the system's identity rather than a choice, and it is judged in States with the other row kinds.",
    },
    inUse: { body: <InUse /> },
  },
};
