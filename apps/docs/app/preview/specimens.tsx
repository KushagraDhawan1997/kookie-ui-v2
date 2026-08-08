"use client";

/**
 * The playground sections — the Radix Themes playground's structure in KookieUI vocabulary:
 * ONE long page, one section per component in alphabetical order, each section a handful of
 * dense specimen tables. Where Radix varies `variant × (accent | gray | disabled)`, we vary
 * the axes this system actually has: emphasis rungs, tones, sizes, states. Components we do
 * not ship yet simply do not appear; nothing is tabbed, everything is flat.
 *
 * Layout discipline (the one real constraint): a kui Box is an inline-size query container,
 * so it collapses to zero width wherever it must shrink-wrap (the recorded §2 defect). Table
 * cells are therefore bare controls in definite grid tracks wherever possible; composite
 * cells get 1fr tracks, never max-content.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  Separator,
  Slider,
  Spinner,
  Stack,
  Switch,
  Text,
  TextArea,
  TextField,
  type Size,
  type Tone,
} from "@kookie-ui/react";

import { PlusIcon, SearchIcon, XIcon } from "../icons";

const SIZES = ["1", "2", "3", "4"] as const satisfies readonly Size[];
// The app restates the tone list (the package exports the type, not the value) — docs land,
// where a stale entry fails visibly on this very page.
const TONES = [
  "neutral",
  "accent",
  "blue",
  "green",
  "orange",
  "amber",
  "destructive",
  "success",
  "warning",
  "info",
] as const satisfies readonly Tone[];

const RAMP = ["9", "8", "7", "6", "5", "4", "3", "2", "1"] as const;

/* ── Table machinery ───────────────────────────────────────────────────────────────────── */

type Row = { label: string; cells: React.ReactNode[] };

/**
 * A specimen table: column headers across the top, a row label down the side, one specimen
 * per cell — the playground's own arrangement. `wide` switches the tracks from max-content
 * (bare controls, intrinsic width) to 1fr (fields, sliders, composite cells).
 */
