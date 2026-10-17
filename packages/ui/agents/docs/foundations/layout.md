# Layout

In KookieUI, the space between two things is set by the container that holds them, not by the
things themselves. Four layout components place content on the screen, one spacing scale supplies
the distances, and one theme setting, `density`, tightens or loosens that scale for your whole
app.

## Put spacing on the container

Use `gap` on a container to set the distance between the items inside it. No control accepts a
margin prop, so `<Button mt="4">` doesn't compile.

People see things that sit close together as one group. This is the Gestalt law of proximity
(Wertheimer, 1923), a measured effect. So a distance is a fact about the group, and the group's
container sets it. A button can't know what comes after it, so a margin built into it would only
be a guess. The [Composition](/start/composition) chapter shows how to choose the gaps.

When you need a one-off distance, wrap the component in a `Box`. The wrapper is visible in your
file, whereas a margin hidden inside a control is not.

```tsx
// The distance between the field and the button belongs to the Stack.
<Stack gap="4">
  <TextField placeholder="Project name" />
  <Button>Save</Button>
</Stack>

// A one-off distance goes on a wrapper you can see.
<Box mt="6">
  <Button>Save</Button>
</Box>
```

## Choose a layout component

`Box` accepts every layout prop: padding, margin, gap, size, position, overflow, and the flex and
grid props. `Flex`, `Grid` and `Stack` are each a `Box` with a preset `display` and a shorter list
of props. The shorter lists catch mistakes: `columns` on a `Flex` is a type error.

- **`Stack`** places items in a column, one below the next.
- **`Flex`** places items in a row or a column, with the direction and alignment you choose.
- **`Grid`** places items in rows and columns at the same time.
- **`Box`** accepts every prop, so use it when you need one the others leave out.

For a CSS property that has no prop, use `style`. It's applied last, so it wins.

```tsx
<Stack gap="5">
  <Flex align="center" justify="space-between" gap="3">
    <Heading size="6">Members</Heading>
    <Button>Invite</Button>
  </Flex>
  <Grid columns="repeat(2, 1fr)" gap="4">
    <Card size="2">
      <Text size="3">Shruti Bhatia</Text>
    </Card>
    <Card size="2">
      <Text size="3">Pending invitation</Text>
    </Card>
  </Grid>
</Stack>
```

## Spacing tokens and density

The raw scale runs from `--space-1` to `--space-12`. Its steps are close together at the small
end and grow much faster at the large end. You can see the difference between 8 and 12 pixels,
but not between 96 and 100, because the eye notices a change in size in proportion to the size.

The layout scale, `--layout-space-1` to `--layout-space-12`, sits on top of the raw scale and
changes with density. `gap`, the `p` and `m` props, and the padding inside a card all use it. So
`gap="4"` means step 4 at the current density, rather than a fixed 12 pixels.

```css
/* gap="4" and p="4" read the layout scale. */
--layout-space-4: var(--space-4); /* default density: 12 pixels */
--layout-space-4: var(--space-3); /* compact density: 8 pixels */
```

`density` is a `Theme` setting: `compact`, `default` or `comfortable`. Set it for the whole app,
or for one region with a nested `Theme`. Compact moves layout steps 2 to 8 down one step, and
comfortable moves steps 1 to 8 up one. Steps 9 to 12 stay the same, so the space around a page
doesn't shrink in a compact app. Density doesn't change text size.

Each density level is a hand-picked set of values, not a multiplier, so you can correct one value
without moving the rest. This is a judgment.

Controls use the raw scale for their own padding, because their insides already change with
density. You can also pass a CSS length, such as `gap="13px"`, and it stays visible in your file
as an exception to the scale.

## Responsive values

Any layout prop accepts one value for each container size, written as an object. `initial` is the
base value, and `sm`, `md` and `lg` apply once the container is at least 30rem, 48rem or 64rem
wide.

These sizes measure the nearest container you've marked, not the window. To mark a container, add
the `container` prop to a `Box`, `Flex`, `Stack` or `Grid`. The same `Grid` then works in a narrow
sidebar and in a wide main column:
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
A marked container can't size itself from its contents, so give it a width, or put it where the
layout already sets one. A marked box left to fit its contents comes out zero pixels wide, and a
development build warns you.

To choose the shape of your whole interface, such as a sidebar or bottom tabs, use
`useWindowClass()`. The [Responsiveness](/patterns/responsiveness) chapter explains when to use
each.

## Reach the edge of a card with bleed

A card has padding, so a picture that runs from edge to edge must cancel it. Use the value `bleed`
on any margin prop. It resolves to the negative of the padding of the nearest card, dialog or
other surface, and the card clips the picture to its corners.
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
`mt="bleed" mx="bleed"` pulls a box out to the top edge and both sides. Outside any surface,
`bleed` is zero. On a padding prop, `bleed` adds the surface's padding back, so content inside a
pulled box can line up with the rest of the card. `gap` doesn't accept `bleed`.
