# Materials

The material setting controls whether the panels in your app are opaque or made of glass. You
set it once on the `Theme`, and it applies only where content actually passes behind a
component, such as a toolbar over a canvas or a menu over the page.

*Figure.* A museum app showing a painting. The toolbar floats over the painting in glass, so the picture stays visible behind it.

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
because it paints over the page rather than inside the card.

## Glass on a component of your own

`useSurface` gives an element you write what a `Card` or a `Button` takes from the system: the
theme's material where it sits over content, a fill for its `tone` and `emphasis`, and text that
reads on that fill. You state `size`, `tone`, `emphasis` and `backdrop`, and nothing else. It
takes no colour, corner or shadow, so the element stays part of the system.
```tsx
"use client";

import { Box, Flex, Stack, Text, Theme, useSurface, type Tone } from "@kushagradhawan/kookie-ui-react";

// A calendar event of your own. `useSurface` gives the element the system's fill for its tone,
// text that reads on that fill, and the theme's glass where it sits over a picture. Its props
// go on any element: a `Box` here, or a plain `div`.
function CalendarEvent({ title, time, tone, loud }: { title: string; time: string; tone: Tone; loud?: boolean }) {
  const surface = useSurface({ tone, emphasis: loud ? "loud" : "medium", backdrop: true, size: "1" });
  return (
    <Box {...surface.props}>
      {surface.scope(
        <Stack gap="1">
          <Text size="2" weight="medium">
            {title}
          </Text>
          <Text size="2" emphasis="medium">
            {time}
          </Text>
        </Stack>,
      )}
    </Box>
  );
}

export default function Example() {
  return (
    <Theme material="3">
      <Box
        p="4"
        render={<section aria-label="Today's events" />}
        style={{ minWidth: "18rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
      >
        <Stack gap="2">
          <CalendarEvent title="Design review" time="9:30 to 10:15" tone="accent" loud />
          <Flex gap="2">
            <Box flexGrow="1" flexBasis="0">
              <CalendarEvent title="Lunch with Ana" time="12:30 to 13:30" tone="neutral" />
            </Box>
            <Box flexGrow="1" flexBasis="0">
              <CalendarEvent title="Flight to Valencia" time="18:40" tone="info" />
            </Box>
          </Flex>
        </Stack>
      </Box>
    </Theme>
  );
}
```
Spread `props` on your element, and wrap its children in `scope`, so a control inside your
glass does not ask for glass a second time. The element's layout stays yours: pass your own
`className` to the hook.

```tsx
function Today({ children }: { children: React.ReactNode }) {
  const surface = useSurface({ tone: "accent", emphasis: "loud", backdrop: true });
  return <span {...surface.props}>{surface.scope(children)}</span>;
}
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
