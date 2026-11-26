import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkAdd01Icon, Cancel01Icon, Redo02Icon, Undo02Icon, Sofa01Icon, Camera01Icon, Sun03Icon, CubeIcon, Move01Icon, Rotate01Icon, ArrowExpand01Icon, FavouriteIcon, InformationCircleIcon, NoteEditIcon, Share08Icon, TextFontIcon, Tick02Icon, Folder01Icon, SquaresUniteIcon, SquaresSubtractIcon, SquaresIntersectIcon, Globe02Icon, SparklesIcon, PieChartIcon, DropletIcon, CircleDashedIcon, GridViewIcon, ShuffleIcon, MirrorIcon, Unlink02Icon, PlusSignIcon, Download01Icon, PlayIcon, PauseIcon, UserIcon } from "@hugeicons/core-free-icons";
import {
  Badge,
  AccordionTrigger,
  AccordionPanel,
  AccordionItem,
  Accordion,
  Box,
  Button,
  Card,
  Field,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  iconStroke,
  Link,
  NumberField,
  NumberFieldGroup,
  Progress,
  Row,
  RowGroup,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Shell,
  ShellBottom,
  ShellContent,
  ShellInspector,
  ShellNavItem,
  ShellPaneFooter,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Stack,
  Switch,
  Tabs,
  TabsList,
  TabsTab,
  Text,
  TextField,
  Theme,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarOverflow,
  ToolbarOverflowItem,
  ToolbarTitle,
  Tree,
  type TreeNode,
} from "@kushagradhawan/kookie-ui-react";

import {
  ArrowLeftIcon,
  ChartIcon,
  ChevronRightIcon,
  FolderIcon,
  MoreIcon,
  PlusIcon,
  TrashIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "../icons";
import { Measures } from "./measures";
import { ScrolledTo } from "./scrolled-to";
import { ScrolledToEnd } from "./scrolled-to-end";
import { ScaleToBand } from "./scale-to-band";
import { BrowserBar, PhoneAddressBar } from "./browser-chrome";
import { BandBody } from "./figure-shot";

/**
 * THE PRINCIPLES CHAPTER'S FIGURES (2026-11-02, draft). Each one is a real screen built from the
 * package, set on the docs' grey ground by the same band the front page's hero stands on
 * (`FIGURES.md` in the site repo is the art direction). No figure carries a caption: what a
 * reader with no pixels gets is the sentence below, which the figure also wears as its label and
 * the chapter's markdown twin prints in its place.
 */
export const PRINCIPLE_FIGURES = {
  GroupingFigure:
    "An event on two phones. Wrong: every line sits the same distance apart, so nothing groups. Right: the title and date sit close, and the place and the notes sit apart as their own groups.",
  RankFigure:
    "An event on two phones. Wrong: the title is one step above the text, so the rank looks like an accident. Right: the title is several steps above it.",
  ToneFigure:
    "An event's actions on two phones. Wrong: blue, green and orange buttons chosen for colour. Right: neutral actions, and red only for Cancel event, which removes something.",
  SameSizeFigure:
    "An invitation on two phones. Wrong: Decline is smaller than Accept. Right: both answers are the same size.",
  OwnsTheJobFigure:
    "An event on two phones. Wrong: a header built by hand from a row of buttons, with no Close. Right: the pane's own toolbar, with Back, the title and Close.",
  RealWordsFigure:
    "An event on two phones. Wrong: placeholder words and a Submit button. Right: the real title, details and an action that says what it does.",
  OneActionFigure:
    "A post editor on two phones. Wrong: Save and Publish are both loud, so neither stands out. Right: Save draft is medium and Publish is the one loud action.",
  MaterialsFigure:
    "A museum app showing a painting. The toolbar floats over the painting in glass, so the picture stays visible behind it.",
  TypographyFigure:
    "An article in a reader app: a large title, a muted line of meta, body text, and a section heading two steps above the body.",
  ColourFigure:
    "A calendar week. Blue events are the work calendar and green ones the personal calendar, so the colour is the information. Today and New event are the accent.",
  DepthFigure:
    "A task board. The task cards and the loud New task button cast shadows, while the board and its column labels stay flat on the page.",
  IconsFigure:
    "A notes app. Folders have an icon beside their name, search and a new note are icon-only buttons, and the notes themselves are words.",
  InteractionFigure:
    "A sign-in form with the email field focused. The ring shows where the typing goes.",
  AppearanceFigure:
    "A notes app's appearance settings on two phones, one in light mode and one in dark. One screen, two modes, nothing written twice.",
  CompositionFigure:
    "A 3D editor: the scene's objects in a tree on the left, a living-room render with the sofa selected in the middle, and the sofa's inspector on the right with its form, material, transform and mirror sections.",
  FitFigure:
    "The same settings screen on a desktop with a mouse and on a phone. Under touch, every row grows to 44 pixels.",
  FitPersonFigure:
    "A shop's bag on a laptop with a mouse and on a phone with touch. The same controls and text are larger under touch: the quantity field grows from 32 to 44 pixels, Check Out from 40 to 52, and the subtotal's text from 16 to 18.",
  OneFormFigure:
    "A billing screen with tabs that switch the view below them, and a segmented control that sets the date range in place.",
  ServeFigure:
    "A photo app exporting a picture of Valencia. The photo fills the view, and the export settings sit beside it in groups: location, file naming, file settings, image sizing, output sharpening and metadata. One loud Export, beside a quieter Cancel.",
  CraftFigure:
    "A music app's Spanish summer playlist on two phones, in glass. One is scrolled down, with the tracks passing under the mini player. The other shows the album's top.",
} as const;

type FigureName = keyof typeof PRINCIPLE_FIGURES;

/** The band: the gradient ground, the hairlines, the stage the window hangs from, and the measures
 *  read off whatever inside it carries `data-measure`. The stage is inert, because a figure is a
 *  picture of an app and not an app on the page. */
function Band({
  name,
  measured,
  aspect,
  children,
}: {
  name: FigureName;
  measured?: boolean;
  /** The band's shape, when 16:10 does not suit the figure, as a CSS ratio such as "2 / 1". */
  aspect?: string;
  children: React.ReactNode;
}) {
  return (
    <Box className="kd-band" role="img" aria-label={PRINCIPLE_FIGURES[name]} style={aspect ? { aspectRatio: aspect } : undefined}>
      {/* On a docs page the band shows its photograph (`pnpm figures`); the live figure below is
          what the shooting page draws and photographs. */}
      <BandBody name={name}>
        <div className="kd-band-stage" inert>
          {children}
        </div>
        {measured ? <Measures /> : null}
      </BandBody>
    </Box>
  );
}

/** The side panes' widths go on the Shell, as in the hero, so the floating toolbars clear the
 *  pane's real width. */
const PANE_WIDTHS = { "--shell-sidebar-w": "232px" } as React.CSSProperties;

/* ── Fit the person: one settings screen, mouse and touch ──────────────────────────────────── */

function Setting({ label, measured, children }: { label: string; measured?: boolean; children: React.ReactNode }) {
  return (
    <Row render={<div />} trailing={children} {...(measured ? { "data-measure": "height" } : {})}>
      {label}
    </Row>
  );
}

/** One settings screen, written once. Nothing in it says which device it is on: the pointer the
 *  Theme around it reports is the only difference, and the rows answer it. */
function SettingsApp() {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        <ShellPaneHeader>
          <Toolbar>
            <ToolbarTitle>Settings</ToolbarTitle>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll>
          <Stack gap="5">
            <RowGroup label="Notifications">
              <Setting label="Email" measured>
                <Switch defaultChecked aria-label="Email" />
              </Setting>
              <Setting label="Push">
                <Switch defaultChecked aria-label="Push" />
              </Setting>
              <Setting label="Weekly summary">
                <Switch aria-label="Weekly summary" />
              </Setting>
            </RowGroup>
            <RowGroup label="Account">
              <Row trailing={<ChevronRightIcon />}>Change password</Row>
              <Row trailing={<ChevronRightIcon />}>Export data</Row>
              <Row tone="destructive">Sign out</Row>
            </RowGroup>
          </Stack>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );
}

/** The same app at one scale on a desktop window with a mouse and on a phone, where the pointer
 *  is touch. The measures read each first row's height off the element. */
export function FitFigure() {
  return (
    <Band name="FitFigure" measured>
      <ScaleToBand className="kd-band-devices">
        <div className="kd-device">
          <Theme size="2" pointer="fine" className="kd-band-window kd-band-desktop">
            <BrowserBar kind="desktop" url="kookie.studio/settings" />
            <SettingsApp />
          </Theme>
        </div>
        <div className="kd-band-phone">
          <Theme size="2" pointer="coarse" className="kd-band-phone-screen">
            <SettingsApp />
            <PhoneAddressBar url="kookie.studio/settings" />
            <span className="kd-band-home-indicator" />
          </Theme>
        </div>
      </ScaleToBand>
    </Band>
  );
}

