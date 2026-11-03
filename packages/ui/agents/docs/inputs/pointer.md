# Pointer

Kookie follows the input a person mainly uses, not the device they hold. A touchscreen laptop
with a trackpad and a phone with a finger get different targets, even at the same window width.

## Follow the main pointer

The `pointer` setting on a `Theme` is `auto` by default, which asks the browser for the main
input: `fine` for a mouse or trackpad, `coarse` for a finger. The answer stays the same while
someone uses the device, so a touchscreen laptop reports `fine` even when a person taps the
screen. Set `pointer="coarse"` yourself if your audience taps laptops often.
```tsx
import { Button, Flex, Grid, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const POINTERS = ["fine", "coarse"] as const;

// The same code under each pointer. Only the measurements change: control height, padding,
// icon size and body text. The gap between the two controls stays the same.
export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="6">
      {POINTERS.map((pointer) => (
        <Theme key={pointer} pointer={pointer}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              pointer="{pointer}"
            </Text>
            <Flex gap="2">
              <TextField placeholder="Email" aria-label={`Email, ${pointer} pointer`} />
              <Button>Invite</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Grid>
  );
}
```
Under `coarse`, controls, icons and body text get larger, and [Touch](/inputs/touch) lists what
changes.

## Hover only where the pointer can hover

Hover styles apply only when the main pointer can hover, through the `(hover: hover)` media query.
On a touch screen a tap leaves a hover behind until the next tap, so without the query a button
you tapped would stay in its hover colour. Press styles always apply.

## Keep the cursor honest

A disabled control shows the ordinary arrow, not `not-allowed`, because native platforms don't
use that cursor on a disabled control. A `loading` button shows a busy cursor, because it is still
the control you pressed.
