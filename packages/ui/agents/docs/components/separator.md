# Separator

Separator draws a thin line that divides two groups of content.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Separator orientation="horizontal" />
```

## Overview

Use a Separator to draw a thin line between two groups of content when space alone does not make the division clear. Its colour and thickness come from the theme.

Try space first, because a larger `gap` between two groups is often enough. When a group needs its own surface, use a `Card`, and when a region needs a recessed background, use a `Surface`.

A Separator is horizontal by default and fills the width of its container. With `orientation="vertical"`, it fills the height of its row instead, so you never set a length.

A Separator is a real `role="separator"` element, and `orientation` sets `aria-orientation` for screen readers.

## Not supported

- `children` — A divider with a word in it is two Separators and a Text in a row, as the example above shows.
- A length prop — The line always fills its container, so control its length by sizing the container, just as you control spacing.
- `decorative` — A line that screen readers should skip is decoration rather than a separator. Draw it with a styled `Box` instead.

## Examples

```tsx
import { Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "16rem" }}>
      <Text size="2" weight="medium">Above</Text>
      <Separator />
      <Text size="2" emphasis="medium">Below</Text>
      <Flex gap="4" align="center">
        <Text size="2" weight="medium">Left</Text>
        <Separator orientation="vertical" />
        <Text size="2" emphasis="medium">Right</Text>
      </Flex>
    </Stack>
  );
}
```

### In a toolbar

A vertical Separator stretches to the height of its row. Here it divides the text style buttons from the alignment buttons.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { Button, Flex, Separator, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof TextBoldIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A vertical Separator stretches to the height of the row it sits in. It divides one
// group of controls from the next.
export default function Example() {
  return (
    <Flex gap="2" align="stretch">
      <Button iconOnly emphasis="quiet" aria-label="Bold">
        {icon(TextBoldIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Italic">
        {icon(TextItalicIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Underline">
        {icon(TextUnderlineIcon)}
      </Button>
      <Separator orientation="vertical" />
      <Button iconOnly emphasis="quiet" aria-label="Align left">
        {icon(TextAlignLeftIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Align centre">
        {icon(TextAlignCenterIcon)}
      </Button>
    </Flex>
  );
}
```

### A divider with a word

An "or" divider built from two Separators and a Text in a row. Each Separator sits in a Box that grows, so the two lines share the space that is left.

```tsx
import { Box, Button, Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A divider with a word in it is two Separators and a Text in a row. Each Separator sits
// in a Box that grows, so the two lines share the space left over.
export default function Example() {
  return (
    <Stack gap="4" maxWidth="22rem">
      <Button emphasis="medium">Continue with Google</Button>
      <Flex gap="3" align="center">
        <Box flexGrow="1">
          <Separator />
        </Box>
        <Text size="2" emphasis="medium">
          or
        </Text>
        <Box flexGrow="1">
          <Separator />
        </Box>
      </Flex>
      <Button emphasis="loud">Continue with email</Button>
    </Stack>
  );
}
```

### In a card

Separators between the rows of a summary card. Each line fills the width of its Stack, so you never set a length.

```tsx
import { Card, Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const ROWS = [
  { label: "Plan", value: "Team" },
  { label: "Seats", value: "8 of 10" },
  { label: "Next invoice", value: "1 October" },
];

// Separators between rows in a card. Each line takes the full width of the Stack it
// sits in, so you never give it a length.
export default function Example() {
  return (
    <Card style={{ minWidth: "20rem" }}>
      <Stack gap="3">
        {ROWS.map((row, i) => (
          <Stack key={row.label} gap="3">
            {i > 0 && <Separator />}
            <Flex justify="space-between">
              <Text size="2" emphasis="medium">
                {row.label}
              </Text>
              <Text size="2">{row.value}</Text>
            </Flex>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
