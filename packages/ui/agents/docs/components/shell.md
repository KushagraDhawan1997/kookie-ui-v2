# Shell

Shell is the frame of an app, with a header, a rail, a sidebar, the content, an inspector and a bottom pane.

Job: Go. Move to another place in the app. A pattern: it owns the decisions this job needs.

```tsx
<Shell>
  <ShellHeader>…</ShellHeader>
  <ShellRail aria-label="Regions">
    <ShellRailList>
      <ShellRailItem label="Files">{icon}</ShellRailItem>
    </ShellRailList>
  </ShellRail>
  <ShellSidebar aria-label="Sections">
    <ShellPaneHeader float>
      <ShellTrigger target="sidebar" action="toggle" />
    </ShellPaneHeader>
    <ShellScroll fade>
      <ShellNavGroup label="Workspace">
        <ShellNavItem current>Home</ShellNavItem>
      </ShellNavGroup>
    </ShellScroll>
    <ShellPaneFooter>…</ShellPaneFooter>
  </ShellSidebar>
  <ShellContent>…</ShellContent>
  <ShellInspector aria-label="Details">…</ShellInspector>
  <ShellBottom aria-label="Console">…</ShellBottom>
</Shell>
```

## Overview

Use a Shell once, at the root of an app, to hold its frame: a full-width header, a narrow rail of icons, a sidebar, the main content, an inspector and a bottom pane. Include only the panes you need, and put your pages inside `ShellContent`.

Each pane places itself in the frame by its type, so you can write the panes in any order and that order stays the reading order. Every pane is a landmark: the header is a `<header>`, the rail and the sidebar are `<nav>` elements, the content is `<main>`, and the inspector and the bottom pane are `<aside>` elements.

Until someone opens or closes it, a pane follows the window size. The sidebar is open on a wide window and opens as an overlay on a narrow one, while the rail becomes a tab bar along the bottom. The inspector and the bottom pane start closed. CSS makes these choices, so the first paint is right before any script runs.

A `ShellTrigger` opens or closes a pane by name from anywhere in the frame. To hold a pane's state yourself, pass `open` and `onOpenChange`. Set `resizable` on the sidebar or the inspector to let people drag its edge to a new width.

By default the panes join edge to edge, with a single line between them. Set `flush={false}` on the side panes to float them over the content as separate panels, or on `ShellContent` to set the work area in from the frame as its own panel.

`size` on the Shell sets the size of the navigation rows, the rail items, the header rows and the padding in every pane, and each pane can set its own. A Shell fills the window by default, and `contained` makes it fill its parent instead, such as a card or a demo.

When a pane opens as an overlay, focus moves into it and the rest of the frame is unavailable until Escape, a press outside the pane or a `ShellTrigger` closes it.

## Not supported

- A `gap` prop — The space around floating panes is one step of the theme's layout spacing, so it tightens and loosens with density. A custom number would fall out of step with the rest of the app.
- A header position option — The `ShellHeader` always spans the full width. For a header over the content only, put a header inside `ShellContent`.
- A narrow mode for the sidebar — A narrow column of icons is a rail, so use a `ShellRail` beside the sidebar. The two are separate panes that you can connect yourself.
- Closing the sidebar together with the rail — Whether the two panes open and close together depends on the app, and many apps keep them independent. Use `ShellTrigger` or controlled state to link them.
- A half-open `peek` state — A pane is either open or closed. A half-open pane is complex to build and adds little, so it will wait until a real screen needs it.
- An action on `ShellRailItem` — A rail item goes to a place in the app. For a control that does something else, such as opening search, use `ShellRailAction`, which sits beside the group of places in the tab bar.
- `backdrop` on `ShellContent` — Nothing ever sits behind the work area, so glass there would have nothing to show through. Put a Box or a Card with `backdrop` inside the content instead.
- A tab bar built from the sidebar — A tab bar holds three to five items, while a sidebar is often much longer, so you choose what a phone shows by writing a `ShellTabBar` or a `ShellRail`.
- A tab bar that changes what the sidebar shows — Each item in a tab bar goes to a place, so it takes a link rather than an `onClick`. To change what a pane shows, use a rail.
- A `presentation` value for floating panes — A pane floats or stands apart when you set `flush={false}`, and the Shell works out which of the two you get from the other panes.

