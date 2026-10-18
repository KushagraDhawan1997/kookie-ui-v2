# Checkbox

Checkbox turns a single option on or off.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Checkbox id="ship" defaultChecked />
<Text render={<label htmlFor="ship" />}>Ship it</Text>
```

## Overview

Checkbox turns a single option on or off. It is neutral when off and takes the accent colour when on, and it can also show a mixed state for a group where only some options are selected.

Use a checkbox for an option that takes effect when you submit a form, or for choosing several items from a list. For a setting that takes effect straight away, use a Switch. To pick one option from several, use a RadioGroup, and for a pressed state in a toolbar, use a Toggle.

The label is a separate element rather than a child. In a form, put each checkbox in a `FieldItem` with a `FieldLabel`, and add a `FieldDescription` if the option needs explaining. Outside a form, give the checkbox an `id` and render a Text as `<label htmlFor>`. A label that wraps the checkbox works too, such as `<Card render={<label />}>`.

Use `defaultChecked` to let the checkbox hold its own state, or `checked` with `onCheckedChange` when your app holds it. Set `indeterminate` for the mixed state, and `name` to send the value with a form. There is no `readOnly`, so use `disabled` for an option that can't be changed.

The box is as tall as one line of the text beside it, so it lines up with its label. `size` sets that height, and when you don't set it the checkbox takes the size of its Field or else the Theme's size. The area you can tap reaches beyond the visible box to the height of a Button at the same size. When you stack checkboxes, keep at least `gap="5"` between them so those tap areas don't overlap.

Space toggles a focused checkbox, and clicking its label toggles it too. A screen reader reads the label and the state: checked, not checked or mixed. A focus ring shows when you reach the checkbox with the keyboard.

## Use instead

- `Switch` when the setting takes effect the moment it changes.

## Not supported

- `tone` and `emphasis` — A checkbox always means the same thing, so it is always neutral when off and accent when on. If one option needs to stand out, say so in its label.
- `children` — The label is a sibling element rather than a child, so the layout around them decides the space between the box and its label.
- `readOnly` — HTML has no read-only checkbox, and one would look exactly like a live checkbox that ignores presses. Use `disabled` for an option that can't be changed.

## Examples

```tsx
import { Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox size={size} defaultChecked id="c1" />
        <Text size="2" render={<label htmlFor="c1" />}>Ship it</Text>
      </Flex>
      <Flex gap="3" align="center">
        <Checkbox size={size} id="c2" />
        <Text size="2" render={<label htmlFor="c2" />}>Hold for review</Text>
      </Flex>
    </Stack>
  );
}
```

### Sizes

Each checkbox size is as tall as one line of text one size up, so a size 2 checkbox pairs with size 3 text. Go up both together.

```tsx
import { Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const SIZES = [
  { size: "1", text: "2" },
  { size: "2", text: "3" },
  { size: "3", text: "4" },
  { size: "4", text: "5" },
] as const;

export default function Example() {
  return (
    <Stack gap="5">
      {SIZES.map(({ size, text }) => (
        <Flex key={size} gap="3" align="center">
          <Checkbox size={size} defaultChecked id={`size-${size}`} />
          <Text size={text} render={<label htmlFor={`size-${size}`} />}>
            Email me a weekly summary
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}
```

### In a form

Each checkbox sits in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The field connects each label and description to its checkbox, so you don't write any `id`.

```tsx
import {
  Checkbox,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Notifications</FieldLabel>
      <Stack gap="5">
        <FieldItem>
          <Checkbox name="comments" defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to your comment.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox name="mentions" defaultChecked />
          <FieldLabel>Mentions</FieldLabel>
          <FieldDescription>When someone mentions you in a project.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox name="invoices" />
          <FieldLabel>Invoices</FieldLabel>
          <FieldDescription>When a new invoice is ready to download.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
```

### Select all with a mixed state

The checkbox above the list shows `indeterminate` while only some files are selected. Pressing it selects every file, or clears them all.

```tsx
"use client";

import * as React from "react";
import { Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const FILES = ["brief.pdf", "hero-final.png", "walkthrough.mp4"];

export default function Example() {
  const [selected, setSelected] = React.useState<string[]>(["brief.pdf"]);
  const all = selected.length === FILES.length;
  const some = selected.length > 0 && !all;

  const toggle = (file: string, checked: boolean) =>
    setSelected((rest) => (checked ? [...rest, file] : rest.filter((f) => f !== file)));

  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox
          id="all-files"
          checked={all}
          indeterminate={some}
          onCheckedChange={(checked) => setSelected(checked ? FILES : [])}
        />
        <Text size="2" weight="medium" render={<label htmlFor="all-files" />}>
          Select all files
        </Text>
      </Flex>
      {FILES.map((file) => (
        <Flex key={file} gap="3" align="center">
          <Checkbox
            id={`file-${file}`}
            checked={selected.includes(file)}
            onCheckedChange={(checked) => toggle(file, checked)}
          />
          <Text size="2" render={<label htmlFor={`file-${file}`} />}>
            {file}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}
```

### Disabled

`disabled` fades the box and its tick and blocks presses. A disabled checkbox keeps its state, so a checked one still shows its tick.

```tsx
import { Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox id="sso" defaultChecked disabled />
        <Text size="2" render={<label htmlFor="sso" />}>
          Require single sign-on
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Checkbox id="audit" disabled />
        <Text size="2" render={<label htmlFor="audit" />}>
          Keep an audit log for 2 years
        </Text>
      </Flex>
    </Stack>
  );
}
```

### Controlled

Pass `checked` and `onCheckedChange` when other parts of the screen depend on the value. Here the button stays disabled until you accept the terms.

```tsx
"use client";

import * as React from "react";
import { Button, Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <Stack gap="4" align="flex-start">
      <Flex gap="3" align="center">
        <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
        <Text size="2" render={<label htmlFor="terms" />}>
          I accept the terms of service
        </Text>
      </Flex>
      <Button emphasis="loud" disabled={!agreed}>
        Create account
      </Button>
    </Stack>
  );
}
```

### In a card

Each checkbox and its text sit in a `<Card render={<label />}>`, so pressing anywhere on the card toggles the option. A checked card gets an accent-coloured edge.

```tsx
import { Card, Checkbox, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const ADDONS = [
  { name: "Priority support", detail: "Replies within 4 hours, every day." },
  { name: "Extra storage", detail: "Adds 500 GB to every member." },
];

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "24rem" }}>
      {ADDONS.map((addon, index) => (
        <Card key={addon.name} render={<label />}>
          <Flex gap="3" align="flex-start">
            <Checkbox defaultChecked={index === 0} />
            <Stack gap="1">
              <Text size="3" weight="medium">
                {addon.name}
              </Text>
              <Text size="2" emphasis="medium">
                {addon.detail}
              </Text>
            </Stack>
          </Flex>
        </Card>
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
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the checkbox, from `1` to `4`. |
