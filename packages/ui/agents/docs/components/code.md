# Code

Code shows a short piece of code inside a line of text, in the mono font with a light fill behind it.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Text>
  Run <Code>pnpm run ci</Code> first.
</Text>
```

## Overview

Code shows a short piece of code inside a line of text, such as a command, a file name or a value. It uses the mono font with a light fill behind it.

Use Code for code that sits inside a sentence. For code on several lines, use a CodeBlock, and for a key or a keyboard shortcut, use a Kbd.

`size` is optional. When you don't set it, the code takes the size of the line it sits in, so it stays small in a caption and grows in a heading. Only set `size` when the code stands on its own.

`emphasis` changes the text colour, just as it does on Text. The default is `loud`, because faded code is harder to read. `tone` changes both the text and the fill, so use it when the value itself has a meaning, such as an error code or a success status. The default tone is `neutral`.

Code renders a `<code>` element, which a screen reader reads as ordinary text. Use `render` when the document needs another element, such as `<samp>` for program output.

## Not supported

- A fill that gets louder with emphasis — `emphasis` changes the text colour on Code just as it does on Text. If it changed the fill as well, the same prop would mean two different things.
- Block code — Code on several lines needs wrapping, scrolling and a height limit, which an inline element can't provide. Use a CodeBlock for that.

## Examples

```tsx
import { Code, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Tone, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  weight = "regular",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="3">
      <Text size="3">
        Run <Code weight={weight} tone={tone}>pnpm run ci</Code> before claiming a task done.
      </Text>
      <Text size="1">
        The flag is <Code weight={weight} tone={tone}>--experimental-strip-types</Code>.
      </Text>
    </Stack>
  );
}
```

### Size from the surrounding text

With no `size` set, the code matches the heading, the body text and the small caption around it. You only set the size once, on the Text or the Heading.

```tsx
import { Code, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="5">
        Configure <Code>kookie.config.ts</Code>
      </Heading>
      <Text size="3">
        Set <Code>appearance</Code> on the root Theme.
      </Text>
      <Text size="2" emphasis="medium">
        The default value is <Code>inherit</Code>.
      </Text>
    </Stack>
  );
}
```

### Tones

`tone` changes both the fill and the text. Use it when the value itself has a meaning, such as a status code, an error name or a deprecated flag.

```tsx
import { Code, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3">
      <Text size="3">
        The request returned <Code tone="success">200 OK</Code>.
      </Text>
      <Text size="3">
        The deploy stopped with <Code tone="destructive">ERR_MODULE_NOT_FOUND</Code>.
      </Text>
      <Text size="3">
        The flag <Code tone="warning">--legacy-peer-deps</Code> is deprecated.
      </Text>
    </Stack>
  );
}
```

### Emphasis

`emphasis` changes only the text colour. The `quiet` level suits a value that no longer applies, such as an old endpoint.

```tsx
import { Code, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3">
      <Text size="3">
        Run <Code>pnpm install</Code> to add the package.
      </Text>
      <Text size="3">
        The key starts with <Code emphasis="medium">sk_live_</Code>.
      </Text>
      <Text size="3">
        The old endpoint <Code emphasis="quiet">/v1/projects</Code> is no longer in use.
      </Text>
    </Stack>
  );
}
```

### Names in a table column

Code in a table cell works well for names such as environment variables, and it takes the text size of the cell.

```tsx
import { Code, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kushagradhawan/kookie-ui-react";

const VARIABLES = [
  { name: "DATABASE_URL", purpose: "Connection string for the main database" },
  { name: "STRIPE_KEY", purpose: "Secret key for billing" },
  { name: "SENTRY_DSN", purpose: "Address for error reports" },
];

export default function Example() {
  return (
    <Table aria-label="Environment variables">
      <TableHeader>
        <TableRow>
          <TableHead>Variable</TableHead>
          <TableHead>Purpose</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {VARIABLES.map((variable) => (
          <TableRow key={variable.name}>
            <TableCell>
              <Code>{variable.name}</Code>
            </TableCell>
            <TableCell>{variable.purpose}</TableCell>
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
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | The emphasis level of the text: `loud`, `medium` or `quiet`. |
| `render?` | `RenderElement` | Renders the code as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The colour family of the text and the fill. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight, by name. |

It also takes every prop of a `<code>`.
