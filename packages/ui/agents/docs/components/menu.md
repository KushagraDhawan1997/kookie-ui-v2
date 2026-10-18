# Menu

Menu opens a floating list of actions from a button, such as Rename or Delete for a file.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<Menu>
  <MenuTrigger render={<Button>Actions</Button>} />
  <MenuContent>
    <MenuGroup>
      <MenuLabel>File</MenuLabel>
      <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
    </MenuGroup>
    <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
    <MenuRadioGroup defaultValue="name">
      <MenuRadioItem value="name">Sort by name</MenuRadioItem>
    </MenuRadioGroup>
    <MenuSub>
      <MenuSubTrigger>Export as</MenuSubTrigger>
      <MenuSubContent>
        <MenuItem>PNG</MenuItem>
      </MenuSubContent>
    </MenuSub>
  </MenuContent>
</Menu>
```

## Overview

A Menu opens a floating list of actions when someone presses its trigger. Each row is one action, and choosing a row runs it and closes the menu. Use a Menu when the choices are things to do. Use a `Select` to choose a value in a form, a `ContextMenu` for actions that open at the pointer on a right-click, and a `Popover` for a floating panel that holds other content, such as a short form.

A row can show an icon in `leading` and a keyboard shortcut in `trailing`, and `tone="destructive"` marks an action that deletes something. Checkbox rows and radio rows show a setting's current state, and a submenu holds a related set of choices. Put a `<Separator>` between groups of rows. Rows without an icon still line up with rows that have one, because the space for the icon is always kept.

Set `size` on the `Menu` to size the rows, icons and text in the panel, and give the trigger button the same size. The panel follows the theme: in a raised theme it casts a shadow, in a flat theme it shows a thin edge instead, and with a glass material it uses glass.

Enter or Space on the trigger opens the menu. The arrow keys move between rows, typing a few letters jumps to the row that starts with them, and Escape closes the menu and returns focus to the trigger. The arrow key that points in the reading direction opens a submenu. Screen readers announce the menu, each row, and whether a checkbox or radio row is checked.

The part names follow shadcn/ui's dropdown menu (MIT), and the behaviour comes from Base UI's Menu.

## Use instead

- `Select` when the person picks a value, and the value stays shown.
- `ContextMenu` when the actions open from a right-click or long press on an area. Every action in it must also be reachable another way, because nobody can see that it exists.

## Not supported

- `emphasis` on rows — Every row in a menu is an equal choice, so there is nothing to make louder or quieter. Order the rows and word them clearly instead, and use `tone="destructive"` for a dangerous action.
- A Shortcut part — To show a keyboard shortcut, put a `<Kbd>` in the row's `trailing` slot. A separate Shortcut part would do exactly the same thing under another name.
- `MenuSeparator` — Use the ordinary `<Separator>` between groups of rows. Inside a menu panel it gets the right spacing automatically.
- An `inset` prop — Rows without icons already line up with rows that have them, because the space for the icon or tick is always kept. There is nothing left for an inset prop to fix.
- `modal` and `openOnHover` — A menu opens when someone presses its trigger, and it always blocks the page behind it until it closes. A submenu row already opens on hover, so neither prop is needed.
- An arrow, a backdrop, a scroll viewport and collision settings — A menu needs no arrow pointing at its trigger and no dimmed backdrop. A long menu scrolls inside the panel on its own, and the panel always moves to stay on screen, so there are no settings to tune.

## Examples

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  FileExportIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Kbd,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  Separator,
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
    <Menu size={size}>
      <MenuTrigger render={<Button emphasis="medium">Actions</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuLabel>File</MenuLabel>
          {/* A glyph goes in `leading`, never in the label: the checkbox and radio rows below
              put their indicator in that same slot, so every row's words start on one line
              whether it is a tick, an icon or nothing at all. */}
          <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘D</Kbd>}>
            Duplicate
          </MenuItem>
          <MenuItem leading={icon(PencilEdit02Icon)}>Rename</MenuItem>
        </MenuGroup>
        <Separator />
        <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
        <MenuRadioGroup defaultValue="name">
          <MenuRadioItem value="name">Sort by name</MenuRadioItem>
          <MenuRadioItem value="date">Sort by date</MenuRadioItem>
        </MenuRadioGroup>
        <Separator />
        <MenuSub>
          <MenuSubTrigger leading={icon(FileExportIcon)}>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

### Disabled and destructive rows

A disabled row stays in the list and screen readers still announce it, because an action that isn't available right now is different from one that doesn't exist. The last row uses `tone="destructive"` for an action that deletes something.

```tsx
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

