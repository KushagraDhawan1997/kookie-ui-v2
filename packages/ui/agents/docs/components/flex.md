# Flex

Flex arranges its children in a row or a column, with even space between them.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Flex gap="3" align="center" justify="space-between">
  …
</Flex>
```

## Overview

Use a Flex for a row of buttons, a toolbar, or a title with actions beside it. For a single column with even spacing, use `Stack`. To line children up in rows and columns at the same time, use `Grid`.

Flex is a `Box` with `display: flex`, so it accepts the Box props plus `direction`, `align`, `justify`, `wrap` and `gap`. It has no grid props, so TypeScript reports an error if you set `columns` or `rows`. Use `display="inline-flex"` to place a Flex inside a line of text.

Set the space between children with `gap`. Its values are steps on the spacing scale, and the theme's density decides how large each step is. To let one child take the free space, wrap it in a `Box` with `flexGrow="1"`.

Most props accept either one value or a value for each breakpoint, such as `direction={{ initial: "column", md: "row" }}`. The breakpoints measure the nearest `Box` with `container`, or the whole app when there is none. `display` accepts one value only, so use a `Box` if you need it to change with the width.

Flex adds nothing visible and has no role, so a screen reader reads its children in the order you write them. Keep that order the same as the order on screen.

## Not supported

- `margin` on the children — Components have no margin props, so the space between siblings is set once, with `gap` on the Flex. This keeps the spacing in a row consistent.

## Examples

```tsx
import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  gap = "4",
  direction = "row",
  align = "center",
  justify = "flex-start",
}: {
  gap?: string;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
}) {
  return (
    <Flex gap={gap} direction={direction} align={align} justify={justify}>
      <Button size="2">One</Button>
      <Button size="2">Two</Button>
      <Button size="2">Three</Button>
    </Flex>
  );
}
```

### Title and actions

`justify="space-between"` with a title at one end and a group of buttons at the other. A second Flex groups the buttons with a gap of their own.

```tsx
import { Button, Flex, Heading, Text, Stack } from "@kushagradhawan/kookie-ui-react";

// `justify="space-between"` puts the title at one edge and the actions at
// the other. A nested Flex groups the actions with their own gap.
export default function Example() {
  return (
    <Flex justify="space-between" align="center" gap="4">
      <Stack gap="1">
        <Heading size="6">Invoices</Heading>
        <Text size="2" emphasis="medium">
          12 invoices this year
        </Text>
      </Stack>
      <Flex gap="3">
        <Button emphasis="quiet" bordered>
          Export
        </Button>
        <Button emphasis="loud">New invoice</Button>
      </Flex>
    </Flex>
  );
}
```

### Wrapping to new lines

`wrap="wrap"` with a set of chips. Items move to a new line when the row runs out of room, and `gap` spaces both the items and the lines.

```tsx
import { Chip, Flex } from "@kushagradhawan/kookie-ui-react";

const TAGS = ["Billing", "Onboarding", "API", "Security", "Mobile", "Integrations", "Reporting", "Accessibility"];

// `wrap="wrap"` moves items to a new line when the row runs out of room.
// `gap` sets the space between items on a line and between lines.
export default function Example() {
  return (
    <Flex wrap="wrap" gap="2" style={{ maxWidth: "24rem" }}>
      {TAGS.map((tag) => (
        <Chip key={tag}>{tag}</Chip>
      ))}
    </Flex>
  );
}
```

### A child that fills the space

A search field in a `Box` with `flexGrow="1"`, beside two buttons. The field takes the free space, and the buttons keep their natural width.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Box, Button, Flex, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

// Wrap the child that should take the free space in a Box with
// `flexGrow="1"`. The other children keep their own width.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Box flexGrow="1">
        <TextField
          aria-label="Search projects"
          placeholder="Search projects"
          leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        />
      </Box>
      <Button emphasis="medium">Filters</Button>
      <Button emphasis="loud">New project</Button>
    </Flex>
  );
}
```

### Column to row

`direction`, `align` and `gap` with a value for each breakpoint. The content stacks in a narrow container and becomes a row from the `md` breakpoint.

```tsx
import { Box, Button, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Every Flex prop takes a value per breakpoint. This row stacks in a
// narrow container and becomes a row from the `md` breakpoint. The
// breakpoints measure the nearest Box with `container`.
export default function Example() {
  return (
    <Box container>
      <Flex
        direction={{ initial: "column", md: "row" }}
        align={{ initial: "stretch", md: "center" }}
        justify="space-between"
        gap={{ initial: "4", md: "6" }}
      >
        <Stack gap="1">
          <Heading size="6">Upgrade to Team</Heading>
          <Text emphasis="medium">Shared projects, roles and single sign-on.</Text>
        </Stack>
        <Button emphasis="loud">Start free trial</Button>
      </Flex>
    </Box>
  );
}
```

### Baseline alignment

`align="baseline"` with text in three sizes. The first lines of text line up, which `center` cannot do when the sizes differ.

```tsx
import { Flex, Heading, Text } from "@kushagradhawan/kookie-ui-react";

// `align="baseline"` lines up the first line of text in each item, even
// when the items use different type sizes.
export default function Example() {
  return (
    <Flex align="baseline" gap="3">
      <Heading size="7">$1,284</Heading>
      <Text emphasis="medium">revenue this week</Text>
      <Text size="2" tone="success">
        +12%
      </Text>
    </Flex>
  );
}
```

### Inside a line of text

`display="inline-flex"` inside a sentence. The icon and its words stay together and flow with the text around them.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Flex, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

// `display="inline-flex"` lets the Flex sit inside a line of text, so an
// icon and its words can flow with a sentence.
export default function Example() {
  return (
    <Text>
      The report runs every Monday at{" "}
      <Flex display="inline-flex" align="center" gap="1" render={<span />}>
        <HugeiconsIcon icon={Clock01Icon} strokeWidth={iconStroke} size="1em" aria-hidden />
        09:00 IST
      </Flex>
      , and Shruti Bhatia gets a copy.
    </Text>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. |
| `container?` | `boolean` | Make this Box measurable. |
| `display?` | `"flex" \| "inline-flex"` | Set `inline-flex` to place the flex container in a line of text. |
| `render?` | `RenderElement` | Renders the box as a different element, so you don't add a wrapper. |

It also takes every prop of a `<div>`.
