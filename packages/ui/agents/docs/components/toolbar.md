# Toolbar

Toolbar is a row of app controls that the keyboard reaches as one stop, moving between the controls with the arrow keys.

Job: Act. Make something happen. A pattern: it owns the decisions this job needs.

```tsx
<Toolbar aria-label="Note tools">
  <Flex align="center" gap="2">
    <ToolbarButton iconOnly aria-label="Back">{back}</ToolbarButton>
    <ToolbarTitle>Nature Walks</ToolbarTitle>
  </Flex>
  <ToolbarGroup>
    <ToolbarButton>Share</ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton>Export</ToolbarButton>
  </ToolbarGroup>
</Toolbar>
```

## Overview

A Toolbar is the row that holds an app's controls, such as the buttons at the top of an editor. The whole row is one tab stop, and the arrow keys move between the controls inside it, as toolbars do on every platform. That keyboard behaviour, which comes from Base UI's Toolbar, is the reason to use a Toolbar instead of a `Flex`.

Put `ToolbarButton` in the row, not `Button`. A plain `Button` can't join the row's keyboard group, so it adds its own tab stop and the arrow keys skip it. `ToolbarButton` accepts every `Button` prop, and with `render` it can become a link or a menu trigger.

The row is one control tall at its `size`. With no `size`, a Toolbar is one step above the app's size, which is size 3 in a default app, and every control in the row uses that size unless it sets its own. The row spaces its clusters for you: group controls with a `Flex`, and one cluster sits at the start, two go to the ends, and three sit at the start, the centre and the end.

`ToolbarGroup` draws a capsule around controls that belong together, such as bold, italic and underline, and the buttons inside it are quiet by default. A `ToolbarSeparator` divides loose controls. `ToolbarTitle` names the row, and `ToolbarOverflow` moves the controls that don't fit into a menu.

The row itself is transparent, so it has no `tone`, `emphasis` or `material`. Set `backdrop` on the row when content passes behind it, and every control in the row uses the theme's material. A `ToolbarGroup` also accepts `backdrop` for itself.

Screen readers announce the row as a toolbar. Give it an `aria-label` that says what the tools are for, and give every icon-only `ToolbarButton` its own `aria-label`.

## Not supported

- `tone`, `emphasis` and `material` on the row — The row itself is transparent, so there is nothing to colour or turn to glass. To make its controls use the theme's material, set `backdrop` on the row or on a `ToolbarGroup`.
- Leading, centre and trailing parts — Which controls sit at each end depends on what they mean in your app. Group them with a `Flex`, and the row spaces the groups.
- `size` on a group — A group and its buttons always use the row's size, so they stay the same height as the controls beside them. Set `size` on the `Toolbar` instead.
- A `gap` prop — The row sets the space between clusters for you. Inside one cluster, set `gap` on the `Flex` that groups the controls.

## Examples

```tsx
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarTitle,
  Flex,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

import { CopyIcon, LockIcon, MoreIcon, PanelLeftIcon, SearchIcon } from "../app/icons";

/* Three, which is the component's own default. A band rests one step above the app's index,
   and an app resting at 2 puts its toolbar at 3. */
export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    /* `backdrop` on the ROW marks a region: it paints nothing itself and every control in it
       resolves the theme's material. Turn it on to see what a band over a photograph or a
       canvas looks like. */
    <Toolbar size={size} backdrop={backdrop} aria-label="Note tools">
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly aria-label="Toggle navigation">
          <PanelLeftIcon />
        </ToolbarButton>
        <ToolbarTitle>Nature Walks</ToolbarTitle>
      </Flex>
      <Flex align="center" gap="2">
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Lock note">
            <LockIcon />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Duplicate note">
            <CopyIcon />
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="More">
            <MoreIcon />
          </ToolbarButton>
        </ToolbarGroup>
        {/* No rule after the capsule. The group already draws the boundary — a hairline
            beside it says the same thing twice. A `ToolbarSeparator` earns its place BETWEEN
            loose controls, or inside a group, which is where the declaration above this
            specimen shows one. */}
        <ToolbarButton iconOnly aria-label="Search">
          <SearchIcon />
        </ToolbarButton>
      </Flex>
    </Toolbar>
  );
}
```