// A disabled row stays in the list and stays announced: it is a
// thing you cannot do right now, which is not the same as a thing
// that is not there. It takes no highlight.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Actions</Button>} />
      <MenuContent>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem disabled>Move to trash</MenuItem>
        <MenuItem tone="destructive">Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

### Right to left

Inside a right-to-left layout, the panel lines up with the other edge of the trigger and a submenu opens to the left. The menu takes its direction from the trigger, so you don't set anything on the menu itself.

```tsx
import {
  Box,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

// A menu reads direction off its trigger — the one in-flow node
// it owns — so the panel anchors from the other edge and the
// submenu opens to the left, its chevron turned to match.
export default function Example() {
  return (
    <Box dir="rtl">
      <Menu>
        <MenuTrigger render={<Button>Actions</Button>} />
        <MenuContent>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem>Rename</MenuItem>
          <MenuSub>
            <MenuSubTrigger>Export as</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>PNG</MenuItem>
              <MenuItem>SVG</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </Box>
  );
}
```

### Sizes

Set `size` on the `Menu`, and give the trigger button the same size. The rows, icons and text in the panel all change with it.

```tsx
import { Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

const sizes: Size[] = ["1", "2", "3", "4"];

// Set `size` on the Menu. The rows, the icons and the text inside the panel
// all take that size. Give the trigger button the same size.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap" align="center">
      {sizes.map((size) => (
        <Menu key={size} size={size}>
          <MenuTrigger render={<Button size={size}>Size {size}</Button>} />
          <MenuContent>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </Flex>
  );
}
```

### With icons

Put an icon in `leading` and a `<Kbd>` shortcut in `trailing`. A row without an icon still lines up with the rows that have one.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive01Icon,
  Copy01Icon,
  Delete02Icon,
  Link01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Put an icon in `leading` and a shortcut in `trailing`. A row without an icon
// still lines up, because the leading column is always kept.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Project</Button>} />
      <MenuContent>
        <MenuItem leading={icon(PencilEdit02Icon)} trailing={<Kbd>⌘R</Kbd>}>
          Rename
        </MenuItem>
        <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘D</Kbd>}>
          Duplicate
        </MenuItem>
        <MenuItem leading={icon(Link01Icon)}>Copy link</MenuItem>
        <MenuItem>Move to folder…</MenuItem>
        <Separator />
        <MenuItem leading={icon(Archive01Icon)}>Archive</MenuItem>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

### Checkbox rows

Each checkbox row turns one setting on or off, here the columns shown in a table. Pass `checked` and `onCheckedChange` to keep the values in your own state.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

