# Sheet

Sheet slides a panel in from an edge of the window and dims the app behind it until the task is done.

Job: Focus. Deal with one thing before going on. A leaf: it does one thing.

```tsx
<Sheet side="inline-end">
  <SheetTrigger render={<Button>Filters</Button>} />
  <SheetContent>
    <SheetTitle>Filters</SheetTitle>
    <SheetDescription>
      Narrow the deploys shown on this page.
    </SheetDescription>
    <SheetClose render={<Button>Apply</Button>} />
  </SheetContent>
</Sheet>
```

## Overview

Use a Sheet for a task that needs more room than a `Popover` but belongs beside the page rather than in the middle of it, such as filters, a share panel or navigation on a phone. The panel sits against an edge of the window and dims the app behind it.

For a task that belongs in the centre of the screen, use a `Dialog`, and for a short question that needs an answer, use an `AlertDialog`. For a panel that stays open while people keep working on the page, use a Shell pane such as `ShellInspector`.

A Sheet behaves like a `Dialog`. Focus stays inside the panel, the page behind it stops scrolling, and the dimmed background shows that the page is not available. Escape, a press on the dimmed background or a swipe toward the edge closes it, and `onOpenChange` tells you what closed it.

`side` can be `bottom`, which is the default, `inline-start` or `inline-end`. The inline sides follow the reading direction, so a panel that opens from the right in English opens from the left in Arabic without any change to your markup. While a person drags the panel toward its edge, it follows their finger, and on a phone a bottom sheet stays above the on-screen keyboard.

`size` sets the panel's width, padding and corner, together with the text size of `SheetTitle` and `SheetDescription`. A side sheet uses that width exactly, while a bottom sheet uses it as a maximum, so it fills a phone's width. Content that you add keeps its own sizes.

Screen readers announce the panel as a dialog, named by `SheetTitle` and described by `SheetDescription`. The part names follow shadcn/ui's sheet (MIT), and the behaviour comes from Base UI's Drawer.

## Not supported

- A top side, and a physical left or right — The top edge is where system and app toolbars sit, so a sheet does not open there. The sides follow the reading direction instead of left and right, so a layout works in both directions without changes.
- Header and footer parts, and a close button in the corner — Arrange the title and the actions yourself in a Stack. To add a close or apply button, place a real Button inside `SheetClose` wherever your layout needs it.
- `modal` and `disablePointerDismissal` — An open sheet always keeps focus inside the panel and stops the page from scrolling. For a panel that leaves the page usable, use a Shell pane.
- Snap points, and a swipe that opens the sheet — A sheet is either open or closed. Half-open positions and edge swipes that open it would conflict with the browser's own back gesture.
- A sheet inside a sheet — Two panels that each hold the focus cannot agree on which one has it. Change what the open sheet shows instead of opening a second one.
- `tone` and `emphasis` — The panel is a container and has no meaning of its own. Put tone and emphasis on the components inside it.
- An extra shadow — The dimmed page already shows that the sheet covers the app, so the panel adds no shadow of its own.

## Examples

```tsx
import {
  Button,
  Flex,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Sheet side="inline-end">
      <SheetTrigger render={<Button emphasis="medium">Filters</Button>} />
      <SheetContent>
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the deploys shown on this page.</SheetDescription>
          </Stack>
          <Stack gap="3">
            <Text size="2" weight="medium">Branch</Text>
            <TextField placeholder="main" aria-label="Branch" />
          </Stack>
          <Flex gap="3" justify="flex-end">
            <SheetClose render={<Button emphasis="quiet" bordered>Reset</Button>} />
            <SheetClose render={<Button emphasis="loud">Apply</Button>} />
          </Flex>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
```

### From the bottom

A sheet with the default `side="bottom"`. On a phone it fills the window's width, and on a wider window its width stops at a size that suits one task.

```tsx
import {
  Button,
  Flex,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

// `side="bottom"` is the default. On a phone the panel is the full width of the window.
// On a wider window its width stops at a size that suits one task.
export default function Example() {
  return (
    <Sheet>
      <SheetTrigger render={<Button emphasis="medium">Share project</Button>} />
      <SheetContent>
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Share project</SheetTitle>
            <SheetDescription>Anyone with the link can view this project.</SheetDescription>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <SheetClose render={<Button emphasis="loud">Copy link</Button>} />
          </Flex>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
```

### From the start edge

