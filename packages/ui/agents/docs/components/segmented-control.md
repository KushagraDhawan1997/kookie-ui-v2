# Segmented Control

SegmentedControl shows a few options side by side and lets someone pick one of them.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<SegmentedControl defaultValue="grid" aria-label="View">
  <SegmentedItem value="list">List</SegmentedItem>
  <SegmentedItem value="grid">Grid</SegmentedItem>
</SegmentedControl>
```

## Overview

Use a SegmentedControl for two to five short options that change a setting in place, such as a list or grid view. When the choice switches the content below it, use `Tabs`. When people can pick more than one option, use a `ToggleGroup` of `Toggle`s, and when there are too many options to show at once, use a `Select`.

The chosen option sits on a raised tile, and the control is as tall as a `Button` of the same size, so it lines up in a toolbar. Every segment has the same weight, and you set the size once on the control rather than on each segment.

Set `backdrop` when content passes behind the control, such as an image, and it uses the theme's glass material. A `<Box backdrop>` around a whole toolbar does the same for every control inside it.

A screen reader announces the control as a radio group, because picking one of several options is what a radio group does. The arrow keys move the choice from one segment to the next. Give the control an `aria-label` that names the setting.

## Use instead

- `Tabs` when each option is a different view, with its own content.

## Not supported

- `tone` and `emphasis` — The options in a SegmentedControl are equal choices, so none of them should look louder than the others. The control always uses the same neutral colours.
- Selecting more than one option — A SegmentedControl holds exactly one answer. When people can turn several options on at once, use a `ToggleGroup` of `Toggle`s.
- `nativeButton` and `render` — A segment is always the same element. Setting `nativeButton` would stop Space from selecting it, and changing the element with `render` gives you nothing a segment needs.
- `readOnly` — HTML has no read-only version of a selection control, so there is no familiar look to copy. Use `disabled` when the choice can't be changed.

## Examples

```tsx
import { SegmentedControl, SegmentedItem } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <SegmentedControl size={size} backdrop={backdrop} defaultValue="grid" aria-label="View">
      <SegmentedItem value="list">List</SegmentedItem>
      <SegmentedItem value="grid">Grid</SegmentedItem>
    </SegmentedControl>
  );
}
```

### With icons

A segment can hold an icon beside its label. The icon is sized for the control, so every segment keeps the same height.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { SegmentedControl, SegmentedItem, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Sun03Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A segment can hold an icon beside its label. The icon takes the size set for the
// control, so every segment keeps the same height.
export default function Example() {
  return (
    <SegmentedControl defaultValue="system" aria-label="Appearance">
      <SegmentedItem value="light">
        {icon(Sun03Icon)}
        Light
      </SegmentedItem>
      <SegmentedItem value="dark">
        {icon(Moon02Icon)}
        Dark
      </SegmentedItem>
      <SegmentedItem value="system">
        {icon(ComputerIcon)}
        System
      </SegmentedItem>
    </SegmentedControl>
  );
}
```

### Icon-only segments

A segment with only an icon needs an `aria-label` so that a screen reader can name the option. Use icons people already know, such as list and grid.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { SegmentedControl, SegmentedItem, iconStroke } from "@kushagradhawan/kookie-ui-react";

// A segment with only an icon needs `aria-label`, so a screen reader can name the option.
export default function Example() {
  return (
    <SegmentedControl defaultValue="grid" aria-label="Layout">
      <SegmentedItem value="list" aria-label="List">
        <HugeiconsIcon icon={ListViewIcon} strokeWidth={iconStroke} aria-hidden />
      </SegmentedItem>
      <SegmentedItem value="grid" aria-label="Grid">
        <HugeiconsIcon icon={GridViewIcon} strokeWidth={iconStroke} aria-hidden />
      </SegmentedItem>
    </SegmentedControl>
  );
}
```

### Controlled

Hold the value in your own state with `value` and `onValueChange` when the choice changes something else on the screen. Here the billing period changes the price shown below.

```tsx
"use client";

import * as React from "react";
import { Heading, SegmentedControl, SegmentedItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PRICES = { monthly: "$12 per month", yearly: "$120 per year" } as const;
type Period = keyof typeof PRICES;

// Hold the value in your own state when the choice changes something else on the screen.
export default function Example() {
  const [period, setPeriod] = React.useState<Period>("monthly");
  return (
    <Stack gap="4">
      <SegmentedControl
        aria-label="Billing period"
        value={period}
        onValueChange={(value) => setPeriod(value as Period)}
      >
        <SegmentedItem value="monthly">Monthly</SegmentedItem>
        <SegmentedItem value="yearly">Yearly</SegmentedItem>
      </SegmentedControl>
      <Stack gap="1">
        <Heading size="6">{PRICES[period]}</Heading>
        <Text size="2" emphasis="medium">
          Team plan, for up to 10 people.
        </Text>
      </Stack>
    </Stack>
  );
}
```

### Disabled

Set `disabled` on one `SegmentedItem` to block that option, or on the `SegmentedControl` to block the whole control. The options stay visible either way.

```tsx
import { SegmentedControl, SegmentedItem, Stack } from "@kushagradhawan/kookie-ui-react";

// Set `disabled` on one SegmentedItem to block that option. Set it on the SegmentedControl
// to block the whole control.
export default function Example() {
  return (
    <Stack gap="4" align="start">
      <SegmentedControl defaultValue="week" aria-label="Report range">
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="year" disabled>
          Year
        </SegmentedItem>
      </SegmentedControl>
      <SegmentedControl defaultValue="week" aria-label="Report range, locked" disabled>
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="year">Year</SegmentedItem>
      </SegmentedControl>
    </Stack>
  );
}
```

### In a toolbar

At the same size, a SegmentedControl is as tall as the `TextField` and `Button` beside it, so a row of mixed controls lines up without any extra work.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import { Button, Flex, SegmentedControl, SegmentedItem, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

// At the same size, a SegmentedControl is as tall as the Button and TextField beside it.
// A row of mixed controls lines up with no extra work.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <TextField aria-label="Search files" placeholder="Search files" />
      <SegmentedControl defaultValue="all" aria-label="Owner">
        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="mine">Mine</SegmentedItem>
        <SegmentedItem value="shared">Shared</SegmentedItem>
      </SegmentedControl>
      <Button
        emphasis="medium"
        leading={<HugeiconsIcon icon={FilterIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Filters
      </Button>
    </Flex>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Picking one of a few

#### SegmentedControl

SegmentedControl shows a few options side by side and lets someone pick one of them.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the control sits over other content, such as an image. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the control, from `1` to `4`. |

#### SegmentedItem

One option in the control. It holds its own label, and optionally an icon, and a screen reader announces it as a radio button that is checked or not

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