function SpecTable({ cols, rows, wide = false }: { cols: string[]; rows: Row[]; wide?: boolean }) {
  const track = wide ? "minmax(0, 1fr)" : "minmax(0, max-content)";
  return (
    // Explicit both-axis alignment: grid items default to STRETCH, which warps any square
    // control to its column's widest cell (a size-1 icon button inflated to the size-4
    // cell's 51px, found by probe). Wide tables keep stretch on the inline axis — a field
    // should fill its track.
    <Grid
      columns={`64px repeat(${cols.length}, ${track})`}
      gapX="5"
      gapY="4"
      style={{ alignItems: "center", justifyItems: wide ? "stretch" : "start" }}
    >
      <span />
      {cols.map((col) => (
        <Text key={col} size="1" emphasis="medium">
          {col}
        </Text>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <Text size="1" emphasis="medium">
            {row.label}
          </Text>
          {row.cells.map((cell, i) => (
            <React.Fragment key={i}>{cell}</React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </Grid>
  );
}

/**
 * The hostile bed for glass: material is judged over something that fights back, never over
 * the page. THE image — the same backdrop.jpg the package preview judges against, so the two
 * surfaces argue about one photograph. Tall on purpose: glass needs varied luminance behind
 * it before thin/regular/thick read as different materials.
 */
function HostileBed({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      gap="5"
      wrap="wrap"
      p="7"
      style={{
        backgroundImage: "url(/backdrop.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "var(--radius-surface-3)",
        minHeight: "320px",
      }}
    >
      {children}
    </Flex>
  );
}

/* ── Sections, alphabetical ────────────────────────────────────────────────────────────── */

function ButtonSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Accent", "Neutral", "Destructive", "Disabled"]}
        rows={[
          {
            label: "loud",
            cells: [
              <Button key="a" tone="accent" emphasis="loud">Button</Button>,
              <Button key="n" emphasis="loud">Button</Button>,
              <Button key="d" tone="destructive" emphasis="loud">Button</Button>,
              <Button key="x" tone="accent" emphasis="loud" disabled>Button</Button>,
            ],
          },
          {
            label: "medium",
            cells: [
              <Button key="a" tone="accent" emphasis="medium">Button</Button>,
              <Button key="n" emphasis="medium">Button</Button>,
              <Button key="d" tone="destructive" emphasis="medium">Button</Button>,
              <Button key="x" tone="accent" emphasis="medium" disabled>Button</Button>,
            ],
          },
          {
            label: "medium +",
            cells: [
              <Button key="a" tone="accent" emphasis="medium" bordered>Button</Button>,
              <Button key="n" emphasis="medium" bordered>Button</Button>,
              <Button key="d" tone="destructive" emphasis="medium" bordered>Button</Button>,
              <Button key="x" tone="accent" emphasis="medium" bordered disabled>Button</Button>,
            ],
          },
          {
            label: "quiet",
            cells: [
              <Button key="a" tone="accent" emphasis="quiet">Button</Button>,
              <Button key="n" emphasis="quiet">Button</Button>,
              <Button key="d" tone="destructive" emphasis="quiet">Button</Button>,
              <Button key="x" tone="accent" emphasis="quiet" disabled>Button</Button>,
            ],
          },
          {
            label: "quiet +",
            cells: [
              <Button key="a" tone="accent" emphasis="quiet" bordered>Button</Button>,
              <Button key="n" emphasis="quiet" bordered>Button</Button>,
              <Button key="d" tone="destructive" emphasis="quiet" bordered>Button</Button>,
              <Button key="x" tone="accent" emphasis="quiet" bordered disabled>Button</Button>,
            ],
          },
        ]}
      />
      <SpecTable
        cols={["Loud", "Medium", "Quiet", "Leading", "Icon only", "Loading"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Button key="l" size={size} tone="accent" emphasis="loud">Button</Button>,
            <Button key="m" size={size} emphasis="medium">Button</Button>,
            <Button key="q" size={size} emphasis="quiet" bordered>Button</Button>,
            <Button key="i" size={size} emphasis="medium" leading={<PlusIcon />}>New</Button>,
            <Button key="o" size={size} iconOnly emphasis="quiet" bordered aria-label="Search"><SearchIcon /></Button>,
            <Button key="s" size={size} tone="accent" emphasis="loud" loading>Saving</Button>,
          ],
        }))}
      />
      <SpecTable
        cols={["Loud", "Medium", "Medium +", "Quiet", "Quiet +"]}
        rows={TONES.map((tone) => ({
          label: tone,
          cells: [
            <Button key="1" tone={tone} emphasis="loud">Button</Button>,
            <Button key="2" tone={tone} emphasis="medium">Button</Button>,
            <Button key="3" tone={tone} emphasis="medium" bordered>Button</Button>,
            <Button key="4" tone={tone} emphasis="quiet">Button</Button>,
            <Button key="5" tone={tone} emphasis="quiet" bordered>Button</Button>,
          ],
        }))}
      />
      <HostileBed>
        <Button tone="accent" emphasis="loud" material="thin">Thin</Button>
        <Button tone="accent" emphasis="loud" material="regular">Regular</Button>
        <Button tone="accent" emphasis="loud" material="thick">Thick</Button>
        <Button emphasis="medium" material="regular">Neutral</Button>
        <Button emphasis="quiet" material="regular">Quiet</Button>
      </HostileBed>
    </Stack>
  );
}

function CardSection() {
  return (
    <Stack gap="6">
      <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
        {SIZES.map((size) => (
          <Card key={size} size={size}>
            <Stack gap="1">
              <Text size="2" weight="medium">Size {size}</Text>
              <Text size="1" emphasis="medium">The seal, the hairline, a corner from the surface band.</Text>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5">
        <Card size="3" render={<button type="button" />} style={{ textAlign: "left" }}>
          <Stack gap="1">
            <Text size="2" weight="medium">Pressable card</Text>
            <Text size="1" emphasis="medium">render={"{<button/>}"} — focus it with the keyboard.</Text>
          </Stack>
        </Card>
        <Card size="3" render={<a href="#card" />} style={{ textDecoration: "none" }}>
          <Stack gap="1">
            <Text size="2" weight="medium">Card as link</Text>
            <Text size="1" emphasis="medium">The surface layer notices element semantics.</Text>
          </Stack>
        </Card>
      </Grid>
      <HostileBed>
        {(["thin", "regular", "thick"] as const).map((m) => (
          <Card key={m} size="2" material={m} style={{ width: "180px" }}>
            <Stack gap="1">
              <Text size="2" weight="medium">{m[0]!.toUpperCase() + m.slice(1)}</Text>
              <Text size="1" emphasis="medium">Page glass over a hostile bed.</Text>
            </Stack>
          </Card>
        ))}
      </HostileBed>
    </Stack>
  );
}

function CheckboxSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Off", "On", "Mixed", "Invalid", "Disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Checkbox key="1" size={size} aria-label="Off" />,
            <Checkbox key="2" size={size} defaultChecked aria-label="On" />,
            <Checkbox key="3" size={size} indeterminate aria-label="Mixed" />,
            <Checkbox key="4" size={size} aria-invalid="true" aria-label="Invalid" />,
            <Checkbox key="5" size={size} disabled aria-label="Disabled" />,
            <Checkbox key="6" size={size} defaultChecked disabled aria-label="On disabled" />,
          ],
        }))}
      />
      {/* Stacked marks need 12 real pixels (§4); gap 5 is the smallest index that holds it. */}
      <Stack gap="5">
        {["Ship it on Friday", "Notify the team", "Archive the old branch"].map((label, i) => (
          <Flex key={label} gap="3" align="center">
            <Checkbox defaultChecked={i === 0} id={`pg-cb-${i}`} />
            <Text size="2" render={<label htmlFor={`pg-cb-${i}`} />}>{label}</Text>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
}

function HeadingSection() {
  return (
    <Stack gap="4">
      {RAMP.map((step) => (
        <Grid key={step} columns="64px minmax(0, 1fr)" gapX="5" align="center">
          <Text size="1" emphasis="medium">size {step}</Text>
          <Heading
            size={step}
            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            The quick brown fox jumps over the lazy dog
          </Heading>
        </Grid>
      ))}
    </Stack>
  );
}

function RadioSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Selected", "Unselected", "Invalid", "Disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <RadioGroup key="1" defaultValue="a" aria-label="Selected">
              <Radio size={size} value="a" aria-label="Selected" />
            </RadioGroup>,
            <RadioGroup key="2" aria-label="Unselected">
              <Radio size={size} value="a" aria-label="Unselected" />
            </RadioGroup>,
            <RadioGroup key="3" aria-label="Invalid">
              <Radio size={size} value="a" aria-invalid="true" aria-label="Invalid" />
            </RadioGroup>,
            <RadioGroup key="4" disabled defaultValue="a" aria-label="Disabled">
              <Radio size={size} value="a" aria-label="Disabled" />
            </RadioGroup>,
          ],
        }))}
      />
      {/* Definite tracks, not pairs loose in a row Flex: a labelled pair is a kui Box, and a
          Box asked to shrink-wrap as a flex item collapses to zero width (the §2 defect this
          file's header warns about — committed here anyway, caught on sight: three radios
          stacked on top of their own labels). */}
      <RadioGroup defaultValue="pro" aria-label="Plan">
        <Grid columns="repeat(3, minmax(150px, max-content))" gapX="5" align="center">
          {["Starter", "Pro", "Enterprise"].map((label) => (
            <Flex key={label} gap="3" align="center">
              <Radio value={label.toLowerCase()} id={`pg-rd-${label}`} />
              <Text size="2" render={<label htmlFor={`pg-rd-${label}`} />}>{label}</Text>
            </Flex>
          ))}
        </Grid>
      </RadioGroup>
    </Stack>
  );
}