## Examples

```tsx
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
  Toolbar,
  ToolbarButton,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

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

// Nothing here tells the fade how far to reach. A pane with a floating row hands its own
// scroller that edge's published reach, so content dissolves for the whole distance it
// spends behind the chrome with nothing said at the call site.

export default function Example() {
  return (
    // A `contained` frame fills what it is given, so give it a box. An app frame writes neither:
    // it is the window. `m="bleed"` undoes the surrounding
    // pane's padding — an app frame reaches the edges of the thing it is in — and `flexGrow`
    // is what makes it take the whole line when that thing is a centred row.
    <Box m="bleed" style={{ flexGrow: 1, blockSize: "28rem" }}>
      <Shell contained>
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
            <Button iconOnly backdrop aria-label="New" style={{ alignSelf: "start" }}>
              {icon(PlusSignIcon)}
            </Button>
          </ShellPaneHeader>

          {/* `fade` is what keeps the rows legible on their way behind the chrome. */}
          <ShellScroll fade>
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

          {/* A TOOLBAR, like the header above it: the band states its index and the row is one
              tab stop with the arrows moving inside it. A bare band hands its children the
              PANE's index instead, so two rows in one pane would rest at different sizes. */}
          <ShellPaneFooter float>
            {/* `backdrop` on the ROW: the band floats, so nav rows pass behind everything in
                it — one fact about the space rather than a prop per control. */}
            <Toolbar backdrop>
              {/* The avatar rides a button, and that is not decoration: the footer FLOATS, so
                  nav rows pass under it, and an avatar's fallback wash is an alpha — rows read
                  straight through the disc. The button is what states `backdrop`, and an
                  account avatar is a target in every app that has one anyway. */}
              <ToolbarButton iconOnly aria-label="Kushagra Dhawan">
                <Avatar fallback="KD" />
              </ToolbarButton>
              <AppearanceToggle />
            </Toolbar>
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
                <Button iconOnly backdrop aria-label="Toggle navigation" />
              }
            >
              {icon(SidebarLeftIcon)}
            </ShellTrigger>
            <Button backdrop leading={icon(PlusSignIcon)}>
              New project
            </Button>
          </ShellPaneHeader>

          {/* The work area scrolls itself; the frame never does. */}
          <ShellScroll fade>
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
```

### A notice for the whole app

A `ShellNotice` is a `Notice` in its own row above the header, across every column. Use it for a condition about the whole app, such as planned maintenance. Your app stores the dismissal, and removing the notice gives the frame its height back.

