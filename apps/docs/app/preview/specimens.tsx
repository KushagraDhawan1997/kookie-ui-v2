"use client";

/**
 * The playground sections — the Radix Themes playground's structure in KookieUI vocabulary:
 * ONE long page, one section per component in alphabetical order, each section a handful of
 * dense specimen tables. Where Radix varies `variant × (accent | gray | disabled)`, we vary
 * the axes this system actually has: emphasis rungs, tones, sizes, states. Components we do
 * not ship yet simply do not appear; nothing is tabbed, everything is flat.
 *
 * Layout discipline: containment is OPT-IN since 2026-08-08 (§2, the `container` prop), so a
 * plain Box hugs its content like a div and the old rule — "a Box collapses to zero wherever
 * it must shrink-wrap" — now applies only to a Box that opted in. The definite grid tracks
 * throughout this file predate that and stay as layout choices, not workarounds.
 */
import * as React from "react";
import {
  Blockquote,
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Flex,
  Grid,
  Heading,
  Kbd,
  Progress,
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
 * surfaces argue about one photograph. Tall enough for varied luminance behind the glass
 * (thin/regular/thick need it to read as different materials), no taller — the first cut ran
 * 320px with the specimens loose in a corner, and the bed read as a photo the controls had
 * wandered onto rather than a specimen (2026-08-08). Centered both axes for the same reason.
 */
function HostileBed({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      justify="center"
      gap="5"
      wrap="wrap"
      p="6"
      style={{
        backgroundImage: "url(/backdrop.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "var(--radius-surface-3)",
        minHeight: "240px",
      }}
    >
      {children}
    </Flex>
  );
}

/* ── Sections, alphabetical ────────────────────────────────────────────────────────────── */

function BlockquoteSection() {
  return (
    <Stack gap="6">
      {/* Two things to judge, both v0: the rule's THICKNESS (--border-width, the system's one
          hairline — a second one would be a self-invented width) and the indent's ratio to
          the type. Both hold across the ramp by construction; what the eye decides is whether
          1em is the right distance and whether a hairline is enough of a bar. */}
      <Stack gap="5">
        {(["2", "3", "4", "6"] as const).map((size) => (
          <Blockquote key={size} size={size}>
            Taste is the last layer. If the infrastructure is right, taste can be added later.
          </Blockquote>
        ))}
      </Stack>
      {/* Tone re-scopes the INK and leaves the rule alone (§11's rule for the type family).
          A quote whose bar carries meaning is a Callout, which is a tone-forward surface. */}
      <SpecTable
        wide
        cols={["Quote"]}
        rows={(["neutral", "accent", "destructive", "success"] as const).map((tone) => ({
          label: tone,
          cells: [
            <Blockquote key="1" size="2" tone={tone}>
              The words take the family; the rule stays the quiet hairline.
            </Blockquote>,
          ],
        }))}
      />
      {/* The attribution is a SIBLING, not an anatomy slot — nothing non-visual forces one. */}
      <Card size="3">
        <Stack gap="3">
          <Blockquote size="3">
            An axis is proven by a law that reads a computed token through a mounted Theme in
            both appearances.
          </Blockquote>
          <Text size="1" emphasis="medium">— CLAUDE.md, the standing rule</Text>
        </Stack>
      </Card>
    </Stack>
  );
}

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

function CodeSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge: an inline atom with no `size` takes the line it sits in. Every
          row below sets the step on the TEXT only — the chips and caps are bare. If one of
          them ever stops matching its sentence, this is where it shows. */}
      <Stack gap="3">
        {SIZES.map((size) => (
          <Text key={size} size={size}>
            Run <Code>pnpm run ci</Code> before claiming a task done, or press <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> to search.
          </Text>
        ))}
      </Stack>
      {/* Tone reaches BOTH of an atom's colours — the fill as well as the ink — which is the
          one place this family diverges from Text (a chip has a second thing to tint). */}
      <SpecTable
        cols={["Code", "Kbd"]}
        rows={TONES.map((tone) => ({
          label: tone,
          cells: [
            <Code key="1" size="2" tone={tone}>--tone-soft</Code>,
            <Kbd key="2" size="2" tone={tone}>Esc</Kbd>,
          ],
        }))}
      />
      {/* Emphasis is the INK's axis here, not the fill's: the wash holds while the glyphs
          step down. A chip whose fill climbed the ladder would be reading one axis two ways. */}
      <SpecTable
        cols={["loud", "medium", "quiet"]}
        rows={[
          {
            label: "code",
            cells: [
              <Code key="1" size="2" emphasis="loud">const x = 1</Code>,
              <Code key="2" size="2" emphasis="medium">const x = 1</Code>,
              <Code key="3" size="2" emphasis="quiet">const x = 1</Code>,
            ],
          },
          {
            label: "kbd",
            cells: [
              <Kbd key="1" size="2" emphasis="loud">Shift</Kbd>,
              <Kbd key="2" size="2" emphasis="medium">Shift</Kbd>,
              <Kbd key="3" size="2" emphasis="quiet">Shift</Kbd>,
            ],
          },
        ]}
      />
      {/* The wrapped-chip case: an inline fill paints only its first fragment by default, so
          this narrow column is the specimen that would catch it regressing. */}
      <Card size="3">
        <Box style={{ maxWidth: "220px" }}>
          <Text size="2">
            The flag is <Code>--experimental-strip-types</Code> and it wraps here on purpose.
          </Text>
        </Box>
      </Card>
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

