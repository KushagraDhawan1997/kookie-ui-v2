# Spinner

Spinner shows that something is working and that you should wait.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Spinner />
```

## Overview

Use a Spinner for a short wait when you can't say how much work is left. It draws eight spokes with a fading trail and turns one spoke at a time.

When you know how far the work has got, such as an upload at 40%, use `Progress` instead. When the wait belongs to an action, use the `loading` prop on `Button`, because the button then marks itself as busy and keeps its label.

A Spinner draws in the colour of the text around it, so it matches its surroundings in every tone and in light and dark mode. Inside a control it is the size of that control's icon, so you can swap an icon for a Spinner and nothing shifts. On its own it is the icon size of a size 2 control.

The rotation keeps running even while the page's JavaScript is busy. When the operating system asks for reduced motion, the Spinner turns more slowly but doesn't stop, because a spinner that stood still would look like a frozen page.

A screen reader doesn't announce a Spinner. Put the state in words next to it, or use a control that marks itself as busy, such as a `Button` with `loading`.

## Use instead

- `Progress` when you know how far along the work is.

## Not supported

- A size prop — A Spinner takes the icon size of the control it sits in, so swapping it for an icon never moves anything. On its own it uses the size 2 icon size.
- A colour prop — A Spinner draws in the colour of the text around it. To change its colour, set a `tone` on the surrounding `Text`.

## Examples

```tsx
import { Spinner } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return <Spinner />;
}
```

### In a button

Set `loading` on a `Button`, and a Spinner appears in place of its icon. The label stays, so the button keeps its width and a screen reader still hears what is running.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { CloudUploadIcon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

// `loading` puts a Spinner in the icon's place and marks the button busy. The label stays,
// so the button keeps its width and a screen reader still hears what is running.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Button emphasis="loud" loading>
        Publishing
      </Button>
      <Button
        emphasis="medium"
        loading
        leading={<HugeiconsIcon icon={CloudUploadIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Uploading files
      </Button>
    </Flex>
  );
}
```

### With a label

A screen reader skips a Spinner, so put the state in words beside it. Wrapping the pair in `role="status"` makes a screen reader announce the words when they appear.

```tsx
import { Flex, Spinner, Text } from "@kushagradhawan/kookie-ui-react";

// A Spinner is hidden from screen readers, so the words beside it carry the state.
// `role="status"` makes a screen reader announce those words when they appear.
export default function Example() {
  return (
    <Flex role="status" gap="2" align="center">
      <Spinner />
      <Text size="2" emphasis="medium">
        Saving your changes…
      </Text>
    </Flex>
  );
}
```

### Colour from the text

A Spinner draws in the colour of the text around it. Set a `tone` on the surrounding `Text`, and the Spinner inside takes the same colour.

```tsx
import { Spinner, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A Spinner draws in the colour of the text around it. Set a tone on the text, and the
// Spinner inside it follows.
export default function Example() {
  return (
    <Stack gap="4">
      <Text size="2">
        <Spinner /> Checking the build
      </Text>
      <Text size="2" tone="accent">
        <Spinner /> Deploying to production
      </Text>
      <Text size="2" tone="destructive">
        <Spinner /> Deleting 12 archived projects
      </Text>
    </Stack>
  );
}
```

### Sizes

Inside a control, a Spinner is the same size as that control's icon. This row shows a loading `Button` at each of the four sizes.

```tsx
import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

// Inside a control, the Spinner takes the icon size for that control's size. Swap an icon
// for a Spinner and nothing moves.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button size="1" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="2" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="3" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="4" emphasis="medium" loading>
        Syncing
      </Button>
    </Flex>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

It declares no props of its own. It takes every prop of a `<span>`.
