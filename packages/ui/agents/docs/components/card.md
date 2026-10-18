# Card

Card sets one object apart from the rest of the page, such as a project, a plan or a group of settings.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Card size="2">
  …
</Card>
```

## Overview

Card sets one object apart from the rest of the page, such as a project, a plan or a group of settings. It has a solid fill, a rounded corner and padding, and it holds whatever you put inside it. Arrange that content with Stack and Flex.

To hold several cards in one region, or to make a quieter region inside a card, use a Surface. For code inside a card, use a CodeBlock. Don't put a card inside another card, and a development build warns you if you do.

`size` sets the padding and the corner. The content decides how tall the card is. Whether cards cast a shadow is set for the whole app by the Theme's `depth`.

The element you pass to `render` decides what the card does. As an `<a>` or a `<button>`, the whole card is pressable, with the same hover, press, focus and disabled states as other controls. As a `<label>` around a Radio or a Checkbox, the whole card selects that control, and the card's edge turns the accent colour while the control is checked.

A card clips its content to its corner. To make a picture or a band reach the card's edge, put it in a Box with `m="bleed"`, or with `mt="bleed"` and `mx="bleed"` for the top and sides only.

Set `backdrop` when an image, a map or a scrolling feed shows behind the card, so that it uses the theme's material. Without it, the card is solid. A card can only be focused when you render it as a link, a button or a label, and a screen reader then reads it as that element, so write its text to make sense read aloud as one name.

## Use instead

- `Surface` when a quiet region holds several things without making any one of them an object.

## Not supported

- A `selected` prop, and an `interactive` one — The element decides what a card does. Use `<Card render={<button />}>` for a card you press, or put a `Radio` in `<Card render={<label />}>` for a card you select.
- A card inside a card — A card inside a card doesn't show any clear relationship between the two. Use a Surface for a quieter region inside a card, or to hold several cards.
- A material prop — The Theme sets one material for the whole app. Set `backdrop` on a card that has content behind it, or wrap part of the page in a nested Theme to change the material there.
- Tone, emphasis and bordered — A card is a container, not an action, so it has no rank among its neighbours. Its fill and border are the same on every card in your app.
- A media or cover slot — A card already clips its children to its corner, so a picture can reach the edge without a slot. Wrap it in `<Box mt="bleed" mx="bleed">`.
- Header and footer slots — A title or a footer is just a layout, so you arrange it yourself with Stack and Flex. That leaves you free to build whatever layout the card needs.

## Examples

```tsx
import { Card, Stack, Text, type Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <Card size={size} backdrop={backdrop} style={{ maxWidth: "24rem" }}>
      <Stack gap="2">
        <Text size="3" weight="medium">
          Paper above the page
        </Text>
        <Text size="2" emphasis="medium">
          One fixed treatment: a sealed fill, a hairline and a corner. No tone, no emphasis, no
          anatomy — what a card holds is the caller&apos;s.
        </Text>
      </Stack>
    </Card>
  );
}
```

### Sizes

The four sizes. `size` changes the padding and the corner, and the content sets the height. Use a smaller size for dense content such as stats, and a larger one for a form.

```tsx
import { Card, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="4" align="flex-start" wrap="wrap">
      {SIZES.map((size) => (
        <Card key={size} size={size}>
          <Stack gap="1">
            <Text size="2" emphasis="medium">
              Storage used
            </Text>
            <Text size="3" weight="medium">
              42 GB of 100 GB
            </Text>
          </Stack>
        </Card>
      ))}
    </Flex>
  );
}
```

### A card that opens a page

With `render={<a href />}`, the whole card is one link with hover, press and focus states. Don't put another link inside it, because a link inside a link is invalid HTML.

```tsx
import { Card, Grid, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [
  { name: "Website redesign", meta: "Updated 2 hours ago" },
  { name: "Mobile onboarding", meta: "Updated yesterday" },
];

export default function Example() {
  return (
    <Grid columns="1fr 1fr" gap="4" style={{ maxWidth: "32rem" }}>
      {PROJECTS.map((project) => (
        <Card key={project.name} render={<a href="#project" />}>
          <Stack gap="1">
            <Text size="3" weight="medium">
              {project.name}
            </Text>
            <Text size="2" emphasis="medium">
              {project.meta}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
```

### A card that runs an action

Use `render={<button />}` when the card runs an action instead of opening a page, and put the handler on the element you pass to `render`.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Card, Flex, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [count, setCount] = React.useState(0);

  return (
    <Card render={<button type="button" onClick={() => setCount((n) => n + 1)} />} style={{ maxWidth: "24rem" }}>
      <Flex gap="3" align="center">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={iconStroke} aria-hidden />
        <Stack gap="1">
          <Text size="3" weight="medium">
            New blank project
          </Text>
          <Text size="2" emphasis="medium">
            {count === 0 ? "Start from an empty canvas." : `${count} created this session.`}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}
```

### Cards that select one option

Each Radio sits in a `<Card render={<label />}>` inside a RadioGroup, so pressing anywhere on a card selects its option. The selected card gets an accent-coloured edge.

```tsx
import { Card, Flex, Radio, RadioGroup, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PLANS = [
  { value: "starter", name: "Starter", detail: "Up to 3 projects and 5 GB of storage." },
  { value: "team", name: "Team", detail: "Unlimited projects and 100 GB of storage." },
];

export default function Example() {
  return (
    <RadioGroup defaultValue="team" aria-label="Plan">
      <Stack gap="3" style={{ maxWidth: "24rem" }}>
        {PLANS.map((plan) => (
          <Card key={plan.value} render={<label />}>
            <Flex gap="3" align="flex-start">
              <Radio value={plan.value} />
              <Stack gap="1">
                <Text size="3" weight="medium">
                  {plan.name}
                </Text>
                <Text size="2" emphasis="medium">
                  {plan.detail}
                </Text>
              </Stack>
            </Flex>
          </Card>
        ))}
      </Stack>
    </RadioGroup>
  );
}
```

### Disabled

A card rendered as a disabled button fades its fill and text and stops showing a pointer. Say in the card's own text why it isn't available.

```tsx
import { Card, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap">
      <Card render={<button type="button" />}>
        <Stack gap="1">
          <Text size="3" weight="medium">
            Import from CSV
          </Text>
          <Text size="2" emphasis="medium">
            Upload a spreadsheet of contacts.
          </Text>
        </Stack>
      </Card>
      <Card render={<button type="button" disabled />}>
        <Stack gap="1">
          <Text size="3" weight="medium">
            Import from Salesforce
          </Text>
          <Text size="2" emphasis="medium">
            Available on the Team plan.
          </Text>
        </Stack>
      </Card>
    </Flex>
  );
}
```

### Cards in a responsive grid

Passing an object to Grid's `columns` changes the layout as the space grows. Here the cards stack in one column and move to three columns from `sm` up.

```tsx
import { Card, Grid, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const STATS = [
  { label: "Active members", value: "24" },
  { label: "Open invoices", value: "3" },
  { label: "Storage used", value: "42 GB" },
];

export default function Example() {
  return (
    <Grid columns={{ initial: "1fr", sm: "repeat(3, 1fr)" }} gap="4">
      {STATS.map((stat) => (
        <Card key={stat.label}>
          <Stack gap="1">
            <Text size="2" emphasis="medium">
              {stat.label}
            </Text>
            <Text size="5" weight="medium">
              {stat.value}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
```

### A settings form in a card

A card that holds a whole task: a heading, a field and its actions, with one loud button for the card's main action.

```tsx
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Heading,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="5">
        <Stack gap="1">
          <Heading size="5">Workspace name</Heading>
          <Text size="2" emphasis="medium">
            Members see this name in invitations and on invoices.
          </Text>
        </Stack>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextField defaultValue="Kookie Studio" />
          <FieldDescription>Use 32 characters or fewer.</FieldDescription>
        </Field>
        <Flex justify="flex-end" gap="2">
          <Button emphasis="quiet">Cancel</Button>
          <Button emphasis="loud">Save changes</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the card, such as an image, a canvas or a scrolling feed. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `render?` | `RenderElement` | Renders the card as a different element, which decides what the card does. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the padding and the corner size. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.