function ProgressSection() {
  return (
    <Stack gap="6">
      {/* The one thing to judge here is the THICKNESS, because it is the one designed number
          and it has no axis to hide behind: 6px, chosen one step above the default rail's 5
          on the argument that a bar has no grip to lend it presence. Flip density and pointer
          in the panel — nothing here may move, which is the claim the absent size axis rests
          on. Flip `look`: nothing moves there either (§19, the instrument rule). Flip radius
          to `none` and the caps square with everything else on the page. */}
      <SpecTable
        wide
        cols={["Empty", "Part way", "Nearly done", "Complete"]}
        rows={[
          {
            label: "value",
            cells: [
              <Progress key="1" value={0} aria-label="Empty" />,
              <Progress key="2" value={35} aria-label="Part way" />,
              <Progress key="3" value={85} aria-label="Nearly done" />,
              <Progress key="4" value={100} aria-label="Complete" />,
            ],
          },
          {
            label: "min/max",
            cells: [
              <Progress key="1" value={0} min={0} max={8} aria-label="0 of 8" />,
              <Progress key="2" value={3} min={0} max={8} aria-label="3 of 8" />,
              <Progress key="3" value={7} min={0} max={8} aria-label="7 of 8" />,
              <Progress key="4" value={8} min={0} max={8} aria-label="8 of 8" />,
            ],
          },
        ]}
      />
      {/* Indeterminate, and beside a Spinner on purpose: they are the same category of motion
          (content, not a state change) and should read as one system's answer to "busy". */}
      <Card size="3">
        <Stack gap="4">
          <Flex gap="3" align="center">
            <Spinner />
            <Text size="2" weight="medium">Indeterminate — the task has no measurable extent</Text>
          </Flex>
          <Progress value={null} aria-label="Loading" />
          <Text size="1" emphasis="quiet">
            Slowed under prefers-reduced-motion, never stopped — a busy indicator that stops
            moving is information lost.
          </Text>
        </Stack>
      </Card>
      {/* The bar in the composition it actually ships in: a label row above, the bar below,
          the Stack's gap carrying the distance. The bar brings no spacing of its own. */}
      <Card size="3">
        <Stack gap="3">
          {/* `justify` is raw justify-content (§3): the value is the CSS keyword, and
              "between" — Radix's shorthand — resolves to nothing. Committed here first;
              the label and its percentage rendered glued together. */}
          <Flex justify="space-between" align="center">
            <Text size="2" weight="medium">Uploading assets</Text>
            <Text size="2" emphasis="medium">62%</Text>
          </Flex>
          <Progress value={62} aria-label="Uploading assets" />
        </Stack>
      </Card>
      {/* Extent is the container's: a narrower Box gives a narrower bar, no prop involved.
          The widths exist to give the demo two different containers to prove it. */}
      <Flex gap="6" align="end">
        {(["120px", "240px"] as const).map((w) => (
          <Stack key={w} gap="2" style={{ width: w }}>
            <Text size="1" emphasis="quiet">{w} box</Text>
            <Progress value={45} aria-label={`Bar in a ${w} box`} />
          </Stack>
        ))}
      </Flex>
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
      {/* Definite tracks for even rhythm between the pairs. (Historical: under the old
          blanket containment a labelled pair in a row Flex collapsed to zero — committed
          here, caught on sight; opt-in since 2026-08-08 makes loose pairs legal too.) */}
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
            placeholder="Email"
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
  // No stated width: a plain Box hugs its content since containment went opt-in (§2,
  // 2026-08-08). These tiles shipped collapsed to slivers under the blanket mark — the
  // real break that closed the decision — so their natural fit here IS the specimen.
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
        {/* A Stack's items stretch — the column hands each tile its width. */}
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
              style={{
                width: "140px",
                background: "var(--neutral-3)",
                borderRadius: "var(--radius-surface-1)",
              }}
            >
              {/* The filler stretches to the content box, so the visible frame around it IS
                  the padding being demonstrated. */}
              <Box style={{ background: "var(--neutral-6)", height: "24px" }} />
              <Text size="1" emphasis="medium">p={p}</Text>
            </Box>
          ))}
        </Flex>
      </Stack>
      <Stack gap="3">
        <Text size="1" emphasis="quiet">
          Box container — the region a responsive value measures (§2, opt-in)
        </Text>
        {/* One responsive value, two marked regions: the inner Box asks its nearest
            `container` ancestor how wide it is, so the same p={"{ initial: 2, sm: 7 }"}
            renders tight in the narrow region and airy in the wide one — on the same
            screen, which is what container-keyed means. The stated widths on the marked
            Boxes are the prop's own rule: a container's width comes from outside. */}
        <Stack gap="3">
          {(["220px", "560px"] as const).map((w) => (
            <Box
              key={w}
              container
              width={w}
              style={{
                background: "var(--neutral-3)",
                borderRadius: "var(--radius-surface-1)",
              }}
            >
              <Box p={{ initial: "2", sm: "7" }}>
                <Box
                  p="2"
                  style={{
                    background: "var(--neutral-6)",
                    borderRadius: "var(--radius-surface-1)",
                  }}
                >
                  <Text size="1">
                    p={"{ initial: 2, sm: 7 }"} in a {w} container
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export const SECTIONS: { id: string; name: string; body: React.ReactNode }[] = [
  { id: "blockquote", name: "Blockquote", body: <BlockquoteSection /> },
  { id: "button", name: "Button", body: <ButtonSection /> },
  { id: "card", name: "Card", body: <CardSection /> },
  { id: "checkbox", name: "Checkbox", body: <CheckboxSection /> },
  { id: "code", name: "Code and Kbd", body: <CodeSection /> },
  { id: "heading", name: "Heading", body: <HeadingSection /> },
  { id: "layout", name: "Layout — Box, Flex, Grid, Stack", body: <LayoutSection /> },
  { id: "progress", name: "Progress", body: <ProgressSection /> },
  { id: "radio", name: "Radio", body: <RadioSection /> },
  { id: "separator", name: "Separator", body: <SeparatorSection /> },
  { id: "slider", name: "Slider", body: <SliderSection /> },
  { id: "spinner", name: "Spinner", body: <SpinnerSection /> },
  { id: "switch", name: "Switch", body: <SwitchSection /> },
  { id: "text", name: "Text", body: <TextSection /> },
  { id: "text-area", name: "Text area", body: <TextAreaSection /> },
  { id: "text-field", name: "Text field", body: <TextFieldSection /> },
];