With `side="inline-start"`, the panel opens from the side where reading starts, which is the left in English. It suits navigation on a narrow window.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Home01Icon, Menu01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Row,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Stack,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// `side="inline-start"` opens the panel from the side where reading starts: the left in
// English. It is a common place for navigation on a narrow window.
export default function Example() {
  return (
    <Sheet side="inline-start">
      <SheetTrigger
        render={
          <Button iconOnly emphasis="quiet" aria-label="Open navigation">
            {icon(Menu01Icon)}
          </Button>
        }
      />
      <SheetContent>
        <Stack gap="5">
          <SheetTitle>Workspace</SheetTitle>
          <Stack gap="1">
            <Row current leading={icon(Home01Icon)} render={<a href="#overview" />}>
              Overview
            </Row>
            <Row leading={icon(Folder01Icon)} render={<a href="#projects" />}>
              Projects
            </Row>
            <Row leading={icon(Settings02Icon)} render={<a href="#settings" />}>
              Settings
            </Row>
          </Stack>
          <SheetClose render={<Button emphasis="quiet" bordered>Close</Button>} />
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
```

### Controlled

The open state lives in the example's own state, so the sheet can open from anywhere without a `SheetTrigger`. `onOpenChange` reports when a person closes it.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Flex,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Hold `open` in your own state to open the sheet from anywhere, with no SheetTrigger.
// `onOpenChange` tells you when a person closes it with Escape, a swipe or a press outside.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack gap="3" align="start">
      <Text size="2" emphasis="medium">
        Your trial ends in 3 days.
      </Text>
      <Button emphasis="medium" onClick={() => setOpen(true)}>
        Compare plans
      </Button>
      <Sheet side="inline-end" open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Stack gap="6">
            <Stack gap="2">
              <SheetTitle>Compare plans</SheetTitle>
              <SheetDescription>Team adds shared projects and an audit log.</SheetDescription>
            </Stack>
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered onClick={() => setOpen(false)}>
                Not now
              </Button>
              <Button emphasis="loud" onClick={() => setOpen(false)}>
                Upgrade to Team
              </Button>
            </Flex>
          </Stack>
        </SheetContent>
      </Sheet>
    </Stack>
  );
}
```

### Content taller than the window

When the content is taller than the window, the panel stops at the window's height and its body scrolls, while the page behind it stays still.

```tsx
import {
  Button,
  Flex,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const EVENTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  action: i % 3 === 0 ? "Deployed to production" : i % 3 === 1 ? "Changed billing email" : "Invited a member",
  time: `${i + 1} hours ago`,
}));

// When the content is taller than the window, the panel stops at the window's height and
// its body scrolls. The page behind it does not scroll.
export default function Example() {
  return (
    <Sheet side="inline-end">
      <SheetTrigger render={<Button emphasis="medium">View activity</Button>} />
      <SheetContent>
        <Stack gap="6">
          <Stack gap="2">
            <SheetTitle>Activity</SheetTitle>
            <SheetDescription>Everything that happened in this workspace today.</SheetDescription>
          </Stack>
          <Stack gap="3">
            {EVENTS.map((event, i) => (
              <Stack key={event.id} gap="3">
                {i > 0 && <Separator />}
                <Flex justify="space-between" gap="4">
                  <Text size="2">{event.action}</Text>
                  <Text size="2" emphasis="medium">
                    {event.time}
                  </Text>
                </Flex>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
```

### Right to left

Inside `dir="rtl"`, `inline-end` opens the panel from the left, and a swipe to the left closes it.

```tsx
import {
  Box,
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

// `side` follows the reading direction. Under `dir="rtl"`, `inline-end` opens the panel
// from the left, and a swipe to the left closes it.
export default function Example() {
  return (
    <Box dir="rtl">
      <Sheet side="inline-end">
        <SheetTrigger render={<Button emphasis="medium">Details</Button>} />
        <SheetContent>
          <Stack gap="6">
            <Stack gap="2">
              <SheetTitle>Invoice details</SheetTitle>
              <SheetDescription>Paid on 1 September by card.</SheetDescription>
            </Stack>
            <SheetClose render={<Button emphasis="loud">Done</Button>} />
          </Stack>
        </SheetContent>
      </Sheet>
    </Box>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Opening the sheet

#### Sheet

Sheet slides a panel in from an edge of the window and dims the app behind it until the task is done.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<SheetTrigger>` and a `<SheetContent>`, in either order. |
| `defaultOpen?` | `boolean` | Whether the sheet is open at the start, for an uncontrolled sheet. |
| `onOpenChange?` | `(open: boolean, details: SheetOpenChangeDetails) => void` | Called each time the sheet opens or closes. |
| `open?` | `boolean` | Whether the sheet is open, for a controlled sheet. |
| `side?` | `"bottom" \| "inline-start" \| "inline-end"` | The edge that the sheet comes in from. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the sheet, from `"1"` to `"4"`. |

#### SheetTrigger

The button that opens the sheet, usually with `render={<Button />}`. You don't need one if your own state opens the sheet

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The label of the button. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `nativeButton?` | `boolean` | Whether the rendered element is a native `<button>`. |
| `render?` | `RenderElement` | The element to render as the button, usually a Kookie `Button`: `<SheetTrigger render={<Button/>}>Filters</SheetTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Presenting the panel

#### SheetContent

The panel. It dims the page, places the panel against the chosen edge and applies your theme, and its body scrolls when the content is tall

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The content of the panel. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Naming the panel

#### SheetTitle

The heading of the panel and its accessible name. Its text size follows the sheet's `size`

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The title of the sheet. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<h2>`.

#### SheetDescription

A supporting line that screen readers read after the title, so avoid repeating the title's words in it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A short description of the sheet. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<p>`.

### Closing the sheet

#### SheetClose

Closes the sheet when pressed. Pass your own Button through `render` and place it wherever your layout needs it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The label of the button. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `nativeButton?` | `boolean` | Whether the rendered element is a native `<button>`. |
| `render?` | `RenderElement` | The element to render as the button, usually a Kookie `Button`: `<SheetTrigger render={<Button/>}>Filters</SheetTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.
