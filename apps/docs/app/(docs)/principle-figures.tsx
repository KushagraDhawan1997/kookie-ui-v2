import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BookmarkAdd01Icon, Cancel01Icon, FavouriteIcon, InformationCircleIcon, NoteEditIcon, Share08Icon, TextFontIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Field,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  iconStroke,
  Link,
  Notice,
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
  ShellContent,
  ShellInspector,
  ShellNavGroup,
  ShellNavItem,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Spinner,
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
  ToolbarTitle,
} from "@kushagradhawan/kookie-ui-react";

import {
  ArrowLeftIcon,
  ChartIcon,
  ChevronRightIcon,
  CheckIcon,
  FileIcon,
  FolderIcon,
  TrashIcon,
  HomeIcon,
  MailIcon,
  MoreIcon,
  PanelLeftIcon,
  PlusIcon,
  ProgressIcon,
  RadioIcon,
  RedoIcon,
  SearchIcon,
  SettingsIcon,
  UndoIcon,
  UsersIcon,
} from "../icons";
import { Measures } from "./measures";

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
    "A builder's property panel for a selected button: content and appearance in two groups spaced apart, the labels at the controls' size, and one size throughout.",
  PrinciplesFigure:
    "An issue tracker: the work in the middle, navigation to the side, one action that stands out.",
  FitFigure:
    "The same settings screen on a desktop with a mouse and on a phone. Under touch, every row grows to 44 pixels.",
  OneFormFigure:
    "A billing screen with tabs that switch the view below them, and a segmented control that sets the date range in place.",
  ControlFigure:
    "An assistant renaming photos. The work in progress is visible and can be stopped, every change can be undone, and each row has a visible button for what a swipe would do.",
} as const;

type FigureName = keyof typeof PRINCIPLE_FIGURES;

/** The band: the gradient ground, the hairlines, the stage the window hangs from, and the measures
 *  read off whatever inside it carries `data-measure`. The stage is inert, because a figure is a
 *  picture of an app and not an app on the page. */
function Band({ name, measured, children }: { name: FigureName; measured?: boolean; children: React.ReactNode }) {
  return (
    <Box className="kd-band" role="img" aria-label={PRINCIPLE_FIGURES[name]}>
      <div className="kd-band-stage" inert>
        {children}
      </div>
      {measured ? <Measures /> : null}
    </Box>
  );
}

/** The side panes' widths go on the Shell, as in the hero, so the floating toolbars clear the
 *  pane's real width. */
const PANE_WIDTHS = { "--shell-sidebar-w": "232px" } as React.CSSProperties;

/* ── The hero: an issue tracker ─────────────────────────────────────────────────────────────── */

function Issue({ title, id, status, current }: { title: string; id: string; status: "doing" | "todo" | "done"; current?: boolean }) {
  const leading = status === "doing" ? <ProgressIcon /> : status === "done" ? <CheckIcon /> : <RadioIcon />;
  return (
    <Row
      render={<div />}
      leading={leading}
      trailing={
        <Text size="2" emphasis="quiet">
          {id}
        </Text>
      }
      {...(current ? { current: true } : {})}
    >
      {title}
    </Row>
  );
}

function IssueGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="2">
      <Text size="2" emphasis="medium">
        {label}
      </Text>
      <Stack gap="1">{children}</Stack>
    </Stack>
  );
}

/** The chapter's hero. A product built on Kookie, laid out the way the principles below ask: the
 *  person's work in front, everything else one step away, one loud action. The window starts two
 *  cells into the column and runs off its end, so the part that matters sits on the left. */
