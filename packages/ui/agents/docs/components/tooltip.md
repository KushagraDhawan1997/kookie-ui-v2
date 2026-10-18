# Tooltip

Tooltip shows the name of a control when the pointer rests on it or the control receives keyboard focus.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button aria-label="Undo" />} />
    <TooltipContent>Undo</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Overview

A Tooltip shows a short label when the pointer rests on a control or the control receives keyboard focus. Use it to name an icon-only button and to show its keyboard shortcut.

A tooltip should only repeat what the control already says. Touch screens have no hover, so tooltips never open there, and screen readers don't announce them. Give the control an `aria-label` with the same name, so everyone gets the information whether or not they see the tooltip.

When the panel needs more than one line of text, a form or a link, use a `Popover`. For a hint that touch users also need, use a `FieldDescription` or a `Notice`. `TooltipContent` accepts only a string, so write a shortcut as text, for example `Undo ⌘Z`.

A tooltip uses inverted colours, dark on a light page and light on a dark page. It opens above the control by default. Use `side` and `align` on `TooltipContent` to change that, and the tooltip moves to the opposite side when there isn't enough room.

Put one `TooltipProvider` near the root of your app. It sets the delay for every tooltip inside it and groups them, so once one tooltip has opened, the next ones open straight away as the pointer moves along a row of buttons. Base UI's Tooltip provides the behaviour, and the part names follow shadcn/ui.

## Use instead

- `Popover` when the panel holds content or controls people need.

## Not supported

- Content that is not a string — A tooltip inverts the colours of its panel, and other components placed inside it wouldn't invert with it. Write a shortcut into the text, or use a Popover for richer content.
- A size — A tooltip has one small size everywhere, because it shows one short line of text whatever the size of the control it names.
- `tone` and `emphasis` — A tooltip only repeats a control's name, so a colour or a level of prominence would have nothing to say.
- A delay you set per tooltip — Tooltips that open at different speeds make an app feel inconsistent. Set the delay once, on the `TooltipProvider` near the root of your app.
- Support for touch screens — Phones have no hover, so tooltips never open there. Put any hint that touch users need in a `FieldDescription` or a `Notice`.
- A material — The inverted colours already give a tooltip the strongest contrast available, and glass would add a second edge around a small panel.
- An arrow — The tooltip opens right next to its control, so its position already shows which control it names.

## Examples

```tsx
import { Button, Flex, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@kushagradhawan/kookie-ui-react";

const ACTIONS = ["Undo", "Redo", "Comment"] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        {ACTIONS.map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button emphasis="quiet" iconOnly aria-label={label}>
                  {label.slice(0, 1)}
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
```

### Icon buttons

Each icon-only button has an `aria-label`, and its tooltip repeats the same name. Your `Button` goes to `TooltipTrigger` through `render`, and the `TooltipProvider` lets the tooltips open quickly one after another.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Download01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const ACTIONS = [
  { label: "Share", glyph: Share08Icon },
  { label: "Download", glyph: Download01Icon },
  { label: "Delete", glyph: Delete02Icon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        {ACTIONS.map(({ label, glyph }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button iconOnly emphasis="quiet" aria-label={label}>
                  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
```

### Keyboard shortcuts

The shortcut follows the name in the tooltip text. The button also sets `aria-keyshortcuts`, because screen readers don't announce the tooltip.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Redo02Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button iconOnly aria-label="Undo" aria-keyshortcuts="Meta+Z">
                <HugeiconsIcon icon={Undo02Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Undo ⌘Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button iconOnly aria-label="Redo" aria-keyshortcuts="Meta+Shift+Z">
                <HugeiconsIcon icon={Redo02Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Redo ⇧⌘Z</TooltipContent>
        </Tooltip>
      </Flex>
    </TooltipProvider>
  );
}
```

### Sides

`side` sets where the tooltip prefers to open: `top`, `right`, `bottom` or `left`. When that side has no room, the tooltip opens on the opposite side.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, Download01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const ACTIONS = [
  { label: "Share", side: "top", glyph: Share08Icon },
  { label: "Download", side: "right", glyph: Download01Icon },
  { label: "Duplicate", side: "bottom", glyph: Copy01Icon },
  { label: "Delete", side: "left", glyph: Delete02Icon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="4">
        {ACTIONS.map(({ label, side, glyph }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button iconOnly aria-label={label}>
                  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                </Button>
              }
            />
            <TooltipContent side={side}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
```

### In a toolbar

A `ToolbarButton` passed to `TooltipTrigger` stays part of the toolbar's arrow-key navigation. One `TooltipProvider` around the whole toolbar lets the tooltips open quickly along the row.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const TOOLS = [
  { label: "Bold", shortcut: "⌘B", glyph: TextBoldIcon },
  { label: "Italic", shortcut: "⌘I", glyph: TextItalicIcon },
  { label: "Underline", shortcut: "⌘U", glyph: TextUnderlineIcon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Toolbar aria-label="Text style">
        <ToolbarGroup>
          {TOOLS.map(({ label, shortcut, glyph }) => (
            <Tooltip key={label}>
              <TooltipTrigger
                render={
                  <ToolbarButton iconOnly aria-label={label}>
                    <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                  </ToolbarButton>
                }
              />
              <TooltipContent>{`${label} ${shortcut}`}</TooltipContent>
            </Tooltip>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
```

### Controlled

`open` and `onOpenChange` let your own state control the tooltip, here from a Switch. Keep this for demonstrations and guided tours, and let the pointer and focus open tooltips everywhere else.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Switch,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Flex gap="5" align="center">
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="Notifications">
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Notifications</TooltipContent>
      </Tooltip>
      <Flex gap="2" align="center" render={<label />}>
        <Switch checked={open} onCheckedChange={setOpen} />
        <Text size="2">Show the tooltip</Text>
      </Flex>
    </Flex>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Naming a control

#### Tooltip

Tooltip shows the name of a control when the pointer rests on it or the control receives keyboard focus.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `TooltipTrigger` and a `TooltipContent`, in that order. |
| `defaultOpen?` | `boolean` | Whether the tooltip starts open, when you don't control it. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the tooltip opens or closes. |
| `open?` | `boolean` | Whether the tooltip is open. |

#### TooltipTrigger

The control that the tooltip names. Pass your own Button to it through `render`

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.

#### TooltipContent

The text of the tooltip: one short line with the control's name, followed by its shortcut if it has one

| Prop | Type | What it does |
| --- | --- | --- |
| `align?` | `"start" \| "center" \| "end"` | How the tooltip lines up with the trigger along that side. |
| `children?` | `string` | The text of the tooltip. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `side?` | `"top" \| "right" \| "bottom" \| "left"` | The side of the trigger to show the tooltip on. |
| `sideOffset?` | `number` | The gap between the trigger and the tooltip, in pixels. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Setting the delay for the whole app

#### TooltipProvider

Optional. Place it once near the root of your app to set the delay for every tooltip inside it and to let a row of tooltips open quickly one after another

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.