function SeparatorSection() {
  return (
    <Stack gap="6">
      {/* Horizontal: the rule fills the block that owns it, and the Stack's gap is the
          distance — the separator brings no spacing of its own. */}
      <Card size="3">
        <Stack gap="4">
          <Text size="2" weight="medium">Shipped components</Text>
          <Separator />
          <Text size="2" emphasis="medium">Eleven controls, two type slots, one hairline.</Text>
          <Separator />
          <Text size="1" emphasis="quiet">The quiet hairline — --color-border, never the solved control edge.</Text>
        </Stack>
      </Card>
      {/* Vertical: stretches to the flex row that owns it — the toolbar idiom. */}
      <Flex gap="4" align="center">
        <Text size="2">Docs</Text>
        <Separator orientation="vertical" />
        <Text size="2">Components</Text>
        <Separator orientation="vertical" />
        <Text size="2" emphasis="medium">Source</Text>
      </Flex>
    </Stack>
  );
}

function SliderSection() {
  return (
    <SpecTable
      wide
      cols={["Value", "Range", "Disabled"]}
      rows={SIZES.map((size) => ({
        label: `size ${size}`,
        cells: [
          <Slider key="1" size={size} defaultValue={40 + Number(size) * 10} aria-label="Value" />,
          <Slider key="2" size={size} defaultValue={[20, 65]} aria-label="Range" />,
          <Slider key="3" size={size} defaultValue={50} disabled aria-label="Disabled" />,
        ],
      }))}
    />
  );
}

