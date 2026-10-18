# Blockquote

Blockquote sets a quoted passage apart from the text around it with a line and an indent.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Blockquote>Taste is the last layer.</Blockquote>
```

## Overview

A blockquote sets a passage of text apart with a thin line down its leading edge and an indent that keeps the words clear of the line.

Use a blockquote for a quoted passage, such as a customer quote in an article or an excerpt from a document. Use a `Notice` when a coloured bar must carry a meaning, such as a warning, and use a `Card` when the content needs a boundary.

The text works like `Text`. `size` is a step on the type scale and defaults to 3, `weight` defaults to regular, and `emphasis` defaults to `loud`, because a quote is text that people read.

`tone` colours the words and leaves the line grey. The line always has the same colour as a `Separator`, in light and dark mode.

A blockquote adds no margin of its own, so the layout around it sets the space. To credit the source, put the name in a sibling `Text`, use `render` to make the layout a `<figure>` and the name a `<figcaption>`, and pass the source address as `cite`.

## Not supported

- A coloured line — A tone colours the words and leaves the line grey, so a blockquote never looks like a warning. If a condition needs a coloured bar, use a Notice.
- An attribution slot — An attribution needs no special behaviour, so a sibling `Text` does the same job. It also lets you choose the size and colour of the name.

## Examples

```tsx
import { Blockquote, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Emphasis, Tone, TypeSize } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "3",
  emphasis = "loud",
  tone = "neutral",
}: {
  size?: TypeSize;
  emphasis?: Emphasis;
  tone?: Tone;
}) {
  return (
    <Stack gap="3">
      <Blockquote size={size} emphasis={emphasis} tone={tone}>
        Taste is the last layer. If the infrastructure is right, taste can be added later.
      </Blockquote>
      <Text size="1" emphasis="medium">— the standing rule</Text>
    </Stack>
  );
}
```

### Sizes

`size` is a step on the type scale, as on Text, and the default is 3. The indent grows with the text, so the words stay clear of the line at every size.

```tsx
import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

const sizes = ["2", "3", "4", "5"] as const;

// `size` is a step on the type scale, as on Text. It defaults to 3. The indent grows with the
// text, so the words stay clear of the rule at every size.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      {sizes.map((size) => (
        <Blockquote key={size} size={size}>
          Ship the smallest change that answers the question, then look at it before you add more.
        </Blockquote>
      ))}
    </Stack>
  );
}
```

### Emphasis

`emphasis` sets the colour of the text. A quote is `loud` by default, and `medium` suits a quote that supports the text around it rather than leading it.

```tsx
import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour. A quote rests at `loud`, like all body text. Use `medium`
// for a quote that supports the text around it. Keep `quiet` for text people can skip.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Blockquote emphasis="loud">
        We moved every project to the Team plan in one afternoon.
      </Blockquote>
      <Blockquote emphasis="medium">
        We moved every project to the Team plan in one afternoon.
      </Blockquote>
    </Stack>
  );
}
```

### Tones

`tone` colours the words and leaves the line grey. When a coloured bar must carry the meaning, such as a warning, use a Notice instead.

```tsx
import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

// `tone` colours the words and leaves the rule neutral. When the coloured bar must carry the
// meaning, such as a warning, use a Notice instead.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Blockquote tone="accent">
        Invite your team before you set up billing, so every seat is counted once.
      </Blockquote>
      <Blockquote tone="destructive">
        Deleting a workspace also deletes its audit log.
      </Blockquote>
    </Stack>
  );
}
```

### With an attribution

Put the name in a sibling Text. Use `render` to make the surrounding Stack a `<figure>` and the name a `<figcaption>`, and pass the source address as `cite`.

```tsx
import { Blockquote, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Blockquote has no attribution slot. Put the name in a sibling Text, and use `render` to make
// the stack a `<figure>` and the name a `<figcaption>`. Pass the source address as `cite`.
export default function Example() {
  return (
    <Stack gap="3" render={<figure />} style={{ maxWidth: "32rem" }}>
      <Blockquote cite="https://example.com/customers/northwind">
        Setup took an afternoon. Our designers and engineers now review the same screens.
      </Blockquote>
      <Text size="2" emphasis="medium" render={<figcaption />}>
        Shruti Bhatia, Head of Design at Northwind
      </Text>
    </Stack>
  );
}
```

### In an article

In running text, the quote sits in the same column as the paragraphs. It adds no margin, so the `gap` of the surrounding Stack sets the space above and below it.

```tsx
import { Blockquote, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// In running text, the quote sits in the same column as the paragraphs. The layout around it
// sets the space above and below. Blockquote adds no margin of its own.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "34rem" }}>
      <Heading size="6">What changed in the release process</Heading>
      <Text>
        Every deploy now waits for one approval from the owning team. The check runs in the pull
        request, so nobody opens a second tool.
      </Text>
      <Blockquote>
        The approval step added two minutes to a deploy and removed most of our rollbacks.
      </Blockquote>
      <Text>
        The rule applies to production only. Preview environments still deploy on every push.
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
| `render?` | `RenderElement` | Renders the quote as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The colour family of the text, such as `destructive`. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight: `regular`, `medium` or `semibold`. |

It also takes every prop of a `<blockquote>`.
