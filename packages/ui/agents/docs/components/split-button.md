# Split Button

SplitButton runs a common action from its label and opens the related actions from a chevron beside it.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<SplitButton
  menuLabel="More merge options"
  menu={<MenuItem>Squash and merge</MenuItem>}
>
  Merge
</SplitButton>
```

## Overview

A SplitButton pairs one common action with a few close alternatives. Pressing the label runs the common action, and pressing the chevron opens a Menu with the others. Use it when one choice is right most of the time, such as merge beside squash and merge or rebase and merge.

If no action is more common than the rest, put a Menu on a plain Button instead. If the actions aren't variants of one task, place separate Buttons in a Toolbar.

The two halves are real Buttons drawn as one box, so they share the same `size`, `tone`, `emphasis` and `bordered` values and look like a single control. Each half is still its own button, with its own focus stop. The menu opens under the whole button, lined up with its end edge.

The chevron half has no visible words, so you must name it with `menuLabel`. Screen readers announce that name along with the fact that the half opens a menu.

## Not supported

- `iconOnly` — The label is how people know what the common action is, so it can't be removed. For actions without words, use icon buttons in a `Toolbar` instead.
- `render` — A SplitButton renders two buttons and a menu, so there is no single element that `render` could replace.

## Examples

```tsx
import { MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SplitButton
      emphasis="loud"
      menuLabel="More merge options"
      menu={
        <>
          <MenuItem>Squash and merge</MenuItem>
          <MenuItem>Rebase and merge</MenuItem>
        </>
      }
    >
      Merge
    </SplitButton>
  );
}
```

### Sizes

`size` sets the height of both halves together, from 1 to 4, and the menu opens at the same size. Use size 2 unless the SplitButton sits beside controls of another size.

```tsx
import { Flex, MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

const menu = (
  <>
    <MenuItem>Export as CSV</MenuItem>
    <MenuItem>Export as PDF</MenuItem>
  </>
);

export default function Example() {
  return (
    <Flex gap="4" align="center" wrap="wrap">
      <SplitButton size="1" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="2" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="3" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
      <SplitButton size="4" menuLabel="More export options" menu={menu}>
        Export
      </SplitButton>
    </Flex>
  );
}
```

### Emphasis

`emphasis` sets how prominent the button is: `loud`, `medium` or `quiet`. Use `loud` once per screen, for the main action, and add `bordered` when a quiet SplitButton needs a visible edge.

```tsx
import { Flex, MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

const menu = (
  <>
    <MenuItem>Save as draft</MenuItem>
    <MenuItem>Save as template</MenuItem>
  </>
);

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton emphasis="loud" menuLabel="More save options" menu={menu}>
        Publish
      </SplitButton>
      <SplitButton emphasis="medium" menuLabel="More save options" menu={menu}>
        Save
      </SplitButton>
      <SplitButton emphasis="quiet" bordered menuLabel="More save options" menu={menu}>
        Save
      </SplitButton>
    </Flex>
  );
}
```

### Tones

`tone` gives both halves a meaning. Use `destructive` when the common action removes something, and set the same tone on the dangerous menu items so the menu agrees with the button.

```tsx
import { Flex, MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton
        tone="neutral"
        menuLabel="More archive options"
        menu={
          <>
            <MenuItem>Archive and notify members</MenuItem>
            <MenuItem>Archive quietly</MenuItem>
          </>
        }
      >
        Archive project
      </SplitButton>
      <SplitButton
        tone="destructive"
        menuLabel="More delete options"
        menu={
          <>
            <MenuItem tone="destructive">Delete all versions</MenuItem>
            <MenuItem tone="destructive">Delete and block sender</MenuItem>
          </>
        }
      >
        Delete file
      </SplitButton>
    </Flex>
  );
}
```

### With an icon

`leading` puts an icon before the label. The icon appears on the action half only, because the other half always shows the chevron.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { GitMergeIcon } from "@hugeicons/core-free-icons";
import { iconStroke, MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SplitButton
      emphasis="loud"
      leading={<HugeiconsIcon icon={GitMergeIcon} strokeWidth={iconStroke} aria-hidden />}
      menuLabel="More merge options"
      menu={
        <>
          <MenuItem>Squash and merge</MenuItem>
          <MenuItem>Rebase and merge</MenuItem>
        </>
      }
    >
      Merge pull request
    </SplitButton>
  );
}
```

### Disabled

`disabled` turns off both halves, so neither can be pressed and the menu can't open. Put the reason next to the button, as this example does, because a disabled control can't explain itself.

```tsx
import { Flex, MenuItem, SplitButton, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton
        disabled
        emphasis="loud"
        menuLabel="More deploy options"
        menu={
          <>
            <MenuItem>Deploy to staging</MenuItem>
            <MenuItem>Deploy to preview</MenuItem>
          </>
        }
      >
        Deploy
      </SplitButton>
      <Text size="2" emphasis="medium">
        Two checks are still running.
      </Text>
    </Flex>
  );
}
```

### Menu groups

`menu` accepts anything a `MenuContent` accepts. Use `MenuGroup` and `MenuLabel` to sort a longer list, and give a destructive item its own `tone`.

```tsx
import { MenuGroup, MenuItem, MenuLabel, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SplitButton
      emphasis="medium"
      menuLabel="More share options"
      menu={
        <>
          <MenuGroup>
            <MenuLabel>Share with</MenuLabel>
            <MenuItem>Everyone in the workspace</MenuItem>
            <MenuItem>Specific people</MenuItem>
          </MenuGroup>
          <MenuGroup>
            <MenuLabel>Link</MenuLabel>
            <MenuItem>Copy view-only link</MenuItem>
            <MenuItem tone="destructive">Turn off link sharing</MenuItem>
          </MenuGroup>
        </>
      }
    >
      Share
    </SplitButton>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the button sits over other content, such as an image. |
| `bordered?` | `boolean` | Adds a thin border. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | Sets how prominent the button is next to the buttons beside it. |
| `focusableWhenDisabled?` | `boolean` | Keep focus on the button when it becomes disabled part-way through an interaction. |
| `leading?` | `React.ReactNode` | Content before the label, usually an icon. |
| `loading?` | `boolean` | Shows a spinner and blocks the press while an action runs. |
| `menu` | `React.ReactNode` | The other actions: `MenuItem`s, groups and separators, exactly what `MenuContent` holds. |
| `menuLabel` | `string` | The chevron half's name. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the button, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets what the action means, and the theme picks the colour. |

It also takes every prop of a `<button>`.
