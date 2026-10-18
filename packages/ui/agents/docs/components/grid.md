# Grid

Grid lines its children up in rows and columns at the same time.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Grid columns="repeat(3, minmax(0, 1fr))" gap="4">
  …
</Grid>
```

## Overview

Use a Grid when children must line up in two directions, such as a set of cards or a form with two columns. For a single row, use `Flex`. For a single column with even spacing, use `Stack`.

Grid is a `Box` with `display: grid`, so it accepts the Box props plus `columns`, `rows`, `areas`, `flow`, `gap`, `gapX` and `gapY`. It has no `direction` or `wrap` props, because a grid ignores them, and TypeScript reports an error if you set them.

`columns`, `rows` and `areas` accept CSS template values as strings, such as `repeat(3, minmax(0, 1fr))`. The gap props accept steps on the spacing scale, and the theme's density decides how large each step is. Place a child in a named area or across several columns with `gridArea` on a `Box`.

Most props accept either one value or a value for each breakpoint: `{ initial, sm, md, lg }`. The breakpoints measure the nearest `Box` with `container`, or the whole app when there is none, so the same grid adapts to a narrow panel and to a wide page.

A Grid has no keyboard or screen-reader behaviour of its own. The order of the children in your code is the reading order and the tab order, so keep it the same as the order on screen when you move children with `areas` or `gridArea`.

## Not supported

- Shortcut props for auto-placement — Grid adds props only where they connect to the spacing scale, the breakpoints or a type check. For any other layout, write the CSS template in `columns`, such as `repeat(auto-fill, minmax(12rem, 1fr))`.

## Examples

```tsx
import { Button, Grid } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  columns = "repeat(3, minmax(0, 1fr))",
  gap = "3",
}: {
  columns?: string;
  gap?: string;
}) {
  return (
    <Grid columns={columns} gap={gap}>
      <Button size="1">A</Button>
      <Button size="1">B</Button>
      <Button size="1">C</Button>
    </Grid>
  );
}
```

### Responsive columns

`columns` with a value for each breakpoint. The grid shows one column in a narrow container, two from `sm` and three from `md`.

```tsx
import { Card, Grid, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const projects = [
  { name: "Billing service", meta: "Deployed 2 hours ago" },
  { name: "Marketing site", meta: "Deployed yesterday" },
  { name: "Mobile API", meta: "Build failed" },
  { name: "Design tokens", meta: "Deployed 3 days ago" },
  { name: "Docs", meta: "Deployed last week" },
  { name: "Status page", meta: "No deploys yet" },
];

// One column on a narrow container, two from `sm`, three from `md`.
// The tiers follow the width of the nearest container, not the window.
export default function Example() {
  return (
    <Grid
      gap="4"
      columns={{
        initial: "minmax(0, 1fr)",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
      }}
    >
      {projects.map((project) => (
        <Card key={project.name}>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              {project.name}
            </Heading>
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

### Named areas

Regions named once with `areas`, and each child placed with `gridArea`. Use this for a page layout with a header, a navigation column and a main area.

```tsx
import { Box, Button, Card, Grid, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Name the regions once with `areas`, then place each child with `gridArea`.
// The source order stays the reading order, whatever the layout draws.
export default function Example() {
  return (
    <Grid gap="4" columns="12rem minmax(0, 1fr)" areas={`"header header" "nav main"`}>
      <Box gridArea="header">
        <Heading size="6" render={<h2 />}>
          Workspace settings
        </Heading>
      </Box>
      <Box gridArea="nav">
        <Stack gap="1" align="flex-start">
          <Button emphasis="quiet">General</Button>
          <Button emphasis="quiet">Members</Button>
          <Button emphasis="quiet">Billing</Button>
        </Stack>
      </Box>
      <Box gridArea="main">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              General
            </Heading>
            <Text size="3" emphasis="medium">
              The name and the address of this workspace.
            </Text>
          </Stack>
        </Card>
      </Box>
    </Grid>
  );
}
```

### Spanning columns

Children with `gridArea="auto / span 2"`, which makes them two columns wide. A bare `span 2` sets the number of rows, not columns.

```tsx
import { Box, Card, Grid, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A child spans more than one track with `gridArea`. Write `auto / span 2`:
// a bare `span 2` sets the row span, not the column span.
export default function Example() {
  return (
    <Grid gap="4" columns="repeat(3, minmax(0, 1fr))">
      <Box gridArea="auto / span 2">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              Monthly revenue
            </Heading>
            <Text size="3" emphasis="medium">
              Up 12% on last month.
            </Text>
          </Stack>
        </Card>
      </Box>
      <Card>
        <Stack gap="1">
          <Heading size="4" render={<h3 />}>
            Seats
          </Heading>
          <Text size="3" emphasis="medium">
            18 of 25 in use.
          </Text>
        </Stack>
      </Card>
      <Card>
        <Stack gap="1">
          <Heading size="4" render={<h3 />}>
            Invoices
          </Heading>
          <Text size="3" emphasis="medium">
            2 unpaid.
          </Text>
        </Stack>
      </Card>
      <Box gridArea="auto / span 2">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              Storage
            </Heading>
            <Text size="3" emphasis="medium">
              42 of 100 gigabytes used.
            </Text>
          </Stack>
        </Card>
      </Box>
    </Grid>
  );
}
```

### Row and column gaps

`gapX` and `gapY` set the column gap and the row gap separately. The wider column gap keeps each term and its value reading as one line.

```tsx
import { Grid, Text } from "@kushagradhawan/kookie-ui-react";

const rows = [
  ["Plan", "Team"],
  ["Seats", "25"],
  ["Renews on", "1 March"],
  ["Billing contact", "Shruti Bhatia"],
];

// `gapX` and `gapY` set the column gap and the row gap separately.
// Here the columns sit further apart than the rows, so each pair reads as one line.
export default function Example() {
  return (
    <Grid columns="max-content minmax(0, 1fr)" gapX="6" gapY="2">
      {rows.map(([term, value]) => [
        <Text key={`${term}-term`} size="3" emphasis="medium">
          {term}
        </Text>,
        <Text key={`${term}-value`} size="3">
          {value}
        </Text>,
      ])}
    </Grid>
  );
}
```

### In a form

Short fields that belong together in two columns, with the address spanning both. In a narrow container the form changes to one column.

```tsx
import { Box, Button, Field, FieldLabel, Flex, Grid, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// Two columns for short fields that belong together. The address spans both,
// and the grid drops to one column when the container is narrow.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Grid gap="4" columns={{ initial: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }}>
        <Field>
          <FieldLabel>First name</FieldLabel>
          <TextField defaultValue="Shruti" />
        </Field>
        <Field>
          <FieldLabel>Last name</FieldLabel>
          <TextField defaultValue="Bhatia" />
        </Field>
        <Box gridArea={{ initial: "auto", sm: "auto / span 2" }}>
          <Field>
            <FieldLabel>Billing address</FieldLabel>
            <TextField placeholder="Street and number" />
          </Field>
        </Box>
        <Field>
          <FieldLabel>City</FieldLabel>
          <TextField />
        </Field>
        <Field>
          <FieldLabel>Postal code</FieldLabel>
          <TextField />
        </Field>
      </Grid>
      <Flex justify="flex-end">
        <Button emphasis="loud">Save address</Button>
      </Flex>
    </Stack>
  );
}
```

### In a container

A grid inside a narrow `Box` marked `container`. Breakpoints follow that box rather than the window, so the grid stays at one column even in a wide window.

```tsx
import { Box, Button, Grid, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const actions = ["New project", "Invite members", "Connect a repository", "Open billing"];

// Responsive values follow the nearest Box marked `container`. This panel is
// narrow, so the grid stays at one column even on a wide window.
export default function Example() {
  return (
    <Box container width="18rem">
      <Stack gap="3">
        <Text size="2" emphasis="medium">
          Quick actions
        </Text>
        <Grid gap="2" columns={{ initial: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}>
          {actions.map((action) => (
            <Button key={action}>{action}</Button>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Marks an area where the components sit over other content, such as a toolbar over a canvas or a panel over an image. |
| `container?` | `boolean` | Make this Box measurable. |
| `display?` | `"grid" \| "inline-grid"` | Set `inline-grid` to place the grid in a line of text. |
| `render?` | `RenderElement` | Renders the box as a different element, so you don't add a wrapper. |

It also takes every prop of a `<div>`.
