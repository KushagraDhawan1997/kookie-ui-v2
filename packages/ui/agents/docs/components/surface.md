# Surface

Surface is a quiet region of the page that holds other things, such as a group of cards.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Surface size="2">
  …
</Surface>
```

## Overview

A Surface is a region of the page that other things sit on. Where a Card is an object, a Surface is the area that holds objects. It has a fill that is slightly different from the page, a thin border and a rounded corner, and it casts no shadow.

Use a Surface for a bounded area that holds several cards, such as a board or a gallery. You can also use one inside a card for a quieter region, such as a code sample, a key or a group of settings. For a single thing that people read, open or press, use a Card.

The fill has one fixed value for light mode and one for dark mode. In dark mode the fill is very close to the page, so the border does most of the work of showing where the region is.

`size` sets the padding and the corner, and matches a Card at the same size. When a Surface sits inside a Card or another Surface, its corner shrinks automatically so it follows the outer corner. The Surface clips its content to that corner, and a child can reach the edge with `m="bleed"`.

A Surface is always opaque, so a card placed on it is solid even inside a `backdrop` region. A child that sets its own `backdrop` still uses the theme's material. A Surface has no keyboard behaviour of its own, and `render` lets you choose its element, such as a `<section>`.

## Use instead

- `Card` when one object needs to stand apart, such as a project or a plan.

## Not supported

- A fill or an edge prop — With a choice of fill and border, a Surface could be made to look like a Card, and you would have two ways to build the same thing. The fill and the border are fixed.
- A border toggle — A Surface with a border and one without would mean the same thing, and in dark mode the border is most of what makes the region visible at all.
- `material` and `backdrop` — Glass is for something that sits over other content, and a Surface is part of the page rather than over it. A child that sets `backdrop` still uses the theme's material.
- Tone, emphasis and a shadow — A Surface is a container, so it has no rank among its neighbours, and because it is part of the page rather than raised above it, it casts no shadow.

## Examples

```tsx
import { Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "3" }: { size?: Size }) {
  return (
    <Surface size={size} style={{ minWidth: "18rem" }}>
      <Stack gap="2">
        <Text size="3" weight="medium">
          A ground
        </Text>
        <Text size="2" emphasis="medium">
          What an object sits on. A recessed region, one step under the page, bounded by its own
          hairline.
        </Text>
      </Stack>
    </Surface>
  );
}
```

### Sizes

The four sizes. `size` sets the padding and the corner, with the same values a Card uses at that size, so use a larger size for a larger region.

```tsx
import { Flex, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap" align="flex-start">
      {sizes.map((size) => (
        <Surface key={size} size={size}>
          <Text size="2">Size {size}</Text>
        </Surface>
      ))}
    </Flex>
  );
}
```

### Holding cards

A Surface groups several cards into one region. The cards keep their own fill, border and shadow, while the Surface stays flat behind them.

```tsx
import { Card, Grid, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const projects = [
  ["Website redesign", "Due Friday"],
  ["Q4 campaign", "In review"],
  ["Mobile onboarding", "Blocked"],
] as const;

export default function Example() {
  return (
    <Surface size="3" style={{ maxWidth: "40rem" }}>
      <Grid columns="repeat(auto-fill, minmax(10rem, 1fr))" gap="3">
        {projects.map(([name, status]) => (
          <Card key={name} size="2">
            <Stack gap="1">
              <Text size="3" weight="medium">
                {name}
              </Text>
              <Text size="2" emphasis="medium">
                {status}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Surface>
  );
}
```

### In a card

A small Surface inside a Card sets apart a quieter region, here an API key. Its corner fits inside the card's corner automatically.

```tsx
import { Button, Card, Code, Flex, Heading, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        <Stack gap="1">
          <Heading size="6">API key</Heading>
          <Text size="2" emphasis="medium">
            Use this key to call the API from your server.
          </Text>
        </Stack>
        <Surface size="1">
          <Code>sk_live_4f9a…c21e</Code>
        </Surface>
        <Flex justify="flex-end" gap="2">
          <Button>Revoke</Button>
          <Button emphasis="loud">Copy key</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```

### As a layout

With `render={<Stack />}`, the Surface is also the column layout, so one element gives you both the fill and the stacking with no wrapper.

```tsx
import { Flex, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Surface size="2" render={<Stack gap="3" />}>
      <Text size="3" weight="medium">
        Storage
      </Text>
      <Flex justify="space-between" gap="4">
        <Text size="2" emphasis="medium">
          Files
        </Text>
        <Text size="2">18.4 GB</Text>
      </Flex>
      <Flex justify="space-between" gap="4">
        <Text size="2" emphasis="medium">
          Backups
        </Text>
        <Text size="2">6.1 GB</Text>
      </Flex>
    </Surface>
  );
}
```

### Bleed to the edge

Setting `mx="bleed"` on the Box around the Separator lets it run from edge to edge. Use `mx` for the sides only, or `m` for all four edges.

```tsx
import { Box, Separator, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Surface size="2" style={{ maxWidth: "24rem" }}>
      <Stack gap="3">
        <Text size="3" weight="medium">
          Release notes
        </Text>
        <Box mx="bleed">
          <Separator />
        </Box>
        <Text size="2" emphasis="medium">
          Version 4.2 adds shared folders and faster search.
        </Text>
      </Stack>
    </Surface>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `render?` | `RenderElement` | Renders the surface as a different element, such as a `<section>`, an `<aside>` or a layout component. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the surface, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.