```tsx
"use client";

import * as React from "react";
import {
  Box,
  Button,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNotice,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// ShellNotice puts a Notice in its own row above the header, across every column. The
// dismissal is your state: store it wherever it must survive. Here it lasts for the session.
export default function Example() {
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        {dismissed ? null : (
          <ShellNotice
            tone="warning"
            action={<Button>Read the plan</Button>}
            onDismiss={() => setDismissed(true)}
          >
            Scheduled maintenance on Sunday from 02:00 to 03:00 UTC.
          </ShellNotice>
        )}
        <ShellHeader>
          <Text size="2" weight="medium">
            Acme Studio
          </Text>
        </ShellHeader>
        <ShellSidebar aria-label="Sections">
          <ShellNavGroup label="Workspace">
            <ShellNavItem current>Overview</ShellNavItem>
            <ShellNavItem>Projects</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          {dismissed ? (
            <Button emphasis="quiet" bordered onClick={() => setDismissed(false)}>
              Show the notice again
            </Button>
          ) : (
            <Heading size="6">Overview</Heading>
          )}
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### A full-width header

A `ShellHeader` runs across every column. The `ShellTrigger` in it toggles the sidebar, so people can bring the sidebar back after they close it.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Home01Icon, Rocket01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// ShellHeader is a full-width bar above every column. A ShellTrigger in it opens and
// closes the sidebar, so people can get the sidebar back after they close it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellHeader>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="3">
              <ShellTrigger
                target="sidebar"
                render={<Button iconOnly emphasis="quiet" aria-label="Toggle navigation" />}
              >
                {icon(SidebarLeftIcon)}
              </ShellTrigger>
              <Text size="2" weight="medium">
                Acme Studio
              </Text>
            </Flex>
            <Button emphasis="loud">New project</Button>
          </Flex>
        </ShellHeader>
        <ShellSidebar aria-label="Sections">
          <ShellNavGroup label="Workspace">
            <ShellNavItem current leading={icon(Home01Icon)}>
              Overview
            </ShellNavItem>
            <ShellNavItem leading={icon(Folder01Icon)}>Projects</ShellNavItem>
            <ShellNavItem leading={icon(Rocket01Icon)}>Deploys</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Overview</Heading>
            <Text size="2" emphasis="medium">
              Two deploys finished this morning.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### A rail beside the sidebar

A `ShellRail` holds icons for the app's top-level areas, and the sidebar lists the pages in the chosen area. Each `<nav>` has its own `aria-label`.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  Home01Icon,
  Notification02Icon,
  Search01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellRail,
  ShellRailItem,
  ShellRailList,
  ShellSidebar,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A ShellRail is a narrow column of icons for the top-level areas of an app. The sidebar
// beside it lists the pages in the chosen area. Give each `<nav>` its own `aria-label`.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellRail aria-label="Areas">
          <ShellRailList>
            <ShellRailItem label="Home" current>
              {icon(Home01Icon)}
            </ShellRailItem>
            <ShellRailItem label="Search">{icon(Search01Icon)}</ShellRailItem>
            <ShellRailItem label="Inbox">{icon(Notification02Icon)}</ShellRailItem>
          </ShellRailList>
          <ShellRailList>
            <ShellRailItem label="Settings">{icon(Settings02Icon)}</ShellRailItem>
          </ShellRailList>
        </ShellRail>
        <ShellSidebar aria-label="Pages">
          <ShellNavGroup label="Home">
            <ShellNavItem current>Overview</ShellNavItem>
            <ShellNavItem leading={icon(Folder01Icon)}>Recent files</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Overview</Heading>
            <Text size="2" emphasis="medium">
              The rail picks the area. The sidebar shows the pages inside it.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### A details inspector

A `ShellInspector` is a details column at the end of the frame. It is closed unless something opens it, so this example starts it open with `defaultOpen`, and a `ShellTrigger` in the content toggles it.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarRightIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellInspector,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// ShellInspector is a details column at the end of the frame. It stays closed until a
// ShellTrigger opens it. Pass `defaultOpen` to start it open.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellContent>
          <Flex align="start" justify="space-between" gap="4">
            <Stack gap="2">
              <Heading size="6">hero-final.png</Heading>
              <Text size="2" emphasis="medium">
                Uploaded to Brand kit.
              </Text>
            </Stack>
            <ShellTrigger
              target="inspector"
              render={<Button iconOnly emphasis="quiet" aria-label="Toggle details" />}
            >
              <HugeiconsIcon icon={SidebarRightIcon} strokeWidth={iconStroke} aria-hidden />
            </ShellTrigger>
          </Flex>
        </ShellContent>
        <ShellInspector aria-label="Details" defaultOpen>
          <Stack gap="4">
            <Heading size="4">Details</Heading>
            <Stack gap="1">
              <Text size="2" emphasis="medium">
                Owner
              </Text>
              <Text size="2">Shruti Bhatia</Text>
            </Stack>
            <Stack gap="1">
              <Text size="2" emphasis="medium">
                Size
              </Text>
              <Text size="2">3.8 MB</Text>
            </Stack>
          </Stack>
        </ShellInspector>
      </Shell>
    </Box>
  );
}
```

