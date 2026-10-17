# Slider

Slider lets someone choose a number by dragging a handle along a track.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Slider defaultValue={40} aria-label="Volume" />
```

## Overview

Use a Slider for a value such as a volume, a price or a timeout, where the rough position in the range matters more than the exact number. When people need to type an exact number, use a `NumberField` instead.

Pressing anywhere on the Slider moves the nearest handle there, and the pressable area is as tall as a `Button` of the same size. The handle is the same size as a `Checkbox` at that size, so the two look like they belong together in a form. A Slider fills the width of its container, so set the width on the container rather than on the Slider.

To choose a range, pass an array as the value and the Slider draws one handle for each entry. The filled part of the track uses the accent colour and the rest of the track is neutral. A disabled Slider turns the filled part grey.

Each handle is a real range input, so the arrow keys, Page Up, Page Down, Home and End all move it. Name a Slider that stands alone with `aria-label`. Inside a `Field`, the `FieldLabel` names it for you. In a right-to-left page the Slider fills from the right, and the arrow keys follow that direction.

## Not supported

- `tone` and `emphasis` — A slider sets a value rather than running an action, so there is nothing for a colour or a louder style to rank. Every slider in a form looks the same.
- `orientation` — A vertical slider needs its own set of measurements, which have not been designed yet. For now, every Slider is horizontal.

## Examples

```tsx
import { Slider, Stack } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    /* A slider takes its container's width — it has no width of its own, so it needs a
       container that has one. `flexGrow` says so for the case where this lands in a flex ROW
       (the docs' own figure is one) and is inert everywhere else, which is what a page is: a
       Stack in normal flow already fills the column it sits in. */
    <Stack gap="5" style={{ flexGrow: 1 }}>
      <Slider size={size} defaultValue={40} aria-label="Value" />
      <Slider size={size} defaultValue={[20, 65]} aria-label="Range" />
    </Stack>
  );
}
```

### A range with two handles

Pass an array as the value, and the Slider draws a handle for each entry. Here `minStepsBetweenValues` keeps the two price handles apart, and `format` sets how each value is announced to a screen reader.

```tsx
import { Field, FieldDescription, FieldLabel, Slider } from "@kushagradhawan/kookie-ui-react";

// Pass an array and the Slider draws a handle for each value. `minStepsBetweenValues`
// keeps the two handles at least that many steps apart.
export default function Example() {
  return (
    <Field style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <FieldLabel>Price range</FieldLabel>
      <Slider
        defaultValue={[40, 160]}
        min={0}
        max={200}
        step={10}
        minStepsBetweenValues={2}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
      <FieldDescription>Shows plans between the two prices.</FieldDescription>
    </Field>
  );
}
```

### Controlled

Hold the value in your own state when you want to show it somewhere else. `onValueChange` fires while someone drags, and `onValueCommitted` fires once when they let go, which is the right moment to save.

```tsx
"use client";

import * as React from "react";
import { Flex, Slider, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Hold the value in your own state to show it or use it elsewhere. `onValueChange` fires
// while you drag. `onValueCommitted` fires once, when you let go.
export default function Example() {
  const [volume, setVolume] = React.useState(60);
  const [saved, setSaved] = React.useState(60);
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Flex justify="space-between">
        <Text size="2" weight="medium">
          Notification volume
        </Text>
        <Text size="2" emphasis="medium">
          {volume}%
        </Text>
      </Flex>
      <Slider
        aria-label="Notification volume"
        value={volume}
        onValueChange={(value) => setVolume(value as number)}
        onValueCommitted={(value) => setSaved(value as number)}
      />
      <Text size="2" emphasis="medium">
        Saved at {saved}%.
      </Text>
    </Stack>
  );
}
```

### Steps and limits

`min`, `max` and `step` set the values a handle can stop on. `largeStep` sets how far Page Up, Page Down and Shift with an arrow key move it.

```tsx
import { Slider, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `min`, `max` and `step` set the values a handle can land on. `largeStep` is how far
// Page Up, Page Down and Shift with an arrow key move it.
export default function Example() {
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Text size="2" weight="medium">
        Session timeout, in minutes
      </Text>
      <Slider
        aria-label="Session timeout, in minutes"
        defaultValue={30}
        min={5}
        max={120}
        step={5}
        largeStep={30}
      />
    </Stack>
  );
}
```

### Disabled

A disabled Slider still shows its value, but it can't be moved. The filled part turns grey so the setting reads as locked, and a line of text underneath says why.

```tsx
import { Slider, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A disabled Slider keeps its value in view but does not move. The filled part turns
// grey, so the setting reads as off.
export default function Example() {
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Text size="2" weight="medium">
        Storage limit
      </Text>
      <Slider aria-label="Storage limit" defaultValue={70} disabled />
      <Text size="2" emphasis="medium">
        Only the workspace owner can change this.
      </Text>
    </Stack>
  );
}
```

### In a form

Inside a `Field`, the `FieldLabel` names the Slider, so you don't need `aria-label`. Give it a `name`, and its value is sent when the form is submitted.

```tsx
import { Button, Field, FieldDescription, FieldLabel, Slider, Stack } from "@kushagradhawan/kookie-ui-react";

// Inside a Field, the FieldLabel names the Slider, so it needs no `aria-label`. Give it a
// `name` and the value is sent with the form.
export default function Example() {
  return (
    <Stack render={<form />} gap="5" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Field>
        <FieldLabel>Image quality</FieldLabel>
        <Slider name="quality" defaultValue={80} min={10} max={100} step={10} />
        <FieldDescription>Higher quality makes larger files.</FieldDescription>
      </Field>
      <Button type="submit" emphasis="loud">
        Export images
      </Button>
    </Stack>
  );
}
```

### Right to left

Inside an element with `dir="rtl"`, the Slider fills from the right and the right arrow key lowers the value. The Slider picks up the direction from the page, so it has no prop for it.

```tsx
import { Box, Slider } from "@kushagradhawan/kookie-ui-react";

// Under `dir="rtl"` the Slider fills from the right. The right arrow key lowers the value,
// because it moves the handle toward the start.
export default function Example() {
  return (
    <Box dir="rtl" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Slider aria-label="Brightness" defaultValue={35} />
    </Box>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name of the slider. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the slider, from `1` to `4`. |
