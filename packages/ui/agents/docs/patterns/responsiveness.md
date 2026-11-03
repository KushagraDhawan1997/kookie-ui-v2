# Responsiveness

A responsive interface adapts to two things: the space a component has, and the person using it.
It never asks which device it's on. A sidebar on a wide monitor and a phone held upright can have
the same width, and a touchscreen laptop can be used with a finger or a trackpad. So Kookie
measures the space with container queries and follows the pointer, and it never asks for a device
name.

How should this screen change when the room changes? Ask two questions, in this order. How the
person points is covered in [Pointer](/inputs/pointer) and [Touch](/inputs/touch).

## How much room does this component have?

Mark a box with `container`, and the responsive values inside it measure that box, not the
window. One `Flex` can then stack in a narrow drawer and sit in a row in a wide column, with no
extra code. Drag the corner of the box below to see it.
```tsx
import { Box, Button, Flex, Surface, TextField } from "@kushagradhawan/kookie-ui-react";

// Drag the corner of the box. The row inside follows the box's width, not the window's:
// below `sm` (30rem) the field and the button stack, from `sm` up they sit in one row.
export default function Example() {
  return (
    <Box
      container
      width="36rem"
      minWidth="14rem"
      maxWidth="100%"
      style={{ resize: "horizontal", overflow: "hidden" }}
    >
      <Surface>
        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Box flexGrow="1">
            <TextField placeholder="Search projects" aria-label="Search projects" />
          </Box>
          <Button>Filter</Button>
        </Flex>
      </Surface>
    </Box>
  );
}
```
Ask this question first, because most layout changes depend on the room inside one panel, not
on the window. Mark only a box that gets its width from the layout, such as a sidebar with a set
width, a column that grows or a grid cell. A marked box can't size itself around its contents.
The [Layout](/foundations/layout) page lists the three container sizes and their rules.

## Which shape should the app take?

A window class picks the shape of the app, once, at the top. `useWindowClass()` returns one of
three classes:

- **`narrow`:** A window up to and including 48rem wide.
- **`regular`:** A window wider than 48rem, up to and including 75rem.
- **`wide`:** A window wider than 75rem.

The names describe room, not hardware, so an app on half of a large display is `regular`.
`Shell` already uses the narrow boundary in CSS: its sidebar opens over the content and its rail
becomes a tab bar. A `Dialog` becomes a sheet against the bottom edge, and large headings get
smaller. What changes between `regular` and `wide` is your choice.

The hook returns `null` on the server and until after the first paint, because the server can't
measure the window. Use it only for decisions that can wait until the page has mounted.

```tsx
import { Button, ShellTrigger, useWindowClass } from "@kushagradhawan/kookie-ui-react";

function InspectorToggle() {
  const windowClass = useWindowClass();

  // Before the page mounts, the class is unknown. Show nothing rather than guess.
  if (windowClass !== "narrow") return null;

  return (
    <ShellTrigger target="inspector" render={<Button emphasis="quiet" />}>
      Details
    </ShellTrigger>
  );
}
```

For anything that must be correct on the first paint, use the media queries in
`windowClassQueries` in your stylesheet. At exactly 48rem or 75rem, two of these queries both
match. To split a layout in two, write `not` before the `narrow` query instead of using
`regular`.