### A bottom pane for logs

A `ShellBottom` is a full-width pane under the columns, for a console or a build log. This example starts it open with `defaultOpen`, and a `ShellTrigger` toggles it.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandLineIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Shell,
  ShellBottom,
  ShellContent,
  ShellTrigger,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// ShellBottom is a full-width pane under the columns, for a console or a log. It stays
// closed until a ShellTrigger opens it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellContent>
          <Flex align="start" justify="space-between" gap="4">
            <Stack gap="2">
              <Heading size="6">Deploy #214</Heading>
              <Text size="2" emphasis="medium">
                Building the main branch.
              </Text>
            </Stack>
            <ShellTrigger
              target="bottom"
              render={
                <Button
                  emphasis="medium"
                  leading={<HugeiconsIcon icon={CommandLineIcon} strokeWidth={iconStroke} aria-hidden />}
                />
              }
            >
              Build log
            </ShellTrigger>
          </Flex>
        </ShellContent>
        <ShellBottom aria-label="Build log" defaultOpen>
          <Stack gap="2">
            <Code>Installing dependencies…</Code>
            <Code>Compiled 412 modules in 8.4s</Code>
          </Stack>
        </ShellBottom>
      </Shell>
    </Box>
  );
}
```

### Floating side panes

The rail and sidebar have `flush={false}` while the content stays flush. The content fills the whole frame, and the two panes float over it as separate panels.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, LayerIcon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellRail,
  ShellRailItem,
  ShellRailList,
  ShellSidebar,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `flush={false}` on the side panes and leave the content flush. The content then fills
// the whole frame, and the panes float over it as separate panels.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellRail aria-label="Tools" flush={false}>
          <ShellRailList>
            <ShellRailItem label="Home" current>
              {icon(Home01Icon)}
            </ShellRailItem>
            <ShellRailItem label="Search">{icon(Search01Icon)}</ShellRailItem>
          </ShellRailList>
        </ShellRail>
        <ShellSidebar aria-label="Layers" flush={false}>
          <ShellNavGroup label="Layers">
            <ShellNavItem current leading={icon(LayerIcon)}>
              Header
            </ShellNavItem>
            <ShellNavItem leading={icon(LayerIcon)}>Hero image</ShellNavItem>
            <ShellNavItem leading={icon(LayerIcon)}>Footer</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">Canvas</Heading>
            <Text size="2" emphasis="medium">
              The work area runs under the rail and the sidebar.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### Content as its own panel

Only `ShellContent` has `flush={false}`. The work area becomes a separate panel set in from the frame, while the header and sidebar stay joined to it.

```tsx
import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellHeader,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Set `flush={false}` on ShellContent and leave the other panes flush. The work area
// becomes its own panel, set in from the frame, while the header and sidebar stay joined.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellHeader>
          <Text size="2" weight="medium">
            Acme Mail
          </Text>
        </ShellHeader>
        <ShellSidebar aria-label="Folders">
          <ShellNavGroup label="Folders">
            <ShellNavItem current>Inbox</ShellNavItem>
            <ShellNavItem>Drafts</ShellNavItem>
            <ShellNavItem>Archive</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent flush={false}>
          <Stack gap="2">
            <Heading size="6">Inbox</Heading>
            <Text size="2" emphasis="medium">
              You have no unread messages.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### A resizable sidebar

With `resizable`, people can drag the sidebar's edge or move it with the arrow keys. `minWidth` and `maxWidth` limit the width, and `onResize` reports the new width so you can store it.

