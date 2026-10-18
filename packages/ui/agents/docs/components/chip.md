# Chip

Chip shows a short word or a count that tells you the current state of the thing beside it.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Chip tone="success">Live</Chip>
```

## Overview

A chip shows a short word or a count that says what state the thing beside it is in, such as Running, Failed or Deployed. It has the same grey fill, corner and one-line height as `Code` and `Kbd`.

Use a chip for a status in a list, a table or next to a title. To show a dot or a count on an avatar or an icon, use a `Badge`. For something that people can press or remove, use a `Button`, and for a message about a condition, use a `Notice`.

`tone` sets the colour of the letters, and the box stays grey in every tone. Use `success` for a finished job, `destructive` for a failed one, `warning` for one that needs attention and `info` for one that is running. Use the same tone for the same word everywhere in your product.

`size` is optional. If you leave it unset, the chip matches the text size of the line it sits in, so a chip beside a large heading is larger than one in a table row. Set `size` only when the chip stands alone. `weight` and `emphasis` work as they do on `Text` and change only the letters.

Set `backdrop` when the chip sits over an image or other content that passes behind it, so the chip uses your Theme's material. On a plain background, it stays solid.

A chip is plain text, and a screen reader reads its word as part of the line. The colour adds meaning but cannot replace it, so write a word that makes sense on its own. A chip with no content, such as `{false}` or an empty string, renders nothing.

## Use instead

- `Badge` when the mark stays until the person looks, such as an unread count.

## Not supported

- A louder fill, or a `variant` prop — A chip's tone says what kind of state something is in, not how important it is, so every chip has the same strength. To make one item stand out, use its position on the screen or a Button's `emphasis`.
- A remove button — A chip that people can remove is a control, which needs focus, a keyboard model and an accessible name. Use a Button when people must act on the item.
- A count prop — A chip shows exactly what you give it. Format the number and choose a cut-off, such as 99+, in your app.
- A position of its own — A chip does not decide where it sits on the screen. Place it in a row, a table cell or a Box.
- An empty chip — A chip with no word is only a coloured shape, and colour alone cannot carry a meaning. For a dot or a count, use a Badge.

## Examples

```tsx
import { Chip, Flex } from "@kushagradhawan/kookie-ui-react";
import type { Emphasis, TypeSize, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  weight = "regular",
  emphasis = "loud",
  backdrop = false,
}: {
  size?: TypeSize;
  weight?: Weight;
  emphasis?: Emphasis;
  backdrop?: boolean;
}) {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop}>Queued</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="success">Live</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="warning">Cancelled</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="destructive">Failed</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="info">Preview</Chip>
    </Flex>
  );
}
```

### Tones

Pick the tone from what the word means. The letters change colour while the box stays grey, so a row of chips stays calm and each word keeps its meaning.

```tsx
import { Chip, Flex } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Chip size="2">Draft</Chip>
      <Chip size="2" tone="info">Running</Chip>
      <Chip size="2" tone="success">Deployed</Chip>
      <Chip size="2" tone="warning">Needs review</Chip>
      <Chip size="2" tone="destructive">Failed</Chip>
      <Chip size="2" tone="accent">New</Chip>
    </Flex>
  );
}
```

### Sizes

Set `size` only when a chip stands alone. Next to other text, leave it unset, and the chip matches the size of that text.

```tsx
import { Chip, Flex } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {SIZES.map((size) => (
        <Chip key={size} size={size} tone="success">
          Deployed
        </Chip>
      ))}
    </Flex>
  );
}
```

### Beside a heading and a label

With no `size`, each chip matches the text of the line it sits in. The chip beside the heading is larger than the chip beside the small label, and neither sets a size.

```tsx
import { Chip, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4">
      <Flex gap="3" align="center">
        <Heading size="6">Website redesign</Heading>
        <Chip tone="info">Running</Chip>
      </Flex>
      <Flex gap="2" align="center">
        <Text size="2" emphasis="medium">
          Last deploy
        </Text>
        <Chip tone="success">Deployed</Chip>
      </Flex>
    </Stack>
  );
}
```

### Status in a table column

A status column is the most common place for a chip. Map each status to one tone in your own code, so the same word always has the same colour.

```tsx
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type Tone,
} from "@kushagradhawan/kookie-ui-react";

const JOBS: { name: string; status: string; tone: Tone }[] = [
  { name: "Build web app", status: "Deployed", tone: "success" },
  { name: "Run migrations", status: "Running", tone: "info" },
  { name: "Send invoices", status: "Failed", tone: "destructive" },
  { name: "Nightly backup", status: "Queued", tone: "neutral" },
];

export default function Example() {
  return (
    <Table aria-label="Jobs">
      <TableHeader>
        <TableRow>
          <TableHead>Job</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {JOBS.map((job) => (
          <TableRow key={job.name}>
            <TableCell>{job.name}</TableCell>
            <TableCell>
              <Chip tone={job.tone}>{job.status}</Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the chip sits over other content, such as an image or a map. |
| `children` | `React.ReactNode` | The word or the number in the chip. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | The emphasis level of the text: `loud`, `medium` or `quiet`. |
| `render?` | `RenderElement` | Renders the chip as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step of the chip, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The category of the chip, which sets its text colour. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight, by name. |

It also takes every prop of a `<span>`.
