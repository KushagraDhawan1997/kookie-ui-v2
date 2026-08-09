"use client";

/**
 * The playground sections — the Radix Themes playground's structure in KookieUI vocabulary:
 * ONE long page, one section per component in alphabetical order. Where Radix varies
 * `variant × (accent | gray | disabled)`, we vary the axes this system actually has:
 * emphasis rungs, tones, sizes, states.
 *
 * Two rules of taste, learned by shipping their violations (2026-08-08):
 *
 * 1. Specimens wear REAL content. A matrix of forty cells all reading "Button" is a spec
 *    sheet; "Save / Cancel / Delete" in the same cells is a product. The matrices stay
 *    exhaustive — they are the audit surface — but the words in them are words an app
 *    would ship.
 * 2. Every section closes on ONE composed example: the component doing its actual job
 *    beside its neighbours (a settings list, a sign-in card, an upload row). That example
 *    is where "does this look right beside the others" gets answered; the matrix above it
 *    is where "is this cell right" does.
 *
 * Layout discipline: containment is OPT-IN since 2026-08-08 (§2, the `container` prop), so a
 * plain Box hugs its content like a div. The definite grid tracks throughout are layout
 * choices, not workarounds.
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
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
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

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/* ── Table machinery ───────────────────────────────────────────────────────────────────── */

type Row = { label: string; cells: React.ReactNode[] };

/**
 * A specimen table: column headers across the top, a row label down the side, one specimen
 * per cell. `wide` switches the tracks from max-content (bare controls, intrinsic width) to
 * 1fr (fields, sliders, composite cells). Labels are the QUIET role on purpose — the table
 * chrome recedes so the specimens carry the page.
 */