### Groups and separators

A `ToolbarGroup` draws one capsule around the formatting buttons, and a `ToolbarSeparator` divides the loose undo and redo buttons from it. Don't put a separator right after a group, because the capsule already shows where the group ends.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Redo02Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import {
  Flex,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Undo02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="Editor tools" style={{ minWidth: "30rem" }}>
      <ToolbarTitle>Release notes</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly aria-label="Undo">
          {icon(Undo02Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Redo">
          {icon(Redo02Icon)}
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Bold">
            {icon(TextBoldIcon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Italic">
            {icon(TextItalicIcon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Underline">
            {icon(TextUnderlineIcon)}
          </ToolbarButton>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
```

### Sizes

`size` on the row sets the height of the row and of every control in it, and the title text grows with it. A Toolbar with no `size` is one step above the app's size.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { Flex, Stack, Toolbar, ToolbarButton, ToolbarTitle, iconStroke } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "28rem" }}>
      {SIZES.map((size) => (
        <Toolbar key={size} size={size} aria-label={`Project tools, size ${size}`}>
          <Flex align="center" gap="2">
            <ToolbarButton iconOnly aria-label="Show sidebar">
              <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={iconStroke} aria-hidden />
            </ToolbarButton>
            <ToolbarTitle>Q3 planning</ToolbarTitle>
          </Flex>
          <ToolbarButton leading={<HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />}>
            Share
          </ToolbarButton>
        </Toolbar>
      ))}
    </Stack>
  );
}
```

### Vertical

Set `orientation="vertical"` for a column of tools along the edge of a canvas. The up and down arrow keys then move between the controls, and a separator becomes a horizontal line.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Comment01Icon,
  Image01Icon,
  Link01Icon,
  TextBoldIcon,
} from "@hugeicons/core-free-icons";
import { Toolbar, ToolbarButton, ToolbarSeparator, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Image01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar orientation="vertical" aria-label="Insert">
      <ToolbarButton iconOnly aria-label="Format text">
        {icon(TextBoldIcon)}
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Insert image">
        {icon(Image01Icon)}
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Insert link">
        {icon(Link01Icon)}
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton iconOnly aria-label="Add comment">
        {icon(Comment01Icon)}
      </ToolbarButton>
    </Toolbar>
  );
}
```

### Overflow

Put controls in a `ToolbarOverflow` when the row can get too narrow. The controls that don't fit move into a menu behind a ⋯ button, starting from the end of the row. Give that button a `label`, because it has no visible text.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  LockIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof LockIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="File tools" style={{ width: "18rem" }}>
      <ToolbarTitle>Annual report.pdf</ToolbarTitle>
      <ToolbarOverflow label="More file actions">
        <ToolbarButton iconOnly aria-label="Share">
          {icon(Share08Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Download">
          {icon(Download01Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Duplicate">
          {icon(Copy01Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Lock">
          {icon(LockIcon)}
        </ToolbarButton>
        <ToolbarButton iconOnly tone="destructive" aria-label="Delete">
          {icon(Delete02Icon)}
        </ToolbarButton>
      </ToolbarOverflow>
    </Toolbar>
  );
}
```

### Links and menus

Pass an anchor to `render` to make a `ToolbarButton` into a link. To open a menu, pass a `ToolbarButton` to the `render` prop of `MenuTrigger`. Both keep their place in the row's keyboard order.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Toolbar aria-label="Project tools" style={{ minWidth: "26rem" }}>
      <ToolbarTitle>Website redesign</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton
          leading={<HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />}
          render={<a href="#share" />}
        >
          Share
        </ToolbarButton>
        <Menu>
          <MenuTrigger
            render={
              <ToolbarButton iconOnly aria-label="More project actions">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
          <MenuContent>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Move to folder</MenuItem>
            <MenuItem tone="destructive">Delete project</MenuItem>
          </MenuContent>
        </Menu>
      </Flex>
    </Toolbar>
  );
}
```

### Disabled

Set `disabled` on one `ToolbarButton` to turn it off. Set `disabled` on a `ToolbarGroup` to turn off every control in the capsule at once, for example when nothing is selected.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, Download01Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import { Flex, Toolbar, ToolbarButton, ToolbarGroup, ToolbarTitle, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Undo02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="Selection tools" style={{ minWidth: "26rem" }}>
      <ToolbarTitle>No files selected</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly disabled aria-label="Undo">
          {icon(Undo02Icon)}
        </ToolbarButton>
        <ToolbarGroup disabled>
          <ToolbarButton iconOnly aria-label="Download">
            {icon(Download01Icon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Duplicate">
            {icon(Copy01Icon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Delete">
            {icon(Delete02Icon)}
          </ToolbarButton>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### The row

#### Toolbar

Toolbar is a row of app controls that the keyboard reaches as one stop, moving between the controls with the arrow keys.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the row, such as in a floating header. |
| `orientation?` | `"horizontal" \| "vertical"` | Sets the direction of the row and of the arrow keys. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of every control in the row that doesn't set its own `size`. |

It also takes every prop of a `<div>`.

### What goes in it

#### ToolbarButton

A `Button` that joins the toolbar's keyboard group, so the arrow keys reach it. It accepts every `Button` prop, including `render` for a link or a menu trigger. It is medium by default, and quiet inside a `ToolbarGroup`

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The name of the button for screen readers. |
| `aria-labelledby?` | `string` | The id of an element on the page that names this button. |
| `backdrop?` | `boolean` | Set `backdrop` when the button sits over other content, such as an image. |
| `bordered?` | `boolean` | Adds a thin border. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `done?` | `boolean` | Shows a tick in place of the icon to say that the action finished. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | Sets how prominent the button is next to the buttons beside it. |
| `focusableWhenDisabled?` | `boolean` | Keep focus on the button when it becomes disabled part-way through an interaction. |
| `iconOnly` | `true` | Makes the button square and shows only the icon in `children`. |
| `leading?` | `React.ReactNode` | Content before the label, usually an icon. |
| `loading?` | `boolean` | Shows a spinner and blocks the press while an action runs. |
| `nativeButton?` | `boolean` | Says whether the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Renders the button as a different element, such as a link. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the button, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets what the action means, and the theme picks the colour. |
| `trailing?` | `React.ReactNode` | Content after the label, such as a chevron, a count or a control. |

It also takes every prop of a `<button>`.

#### ToolbarGroup

A capsule around controls that belong together, such as bold, italic and underline. It is as tall as a button beside it, and it uses the row's size, so the group and its buttons line up with the rest of the row

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the group. |
| `disabled?` | `boolean` | Turns every control in the group off at once. |

It also takes every prop of a `<div>`.

#### ToolbarSeparator

A thin line between two groups of loose controls. It is as tall as the icons beside it rather than the whole row, so it reads as a gap between tools

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.

### Naming it

#### ToolbarTitle

The title at the start of the row. Give it words to show a fixed title. With no words, it shows the title of the `Page` in the same pane once that page's large title scrolls out of view, and it renders nothing when there is no title to show

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The title text. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `id?` | `string` | The id of the title, so that you can point `aria-labelledby` at it. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### When the row runs out of room

#### ToolbarOverflow

A group of controls that collapses into a ⋯ menu when the row runs out of room. It measures the space left in the row instead of using a breakpoint, because each toolbar holds different controls. A `ToolbarButton` that moves into the menu shows as a menu row, and your own components can call `useToolbarOverflow()` to render a different form there

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The controls in the cluster, in order. |
| `label?` | `string` | The accessible name of the `⋯` button. |

It also takes every prop of a `<div>`.
