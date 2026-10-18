# Text

Text sets body copy, labels and every other line that isn't a heading.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Text size="3" emphasis="medium">Supporting copy.</Text>
```

## Overview

Text shows body copy, labels and short lines of information. Use it for everything that isn't a heading, and use `Heading` for the title of a page, a section or a card. Inside a sentence, use `Code` for a value people type, `Kbd` for a key and `Link` for a link.

`size` runs from 1 to 9 and defaults to 3, the body size. Each step sets the font size, the line height and the letter spacing together, so the line height always suits the size. Use 3 for reading and 2 for labels and details, and keep size 1 off composed screens.

`weight` is `regular`, `medium` or `semibold`, and defaults to `regular`. There is no bold, so show importance with size and colour instead.

`emphasis` sets the colour of the text. `loud` is the default and has full contrast, `medium` is muted, and `quiet` is faint. Because quiet falls below the contrast needed for comfortable reading, keep it for short lines that matter little. `tone` adds a meaning, such as `success` or `destructive`, and the three emphasis levels then use that tone's colours.

Without a `tone`, Text takes its colour from the surface it sits on, so it stays readable in light mode, in dark mode and on a strong fill. It renders a `span` with no margin, and `render` turns it into another element, such as `render={<p />}` or a `label`. Density doesn't change text size, but a touch screen makes the reading sizes a little larger.

## Not supported

- A colour prop — Use `tone` to say what the text means, and the theme picks a colour that works in light and dark mode. For a one-off colour, set it in `style`.
- `margin` — Text never adds space around itself, even when `render` makes it a paragraph. Set the space between blocks with `gap` on a Stack.
- `bold` (700) — Semibold is the heaviest weight. Show what matters most with a larger size or a stronger emphasis instead.

## Examples

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Tone, TypeSize, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "3",
  weight = "regular",
  tone = "neutral",
}: {
  size?: TypeSize;
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="2">
      <Text size={size} weight={weight} tone={tone}>Loud rests at full contrast.</Text>
      <Text size={size} weight={weight} tone={tone} emphasis="medium">Medium is the muted role.</Text>
      <Text size={size} weight={weight} tone={tone} emphasis="quiet">Quiet is below body-copy contrast by design.</Text>
    </Stack>
  );
}
```

### Sizes

All nine steps of `size`. Steps 2 and 3 suit reading and labels, and the larger steps suit display text. Each step sets the font size, line height and letter spacing together.

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export default function Example() {
  return (
    <Stack gap="3">
      {sizes.map((size) => (
        <Text key={size} size={size}>
          Size {size}: Invoices
        </Text>
      ))}
    </Stack>
  );
}
```

### Weights

The three weights: `regular`, `medium` and `semibold`. Use `medium` for a label or a short title in a row, and a larger size when something needs more importance, because there is no bold.

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2">
      <Text size="4" weight="regular">
        Regular: your storage is almost full
      </Text>
      <Text size="4" weight="medium">
        Medium: your storage is almost full
      </Text>
      <Text size="4" weight="semibold">
        Semibold: your storage is almost full
      </Text>
    </Stack>
  );
}
```

### Emphasis

A title at `loud`, a supporting sentence at `medium` and a short, unimportant line at `quiet`. Don't use `quiet` for a sentence people need to read.

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="1" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Website redesign
      </Text>
      <Text size="3" emphasis="medium">
        Due Friday. Shruti Bhatia is reviewing the last three screens.
      </Text>
      <Text size="2" emphasis="quiet">
        Archived drafts are hidden
      </Text>
    </Stack>
  );
}
```

### Tones

`tone` gives text a meaning, such as `success`, `warning` or `destructive`, and emphasis still works inside a tone, as the last line shows. Use a tone for what it means, not as decoration.

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2">
      <Text size="3" tone="success">
        Payment received. Your invoice is paid.
      </Text>
      <Text size="3" tone="warning">
        Your card expires at the end of this month.
      </Text>
      <Text size="3" tone="destructive">
        The last deployment failed. Check the build log.
      </Text>
      <Text size="3" tone="destructive" emphasis="medium">
        Retried twice, 4 minutes ago.
      </Text>
    </Stack>
  );
}
```

### Paragraphs

`render={<p />}` makes each block of text a real paragraph. Text has no margin, so the paragraphs sit in a Stack that sets the space between them with `gap`.

```tsx
import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Text size="3" render={<p />}>
        Shared folders let everyone in your workspace see the same files. Changes appear for other
        members as soon as you save.
      </Text>
      <Text size="3" render={<p />}>
        You can move a file out of a shared folder at any time. It becomes private to you again.
      </Text>
    </Stack>
  );
}
```

### Inline elements

`Code` for a value to type, `Kbd` for a key to press and `Link` for a link, each inside a sentence. They take the size of the text around them.

```tsx
import { Code, Kbd, Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Text size="3" render={<p />}>
        Set <Code>DATABASE_URL</Code> in your environment before you run the migration.
      </Text>
      <Text size="3" render={<p />}>
        Press <Kbd>⌘K</Kbd> to search files, people and settings.
      </Text>
      <Text size="3" render={<p />}>
        Read the <Link href="#limits">rate limits</Link> before you move to production.
      </Text>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | The emphasis level of the text, which sets its colour. |
| `render?` | `RenderElement` | Renders the text as a different element, such as a `<p>` or a `<label>`. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The meaning of the text, which sets its colour family, such as `destructive`. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight: `regular`, `medium` or `semibold`. |

It also takes every prop of a `<span>`.