function SpinnerSection() {
  return (
    <SpecTable
      cols={["Standalone", "In a loud button", "In a quiet button"]}
      rows={SIZES.map((size) => ({
        label: `size ${size}`,
        cells: [
          <Spinner key="1" style={{ ["--kui-ct-icon" as string]: `var(--icon-size-${size})` }} />,
          <Button key="2" size={size} tone="accent" emphasis="loud" loading>Saving</Button>,
          <Button key="3" size={size} emphasis="quiet" loading>Refreshing</Button>,
        ],
      }))}
    />
  );
}

function SwitchSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Off", "On", "Invalid", "Disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Switch key="1" size={size} aria-label="Off" />,
            <Switch key="2" size={size} defaultChecked aria-label="On" />,
            <Switch key="3" size={size} aria-invalid="true" aria-label="Invalid" />,
            <Switch key="4" size={size} disabled aria-label="Disabled" />,
            <Switch key="5" size={size} defaultChecked disabled aria-label="On disabled" />,
          ],
        }))}
      />
      {/* The one-index shift, visible: switch(n) stands level with checkbox(n + 1). */}
      <Flex gap="5" align="center" wrap="wrap">
        <Switch size="1" defaultChecked aria-label="Switch 1" />
        <Checkbox size="2" defaultChecked aria-label="Checkbox 2" />
        <Switch size="2" aria-label="Switch 2" />
        <RadioGroup defaultValue="a" aria-label="Radio row">
          <Radio value="a" size="2" aria-label="Radio 2" />
        </RadioGroup>
        <Slider size="2" defaultValue={60} aria-label="Slider 2" style={{ width: "160px" }} />
      </Flex>
    </Stack>
  );
}

