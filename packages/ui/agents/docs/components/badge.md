# Badge

Badge is a small mark that stays on a thing until you look at it, such as the number on an app icon or an unread dot.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Text>
  Inbox <Badge>3</Badge>
</Text>
```

## Overview

A badge is a small mark that stays on something until people look at it, such as the number on an app icon or the unread dot on a tab. With no content, it is a dot. With a number in it, it is a pill.

Use a badge to count items or to point at something new. Use a `Chip` for a word, such as Paid or Failed, and for a quieter mark. Use a `Notice` when a condition needs a sentence.

A badge always has a strong colour, and it has no `emphasis`. `tone` says what it means: the default, `accent`, means that something is there, and `destructive` means that something needs attention. Your app maps its own meanings onto a tone, for example a failed payment onto `destructive`.

Without a `size`, a badge scales with the line it sits in, so a badge in a tab label and a badge on a large avatar have the same shape at different sizes. Set `size` only when the badge stands alone.

A badge has no position of its own. Put it in a line of text or in a Row's `trailing` slot, or pass it to an Avatar's `badge` prop to place it on the avatar's corner.

A dot is only a colour, so it needs an `aria-label` that says what it means. A count is its own accessible name, so its `aria-label` is optional. A badge with no content and no label renders nothing, which is why `{count > 0 && count}` hides it at zero.

## Use instead

- `Chip` when the label states the current state of the thing beside it, such as Draft.

## Not supported

- `emphasis` — A badge is always strong, because its job is to catch attention until people look. For a quieter mark with a word in it, use a Chip.
- Built-in status words — Words such as Online or Overdue belong to your product, so your app maps each one to a tone. If the word itself must show, use a Chip.
- An unnamed dot — A dot with no content is only a colour, and some people cannot see the colour. The type therefore requires an `aria-label` that says what the dot means.
- A position of its own — The element that holds the badge decides where it goes. To pin a badge to the corner of an avatar, use the Avatar's `badge` prop.

## Examples

```tsx
import { Avatar, Badge, Flex, Text, type TypeSize } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "3" }: { size?: TypeSize }) {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text size={size}>
        Inbox <Badge>3</Badge>
      </Text>
      <Text size={size}>
        Updates <Badge aria-label="New" />
      </Text>
      <Text size={size}>
        Alerts <Badge tone="destructive">128</Badge>
      </Text>
      <Avatar size="3" fallback="KD" badge={<Badge>3</Badge>} />
      <Avatar size="3" fallback="SB" badge={<Badge aria-label="Online" />} />
    </Flex>
  );
}
```

### Counts in a pill

Put a number in a badge to show it as a pill. The badge shows exactly what you give it, so format the number and choose a cut-off, such as 99+, in your app.

```tsx
import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// Put a number in a badge to make it a pill. The badge shows what you give it, so format the
// number and choose the cut-off, such as 99+, in your app.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Inbox <Badge>3</Badge>
      </Text>
      <Text>
        Reviews <Badge>12</Badge>
      </Text>
      <Text>
        Notifications <Badge aria-label="More than 99 unread">99+</Badge>
      </Text>
    </Flex>
  );
}
```

### Named dots

A badge with no content is a dot. A dot is only a colour, so give it an `aria-label` that says what a sighted person understands from it.

```tsx
import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// A badge with no content is a dot. A dot is colour alone, so give it an `aria-label` that
// says what a sighted person understands from it.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Changelog <Badge aria-label="New entries" />
      </Text>
      <Text>
        Billing <Badge tone="destructive" aria-label="Payment failed" />
      </Text>
    </Flex>
  );
}
```

### Tones

`tone` says what the badge means. The default, `accent`, means that something is there, and `destructive` means that something needs attention. Map your own words to a tone in your app.

```tsx
import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// `tone` says what the badge means. The default `accent` means something is here.
// `destructive` means something needs you. Map your own words to a tone in your app.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Messages <Badge>5</Badge>
      </Text>
      <Text>
        Failed builds <Badge tone="destructive">2</Badge>
      </Text>
      <Text>
        Expiring keys <Badge tone="warning">1</Badge>
      </Text>
      <Text>
        Checks passed <Badge tone="success">8</Badge>
      </Text>
      <Text>
        Drafts <Badge tone="neutral">4</Badge>
      </Text>
    </Flex>
  );
}
```

### Sizes

A badge without a `size` scales with the line it sits in, so it grows with the text around it. Set `size` only when the badge stands alone.

```tsx
import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["2", "3", "5", "7"] as const;