function SpecTable({ cols, rows, wide = false }: { cols: string[]; rows: Row[]; wide?: boolean }) {
  const track = wide ? "minmax(0, 1fr)" : "minmax(0, max-content)";
  return (
    // Explicit both-axis alignment: grid items default to STRETCH, which warps any square
    // control to its column's widest cell (a size-1 icon button inflated to the size-4
    // cell's 51px, found by probe). Wide tables keep stretch on the inline axis — a field
    // should fill its track.
    <Grid
      columns={`72px repeat(${cols.length}, ${track})`}
      gapX="5"
      gapY="4"
      style={{ alignItems: "center", justifyItems: wide ? "stretch" : "start" }}
    >
      <span />
      {cols.map((col) => (
        <Text key={col} size="1" emphasis="quiet">
          {col}
        </Text>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <Text size="1" emphasis="quiet">
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
 * surfaces argue about one photograph. Tall enough for varied luminance behind the glass,
 * no taller — the first cut ran 320px with the specimens loose in a corner, and the bed read
 * as a photo the controls had wandered onto rather than a specimen (2026-08-08). Centered
 * both axes for the same reason.
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

/** A quiet caption above a composed example — the one label style the whole page uses. */
function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text size="1" emphasis="quiet">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/* ── Cross-family sections ─────────────────────────────────────────────────────────────── */

/**
 * Every control at one index, in one row (2026-08-09).
 *
 * The per-component tables each sweep their own sizes, and not one of them can show the thing
 * a size index actually promises: that `size="3"` means the same thing to a button, a field, a
 * select, a checkbox and a switch — five ladders joined at one index (§4). A control that drifts
 * half a step is invisible in its own table, where every neighbour drifted with it, and obvious
 * here, where the row has a baseline.
 *
 * Four rows, not a grid: the row IS the specimen. Flip density or pointer in the panel and all
 * four re-price at once — the two axes that move the ladder without touching the index.
 */
function SizesSection() {
  const items = { s: "Small", m: "Medium", l: "Large" };
  return (
    <Stack gap="6">
      {SIZES.map((size) => (
        <Stack key={size} gap="3">
          <Text size="1" emphasis="quiet">size {size}</Text>
          <Flex gap="4" align="center" wrap="wrap">
            <Button size={size} tone="accent" emphasis="loud">Save</Button>
            <Button size={size} emphasis="quiet" bordered>Cancel</Button>
            <Button size={size} iconOnly emphasis="quiet" bordered aria-label={`Search, size ${size}`}>
              <SearchIcon />
            </Button>
            <Box width="8rem">
              <TextField size={size} placeholder="Name" aria-label={`Name, size ${size}`} />
            </Box>
            <Select size={size} defaultValue="m" items={items}>
              <SelectTrigger placeholder="Pick" aria-label={`Pick, size ${size}`} />
              <SelectContent>
                <SelectItem value="s">Small</SelectItem>
                <SelectItem value="m">Medium</SelectItem>
                <SelectItem value="l">Large</SelectItem>
              </SelectContent>
            </Select>
            <Menu size={size}>
              <MenuTrigger render={<Button size={size} emphasis="medium">Actions</Button>} />
              <MenuContent>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem>Rename</MenuItem>
                <Separator />
                <MenuItem tone="destructive">Delete</MenuItem>
              </MenuContent>
            </Menu>
            <Checkbox size={size} defaultChecked aria-label={`Checkbox, size ${size}`} />
            <RadioGroup defaultValue="a" aria-label={`Radio, size ${size}`}>
              <Radio size={size} value="a" aria-label={`Radio, size ${size}`} />
            </RadioGroup>
            <Switch size={size} defaultChecked aria-label={`Switch, size ${size}`} />
            <Box width="6rem">
              <Slider size={size} defaultValue={60} aria-label={`Slider, size ${size}`} />
            </Box>
            {/* Kbd stands in for the type atoms: it is the one that has a BOX, so it is the
                one the ladder can be wrong about. Code was here and made the row wrap at
                sizes 3 and 4, which cost more than it showed. */}
            <Kbd size={size}>⌘K</Kbd>
          </Flex>
        </Stack>
      ))}
      {/* The row inside a card, which is where the ladder is actually judged: a toolbar is
          the composition that puts four families on one line in a real product. */}
      <Demo label="Composed — one toolbar per size">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Card key={size} size="2">
              <Flex gap="3" align="center" wrap="wrap">
                <Box flexGrow="1" minWidth="10rem">
                  <TextField
                    size={size}
                    placeholder="Filter results"
                    leading={<SearchIcon />}
                    aria-label={`Filter, size ${size}`}
                  />
                </Box>
                <Select size={size} defaultValue="m" items={items}>
                  <SelectTrigger placeholder="Sort" aria-label={`Sort, size ${size}`} />
                  <SelectContent>
                    <SelectItem value="s">Newest</SelectItem>
                    <SelectItem value="m">Oldest</SelectItem>
                    <SelectItem value="l">Name</SelectItem>
                  </SelectContent>
                </Select>
                <Button size={size} tone="accent" emphasis="loud" leading={<PlusIcon />}>New</Button>
              </Flex>
            </Card>
          ))}
        </Stack>
      </Demo>
    </Stack>
  );
}

/**
 * The ten families across every component that resolves one (2026-08-09).
 *
 * Same argument as the size row: `tone` is one indirection consumed by fills, inks, edges and
 * chips, and a family whose ink and whose solid disagree is only visible when they are printed
 * beside each other. The mark family is deliberately absent — §11 gives it one identity
 * (neutral off, accent on) rather than an axis, so there is nothing here to sweep.
 */
function TonesSection() {
  return (
    <Stack gap="6">
      <SpecTable
        wide
        cols={["Loud", "Medium", "Quiet + border", "Text", "Code", "Kbd"]}
        rows={TONES.map((tone) => ({
          label: tone,
          cells: [
            <Button key="1" tone={tone} emphasis="loud">{cap(tone)}</Button>,
            <Button key="2" tone={tone} emphasis="medium">{cap(tone)}</Button>,
            <Button key="3" tone={tone} emphasis="quiet" bordered>{cap(tone)}</Button>,
            <Text key="4" size="2" tone={tone}>{cap(tone)} ink</Text>,
            <Code key="5" tone={tone}>{tone}</Code>,
            <Kbd key="6" tone={tone}>⌘{cap(tone)[0]}</Kbd>,
          ],
        }))}
      />
      {/* Tone as data, in the shape a product uses it: a status line per family, where the
          question is whether ten of these in one column still read as one system. */}
      <Demo label="Composed — a status list">
        <Box maxWidth="30rem">
          <Card size="3">
            <Stack gap="4">
              {(
                [
                  ["success", "Deploy succeeded", "Live in 3 regions."],
                  ["warning", "Certificate expiring", "Renews automatically in 6 days."],
                  ["destructive", "Build failed", "2 packages did not compile."],
                  ["info", "New region available", "eu-central-2 is open for preview."],
                ] as const
              ).map(([tone, label, description]) => (
                <Flex key={tone} gap="4" align="flex-start" justify="space-between">
                  <Stack gap="1">
                    <Text size="2" weight="medium" tone={tone}>{label}</Text>
                    <Text size="1" emphasis="medium">{description}</Text>
                  </Stack>
                  <Button size="1" tone={tone} emphasis="quiet" bordered>Details</Button>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

/* ── Sections, alphabetical ────────────────────────────────────────────────────────────── */

function BlockquoteSection() {
  return (
    <Stack gap="6">
      {/* What the eye judges, both v0: the rule's thickness (--border-width, the system's one
          hairline) and the 1em indent's ratio to the type. */}
      <Stack gap="5">
        {(["2", "3", "5"] as const).map((size) => (
          <Blockquote key={size} size={size}>
            Taste is the last layer. If the infrastructure is right, taste can be added later.
          </Blockquote>
        ))}
      </Stack>
      {/* Tone re-scopes the INK and leaves the rule alone (§11's rule for the type family).
          A quote whose bar carries meaning is a Callout, which is a tone-forward surface. */}
      <SpecTable
        wide
        cols={["Tone reaches the words, never the rule"]}
        rows={(["accent", "destructive", "success"] as const).map((tone) => ({
          label: tone,
          cells: [
            <Blockquote key="1" size="2" tone={tone}>
              The words take the family; the rule stays the quiet hairline.
            </Blockquote>,
          ],
        }))}
      />
      {/* The attribution is a SIBLING, not an anatomy slot — nothing non-visual forces one. */}
      <Demo label="With attribution">
        <Card size="3">
          <Stack gap="3">
            <Blockquote size="3">
              Design is not just what it looks like and feels like. Design is how it works.
            </Blockquote>
            <Text size="1" emphasis="medium">— Steve Jobs</Text>
          </Stack>
        </Card>
      </Demo>
    </Stack>
  );
}

function ButtonSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Accent", "Neutral", "Destructive", "Disabled"]}
        rows={(
          [
            ["loud", { emphasis: "loud" }],
            ["medium", { emphasis: "medium" }],
            ["medium +", { emphasis: "medium", bordered: true }],
            ["quiet", { emphasis: "quiet" }],
            ["quiet +", { emphasis: "quiet", bordered: true }],
          ] as const
        ).map(([label, props]) => ({
          label,
          cells: [
            <Button key="a" tone="accent" {...props}>Save</Button>,
            <Button key="n" {...props}>Cancel</Button>,
            <Button key="d" tone="destructive" {...props}>Delete</Button>,
            <Button key="x" tone="accent" {...props} disabled>Save</Button>,
          ],
        }))}
      />
      <SpecTable
        cols={["Loud", "Medium", "Quiet", "Leading", "Icon only", "Loading"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Button key="l" size={size} tone="accent" emphasis="loud">Continue</Button>,
            <Button key="m" size={size} emphasis="medium">Preview</Button>,
            <Button key="q" size={size} emphasis="quiet" bordered>Dismiss</Button>,
            <Button key="i" size={size} emphasis="medium" leading={<PlusIcon />}>New</Button>,
            <Button key="o" size={size} iconOnly emphasis="quiet" bordered aria-label="Search"><SearchIcon /></Button>,
            <Button key="s" size={size} tone="accent" emphasis="loud" loading>Saving</Button>,
          ],
        }))}
      />
      {/* The cell wears its own tone name: the sweep labels itself, and a wrong resolution
          reads as a wrong word in a wrong colour — twice the signal of "Button" forty times. */}
      <SpecTable
        cols={["Loud", "Medium", "Medium +", "Quiet", "Quiet +"]}
        rows={TONES.map((tone) => ({
          label: tone,
          cells: [
            <Button key="1" tone={tone} emphasis="loud">{cap(tone)}</Button>,
            <Button key="2" tone={tone} emphasis="medium">{cap(tone)}</Button>,
            <Button key="3" tone={tone} emphasis="medium" bordered>{cap(tone)}</Button>,
            <Button key="4" tone={tone} emphasis="quiet">{cap(tone)}</Button>,
            <Button key="5" tone={tone} emphasis="quiet" bordered>{cap(tone)}</Button>,
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
      {/* Identical content in all four so the only variable is the size's padding pick. */}
      <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
        {SIZES.map((size) => (
          <Card key={size} size={size}>
            <Stack gap="1">
              <Text size="2" weight="medium">Nightly build</Text>
              <Text size="1" emphasis="medium">1,024 laws green in 41s.</Text>
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
      {/* The card doing its job: a plain surface holding real anatomy built from SIBLINGS —
          heading, body, actions — because layouts are blocks, not slots.

          Rebuilt 2026-08-09 (Kushagra, on the shipped version: "this isn't [tasteful]"). Three
          faults, all composition rather than component: a 14px title over a 12px body reads as
          a caption pair, not a heading and its paragraph; size-1 buttons in a size-3 card are
          two rungs under the box they sit in; and a rule spanning the full card under a
          right-aligned pair draws a line where nothing is being divided. Title is a Heading,
          the body is size 2, the buttons take the default, and the distance does the
          separating — which is what a Stack gap is for. */}
      <Demo label="Composed — a confirm card">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Delete workspace</Heading>
                <Text size="2" emphasis="medium">
                  Removes every project, member, and API key. This cannot be undone.
                </Text>
              </Stack>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Keep it</Button>
                <Button tone="destructive" emphasis="loud">Delete</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>
      <HostileBed>
        {(["thin", "regular", "thick"] as const).map((m) => (
          <Card key={m} size="2" material={m} style={{ width: "180px" }}>
            <Stack gap="1">
              <Text size="2" weight="medium">{cap(m)}</Text>
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
        cols={["Off", "On", "Mixed", "Invalid", "On, invalid", "Disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Checkbox key="1" size={size} aria-label="Off" />,
            <Checkbox key="2" size={size} defaultChecked aria-label="On" />,
            <Checkbox key="3" size={size} indeterminate aria-label="Mixed" />,
            <Checkbox key="4" size={size} aria-invalid="true" aria-label="Invalid" />,
            <Checkbox key="4b" size={size} aria-invalid="true" defaultChecked aria-label="On, invalid" />,
            <Checkbox key="5" size={size} disabled aria-label="Disabled" />,
            <Checkbox key="6" size={size} defaultChecked disabled aria-label="On disabled" />,
          ],
        }))}
      />
      {/* Stacked marks need 12 real pixels (§4); the Stack's gap 5 is the smallest index
          that holds it, and the mark tops a row whose description wraps below the label. */}
      <Demo label="Composed — a task list">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="5">
              {(
                [
                  ["pg-cb-0", "Run the laws", "Every mounted law, both appearances.", true],
                  ["pg-cb-1", "Re-record the budget", "Only when growth is intentional.", false],
                  ["pg-cb-2", "Ship the handover", "One plain-English file for the reviewer.", false],
                ] as const
              ).map(([id, label, description, checked]) => (
                <Flex key={id} gap="3" align="flex-start">
                  <Checkbox defaultChecked={checked} id={id} />
                  <Stack gap="1">
                    <Text size="2" weight="medium" render={<label htmlFor={id} />}>{label}</Text>
                    <Text size="1" emphasis="medium">{description}</Text>
                  </Stack>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function CodeSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge: an inline atom with no `size` takes the line it sits in. Every
          row sets the step on the TEXT only — the chips and caps are bare. */}
      <Stack gap="3">
        {SIZES.map((size) => (
          <Text key={size} size={size}>
            Run <Code>pnpm run ci</Code> before claiming a task done, or press <Kbd>⌘K</Kbd> to
            search.
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
      <Demo label="Wrapping">
        <Box maxWidth="26rem">
          <Card size="3">
            <Text size="2">
              Pass <Code>--experimental-strip-types</Code> to run TypeScript directly; the chip
              wraps here on purpose.
            </Text>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function HeadingSection() {
  return (
    <Stack gap="4">
      {RAMP.map((step) => (
        <Grid key={step} columns="72px minmax(0, 1fr)" gapX="5" align="center">
          <Text size="1" emphasis="quiet">size {step}</Text>
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
      {/* The one thing to judge is the THICKNESS — the one designed number, no axis to hide
          behind (6px, one step above the default rail's 5: a bar has no grip to lend it
          presence). Flip density, pointer, or look in the panel — nothing here may move. */}
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
      {/* Extent is the container's: a narrower box gives a narrower bar, no prop involved. */}
      <Flex gap="6" align="flex-end">
        {(["120px", "240px"] as const).map((w) => (
          <Stack key={w} gap="2" width={w}>
            <Text size="1" emphasis="quiet">{w} box</Text>
            <Progress value={45} aria-label={`Bar in a ${w} box`} />
          </Stack>
        ))}
      </Flex>
      {/* The bar in the composition it ships in — label row, bar, caption, the Stack's gap
          carrying every distance. Indeterminate sits beside a Spinner on purpose: the same
          category of motion (content, not a state change), one system answer to "busy". */}
      <Demo label="Composed — busy states">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5">
          <Card size="3">
            <Stack gap="3">
              {/* `justify` is raw justify-content (§3): CSS keywords only — "between",
                  Radix's shorthand, resolves to nothing and glued this row together once. */}
              <Flex justify="space-between" align="center">
                <Text size="2" weight="medium">Uploading assets</Text>
                <Text size="2" emphasis="medium">62%</Text>
              </Flex>
              <Progress value={62} aria-label="Uploading assets" />
              <Text size="1" emphasis="quiet">14 of 23 files · 2 min left</Text>
            </Stack>
          </Card>
          <Card size="3">
            <Stack gap="3">
              <Flex gap="2" align="center">
                <Spinner />
                <Text size="2" weight="medium">Indexing the repository</Text>
              </Flex>
              <Progress value={null} aria-label="Indexing" />
              <Text size="1" emphasis="quiet">No measurable extent — slowed, never stopped.</Text>
            </Stack>
          </Card>
        </Grid>
      </Demo>
    </Stack>
  );
}

function RadioSection() {
  return (
    <Stack gap="6">
      <SpecTable
        cols={["Selected", "Unselected", "Invalid", "Selected, invalid", "Disabled"]}
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
            <RadioGroup key="3b" defaultValue="a" aria-label="Selected, invalid">
              <Radio size={size} value="a" aria-invalid="true" aria-label="Selected, invalid" />
            </RadioGroup>,
            <RadioGroup key="4" disabled defaultValue="a" aria-label="Disabled">
              <Radio size={size} value="a" aria-label="Disabled" />
            </RadioGroup>,
          ],
        }))}
      />
      {/* One choice among named things — the mark starts the row, the description wraps
          under its own label, and the 12px stacking rule (§4) rides the Stack's gap. */}
      <Demo label="Composed — a plan picker">
        <Box maxWidth="26rem">
          <Card size="3">
            <RadioGroup defaultValue="pro" aria-label="Plan">
              <Stack gap="5">
                {(
                  [
                    ["starter", "Starter", "Three projects, community support."],
                    ["pro", "Pro", "Unlimited projects, priority support."],
                    ["scale", "Scale", "SSO, audit log, dedicated region."],
                  ] as const
                ).map(([value, label, description]) => (
                  <Flex key={value} gap="3" align="flex-start">
                    <Radio value={value} id={`pg-rd-${value}`} />
                    <Stack gap="1">
                      <Text size="2" weight="medium" render={<label htmlFor={`pg-rd-${value}`} />}>
                        {label}
                      </Text>
                      <Text size="1" emphasis="medium">{description}</Text>
                    </Stack>
                  </Flex>
                ))}
              </Stack>
            </RadioGroup>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function MenuSection() {
  /** One canonical content set, reused at every size so the judgment is about the cells,
      not the words: a file menu with groups, checkables, a submenu and a destructive tail. */
  const content = (
    <>
      <MenuGroup>
        <MenuLabel>File</MenuLabel>
        <MenuItem trailing={<Kbd size="1">⌘D</Kbd>}>Duplicate</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuItem disabled>Move to…</MenuItem>
      </MenuGroup>
      <Separator />
      <MenuCheckboxItem defaultChecked>Show hidden files</MenuCheckboxItem>
      <MenuCheckboxItem>Compact list</MenuCheckboxItem>
      <Separator />
      <MenuRadioGroup defaultValue="name">
        <MenuLabel>Sort by</MenuLabel>
        <MenuRadioItem value="name">Name</MenuRadioItem>
        <MenuRadioItem value="date">Date modified</MenuRadioItem>
      </MenuRadioGroup>
      <Separator />
      <MenuSub>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
          <MenuItem>SVG</MenuItem>
          <MenuItem>PDF</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuItem tone="destructive">Delete…</MenuItem>
    </>
  );

  return (
    <Stack gap="6">
      {/* Size row: the menu answers the index its trigger wears — open each and judge the
          rows against the button beside it (§22: a size-4 button never opens a size-2
          dropdown). Click to open; menus are judged live, not pinned. */}
      <SpecTable
        cols={["Trigger + menu"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Menu key="m" size={size}>
              <MenuTrigger render={<Button size={size} emphasis="medium">Actions</Button>} />
              <MenuContent>{content}</MenuContent>
            </Menu>,
          ],
        }))}
      />
      {/* Glass: the popup floats over content by definition, which is the case the material
          was built for — and a glass menu still casts the floating chrome in a flat world. */}
      <Demo label="Materials — over the hostile backdrop">
        <HostileBed>
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Solid</Button>} />
            <MenuContent>{content}</MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Thin glass</Button>} />
            <MenuContent material="thin">{content}</MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Thick glass</Button>} />
            <MenuContent material="thick">{content}</MenuContent>
          </Menu>
        </HostileBed>
      </Demo>
      {/* The §6 judging surface: the panel's CONCENTRIC corner (rows' corner + padding) beside
          the card's surface-3 — open the menu over the card and read the radii as one system. */}
      <Demo label="Composed — a document header, menu beside its card">
        <Box maxWidth="26rem">
          <Card size="3">
            <Flex justify="space-between" align="center" gap="4">
              <Stack gap="1">
                <Text size="2" weight="medium">Q3 planning.md</Text>
                <Text size="1" emphasis="medium">Edited 2 hours ago</Text>
              </Stack>
              <Menu>
                <MenuTrigger render={<Button emphasis="quiet" iconOnly aria-label="Actions"><PlusIcon /></Button>} />
                <MenuContent align="end">{content}</MenuContent>
              </Menu>
            </Flex>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function SelectSection() {
  /** One canonical option set at every size: two groups and a disabled row — the menu
      section's discipline, so the judgment is about the cells.

      No Separator between the groups (audit 2026-08-09). It was here, and it was the shape
      that proved the composition is illegal: the panel IS the listbox, a listbox may hold
      only options and groups, and an accessibility scan reported exactly that — from
      library markup a consumer cannot fix from outside. The GROUP is the divider a listbox
      has, and it divides in the accessibility tree too. */
  const content = (
    <>
      <SelectGroup>
        <SelectLabel>Fruit</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry" disabled>
          Cherry (out of season)
        </SelectItem>
      </SelectGroup>
      <SelectGroup>
        <SelectLabel>Vegetables</SelectLabel>
        <SelectItem value="carrot">Carrot</SelectItem>
        <SelectItem value="leek">Leek</SelectItem>
      </SelectGroup>
    </>
  );
  const items = {
    apple: "Apple",
    banana: "Banana",
    cherry: "Cherry (out of season)",
    carrot: "Carrot",
    leek: "Leek",
  };

  return (
    <Stack gap="6">
      {/* Size row, each beside the TextField it must read as one family with (§23: the
          trigger wears the field identity — same seal, edge, height, corner). */}
      <SpecTable
        cols={["Select", "TextField beside it"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Select key="s" size={size} defaultValue="banana" items={items}>
              <SelectTrigger placeholder="Pick one" />
              <SelectContent>{content}</SelectContent>
            </Select>,
            <TextField key="t" size={size} placeholder="Type here" />,
          ],
        }))}
      />
      {/* Empty vs chosen: the placeholder INVITES in the faint role; a value is content. */}
      <Demo label="Placeholder, value, disabled">
        <Flex gap="4" align="center">
          <Select items={items}>
            <SelectTrigger placeholder="Pick a fruit" />
            <SelectContent>{content}</SelectContent>
          </Select>
          <Select defaultValue="apple" items={items}>
            <SelectTrigger placeholder="Pick a fruit" />
            <SelectContent>{content}</SelectContent>
          </Select>
          <Select defaultValue="apple" items={items} disabled>
            <SelectTrigger placeholder="Pick a fruit" />
            <SelectContent>{content}</SelectContent>
          </Select>
        </Flex>
      </Demo>
      {/* Glass panel over the hostile backdrop — the floating chrome must survive it. The
          TRIGGER's own material is here too (2026-08-09): it is the case the axis exists
          for, and until the prop shipped this bed showed an opaque white dropdown beside a
          translucent TextField, which is the defect rather than the specimen. */}
      <Demo label="Materials — over the hostile backdrop">
        <HostileBed>
          <Select items={items}>
            <SelectTrigger placeholder="Solid" />
            <SelectContent>{content}</SelectContent>
          </Select>
          <Select items={items}>
            <SelectTrigger placeholder="Thin glass" />
            <SelectContent material="thin">{content}</SelectContent>
          </Select>
          <Select items={items}>
            <SelectTrigger placeholder="Glass trigger" material="regular" />
            <SelectContent material="regular">{content}</SelectContent>
          </Select>
          <TextField placeholder="…and the field beside it" material="regular" />
        </HostileBed>
      </Demo>
      {/* The two width facts, judged together (audit 2026-08-09): a trigger grows to fit its
          chosen value unless something bounds it, and an unbreakable option wraps inside the
          panel instead of pushing out of it. */}
      <Demo label="Width — a long value, bounded and unbounded">
        <Stack gap="3">
          <Flex gap="4" align="center">
            <Select
              defaultValue="long"
              items={{ long: "someone.with.a.long.name@example-company.com" }}
            >
              <SelectTrigger placeholder="Unbounded" />
              <SelectContent>
                <SelectItem value="long">someone.with.a.long.name@example-company.com</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
          <Box maxWidth="14rem">
            <Select
              defaultValue="long"
              items={{ long: "someone.with.a.long.name@example-company.com" }}
            >
              <SelectTrigger placeholder="Bounded — ellipsizes" />
              <SelectContent>
                <SelectItem value="long">someone.with.a.long.name@example-company.com</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </Box>
        </Stack>
      </Demo>
      {/* Composed: the form row the field identity exists for — one family, two controls. */}
      <Demo label="Composed — a form row">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="4">
              <Stack gap="2">
                <Text size="1" weight="medium">Name</Text>
                <TextField placeholder="Project name" />
              </Stack>
              <Stack gap="2">
                <Text size="1" weight="medium">Visibility</Text>
                <Select defaultValue="private" items={{ private: "Private", team: "Team", public: "Public" }}>
                  <SelectTrigger placeholder="Choose" />
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function SeparatorSection() {
  return (
    <Stack gap="6">
      {/* Horizontal: the rule fills the block that owns it, and the Stack's gap is the
          distance — the separator brings no spacing of its own. */}
      <Box maxWidth="26rem">
        <Card size="3">
          <Stack gap="4">
            <Stack gap="1">
              <Text size="2" weight="medium">Mira Chen</Text>
              <Text size="1" emphasis="medium">mira@kookie.dev</Text>
            </Stack>
            <Separator />
            <Flex gap="4" align="center">
              <Text size="2">Profile</Text>
              <Separator orientation="vertical" />
              <Text size="2">Billing</Text>
              <Separator orientation="vertical" />
              <Text size="2" emphasis="medium">Sign out</Text>
            </Flex>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
}

function SliderSection() {
  return (
    <Stack gap="6">
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
      <Demo label="Composed — an inspector panel">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="4">
              <Stack gap="2">
                <Flex justify="space-between" align="center">
                  <Text size="2" weight="medium">Blur radius</Text>
                  <Text size="1" emphasis="medium"><Code size="1">24px</Code></Text>
                </Flex>
                <Slider defaultValue={24} max={64} aria-label="Blur radius" />
              </Stack>
              <Stack gap="2">
                <Flex justify="space-between" align="center">
                  <Text size="2" weight="medium">Opacity</Text>
                  <Text size="1" emphasis="medium"><Code size="1">80%</Code></Text>
                </Flex>
                <Slider defaultValue={80} aria-label="Opacity" />
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
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
        cols={["Off", "On", "Invalid", "On, invalid", "Disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Switch key="1" size={size} aria-label="Off" />,
            <Switch key="2" size={size} defaultChecked aria-label="On" />,
            <Switch key="3" size={size} aria-invalid="true" aria-label="Invalid" />,
            <Switch key="3b" size={size} aria-invalid="true" defaultChecked aria-label="On, invalid" />,
            <Switch key="4" size={size} disabled aria-label="Disabled" />,
            <Switch key="5" size={size} defaultChecked disabled aria-label="On disabled" />,
          ],
        }))}
      />
      {/* The one-index shift, visible: switch(n) stands level with checkbox(n + 1). */}
      <Demo label="The mark family in one row — switch(n) ≡ mark(n + 1)">
        <Flex gap="5" align="center" wrap="wrap">
          <Switch size="1" defaultChecked aria-label="Switch 1" />
          <Checkbox size="2" defaultChecked aria-label="Checkbox 2" />
          <Switch size="2" aria-label="Switch 2" />
          <RadioGroup defaultValue="a" aria-label="Radio row">
            <Radio value="a" size="2" aria-label="Radio 2" />
          </RadioGroup>
          <Slider size="2" defaultValue={60} aria-label="Slider 2" style={{ width: "160px" }} />
        </Flex>
      </Demo>
      <Demo label="Composed — notification settings">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="4">
              {(
                [
                  ["Public profile", "Anyone with the link can view.", true],
                  ["Weekly digest", "One email, Monday morning.", true],
                  ["Usage alerts", "When a project passes its budget.", false],
                ] as const
              ).map(([label, description, on], i) => (
                <React.Fragment key={label}>
                  {i > 0 && <Separator />}
                  <Flex gap="5" align="center" justify="space-between">
                    <Stack gap="1">
                      <Text size="2" weight="medium" render={<label htmlFor={`pg-sw-${i}`} />}>
                        {label}
                      </Text>
                      <Text size="1" emphasis="medium">{description}</Text>
                    </Stack>
                    <Switch id={`pg-sw-${i}`} defaultChecked={on} />
                  </Flex>
                </React.Fragment>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function TextSection() {
  return (
    <Stack gap="6">
      <Stack gap="4">
        {RAMP.map((step) => (
          <Grid key={step} columns="72px minmax(0, 1fr)" gapX="5" align="center">
            <Text size="1" emphasis="quiet">size {step}</Text>
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
      {/* The sweep labels itself, the Button table's rule one family over. */}
      <Stack gap="2">
        {TONES.map((tone) => (
          <Grid key={tone} columns="72px minmax(0, 1fr)" gapX="5" align="center">
            <Text size="1" emphasis="quiet">{tone}</Text>
            <Text size="2" tone={tone}>
              {cap(tone)} ink at every rung — loud here, muted and faint behind it.
            </Text>
          </Grid>
        ))}
      </Stack>
      {/* The whole type system in one passage: heading, meta, body, quote, inline atoms —
          nothing here picks a colour, which is the section's actual claim. */}
      <Demo label="Composed — an article">
        <Box maxWidth="36rem">
          <Stack gap="4">
            <Stack gap="2">
              <Heading size="5">The one-hairline rule</Heading>
              <Text size="1" emphasis="quiet">DECISIONS §7 · four minute read</Text>
            </Stack>
            <Text size="2" render={<p />}>
              Every rule on this page is <Code>--border-width</Code> thick. A separator, a
              quote's bar, a card's edge — one width, one quiet colour, so a heavier line is
              never decoration: it is a control's solved edge, and it means something.
            </Text>
            <Text size="2" emphasis="medium" render={<p />}>
              The muted role carries the supporting paragraph, one rung under the body it
              supports — press <Kbd>⌘K</Kbd> anywhere to search the rest.
            </Text>
          </Stack>
        </Box>
      </Demo>
    </Stack>
  );
}

function TextAreaSection() {
  return (
    <Stack gap="6">
      <SpecTable
        wide
        cols={["Empty", "Value", "Invalid", "Disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            // Every specimen carries its own name (audit 2026-08-08): a placeholder is the
            // accname spec's last-resort fallback, and most of these columns have none.
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
              defaultValue="The corner squares with the page at radius none."
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
              defaultValue="Locked while the build runs."
              disabled
              aria-label={`Note, size ${size}, disabled`}
            />,
          ],
        }))}
      />
      <Demo label="Composed — a report form">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="3">
              <Stack gap="1">
                <Text size="2" weight="medium" render={<label htmlFor="pg-ta-fb" />}>
                  What went wrong?
                </Text>
                <Text size="1" emphasis="medium">Steps to reproduce help the most.</Text>
              </Stack>
              <TextArea id="pg-ta-fb" rows={4} placeholder="It broke when…" />
              <Flex justify="flex-end" gap="2">
                <Button size="1" emphasis="quiet" bordered>Cancel</Button>
                <Button size="1" tone="accent" emphasis="loud">Send report</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
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
      <Demo label="Composed — sign in">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="4">
              <Stack gap="1">
                <Text size="3" weight="medium">Sign in</Text>
                <Text size="1" emphasis="medium">Use your workspace email.</Text>
              </Stack>
              <Stack gap="3">
                <Stack gap="2">
                  <Text size="1" weight="medium" render={<label htmlFor="pg-tf-email" />}>
                    Email
                  </Text>
                  <TextField id="pg-tf-email" type="email" placeholder="you@company.com" />
                </Stack>
                <Stack gap="2">
                  <Text size="1" weight="medium" render={<label htmlFor="pg-tf-pass" />}>
                    Password
                  </Text>
                  <TextField id="pg-tf-pass" type="password" defaultValue="hunter2hunter2" />
                </Stack>
              </Stack>
              <Button tone="accent" emphasis="loud" style={{ width: "100%" }}>
                Continue
              </Button>
            </Stack>
          </Card>
        </Box>
      </Demo>
      {/* The field family's glass. The slots matter here: an adornment sits ON the veil,
          which is where a wrong slot colour shows. */}
      <HostileBed>
        {(["thin", "regular", "thick"] as const).map((m) => (
          <TextField
            key={m}
            size="2"
            material={m}
            placeholder={cap(m)}
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
 * The four layout primitives, in ONE section rather than four: they answer one question
 * between them (how a box is placed and spaced), and nobody looks up Stack without Flex.
 * Every distance is a layout-space step, never a pixel — switch density in the panel and
 * all of it moves at once.
 */
const Tile = ({ children }: { children?: React.ReactNode }) => (
  // No stated width: a plain Box hugs its content since containment went opt-in (§2,
  // 2026-08-08). These tiles shipped collapsed to slivers under the blanket mark — the
  // real break that closed the decision — so their natural fit here IS the specimen.
  <Box
    px="4"
    py="3"
    style={{ background: "var(--neutral-3)", borderRadius: "var(--radius-surface-1)" }}
  >
    <Text size="1" emphasis="medium">{children ?? "Box"}</Text>
  </Box>
);

function LayoutSection() {
  return (
    <Stack gap="6">
      <Demo label="Flex — direction, gap, alignment">
        <Flex gap="3" align="center" wrap="wrap">
          <Tile>One</Tile>
          <Tile>Two</Tile>
          <Tile>Three</Tile>
        </Flex>
      </Demo>
      <Demo label="Stack — the column; items stretch to it">
        <Box maxWidth="16rem">
          <Stack gap="2">
            <Tile>First</Tile>
            <Tile>Second</Tile>
          </Stack>
        </Box>
      </Demo>
      <Demo label="Grid — definite tracks, gapX and gapY apart">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="3" gapY="2">
          {["A", "B", "C", "D", "E", "F"].map((n) => (
            <Tile key={n}>{n}</Tile>
          ))}
        </Grid>
      </Demo>
      <Demo label="Box — padding across the layout-space steps">
        <Flex gap="3" align="flex-start" wrap="wrap">
          {(["2", "4", "6"] as const).map((p) => (
            <Box
              key={p}
              p={p}
              width="140px"
              style={{ background: "var(--neutral-3)", borderRadius: "var(--radius-surface-1)" }}
            >
              {/* The filler stretches to the content box, so the visible frame around it IS
                  the padding being demonstrated. */}
              <Box style={{ background: "var(--neutral-6)", height: "24px", borderRadius: "var(--radius-surface-1)" }} />
              <Text size="1" emphasis="medium">p={p}</Text>
            </Box>
          ))}
        </Flex>
      </Demo>
      <Demo label="Box container — the region a responsive value measures (§2, opt-in)">
        {/* One responsive value, two marked regions: the inner Box asks its nearest
            `container` ancestor how wide it is, so the same p renders tight in the narrow
            region and airy in the wide one — on the same screen, which is what
            container-keyed means. The stated widths on the marked Boxes are the prop's own
            rule: a container's width comes from outside. */}
        <Stack gap="3">
          {(["220px", "560px"] as const).map((w) => (
            <Box
              key={w}
              container
              width={w}
              style={{ background: "var(--neutral-3)", borderRadius: "var(--radius-surface-1)" }}
            >
              <Box p={{ initial: "2", sm: "7" }}>
                <Box
                  p="2"
                  style={{ background: "var(--neutral-6)", borderRadius: "var(--radius-surface-1)" }}
                >
                  <Text size="1">
                    p={"{ initial: 2, sm: 7 }"} in a {w} container
                  </Text>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </Demo>
    </Stack>
  );
}

export const SECTIONS: { id: string; name: string; body: React.ReactNode }[] = [
  // Two cross-family sections lead, out of alphabetical order on purpose: they sweep an axis
  // ACROSS components, which is the permutation no single component's table can hold, and
  // reading them first is what makes the per-component tables below mean anything.
  { id: "sizes", name: "Sizes — every control at one index", body: <SizesSection /> },
  { id: "tones", name: "Tones — ten families, every consumer", body: <TonesSection /> },
  { id: "blockquote", name: "Blockquote", body: <BlockquoteSection /> },
  { id: "button", name: "Button", body: <ButtonSection /> },
  { id: "card", name: "Card", body: <CardSection /> },
  { id: "checkbox", name: "Checkbox", body: <CheckboxSection /> },
  { id: "code", name: "Code and Kbd", body: <CodeSection /> },
  { id: "heading", name: "Heading", body: <HeadingSection /> },
  { id: "menu", name: "Menu", body: <MenuSection /> },
  { id: "select", name: "Select", body: <SelectSection /> },
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