function TextSection() {
  return (
    <Stack gap="6">
      <Stack gap="4">
        {RAMP.map((step) => (
          <Grid key={step} columns="64px minmax(0, 1fr)" gapX="5" align="center">
            <Text size="1" emphasis="medium">size {step}</Text>
            <Text
              size={step}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              The quick brown fox jumps over the lazy dog
            </Text>
          </Grid>
        ))}
      </Stack>
      <SpecTable
        wide
        cols={["Regular", "Medium", "Semibold", "Bold"]}
        rows={[
          {
            label: "weight",
            cells: (["regular", "medium", "semibold", "bold"] as const).map((w) => (
              <Text key={w} size="3" weight={w}>The quick brown fox</Text>
            )),
          },
        ]}
      />
      <SpecTable
        wide
        cols={["Loud", "Medium", "Quiet"]}
        rows={[
          {
            label: "emphasis",
            cells: [
              <Text key="1" size="3">Body text rests at full contrast.</Text>,
              <Text key="2" size="3" emphasis="medium">The muted role — secondary description.</Text>,
              <Text key="3" size="3" emphasis="quiet">The faint role — captions, placeholders.</Text>,
            ],
          },
        ]}
      />
      <Stack gap="2">
        {TONES.map((tone) => (
          <Grid key={tone} columns="64px minmax(0, 1fr)" gapX="5" align="center">
            <Text size="1" emphasis="medium">{tone}</Text>
            <Text size="2" tone={tone}>The quick brown fox jumps over the lazy dog</Text>
          </Grid>
        ))}
      </Stack>
    </Stack>
  );
}

function TextAreaSection() {
  return (
    <SpecTable
      wide
      cols={["Empty", "Value", "Invalid", "Disabled"]}
      rows={SIZES.map((size) => ({
        label: `size ${size}`,
        cells: [
          // Every specimen carries its own name (audit 2026-08-08): the mark sections all
          // passed aria-label and the two field sections passed nothing, so 24 controls on
          // this page had an empty accessible name — a placeholder is the accname spec's
          // last-resort fallback, and three of these four columns do not even have one.
          <TextArea
            key="1"
            size={size}
            rows={2}
            placeholder="Write a note…"
            aria-label={`Note, size ${size}, empty`}
          />,
          <TextArea
            key="2"
            size={size}
            rows={2}
            defaultValue="A paragraph of feedback."
            aria-label={`Note, size ${size}, with a value`}
          />,
          <TextArea
            key="3"
            size={size}
            rows={2}
            defaultValue="Too short."
            aria-invalid="true"
            aria-label={`Note, size ${size}, invalid`}
          />,
          <TextArea
            key="4"
            size={size}
            rows={2}
            defaultValue="Locked"
            disabled
            aria-label={`Note, size ${size}, disabled`}
          />,
        ],
      }))}
    />
  );
}

function TextFieldSection() {
  return (
    <Stack gap="6">
      <SpecTable
        wide
        cols={["Empty", "Slots", "Invalid", "Disabled", "Read only"]}
      rows={SIZES.map((size) => ({
        label: `size ${size}`,
        cells: [
          // Named for the same reason TextArea's are, one section over.
          <TextField
            key="1"
            size={size}
            placeholder="you@company.com"
            aria-label={`Email, size ${size}, empty`}
          />,
          <TextField
            key="2"
            size={size}
            placeholder="Search…"
            aria-label={`Search, size ${size}, with slots`}
            leading={<SearchIcon />}
            trailing={
              <Button size={size} iconOnly emphasis="quiet" aria-label="Clear">
                <XIcon />
              </Button>
            }
          />,
          <TextField
            key="3"
            size={size}
            defaultValue="not-an-email"
            aria-invalid="true"
            aria-label={`Email, size ${size}, invalid`}
          />,
          <TextField
            key="4"
            size={size}
            defaultValue="Locked"
            disabled
            aria-label={`Email, size ${size}, disabled`}
          />,
          <TextField
            key="5"
            size={size}
            defaultValue="ku-8841-veda"
            readOnly
            aria-label={`Reference, size ${size}, read only`}
          />,
        ],
      }))}
      />
      {/* The field family's glass, which had no specimen at all until 2026-08-08 — a shipped
          axis on two of the eleven components, on a page that claims every axis, with the
          hostile bed already built one section up and only Button and Card ever entering it.
          The slots matter here: an adornment sits ON the veil, which is where a wrong slot
          colour shows. */}
      <HostileBed>
        {(["thin", "regular", "thick"] as const).map((m) => (
          <TextField
            key={m}
            size="2"
            material={m}
            placeholder={m[0]!.toUpperCase() + m.slice(1)}
            aria-label={`Glass field, ${m}`}
            leading={<SearchIcon />}
            style={{ width: "170px" }}
          />
        ))}
      </HostileBed>
    </Stack>
  );
}

