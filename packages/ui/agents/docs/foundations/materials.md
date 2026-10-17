# Materials

The material setting controls whether the panels in your app are opaque or made of glass. You
set it once on the `Theme`, and it applies only where content actually passes behind a
component, such as a toolbar over a canvas or a menu over the page.

## Set one material for the whole app

```tsx
<Theme material="3">
  <App />
</Theme>
```

`material` is a scale from `"1"` to `"9"`. The default is `"9"`, which is solid and lets no
light through. Steps `"1"` to `"8"` are glass. `"1"` is clear, and each step lets less of the
content behind it show through. A menu keeps more tint than a card at every step, because it
holds rows of text.

No component accepts a `material` prop. To change the material for one part of your app, nest
a `<Theme material>` around that part, which is how every other Theme setting works as well.
```tsx
import { Box, Button, Flex, Stack, Theme } from "@kushagradhawan/kookie-ui-react";

const STEPS = ["2", "5", "9"] as const;

// The same toolbar over a picture at three material steps. Each step lets less of the picture
// through, and "9" is solid. The `backdrop` region marks where the picture passes behind.
export default function Example() {
  return (
    <Box
      p="4"
      render={<section aria-label="Material steps" />}
      style={{ minWidth: "18rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
    >
      <Stack gap="4">
        {STEPS.map((step) => (
          <Theme key={step} material={step}>
            <Box backdrop>
              <Flex gap="2" align="center" wrap="wrap">
                <Button emphasis="loud">Export</Button>
                <Button emphasis="medium">Step {step}</Button>
                <Button emphasis="quiet">Rotate</Button>
              </Flex>
            </Box>
          </Theme>
        ))}
      </Stack>
    </Box>
  );
}
```
## Mark where content passes behind

The Theme sets which material to use, while `backdrop` tells the system where to use it. Glass
costs rendering time even over a plain background, so a control in the ordinary page flow stays
solid unless you mark it.

Mark the region rather than each control. A `Box` with `backdrop` turns every control inside it
to glass, as in the example above. Set `backdrop={false}` on a `Box` inside the region to make a
smaller area plain again.

You can also set `backdrop` on a single component, such as a `Card`, a `Button`, a `TextField`,
a `Toolbar` or a `Shell` panel. `ShellContent` does not accept it, because nothing passes behind
the work area of the app frame.

A `Menu`, a `Select` list, a `Popover`, a `Dialog` and every other panel that opens over the page
always has content behind it, so it uses the theme's material without a prop.

## Glass doesn't stack

A component inside a glass panel does not become a second layer of glass. It paints its fill at
the panel's transparency and adds no glass effect of its own. A panel looks like glass because
it filters the content behind it. Inside another glass panel, that content is already filtered,
so a second filter adds cost and makes the inner panel look like a sticker.

A solid panel stops a marked region at its edge. You can still put glass inside a solid card
when something inside it moves behind a control, such as a map. Mark that place explicitly:

```tsx
<Card>
  <Box backdrop>
    {/* your own map canvas paints here */}
    <Button>Recenter</Button>
  </Box>
</Card>
```

A nested `<Theme>` also resets the region. A menu opened from a glass card is glass again,
because it paints over the page rather than inside the card. To give your own element the same
material, read it with `useMaterial`:

```tsx
const material = useMaterial({ backdrop: true });
return <div className="kui-surface" data-material={material} />;
```

## Glass keeps the component's colour

Glass makes the component's own fill translucent, so your `tone` and `emphasis` still apply. A
loud button on glass is a translucent version of its solid fill, a medium button is a soft tint,
and a quiet button has no fill.

In Chromium browsers, the edge of a glass panel also bends the content behind it, like the edge
of a thick lens. Other browsers show the translucent fill without the bend.

## When to use glass

Use glass for controls and panels that float over content:

- a toolbar over a canvas
- a panel over a hero image
- a header that content scrolls under

Keep the content itself solid. Don't mark a region that sits over a plain background, because
the glass has nothing to show there and still costs rendering time. A glass panel that moves
costs more than fixed chrome.

Three accessibility settings change the glass for you:

- **Reduced transparency:** Every glass panel becomes solid, in browsers that report the
  setting. Not every browser reports it.
- **Forced colours:** Every glass panel becomes solid.
- **Higher contrast:** Every step becomes more opaque, and the steps stay in the same order.
