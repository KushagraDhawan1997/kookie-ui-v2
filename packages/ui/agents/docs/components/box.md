# Box

Box is the basic layout component, and Flex, Stack and Grid are all built from it.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Box p="4" m="2">
  …
</Box>
```

## Overview

Box is the basic layout component. Flex, Stack and Grid are each a Box with a fixed `display` and a shorter list of props, so use one of those when you already know the layout. Use Box when the layout has to change `display` at a container size, or when you need one-off spacing around something.

Box props cover padding, margin, gap, width and height, position, and the props a flex or grid child needs. Spacing values are steps on the space scale rather than lengths, so spacing stays consistent across your app. Anything the props don't cover can go in `style`, which is applied last.

Controls never set the space around themselves, so Box is how you add it. To put space above a button, write `<Box mt="4"><Button /></Box>`.

Every prop takes either a single value or an object with a value for each container size: `initial`, `sm`, `md` and `lg`. The sizes follow the width of the nearest Box marked `container`, or the root Theme when there is none. Only mark a Box as a `container` when its width comes from the layout or from `width`, because a container can't size itself from its content. In a plain flex row it would collapse to zero width, and a development build warns you when that happens.

Three more props cover the edge cases. Setting a margin prop to `bleed`, as in `mx="bleed"`, cancels the padding of the surrounding Card or Surface so that a picture or a divider can reach its edge. `backdrop` marks a region where content shows behind the controls, so they use the theme's material. `render` applies the Box props to an element you choose, such as a `<section>`.

## Not supported

- Utility classes — Box passes its values to the stylesheet as inline custom properties, so the stylesheet stays the same size no matter which values your app uses.
- A separate bleed prop — Bleed is a value you give a margin prop, such as `m="bleed"` or `mx="bleed"`. Separate props would repeat every margin spelling a second time.
- Containment by default — A container can't take its width from its content, so it would collapse to zero in a flex row. Add `container` only on a Box whose width the layout already sets.

## Examples

```tsx
import { Box, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example({ p = "5" }: { p?: string }) {
  return (
    <Box p={p} style={{ background: "var(--color-track)", borderRadius: "var(--radius-surface-2)" }}>
      <Text size="2">A Box with token padding.</Text>
    </Box>
  );
}
```

### Padding steps

`p` sets the padding on all four sides, `px` and `py` set one axis, and `pt`, `pr`, `pb` and `pl` set one side each. Every value is a step on the space scale.

```tsx
import { Box, Grid, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const steps = ["2", "4", "6"] as const;

// `p` sets padding on all four sides. `px` sets the left and right, `py` sets the top and
// bottom, and `pt`, `pr`, `pb` and `pl` set one side. Every value is a step on the space scale.
export default function Example() {
  return (
    <Grid columns="repeat(3, minmax(0, 1fr))" gap="3" style={{ minWidth: "28rem" }}>
      {steps.map((step) => (
        <Surface key={step}>
          <Box p={step}>
            <Text size="2">Padding {step}</Text>
          </Box>
        </Surface>
      ))}
    </Grid>
  );
}
```

### Space around a control

A control never sets the space around itself. When one child needs more room than the gap gives it, as the button here does, wrap that child in a Box with a margin prop.

```tsx
import { Box, Button, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A control never sets the space around itself. When one child needs more room than the gap
// gives it, wrap that child in a Box with a margin prop.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "24rem" }}>
      <Text weight="medium">Export your data</Text>
      <Text emphasis="medium">
        We email a download link when the archive is ready. Large workspaces take up to an hour.
      </Text>
      <Box mt="4">
        <Button emphasis="medium">Request export</Button>
      </Box>
    </Stack>
  );
}
```

### Responsive values

Any Box prop can take an object with a value for each container size. Here the row is a column on a narrow container and becomes a row from `md` up.

```tsx
import { Box, Button, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Any Box prop takes an object with a value per container size: `initial`, `sm`, `md` and
// `lg`. Here the layout is a column on a narrow container and a row from `md` up.
export default function Example() {
  return (
    <Box
      display="flex"
      direction={{ initial: "column", md: "row" }}
      align={{ initial: "stretch", md: "center" }}
      justify="space-between"
      gap={{ initial: "3", md: "5" }}
      style={{ minWidth: "18rem" }}
    >
      <Stack gap="1">
        <Text weight="medium">Two-factor authentication</Text>
        <Text size="2" emphasis="medium">
          Ask for a code from your phone at every sign-in.
        </Text>
      </Stack>
      <Button emphasis="medium">Turn on</Button>
    </Box>
  );
}
```

### Measurable containers

Add `container` to a Box so that responsive values inside it follow its width instead of the window's. Each Box here has a set width, because a container can't size itself from its content.

```tsx
import { Box, Grid, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

// Add `container` to make a Box measurable. Responsive values inside it then follow the Box's
// width, not the window's. A container cannot size itself from its content, so give it a
// width, or put it where the layout sets one.
export default function Example() {
  return (
    <Stack gap="3">
      {[
        { width: "18rem", label: "An 18rem container" },
        { width: "36rem", label: "A 36rem container" },
      ].map(({ width, label }) => (
        <Box key={width} container width={width}>
          <Surface>
            <Grid columns={{ initial: "1fr", sm: "1fr 1fr" }} gap="3">
              <Text size="2" weight="medium">
                {label}
              </Text>
              <Text size="2" emphasis="medium">
                One column below sm, two from sm up.
              </Text>
            </Grid>
          </Surface>
        </Box>
      ))}
    </Stack>
  );
}
```

### Bleeding to the edge

Setting `mt` and `mx` to `bleed` cancels the card's padding at the top and sides, so the picture reaches the card's edges and the card clips it to its corners.

```tsx
import { Box, Card, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// The value `bleed` on a margin prop cancels the padding of the surrounding Card. Here the
// picture reaches the top and side edges, and the Card clips it to its corners.
export default function Example() {
  return (
    <Card style={{ maxWidth: "20rem" }}>
      <Stack gap="4">
        <Box mt="bleed" mx="bleed" height="10rem" render={<img src="/backdrop.jpg" alt="" />} style={{ objectFit: "cover" }} />
        <Stack gap="1">
          <Text weight="medium">Office move</Text>
          <Text size="2" emphasis="medium">
            Floor plans and seating for the new studio.
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
```

### A backdrop region

Use `backdrop` for a region where content shows behind the controls, such as a toolbar over a photo. Every control inside the region then uses the theme's material, so you set it once instead of on each button.

```tsx
import { Box, Button, Flex } from "@kushagradhawan/kookie-ui-react";

// `backdrop` marks a region where content passes behind the controls, such as a toolbar over a
// picture. Every control inside it then uses the theme's material. Set it once on the region.
export default function Example() {
  return (
    <Box
      p="4"
      render={<section aria-label="Photo editor" />}
      style={{ minWidth: "22rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
    >
      <Box backdrop>
        <Flex gap="2">
          <Button emphasis="medium">Crop</Button>
          <Button emphasis="medium">Adjust</Button>
          <Button emphasis="medium">Filters</Button>
        </Flex>
      </Box>
    </Box>
  );
}
```

### Choosing the element

Use `render` when the document needs a specific element, such as a `<section>` or a `<nav>`. The Box props apply to that element directly, with no extra wrapper.

```tsx
import { Box, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Use `render` to give a Box the element the document needs, such as a `<section>` or a
// `<nav>`. The Box props apply to that element, and no wrapper is added.
export default function Example() {
  return (
    <Box render={<section aria-labelledby="usage-title" />} p="2" style={{ maxWidth: "28rem" }}>
      <Stack gap="2">
        <Heading size="5" id="usage-title">
          Usage this month
        </Heading>
        <Text emphasis="medium">You have used 62% of the build minutes on your plan.</Text>
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
| `render?` | `RenderElement` | Renders the box as a different element, so you don't add a wrapper. |

It also takes every prop of a `<div>`.
