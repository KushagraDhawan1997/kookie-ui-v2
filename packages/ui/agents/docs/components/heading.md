# Heading

Heading shows a title for a page, a section or a card in the heading font.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Heading size="7" render={<h2 />}>A section</Heading>
```

## Overview

Use a Heading for the title of a page, a section or a card. For body text and labels, use `Text`. For a page title that moves into the toolbar when the page scrolls, use `Page`.

A Heading uses the same nine-step size scale as `Text`, so `size="4"` is the same size on both. On most screens, use size 8 for a page title, 7 for a section and 6 for a card title. The default size is 6.

Size and level are set separately. `size` sets how large the heading looks, and `render` sets the element and its level, such as `render={<h1 />}`. Without `render`, a Heading renders an `<h2>`.

The default weight is medium, and semibold is the heaviest weight available. `emphasis` sets how strong the text colour is. `tone` gives the words a meaning, such as `destructive`, and most headings leave it unset so the words match the surface they sit on.

A screen reader announces a heading with its level, and many people move through a page by its headings. Keep the levels in order, and change `size` rather than the level when a heading needs to look smaller.

## Not supported

- A `level` prop — The level of a heading describes the structure of the document, not how it looks. Set it with `render`, such as `render={<h3 />}`, and set the look with `size`.

## Examples

```tsx
import { Heading, Stack } from "@kushagradhawan/kookie-ui-react";
import type { Tone, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  weight = "medium",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="2">
      <Heading size="7" weight={weight} tone={tone} render={<h3 />}>A section</Heading>
      <Heading size="4" weight={weight} tone={tone} render={<h4 />}>A subsection</Heading>
    </Stack>
  );
}
```

### Sizes

The sizes a screen normally uses: 8 for a page, 7 for a section and 6 for a card title. A smaller size, such as 4, suits a heading inside a card.

```tsx
import { Heading, Stack } from "@kushagradhawan/kookie-ui-react";

// `size` picks a step on the same nine-step scale Text uses.
// The screen headings in this system use step 8 for a page, 7 for a section and 6 for a card.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="8" render={<h2 />}>
        Billing
      </Heading>
      <Heading size="7" render={<h3 />}>
        Payment methods
      </Heading>
      <Heading size="6" render={<h4 />}>
        Company card
      </Heading>
      <Heading size="4" render={<h5 />}>
        Recent invoices
      </Heading>
    </Stack>
  );
}
```

### Outline levels

An `h1` at size 7 with an `h2` at size 4 below it. `render` sets the level and `size` sets how large it looks, so you can make a heading smaller and keep the levels in order.

```tsx
import { Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `render` sets the outline level and `size` sets the look. Here an `h1`
// sits at step 7, and an `h2` below it sits at step 4.
export default function Example() {
  return (
    <Stack gap="4">
      <Heading size="7" render={<h1 />}>
        Project settings
      </Heading>
      <Stack gap="1">
        <Heading size="4" render={<h2 />}>
          Deploy branch
        </Heading>
        <Text size="3" emphasis="medium">
          Pushes to this branch go to production.
        </Text>
      </Stack>
    </Stack>
  );
}
```

### Emphasis

Headings at the three emphasis levels: loud, medium and quiet. Use `medium` or `quiet` for a label above a group, so it does not compete with the headings that name content.

```tsx
import { Heading, Stack } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour. Use `medium` for a label above a group,
// so it does not compete with the headings that name content.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="6" emphasis="loud" render={<h3 />}>
        Team members
      </Heading>
      <Heading size="4" emphasis="medium" render={<h4 />}>
        Pending invitations
      </Heading>
      <Heading size="4" emphasis="quiet" render={<h4 />}>
        Archived members
      </Heading>
    </Stack>
  );
}
```

### Tones

A neutral heading beside a `warning` heading and a `destructive` heading. The tone carries a meaning, and the theme picks the colour in light and dark mode.

```tsx
import { Heading, Stack } from "@kushagradhawan/kookie-ui-react";

// `tone` gives the words a meaning, and the theme picks the colour.
// Use it sparingly: most headings stay neutral.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="5" render={<h3 />}>
        Storage
      </Heading>
      <Heading size="5" tone="warning" render={<h3 />}>
        Storage almost full
      </Heading>
      <Heading size="5" tone="destructive" render={<h3 />}>
        Delete this workspace
      </Heading>
    </Stack>
  );
}
```

### In a card

A card title at size 6 with a short description below it and a button at the end of the row. This is the most common use of a Heading.

```tsx
import { Button, Card, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A card title uses step 6, with a short description under it at step 3.
// The action sits at the end of the same row.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "32rem" }}>
      <Flex gap="4" justify="space-between" align="flex-start">
        <Stack gap="1">
          <Heading size="6" render={<h3 />}>
            Two-step sign-in
          </Heading>
          <Text size="3" emphasis="medium">
            Ask for a code from your phone each time you sign in.
          </Text>
        </Stack>
        <Button emphasis="loud">Turn on</Button>
      </Flex>
    </Card>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | The emphasis level of the text, which sets its colour, as on `Text`. |
| `render?` | `RenderElement` | Renders the heading as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`, the same steps as `Text`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The meaning of the heading, which sets its colour family, such as `destructive`. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight: `regular`, `medium` or `semibold`. |

It also takes every prop of a `<h2>`.
