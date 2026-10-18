# Context Menu

ContextMenu opens a menu at the pointer when someone right-clicks an area, or long-presses it on a touch screen.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<ContextMenu>
  <ContextMenuTrigger>
    <Surface>The area you right-click</Surface>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MenuItem>Duplicate</MenuItem>
    <MenuItem tone="destructive">Delete</MenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Overview

Use a ContextMenu for shortcuts to actions on the thing under the pointer, such as renaming, duplicating or deleting a file. A right-click is hard to discover, so make every action in a context menu available somewhere else too, such as a button or a `Menu`. To open a menu from a visible button, use `Menu`.

You build the menu from the same parts as a `Menu`: `MenuItem`, `MenuGroup`, `MenuLabel`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuSub` and their children. The panel and the rows look exactly like a `Menu`.

Wrap the area in `ContextMenuTrigger`. It catches the right-click and the long press, and it stops the browser's own menu from opening. It adds no fill, border or cursor, so the area looks the same as before. To make an existing element the area, pass it to `render`.

The panel opens with its corner at the point you clicked and moves as needed to stay inside the window, so there are no placement props. `size` sets the size of the panel and its rows.

The keyboard works as it does in a `Menu`: the arrow keys move through the rows, Enter chooses a row, typing a letter jumps to a matching row, and Escape closes the panel.

The behaviour comes from Base UI's ContextMenu.

## Use instead

- `Menu` when the actions open from a visible button.

## Not supported

- `ContextMenuItem` and a second set of parts — A context menu's rows are the same components as a menu's rows, so a second set of names would only duplicate them. Use `MenuItem`, `MenuGroup`, `MenuSub` and the other menu parts directly.
- `side`, `align` and an offset — The panel's corner always opens at the point that was clicked, and the window decides which corner fits. There is nothing left for these props to choose.
- A style for the trigger area — A right-click happens over content that is already visible, so the trigger adds no fill, border or cursor. Style the element inside it as you normally would.
- Opening on a left click — A menu that opens on a left click is a `Menu` with a visible trigger. One panel that answered two different gestures would be hard for people to predict.

## Examples

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  Surface,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the system
// draws its own chevrons at, so your set matches them. No size: the row sizes the slot's svg.
const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <ContextMenu size={size}>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click anywhere in here
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {/* The glyph is the `leading` slot's, never part of the label — the row reserves one
            gutter and every set of words starts on the same line. */}
        <MenuItem leading={icon(Copy01Icon)}>Duplicate</MenuItem>
        <MenuItem leading={icon(PencilEdit02Icon)}>Rename</MenuItem>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete
        </MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Grouped rows

Rows sorted into `MenuGroup` sections, each named by a `MenuLabel`. A screen reader announces the label with its group, and the keyboard skips over it.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuGroup,
  MenuItem,
  MenuLabel,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Put related rows in a MenuGroup with a MenuLabel. The label names the
// group for a screen reader, and the keyboard skips it.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the project card
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuGroup>
          <MenuLabel>Project</MenuLabel>
          <MenuItem>Open</MenuItem>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuLabel>Share</MenuLabel>
          <MenuItem>Copy link</MenuItem>
          <MenuItem>Invite people</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem tone="destructive">Delete project</MenuItem>
        </MenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Icons and shortcuts

Icons in the `leading` slot and keyboard shortcuts in the `trailing` slot. Every label starts at the same position, whether or not its row has an icon.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ClipboardIcon, Copy01Icon, Scissor01Icon } from "@hugeicons/core-free-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Kbd,
  MenuItem,
  Surface,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// `leading` holds an icon and `trailing` holds the shortcut that also runs
// the row. Every label starts on the same line, with or without an icon.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the selected text
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem leading={icon(Scissor01Icon)} trailing={<Kbd>⌘X</Kbd>}>
          Cut
        </MenuItem>
        <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘C</Kbd>}>
          Copy
        </MenuItem>
        <MenuItem leading={icon(ClipboardIcon)} trailing={<Kbd>⌘V</Kbd>}>
          Paste
        </MenuItem>
        <MenuItem trailing={<Kbd>⌘A</Kbd>}>Select all</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Checkbox and radio rows

`MenuCheckboxItem` rows for settings that turn on and off, and a `MenuRadioGroup` for one choice out of several. These rows keep the menu open, so a person can change several settings at once.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuCheckboxItem,
  MenuGroup,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// A checkbox row turns one option on or off. A radio group picks one
// option from several. Both keep the menu open, so a person can change
// several settings in one visit.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the file list
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuGroup>
          <MenuLabel>Show</MenuLabel>
          <MenuCheckboxItem defaultChecked>File extensions</MenuCheckboxItem>
          <MenuCheckboxItem>Hidden files</MenuCheckboxItem>
        </MenuGroup>
        <MenuRadioGroup defaultValue="name">
          <MenuLabel>Sort by</MenuLabel>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="modified">Date modified</MenuRadioItem>
          <MenuRadioItem value="size">Size</MenuRadioItem>
        </MenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Submenus

`MenuSub` rows that open a second panel beside the first. Hover over the row, or press the Right Arrow key, to open it.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// A MenuSub opens a second panel beside its row. Hover the row or press
// the right arrow key to open it.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the design file
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem>Open</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Move to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Marketing site</MenuItem>
            <MenuItem>Mobile app</MenuItem>
            <MenuItem>Brand assets</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
            <MenuItem>PDF</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Disabled

A menu with two disabled rows, one of them destructive. A disabled row stays visible and a screen reader still announces it, so a person knows the action exists.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// A disabled row stays in the menu and a screen reader still announces
// it. It shows an action exists but is not available right now.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the shared document
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem>Open</MenuItem>
        <MenuItem>Copy link</MenuItem>
        <MenuItem disabled>Rename</MenuItem>
        <MenuItem disabled tone="destructive">
          Delete
        </MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### One menu for each item

A file list in which each row has its own ContextMenu, so the menu acts on the row that was right-clicked. The rows look the same with or without the trigger.

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Flex,
  MenuItem,
  Stack,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const FILES = [
  { name: "Q3 revenue.xlsx", size: "84 KB" },
  { name: "Board deck.pdf", size: "2.1 MB" },
  { name: "Hiring plan.docx", size: "36 KB" },
];

// Give each item its own ContextMenu, so the menu can act on the item that
// was right-clicked. The trigger draws nothing, so the row keeps its look.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      {FILES.map((file) => (
        <ContextMenu key={file.name}>
          <ContextMenuTrigger>
            <Surface size="1">
              <Flex justify="space-between" align="center">
                <Text size="2">{file.name}</Text>
                <Text size="2" emphasis="medium">
                  {file.size}
                </Text>
              </Flex>
            </Surface>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <MenuItem>Open {file.name}</MenuItem>
            <MenuItem>Download</MenuItem>
            <MenuItem tone="destructive">Move to trash</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </Stack>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Catching the right-click

#### ContextMenu

ContextMenu opens a menu at the pointer when someone right-clicks an area, or long-presses it on a touch screen.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<ContextMenuTrigger>` and a `<ContextMenuContent>`. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean) => void` | Fires on every open and close, including the dismissals the menu handles itself. |
| `open?` | `boolean` | Controls whether the menu is open. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the menu. |

#### ContextMenuTrigger

The area where a right-click or a long press opens the menu. It adds nothing visible, so wrap it around the content people already see

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The area that answers a right-click. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `render?` | `RenderElement` | Renders the area as an element you already have, such as a canvas or a row. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Showing the panel

#### ContextMenuContent

The panel, which opens at the point that was clicked. Put `MenuItem` and the other menu parts inside it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The rows of the menu. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