/* ── One job, one form: tabs and a segmented control on one screen ─────────────────────────── */

/** A billing screen holding the two look-alikes, each doing its own job: the tabs switch what is
 *  under them, the segmented control sets the range of the numbers in place. */
export function OneFormFigure() {
  return (
    <Band name="OneFormFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/billing" />
          <Shell contained size="2" className="kd-band-shell" style={PANE_WIDTHS}>
            <ShellSidebar aria-label="Settings" defaultOpen presentation="fixed" flush>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Settings</ToolbarTitle>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Stack gap="1">
                  <ShellNavItem leading={<SettingsIcon />}>General</ShellNavItem>
                  <ShellNavItem leading={<UsersIcon />}>Members</ShellNavItem>
                  <ShellNavItem leading={<ChartIcon />} current>
                    Billing
                  </ShellNavItem>
                  <ShellNavItem leading={<FolderIcon />}>Projects</ShellNavItem>
                </Stack>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Billing</ToolbarTitle>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="5" className="kd-band-column">
                  <Tabs defaultValue="usage">
                    <TabsList>
                      <TabsTab value="usage">Usage</TabsTab>
                      <TabsTab value="invoices">Invoices</TabsTab>
                      <TabsTab value="limits">Limits</TabsTab>
                    </TabsList>
                  </Tabs>
                  <Card size="2">
                    <Stack gap="4">
                      <Flex align="center" justify="space-between" gap="3">
                        <Heading size="4">API requests</Heading>
                        <SegmentedControl defaultValue="week" aria-label="Date range">
                          <SegmentedItem value="day">Day</SegmentedItem>
                          <SegmentedItem value="week">Week</SegmentedItem>
                          <SegmentedItem value="month">Month</SegmentedItem>
                        </SegmentedControl>
                      </Flex>
                      <Stack gap="2">
                        <Heading size="6">62,140</Heading>
                        <Text size="2" emphasis="medium">
                          Of 100,000 included this week
                        </Text>
                      </Stack>
                      <Progress value={62} aria-label="Requests used" />
                    </Stack>
                  </Card>
                  <Card size="2">
                    <Stack gap="2">
                      <Heading size="4">Storage</Heading>
                      <Text size="2" emphasis="medium">
                        18.4 GB of 50 GB
                      </Text>
                      <Progress value={37} aria-label="Storage used" />
                    </Stack>
                  </Card>
                </Stack>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Composition: a builder's property panel ──────────────────────────────────────────────── */

/** One group of the panel. Space alone does the grouping, so the group needs no label or rule
 *  of its own: a label sits close to its control, the fields sit two steps further apart, and
 *  the groups one step further again. */
function PanelGroup({ children }: { children: React.ReactNode }) {
  return <Stack gap="5">{children}</Stack>;
}

/* ── Composition: a design tool, built with Kookie ─────────────────────────────────────────── */

/** One section of the 3D editor's inspector: its title and its actions on one line, its controls
 *  under it, and a hairline under the section unless it is the last. */
function InspectorSection({
  title,
  action,
  last,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  last?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Stack gap="4">
        <Flex align="center" justify="space-between">
          <Text size="3" weight="medium">
            {title}
          </Text>
          {action ? <Flex align="center">{action}</Flex> : null}
        </Flex>
        {children}
      </Stack>
      {last ? null : <Separator />}
    </>
  );
}

/** A quiet icon button for a section's title line or a caption's end. */
function PanelAction({
  label,
  icon,
  pressed,
}: {
  label: string;
  icon: typeof PlusSignIcon;
  pressed?: boolean;
}) {
  return (
    <Button
      iconOnly
      emphasis={pressed ? "medium" : "quiet"}
      aria-label={label}
      aria-pressed={pressed}
    >
      <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />
    </Button>
  );
}

/** A caption with an action at its end, over the control it names. */
function CaptionedField({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <Flex align="center" justify="space-between">
        <FieldLabel>{label}</FieldLabel>
        {action}
      </Flex>
      {children}
    </Field>
  );
}

function AddButton({ label }: { label: string }) {
  return (
    <Button iconOnly emphasis="quiet" aria-label={label}>
      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={iconStroke} aria-hidden />
    </Button>
  );
}

const COMPOSITION_SCENE: readonly TreeNode[] = [
  {
    id: "camera",
    label: "Camera",
    leading: (
      <HugeiconsIcon icon={Camera01Icon} strokeWidth={iconStroke} aria-hidden />
    ),
  },
  {
    id: "sun",
    label: "Sun",
    leading: (
      <HugeiconsIcon icon={Sun03Icon} strokeWidth={iconStroke} aria-hidden />
    ),
  },
  {
    id: "room",
    label: "Living room",
    leading: (
      <HugeiconsIcon icon={Folder01Icon} strokeWidth={iconStroke} aria-hidden />
    ),
    children: [
      {
        id: "sofa",
        label: "Sofa",
        leading: (
          <HugeiconsIcon
            icon={Sofa01Icon}
            strokeWidth={iconStroke}
            aria-hidden
          />
        ),
      },
      {
        id: "table",
        label: "Coffee table",
        leading: (
          <HugeiconsIcon icon={CubeIcon} strokeWidth={iconStroke} aria-hidden />
        ),
      },
      {
        id: "rug",
        label: "Rug",
        leading: (
          <HugeiconsIcon icon={CubeIcon} strokeWidth={iconStroke} aria-hidden />
        ),
      },
      {
        id: "wall",
        label: "Media wall",
        leading: (
          <HugeiconsIcon icon={CubeIcon} strokeWidth={iconStroke} aria-hidden />
        ),
      },
    ],
  },
];

const AXIS_TONES = { X: "green", Y: "blue", Z: "destructive" } as const;

/** X, Y and Z in one joined field, each axis letter a scrub handle in its axis colour. */
function AxisFields({
  label,
  values,
}: {
  label: string;
  values: [number, number, number];
}) {
  return (
    <NumberFieldGroup label={label}>
      {(["X", "Y", "Z"] as const).map((axis, i) => (
        <NumberField
          key={axis}
          scrub={
            <Text size="2" tone={AXIS_TONES[axis]}>
              {axis}
            </Text>
          }
          aria-label={axis}
          defaultValue={values[i]}
        />
      ))}
    </NumberFieldGroup>
  );
}

const MATERIALS = [
  { id: "boucle", name: "Bouclé, grey", colour: "#8d8b86" },
  { id: "oak", name: "Oak, smoked", colour: "#4a3a2c" },
  { id: "linen", name: "Linen, sand", colour: "#cbbfa8" },
];

/** A material's name after its colour, a round swatch, as the picker and its list show it. */
function MaterialLabel({ name, colour }: { name: string; colour: string }) {
  return (
    <Flex align="center" gap="2">
      <span
        className="kd-band-swatch"
        style={{ "--kd-swatch": colour } as React.CSSProperties}
      />
      {name}
    </Flex>
  );
}

/** One material on the object: a field-height picker, its swatch inset like a field's icon. */
function MaterialRow({ value }: { value: string }) {
  const items = Object.fromEntries(
    MATERIALS.map((m) => [
      m.id,
      <MaterialLabel key={m.id} name={m.name} colour={m.colour} />,
    ]),
  );
  return (
    <Field>
      <Select defaultValue={value} items={items}>
        <SelectTrigger aria-label="Material" />
        <SelectContent>
          {MATERIALS.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <MaterialLabel name={m.name} colour={m.colour} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** The Composition chapter's figure: a 3D editor, laid out like Womp's object panel (2026-11-04,
 *  Kushagra: "We can show a 3D scene, and show womp like controls"). The scene's objects on the
 *  left, the render with the sofa selected in the middle, and the sofa's inspector on the right:
 *  Form, Material and Transform, each section one question, one grid, one size, actions at the end
 *  of a title line. The densest pane in the window, composed. */
export function CompositionFigure() {
  return (
    <Band name="CompositionFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/photos" />
          <Shell
            contained
            className="kd-band-shell kd-band-editor"
            style={
              {
                "--shell-sidebar-w": "232px",
                "--shell-inspector-w": "288px",
              } as React.CSSProperties
            }
          >
            <ShellSidebar
              aria-label="Scene"
              defaultOpen
              presentation="fixed"
              flush
            >
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Scene</ToolbarTitle>
                  <ToolbarButton iconOnly aria-label="Add object">
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      strokeWidth={iconStroke}
                      aria-hidden
                    />
                  </ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Tree
                  items={COMPOSITION_SCENE}
                  defaultExpandedIds={["room"]}
                  defaultSelectedIds={["sofa"]}
                  aria-label="Scene"
                />
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <ShellPaneHeader float>
                <Toolbar backdrop>
                  <ToolbarOverflow label="More tools">
                    <ToolbarGroup>
                      <ToolbarButton iconOnly aria-label="Move">
                        <HugeiconsIcon
                          icon={Move01Icon}
                          strokeWidth={iconStroke}
                          aria-hidden
                        />
                      </ToolbarButton>
                      <ToolbarButton iconOnly aria-label="Rotate">
                        <HugeiconsIcon
                          icon={Rotate01Icon}
                          strokeWidth={iconStroke}
                          aria-hidden
                        />
                      </ToolbarButton>
                      <ToolbarButton iconOnly aria-label="Scale">
                        <HugeiconsIcon
                          icon={ArrowExpand01Icon}
                          strokeWidth={iconStroke}
                          aria-hidden
                        />
                      </ToolbarButton>
                    </ToolbarGroup>
                    <ToolbarOverflowItem rank={1}>
                      <ToolbarButton emphasis="loud">Render</ToolbarButton>
                    </ToolbarOverflowItem>
                  </ToolbarOverflow>
                </Toolbar>
              </ShellPaneHeader>
              <div className="kd-band-viewport">
                <img src="/living-room.jpg" alt="" />
                <span className="kd-band-viewport-selection" />
              </div>
              <ShellPaneFooter float>
                <Toolbar backdrop>
                  <ToolbarGroup>
                    <ToolbarButton iconOnly aria-label="Undo">
                      <HugeiconsIcon
                        icon={Undo02Icon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="Redo">
                      <HugeiconsIcon
                        icon={Redo02Icon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </ToolbarButton>
                  </ToolbarGroup>
                  <ToolbarButton>Camera</ToolbarButton>
                </Toolbar>
              </ShellPaneFooter>
            </ShellContent>
            <ShellInspector
              aria-label="Properties"
              defaultOpen
              presentation="fixed"
              flush
            >
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <SegmentedControl defaultValue="object" aria-label="Panel">
                    <SegmentedItem value="object" aria-label="Object">
                      <HugeiconsIcon
                        icon={CubeIcon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </SegmentedItem>
                    <SegmentedItem value="camera" aria-label="Camera">
                      <HugeiconsIcon
                        icon={Camera01Icon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </SegmentedItem>
                    <SegmentedItem value="scene" aria-label="Environment">
                      <HugeiconsIcon
                        icon={Globe02Icon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </SegmentedItem>
                    <SegmentedItem value="effects" aria-label="Effects">
                      <HugeiconsIcon
                        icon={SparklesIcon}
                        strokeWidth={iconStroke}
                        aria-hidden
                      />
                    </SegmentedItem>
                  </SegmentedControl>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Stack gap="5">
                  <InspectorSection title="Form">
                    <Field>
                      <FieldLabel>Shape</FieldLabel>
                      <Select
                        defaultValue="cube"
                        items={{
                          cube: "Cube",
                          sphere: "Sphere",
                          cylinder: "Cylinder",
                        }}
                      >
                        <SelectTrigger />
                        <SelectContent>
                          <SelectItem value="cube">Cube</SelectItem>
                          <SelectItem value="sphere">Sphere</SelectItem>
                          <SelectItem value="cylinder">Cylinder</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Combine</FieldLabel>
                      <SegmentedControl defaultValue="add" aria-label="Combine">
                        <SegmentedItem value="add" aria-label="Add">
                          <HugeiconsIcon
                            icon={SquaresUniteIcon}
                            strokeWidth={iconStroke}
                            aria-hidden
                          />
                        </SegmentedItem>
                        <SegmentedItem value="subtract" aria-label="Subtract">
                          <HugeiconsIcon
                            icon={SquaresSubtractIcon}
                            strokeWidth={iconStroke}
                            aria-hidden
                          />
                        </SegmentedItem>
                        <SegmentedItem value="split" aria-label="Split">
                          <HugeiconsIcon
                            icon={PieChartIcon}
                            strokeWidth={iconStroke}
                            aria-hidden
                          />
                        </SegmentedItem>
                        <SegmentedItem value="intersect" aria-label="Intersect">
                          <HugeiconsIcon
                            icon={SquaresIntersectIcon}
                            strokeWidth={iconStroke}
                            aria-hidden
                          />
                        </SegmentedItem>
                      </SegmentedControl>
                    </Field>
                    <Grid columns="repeat(2, minmax(0, 1fr))" gap="3">
                      <Field>
                        <FieldLabel>Goop</FieldLabel>
                        <NumberField
                          scrub={
                            <HugeiconsIcon
                              icon={DropletIcon}
                              strokeWidth={iconStroke}
                              aria-hidden
                            />
                          }
                          aria-label="Goop"
                          defaultValue={0}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Roundness</FieldLabel>
                        <NumberField
                          scrub={
                            <HugeiconsIcon
                              icon={CircleDashedIcon}
                              strokeWidth={iconStroke}
                              aria-hidden
                            />
                          }
                          aria-label="Roundness"
                          defaultValue={8}
                        />
                      </Field>
                    </Grid>
                  </InspectorSection>
                  <InspectorSection
                    title="Material"
                    action={
                      <>
                        <PanelAction label="Library" icon={GridViewIcon} />
                        <PanelAction label="Shuffle" icon={ShuffleIcon} />
                        <PanelAction label="Add material" icon={PlusSignIcon} />
                      </>
                    }
                  >
                    <MaterialRow value="boucle" />
                  </InspectorSection>
                  <ScrolledTo />
                  <InspectorSection
                    title="Transform"
                    action={
                      <>
                        <PanelAction label="Mirror" icon={MirrorIcon} />
                        <PanelAction
                          label="World space"
                          icon={Globe02Icon}
                          pressed
                        />
                      </>
                    }
                  >
                    <CaptionedField
                      label="Position (m)"
                      action={
                        <PanelAction label="Link axes" icon={Unlink02Icon} />
                      }
                    >
                      <AxisFields
                        label="Position"
                        values={[1.2, 0.3, 0.8]}
                      />
                    </CaptionedField>
                    <CaptionedField
                      label="Rotation (°)"
                      action={
                        <PanelAction label="Link axes" icon={Unlink02Icon} />
                      }
                    >
                      <AxisFields label="Rotation" values={[0, 35, 0]} />
                    </CaptionedField>
                    <CaptionedField
                      label="Size (m)"
                      action={
                        <PanelAction label="Link axes" icon={Unlink02Icon} />
                      }
                    >
                      <AxisFields label="Size" values={[2.8, 0.7, 1.6]} />
                    </CaptionedField>
                  </InspectorSection>
                  <InspectorSection
                    title="Mirror"
                    action={
                      <PanelAction label="Add mirror" icon={PlusSignIcon} />
                    }
                    last
                  />
                </Stack>
              </ShellScroll>
            </ShellInspector>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Appearance: one settings window in light and dark ───────────────────────────────────── */

/** A notes app's appearance settings, written once. The figure draws it twice, in a light and a
 *  dark Theme, side by side. */
function AppearanceSettings() {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        <ShellPaneHeader>
          <Toolbar backdrop>
            <ToolbarTitle>Appearance</ToolbarTitle>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll>
          <Stack gap="5">
            <RowGroup label="Display">
              <Setting label="Mode">
                <Select defaultValue="auto" items={{ light: "Light", dark: "Dark", auto: "Automatic" }}>
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </Setting>
              <Setting label="Increase contrast">
                <Switch aria-label="Increase contrast" />
              </Setting>
              <Setting label="Reduce transparency">
                <Switch aria-label="Reduce transparency" />
              </Setting>
            </RowGroup>
            <RowGroup label="Editor">
              <Setting label="Text size">
                <Select defaultValue="default" items={{ small: "Small", default: "Default", large: "Large" }}>
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </Setting>
              <Setting label="Show word count">
                <Switch defaultChecked aria-label="Show word count" />
              </Setting>
            </RowGroup>
          </Stack>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );
}

/** The Appearance chapter's figure. The same settings screen on two phones, light and dark, at
 *  one scale. Phones and not windows, because two desktop windows at their real shape don't fit
 *  side by side, and a window squeezed into a tall strip is not a window (FIGURES.md). */
export function AppearanceFigure() {
  return (
    <Band name="AppearanceFigure">
      <ScaleToBand className="kd-band-devices">
        {(["light", "dark"] as const).map((mode) => (
          <Theme key={mode} appearance={mode} className="kd-band-phone">
            <Theme size="2" pointer="coarse" className="kd-band-phone-screen">
              <AppearanceSettings />
              <PhoneAddressBar url="kookie.studio/settings" />
              <span className="kd-band-home-indicator" />
            </Theme>
          </Theme>
        ))}
      </ScaleToBand>
    </Band>
  );
}

/* ── Colour: a calendar week ─────────────────────────────────────────────────────────────── */

type Calendar = "blue" | "green";

const WEEK: readonly { day: string; date: string; today?: boolean; events: readonly [string, Calendar][] }[] = [
  { day: "Mon", date: "3", events: [["Standup", "blue"], ["Design review", "blue"], ["Gym", "green"]] },
  { day: "Tue", date: "4", today: true, events: [["Standup", "blue"], ["Lunch with Ana", "green"], ["Roadmap", "blue"]] },
  { day: "Wed", date: "5", events: [["Standup", "blue"], ["Dentist", "green"]] },
  { day: "Thu", date: "6", events: [["Standup", "blue"], ["Hiring sync", "blue"], ["Climbing", "green"]] },
  { day: "Fri", date: "7", events: [["Demo day", "blue"], ["Dinner", "green"]] },
];

/** The Colour chapter's figure: a calendar week. The colour is the information: blue is the
 *  work calendar and green the personal one, two families used as data. Today is the accent,
 *  and so is the one action. Three tones on the surface, and every event says its name. */
export function ColourFigure() {
  return (
    <Band name="ColourFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/calendar" />
          <Shell contained className="kd-band-shell">
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar>
                  <ToolbarTitle>November</ToolbarTitle>
                  <ToolbarButton emphasis="loud">New event</ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Grid columns="repeat(5, minmax(0, 1fr))" gap="2">
                  {WEEK.map(({ day, date, today, events }) => (
                    <Stack key={day} gap="3">
                      <Flex align="center" gap="2">
                        <Text size="2" emphasis="medium">
                          {day}
                        </Text>
                        {today ? <Badge size="2">{date}</Badge> : <Text size="2">{date}</Text>}
                      </Flex>
                      <Stack gap="2">
                        {events.map(([title, calendar]) => (
                          <Button key={title} tone={calendar} className="kd-band-event">
                            {title}
                          </Button>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Grid>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Depth: a task board ──────────────────────────────────────────────────────────────────── */

const BOARD: readonly { column: string; tasks: readonly string[] }[] = [
  { column: "To do", tasks: ["Launch post", "Team pricing", "Export dialog", "Demo video"] },
  { column: "Doing", tasks: ["Onboarding", "Invoice emails", "Status page"] },
  { column: "Done", tasks: ["Dark mode", "Shortcuts", "Search"] },
];

/** The Depth chapter's figure: a task board in an elevated app. The cards sit above the board,
 *  so they cast a shadow, and so does the one loud button. The column labels and the board
 *  itself stay flat on the page. */
export function DepthFigure() {
  return (
    <Band name="DepthFigure">
      <div className="kd-device">
        <Theme size="2" depth="elevated" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/board" />
          <Shell contained className="kd-band-shell">
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar>
                  <ToolbarTitle>Launch</ToolbarTitle>
                  <ToolbarButton emphasis="loud">New task</ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Grid columns="repeat(3, minmax(0, 1fr))" gap="5">
                  {BOARD.map(({ column, tasks }) => (
                    <Stack key={column} gap="3">
                      <Text size="2" emphasis="medium">
                        {column}
                      </Text>
                      <Stack gap="2">
                        {tasks.map((task) => (
                          <Card key={task} size="1">
                            <Text size="2">{task}</Text>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  ))}
                </Grid>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Icons: a notes app ───────────────────────────────────────────────────────────────────── */

const ComposeIcon = () => <HugeiconsIcon icon={NoteEditIcon} strokeWidth={iconStroke} aria-hidden />;

function Note({ title, preview }: { title: string; preview: string }) {
  return (
    <Row render={<div />}>
      <Stack gap="1">
        <Text size="2" weight="medium">
          {title}
        </Text>
        <Text size="2" emphasis="medium" className="kd-band-truncate">
          {preview}
        </Text>
      </Stack>
    </Row>
  );
}

/** The Icons chapter's figure: a notes app. An icon earns its place twice. Beside a word in the
 *  folder list, it helps the eye find the row. Alone in the toolbar, it stands for an action
 *  people already know: search and a new note. The notes themselves are words, because there an
 *  icon would do no job. */
export function IconsFigure() {
  return (
    <Band name="IconsFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/notes" />
          <Shell contained className="kd-band-shell" style={{ "--shell-sidebar-w": "216px" } as React.CSSProperties}>
            <ShellSidebar aria-label="Folders" defaultOpen presentation="fixed" flush>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Folders</ToolbarTitle>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Stack gap="1">
                  <ShellNavItem leading={<FolderIcon />} trailing={<Text size="2" emphasis="medium">48</Text>}>
                    All notes
                  </ShellNavItem>
                  <ShellNavItem leading={<FolderIcon />} trailing={<Text size="2" emphasis="medium">12</Text>} current>
                    Travel
                  </ShellNavItem>
                  <ShellNavItem leading={<FolderIcon />} trailing={<Text size="2" emphasis="medium">21</Text>}>
                    Work
                  </ShellNavItem>
                  <ShellNavItem leading={<UsersIcon />} trailing={<Text size="2" emphasis="medium">6</Text>}>
                    Shared
                  </ShellNavItem>
                  <ShellNavItem leading={<TrashIcon />} trailing={<Text size="2" emphasis="medium">3</Text>}>
                    Deleted
                  </ShellNavItem>
                </Stack>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Travel</ToolbarTitle>
                  <ToolbarGroup>
                    <ToolbarButton iconOnly aria-label="Search">
                      <SearchIcon />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="New note">
                      <ComposeIcon />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="1">
                  <Note title="Lisbon trip" preview="Flights land at 9:40" />
                  <Separator />
                  <Note title="Packing list" preview="Charger, adapter, rain jacket" />
                  <Separator />
                  <Note title="Porto restaurants" preview="Book Cantinho for Saturday" />
                  <Separator />
                  <Note title="Kyoto, spring" preview="Temples before nine, then the market" />
                  <Separator />
                  <Note title="Visa documents" preview="Photos, bank letter, booking" />
                </Stack>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Interaction: a sign-in form, the email field focused ─────────────────────────────────── */

/** The Interaction chapter's figure. The figure is inert, so the email field wears the focus
 *  ring through a figure class that draws the ring's own tokens, not through real focus. */
export function InteractionFigure() {
  return (
    <Band name="InteractionFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/sign-in" />
          <Shell contained className="kd-band-shell">
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar>
                  <ToolbarTitle>Northwind</ToolbarTitle>
                  <ToolbarButton>Create account</ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <div className="kd-band-canvas kd-band-canvas-form">
                <Card size="2" className="kd-band-form">
                  <Stack gap="6">
                    <Heading size="5">Sign in</Heading>
                    <Stack gap="4">
                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <TextField defaultValue="maya@northwind.co" className="kd-band-focused" />
                      </Field>
                      <Field>
                        <Flex align="center" justify="space-between">
                          <FieldLabel>Password</FieldLabel>
                          <Link href="#" size="2">
                            Forgot password?
                          </Link>
                        </Flex>
                        <TextField type="password" aria-label="Password" />
                      </Field>
                    </Stack>
                    <Button emphasis="loud">Sign in</Button>
                  </Stack>
                </Card>
              </div>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Materials: a photo viewer ────────────────────────────────────────────────────────────── */

const hugeGlyph = (icon: typeof FavouriteIcon) =>
  function Glyph() {
    return <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />;
  };
const ShareGlyph = hugeGlyph(Share08Icon);
const FavouriteGlyph = hugeGlyph(FavouriteIcon);
const InfoGlyph = hugeGlyph(InformationCircleIcon);
const BookmarkGlyph = hugeGlyph(BookmarkAdd01Icon);
const TextSizeGlyph = hugeGlyph(TextFontIcon);

/** The Materials chapter's figure: a museum app showing a painting. Content passes behind the toolbar, which is
 *  the one place glass belongs, so the band floats over the painting with a backdrop. */
export function MaterialsFigure() {
  return (
    <Band name="MaterialsFigure">
      <div className="kd-device">
        <Theme size="2" material="6" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/collection" />
          <Shell contained className="kd-band-shell">
            <ShellContent>
              <img src="/beds/birmingham-museums-trust-adudERb6uDM-unsplash.jpg" alt="" className="kd-band-photo" />
              <ShellPaneHeader float>
                <Toolbar backdrop>
                  <ToolbarButton iconOnly aria-label="Back to collection">
                    <ArrowLeftIcon />
                  </ToolbarButton>
                  <ToolbarGroup>
                    <ToolbarButton iconOnly aria-label="Favourite">
                      <FavouriteGlyph />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="Info">
                      <InfoGlyph />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="Share">
                      <ShareGlyph />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
              </ShellPaneHeader>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Typography: an article in a reader ───────────────────────────────────────────────────── */

/** The Typography chapter's figure: an article in a reader app. Rank comes from size and
 *  colour, never bold: the page title, a muted meta line, body text, and a section heading two
 *  steps above the body. */
export function TypographyFigure() {
  return (
    <Band name="TypographyFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window">
          <BrowserBar kind="desktop" url="kookie.studio/journal" />
          <Shell contained className="kd-band-shell">
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarButton iconOnly aria-label="Back">
                    <ArrowLeftIcon />
                  </ToolbarButton>
                  <ToolbarGroup>
                    <ToolbarButton iconOnly aria-label="Text size">
                      <TextSizeGlyph />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="Save">
                      <BookmarkGlyph />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="6">
                  <Stack gap="3">
                    <Heading size="8">The slow way to Porto</Heading>
                    <Text size="2" emphasis="medium">
                      Ana Ribeiro, 6 min read
                    </Text>
                  </Stack>
                  <Text size="3">
                    The train from Lisbon takes three hours and costs less than the taxi to the
                    airport. You trade the queue for a window seat and the Atlantic on your left.
                  </Text>
                  <Stack gap="3">
                    <Heading size="6">Book the Alfa Pendular</Heading>
                    <Text size="3">
                      Seats open sixty days ahead. Take carriage 4 for the sea side, and the
                      early train for the light.
                    </Text>
                  </Stack>
                </Stack>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

/* ── Do and don't: the same real screen twice ─────────────────────────────────────────────── */

/** A pair of phones for a rule a reader judges by eye: the same screen built wrong and right,
 *  side by side at one scale, with a cross over the wrong one and a tick over the right one,
 *  the way Apple's guidelines show it. The words stay in the chapter's prose. */
function Pair({ wrong, right }: { wrong: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="kd-band-pair">
      {([
        [false, wrong],
        [true, right],
      ] as const).map(([ok, screen]) => (
        <Stack key={String(ok)} gap="4" align="center">
          <Text tone={ok ? "success" : "destructive"} render={<Flex />}>
            <HugeiconsIcon icon={ok ? Tick02Icon : Cancel01Icon} size={32} strokeWidth={iconStroke} aria-label={ok ? "Right" : "Wrong"} />
          </Text>
          <div className="kd-band-phone">
            <Theme size="2" pointer="coarse" className="kd-band-phone-screen">
              {screen}
              <PhoneAddressBar url="kookie.studio/events" />
            </Theme>
          </div>
        </Stack>
      ))}
    </div>
  );
}

function PostEditor({ actions }: { actions: React.ReactNode }) {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        <ShellPaneHeader float>
          <Toolbar backdrop>
            <ToolbarButton iconOnly aria-label="Close">
              <XGlyph />
            </ToolbarButton>
            <Flex align="center" gap="2">
              {actions}
            </Flex>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll>
          <Stack gap="6">
            <Box mx="bleed" mt="bleed">
              <img src="/beds/birmingham-museums-trust-adudERb6uDM-unsplash.jpg" alt="" className="kd-band-cover-bleed" />
            </Box>
            <Stack gap="3">
              <Heading size="7">A morning at the museum</Heading>
              <Text size="3">
                The prize fight in room 4 is smaller than you expect, and the sheep in the field
                behind the ring are the best part.
              </Text>
              <Text size="3">
                Go early. By eleven the school groups arrive, and the bench in front of it is never
                free again.
              </Text>
              <Text size="3">
                The café on the ground floor does a good flat white. Take it to the balcony over
                the round room.
              </Text>
            </Stack>
          </Stack>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );
}

const XGlyph = hugeGlyph(Cancel01Icon);

/** Composition, one obvious action. */
export function OneActionFigure() {
  return (
    <Band name="OneActionFigure">
      <Pair
        wrong={
          <PostEditor
            actions={
              <>
                <ToolbarButton emphasis="loud">Save</ToolbarButton>
                <ToolbarButton emphasis="loud">Publish</ToolbarButton>
              </>
            }
          />
        }
        right={
          <PostEditor
            actions={
              <>
                <ToolbarButton>Save draft</ToolbarButton>
                <ToolbarButton emphasis="loud">Publish</ToolbarButton>
              </>
            }
          />
        }
      />
    </Band>
  );
}

/* ── Composition's other rules, each as the same event screen built wrong and right ───────── */

function EventPane({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        {header === undefined ? (
          <ShellPaneHeader>
            <Toolbar>
              <ToolbarButton iconOnly aria-label="Back">
                <ArrowLeftIcon />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="Close">
                <XGlyph />
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
        ) : (
          header
        )}
        <ShellScroll>{children}</ShellScroll>
      </ShellContent>
    </Shell>
  );
}

function EventDetails({ inside, between, title = "6", outlined }: { inside: "1" | "2" | "4"; between: "4" | "6"; title?: "4" | "6" | "7"; outlined?: boolean }) {
  const group = outlined ? "kd-band-group-outline" : undefined;
  return (
    <Stack gap={between}>
      <Stack gap={inside} className={group}>
        <Heading size={title}>Life drawing</Heading>
        <Text size="3" emphasis="medium">
          Thursday 6 November, 7 to 9 pm
        </Text>
      </Stack>
      <Stack gap={inside} className={group}>
        <Text size="2" emphasis="medium">
          Where
        </Text>
        <Text size="3">Ikon Gallery, second floor</Text>
      </Stack>
      <Stack gap={inside} className={group}>
        <Text size="2" emphasis="medium">
          About
        </Text>
        <Text size="3">
          An open session for every level, with a model, an easel each and quiet music.
        </Text>
      </Stack>
      <Stack gap={inside} className={group}>
        <Text size="2" emphasis="medium">
          Notes
        </Text>
        <Text size="3">Bring a pencil and an A3 pad. The model sits for twenty minutes at a time.</Text>
      </Stack>
      <Stack gap={inside} className={group}>
        <Text size="2" emphasis="medium">
          Price
        </Text>
        <Text size="3">£12, paid at the door</Text>
      </Stack>
      <Stack gap={inside} className={group}>
        <Text size="2" emphasis="medium">
          Going
        </Text>
        <Text size="3">Ana, Sam and 9 others</Text>
      </Stack>
    </Stack>
  );
}

/** Composition, let space do the grouping. */
export function GroupingFigure() {
  return (
    <Band name="GroupingFigure">
      <Pair
        wrong={
          <EventPane>
            <Box pt="3">
              <EventDetails inside="4" between="4" outlined />
            </Box>
          </EventPane>
        }
        right={
          <EventPane>
            <Box pt="3">
              <EventDetails inside="1" between="6" outlined />
            </Box>
          </EventPane>
        }
      />
    </Band>
  );
}

/** Composition, rank text by size. */
export function RankFigure() {
  return (
    <Band name="RankFigure">
      <Pair
        wrong={
          <EventPane>
            <EventDetails inside="1" between="6" title="4" />
          </EventPane>
        }
        right={
          <EventPane>
            <EventDetails inside="1" between="6" title="7" />
          </EventPane>
        }
      />
    </Band>
  );
}

function EventActions({ children }: { children: React.ReactNode }) {
  return (
    <EventPane>
      <Stack gap="7">
        <EventDetails inside="1" between="6" />
        <Stack gap="3">{children}</Stack>
      </Stack>
    </EventPane>
  );
}

/** Composition, use a tone for what it means. */
export function ToneFigure() {
  return (
    <Band name="ToneFigure">
      <Pair
        wrong={
          <EventActions>
            <Button tone="blue">Share</Button>
            <Button tone="green">Invite people</Button>
            <Button tone="orange">Cancel event</Button>
          </EventActions>
        }
        right={
          <EventActions>
            <Button>Share</Button>
            <Button>Invite people</Button>
            <Button tone="destructive">Cancel event</Button>
          </EventActions>
        }
      />
    </Band>
  );
}

/** Composition, same job, same size. */
export function SameSizeFigure() {
  return (
    <Band name="SameSizeFigure">
      <Pair
        wrong={
          <EventActions>
            <Flex gap="3" align="center">
              <Button size="2">Decline</Button>
              <Button size="3" emphasis="loud">
                Accept
              </Button>
            </Flex>
          </EventActions>
        }
        right={
          <EventActions>
            <Grid columns="repeat(2, minmax(0, 1fr))" gap="3">
              <Button>Decline</Button>
              <Button emphasis="loud">Accept</Button>
            </Grid>
          </EventActions>
        }
      />
    </Band>
  );
}

/** Composition, use the component that owns the job. The wrong screen's header is built by hand
 *  on purpose, so it misses the band's inset, its glass and Close. */
export function OwnsTheJobFigure() {
  return (
    <Band name="OwnsTheJobFigure">
      <Pair
        wrong={
          <EventPane
            header={
              <Flex align="center" justify="space-between" p="5">
                <Button>Back</Button>
                <Text size="3" weight="medium">
                  Event
                </Text>
                <Button>Edit</Button>
              </Flex>
            }
          >
            <EventDetails inside="1" between="6" />
          </EventPane>
        }
        right={
          <EventPane
            header={
              <ShellPaneHeader>
                <Toolbar>
                  <ToolbarButton iconOnly aria-label="Back">
                    <ArrowLeftIcon />
                  </ToolbarButton>
                  <ToolbarGroup>
                    <ToolbarButton>Edit</ToolbarButton>
                    <ToolbarButton iconOnly aria-label="Close">
                      <XGlyph />
                    </ToolbarButton>
                  </ToolbarGroup>
                </Toolbar>
              </ShellPaneHeader>
            }
          >
            <EventDetails inside="1" between="6" />
          </EventPane>
        }
      />
    </Band>
  );
}

/** Composition, write the real words. */
export function RealWordsFigure() {
  return (
    <Band name="RealWordsFigure">
      <Pair
        wrong={
          <EventPane>
            <Stack gap="7">
              <Stack gap="6">
                <Stack gap="1">
                  <Heading size="6">Title</Heading>
                  <Text size="3" emphasis="medium">
                    Date and time
                  </Text>
                </Stack>
                <Text size="3">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
              </Stack>
              <Button emphasis="loud">Submit</Button>
            </Stack>
          </EventPane>
        }
        right={
          <EventPane>
            <Stack gap="7">
              <EventDetails inside="1" between="6" />
              <Button emphasis="loud">Add to calendar</Button>
            </Stack>
          </EventPane>
        }
      />
    </Band>
  );
}

/* ── Craft: the glass and the controls, up close ────────────────────────────────────────────── */

/** A Spanish summer playlist, for the Valencia set (2026-11-05, Kushagra: "pick a Spanish
 *  playlist"). The cover is a flamenco dancer (Edgar Serrano, Unsplash). */
const ALBUM_ART = "/figures/playlist/cover.webp";
const ALBUM_ARTIST = "Rosalía";
const ALBUM_TRACKS = [
  { title: "Entre dos aguas", time: "5:56" },
  { title: "Malamente", time: "2:30", playing: true },
  { title: "Mediterráneo", time: "3:51" },
  { title: "Bamboléo", time: "3:26" },
  { title: "La flaca", time: "4:11" },
  { title: "Un año más", time: "4:02" },
  { title: "Me quedo contigo", time: "3:52" },
  { title: "Corazón partío", time: "5:29" },
  { title: "Insurrección", time: "4:38" },
  { title: "Y nos dieron las diez", time: "4:40" },
  { title: "Vivir así es morir de amor", time: "4:18" },
  { title: "Aserejé", time: "3:33" },
];
const DownloadGlyph = hugeGlyph(Download01Icon);
const PlayGlyph = hugeGlyph(PlayIcon);
const PauseGlyph = hugeGlyph(PauseIcon);
const ShuffleGlyph = hugeGlyph(ShuffleIcon);

/** An album in a music app (2026-11-04, Kushagra, from a reference: "Imagine this but recreated
 *  using Kookie"). The header floats in glass and the mini player floats in glass, so the page
 *  passes under both. `end` shows it scrolled down, with the last tracks under the mini player;
 *  otherwise it is at its top, clear of the header (the first phone already shows the header's
 *  glass, 2026-11-05). */
function AlbumApp({ end = false }: { end?: boolean }) {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        <ShellPaneHeader float>
          <Toolbar backdrop>
            <ToolbarButton iconOnly aria-label="Back to Library">
              <ArrowLeftIcon />
            </ToolbarButton>
            <ToolbarGroup>
              <ToolbarButton iconOnly aria-label="Add to Library">
                <PlusIcon />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="Download">
                <DownloadGlyph />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="More">
                <MoreIcon />
              </ToolbarButton>
            </ToolbarGroup>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll>
          <Stack gap="6" className="kd-album">
            {end ? <ScrolledToEnd short={200} /> : null}
            <Flex align="center" gap="5" className="kd-wide">
              <img src={ALBUM_ART} alt="" className="kd-album-cover" />
              <Stack gap="1">
                <Text size="2" emphasis="quiet">
                  Playlist
                </Text>
                <Heading size="7">Verano en Valencia</Heading>
                <Text size="3" emphasis="quiet">
                  12 songs
                </Text>
              </Stack>
            </Flex>
            <Flex gap="3" className="kd-wide">
              <Button emphasis="loud" className="kd-grow">
                <PlayGlyph />
                Play
              </Button>
              <Button className="kd-grow">
                <ShuffleGlyph />
                Shuffle
              </Button>
            </Flex>
            <Stack gap="1" className="kd-wide">
              {ALBUM_TRACKS.map(({ title, time, playing }, i) => (
                <Row
                  key={title}
                  current={playing === true}
                  leading={
                    <Text size="2" emphasis="quiet" className="kd-tabular">
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                  }
                  trailing={
                    <Text size="2" emphasis="quiet">
                      {time}
                    </Text>
                  }
                >
                  {title}
                </Row>
              ))}
            </Stack>
          </Stack>
        </ShellScroll>
        {/* The mini player is a card that floats over the list, not the pane's footer band. */}
        <div className="kd-mini-dock">
          <Card backdrop size="1" className="kd-wide">
            <Flex align="center" gap="3" className="kd-wide">
              <img src={ALBUM_ART} alt="" className="kd-album-mini" />
              <Stack gap="0" className="kd-grow">
                <Text size="2">Malamente</Text>
                <Text size="2" emphasis="quiet">
                  {ALBUM_ARTIST}
                </Text>
              </Stack>
              <Button iconOnly emphasis="quiet" aria-label="Love">
                <FavouriteGlyph />
              </Button>
              <Button iconOnly aria-label="Pause">
                <PauseGlyph />
              </Button>
            </Flex>
          </Card>
        </div>
      </ShellContent>
    </Shell>
  );
}

/** Craft: one album on two phones at one scale, in glass at step 7 (2026-11-06, Kushagra: "use a
 *  higher material, like 7"), so the list reads less through the mini player. The first phone rises so the
 *  band holds its foot, the mini player over the list; the second shows the album's top. */
export function CraftFigure() {
  return (
    <Band name="CraftFigure">
      <ScaleToBand className="kd-band-devices kd-craft">
        {[true, false].map((end) => (
          <div key={String(end)} className="kd-band-phone">
            <Theme size="2" material="7" pointer="coarse" className="kd-band-phone-screen">
              <AlbumApp end={end} />
              <PhoneAddressBar url="kookie.studio/verano-en-valencia" />
              <span className="kd-band-home-indicator" />
            </Theme>
          </div>
        ))}
      </ScaleToBand>
    </Band>
  );
}

/* ── Fit the person: one bag, mouse and touch ──────────────────────────────────────────────── */

/** What to pack for Valencia (2026-11-05, Kushagra: "items that you need to travel to Valencia,
 *  like a hat"), photographed by him from Unsplash. Prices carry Spain's 21% IVA. */
const BAG_ITEMS = [
  { name: "Straw hat", detail: "Raffia, natural", price: "€45", count: 1, image: "straw-hat" },
  { name: "Linen shirt", detail: "Indigo, size M", price: "€69", count: 1, image: "linen-shirt" },
  { name: "Tote bag", detail: "Organic cotton", price: "€19", count: 1, image: "tote" },
  { name: "Sunscreen", detail: "SPF 50, 100 ml", price: "€14", count: 2, image: "sunscreen" },
];
const AccountGlyph = hugeGlyph(UserIcon);

function BagLine({ label, value, total = false, measured = false }: { label: string; value: string; total?: boolean; measured?: boolean }) {
  return (
    <Flex justify="space-between" className="kd-wide">
      <Text size={total ? "5" : "3"} {...(measured ? { "data-measure": "text" } : {})}>
        {label}
      </Text>
      <Text size={total ? "5" : "3"}>{value}</Text>
    </Flex>
  );
}

/** A shop's bag, laid out like Apple's (2026-11-05, Kushagra: "Think Apple"): a glass toolbar, a
 *  large title, a row per item, a summary and one loud Check Out. Written once; the window and
 *  the pointer around it are the only difference. A wide window puts the summary beside the
 *  items, a phone stacks it under them. `end` shows it scrolled to its foot. `measure` is the
 *  item whose quantity field is measured, the one the band shows on that device. */
function BagApp({ end = false, measure }: { end?: boolean; measure: number }) {
  return (
    <Shell contained className="kd-band-shell">
      <ShellContent>
        <ShellPaneHeader float>
          <Toolbar backdrop>
            <Flex align="center" gap="2">
              <ToolbarButton iconOnly aria-label="Back to the store">
                <ArrowLeftIcon />
              </ToolbarButton>
              <ToolbarTitle>Bag</ToolbarTitle>
            </Flex>
            <ToolbarGroup>
              <ToolbarButton iconOnly aria-label="Search the store">
                <SearchIcon />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="Account">
                <AccountGlyph />
              </ToolbarButton>
            </ToolbarGroup>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll>
          <Stack gap="7" className="kd-bag">
            {end ? <ScrolledToEnd /> : null}
            <Stack gap="2">
              <Heading size="8">Review your bag.</Heading>
              <Text size="3" emphasis="quiet">
                Free delivery and free returns.
              </Text>
            </Stack>
            <div className="kd-bag-body">
              <Stack gap="0" className="kd-wide kd-bag-items">
                {BAG_ITEMS.map((item, i) => (
                  <Stack key={item.name} gap="0" className="kd-wide">
                    {i > 0 && <Separator />}
                    <div className="kd-bag-item">
                      <img src={`/figures/bag/${item.image}.webp`} alt="" className="kd-bag-image" />
                      <Stack gap="1" className="kd-bag-name">
                        <Text size="4">{item.name}</Text>
                        <Text size="3" emphasis="quiet">
                          {item.detail}
                        </Text>
                      </Stack>
                      <div className="kd-bag-count" {...(i === measure ? { "data-measure": "height", "data-measure-chip": "below" } : {})}>
                        <NumberField defaultValue={item.count} min={1} max={9} aria-label={`Quantity of ${item.name}`} className="kd-wide" />
                      </div>
                      <Stack gap="1" align="end" className="kd-bag-price">
                        <Text size="4">{item.price}</Text>
                        <Link size="3" href="#">
                          Remove
                        </Link>
                      </Stack>
                    </div>
                  </Stack>
                ))}
              </Stack>
              <Stack gap="6" className="kd-wide">
                <Field className="kd-wide">
                  <FieldLabel>How to get it</FieldLabel>
                  <SegmentedControl defaultValue="deliver" aria-label="How to get it" className="kd-wide">
                    <SegmentedItem value="deliver">Delivery</SegmentedItem>
                    <SegmentedItem value="pickup">Pick up</SegmentedItem>
                  </SegmentedControl>
                </Field>
                {/* The totals are their own group, so their line never shares a box with the
                    selected delivery choice (RULES.md 28). */}
                <Stack gap="3" className="kd-wide">
                  <BagLine label="Subtotal" value="€161" measured />
                  <BagLine label="Shipping" value="Free" />
                  <BagLine label="Estimated tax" value="€33.81" />
                  <Separator />
                  <BagLine label="Total" value="€194.81" total />
                </Stack>
                <Button emphasis="loud" size="3" className="kd-wide" data-measure="height" data-measure-chip="below">
                  Check Out
                </Button>
              </Stack>
            </div>
          </Stack>
        </ShellScroll>
      </ShellContent>
    </Shell>
  );
}

/** Fit the person: the same bag at one scale on a laptop with a mouse and on a phone with touch,
 *  both in glass. Every control and line of text the band shows on both is measured. */
export function FitPersonFigure() {
  return (
    <Band name="FitPersonFigure" measured>
      <ScaleToBand className="kd-band-devices kd-fit-person">
        <div className="kd-device">
          <Theme size="2" material="3" pointer="fine" className="kd-band-window kd-band-desktop kd-bag-frame">
            <BrowserBar kind="desktop" url="kookie.studio/bag" />
            <BagApp measure={0} />
          </Theme>
        </div>
        <div className="kd-band-phone">
          <Theme size="2" material="3" pointer="coarse" className="kd-band-phone-screen kd-bag-frame">
            <BagApp end measure={BAG_ITEMS.length - 1} />
            <PhoneAddressBar url="kookie.studio/bag" />
            <span className="kd-band-home-indicator" />
          </Theme>
        </div>
      </ScaleToBand>
    </Band>
  );
}

/* ── Serve the job: one step of a professional's job, in front ──────────────────────────────── */


const EXPORT_STRIP = ["city-hall", "old-town", "malvarrosa", "facades", "white-street", "street", "cathedral"];

/** One row of export settings: the label at the controls' size, then its control. */
function ExportRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kd-export-row">
      <Text size="2">{label}</Text>
      <div className="kd-export-value">{children}</div>
    </div>
  );
}

function ExportGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="3" className="kd-wide">
      <Text size="2" emphasis="medium">
        {title}
      </Text>
      {children}
    </Stack>
  );
}

function ExportSelect({ label, value, options }: { label: string; value: string; options: string[] }) {
  const items = Object.fromEntries(options.map((o) => [o, o]));
  return (
    <Select defaultValue={value} items={items}>
      <SelectTrigger aria-label={label} />
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Serve the job (2026-11-05, Kushagra: "specific parts of the job"; then "The render panel doesn't
 *  look serious enough. Lets assume render settings of lightroom etc. and use one of our valencia
 *  images"). A photo app at the moment of exporting a picture, with the settings a real one asks
 *  for: where, what name, which file, what size, how sharp, which metadata. Dense, as the job is,
 *  and still one loud action: Export, in the pane's footer, beside a quieter Cancel. */
const EXPORT_PRESETS_SAVED = [
  { name: "Web", detail: "JPEG, 2048 px, sRGB" },
  { name: "Print", detail: "TIFF, full size, Adobe RGB" },
  { name: "Instagram", detail: "JPEG, 1080 px, sRGB" },
  { name: "Full size", detail: "JPEG, original, sRGB" },
];

/** SAVED 2026-11-06 ("Keep this, save it"): the flush version with the filmstrip and the photo
 *  shown whole. `photo` picks the picture being exported; the title and the outlined thumbnail follow it.
 *  One app frame with no top bar (2026-11-06, Kushagra: "do we need header?"): the photo, the export
 *  panel and the filmstrip, flush (floating panels were tried and dropped the same day).
 *  Presets do most of the work; the details fold away. */
export function ExportAppWithStrip({ photo = "malvarrosa" }: { photo?: string }) {
  return (
    <Shell contained className="kd-band-shell kd-export-shell">
      <ShellContent>
        <div className="kd-export-stage">
          <img src={`/figures/export/${photo}.webp`} alt="" className="kd-export-photo" />
        </div>
      </ShellContent>
      <ShellInspector aria-label="Export" defaultOpen presentation="fixed" flush>
        <ShellPaneHeader>
          <Toolbar>
            <ToolbarTitle>Export 1 photo</ToolbarTitle>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll fade>
          <Stack gap="5" className="kd-wide">
            <ExportGroup title="Preset">
              <Stack gap="1" className="kd-wide">
                {EXPORT_PRESETS_SAVED.map((preset, i) => (
                  <Row
                    key={preset.name}
                    current={i === 0}
                    trailing={
                      <Text size="2" emphasis="quiet">
                        {preset.detail}
                      </Text>
                    }
                  >
                    {preset.name}
                  </Row>
                ))}
              </Stack>
            </ExportGroup>
            <ExportGroup title="Location">
              <ExportRow label="Folder">
                <ExportSelect label="Folder" value="Pictures/Valencia" options={["Pictures/Valencia", "Desktop", "Choose…"]} />
              </ExportRow>
              <ExportRow label="Name">
                <TextField defaultValue="Valencia-001" aria-label="Name" />
              </ExportRow>
            </ExportGroup>
            <Accordion multiple defaultValue={["file", "size", "sharpen", "meta"]} className="kd-wide">
              <AccordionItem value="file">
                <AccordionTrigger>File settings</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Format">
                      <SegmentedControl defaultValue="jpeg" aria-label="Format" className="kd-wide">
                        <SegmentedItem value="jpeg">JPEG</SegmentedItem>
                        <SegmentedItem value="tiff">TIFF</SegmentedItem>
                        <SegmentedItem value="png">PNG</SegmentedItem>
                      </SegmentedControl>
                    </ExportRow>
                    <ExportRow label="Quality">
                      <NumberField defaultValue={85} min={0} max={100} aria-label="Quality" />
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="size">
                <AccordionTrigger>Image sizing</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Resize to">
                      <ExportSelect label="Resize to" value="Long edge" options={["Long edge", "Short edge", "Width and height"]} />
                    </ExportRow>
                    <ExportRow label="Long edge">
                      <NumberField defaultValue={2048} aria-label="Long edge in pixels" />
                    </ExportRow>
                    <ExportRow label="Resolution">
                      <NumberField defaultValue={72} aria-label="Resolution, pixels per inch" />
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="sharpen">
                <AccordionTrigger>Output sharpening</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Sharpen for">
                      <ExportSelect label="Sharpen for" value="Screen" options={["Screen", "Matte paper", "Glossy paper"]} />
                    </ExportRow>
                    <ExportRow label="Amount">
                      <SegmentedControl defaultValue="standard" aria-label="Amount" className="kd-wide">
                        <SegmentedItem value="low">Low</SegmentedItem>
                        <SegmentedItem value="standard">Standard</SegmentedItem>
                        <SegmentedItem value="high">High</SegmentedItem>
                      </SegmentedControl>
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="meta">
                <AccordionTrigger>Metadata</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Include">
                      <ExportSelect label="Include" value="Copyright only" options={["Copyright only", "All", "None"]} />
                    </ExportRow>
                    <ExportRow label="Copyright">
                      <TextField defaultValue="© 2026 Kookie Studio" aria-label="Copyright" />
                    </ExportRow>
                    <ExportRow label="Location">
                      <Flex align="center" justify="space-between" className="kd-wide">
                        <Text size="2" emphasis="quiet">
                          Remove
                        </Text>
                        <Switch aria-label="Remove location" defaultChecked />
                      </Flex>
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Text size="2" emphasis="quiet">
              About 2 MB
            </Text>
          </Stack>
        </ShellScroll>
        <ShellPaneFooter>
          {/* The step's two answers share the full width, half each (RULES.md 6: a flow's
              actions are full width; Kushagra, 2026-11-06: "export and cancel should share full
              width 50%"). */}
          <Grid columns="repeat(2, minmax(0, 1fr))" gap="3" className="kd-wide">
            <Button>Cancel</Button>
            <Button emphasis="loud">Export</Button>
          </Grid>
        </ShellPaneFooter>
      </ShellInspector>
      <ShellBottom aria-label="Filmstrip" defaultOpen>
        <Flex gap="2" className="kd-export-strip">
          {EXPORT_STRIP.map((name) => (
            <img
              key={name}
              src={`/figures/editor/${name}.webp`}
              alt=""
              className="kd-export-thumb"
              data-selected={name === photo || undefined}
            />
          ))}
        </Flex>
      </ShellBottom>
    </Shell>
  );
}

const EXPORT_PRESETS = [
  { name: "Web", detail: "JPEG, 2048 px, sRGB" },
  { name: "Print", detail: "TIFF, full size, Adobe RGB" },
  { name: "Instagram", detail: "JPEG, 1080 px, sRGB" },
  { name: "Full size", detail: "JPEG, original, sRGB" },
];

/** `photo` picks the picture being exported; the title and the outlined thumbnail follow it.
 *  One app frame with no top bar and no filmstrip (2026-11-06, Kushagra: "lets simplify"): the photo
 *  edge to edge in the content area, and the export panel beside it, flush.
 *  Presets do most of the work; the details fold away. */
export function ExportApp({ photo = "city-hall" }: { photo?: string }) {
  return (
    <Shell contained className="kd-band-shell kd-export-shell">
      <ShellContent>
        {/* The photo runs edge to edge in the content area. */}
        <Box m="bleed" className="kd-export-bleed">
          <img src={`/figures/export/${photo}.webp`} alt="" className="kd-export-cover" />
        </Box>
      </ShellContent>
      <ShellInspector aria-label="Export" defaultOpen presentation="fixed" flush>
        <ShellPaneHeader>
          <Toolbar>
            <ToolbarTitle>Export 1 photo</ToolbarTitle>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll fade>
          <Stack gap="5" className="kd-wide">
            <ExportGroup title="Preset">
              <Stack gap="1" className="kd-wide">
                {EXPORT_PRESETS.map((preset, i) => (
                  <Row
                    key={preset.name}
                    current={i === 0}
                    trailing={
                      <Text size="2" emphasis="quiet">
                        {preset.detail}
                      </Text>
                    }
                  >
                    {preset.name}
                  </Row>
                ))}
              </Stack>
            </ExportGroup>
            <ExportGroup title="Location">
              <ExportRow label="Folder">
                <ExportSelect label="Folder" value="Pictures/Valencia" options={["Pictures/Valencia", "Desktop", "Choose…"]} />
              </ExportRow>
              <ExportRow label="Name">
                <TextField defaultValue="Valencia-001" aria-label="Name" />
              </ExportRow>
            </ExportGroup>
            <Accordion multiple defaultValue={["file", "size", "sharpen", "meta"]} className="kd-wide">
              <AccordionItem value="file">
                <AccordionTrigger>File settings</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Format">
                      <SegmentedControl defaultValue="jpeg" aria-label="Format" className="kd-wide">
                        <SegmentedItem value="jpeg">JPEG</SegmentedItem>
                        <SegmentedItem value="tiff">TIFF</SegmentedItem>
                        <SegmentedItem value="png">PNG</SegmentedItem>
                      </SegmentedControl>
                    </ExportRow>
                    <ExportRow label="Quality">
                      <NumberField defaultValue={85} min={0} max={100} aria-label="Quality" />
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="size">
                <AccordionTrigger>Image sizing</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Resize to">
                      <ExportSelect label="Resize to" value="Long edge" options={["Long edge", "Short edge", "Width and height"]} />
                    </ExportRow>
                    <ExportRow label="Long edge">
                      <NumberField defaultValue={2048} aria-label="Long edge in pixels" />
                    </ExportRow>
                    <ExportRow label="Resolution">
                      <NumberField defaultValue={72} aria-label="Resolution, pixels per inch" />
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="sharpen">
                <AccordionTrigger>Output sharpening</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Sharpen for">
                      <ExportSelect label="Sharpen for" value="Screen" options={["Screen", "Matte paper", "Glossy paper"]} />
                    </ExportRow>
                    <ExportRow label="Amount">
                      <SegmentedControl defaultValue="standard" aria-label="Amount" className="kd-wide">
                        <SegmentedItem value="low">Low</SegmentedItem>
                        <SegmentedItem value="standard">Standard</SegmentedItem>
                        <SegmentedItem value="high">High</SegmentedItem>
                      </SegmentedControl>
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="meta">
                <AccordionTrigger>Metadata</AccordionTrigger>
                <AccordionPanel>
                  <Stack gap="3" className="kd-wide">
                    <ExportRow label="Include">
                      <ExportSelect label="Include" value="Copyright only" options={["Copyright only", "All", "None"]} />
                    </ExportRow>
                    <ExportRow label="Copyright">
                      <TextField defaultValue="© 2026 Kookie Studio" aria-label="Copyright" />
                    </ExportRow>
                    <ExportRow label="Location">
                      <Flex align="center" justify="space-between" className="kd-wide">
                        <Text size="2" emphasis="quiet">
                          Remove
                        </Text>
                        <Switch aria-label="Remove location" defaultChecked />
                      </Flex>
                    </ExportRow>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <Text size="2" emphasis="quiet">
              About 2 MB
            </Text>
          </Stack>
        </ShellScroll>
        <ShellPaneFooter>
          {/* The step's two answers share the full width, half each (RULES.md 6: a flow's
              actions are full width; Kushagra, 2026-11-06: "export and cancel should share full
              width 50%"). */}
          <Grid columns="repeat(2, minmax(0, 1fr))" gap="3" className="kd-wide">
            <Button>Cancel</Button>
            <Button emphasis="loud">Export</Button>
          </Grid>
        </ShellPaneFooter>
      </ShellInspector>
    </Shell>
  );
}

export function ServeFigure() {
  return (
    <Band name="ServeFigure">
      <ScaleToBand share={1.7} className="kd-band-devices kd-render">
        <div className="kd-device">
          <Theme size="2" material="3" className="kd-band-window kd-export-window">
            <BrowserBar kind="desktop" url="kookie.studio/photos" />
            <ExportApp />
          </Theme>
        </div>
      </ScaleToBand>
    </Band>
  );
}