export function PrinciplesFigure() {
  return (
    <Band name="PrinciplesFigure">
      <div className="kd-device">
        <Theme size="1" className="kd-band-window">
          <Shell contained size="1" className="kd-band-shell" style={PANE_WIDTHS}>
            <ShellSidebar aria-label="Sections" defaultOpen presentation="fixed" flush>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Kookie Studio</ToolbarTitle>
                  <ToolbarButton iconOnly emphasis="loud" aria-label="New issue">
                    <PlusIcon />
                  </ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Stack gap="4">
                  <Stack gap="1">
                    <ShellNavItem leading={<MailIcon />} trailing={<Chip>3</Chip>}>
                      Inbox
                    </ShellNavItem>
                    <ShellNavItem leading={<HomeIcon />} current>
                      My issues
                    </ShellNavItem>
                    <ShellNavItem leading={<ChartIcon />}>Insights</ShellNavItem>
                  </Stack>
                  <ShellNavGroup label="Projects">
                    <ShellNavItem leading={<FolderIcon />}>Website</ShellNavItem>
                    <ShellNavItem leading={<FolderIcon />}>Mobile app</ShellNavItem>
                    <ShellNavItem leading={<FolderIcon />}>Docs</ShellNavItem>
                  </ShellNavGroup>
                </Stack>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <Flex align="center" gap="2">
                    <ToolbarButton iconOnly aria-label="Sections">
                      <PanelLeftIcon />
                    </ToolbarButton>
                    <ToolbarTitle>My issues</ToolbarTitle>
                  </Flex>
                  <Flex align="center" gap="2">
                    <ToolbarButton iconOnly aria-label="Search">
                      <SearchIcon />
                    </ToolbarButton>
                    <ToolbarButton iconOnly aria-label="More">
                      <MoreIcon />
                    </ToolbarButton>
                  </Flex>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="5">
                  <IssueGroup label="In progress">
                    <Issue status="doing" id="KUI-212" title="Sheet keeps focus on close" current />
                    <Issue status="doing" id="KUI-208" title="Tabs overflow on narrow windows" />
                  </IssueGroup>
                  <IssueGroup label="Todo">
                    <Issue status="todo" id="KUI-219" title="Field error under a select" />
                    <Issue status="todo" id="KUI-217" title="Menu groups in right-to-left" />
                    <Issue status="todo" id="KUI-214" title="Export a block as a file" />
                  </IssueGroup>
                  <IssueGroup label="Done">
                    <Issue status="done" id="KUI-205" title="Switch track in high contrast" />
                  </IssueGroup>
                </Stack>
              </ShellScroll>
            </ShellContent>
          </Shell>
        </Theme>
      </div>
    </Band>
  );
}

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
      <div className="kd-band-devices">
        <div className="kd-device">
          <Theme size="2" pointer="fine" className="kd-band-window kd-band-desktop">
            <SettingsApp />
          </Theme>
        </div>
        <div className="kd-band-phone">
          <Theme size="2" pointer="coarse" className="kd-band-phone-screen">
            <SettingsApp />
            <span className="kd-band-home-indicator" />
          </Theme>
        </div>
      </div>
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
        <Theme size="1" className="kd-band-window">
          <Shell contained size="1" className="kd-band-shell" style={PANE_WIDTHS}>
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

/* ── People stay in control: a handover you can see, stop and undo ─────────────────────────── */

function Photo({ name, meta }: { name: string; meta: string }) {
  return (
    <Row
      render={<div />}
      leading={<FileIcon />}
      trailing={
        <Flex align="center" gap="3">
          <Text size="2" emphasis="quiet">
            {meta}
          </Text>
          <Button iconOnly emphasis="quiet" aria-label={`More for ${name}`}>
            <MoreIcon />
          </Button>
        </Flex>
      }
    >
      {name}
    </Row>
  );
}

/** An assistant at work on the person's files. The handover is on screen while it runs, it has a
 *  Stop, the toolbar's undo reaches what it already changed, and every row's swipe has a button. */
