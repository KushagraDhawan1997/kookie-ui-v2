# Depth

The `depth` setting decides whether your app has a light source, and so whether anything in it
casts a shadow. You set it once on the `Theme`. No component accepts a shadow prop, and each kind
of component already knows whether it casts one.

## Set depth once, at the root

```tsx
<Theme depth="elevated">
  <App />
</Theme>
```

`depth` accepts two values. `elevated` is the default: cards sit above the page, loud buttons
catch light, and handles lift off their tracks. `flat` removes the light source, so cards and
panels separate from the page with a thin line instead of a shadow.

Depth belongs to the Theme because light is a property of the whole environment rather than of
one object. A raised card beside a flat one suggests two different light sources, which is why
there is no `shadow`, `elevation` or `raised` prop. This is a judgment.

To remove the light from one region, nest a Theme with `depth="flat"` around it:
```tsx
import { Button, Grid, Slider, Stack, Text, Theme } from "@kushagradhawan/kookie-ui-react";

// The same controls in an elevated region and in a flat one. In the flat region the loud button
// loses its shadow, while the slider handle keeps a small one.
function Panel({ label }: { label: string }) {
  return (
    <Stack gap="4">
      <Text size="3" weight="medium">
        {label}
      </Text>
      <Slider defaultValue={40} aria-label={`Volume, ${label}`} />
      <Button emphasis="loud">Save</Button>
    </Stack>
  );
}

export default function Example() {
  return (
    <Grid columns="repeat(auto-fit, minmax(12rem, 1fr))" gap="5" style={{ flexGrow: 1 }}>
      <Theme depth="elevated">
        <Panel label="Elevated" />
      </Theme>
      <Theme depth="flat">
        <Panel label="Flat" />
      </Theme>
    </Grid>
  );
}
```
## What casts a shadow

A shadow says that something sits above the page, so only a few kinds of element cast one:

- a `Card`, and a `Dialog` panel, which casts the same shadow as a card because the dimmed
  background already separates it from the page
- a loud `Button`
- a `Menu`, a `Select` list or a `Popover`, because it covers the content under it
- the handles and key caps listed below

In a flat app, a menu, a select list and a popover draw a thin line around their edge instead,
so you can still see where they end.

Everything else stays on the page. That includes `Surface`, `TextField`, `TextArea`, medium and
quiet buttons, checkboxes, `Progress`, `Separator` and the `Tabs` bar. A checked checkbox catches
light but casts no shadow, because it fills in place rather than lifting. To raise a form, place
it inside a `Card`. To rank buttons, use `emphasis` rather than depth.

A disabled `Card` loses its shadow, because it no longer sits above the page.

Glass is the exception in an elevated app. A control shows glass only when content passes
behind it, so a glass button, field or toolbar group casts a soft shadow. A control inside a glass card casts nothing,
because the card is the part that floats.

## Handles and keys cast a shadow in every app

Four elements cast a small shadow even when `depth` is `flat`:

- the handle of a `Slider`
- the thumb of a `Switch`
- the selected segment of a `SegmentedControl`
- a `Kbd` key cap

A handle has to look as if it sits above its track, because its position is the value you set.
A flat handle can look like a mark painted on the track, and flat controls give weaker cues that
you can act on them. A key cap is raised on a physical keyboard, so a `Kbd` is raised too.

These shadows are smaller than a card's, because a small element with a large shadow looks
swollen. This is a judgment. On glass, a handle goes flat, because the glass already shows that
it is a separate layer.

## Shadow values

The theme defines five shadow values: `--shadow-1` is a recess, and `--shadow-2` through
`--shadow-5` are drops of increasing reach. A larger element casts a longer shadow, so a card
casts further than a menu. This is a judgment.

Components choose these values through the theme, so you never pick one for a component. For
your own element, use `style`:

```tsx
<Box style={{ boxShadow: "var(--shadow-3)" }}>Custom panel</Box>
```
