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
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Blockquote,
  Box,
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Button,
  Card,
  Checkbox,
  Code,
  CodeBlock,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  Flex,
  Attachment,
  Command,
  CommandCollection,
  CommandContent,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Grid,
  Heading,
  Kbd,
  Link,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  Notice,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  Row,
  Radio,
  RadioGroup,
  Separator,
  Shell,
  ShellHeader,
  ShellRail,
  ShellSidebar,
  ShellRailItem,
  ShellRailList,
  ShellNavItem,
  ShellNavGroup,
  ShellPaneFooter,
  ShellPaneHeader,
  ShellScroll,
  ShellContent,
  ShellInspector,
  ShellBottom,
  ShellTrigger,
  Slider,
  Spinner,
  Surface,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Toggle,
  ToggleGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tree,
  type TreeNode,
  TextArea,
  Theme,
  TextField,
  type Tone,
  Select,
  NavTree,
  ScrollArea,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@kookie-ui/react";

import {
  ChartIcon,
  FolderIcon,
  HomeIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from "../icons";
import { BedSurface, PHOTO_BED, bed } from "./beds";
import { ComponentPreviewBody } from "./component-preview";
import { Demo, SIZES, SpecTable, cap } from "./pieces";
import { COMPONENT_PREVIEWS } from "./previews";

// The MEMBERSHIP now has a package home (componentAxes.tone, 2026-08-19); what this literal
// still owns is the ORDER — a judged presentation sequence for the sweep, which a derived
// list cannot state. `satisfies` keeps every entry a real tone; a family added to config
// shows up missing here on the very page whose job is showing all of them.
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

/**
 * The hostile bed for glass: material is judged over something that fights back, never over
 * the page. The photograph from the standard bed set (beds.tsx is the one home since
 * 2026-08-19) — the same backdrop.jpg the package preview judges against, so the two
 * surfaces argue about one photograph.
 */
function HostileBed({ children, backdrop = true }: { children: React.ReactNode; backdrop?: boolean }) {
  return (
    <BedSurface bed={PHOTO_BED} backdrop={backdrop}>
      {children}
    </BedSurface>
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
                    <Text size="2" emphasis="medium">{description}</Text>
                  </Stack>
                  <Button tone={tone} emphasis="quiet" bordered>Details</Button>
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

const FAQ = [
  ["shipping", "Shipping", "Orders ship within two business days. Tracking arrives by email."],
  ["returns", "Returns", "Thirty days from delivery, in the original packaging."],
  ["warranty", "Warranty", "Two years on every part, covering defects and not wear."],
] as const;

function AccordionAt({ size, multiple }: { size: (typeof SIZES)[number]; multiple?: boolean }) {
  return (
    <Accordion size={size} multiple={multiple} defaultValue={["shipping"]}>
      {FAQ.map(([value, title, body]) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionPanel>{body}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function AccordionSection() {
  return (
    <Stack gap="6">
      {/* Each heading is a standing row: judge it against the Button at the same index in the
          Sizes section, and read the panel's first word against the label above it. */}
      <Flex gap="6" wrap="wrap" align="start">
        {SIZES.map((size) => (
          <Box key={size} width="20rem">
            <Demo label={`size ${size}`}>
              <AccordionAt size={size} />
            </Demo>
          </Box>
        ))}
      </Flex>
      {/* The accordion paints no pane: in a Card it takes the card's edge, and the hairlines
          between items are the only lines it brings. */}
      <Demo label="In a Card, multiple — two sections open at once">
        <Box maxWidth="26rem">
          <Card size="2">
            <AccordionAt size="2" multiple />
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function AvatarSection() {
  return (
    <Stack gap="6">
      {/* The box is one line of the text beside it: an unset avatar in a paragraph at each
          step is exactly that step's line, and the initials hold their share of the disc as
          the disc grows — the reason the share is stated against the box, not the type. */}
      <SpecTable
        cols={["Picture", "Initials", "Badged", "Generic", "In its line"]}
        rows={(["2", "3", "5", "7", "9"] as const).map((size) => ({
          label: `size ${size}`,
          cells: [
            <Avatar key="1" size={size} src="/backdrop.jpg" alt="" fallback="MC" />,
            <Avatar key="2" size={size} fallback="KD" />,
            <Avatar key="3" size={size} fallback="AR" badge={<Badge>3</Badge>} />,
            <Avatar key="4" size={size} />,
            <Text key="5" size={size}>
              <Avatar fallback="KD" /> Kushagra
            </Text>,
          ],
        }))}
      />
      <Demo label="A group — overlapped, ringed in the surface colour, the rest is an Avatar">
        <Flex gap="4" align="center" wrap="wrap">
          <AvatarGroup size="5">
            <Avatar src="/backdrop.jpg" alt="" fallback="MC" />
            <Avatar fallback="KD" />
            <Avatar fallback="AR" />
            <Avatar fallback="+3" />
          </AvatarGroup>
          <Card size="2">
            <AvatarGroup size="4">
              <Avatar fallback="KD" />
              <Avatar fallback="MC" />
              <Avatar fallback="AR" />
            </AvatarGroup>
          </Card>
        </Flex>
      </Demo>
      {/* A pressable face is an icon-only Button with the avatar inside it — the avatar fills the
          button, so the two read as one disc — and over content the button's glass is the
          avatar's glass. Beside it, an inert avatar stating `backdrop` on its own. */}
      <Demo label="As a button, and on glass — the press machine is Button's">
        <Theme material="regular">
          <BedSurface bed={PHOTO_BED} minHeight="160px">
          <Flex gap="4" align="center">
            <Button iconOnly emphasis="quiet" aria-label="Kushagra Dhawan">
              <Avatar fallback="KD" />
            </Button>
            <Button iconOnly emphasis="quiet" size="3" aria-label="Mira Chen">
              <Avatar src="/backdrop.jpg" alt="" fallback="MC" />
            </Button>
            <Avatar size="6" fallback="AR" backdrop />
            <Avatar size="6" fallback="KD" badge={<Badge>3</Badge>} backdrop />
          </Flex>
          </BedSurface>
        </Theme>
      </Demo>
      {/* Where it lives: a row. The avatar takes the row's line, the name reads beside it,
          and the Chip one cell over says what a dot would have only coloured. */}
      <Demo label="In a list — the avatar is the row's line">
        <Box maxWidth="22rem">
          <Card size="2">
            <Stack gap="2">
              {[
                ["MC", "Mira Chen", "Owner"],
                ["KD", "Kushagra Dhawan", "Editor"],
                ["AR", "Ana Ruiz", "Viewer"],
              ].map(([initials, name, role]) => (
                <Flex key={name} gap="3" align="center" justify="space-between">
                  <Flex gap="3" align="center">
                    <Avatar size="4" fallback={initials} />
                    <Text size="2">{name}</Text>
                  </Flex>
                  <Chip size="1">{role}</Chip>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function BadgeSection() {
  return (
    <Stack gap="6">
      {/* A share of the line: the same badge on a size-2 label and a size-7 heading is one
          shape at two sizes. Judge the digits against the pill and the dot against the count. */}
      <SpecTable
        cols={["Dot", "One digit", "Three digits", "Needs you", "In its line"]}
        rows={(["2", "3", "5", "7"] as const).map((size) => ({
          label: `size ${size}`,
          cells: [
            <Text key="1" size={size}><Badge aria-label="New" /></Text>,
            <Text key="2" size={size}><Badge>3</Badge></Text>,
            <Text key="3" size={size}><Badge>128</Badge></Text>,
            <Text key="4" size={size}><Badge tone="destructive">9</Badge></Text>,
            <Text key="5" size={size}>Inbox <Badge>12</Badge></Text>,
          ],
        }))}
      />
      {/* Pinned: the avatar owns the corner and the surface-coloured cut-out. */}
      <Demo label="Pinned to an Avatar — the host owns the corner">
        <Flex gap="5" align="center">
          <Avatar size="5" fallback="KD" badge={<Badge>3</Badge>} />
          <Avatar size="7" fallback="MC" badge={<Badge aria-label="Online" />} />
          <Avatar size="9" src="/backdrop.jpg" alt="" fallback="AR" badge={<Badge tone="destructive">12</Badge>} />
          <Card size="2">
            <Avatar size="6" fallback="KD" badge={<Badge>2</Badge>} />
          </Card>
        </Flex>
      </Demo>
      {/* Not a chip: a chip is a word beside the row; a badge counts or points. */}
      <Demo label="Beside a Chip — a word, and a count">
        <Flex gap="3" align="center">
          <Chip tone="success">Live</Chip>
          <Badge>4</Badge>
        </Flex>
      </Demo>
    </Stack>
  );
}

function ChipSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge first: an atom with no `size` takes the line it sits beside, so a
          chip next to a card title is bigger than one in a meta row without either call site
          repeating an index. The step is on the TEXT only — every chip here is bare. */}
      <Stack gap="3">
        {(["6", "3", "2"] as const).map((size) => (
          <Flex key={size} align="center" gap="3">
            <Text size={size}>api-gateway</Text>
            <Chip tone="success">Live</Chip>
          </Flex>
        ))}
      </Stack>
      {/* Tone is the axis this component exists for: the ten families as one vocabulary. The
          question to read down the column is whether ten of these still look like one system. */}
      <SpecTable
        cols={["Chip", "Beside a cap", "Beside a chip"]}
        rows={TONES.map((tone) => ({
          label: tone,
          cells: [
            <Chip key="1" size="2" tone={tone}>{cap(tone)}</Chip>,
            <Kbd key="2" size="2" tone={tone}>⌘K</Kbd>,
            <Code key="3" size="2" tone={tone}>{tone}</Code>,
          ],
        }))}
      />
      {/* The family side by side at one step: same fill, same corner, same box — and the cap
          is the only one that stands proud of the surface. If a chip ever grows an edge or a
          shadow, this row is where it shows. */}
      <SpecTable
        cols={["1", "3", "6", "9"]}
        rows={[
          { label: "chip", cells: (["1", "3", "6", "9"] as const).map((s) => <Chip key={s} size={s}>Live</Chip>) },
          { label: "kbd", cells: (["1", "3", "6", "9"] as const).map((s) => <Kbd key={s} size={s}>⌘K</Kbd>) },
          { label: "code", cells: (["1", "3", "6", "9"] as const).map((s) => <Code key={s} size={s}>x</Code>) },
        ]}
      />
      {/* Emphasis moves the ink and never the fill — the box holds while the letters step. */}
      <SpecTable
        cols={["loud", "medium", "quiet"]}
        rows={[
          {
            label: "chip",
            cells: (["loud", "medium", "quiet"] as const).map((e) => (
              <Chip key={e} size="2" emphasis={e}>Queued</Chip>
            )),
          },
        ]}
      />
      {/* The count case: a chip over the thing it counts. The position is the call site's —
          the component knows nothing about where it goes (§3), so this is a Box doing what a
          Box does. */}
      <Demo label="A count, placed by its call site">
        <Flex gap="6" align="center">
          {([["3", "destructive"], ["12", "accent"], ["1", "neutral"]] as const).map(([n, tone]) => (
            <Box key={n} position="relative">
              <Button emphasis="quiet" bordered>Inbox</Button>
              <Box position="absolute" style={{ insetInlineEnd: "-6px", insetBlockStart: "-8px" }}>
                <Chip size="1" tone={tone}>{n}</Chip>
              </Box>
            </Box>
          ))}
        </Flex>
      </Demo>
      {/* Composed: the shape a product actually uses it in, where the chip is the only thing
          carrying colour and the words carry everything else. */}
      <Demo label="Composed — a deploy list">
        <Box maxWidth="30rem">
          <Card size="3">
            <Stack gap="4">
              <Flex align="center" gap="3">
                <Heading size="6">Deployments</Heading>
                <Chip tone="info">Preview</Chip>
              </Flex>
              {(
                [
                  ["4821", "Failed", "destructive"],
                  ["4820", "Cancelled", "warning"],
                  ["4819", "Live", "success"],
                  ["4818", "Queued", "neutral"],
                ] as const
              ).map(([build, state, tone]) => (
                <Flex key={build} justify="space-between" align="center" gap="4">
                  <Text size="2">Build {build}</Text>
                  <Chip size="2" tone={tone}>{state}</Chip>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

function BreadcrumbSection() {
  return (
    <Stack gap="6">
      {/* What the eye judges here: the chevron against the caps beside it. It is a share of
          the LINE (--breadcrumb-glyph), so the ratio has to hold as the step climbs — a
          chevron as tall as a capital reads as a control, one at half the cap reads as a
          comma. Four steps, because two agree under any spelling. */}
      <SpecTable
        wide
        cols={["The path, at four steps"]}
        rows={(["1", "2", "3", "5"] as const).map((size) => ({
          label: `size ${size}`,
          cells: [
            <Breadcrumb key="1" size={size}>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Northwind</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>,
          ],
        }))}
      />
      {/* Three ranks of ink, and they have to be three: where you are, where you can go back
          to, and the punctuation. The middle rank comes forward under the pointer and brings
          its underline with it — hover the crumbs to judge the pair moving together. */}
      {/* The ellipsis IS the opener since 2026-09-01: `items` is required, so the inert
          marker that used to sit here — the one a reader presses first and nothing happens —
          is no longer expressible. */}
      <Demo label="Press the dots — they hold the levels that were dropped">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbEllipsis
              items={[
                { label: "Docs", href: "#docs" },
                { label: "Foundations", href: "#foundations" },
                { label: "Patterns", href: "#patterns" },
              ]}
            />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      </Demo>
      {/* A deep path in a narrow room WRAPS. The alternative is the component deciding what to
          hide, which is the app's call and nobody else's (§3). */}
      <Demo label="A deep path in a narrow room">
        <Box width="260px">
          <Breadcrumb>
            {["Workspace", "Engineering", "Design system", "Foundations"].map((name) => (
              <BreadcrumbItem key={name}>
                <BreadcrumbLink href="#">{name}</BreadcrumbLink>
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>Colour</BreadcrumbPage>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>
      </Demo>
      {/* Where it actually lives: above the thing it locates, at the meta rung, with the page
          title under it doing the work the breadcrumb is deliberately not doing. */}
      <Demo label="In place">
        <Card size="3">
          <Stack gap="5">
            <Stack gap="2">
              <Breadcrumb>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Billing</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Invoices</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>INV-0042</BreadcrumbPage>
                </BreadcrumbItem>
              </Breadcrumb>
              <Heading size="6">Northwind, March</Heading>
            </Stack>
            <Text size="3" emphasis="medium">
              Due 31 March. Sent to accounts@northwind.example on 2 March.
            </Text>
            <Flex gap="3">
              <Button emphasis="loud">Send reminder</Button>
              <Button emphasis="quiet">Download PDF</Button>
            </Flex>
          </Stack>
        </Card>
      </Demo>
    </Stack>
  );
}

function BlockquoteSection() {
  return (
    <Stack gap="6">
      {/* What the eye judges: the rule's thickness (--border-width, the system's one
          hairline) and the 1em indent's ratio to the type. */}
      <Stack gap="5">
        {(["2", "3", "5"] as const).map((size) => (
          <Blockquote key={size} size={size}>
            Taste is the last layer. If the infrastructure is right, taste can be added later.
          </Blockquote>
        ))}
      </Stack>
      {/* Tone re-scopes the INK and leaves the rule alone (§11's rule for the type family).
          A quote whose bar carries meaning is an Aside or a Notice, never a quote (§29). */}
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
            <Text size="2" emphasis="medium">— Steve Jobs</Text>
          </Stack>
        </Card>
      </Demo>
    </Stack>
  );
}

/* THE DONE STATE, judged live (§29's obligation, 2026-09-02). A demo rather than a table,
   because the thing to judge is the crossing and a still frame cannot show it: press either
   button and the glyph scales out under a blur while the tick scales in, and the labelled one
   travels its width from "Copy" to "Copied". What to look at is whether the blur earns its
   place at 16px — it is one config line and it goes to zero if it does not. */
function DoneDemo() {
  const [labelled, setLabelled] = React.useState(false);
  const [bare, setBare] = React.useState(false);
  const clear = (set: (v: boolean) => void) => {
    set(true);
    setTimeout(() => set(false), 2000);
  };
  return (
    <Demo label="Press one — the glyph crosses, the width travels">
      <Flex gap="3" align="center">
        <Button leading={<CopyGlyph />} done={labelled} onClick={() => clear(setLabelled)}>
          {labelled ? "Copied" : "Copy"}
        </Button>
        <Button
          iconOnly
          aria-label={bare ? "Copied" : "Copy"}
          done={bare}
          onClick={() => clear(setBare)}
        >
          <CopyGlyph />
        </Button>
      </Flex>
    </Demo>
  );
}

/** A stand-in for the app's own icon set: §8 ships none, and a specimen must not import one
    from the docs' chrome to prove a package behaviour. */
function CopyGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth={1.75 * 16 / 24} />
      <path d="M10.5 3.5A2 2 0 0 0 8.5 2.5h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 1 1.73" stroke="currentColor" strokeWidth={1.75 * 16 / 24} strokeLinecap="round" />
    </svg>
  );
}

function ButtonSection() {
  return (
    <Stack gap="6">
      <DoneDemo />
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
        <Theme material="thin"><Button tone="accent" emphasis="loud">Thin</Button></Theme>
        <Theme material="regular"><Button tone="accent" emphasis="loud">Regular</Button></Theme>
        <Theme material="thick"><Button tone="accent" emphasis="loud">Thick</Button></Theme>
        <Theme material="regular"><Button emphasis="medium">Neutral</Button></Theme>
        <Theme material="regular"><Button emphasis="quiet">Quiet</Button></Theme>
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
                    <Text size="2" emphasis="medium">{description}</Text>
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

/* ContextMenu (§42) — the menu family's second PLACEMENT, and it gets its own section rather
   than a demo inside Menu's, because it is its own export with its own reference page and
   nobody looks for it under another component's heading.

   What is judged here is only what differs: everything about the panel and the rows is Menu's
   and is judged there. This is about WHERE it comes from. */
function ContextMenuSection() {
  return (
    <Stack gap="6">
      {/* THE POINT. Right-click at different places in the canvas — the panel's corner lands on
          the cursor every time, and it grows OUT of that corner. If it ever appears to start
          from the canvas's own box, the entry has fallen back to the family's silhouette,
          which is the one thing this component had to replace. Try the corners too: the
          viewport decides which way the panel opens, and that is the positioner's answer
          rather than anything a call site said. */}
      <Demo label="Right-click anywhere — the panel flies out of the point, not the region (and its submenu out of its row)">
        <ContextMenu size="2">
          <ContextMenuTrigger>
            <Surface size="3" style={{ minBlockSize: 260, display: "grid", placeItems: "center" }}>
              <Text size="2" emphasis="medium">
                Right-click anywhere in here
              </Text>
            </Surface>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Rename</MenuItem>
            <MenuSub>
              <MenuSubTrigger>Move to</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Drafts</MenuItem>
                <MenuItem>Archive</MenuItem>
              </MenuSubContent>
            </MenuSub>
            <Separator />
            <MenuItem tone="destructive">Delete</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Demo>
      {/* THE REGION PAINTS NOTHING, which is only judgeable against a region you can see. The
          left card wears the trigger and the right one does not; at rest they must be the same
          pixels, because a right-click is a gesture over content you can already see. */}
      <SpecTable
        cols={["Wears the trigger", "Plain card"]}
        rows={[
          {
            label: "at rest",
            cells: [
              <ContextMenu key="1" size="2">
                <ContextMenuTrigger>
                  <Card size="3">
                    <Text size="2">Right-click me</Text>
                  </Card>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <MenuItem>Open</MenuItem>
                </ContextMenuContent>
              </ContextMenu>,
              <Card key="2" size="3">
                <Text size="2">Ordinary card</Text>
              </Card>,
            ],
          },
        ]}
      />
    </Stack>
  );
}

function CodeBlockSection() {
  const source = `export function App() {
  return (
    <Theme appearance="dark">
      <Button tone="accent">Ship it</Button>
    </Theme>
  )
}`;
  return (
    <Stack gap="6">
      {/* The claim to judge first: one index moves the pane AND the code. Three of the four
          steps only pad the box if the type is pinned, which is the fault that shipped twice
          in the composer and was found by a person reading the ladder as a ladder. */}
      <SpecTable
        cols={["1", "2", "3", "4"]}
        rows={[
          {
            label: "size",
            cells: SIZES.map((size) => (
              <CodeBlock key={size} size={size}>
                {"const scale = 1"}
              </CodeBlock>
            )),
          },
        ]}
      />
      {/* Bounded means SCROLLABLE. The right-hand well holds the same code as the left and
          stops at three lines — every line of it still reachable by wheel and by keyboard,
          which is what makes an expand control a convenience rather than a gate. */}
      <SpecTable
        cols={["Unbounded", "maxLines={3}"]}
        rows={[
          {
            label: "bound",
            cells: [
              <CodeBlock key="1">{source}</CodeBlock>,
              <CodeBlock key="2" maxLines={3}>
                {source}
              </CodeBlock>,
            ],
          },
        ]}
      />
      {/* A long line scrolls sideways rather than wrapping, because a wrap puts a break where
          the language has none. Judge the scroller's edge fade here. */}
      <Demo label="A line longer than its pane">
        <Box maxWidth="26rem">
          <CodeBlock>
            {'const endpoint = "https://api.kookie.dev/v1/projects/8f21/deployments/latest"'}
          </CodeBlock>
        </Box>
      </Demo>
      {/* Chrome floats over the pane and the code passes under it, which is the arrangement
          the material exists for. The row reaches both walls and rests CLOSER to them than
          the code does — the relationship that says the buttons belong to the pane rather
          than to the text — and `band` is what buys the first line somewhere to sit. */}
      <Demo label="A row over the top, with its safe area">
        <CodeBlock
          band
          topbar={
            <Flex align="center" justify="space-between" gap="3">
              <Chip size="2" backdrop>
                app/page.tsx
              </Chip>
              <Button size="2" backdrop>
                Copy
              </Button>
            </Flex>
          }
        >
          {source}
        </CodeBlock>
      </Demo>
      {/* Hosted: the well is already inside a pane, so it draws none of its own and its
          scroller reaches THAT pane's walls. A well inside a ground is the same ground twice,
          so what should be visible here is one box, not two. */}
      <Demo label="Hosted in a Card">
        <Card size="3">
          <Stack gap="3">
            <Text size="2" emphasis="medium">
              Run this from the repository root.
            </Text>
            <CodeBlock hosted>{"pnpm run ci"}</CodeBlock>
          </Stack>
        </Card>
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


type PaletteAction = { value: string; label: string; chord?: string };
type PaletteSection = { value: string; items: PaletteAction[] };

const PALETTE: PaletteSection[] = [
  {
    value: "Actions",
    items: [
      { value: "new", label: "New project", chord: "N" },
      { value: "import", label: "Import from GitHub" },
      { value: "invite", label: "Invite a teammate" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "appearance", label: "Appearance" },
      { value: "shortcuts", label: "Keyboard shortcuts", chord: "?" },
    ],
  },
];

function CommandSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge first: this is a Dialog. The corner, the scrim, the cast and the
          entry are the overlay family's, and the palette adds an arrangement — a field flush at
          the top of a pane whose padding it does not want, and rows that reach both walls so a
          highlighted row reads as a band rather than as a chip floating in a card (§44). */}
      <Command items={PALETTE}>
        <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
        <CommandContent aria-label="Command palette">
          <CommandInput aria-label="Search commands" placeholder="Search for commands…" />
          <CommandList>
            {(section: PaletteSection) => (
              <CommandGroup key={section.value} items={section.items}>
                <CommandGroupLabel>{section.value}</CommandGroupLabel>
                <CommandCollection>
                  {(action: PaletteAction) => (
                    <CommandItem
                      key={action.value}
                      value={action}
                      {...(action.chord ? { trailing: <Kbd>{action.chord}</Kbd> } : {})}
                    >
                      {action.label}
                    </CommandItem>
                  )}
                </CommandCollection>
              </CommandGroup>
            )}
          </CommandList>
          <CommandEmpty>No commands match that.</CommandEmpty>
        </CommandContent>
      </Command>

      <Text size="2" emphasis="medium">
        Type to narrow it. A row is highlighted from the first frame, so Enter runs without an
        arrow key first, and a section disappears when nothing in it survives.
      </Text>
    </Stack>
  );
}

function AttachmentSection() {
  return (
    <Stack gap="6">
      {/* The specimen the component was designed from: a composer's strip, where a file about
          to be sent and one already sent are the same tile (§30). The composer is the frame;
          the tiles are not part of it, which is the whole reason this is its own component. */}
      <Box maxWidth="34rem">
        <Stack gap="3">
          <Stack gap="2">
            <Attachment meta="2.4 MB" onRemove={() => {}}>
              quarterly-report.pdf
            </Attachment>
            <Attachment state="uploading" progress={0.62} meta="62% of 18 MB">
              product-walkthrough.mp4
            </Attachment>
          </Stack>
          <TextArea rows={3} placeholder="Say something about these files…" />
        </Stack>
      </Box>

      {/* The four states, and the two busy ones are the pair to judge: a fraction FILLS and a
          server working on a file SWEEPS, which is why they are two states and not one flag. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">
          The state is the category, not a colour a call site picked
        </Text>
        <Box maxWidth="34rem">
          <Stack gap="2">
            <Attachment meta="2.4 MB" onRemove={() => {}}>
              quarterly-report.pdf
            </Attachment>
            <Attachment state="uploading" progress={0.62} meta="62% of 18 MB">
              product-walkthrough.mp4
            </Attachment>
            <Attachment state="processing" meta="Extracting text">
              contract-signed.pdf
            </Attachment>
            <Attachment state="error" meta="File is larger than 25 MB" onRemove={() => {}}>
              dataset-export.csv
            </Attachment>
          </Stack>
        </Box>
      </Stack>

      {/* A name with nothing to break on, which is the fixture the arrangement law uses: the
          middle goes and both ends survive, and the ✕ never leaves the tile. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">A name longer than the tile</Text>
        <Box maxWidth="20rem">
          <Attachment meta="18.2 MB" onRemove={() => {}}>
            averyveryverylongsinglewordfilenamewithnobreakopportunity.pdf
          </Attachment>
        </Box>
      </Stack>

      {/* The box is the surface layer's, so a tile and a card at one index share a padding and
          a corner — and the index reaches the name, because the tile owns it. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">One index, the surface layer's own box</Text>
        <Box maxWidth="34rem">
          <Stack gap="2">
            {(["1", "2", "3", "4"] as const).map((size) => (
              <Attachment key={size} size={size} meta="2.4 MB" onRemove={() => {}}>
                quarterly-report.pdf
              </Attachment>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

function NoticeSection() {
  return (
    <Stack gap="6">
      {/* The specimen the component was designed from: a condition that is true right now,
          sitting on the thing it constrains, with one action that RESOLVES it and a dismissal
          that only acknowledges. Grey, and it is a warning — tone is the category (§29). */}
      <Box maxWidth="34rem">
        <Stack gap="3">
          <Notice
            action={<Button size="2">Get more usage</Button>}
            onDismiss={() => {}}
          >
            Approaching weekly usage limit — resets at 1:30 PM
          </Notice>
          <Card size="3">
            <Stack gap="3">
              <Heading size="6">Compose</Heading>
              <TextArea rows={3} placeholder="Write something…" />
            </Stack>
          </Card>
        </Stack>
      </Box>

      {/* The four families a status actually speaks, and neutral first because that is where a
          notice rests. Colour is for what colour means. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">Tone is the category, not the volume</Text>
        <Box maxWidth="34rem">
          <Stack gap="3">
            <Notice>Two members have not signed in for 90 days.</Notice>
            <Notice tone="info">Scheduled maintenance on Sunday, 02:00–04:00 UTC.</Notice>
            <Notice tone="warning" action={<Button size="2">Renew</Button>}>
              Your certificate expires in six days.
            </Notice>
            <Notice tone="destructive" action={<Button size="2">Retry</Button>}>
              The last deploy failed and the previous build is still serving.
            </Notice>
            <Notice tone="success" onDismiss={() => {}}>
              Storage is back to normal.
            </Notice>
          </Stack>
        </Box>
      </Stack>

      {/* The box comes from the surface layer, so a notice and a card at one index share a
          padding and a corner. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">One index, the surface layer's own box</Text>
        <Box maxWidth="34rem">
          <Stack gap="3">
            {(["1", "2", "3", "4"] as const).map((size) => (
              <Notice key={size} size={size} onDismiss={() => {}}>
                Approaching weekly usage limit
              </Notice>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

function PopoverSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge first, and it is the one this component's first hour turned on: a
          popover is a CARD that floats. Open it beside the card and the menu — the corner and
          the padding should match the card exactly, and the cast should match the menu. */}
      <Demo label="A card that floats, beside the two it is made of">
        <Flex gap="6" align="flex-start">
          <Popover>
            <PopoverTrigger render={<Button emphasis="quiet" bordered>Open a popover</Button>} />
            <PopoverContent>
              <Stack gap="1">
                <PopoverTitle>Filters</PopoverTitle>
                <PopoverDescription>Narrow the list to what you are looking for.</PopoverDescription>
              </Stack>
            </PopoverContent>
          </Popover>
          <Menu>
            <MenuTrigger render={<Button emphasis="quiet" bordered>Open a menu</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename</MenuItem>
            </MenuContent>
          </Menu>
          <Box minWidth="12rem">
            <Card size="2">
              <Text size="2">A card at the same index.</Text>
            </Card>
          </Box>
        </Flex>
      </Demo>
      {/* The index prices the BOX and not the words inside it — the same rule a dialog follows,
          for the same reason: the content is the call site's. What the index does reach is the
          title and the description, because those exist only because the wiring needs them. */}
      <Demo label="Size prices the box">
        <Flex gap="4" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Popover key={size} size={size}>
              <PopoverTrigger render={<Button size={size} emphasis="quiet" bordered>{`Size ${size}`}</Button>} />
              <PopoverContent>
                <Stack gap="1">
                  <PopoverTitle>Filters</PopoverTitle>
                  <PopoverDescription>The panel grew; this sentence did not.</PopoverDescription>
                </Stack>
              </PopoverContent>
            </Popover>
          ))}
        </Flex>
      </Demo>
      {/* The shape a product actually uses it in: a small form that must not take over the
          screen. The page behind stays live on purpose — that is the whole distinction from a
          dialog, and it is the thing to check by clicking somewhere else. */}
      <Demo label="Composed — an edit in place">
        <Popover>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>Rename project</Button>} />
          <PopoverContent>
            <Stack gap="4">
              <Stack gap="1">
                <PopoverTitle>Rename project</PopoverTitle>
                <PopoverDescription>This changes the name everywhere it appears.</PopoverDescription>
              </Stack>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <TextField defaultValue="api-gateway" />
              </Field>
              <Flex gap="3" justify="flex-end">
                <PopoverClose render={<Button emphasis="quiet">Cancel</Button>} />
                <PopoverClose render={<Button emphasis="loud" tone="accent">Save</Button>} />
              </Flex>
            </Stack>
          </PopoverContent>
        </Popover>
      </Demo>
      {/* Over the hostile bed, where a floating pane has to defend its own legibility. */}
      <Demo label="On glass">
        <HostileBed>
          <Popover>
            <PopoverTrigger render={<Button emphasis="quiet" bordered>Open over media</Button>} />
            <PopoverContent>
              <Stack gap="1">
                <PopoverTitle>Filters</PopoverTitle>
                <PopoverDescription>The panel expresses whatever the app is built of.</PopoverDescription>
              </Stack>
            </PopoverContent>
          </Popover>
        </HostileBed>
      </Demo>
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
      <Demo label="Composed — busy states (indeterminate: no measurable extent — slowed, never stopped)">
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
              <Text size="2" emphasis="medium">14 of 23 files · 2 min left</Text>
            </Stack>
          </Card>
          <Card size="3">
            <Stack gap="3">
              <Flex gap="2" align="center">
                <Spinner />
                <Text size="2" weight="medium">Indexing the repository</Text>
              </Flex>
              <Progress value={null} aria-label="Indexing" />
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
                      <Text size="2" emphasis="medium">{description}</Text>
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

function LinkSection() {
  return (
    <Stack gap="6">
      {/* The whole component, in the composition it exists for: a link inside a sentence,
          taking that sentence's step because `size` is unset. The eye judges two values
          here — the 0.2em underline offset, and whether the resting hairline reads as
          texture rather than as a second colour competing with the words. */}
      <Demo label="In prose — the link states no size and takes the line it sits in">
        <Box maxWidth="34rem">
          <Stack gap="3">
            {(["2", "3", "4"] as const).map((size) => (
              <Text key={size} size={size} render={<p />}>
                Every distance answers to an axis, and{" "}
                <Link href="#space">the space chapter</Link> states which one. A link that
                stated its own step would break that sentence at one size in three.
              </Text>
            ))}
          </Stack>
        </Box>
      </Demo>

      {/* Tone reaches the words AND the underline, which is the half-fix that ships if only
          the ink is checked. Accent is the resting identity — §11's named exception. */}
      <SpecTable
        wide
        cols={["A link is findable in the line it sits in"]}
        rows={(["accent", "destructive", "success", "neutral"] as const).map((tone) => ({
          label: tone,
          cells: [
            <Text key="1" size="3">
              Read the notice, then{" "}
              <Link tone={tone} href="#x">
                confirm the change
              </Link>{" "}
              to continue.
            </Text>,
          ],
        }))}
      />

      {/* Standing alone it states a step, like any other atom that is not inside a sentence. */}
      <Demo label="Standing alone — every step on the ramp">
        <Flex gap="5" align="baseline" wrap="wrap">
          {(["2", "3", "5", "7"] as const).map((size) => (
            <Link key={size} size={size} href="#x">
              Read more
            </Link>
          ))}
        </Flex>
      </Demo>

      {/* What it refuses, beside what to reach for instead: a run of accent text that RUNS
          something is a Button, and a link that matters less is a smaller link. */}
      <Demo label="Refused: emphasis. A link that matters less is a SMALLER link.">
        <Flex gap="4" align="center" wrap="wrap">
          <Link size="2" href="#x">Terms of service</Link>
          <Link size="2" href="#x">Privacy</Link>
          <Separator orientation="vertical" />
          <Button size="1" emphasis="quiet">An action that looks like text is a Button</Button>
        </Flex>
      </Demo>

      <Demo label="Composed — a footer note, and a link that wraps across the measure">
        <Box maxWidth="22rem">
          <Card size="3">
            <Stack gap="2">
              <Text size="2" weight="medium">Storage</Text>
              <Text size="2" emphasis="medium" render={<p />}>
                You are using 42 of 100 gigabytes. See{" "}
                <Link href="#plans">the plans available on this workspace</Link> before the
                renewal on 3 September.
              </Text>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}



/** The two cards a ground holds, identical on both sides of the comparison below — the whole
    point of an A/B is that exactly one thing differs. */
function GroundContents() {
  return (
    <Stack gap="4">
      <Card size="2">
        <Stack gap="1">
          <Text size="3" weight="medium">Rename project</Text>
          <Text size="2" emphasis="medium">Everyone with access will see the new name.</Text>
        </Stack>
      </Card>
      <Card size="2">
        <Stack gap="1">
          <Text size="3" weight="medium">Transfer ownership</Text>
          <Text size="2" emphasis="medium">Only the owner can delete a project.</Text>
        </Stack>
      </Card>
    </Stack>
  );
}

function SurfaceSection() {
  return (
    <Stack gap="6">
      {/* THE JUDGMENT (2026-08-26): a ground lit as a recess, beside the same ground with its
          lighting stood down — which is exactly what shipped between 2026-08-21 and today.
          Flip the appearance select above: light's shade is most of the story, dark's collect
          is. Both sides are the same component holding the same cards; the only difference is
          the one background-image. */}
      <Stack gap="3">
        <Flex gap="5" wrap="wrap" align="flex-start">
          <Stack gap="2" style={{ flex: "1 1 20rem", minWidth: "18rem" }}>
            <Text size="2" weight="medium">Lit as a recess</Text>
            <Surface>
              <GroundContents />
            </Surface>
          </Stack>
          <Stack gap="2" style={{ flex: "1 1 20rem", minWidth: "18rem" }}>
            <Text size="2" weight="medium">No lighting</Text>
            {/* The call-site escape, standing the recipe back down to what shipped before. */}
            <Surface style={{ backgroundImage: "none" }}>
              <GroundContents />
            </Surface>
          </Stack>
        </Flex>
        <Text size="2" emphasis="medium">
          Shade down from the top wall, a faint collect off the floor — the pane&rsquo;s own model
          inverted, because a ground is a dent rather than an object. Every peak stays inside one
          step of the page&ndash;ground&ndash;card ladder, which is the measurement the grain failed.
        </Text>
      </Stack>
      {/* A GROUND holding cards — the case the component exists for (2026-08-20). Every one
          of these was a hand-painted div before: a raw neutral, a guessed radius, a hairline.
          The corner is the tell — a container has to out-round what it holds, and the
          builder's own hand-built canvas got that backwards. */}
      <Box maxWidth="34rem">
        <Surface>
          <Stack gap="4">
            <Card size="2">
              <Stack gap="1">
                <Text size="3" weight="medium">Rename project</Text>
                <Text size="2" emphasis="medium">Everyone with access will see the new name.</Text>
              </Stack>
            </Card>
            <Card size="2">
              <Stack gap="1">
                <Text size="3" weight="medium">Transfer ownership</Text>
                <Text size="2" emphasis="medium">Only the owner can delete a project.</Text>
              </Stack>
            </Card>
          </Stack>
        </Surface>
      </Box>
      {/* And a BED inside a card — the same statement at the other scale, no second value.
          The fill is one pair for both, which is why there is no prop to pick. */}
      <Box maxWidth="30rem">
        <Card size="3">
          <Stack gap="4">
            <Stack gap="1">
              <Text size="3" weight="medium">Deploy hook</Text>
              <Text size="2" emphasis="medium">Send a POST to trigger a build.</Text>
            </Stack>
            <Surface size="1">
              <Code size="2">curl -X POST https://api.kookie.dev/hooks/8f21</Code>
            </Surface>
          </Stack>
        </Card>
      </Box>
      {/* The four sizes: padding and corner, both a step up from the card band. */}
      <Flex gap="5" wrap="wrap" align="flex-start">
        {SIZES.map((size) => (
          <Surface key={size} size={size} style={{ width: "11rem" }}>
            <Text size="2" emphasis="medium">Size {size}</Text>
          </Surface>
        ))}
      </Flex>
    </Stack>
  );
}

function FieldSection() {
  return (
    <Stack gap="6">
      {/* The unit doing its real job: three fields on one card, one of them failing. The label
          sits on the control it names and everything about that control pools underneath it
          (§28) — and the last field is the group case, where each option carries its own name
          and its own line. */}
      <Box maxWidth="26rem">
        <Card size="3">
          <Stack gap="5">
            <Stack gap="2">
              <Heading size="6">Add a recipient</Heading>
              <Text size="3" emphasis="medium">
                We send one confirmation and nothing else.
              </Text>
            </Stack>
            {/* Gap 5 between fields against the field's own 3 inside: the house interval, and
                the composition rule is that a group's insides sit at least two steps under the
                gap around it. It read as one flat column at 4 — visible the moment a field
                started ending in muted text rather than in a box. */}
            <Stack gap="5">
              <Field>
                <FieldLabel>Email</FieldLabel>
                <TextField type="email" placeholder="mira@kookie.dev" />
                <FieldDescription>We use this for receipts.</FieldDescription>
              </Field>
              <Field>
                <FieldItem>
                  <Checkbox />
                  <FieldLabel>Send a copy to me</FieldLabel>
                </FieldItem>
              </Field>
              {/* `aria-invalid` is the standalone spelling of what a submit would set, so the
                  error renders here without a form round trip. */}
              <Field>
                <FieldLabel>Account number</FieldLabel>
                <TextField defaultValue="4471" aria-invalid />
                <FieldDescription>Eight digits, no spaces.</FieldDescription>
                <FieldError match={true}>That is four digits short.</FieldError>
              </Field>
              {/* An item is what a mark's label has always needed: the mark family refuses to
                  draw its own label, so before this every named checkbox was a hand-written
                  `id` + `htmlFor` pair at the call site. */}
              <Field>
                <FieldLabel>Delivery speed</FieldLabel>
                <RadioGroup defaultValue="standard">
                  <Stack gap="4">
                    <FieldItem>
                      <Radio value="standard" />
                      <FieldLabel>Standard</FieldLabel>
                      <FieldDescription>Three to five business days.</FieldDescription>
                    </FieldItem>
                    <FieldItem>
                      <Radio value="express" />
                      <FieldLabel>Express</FieldLabel>
                      <FieldDescription>Next business day before noon.</FieldDescription>
                    </FieldItem>
                  </Stack>
                </RadioGroup>
              </Field>
            </Stack>
            <Flex justify="end">
              <Button emphasis="loud" tone="accent">Add recipient</Button>
            </Flex>
          </Stack>
        </Card>
      </Box>

      {/* One index prices the whole unit — the label, the description AND the control inside
          it. The label's step is the control's own, by derivation rather than by a table. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">One index, the whole unit</Text>
        <Flex gap="5" wrap="wrap" align="start">
          {(["1", "2", "3", "4"] as const).map((size) => (
            <Box key={size} width="14rem">
              <Field size={size}>
                <FieldLabel>Workspace</FieldLabel>
                <TextField defaultValue="kookie" />
                <FieldDescription>Lowercase, no spaces.</FieldDescription>
              </Field>
            </Box>
          ))}
        </Flex>
      </Stack>

      {/* And an explicit index on the control still wins, which is what keeps the supply from
          being action at a distance. */}
      <Stack gap="4">
        <Text size="2" emphasis="medium">A control that states its own index keeps it</Text>
        <Box width="14rem">
          <Field size="4">
            <FieldLabel>Workspace</FieldLabel>
            <TextField size="1" defaultValue="kookie" />
          </Field>
        </Box>
      </Stack>
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
              <Text size="2" emphasis="medium">mira@kookie.dev</Text>
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

function ShellSection() {
  return (
    <Stack gap="6">
      {/* The pane's own chrome, FLOATING (2026-08-29): the header lifts over the scroller,
          the rows pass behind it, and the scroller's fade is what keeps them legible while
          they do. The list spends the published reach so its first row RESTS below the
          chrome — the safe-area pattern at pane scale — and the maths at the call site is
          reach minus the viewport's own re-pad, because the scroller already insets by the
          pane's padding. */}
      <Demo label="Pane chrome floats — rows pass behind it, the scroll edge fades">
        <Box height="18rem">
          <Shell>
            <ShellSidebar aria-label="Files">
              <ShellPaneHeader float>
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    Files
                  </Text>
                  <Button size="1" emphasis="quiet" iconOnly aria-label="New file">
                    <PlusIcon />
                  </Button>
                </Flex>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Box
                  style={{
                    paddingBlockStart:
                      "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))",
                  }}
                >
                  <ShellNavGroup label="Recent">
                    {["Brief", "Moodboard", "Wireframes", "Copy deck", "Handoff", "Archive", "Assets", "Exports", "Notes", "Research"].map((name) => (
                      <ShellNavItem key={name} leading={<FolderIcon />}>
                        {name}
                      </ShellNavItem>
                    ))}
                  </ShellNavGroup>
                </Box>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <Stack gap="2">
                <Heading size="6">Floating pane chrome</Heading>
                <Text size="2" emphasis="medium">
                  Scroll the file list: the rows dissolve under the header instead of
                  stopping at it.
                </Text>
              </Stack>
              {/* The footer, the same posture at the other end — in the content pane so both
                  parts are judged in one demo, and both directions of the published reach are
                  live on the page. */}
              <ShellPaneFooter float>
                <Flex align="center" justify="between">
                  <Text size="1" emphasis="medium">
                    3 environments
                  </Text>
                  <Button size="1" emphasis="quiet">
                    Deploy
                  </Button>
                </Flex>
              </ShellPaneFooter>
            </ShellContent>
          </Shell>
        </Box>
      </Demo>

      {/* Flush: the app-chrome posture — panes tile, each seam one hairline. The sidebar is
          untouched (`auto`): open here, closed on a narrow window, resolved by CSS alone —
          drag the window across 48rem and nothing re-renders. */}
      <Demo label="Flush — auto sidebar, trigger in the header, bottom pane on demand">
        <Box height="22rem">
          <Shell>
            <ShellHeader>
              <Flex align="center" justify="between">
                <Flex align="center" gap="3">
                  <ShellTrigger
                    target="sidebar"
                    render={<Button size="2" emphasis="quiet" aria-label="Toggle navigation" />}
                  >
                    Nav
                  </ShellTrigger>
                  <Text size="2" weight="medium">
                    Kookie Studio
                  </Text>
                </Flex>
                <Flex gap="2">
                  <ShellTrigger target="bottom" render={<Button size="2" emphasis="quiet" />}>
                    Terminal
                  </ShellTrigger>
                  <ShellTrigger target="inspector" render={<Button size="2" emphasis="quiet" />}>
                    Inspect
                  </ShellTrigger>
                </Flex>
              </Flex>
            </ShellHeader>
            {/* The pane's real anatomy: one region marked as the scroller, everything else
                pinning by being an ordinary child. The rows stand level with the button
                above them — which is the whole of why a sidebar row leaves the menu row's
                height behind. */}
            <ShellSidebar aria-label="Primary">
              <Button size="2" emphasis="quiet">
                New project
              </Button>
              <ShellScroll>
                {/* Every icon is the ACCENT, current or not (2026-08-23) — Apple's sidebar
                    rule, and the one place colour reads as identity rather than emphasis. The
                    row you are on says so with its LABEL, because the fill is grey at every
                    rung now that accent refuses to be diluted. */}
                <ShellNavGroup label="Workspace">
                  <ShellNavItem leading={<FolderIcon />}>Projects</ShellNavItem>
                  <ShellNavItem current leading={<ChartIcon />}>
                    Deploys
                  </ShellNavItem>
                  <ShellNavItem leading={<HomeIcon />}>Members</ShellNavItem>
                </ShellNavGroup>
                <ShellNavGroup label="Account">
                  <ShellNavItem leading={<SettingsIcon />}>Settings</ShellNavItem>
                  <ShellNavItem leading={<LockIcon />}>Billing</ShellNavItem>
                </ShellNavGroup>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <Stack gap="2">
                <Heading size="6">Deploys</Heading>
                <Text size="2" emphasis="medium">
                  Three environments, all green. The content pane scrolls itself; the shell
                  never does.
                </Text>
              </Stack>
            </ShellContent>
            <ShellInspector>
              <Stack gap="2">
                <Text size="2" weight="medium">
                  Inspector
                </Text>
                <Text size="2" emphasis="medium">
                  Rests closed until asked for.
                </Text>
              </Stack>
            </ShellInspector>
            <ShellBottom>
              <Text size="2" emphasis="medium">
                Build finished in 41s.
              </Text>
            </ShellBottom>
          </Shell>
        </Box>
      </Demo>

      {/* GROUNDED (Canva, Xcode): the content is pulled off the frame and becomes its own
          surface, while the chrome around it stays welded. One word on one pane. */}
      <Demo label="Grounded content — the chrome stays flush, the work area becomes a surface">
        <Box height="22rem">
          <Shell>
            <ShellHeader>
              <Flex align="center" gap="3">
                <Text size="2" weight="medium">
                  Kookie Studio
                </Text>
              </Flex>
            </ShellHeader>
            <ShellSidebar aria-label="Primary">
              <Stack gap="1" p="3">
                <Text size="2" weight="medium">
                  Inbox
                </Text>
                <Text size="2" emphasis="medium">
                  Drafts
                </Text>
                <Text size="2" emphasis="medium">
                  Archive
                </Text>
              </Stack>
            </ShellSidebar>
            <ShellContent flush={false}>
              <Stack gap="2" p="4">
                <Heading size="6">Inbox</Heading>
                <Text size="2" emphasis="medium">
                  Nothing is behind it, so it rests on the ground rather than floating — the
                  system derives that from the panes around it.
                </Text>
              </Stack>
            </ShellContent>
          </Shell>
        </Box>
      </Demo>

      {/* FLOATING (Figma, Womp): the content stays flush, so it is underneath — and the nav
          columns lift over it. Watch the content's own surface run out to the frame edge
          behind the rail and the sidebar. */}
      <Demo label="Floating nav — the content stays whole and the columns sit over it">
        <Box height="22rem">
          <Shell>
            <ShellHeader>
              <Flex align="center" gap="3">
                <Text size="2" weight="medium">
                  Kookie Studio
                </Text>
              </Flex>
            </ShellHeader>
            {/* The rail's real anatomy: a column of squares whose width nobody states. It
                takes a SIZE and its extent follows — square plus air — which is what a
                `width` could never do, because a rail's width is its item's box. */}
            <ShellRail aria-label="Sections" size="3" flush={false}>
              <ShellRailList>
                <ShellRailItem aria-label="Home" current>
                  H
                </ShellRailItem>
                <ShellRailItem aria-label="Search">S</ShellRailItem>
                <ShellRailItem aria-label="Extensions">E</ShellRailItem>
              </ShellRailList>
            </ShellRail>
            <ShellSidebar aria-label="Primary" flush={false}>
              <Stack gap="1" p="3">
                <Text size="2" weight="medium">
                  Layers
                </Text>
                <Text size="2" emphasis="medium">
                  Frame 1
                </Text>
                <Text size="2" emphasis="medium">
                  Frame 2
                </Text>
              </Stack>
            </ShellSidebar>
            <ShellContent>
              <Stack gap="2">
                <Heading size="6">Canvas</Heading>
                <Text size="2" emphasis="medium">
                  The work area runs the full width of the frame and the columns rest on top
                  of it. Under a glass theme this is where the material finally has something
                  to show through to.
                </Text>
              </Stack>
            </ShellContent>
          </Shell>
        </Box>
      </Demo>

      {/* ALL CARDS: every pane non-flush. Nothing is behind anything, so nothing floats —
          the frame pays half the gap and each pane pays half, which is the one regime where
          that construction is exact. Restored 2026-08-20: the commit that special-cased this
          posture replaced its only demo instead of converting it. */}
      <Demo label="All cards — every pane pulled off the frame, so nothing floats">
        <Box height="22rem">
          <Shell>
            <ShellHeader flush={false}>
              <Flex align="center" gap="3">
                <Text size="2" weight="medium">
                  Kookie Studio
                </Text>
              </Flex>
            </ShellHeader>
            <ShellSidebar aria-label="Primary" flush={false}>
              <Stack gap="1" p="3">
                <Text size="2" weight="medium">
                  Inbox
                </Text>
                <Text size="2" emphasis="medium">
                  Drafts
                </Text>
              </Stack>
            </ShellSidebar>
            <ShellContent flush={false}>
              <Stack gap="2" p="4">
                <Heading size="6">Inbox</Heading>
                <Text size="2" emphasis="medium">
                  Every gap here is the same distance, pane to pane and pane to edge.
                </Text>
              </Stack>
            </ShellContent>
          </Shell>
        </Box>
      </Demo>

      {/* GLASS: the pane STATES its backdrop, exactly as a Card does (2026-08-29). The posture
          used to state it for the pane, which meant a grounded pane over the app's flat ground
          glassed too — blur over nothing. A floating column is the case where the statement is
          true, and over a photograph you can see what it is bending. */}
      <Demo label="Floating over a photograph — the pane states its backdrop, and earns it">
        <HostileBed>
          <Box height="20rem">
            <Shell>
              <ShellSidebar aria-label="Primary" flush={false} backdrop>
                <Stack gap="1" p="3">
                  <Text size="2" weight="medium">
                    Layers
                  </Text>
                  <Text size="2" emphasis="medium">
                    Frame 1
                  </Text>
                  <Text size="2" emphasis="medium">
                    Frame 2
                  </Text>
                </Stack>
              </ShellSidebar>
              <ShellContent>
                <Stack gap="2" p="4">
                  <Heading size="6">Canvas</Heading>
                </Stack>
              </ShellContent>
            </Shell>
          </Box>
        </HostileBed>
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

const TABLE_ROWS = [
  ["INV-0041", "Acme Studio", "Paid", "$1,250.00"],
  ["INV-0042", "Northwind", "Pending", "$640.00"],
  ["INV-0043", "Globex", "Overdue", "$2,100.00"],
] as const;

function TableAt({ size }: { size: (typeof SIZES)[number] }) {
  return (
    <Table size={size}>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {TABLE_ROWS.map(([id, customer, status, amount]) => (
          <TableRow key={id}>
            <TableCell>{id}</TableCell>
            <TableCell>{customer}</TableCell>
            <TableCell>
              <Chip tone={status === "Paid" ? "success" : status === "Overdue" ? "destructive" : "neutral"}>
                {status}
              </Chip>
            </TableCell>
            <TableCell align="end">{amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TableSection() {
  return (
    <Stack gap="6">
      {/* One index sets the inset and the step together; the hairline and the header ink never
          move. Judge the row height against the Chip riding the cell's line. */}
      {SIZES.map((size) => (
        <Demo key={size} label={`size ${size}`}>
          <Box maxWidth="40rem">
            <TableAt size={size} />
          </Box>
        </Demo>
      ))}
      {/* Wide content scrolls INSIDE the table's own box: the card holds its width and the
          columns slide under it. */}
      <Demo label="Wider than its room — the table scrolls, the page does not">
        <Box maxWidth="20rem">
          <Card size="2">
            <Table size="2">
              <TableCaption>Deploys, last hour</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Commit</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead align="end">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Code size="2">a3f9c21e</Code></TableCell>
                  <TableCell>production</TableCell>
                  <TableCell>eu-central-1</TableCell>
                  <TableCell align="end">2m 14s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Code size="2">91be07d4</Code></TableCell>
                  <TableCell>preview</TableCell>
                  <TableCell>us-east-1</TableCell>
                  <TableCell align="end">48s</TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
      {/* Three rungs, not four — bold is refused (§15, 2026-08-09). A heading rests at the top
          of this ladder, so nothing in the system is heavier than the last cell here. */}
      <SpecTable
        wide
        cols={["Regular", "Medium", "Semibold"]}
        rows={[
          {
            label: "weight",
            cells: (["regular", "medium", "semibold"] as const).map((w) => (
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
              <Text key="3" size="3" emphasis="quiet">The faint role — the exception rung, below the reading floor.</Text>,
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
              <Text size="2" emphasis="quiet">DECISIONS §7 · four minute read</Text>
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

/**
 * The material doctrine on one screen (§10, 2026-08-17): ONE composition — a card holding a
 * field, a select and actions, plus a bare control row — rendered on calm ground and on a
 * hostile bed, under one glass theme. The calm side proves CONVERGENCE (glass over nothing
 * renders the solid look, byte for byte); the hostile side proves EXPRESSION (the same
 * markup goes glass because the PLACE declares a backdrop, not because any control chose);
 * the card's innards prove on-glass (a field inside a glass pane is alpha, never a second
 * blur). The switch flips the region's `backdrop` mark live — off, the hostile side renders
 * exactly like the calm side and pays zero backdrop-filters, which is the performance half
 * of selectivity made visible.
 */
function MaterialScene() {
  return (
    <Stack gap="4" style={{ width: "300px" }}>
      <Card size="3">
        {/* The composition skill's own ladder (proximity, 2026-08-18 audit: every gap was 5
            — the named failure smell): header→body 6, group→group 5, and the action row
            reads as its own group. */}
        <Stack gap="6">
          {/* Title alone — "a pane, its innards, its actions" described the SPECIMEN, not
              the product, and specimen annotation belongs in the Demo caption outside the
              card (information design, 2026-08-17). */}
          <Text size="2" weight="medium">New project</Text>
          <Stack gap="5">
            <TextField size="2" placeholder="Project name" aria-label="Project name" />
            <Select size="2" defaultValue="private" items={{ private: "Private", team: "Team" }}>
              <SelectTrigger aria-label="Visibility" />
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </Stack>
          {/* Cancel is the house dismiss spelling (quiet bordered — the page's one role,
              one treatment), and Create is the scene's ONE loud action. */}
          <Flex gap="3" justify="flex-end">
            <Button emphasis="quiet" bordered>Cancel</Button>
            <Button tone="accent" emphasis="loud">Create</Button>
          </Flex>
        </Stack>
      </Card>
      {/* The strip demonstrates rungs on glass; boldness is already spent on Create above,
          so the strip tops out at medium (one figure per scene, 2026-08-18 audit). */}
      <Flex gap="3" align="center" wrap="wrap">
        <Button tone="accent" emphasis="medium">Save</Button>
        <Button emphasis="medium">Preview</Button>
        <Button emphasis="quiet" bordered>Dismiss</Button>
        <Kbd>⌘K</Kbd>
      </Flex>
    </Stack>
  );
}

/**
 * The THICKNESS LADDER, over one bed (§10, 2026-08-23).
 *
 * Until then the lens was a single constant: thin, regular and thick differed in blur, in
 * saturation and in veil alpha, and bent their backdrop by exactly the same amount — so the
 * one axis where glass most obviously owes a difference was the one axis refraction could not
 * see. Each rung now has its own lip, its own depth behind it and its own split at the edge.
 *
 * ONE bed under all three, because the comparison is only honest if the same detail runs
 * behind each pane — and the PATTERN bed specifically: flat shapes at high frequency are
 * where a bend is visible at all, which is the reason beds.tsx gives for having it.
 */
function ToggleSection() {
  return (
    <Stack gap="6">
      {/* The ranking the component exists to hold (§10's clause): a pressed toggle rests on
          the medium wash, and an unpressed one under the pointer paints only a half-step of
          it — hover the second toggle and the first must still read as the one that is on. */}
      <Demo label="A formatting bar — independent toggles, one keyboard">
        <ToggleGroup aria-label="Format" defaultValue={["bold"]} render={<Flex gap="1" />}>
          <Toggle value="bold">Bold</Toggle>
          <Toggle value="italic">Italic</Toggle>
          <Toggle value="underline">Underline</Toggle>
        </ToggleGroup>
      </Demo>
      <SpecTable
        cols={["Off", "On", "On, bordered", "Off, disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Toggle key="1" size={size}>Wrap</Toggle>,
            <Toggle key="2" size={size} defaultPressed>Wrap</Toggle>,
            <Toggle key="3" size={size} defaultPressed bordered>Wrap</Toggle>,
            <Toggle key="4" size={size} disabled>Wrap</Toggle>,
            <Toggle key="5" size={size} defaultPressed disabled>Wrap</Toggle>,
          ],
        }))}
      />
      {/* Beside a Button at the same index: same box, same quiet rest — the toggle is the
          button that stays down. */}
      <Demo label="Beside a Button — one box, one quiet rest">
        <Flex gap="2" align="center">
          <Button emphasis="quiet">Preview</Button>
          <Toggle>Wrap</Toggle>
          <Toggle defaultPressed>Line numbers</Toggle>
          <Toggle iconOnly aria-label="Pin" defaultPressed>
            ⌘
          </Toggle>
        </Flex>
      </Demo>
    </Stack>
  );
}

function TooltipSection() {
  return (
    <Stack gap="6">
      {/* The claim to judge with a pointer, and the case this component was built for: a row of
          icon-only buttons whose only name is an aria-label. Rest on the first and wait; then
          travel along the row — the provider groups them, so the rest arrive without waiting
          again, which is the difference between a toolbar you can read and one you fight. */}
      <Demo label="A toolbar, grouped">
        <TooltipProvider>
          <Flex gap="2">
            {([["Undo", "\u21A9"], ["Redo", "\u21AA"], ["Comment", "\u2026"], ["Share", "\u2197"]] as const).map(
              ([label, glyph]) => (
                <Tooltip key={label}>
                  <TooltipTrigger
                    render={
                      <Button emphasis="quiet" iconOnly aria-label={label}>
                        {glyph}
                      </Button>
                    }
                  />
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              ),
            )}
          </Flex>
        </TooltipProvider>
      </Demo>
      {/* The INVERSION is the one identity exception in the system, and it mints nothing: the
          panel is the mode's own ink with the mode's own surface written on it. Judge it in both
          appearances — the environment panel above flips the page. */}
      <Demo label="Inverted, in whatever mode it lands in">
        <TooltipProvider>
          <Flex gap="4" wrap="wrap">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side} defaultOpen>
                <TooltipTrigger render={<Button emphasis="quiet" bordered>{cap(side)}</Button>} />
                <TooltipContent side={side}>{`Opens ${side}`}</TooltipContent>
              </Tooltip>
            ))}
          </Flex>
        </TooltipProvider>
      </Demo>
      {/* A long label wraps into a small block rather than running the width of the window —
          and this is the one to check at each density, because the inset is a layout-space pick
          and a compact app gets a compact tooltip with nothing designed twice. */}
      <Demo label="A long label, and the cap that keeps it a tooltip">
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button emphasis="quiet" bordered>Restore</Button>} />
          <TooltipContent side="bottom">
            Restore this document to the version saved before the last import, and discard
            everything after it
          </TooltipContent>
        </Tooltip>
      </Demo>
    </Stack>
  );
}

function ThicknessLadder() {
  const RUNGS = [
    { m: "thin", title: "Thin", line: "Structure ghosts through. Chrome that should not compete with what it sits on." },
    { m: "regular", title: "Regular", line: "The default rung, and the one the approved lens was judged at." },
    { m: "thick", title: "Thick", line: "The widest lip and the hardest split, for a pane that covers content." },
  ] as const;
  return (
    <BedSurface bed={bed("pattern")} minHeight="280px">
      <Flex gap="5" align="center" justify="center" wrap="wrap">
        {RUNGS.map((rung) => (
          // Each pane states its own rung; the section's own Theme governs everything else.
          // The Card states `backdrop` rather than relying on the bed's region, so the
          // specimen says what it means even if it is ever moved off a marked place.
          <Theme key={rung.m} material={rung.m}>
            <Card size="3" backdrop style={{ width: "216px" }}>
              <Stack gap="3">
                <Text size="3" weight="medium">{rung.title}</Text>
                <Text size="2" emphasis="medium">{rung.line}</Text>
              </Stack>
            </Card>
          </Theme>
        ))}
      </Flex>
    </BedSurface>
  );
}

function MaterialsSection() {
  const [expressed, setExpressed] = React.useState(true);
  return (
    // Pinned to `regular` so the story reads at the page's default theme: the section is
    // about WHERE material expresses, and the environment panel's material chip still
    // governs every other section.
    <Theme material="regular">
      <Stack gap="6">
        <Flex gap="3" align="center">
          <Switch checked={expressed} onCheckedChange={setExpressed} id="pg-mat-backdrop" />
          <Text size="2" render={<label htmlFor="pg-mat-backdrop" />}>
            The hostile bed declares <Code>backdrop</Code>
          </Text>
        </Flex>
        <Grid columns="repeat(auto-fit, minmax(340px, 1fr))" gapX="5" gapY="5">
          <Demo label="Calm ground — no backdrop, glass converges to solid, zero filters">
            <Flex
              align="center"
              justify="center"
              p="6"
              style={{ border: "var(--border-width) solid var(--color-border)", borderRadius: "var(--radius-surface-3)", minHeight: "240px" }}
            >
              <MaterialScene />
            </Flex>
          </Demo>
          <Demo label="Hostile bed — the PLACE declares the backdrop; same markup, now glass">
            <HostileBed backdrop={expressed}>
              <MaterialScene />
            </HostileBed>
          </Demo>
        </Grid>
        <Demo label="One bed, three rungs — thickness reaches the bend, not just the blur">
          <ThicknessLadder />
        </Demo>
      </Stack>
    </Theme>
  );
}

function RowSection() {
  return (
    <Stack gap="6">
      {/* The family claim, on one screen: a Row and a menu item are the same object. The menu
          is open beside the list on purpose — if the standalone row ever grows its own box,
          its own corner or its own weight, this is the pair where it shows. */}
      <Demo label="The same object, in and out of a menu">
        <Flex gap="6" align="flex-start">
          <Box minWidth="14rem">
            <Card size="2">
              <Stack gap="1">
                <Row current>Overview</Row>
                <Row trailing={<Kbd>⌘1</Kbd>}>Deployments</Row>
                <Row trailing={<Kbd>⌘2</Kbd>}>Environments</Row>
                <Row disabled>Billing</Row>
              </Stack>
            </Card>
          </Box>
          <Menu>
            <MenuTrigger render={<Button emphasis="quiet" bordered>Open a menu</Button>} />
            <MenuContent>
              <MenuItem>Overview</MenuItem>
              <MenuItem>Deployments</MenuItem>
              <MenuItem>Environments</MenuItem>
              <MenuItem disabled>Billing</MenuItem>
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* A row is SHORTER than the button at its index — §21's one geometry departure. Read
          this row-by-row: the list should sit under the button beside it at every step. */}
      <SpecTable
        cols={["1", "2", "3", "4"]}
        rows={[
          { label: "row", cells: SIZES.map((s) => <Row key={s} size={s}>Duplicate</Row>) },
          { label: "button", cells: SIZES.map((s) => <Button key={s} size={s} emphasis="quiet" bordered>Duplicate</Button>) },
        ]}
      />
      {/* THE TWO CURSORS, side by side, and this is the one to judge with a mouse. On the left
          nobody is driving, so the pointer lights the row. On the right the list is driving —
          row two is held lit — and hovering paints nothing, because a mouse resting on row one
          must not argue with a keyboard that has moved to row two. */}
      <Demo label="Driven and undriven">
        <Flex gap="6" align="flex-start">
          <Box minWidth="12rem">
            <Card size="2">
              <Stack gap="1">
                <Text size="1" emphasis="quiet">Pointer</Text>
                <Row>Rename</Row>
                <Row>Duplicate</Row>
                <Row>Move</Row>
              </Stack>
            </Card>
          </Box>
          <Box minWidth="12rem">
            <Card size="2">
              <Stack gap="1">
                <Text size="1" emphasis="quiet">Driven</Text>
                <Row highlighted={false}>Rename</Row>
                <Row highlighted>Duplicate</Row>
                <Row highlighted={false}>Move</Row>
              </Stack>
            </Card>
          </Box>
        </Flex>
      </Demo>
      {/* Tone is the narrow vocabulary a row carries — the delete in a list of verbs, and
          nothing wider. Ten families in one list would be a list that has stopped being one. */}
      <SpecTable
        cols={["rest", "current", "disabled"]}
        rows={[
          {
            label: "neutral",
            cells: [<Row key="1">Rename</Row>, <Row key="2" current>Rename</Row>, <Row key="3" disabled>Rename</Row>],
          },
          {
            label: "destructive",
            cells: [
              <Row key="1" tone="destructive">Delete</Row>,
              <Row key="2" tone="destructive" current>Delete</Row>,
              <Row key="3" tone="destructive" disabled>Delete</Row>,
            ],
          },
        ]}
      />
    </Stack>
  );
}

function ScrollAreaSection() {
  return (
    <Stack gap="6">
      {/* The scrollbar's whole identity is visible here: no track, an alpha capsule thumb
          that reads on the plain card AND the hostile bed with one value, in only while
          scrolling or hovering.

          The BOX is the pane, the PADDING is the content's (2026-08-20, Kushagra: a row cut
          short of the edge "gets cut because of the card's padding"). The surface layer does
          it — a scroller that is a pane's direct child runs to the pane's edges and the
          padding moves inside the viewport, where it scrolls with the content — so the call
          site here states a height and nothing else at all. */}
      <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5">
        <Card size="3" style={{ height: "13rem" }}>
          <ScrollArea>
            <Stack gap="4">
              {Array.from({ length: 14 }, (_, i) => (
                <Text key={i} size="2" emphasis="medium">Row {i + 1} — taller than the box it lives in.</Text>
              ))}
            </Stack>
          </ScrollArea>
        </Card>
        <Card size="3" style={{ height: "13rem" }}>
          <ScrollArea>
            <Box style={{ width: "48rem" }}>
              <Stack gap="4">
                {Array.from({ length: 10 }, (_, i) => (
                  <Text key={i} size="2" emphasis="medium" style={{ whiteSpace: "nowrap" }}>
                    Row {i + 1} — and wider than it too, so both bars and the corner exist.
                  </Text>
                ))}
              </Stack>
            </Box>
          </ScrollArea>
        </Card>
      </Grid>
      <Demo label="Composed — a long menu scrolls its list, never its panel">
        <Flex gap="3" align="center">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Open a long menu</Button>} />
            <MenuContent>
              {Array.from({ length: 24 }, (_, i) => (
                <MenuItem key={i}>Item {i + 1}</MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
    </Stack>
  );
}

/**
 * A ported component's collection entry DERIVES from its preview spec (2026-08-19): the same
 * body the standalone page renders, so the two routes cannot drift. `standalone` is the slug
 * the collection page links out to.
 */
function ported(slug: string): { id: string; name: string; body: React.ReactNode; standalone: string } {
  const p = COMPONENT_PREVIEWS.find((x) => x.slug === slug);
  if (!p) throw new Error(`no preview spec for "${slug}" — is it in previews/index.ts?`);
  return {
    id: p.slug,
    name: p.name,
    body: <ComponentPreviewBody preview={p} standalone={false} />,
    standalone: p.slug,
  };
}

const TREE_ITEMS: readonly TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button", label: "button.tsx" },
          { id: "tree", label: "tree.tsx" },
        ],
      },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "docs", label: "docs", children: [{ id: "readme", label: "README.md" }] },
  { id: "license", label: "LICENSE" },
];

function TreeSection() {
  return (
    <Stack gap="6">
      {/* The machine, whole: disclosure by chevron or keyboard (arrow keys walk visible rows,
          Right opens and descends, Left closes and ascends), selection painted at the family's
          medium rung. The indent is DERIVED — one level is one icon box — so flipping the
          pointer axis in the panel deepens it with the glyphs; nothing here states a number. */}
      <Demo label="Disclosure, keyboard, selection — a Card as the pane">
        <Box minWidth="16rem" maxWidth="20rem">
          <Card size="2">
            <Tree items={TREE_ITEMS} defaultExpandedIds={["src"]} aria-label="Project files" />
          </Card>
        </Box>
      </Demo>
      {/* Several at once: Shift-arrow or Shift-click extends, Cmd/Ctrl-click toggles. */}
      <Demo label="Multi-select — Shift extends, Cmd toggles">
        <Box minWidth="16rem" maxWidth="20rem">
          <Card size="2">
            <Tree
              items={TREE_ITEMS}
              multiselectable
              defaultExpandedIds={["src", "components"]}
              defaultSelectedIds={["button", "tree"]}
              aria-label="Project files, several selectable"
            />
          </Card>
        </Box>
      </Demo>
      {/* The rows are row-family members, so the index prices them exactly as it prices a
          Row — and the indent step grows with the icon box at each size. */}
      <SpecTable
        cols={["1", "2", "3", "4"]}
        rows={[
          {
            label: "size",
            cells: SIZES.map((s) => (
              <Box key={s} minWidth="12rem">
                <Tree
                  size={s}
                  items={TREE_ITEMS.slice(0, 2)}
                  defaultExpandedIds={["src"]}
                  aria-label={`Files at size ${s}`}
                />
              </Box>
            )),
          },
        ]}
      />
      {/* The NAV member (§33): same machine, announced as navigation — sections are buttons
          with aria-expanded, pages are links, and the current page speaks in accent INK
          (ShellNavItem's identity), not in a louder fill. The docs sidebar is this component. */}
      <Demo label="NavTree — location, not selection; the current page is aria-current">
        <Box minWidth="16rem" maxWidth="20rem">
          <Card size="2">
            <NavTree
              items={[
                {
                  id: "start",
                  label: "Getting started",
                  children: [
                    { id: "/install", label: "Installation", href: "#" },
                    { id: "/theming", label: "Theming", href: "#" },
                  ],
                },
                {
                  id: "guides",
                  label: "Guides",
                  children: [{ id: "/composition", label: "Composition", href: "#" }],
                },
              ]}
              defaultExpandedIds={["start"]}
              currentId="/install"
            />
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const SECTIONS: { id: string; name: string; body: React.ReactNode; standalone?: string }[] = [
  // Two cross-family sections lead, out of alphabetical order on purpose: they sweep an axis
  // ACROSS components, which is the permutation no single component's table can hold, and
  // reading them first is what makes the per-component tables below mean anything.
  { id: "sizes", name: "Sizes — every control at one index", body: <SizesSection /> },
  { id: "tones", name: "Tones — ten families, every consumer", body: <TonesSection /> },
  { id: "materials", name: "Materials — placement decides expression", body: <MaterialsSection /> },
  { id: "accordion", name: "Accordion", body: <AccordionSection /> },
  { id: "avatar", name: "Avatar", body: <AvatarSection /> },
  { id: "badge", name: "Badge", body: <BadgeSection /> },
  { id: "chip", name: "Chip", body: <ChipSection /> },
  { id: "blockquote", name: "Blockquote", body: <BlockquoteSection /> },
  { id: "breadcrumb", name: "Breadcrumb", body: <BreadcrumbSection /> },
  { id: "button", name: "Button", body: <ButtonSection /> },
  ported("card"),
  { id: "checkbox", name: "Checkbox", body: <CheckboxSection /> },
  { id: "code", name: "Code and Kbd", body: <CodeSection /> },
  { id: "code-block", name: "CodeBlock", body: <CodeBlockSection /> },
  { id: "context-menu", name: "ContextMenu", body: <ContextMenuSection /> },
  ported("alert-dialog"),
  { id: "field", name: "Field", body: <FieldSection /> },
  ported("dialog"),
  { id: "heading", name: "Heading", body: <HeadingSection /> },
  { id: "link", name: "Link", body: <LinkSection /> },
  ported("menu"),
  ported("composer"),
  { id: "attachment", name: "Attachment", body: <AttachmentSection /> },
  { id: "command", name: "Command", body: <CommandSection /> },
  { id: "notice", name: "Notice", body: <NoticeSection /> },
  ported("select"),
  { id: "layout", name: "Layout — Box, Flex, Grid, Stack", body: <LayoutSection /> },
  { id: "popover", name: "Popover", body: <PopoverSection /> },
  { id: "progress", name: "Progress", body: <ProgressSection /> },
  { id: "radio", name: "Radio", body: <RadioSection /> },
  { id: "row", name: "Row", body: <RowSection /> },
  { id: "scroll-area", name: "Scroll area", body: <ScrollAreaSection /> },
  ported("segmented-control"),
  { id: "separator", name: "Separator", body: <SeparatorSection /> },
  { id: "shell", name: "Shell", body: <ShellSection /> },
  ported("slider"),
  { id: "spinner", name: "Spinner", body: <SpinnerSection /> },
  { id: "surface", name: "Surface", body: <SurfaceSection /> },
  ported("switch"),
  { id: "table", name: "Table", body: <TableSection /> },
  ported("tabs"),
  { id: "text", name: "Text", body: <TextSection /> },
  ported("text-area"),
  ported("text-field"),
  { id: "toggle", name: "Toggle", body: <ToggleSection /> },
  { id: "tooltip", name: "Tooltip", body: <TooltipSection /> },
  { id: "tree", name: "Tree", body: <TreeSection /> },
];