/**
 * The four layout primitives, in ONE section rather than four (2026-08-08).
 *
 * They had no section at all, on a page claiming every shipped component — four of the
 * sixteen value exports, and the four this page's own layout discipline is written about.
 * They share one section because they answer one question between them (how a box is placed
 * and spaced) and because four separate stubs would each show the same grey tiles: the
 * alphabetical rule is about finding things, and nobody looks up Stack without Flex.
 *
 * Every distance here is a layout-space step, never a pixel — the point of the specimen is
 * that the numbers come from the density scope, so switching density in the panel moves all
 * of it at once.
 */
const Tile = ({ children }: { children?: React.ReactNode }) => (
  <Box
    p="3"
    style={{ background: "var(--neutral-3)", borderRadius: "var(--radius-surface-1)" }}
  >
    <Text size="1">{children ?? "Box"}</Text>
  </Box>
);

function LayoutSection() {
  return (
    <Stack gap="6">
      <Stack gap="3">
        <Text size="1" emphasis="quiet">Flex — direction, gap, alignment</Text>
        <Flex gap="3" align="center" wrap="wrap">
          <Tile>One</Tile>
          <Tile>Two</Tile>
          <Tile>Three</Tile>
        </Flex>
      </Stack>
      <Stack gap="3">
        <Text size="1" emphasis="quiet">Stack — the column, gap from the same scale</Text>
        {/* Deliberately narrow: a Stack's items stretch, which is the arrangement that never
            meets the §2 containment collapse. The Flex row above is the one that would, and
            its items are Boxes with real padding rather than shrink-wrapping tiles. */}
        <Stack gap="2" style={{ maxWidth: "260px" }}>
          <Tile>First</Tile>
          <Tile>Second</Tile>
        </Stack>
      </Stack>
      <Stack gap="3">
        <Text size="1" emphasis="quiet">Grid — definite tracks, gapX and gapY apart</Text>
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="4" gapY="2">
          {["A", "B", "C", "D", "E", "F"].map((n) => (
            <Tile key={n}>{n}</Tile>
          ))}
        </Grid>
      </Stack>
      <Stack gap="3">
        <Text size="1" emphasis="quiet">Box — padding across the layout-space steps</Text>
        <Flex gap="3" align="start" wrap="wrap">
          {(["2", "4", "6"] as const).map((p) => (
            <Box
              key={p}
              p={p}
              style={{ background: "var(--neutral-3)", borderRadius: "var(--radius-surface-1)" }}
            >
              <Box style={{ background: "var(--neutral-6)", height: "24px", width: "56px" }} />
              <Text size="1" emphasis="medium">p={p}</Text>
            </Box>
          ))}
        </Flex>
      </Stack>
    </Stack>
  );
}

export const SECTIONS: { id: string; name: string; body: React.ReactNode }[] = [
  { id: "button", name: "Button", body: <ButtonSection /> },
  { id: "card", name: "Card", body: <CardSection /> },
  { id: "checkbox", name: "Checkbox", body: <CheckboxSection /> },
  { id: "heading", name: "Heading", body: <HeadingSection /> },
  { id: "layout", name: "Layout — Box, Flex, Grid, Stack", body: <LayoutSection /> },
  { id: "radio", name: "Radio", body: <RadioSection /> },
  { id: "separator", name: "Separator", body: <SeparatorSection /> },
  { id: "slider", name: "Slider", body: <SliderSection /> },
  { id: "spinner", name: "Spinner", body: <SpinnerSection /> },
  { id: "switch", name: "Switch", body: <SwitchSection /> },
  { id: "text", name: "Text", body: <TextSection /> },
  { id: "text-area", name: "Text area", body: <TextAreaSection /> },
  { id: "text-field", name: "Text field", body: <TextFieldSection /> },
];