// A checkbox row turns one setting on or off. Pass `checked` and
// `onCheckedChange` to keep the value in your own state.
export default function Example() {
  const [columns, setColumns] = React.useState({ owner: true, updated: true, size: false });

  return (
    <Menu>
      <MenuTrigger render={<Button>Columns</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuLabel>Show columns</MenuLabel>
          <MenuCheckboxItem
            checked={columns.owner}
            onCheckedChange={(owner) => setColumns((c) => ({ ...c, owner }))}
          >
            Owner
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={columns.updated}
            onCheckedChange={(updated) => setColumns((c) => ({ ...c, updated }))}
          >
            Last updated
          </MenuCheckboxItem>
          <MenuCheckboxItem
            checked={columns.size}
            onCheckedChange={(size) => setColumns((c) => ({ ...c, size }))}
          >
            File size
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}
```

### Radio rows

Radio rows choose one value from a set, such as a sort order. The trigger shows the current choice, so people can see it without opening the menu.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

const orders = { name: "Name", updated: "Last updated", size: "File size" } as const;
type Order = keyof typeof orders;

// Radio rows choose one value from a set. The trigger shows the current
// choice, so a person can see it without opening the menu.
export default function Example() {
  const [order, setOrder] = React.useState<Order>("updated");

  return (
    <Menu>
      <MenuTrigger render={<Button>Sort by {orders[order].toLowerCase()}</Button>} />
      <MenuContent>
        <MenuRadioGroup value={order} onValueChange={(value) => setOrder(value as Order)}>
          <MenuLabel>Sort files by</MenuLabel>
          {(Object.keys(orders) as Order[]).map((key) => (
            <MenuRadioItem key={key} value={key}>
              {orders[key]}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
```

### Submenus

Use a submenu for a related set of choices that would make the main list too long. A submenu opens on hover, on a press, or with the arrow key.

```tsx
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

// Use a submenu for a related set of choices that would make the main list long.
// The submenu opens on hover, on a press, or with the arrow key.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>File</Button>} />
      <MenuContent>
        <MenuItem>New file</MenuItem>
        <MenuItem>Open…</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PDF</MenuItem>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Share with</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Shruti Bhatia</MenuItem>
            <MenuItem>Everyone in the workspace</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
}
```

### Rows that are links

When a row goes to a page, pass an anchor to `render` so the row becomes a real link. You can pass your router's link component in the same way, and the row is still one target.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Logout01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof UserIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// When a row goes to a page, render it as a link with `render`. The row stays
// one target. Pass your router's link component in the same way.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Shruti Bhatia</Button>} />
      <MenuContent>
        <MenuItem leading={icon(UserIcon)} render={<a href="#profile" />}>
          Profile
        </MenuItem>
        <MenuItem leading={icon(Settings01Icon)} render={<a href="#settings" />}>
          Settings
        </MenuItem>
        <MenuItem leading={icon(CreditCardIcon)} render={<a href="#billing" />}>
          Billing
        </MenuItem>
        <Separator />
        <MenuItem leading={icon(Logout01Icon)}>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

### Placement

`side` chooses which edge of the trigger the panel opens from, and `align` chooses where it lines up along that edge. If there isn't room, the panel moves so that it stays on screen.

```tsx
import { Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";

// `side` sets the edge of the trigger the panel opens from, and `align` sets
// where it lines up on that edge. The panel moves if there is no room.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      <Menu>
        <MenuTrigger render={<Button>Below, start</Button>} />
        <MenuContent side="bottom" align="start">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button>Below, end</Button>} />
        <MenuContent side="bottom" align="end">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button>Above</Button>} />
        <MenuContent side="top">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
    </Flex>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Opening the menu

#### Menu

Menu opens a floating list of actions from a button, such as Rename or Delete for a file.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<MenuTrigger>` and a `<MenuContent>`. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean) => void` | Fires on every open and close, controlled or not, including the dismissals the menu handles itself: Escape, an outside press, and choosing a row. |
| `open?` | `boolean` | Controls whether the menu is open. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the menu. |

#### MenuTrigger

The button that opens the menu. Pass your own `<Button>` to `render`, so the trigger is a real Kookie button

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The label of the trigger. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns the trigger off, so the menu cannot open. |
| `nativeButton?` | `boolean` | Tells the trigger whether the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Usually a Kookie Button: `<MenuTrigger render={<Button/>}>Open</MenuTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Presenting the panel

#### MenuContent

The floating panel that holds the rows. It opens next to the trigger, above the rest of the page, with the same theme as the trigger

| Prop | Type | What it does |
| --- | --- | --- |
| `align?` | `"start" \| "center" \| "end"` | How the menu aligns along that edge. |
| `children?` | `React.ReactNode` | The rows of the panel: `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuGroup`, `MenuLabel` and `MenuSub`. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `side?` | `"top" \| "bottom" \| "left" \| "right"` | The edge of the trigger that the menu opens from. |
| `sideOffset?` | `number` | The distance from the trigger, in pixels. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### Listing actions

#### MenuItem

One action row, with optional `leading` and `trailing` content. It lights up when the keyboard or the pointer reaches it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The row's words, which are the verb. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `closeOnClick?` | `boolean` | Close the menu when this item is chosen. |
| `disabled?` | `boolean` | Turns the row off, so it cannot be chosen. |
| `label?` | `string` | Typeahead text when children aren't plain text. |
| `leading?` | `React.ReactNode` | Content at the start of the row, usually an icon. |
| `onClick?` | `React.MouseEventHandler<HTMLElement>` | Runs when the user chooses the row. |
| `render?` | `RenderElement` | Renders the row as a different element, such as an `<a href>` or your framework's link. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"destructive"` | Marks the row as a dangerous action, such as delete. |
| `trailing?` | `React.ReactNode` | The tail of the row: a `<Kbd>` shortcut hint, a count, a state glyph. |

### Grouping into sections

#### MenuGroup

A set of related rows. When a `MenuLabel` is inside it, screen readers use the label as the group's name

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The rows of the group, and at most one `MenuLabel` that names them. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### MenuLabel

A heading above a set of rows. It lines up with the rows, but people can't choose it. Use it inside a group or on its own

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The heading's words: what the rows beneath it have in common. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### Rows that show a state

#### MenuCheckboxItem

A row that turns a setting on or off. A tick in the accent colour shows when it is on, and its space is kept when it is off, so the rows stay aligned

| Prop | Type | What it does |
| --- | --- | --- |
| `checked?` | `boolean` | Controls whether the row is ticked. |
| `children?` | `React.ReactNode` | The text of the row. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `closeOnClick?` | `boolean` | Close the menu when this row is chosen. |
| `defaultChecked?` | `boolean` | Uncontrolled starting state. |
| `disabled?` | `boolean` | Turns the row off, so the user cannot change it. |
| `label?` | `string` | Typeahead text when children aren't plain text. |
| `onCheckedChange?` | `(checked: boolean) => void` | Fires with the row's new state on every toggle, controlled or not. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `trailing?` | `React.ReactNode` | Content at the end of the row, such as a shortcut hint or a count. |

#### MenuRadioGroup

Holds the one chosen value for a set of radio rows. Use `value` and `onValueChange` to control it, or `defaultValue` to let it hold the value

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The `MenuRadioItem` rows, and at most one `MenuLabel` that names the choice. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `defaultValue?` | `string` | Uncontrolled starting choice. |
| `disabled?` | `boolean` | Turns off every row in the group. |
| `onValueChange?` | `(value: string) => void` | Fires with the newly chosen value. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `value?` | `string` | Controls the chosen value. |

#### MenuRadioItem

One choice in a radio group. A dot shows next to the choice that is selected

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The text of the row. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `closeOnClick?` | `boolean` | Close the menu when this row is chosen. |
| `disabled?` | `boolean` | Turns the row off, so it cannot be chosen. |
| `label?` | `string` | Typeahead text when children aren't plain text. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `trailing?` | `React.ReactNode` | Content at the end of the row, such as a shortcut hint or a count. |
| `value` | `string` | The value that the row sets when the user chooses it. |

### Nesting a menu

#### MenuSub

Wraps a submenu's trigger row and panel. It renders no element of its own

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `MenuSubTrigger` and a `MenuSubContent`. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean) => void` | Fires on every open and close of this submenu, including the ones it handles itself (the pointer leaving its row, Escape, choosing a row inside it). |
| `open?` | `boolean` | Controls whether this submenu is open. |

#### MenuSubTrigger

The row that opens a submenu. It stays highlighted while the submenu is open, and its chevron points the way the submenu opens

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The text of the row. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns the row off, so the child menu cannot be opened. |
| `label?` | `string` | Typeahead text when children aren't plain text. |
| `leading?` | `React.ReactNode` | Content at the start of the row, usually an icon. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### MenuSubContent

The submenu's panel. It opens beside its trigger row, with its first row level with that trigger

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The rows of the submenu. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
