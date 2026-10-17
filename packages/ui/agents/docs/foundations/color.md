# Colour

You tell a component what a colour means, and the theme works out the value. That value
changes with light and dark mode, with the contrast setting, and with the surface underneath,
so you never write a hex value and never have to remember a palette.

## Name the meaning, and let the theme choose the colour

```tsx
// Wrong: a fixed value.
<Text style={{ color: "#E5484D" }}>Payment failed</Text>

// Right: a meaning.
<Text tone="destructive">Payment failed</Text>
```

A hex value stays the same in dark mode, ignores the high-contrast setting and survives a change
of brand colour. `tone="destructive"` avoids all three problems, because the theme produces the
value for the current mode and setting.

There's no `color` or `variant` prop. If you must set a colour yourself, use `style`, where it
stays easy to spot in a review.

## The ten colour families

The theme generates each family from a short recipe, usually a hue and a saturation. Every
family shares one lightness scale of twelve steps, so step 3 of red and step 3 of blue have the
same lightness. The strong fills, steps 9 and 10, move with the hue, so a yellow fill stays
yellow and does not turn olive.

| tone | what it is for |
|---|---|
| `neutral` | Text, hairlines, backgrounds and anything that has no meaning of its own. This is most of an interface. |
| `accent` | Your brand, used at full strength once on each screen. In the default theme the accent is grey, so a loud accent button is near-black in light mode and near-white in dark mode. |
| `blue` `green` `orange` `amber` | Colour as data: a chart series, a project label or a category, where the colour itself is the information. |
| `destructive` | An action that removes something, and the error state. |
| `success` `warning` `info` | Status: something worked, something needs attention, or the text adds context. |
*Figure, in light and dark.* Read a column top to bottom: every family is equally light at the same step, so swapping a tone never changes how loud something looks. Dark is not light inverted — each step is redesigned for a dark background.
`success` and `green` look the same today, but they are two separate families, so you can move
`success` towards teal and the green in your charts stays where it is. `warning` and `amber`,
and `info` and `blue`, work the same way. Use a meaning name when the item carries a meaning,
such as an error. Use a category name when it only marks a category.

## Components use named roles

The twelve-step scale is public, but components don't use step numbers. They use named roles,
which is why every value moves together when you change a family.

```css
--accent-soft / -soft-hover / -soft-active      /* tinted fills */
--accent-solid / -solid-hover / -solid-active   /* strong fills */
--accent-border
--accent-text                                   /* links and text on a tint */
--accent-contrast                               /* readable text on a strong fill */
--accent-ink / -ink-muted / -ink-faint          /* the three text colours */
--accent-glyph                                  /* icons and small marks */
--accent-a1 … --accent-a12                      /* semi-transparent steps */
```

Every family has the same roles, so `--destructive-solid` and `--success-ink` both exist.

When you give a component a tone, its tinted fills and borders stay grey, and the family shows in
the text and in strong fills. A tinted fill is almost transparent, so its colour tells you very
little. This is a judgment. The accent's quieter text colours are grey too, because a faint wash
of a brand colour no longer reads as that brand.

Icons use `--{tone}-glyph`, which keeps the family's full saturation at a lightness that a small
mark needs. A text colour loses saturation to reach its reading contrast, so a blue icon in the
text colour looks like a dull navy.

## The three text colours

On text, `emphasis` picks one of three colours: loud (`--color-text`, the default), medium
(`--color-text-muted`) and quiet (`--color-text-faint`). When you add a `tone`, the same three
levels come from that family instead.

```tsx
<Card size="3">
  <Stack gap="3">
    <Flex gap="2" align="center" justify="space-between">
      <Heading size="6">Invoice 4021</Heading>
      <Text size="2" tone="destructive" weight="medium">Payment failed</Text>
    </Flex>
    <Text size="3">Your card was declined on 3 August.</Text>
    <Text size="3" emphasis="medium">We will try again on 10 August.</Text>
    <Flex gap="3">
      <Button emphasis="loud">Update card</Button>
      <Button emphasis="quiet" bordered>Contact support</Button>
    </Flex>
  </Stack>
</Card>
```

The theme calculates medium and quiet against an APCA contrast target, separately for each family
and each mode:

- **Loud:** the family's own text colour, with no target. It is well above every minimum.
- **Medium:** Lc 60. APCA sets Lc 60 as the minimum for short text that is not a paragraph, such
  as a label, a timestamp or a placeholder. It is below APCA's level for body text, so don't use
  it for a paragraph.
- **Quiet:** Lc 30. WCAG does not require contrast for a control that is switched off, and APCA
  sets Lc 30 as the lowest level for disabled text. Use it only for something you can't use,
  such as a menu option that you can't choose.

If some text matters less, keep it loud at a smaller size, or make it medium.
*Figure, in light and dark.* The three levels reach the same contrast in every family. Look at accent: its medium and quiet go grey, because a faded brand colour stops looking like the brand. The meanings stay coloured, because a faded red still reads as danger.
## High contrast

High contrast is a theme setting, not a prop on each component. The theme follows the operating
system, so a person who asks their system for more contrast gets it without any work from you.
To force it, see [Appearance](/foundations/appearance).

At the normal setting, the colour of a resting border or fill is a judgment. It is lighter than
the 3:1 that WCAG 2.2 Success Criterion 1.4.11 asks for when an edge is the only sign that a
control is there. So give every control a visible label or a fill that shows where it is. Under
high contrast, borders and fills get stronger, up to the APCA targets the theme checks. Text, the
focus ring and the error border meet their APCA targets at every setting.

## The three background colours

Three named backgrounds sit under everything else. From the bottom up:

```css
--color-page      /* your app's background */
--color-ground    /* a region that holds objects, such as a sidebar */
--color-surface   /* the opaque fill of an object, such as a card */
```
*Figure, in light and dark.* In light, a card and the page are the same white, so the card's shadow is what separates them — only the ground is a different colour. In dark, all three step apart: page darkest, cards lightest.
The library doesn't paint the page background, because every nested `Theme` would paint over it
again. Paint it yourself with `--color-page`. A `Surface` uses `--color-ground`, and a `Card`
uses `--color-surface`.

- **Light mode:** the page and a card are the same white, so a card is set apart only by its
  shadow, or by its hairline in a flat theme. This is why `depth` matters more in light mode.
- **Dark mode:** the page is darkest, a ground is slightly lighter, and a card is lightest.

## Change the accent colour

The accent comes from two numbers in `packages/ui/src/tokens/color-config.ts`, not from a prop:

```ts
// A violet brand.
const accent = { hue: 265, vividness: 1 } as const;
```

`hue` is an angle on the OKLCH colour wheel, from 0 to 360. `vividness` runs from 0 to 1, and
below 0.18 the accent reads as grey. From these two numbers the generator calculates every fill,
border and text colour in both modes and both contrast settings.

The accent is part of the generated stylesheet, so an app has one accent. To change it, edit the
config, run the generator, and build the package from source:

```bash
pnpm --filter @kushagradhawan/kookie-ui-react run tokens
```
