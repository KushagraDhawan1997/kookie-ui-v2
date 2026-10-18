# Progress

Progress shows how far along a task is, such as an upload or an export.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Progress value={35} aria-label="Uploading" />
```

## Overview

Use Progress to show how much of a task is done, such as an upload, an export or a storage quota. Give `value` a number and the bar fills to that fraction. Set `value` to `null` when you cannot say how much is left, and the bar shows a moving segment instead.

For a short wait inside a control, such as a Button that is saving, use a Spinner. When the person sets the value themselves, use a Slider. A Progress bar only reports, so it takes no focus and responds to no pointer.

The bar has one fixed thickness and fills the width of its container, so set the width on the element that holds it. The value runs from 0 to 100 by default, and `min` and `max` let you count in other units, such as gigabytes.

The fill uses your app's accent colour. When the person has asked their system for reduced motion, the moving segment slows down but keeps moving, because the movement is what tells them that work is still happening.

Screen readers announce the bar as a progress bar with its current value. Name it with `aria-label`, or point `aria-labelledby` at a visible Text. When a percentage alone does not say enough, use `getAriaValueText` to provide words such as “7.2 of 10 gigabytes used”.

## Use instead

- `Spinner` when you do not know how long it will take.

## Not supported

- `size` — A bar has one designed thickness, and its length always comes from its container. Set the width on the element that holds it.
- `tone` — The fill always uses the accent colour. Whether a bar should turn red for a failed upload is still an open design question, so the prop is left out rather than guessed.

## Examples

```tsx
import { Progress, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    /* A bar takes its container's width — the slider's sentence one component over. `flexGrow`
       says so for a flex ROW and is inert in normal flow, so a reader copying this into a page
       gets exactly what they see here. */
    <Stack gap="4" style={{ flexGrow: 1 }}>
      <Progress value={35} aria-label="Thirty-five percent" />
      <Progress value={85} aria-label="Eighty-five percent" />
      <Progress value={null} aria-label="Loading" />
    </Stack>
  );
}
```

### With a visible label

A Text above the bar names it through `aria-labelledby`, so the same words label the bar on screen and for screen readers.

```tsx
import { Flex, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Flex justify="space-between" gap="3">
        <Text size="2" id="export-label">Exporting invoices</Text>
        <Text size="2" emphasis="medium">64%</Text>
      </Flex>
      <Progress value={64} aria-labelledby="export-label" />
    </Stack>
  );
}
```

### When the amount is unknown

With `value={null}`, the bar shows a moving segment. Use it when you know that work is happening but not how much of it is left.

```tsx
import { Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Text size="2" id="index-label">Indexing the repository</Text>
      <Progress value={null} aria-labelledby="index-label" />
      <Text size="2" emphasis="quiet">This can take a few minutes for large projects.</Text>
    </Stack>
  );
}
```

### A range other than 0 to 100

This bar uses `min` and `max` to count in gigabytes, and `getAriaValueText` so that screen readers announce the same words that are on screen.

```tsx
"use client";

import { Flex, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Flex justify="space-between" gap="3">
        <Text size="2" id="storage-label">Storage</Text>
        <Text size="2" emphasis="medium">7.2 of 10 GB</Text>
      </Flex>
      <Progress
        value={7.2}
        min={0}
        max={10}
        aria-labelledby="storage-label"
        getAriaValueText={(_, value) => `${value ?? 0} of 10 gigabytes used`}
      />
    </Stack>
  );
}
```

### In a card

A list of uploads, each with its own bar and label. A finished file shows a full bar, and a file that is still waiting shows the moving segment.

```tsx
import { Card, Flex, Heading, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const FILES = [
  { name: "brand-guidelines.pdf", value: 100, note: "Done" },
  { name: "launch-video.mp4", value: 42, note: "42%" },
  { name: "press-kit.zip", value: null, note: "Waiting" },
];

export default function Example() {
  return (
    <Card style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Stack gap="5">
        <Heading size="6">Uploads</Heading>
        {FILES.map((file) => (
          <Stack key={file.name} gap="2">
            <Flex justify="space-between" gap="3">
              <Text size="2" id={`upload-${file.name}`}>{file.name}</Text>
              <Text size="2" emphasis="quiet">{file.note}</Text>
            </Flex>
            <Progress value={file.value} aria-labelledby={`upload-${file.name}`} />
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
| `aria-label?` | `string` | The accessible name of the task, such as "Uploading photos". |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
