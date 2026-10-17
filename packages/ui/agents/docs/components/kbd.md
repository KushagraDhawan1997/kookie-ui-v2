# Kbd

Kbd shows a key or a keyboard shortcut, such as ⌘K.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Kbd>⌘K</Kbd>
```

## Overview

Use a Kbd to show a key or a shortcut that a person presses. For code, such as a command or a file name, use `Code`. For a short label or a status, use `Chip`. In a `Menu`, put a Kbd in a row's `trailing` slot to show that row's shortcut.

A Kbd looks like a small key cap, with a subtle fill, a grey border and a slight raised shadow. It uses the body font rather than a code font, so symbols such as ⌘ draw at their normal size. It is exactly one line tall, so it never pushes apart the lines of text around it.

Without `size`, a key matches the size of the text around it, so set `size` only when the key stands alone. `tone` changes the colour of the letters and the fill, and the border stays grey.

A Kbd renders a `<kbd>` element, which tells a screen reader that the text is keyboard input.

## Not supported

- A shadow that follows `depth` — A key cap shows a slight raised shadow in every theme, including `depth="flat"`, because it is a picture of a physical key. On a glass panel the shadow is removed.

## Examples

```tsx
import { Kbd, Text } from "@kushagradhawan/kookie-ui-react";
import type { Tone, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  weight = "regular",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Text size="3">
      Press <Kbd weight={weight} tone={tone}>⌘K</Kbd> to search,{" "}
      <Kbd weight={weight} tone={tone}>Esc</Kbd> to dismiss.
    </Text>
  );
}
```

### Sizes

The same key in three sizes of text, with no `size` set on the key. Without `size`, a key matches the text around it.

```tsx
import { Kbd, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Without `size`, a key takes the size of the text around it.
// Set `size` only when the key stands on its own.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
      <Text size="3">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
      <Text size="5">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
    </Stack>
  );
}
```

### Key combinations

A separate Kbd for each key in a shortcut. Words that join the keys, such as "then", go in the surrounding text.

```tsx
import { Flex, Kbd, Text } from "@kushagradhawan/kookie-ui-react";

// Give each key its own Kbd when a shortcut needs keys pressed together.
// Put the words that join them in the text, not in the key.
export default function Example() {
  return (
    <Flex gap="4" wrap="wrap">
      <Text size="3">
        <Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>P</Kbd> opens the command list.
      </Text>
      <Text size="3">
        <Kbd>Ctrl</Kbd> then <Kbd>Enter</Kbd> sends the message.
      </Text>
    </Flex>
  );
}
```

### In a menu

Shortcuts in the `trailing` slot of menu rows. The key matches the row's size and sits at the end of the row.

```tsx
import { Button, Kbd, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";

// Put the shortcut in the row's `trailing` slot. The key takes the row's size,
// and the words stay the part that a person reads first.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Edit</Button>} />
      <MenuContent>
        <MenuItem trailing={<Kbd>⌘Z</Kbd>}>Undo</MenuItem>
        <MenuItem trailing={<Kbd>⇧⌘Z</Kbd>}>Redo</MenuItem>
        <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
      </MenuContent>
    </Menu>
  );
}
```

### A list of shortcuts

A reference list with the action at the start of each row and the key at the end. Use it in a help panel or on a settings page.

```tsx
import { Flex, Kbd, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const shortcuts = [
  { action: "Search the workspace", keys: "⌘K" },
  { action: "New project", keys: "⌘N" },
  { action: "Close the panel", keys: "Esc" },
];

// A list of shortcuts puts the action first and the key at the end of the row.
export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      {shortcuts.map((shortcut) => (
        <Flex key={shortcut.action} gap="4" justify="space-between" align="center">
          <Text size="3">{shortcut.action}</Text>
          <Kbd>{shortcut.keys}</Kbd>
        </Flex>
      ))}
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | The emphasis level of the text: `loud`, `medium` or `quiet`. |
| `render?` | `RenderElement` | Renders the key as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The colour family of the text and the fill. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight, by name. |

It also takes every prop of a `<kbd>`.