// A badge without a `size` takes a share of the line it sits in, so it grows with the text
// around it. Set `size` only when the badge stands alone.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Text key={size} size={size}>
          Inbox <Badge>3</Badge>
        </Text>
      ))}
    </Flex>
  );
}
```

### Pinned to an avatar

Pass the badge to an Avatar's `badge` prop. The avatar places it at the top-end corner and cuts a ring around it, and the badge scales with the avatar.

```tsx
import { Avatar, Badge, Flex } from "@kushagradhawan/kookie-ui-react";

// Pass the badge to the Avatar's `badge` prop. The avatar places it at the top-end corner and
// cuts a ring around it. The badge scales with the avatar.
export default function Example() {
  return (
    <Flex gap="5" align="center">
      <Avatar size="3" fallback="SB" badge={<Badge>2</Badge>} />
      <Avatar size="5" fallback="SB" badge={<Badge>2</Badge>} />
      <Avatar size="7" fallback="SB" badge={<Badge aria-label="Online" tone="success" />} />
    </Flex>
  );
}
```

### In a tab label

A badge in a tab label counts the items that wait in that tab. It scales with the tab's text, so it needs no `size`.

```tsx
import { Badge, Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

// A badge in a tab label counts what waits on the other side of the tab.
export default function Example() {
  return (
    <Tabs defaultValue="open">
      <TabsList>
        <TabsTab value="open">
          Open <Badge>14</Badge>
        </TabsTab>
        <TabsTab value="review">
          In review <Badge tone="warning">3</Badge>
        </TabsTab>
        <TabsTab value="closed">Closed</TabsTab>
      </TabsList>
    </Tabs>
  );
}
```

### In a navigation list

In a list of Rows, put each badge in the row's `trailing` slot, so every count lines up at the end of its row.

```tsx
import { Badge, Row, Stack } from "@kushagradhawan/kookie-ui-react";

// In a navigation list, put the badge in the row's `trailing` slot so every count lines up at
// the end.
export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "16rem" }}>
      <Row current trailing={<Badge>6</Badge>}>
        Inbox
      </Row>
      <Row trailing={<Badge tone="neutral">2</Badge>}>Drafts</Row>
      <Row>Sent</Row>
      <Row trailing={<Badge tone="destructive" aria-label="Delivery failed" />}>Outbox</Row>
    </Stack>
  );
}
```

### Hidden at zero

Write `{count > 0 && count}` to show the badge only when there is something to count. At zero, the badge has no content and no name, so it renders nothing.

```tsx
"use client";

import * as React from "react";
import { Badge, Button, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// Write `{count > 0 && count}` to show the badge only when there is something to count. At
// zero, the badge has no content and no name, so nothing renders.
export default function Example() {
  const [count, setCount] = React.useState(2);
  return (
    <Flex gap="4" align="center">
      <Text>
        Inbox <Badge>{count > 0 && count}</Badge>
      </Text>
      <Button emphasis="medium" disabled={count === 0} onClick={() => setCount((c) => c - 1)}>
        Mark one as read
      </Button>
    </Flex>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label` | `string` | The accessible name of the dot, such as "New messages". |
| `children?` | `undefined` | No content. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step of the badge, from `1` to `9`. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The meaning of the badge, which sets its colour. |

It also takes every prop of a `<span>`.