```tsx
import {
  Box,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Set `resizable` to let people drag the sidebar's edge, or step it with the arrow keys.
// `minWidth` and `maxWidth` limit the drag. Store the width from `onResize` to keep it.
export default function Example() {
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellSidebar aria-label="Files" resizable width={240} minWidth={180} maxWidth={360}>
          <ShellNavGroup label="Files">
            <ShellNavItem current>README.md</ShellNavItem>
            <ShellNavItem>package.json</ShellNavItem>
            <ShellNavItem>src/components/navigation-menu.tsx</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="2">
            <Heading size="6">README.md</Heading>
            <Text size="2" emphasis="medium">
              Drag the sidebar's edge to show longer file names.
            </Text>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### Controlled

The sidebar's `open` state lives in the example's own state, so a Switch in the content can show and hide it. `onOpenChange` fires only when a person opens or closes the pane.

```tsx
"use client";

import * as React from "react";
import {
  Box,
  Flex,
  Heading,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Switch,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Pass `open` and `onOpenChange` to hold a pane's state yourself, for example to remember
// it between visits. `onOpenChange` fires only when a person opens or closes the pane.
export default function Example() {
  const [open, setOpen] = React.useState(true);
  return (
    <Box m="bleed" flexGrow="1" height="24rem">
      <Shell contained>
        <ShellSidebar aria-label="Sections" open={open} onOpenChange={setOpen}>
          <ShellNavGroup label="Settings">
            <ShellNavItem current>Profile</ShellNavItem>
            <ShellNavItem>Notifications</ShellNavItem>
            <ShellNavItem>Billing</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <Stack gap="4">
            <Heading size="6">Profile</Heading>
            <Flex gap="3" align="center" render={<label />}>
              <Switch checked={open} onCheckedChange={setOpen} />
              <Text size="2">Show the sidebar</Text>
            </Flex>
          </Stack>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### The frame

#### Shell

Shell is the frame of an app, with a header, a rail, a sidebar, the content, an inspector and a bottom pane.

| Prop | Type | What it does |
| --- | --- | --- |
| `contained?` | `boolean` | Makes the shell fill its parent element instead of the window. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step for the shell's panes and navigation. |

It also takes every prop of a `<div>`.

### The panes

#### ShellNotice

A `Notice` about the whole app, in its own row above the header and across every column. It takes the `Notice` props, plus `flush`

| Prop | Type | What it does |
| --- | --- | --- |
| `action?` | `React.ReactNode` | One action that fixes the condition, such as "Get more usage". |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the notice, such as a scrolling region. |
| `children` | `React.ReactNode` | The message, usually one sentence. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `dismissLabel?` | `string` | The accessible name of the dismiss button. |
| `flush?` | `boolean` | Joins the notice to the frame: square corners, edge to edge. |
| `icon?` | `React.ReactNode` | An icon shown before the message. |
| `onDismiss?` | `() => void` | Called when the person presses the ✕ dismiss button. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size of the notice: the padding, the corner, the text and the dismiss button. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family, which tells the category of the message. |

#### ShellHeader

The bar across the top of the whole frame, rendered as a `<header>` landmark. For a header over the content only, put one inside `ShellContent`

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the header: its padding, its row height and the controls in it. |

It also takes every prop of a `<header>`.

#### ShellSidebar

The wide navigation column, rendered as a `<nav>`. It is open on a wide window and opens as an overlay on a narrow one, unless you open or close it yourself

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. |
| `defaultOpen?` | `boolean` | Sets whether the pane starts open when you do not control it. |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `maxWidth?` | `number` | Sets the largest width, in CSS pixels, that a resize can give the pane. |
| `minWidth?` | `number` | Sets the smallest width, in CSS pixels, that a resize can give the pane. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. |
| `onResize?` | `(width: number) => void` | Called once when the user ends a resize, with the pane's new width. |
| `open?` | `boolean` | Controls whether the pane is open. |
| `presentation?` | `"auto" \| "fixed" \| "overlay" \| "bar"` | Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. |
| `resizable?` | `boolean` | Lets the user drag the pane's edge to change its width. |
| `resizeLabel?` | `string` | Sets the accessible name of the resize handle. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the pane: its padding, its rows and its buttons. |
| `width?` | `number` | Sets the pane's width in CSS pixels. |

It also takes every prop of a `<nav>`.

#### ShellContent

The work area, rendered as `<main>`, which fills the space the other panes leave. It scrolls inside the frame, except on a narrow touch screen, where the page itself scrolls

| Prop | Type | What it does |
| --- | --- | --- |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the pane: its padding and the controls in it. |

It also takes every prop of a `<main>`.

#### ShellInspector

The details column at the end of the frame, rendered as an `<aside>`. It starts closed, unless you set `defaultOpen`

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. |
| `defaultOpen?` | `boolean` | Sets whether the pane starts open when you do not control it. |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `maxWidth?` | `number` | Sets the largest width, in CSS pixels, that a resize can give the pane. |
| `minWidth?` | `number` | Sets the smallest width, in CSS pixels, that a resize can give the pane. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. |
| `onResize?` | `(width: number) => void` | Called once when the user ends a resize, with the pane's new width. |
| `open?` | `boolean` | Controls whether the pane is open. |
| `presentation?` | `"auto" \| "fixed" \| "overlay" \| "bar"` | Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. |
| `resizable?` | `boolean` | Lets the user drag the pane's edge to change its width. |
| `resizeLabel?` | `string` | Sets the accessible name of the resize handle. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the pane: its padding, its rows and its buttons. |
| `width?` | `number` | Sets the pane's width in CSS pixels. |

It also takes every prop of a `<nav>`.

#### ShellBottom

A full-width pane below the columns for a console or a log, rendered as an `<aside>`. It starts closed, unless you set `defaultOpen`

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. |
| `defaultOpen?` | `boolean` | Sets whether the pane starts open when you do not control it. |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `height?` | `number` | Sets the pane's height in CSS pixels. |
| `maxHeight?` | `number` | Sets the largest height, in CSS pixels, that a resize can give the pane. |
| `minHeight?` | `number` | Sets the smallest height, in CSS pixels, that a resize can give the pane. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. |
| `onResize?` | `(height: number) => void` | Called once when the user ends a resize, with the pane's new height. |
| `open?` | `boolean` | Controls whether the pane is open. |
| `presentation?` | `"auto" \| "fixed" \| "overlay" \| "bar"` | Sets how the pane takes space when it is open. - `auto`, the default: in the layout on a wide window, and over the content on a narrow one. - `fixed`: always in the layout. - `overlay`: always over the content, with a scrim. |
| `resizable?` | `boolean` | Lets the user drag the pane's top edge to change its height. |
| `resizeLabel?` | `string` | The handle's accessible name. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the pane: its padding and the controls in it. |

It also takes every prop of a `<aside>`.

### The rail and the tab bar

#### ShellRail

The narrow column of icons for the app's top-level areas, rendered as a `<nav>`. On a narrow window it becomes a tab bar along the bottom. When a sidebar is present too, give each an `aria-label`

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind this pane, such as a canvas, a map or an image. |
| `defaultOpen?` | `boolean` | Sets whether the pane starts open when you do not control it. |
| `flush?` | `boolean` | Sets whether this pane joins the app frame. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the user opens or closes the pane: with a trigger, the Escape key or a press on the scrim. |
| `open?` | `boolean` | Controls whether the pane is open. |
| `presentation?` | `"auto" \| "bar" \| "rail" \| "overlay"` | Sets how the rail looks on a narrow window. - `auto`, the default: a rail on a wide window, and a tab bar along the bottom on a narrow one. - `bar`: a tab bar on a narrow window, and nothing on a wide one. - `rail`: never a tab bar. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the pane: its padding, its rows and its buttons. |

It also takes every prop of a `<nav>`.

#### ShellRailList

A group of rail items. A rail often has two, one for the app's areas at the top and one for account and settings at the bottom. In the tab bar, this group holds the places

It declares no props of its own. It takes every prop of a `<div>`.

#### ShellRailItem

One square in the rail, for one of the app's main areas. It shows only an icon, so give it a `label`, which screen readers announce and the tab bar shows under the icon

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | Sets the item's name. |
| `current?` | `boolean` | Marks the item as the current section. |
| `label?` | `string` | Sets the item's name. |
| `render?` | `RenderElement` | Renders the item as another element, such as a link: `render={<a href="/inbox" />}`. |

It also takes every prop of a `<button>`.

#### ShellRailAction

A control in the rail or tab bar that does something rather than going somewhere, such as opening search. In the tab bar it sits apart from the group of places, so it does not look like a destination

| Prop | Type | What it does |
| --- | --- | --- |
| `label` | `string` | Sets the button's name. |
| `render?` | `RenderElement` | Renders the button as another element, such as a link, for an action that goes to a page. |

It also takes every prop of a `<button>`.

#### ShellTabBar

A tab bar for an app without a rail. On a narrow window it shows three to five places along the bottom, and on a wide window it shows nothing, because the sidebar holds the navigation. It is optional: without it, the sidebar opens as a drawer at every width

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.

### Inside a pane

#### ShellScroll

The part of a pane that scrolls. The pane's other children stay in place, and this part fills the space that is left

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name of the scroll area. |
| `aria-labelledby?` | `string` | The id of an element that names the scroll area, usually a heading above it. |
| `children?` | `React.ReactNode` | The content that scrolls. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `fade?` | `boolean` | Fades the content at each edge that has more content beyond it. |
| `focusable?` | `boolean` | Whether keyboard users can tab to the scroll area. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved.  |

#### ShellPaneHeader

A header row at the top of a pane. It is one control row tall at the pane's size, so it lines up with the rail and the app header beside it. With `float`, the pane's content scrolls behind it

| Prop | Type | What it does |
| --- | --- | --- |
| `float?` | `boolean` | Makes the row float over the pane's scrolling content, so the content passes behind it. |

It also takes every prop of a `<div>`.

#### ShellPaneFooter

The same kind of row at the bottom of a pane. With `float`, the pane's content scrolls behind it

| Prop | Type | What it does |
| --- | --- | --- |
| `float?` | `boolean` | Makes the row float over the pane's scrolling content, so the content passes behind it. |

It also takes every prop of a `<div>`.

### Navigation rows

#### ShellNavGroup

A group of navigation rows under a heading. Screen readers announce the heading as the name of the group

| Prop | Type | What it does |
| --- | --- | --- |
| `label?` | `React.ReactNode` | The group's heading. |

It also takes every prop of a `<div>`.

#### ShellNavItem

One navigation row, as tall as a Button at the same size. Set `current` on the row for the page that is open

| Prop | Type | What it does |
| --- | --- | --- |
| `current?` | `boolean` | Marks the row as the current page. |
| `leading?` | `React.ReactNode` | Sets the icon before the label. |
| `render?` | `RenderElement` | Renders the row as another element, such as a link: `render={<a href="/settings" />}`. |
| `trailing?` | `React.ReactNode` | Sets content after the label, at the far edge of the row, such as a count or a chevron. |

It also takes every prop of a `<button>`.

### Opening and closing a pane

#### ShellTrigger

A button that opens, closes or toggles a pane by name, from anywhere in the frame

| Prop | Type | What it does |
| --- | --- | --- |
| `action?` | `"toggle" \| "open" \| "close"` | Sets what a press does to the `target` pane: `toggle`, `open` or `close`. |
| `render?` | `RenderElement` | Renders the trigger as another element, usually a Kookie `Button`: `<ShellTrigger target="sidebar" render={<Button iconOnly />} />`. |
| `target` | `"rail" \| "sidebar" \| "inspector" \| "bottom"` | Which pane this button drives. |

It also takes every prop of a `<button>`.