export function ControlFigure() {
  return (
    <Band name="ControlFigure">
      <div className="kd-device">
        <Theme size="1" className="kd-band-window">
          <Shell contained size="1" className="kd-band-shell" style={PANE_WIDTHS}>
            <ShellSidebar aria-label="Library" defaultOpen presentation="fixed" flush>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <ToolbarTitle>Photos</ToolbarTitle>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll fade>
                <Stack gap="4">
                  <Stack gap="1">
                    <ShellNavItem leading={<HomeIcon />}>Library</ShellNavItem>
                    <ShellNavItem leading={<UsersIcon />}>People</ShellNavItem>
                  </Stack>
                  <ShellNavGroup label="Albums">
                    <ShellNavItem leading={<FolderIcon />} current>
                      Lisbon, May
                    </ShellNavItem>
                    <ShellNavItem leading={<FolderIcon />}>Studio</ShellNavItem>
                    <ShellNavItem leading={<FolderIcon />}>Family</ShellNavItem>
                  </ShellNavGroup>
                </Stack>
              </ShellScroll>
            </ShellSidebar>
            <ShellContent>
              <ShellPaneHeader>
                <Toolbar backdrop>
                  <Flex align="center" gap="2">
                    <ToolbarTitle>Lisbon, May</ToolbarTitle>
                    <ToolbarGroup>
                      <ToolbarButton iconOnly aria-label="Undo">
                        <UndoIcon />
                      </ToolbarButton>
                      <ToolbarButton iconOnly aria-label="Redo">
                        <RedoIcon />
                      </ToolbarButton>
                    </ToolbarGroup>
                  </Flex>
                  <ToolbarButton iconOnly aria-label="Search">
                    <SearchIcon />
                  </ToolbarButton>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="5" className="kd-band-column">
                  <Notice icon={<Spinner />} action={<Button>Stop</Button>}>
                    Renaming photos by date, 8 of 12
                  </Notice>
                  <Stack gap="1">
                    <Photo name="2026-05-14 Alfama 01.jpg" meta="4.2 MB" />
                    <Separator />
                    <Photo name="2026-05-14 Alfama 02.jpg" meta="3.8 MB" />
                    <Separator />
                    <Photo name="2026-05-15 Belém 01.jpg" meta="5.1 MB" />
                    <Separator />
                    <Photo name="2026-05-15 Belém 02.jpg" meta="4.7 MB" />
                    <Separator />
                    <Photo name="IMG_4471.jpg" meta="4.9 MB" />
                    <Separator />
                    <Photo name="IMG_4472.jpg" meta="5.3 MB" />
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

/* ── Composition: a builder's property panel ──────────────────────────────────────────────── */

/** One group of the panel. Space alone does the grouping, so the group needs no label or rule
 *  of its own: a label sits close to its control, the fields sit two steps further apart, and
 *  the groups one step further again. */
function PanelGroup({ children }: { children: React.ReactNode }) {
  return <Stack gap="5">{children}</Stack>;
}

/** The Composition chapter's figure. A good composition, not a busy one: a canvas holding the
 *  selected button, and the panel that edits it. The panel is what the chapter is about — groups
 *  by space, labels a step below the controls, one size, one loud thing on the canvas. */
export function CompositionFigure() {
  return (
    <Band name="CompositionFigure">
      <div className="kd-device">
        <Theme size="2" className="kd-band-window kd-band-window-narrow">
          <Shell contained className="kd-band-shell" style={{ "--shell-inspector-w": "304px" } as React.CSSProperties}>
            <ShellContent>
              <div className="kd-band-canvas">
                <Button size="2" emphasis="loud" className="kd-band-selected">
                  Continue
                </Button>
              </div>
            </ShellContent>
            <ShellInspector aria-label="Properties" defaultOpen presentation="fixed" flush>
              <ShellPaneHeader>
                <Toolbar>
                  <ToolbarTitle>Button</ToolbarTitle>
                </Toolbar>
              </ShellPaneHeader>
              <ShellScroll>
                <Stack gap="7">
                  <PanelGroup>
                    <Field>
                      <FieldLabel>Label</FieldLabel>
                      <TextField defaultValue="Continue" />
                    </Field>
                  </PanelGroup>
                  <PanelGroup>
                    <Field>
                      <FieldLabel>Size</FieldLabel>
                      <SegmentedControl defaultValue="2" aria-label="Size">
                        <SegmentedItem value="1">1</SegmentedItem>
                        <SegmentedItem value="2">2</SegmentedItem>
                        <SegmentedItem value="3">3</SegmentedItem>
                        <SegmentedItem value="4">4</SegmentedItem>
                      </SegmentedControl>
                    </Field>
                    <Field>
                      <FieldLabel>Emphasis</FieldLabel>
                      <SegmentedControl defaultValue="loud" aria-label="Emphasis">
                        <SegmentedItem value="quiet">Quiet</SegmentedItem>
                        <SegmentedItem value="medium">Medium</SegmentedItem>
                        <SegmentedItem value="loud">Loud</SegmentedItem>
                      </SegmentedControl>
                    </Field>
                    <Field>
                      <FieldLabel>Tone</FieldLabel>
                      <Select defaultValue="accent" items={{ accent: "Accent", neutral: "Neutral", destructive: "Destructive" }}>
                        <SelectTrigger />
                        <SelectContent>
                          <SelectItem value="accent">Accent</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="destructive">Destructive</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </PanelGroup>
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
      <div className="kd-band-devices">
        {(["light", "dark"] as const).map((mode) => (
          <Theme key={mode} appearance={mode} className="kd-band-phone">
            <Theme size="2" pointer="coarse" className="kd-band-phone-screen">
              <AppearanceSettings />
              <span className="kd-band-home-indicator" />
            </Theme>
          </Theme>
        ))}
      </div>
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
        <Theme size="2" className="kd-band-window kd-band-window-narrow">
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
        <Theme size="2" depth="elevated" className="kd-band-window kd-band-window-narrow">
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
        <Theme size="2" className="kd-band-window kd-band-window-narrow">
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
        <Theme size="2" className="kd-band-window kd-band-window-narrow">
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
        <Theme size="2" material="6" className="kd-band-window kd-band-window-narrow">
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
        <Theme size="2" className="kd-band-window kd-band-window-narrow">
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
          Notes
        </Text>
        <Text size="3">Bring a pencil and an A3 pad. The model sits for twenty minutes at a time.</Text>
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
