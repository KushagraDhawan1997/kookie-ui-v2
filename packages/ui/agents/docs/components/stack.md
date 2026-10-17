# Stack

Stack places its children in a column, one under the other, with a gap between them.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Stack gap="3" align="start">
  …
</Stack>
```

## Overview

Use a Stack for most vertical layouts, such as a form, a list of settings, the inside of a card or a group of paragraphs. When the children sit side by side, use a `Flex`, and when they sit in rows and columns, use a `Grid`. A Stack is a `Box` with a column layout already set, so it takes the same props.

Set the space between children with `gap`. The value is a step on the space scale rather than a length, and the theme and its density setting decide how much space each step is. Components never set their own outer margin, so the Stack controls all of the space between them.

Because a column has one direction, a Stack has no `direction`, `wrap`, `gapX` or `gapY`. If you need a row, use `Flex`. To draw a line between items, place a `Separator` where you want it.

Most props accept a responsive value, such as `{ initial: "3", md: "5" }`. The breakpoints measure the nearest `Box` marked with `container`, or the whole app when there is none. Use `render` to make the Stack a different element, such as a `section` or a `form`, while the layout stays the same.

## Not supported

- `dividers` — A prop that adds a line between every child can't know where you want an exception. Place a `Separator` exactly where each line belongs.

## Examples

```tsx
import { Button, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  gap = "3",
  align = "stretch",
}: {
  gap?: string;
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
}) {
  return (
    <Stack gap={gap} align={align}>
      <Button size="2">First</Button>
      <Button size="2">Second</Button>
    </Stack>
  );
}
```

### Gaps

`gap` sets the space between every child. A small step suits items that belong together, such as the lines of an address, and a larger step suits groups that are separate.

```tsx
import { Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const steps = ["2", "4", "6"] as const;

export default function Example() {
  return (
    <Flex gap="7" wrap="wrap">
      {steps.map((gap) => (
        <Stack key={gap} gap={gap}>
          <Text size="2" weight="medium">
            Gap {gap}
          </Text>
          <Text size="2">Invoices</Text>
          <Text size="2">Payment methods</Text>
          <Text size="2">Tax details</Text>
        </Stack>
      ))}
    </Flex>
  );
}
```

### Alignment

`align` sets where each child sits across the column. With the default, each child is as wide as the Stack. Use `flex-start` to keep buttons at their own width.

```tsx
import { Button, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const aligns = ["flex-start", "center", "flex-end", "stretch"] as const;

export default function Example() {
  return (
    <Flex gap="6" wrap="wrap">
      {aligns.map((align) => (
        <Stack key={align} gap="2" align={align} style={{ width: "10rem" }}>
          <Text size="2" emphasis="medium">
            {align}
          </Text>
          <Button>Upgrade</Button>
          <Button>Compare plans</Button>
        </Stack>
      ))}
    </Flex>
  );
}
```

### Nested groups

Put a Stack inside a Stack to make groups, with a smaller gap inside each group and a larger gap between them. The difference in space tells people which items belong together.

```tsx
import { Button, Field, FieldLabel, Heading, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="6" style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="5">Profile</Heading>
        <Field>
          <FieldLabel>Display name</FieldLabel>
          <TextField defaultValue="Shruti Bhatia" />
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <TextField type="email" defaultValue="shruti@example.com" />
        </Field>
      </Stack>
      <Stack gap="4">
        <Heading size="5">Workspace</Heading>
        <Field>
          <FieldLabel>Workspace name</FieldLabel>
          <TextField defaultValue="Northwind Studio" />
        </Field>
      </Stack>
      <Stack align="flex-end">
        <Button emphasis="loud">Save changes</Button>
      </Stack>
    </Stack>
  );
}
```

### With separators

Place a `Separator` wherever you want a line. Here each row after the first starts with one, so there is no line above the first row. The gap sets the space on both sides of each line.

```tsx
import { Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const rows = [
  ["Plan", "Team"],
  ["Seats", "12 of 15"],
  ["Next invoice", "£240.00 on 1 October"],
] as const;

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "24rem" }}>
      {rows.map(([label, value], index) => (
        <Stack key={label} gap="3">
          {index > 0 && <Separator />}
          <Flex justify="space-between" gap="4">
            <Text size="2" emphasis="medium">
              {label}
            </Text>
            <Text size="2">{value}</Text>
          </Flex>
        </Stack>
      ))}
    </Stack>
  );
}
```

### Responsive

Give `gap` or `align` an object with a value for each breakpoint. Here the gap grows and the buttons stop stretching when the container is wider. The breakpoints measure a container, not the browser window.

```tsx
import { Button, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap={{ initial: "3", md: "5" }} align={{ initial: "stretch", md: "flex-start" }}>
      <Text size="3">Your trial ends in three days.</Text>
      <Button emphasis="loud">Choose a plan</Button>
      <Button>Talk to sales</Button>
    </Stack>
  );
}
```

### As a section

Use `render` to make the Stack a meaningful element, such as a `section` named by its heading. The column and the gap stay the same, and only the element changes.

```tsx
import { Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" render={<section aria-labelledby="billing-heading" />} style={{ maxWidth: "28rem" }}>
      <Heading size="5" id="billing-heading">
        Billing
      </Heading>
      <Text size="3" render={<p />}>
        Your workspace is on the Team plan with 12 of 15 seats in use.
      </Text>
      <Text size="3" emphasis="medium" render={<p />}>
        The next invoice is due on 1 October.
      </Text>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. |
| `container?` | `boolean` | Make this Box measurable. |
| `render?` | `RenderElement` | Renders the box as a different element, so you don't add a wrapper. |

It also takes every prop of a `<div>`.
