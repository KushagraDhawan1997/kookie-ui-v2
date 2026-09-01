import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartLineData01Icon,
  CreditCardIcon,
  Folder01Icon,
  GridViewIcon,
  Home01Icon,
  LayerIcon,
  Notification02Icon,
  PlugSocketIcon,
  PlusSignIcon,
  Rocket01Icon,
  Settings02Icon,
  ShapesIcon,
  SidebarLeftIcon,
  SwatchIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Heading,
  iconStroke,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellPaneFooter,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  ShellTrigger,
  Stack,
  Text,
} from "@kookie-ui/react";

// Your logo and your appearance store, not the package's: KookieUI ships no mark, the same
// way it ships no icon set, and which appearance a person chose is app state the app has to
// persist. What the package owns is the `Theme` scope those two feed.
import { AppearanceToggle } from "../app/appearance-toggle";
import { Wordmark } from "../app/(docs)/wordmark";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the
// system draws its own chevrons at, so your set matches them.
const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A pane's chrome floats over its scroller, so what should CLEAR the row pads by the reach
// the pane publishes, and what should run behind it ignores it. Minus the viewport's own
// re-pad, because a ShellScroll already insets by the pane's padding.
const clearsFloatingChrome = {
  paddingBlockStart: "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))",
  paddingBlockEnd: "calc(var(--kui-pane-inset-block-end) - var(--kui-sf-p))",
};

// And the fade is told how far the chrome reaches, so content is dissolving for the whole
// distance it spends behind the row rather than for the scrollbar's own default 32px.
const fadesOverFloatingChrome = {
  "--scrollbar-fade": "var(--kui-pane-inset-block-start)",
} as React.CSSProperties;

export default function Example() {
  return (
    // A frame fills what it is given, so give it a box. `m="bleed"` undoes the surrounding
    // pane's padding — an app frame reaches the edges of the thing it is in — and `flexGrow`
    // is what makes it take the whole line when that thing is a centred row.
    <Box m="bleed" style={{ flexGrow: 1, blockSize: "28rem" }}>
      <Shell>
        {/* Untouched, the sidebar rests open on a roomy window and closed on a narrow one.
            Nothing here decides that — CSS does, at first paint, with no script. */}
        <ShellSidebar aria-label="Sections">
          {/* `float` lifts the row out of flow: the nav scrolls behind it, and the pane
              publishes the row's reach for the scroller below to spend. The row itself
              paints nothing, so its controls state their own backdrop. */}
          <ShellPaneHeader float>
            <Wordmark />
            {/* Top-aligned, not centred: the mark is a display glyph and it defines the row,
                so centring the button would sink it below the trigger in the pane next door.
                Aligning to the start puts both at the same offset from their pane's padding. */}
            <Button
              emphasis="quiet"
              iconOnly
              backdrop
              aria-label="New"
              style={{ alignSelf: "start" }}
            >
              {icon(PlusSignIcon)}
            </Button>
          </ShellPaneHeader>

          {/* `fade` is what keeps the rows legible on their way behind the chrome. */}
          <ShellScroll fade style={fadesOverFloatingChrome}>
            <Box style={clearsFloatingChrome}>
              <ShellNavGroup label="Workspace">
                <ShellNavItem current leading={icon(Home01Icon)}>
                  Overview
                </ShellNavItem>
                <ShellNavItem leading={icon(Folder01Icon)}>Projects</ShellNavItem>
                <ShellNavItem leading={icon(Rocket01Icon)} trailing={<Chip>3</Chip>}>
                  Deploys
                </ShellNavItem>
                <ShellNavItem leading={icon(ChartLineData01Icon)}>Analytics</ShellNavItem>
              </ShellNavGroup>
              <ShellNavGroup label="Library">
                <ShellNavItem leading={icon(ShapesIcon)}>Components</ShellNavItem>
                <ShellNavItem leading={icon(GridViewIcon)}>Templates</ShellNavItem>
                <ShellNavItem leading={icon(SwatchIcon)}>Assets</ShellNavItem>
                <ShellNavItem leading={icon(LayerIcon)}>Versions</ShellNavItem>
              </ShellNavGroup>
              <ShellNavGroup label="Account">
                <ShellNavItem leading={icon(UserMultiple02Icon)}>Members</ShellNavItem>
                <ShellNavItem leading={icon(Notification02Icon)} trailing={<Chip>12</Chip>}>
                  Notifications
                </ShellNavItem>
                <ShellNavItem leading={icon(PlugSocketIcon)}>Integrations</ShellNavItem>
                <ShellNavItem leading={icon(CreditCardIcon)}>Billing</ShellNavItem>
                <ShellNavItem leading={icon(Settings02Icon)}>Settings</ShellNavItem>
              </ShellNavGroup>
            </Box>
          </ShellScroll>

          <ShellPaneFooter float>
            {/* The avatar rides a button, and that is not decoration: the footer FLOATS, so
                nav rows pass under it, and an avatar's fallback wash is an alpha — rows read
                straight through the disc. The button is what states `backdrop`, and an
                account avatar is a target in every app that has one anyway. */}
            <Button emphasis="quiet" iconOnly backdrop aria-label="Kushagra Dhawan">
              <Avatar fallback="KD" />
            </Button>
            <AppearanceToggle />
          </ShellPaneFooter>
        </ShellSidebar>

        <ShellContent>
          {/* The floating row holds CONTROLS and nothing else, and each states its own
              backdrop: the band paints nothing, so what keeps a button legible over the
              text passing behind it is the glass on the button itself. The page's own title
              scrolls with the page, which is why it is in the column below rather than
              here. */}
          <ShellPaneHeader float>
            {/* The one thing that crosses the frame: a button that drives a pane by name.
                It is the route back once the sidebar closes or overlays. */}
            <ShellTrigger
              target="sidebar"
              render={
                <Button
                  emphasis="quiet"
                  iconOnly
                  backdrop
                  aria-label="Toggle navigation"
                />
              }
            >
              {icon(SidebarLeftIcon)}
            </ShellTrigger>
            <Button backdrop leading={icon(PlusSignIcon)}>
              New project
            </Button>
          </ShellPaneHeader>

          {/* The work area scrolls itself; the frame never does. */}
          <ShellScroll fade style={fadesOverFloatingChrome}>
            <Stack gap="7" style={clearsFloatingChrome}>
              <Heading size="6">Overview</Heading>
              <Stack gap="5">
                <Text>
                  Two deploys finished this morning and one is still building. Nothing is
                  waiting on you.
                </Text>
                <Text>
                  Every pane places itself in one grid by name, so the shell never inspects
                  its children and the order you write them in stays the order they are read
                  in.
                </Text>
                <Text>
                  A pane you have not touched rests on auto, and the window size decides what
                  auto means — open here, an overlay on a phone, with no script involved.
                </Text>
                <Text>
                  Set the size once on Shell and every pane takes it: the padding first, then
                  the nav rows, the rail squares and the header row inside them.
                </Text>
                <Text>
                  Scroll this column and the chrome stays where it is. The frame never moves;
                  only the region you marked with ShellScroll does.
                </Text>
              </Stack>
            </Stack>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
