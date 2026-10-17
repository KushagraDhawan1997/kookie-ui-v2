# Typography

All text in Kookie uses one scale of nine steps, from body copy and headings to button labels,
field values and code. You pick a step by number, and the theme decides the font size, line
height and letter spacing for it. Because the heaviest weight is semibold, you rank text with
size and colour rather than with bold.

## Text and Heading use the same steps

`Text` and `Heading` use the same nine steps in two different fonts. A step sets the font size,
the line height and the letter spacing together. Each step is chosen by hand, because no single
line-height ratio works at both ends of a scale that runs from 12 to 64 pixels.

`<Text size="6">` and `<Heading size="6">` are the same size and differ only in font and default
weight. Button labels use the same scale, which keeps a button and the text beside it in step.

## Size sets the step, render sets the element

How large a heading looks and where it sits in the document outline are separate questions, so
each one has its own prop:

```tsx
// The page title: an h1 in the outline, at the top of the scale
<Heading size="9" render={<h1 />}>Billing</Heading>

// A card title: an h3 in the outline, three steps down
<Heading size="6" render={<h3 />}>Payment method</Heading>
```

`Heading` renders an `<h2>` at size 6 unless you say otherwise. `Text` renders a `<span>` at
size 3. Write `render={<p />}` when you want a paragraph.

There is no `level` or `as` prop that sets both at once, because one prop would force you to
choose between the correct outline for a screen reader and the correct size for the design.

## The heaviest weight is semibold

The `weight` prop accepts `regular`, `medium` and `semibold`. A bold `weight` is a type error,
and there is no bold token. The system already ranks text with size and with three text colours,
and in our judgment a third way spreads until everything on a screen is bold. If you need a bold
face for one case, set it with `style`.
```tsx
import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Flex, Grid, Heading, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Same size, heavier weight, so the two lines compete.">
        <Stack gap="2">
          <Heading size="6" weight="semibold">Notifications</Heading>
          <Text size="6" weight="medium">Choose what reaches you</Text>
        </Stack>
      </Verdict>
      <Verdict ok why="A smaller step and a quieter colour, so the title leads.">
        <Stack gap="2">
          <Heading size="6">Notifications</Heading>
          <Text size="3" emphasis="medium">Choose what reaches you</Text>
        </Stack>
      </Verdict>
    </Grid>
  );
}

// A large mark, then the thing being judged, then why.
function Verdict({ ok, why, children }: { ok: boolean; why: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text tone={ok ? "success" : "destructive"} render={<Flex />}>
        <HugeiconsIcon
          icon={ok ? Tick02Icon : Cancel01Icon}
          size={28}
          strokeWidth={iconStroke}
          aria-label={ok ? "Right" : "Wrong"}
        />
      </Text>
      {children}
      <Text size="2" emphasis="medium">
        {why}
      </Text>
    </Stack>
  );
}
```
On `Text` and `Heading`, `emphasis` picks the text colour: loud, medium or quiet. Text is loud
by default. The [Colour](/foundations/color#the-three-text-colours) chapter gives the contrast
of each level.

## Three font tokens

Components read their font from `--font-body`, `--font-heading` or `--font-mono`. By default,
the body font is the system interface font, and the heading font follows it. To use your own
fonts, set these tokens on `:root` in your stylesheet.

- **Body font:** `Text`, `Blockquote`, `Link`, `Kbd`, button labels and field values
- **Heading font:** `Heading`
- **Mono font:** `Code` and `CodeBlock`

`Code` sets its text slightly smaller than the text around it, because a monospaced face looks
one step larger at the same size. `Kbd` uses the body font, because a monospaced font squeezes
symbols such as ⌘, and every platform shows shortcuts in its interface font.

## Text adapts to the input and the window

Two things change, for two different reasons:

- **Reading sizes grow with touch input:** When the primary input is a finger, steps 1 to 4 each
  move up one step, so body text goes from 16 to 18 pixels. A screen you touch is usually held
  closer than a screen you use with a mouse. Apple uses one text size table for iPhone and iPad.
- **Display sizes shrink in a narrow window:** When the window is 48rem wide or less, steps 8 and
  9 each move down one step, so a page title goes from 64 to 44 pixels. A 64-pixel title in a
  375-pixel window fits about ten characters on a line.

Each rule moves only its own steps, so the two never conflict when both apply. Because a step can
resolve to different sizes, don't build a layout on a pixel value you measured from one step.

## The five steps for a screen

These five steps are the house style. They are a judgment rather than a measurement:

- **Page title:** size 9. `Page` sets it for you.
- **Section title:** size 7
- **Card or block title:** size 6
- **Body text:** size 3
- **Labels and small print:** size 2

A `Dialog` sets its own title from the dialog's `size`, so it is size 5 at the default size.

Use steps 4, 5 and 8 only for cases these five do not cover, such as a large number. A
16-pixel title over a 14-pixel body is only 1.14 times the size. In our judgment, that is too
small a difference to read as a step.

Don't use size 1 on a composed screen. Twelve pixels is for text at the edge of a screen, such as
a legal line or a dense table. When something matters less, use the muted colour at size 2 or 3.

```tsx
<Stack gap="6">
  <Heading size="9" render={<h1 />}>Billing</Heading>

  <Stack gap="5">
    <Heading size="7" render={<h2 />}>Payment method</Heading>

    <Card size="3">
      <Stack gap="3">
        <Heading size="6" render={<h3 />}>Visa ending 4021</Heading>
        <Text size="3" render={<p />}>Renews on 3 September for 24 dollars.</Text>
        <Text size="2" emphasis="medium">Updated 3 August</Text>
      </Stack>
    </Card>
  </Stack>
</Stack>
```
