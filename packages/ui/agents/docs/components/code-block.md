# Code Block

CodeBlock shows several lines of code in a panel that is set into the page.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<CodeBlock size="2">{source}</CodeBlock>
```

## Overview

CodeBlock shows several lines of code in a panel that is set into the page, such as a command to run, a file to copy or a sample API response. For a short piece of code inside a sentence, such as a prop name or a file path, use `Code` instead.

Long lines wrap only at spaces, so names and paths are never split, and a line with no spaces scrolls sideways. Set `maxLines` to limit the height to that many lines. The rest of the code scrolls rather than being cut off, so every line can still be reached with the mouse, the keyboard or a screen reader.

`size` sets the padding, the corner and the text size together. The panel uses the same fill as a Surface rather than a Card, because code is part of the page rather than an object placed on it. When the block sits inside a panel of the same kind, such as a Surface, set `hosted` to drop its own fill, border and padding.

CodeBlock doesn't highlight code itself. Use any highlighter that has a CSS-variables mode and point it at the `--code-` variables. Those colours are already checked for contrast against the panel in both light and dark mode.

Use `topbar` for a row at the top of the block, such as a file name and a copy button. When that row spans the full width, also set `band` so the first line of code starts below it. Use `footer` for a row at the bottom, such as a status line.

## Not supported

- Highlighting — Every app has its own highlighter and languages, so CodeBlock doesn't bundle one. Point your highlighter's CSS-variables mode at the `--code-` variables instead.
- A switch for wrapping — Lines always wrap at spaces, so names and paths are never split, and a line with no spaces scrolls. That works for every kind of code, so there is nothing to switch.
- A copy button, line numbers, and a collapse — Put a copy button in `topbar`, and add line numbers in your highlighter. Long code scrolls with `maxLines` rather than collapsing, so no line is ever hidden.
- `tone` and `emphasis` — A block of code has no meaning to colour and no reason to be louder than another block. The syntax colours come from your highlighter and the `--code-` variables.
- A Card as the panel — Code is part of the page rather than an object placed on it, so the panel uses the fill of a Surface instead of a Card.

## Examples

```tsx
import { CodeBlock } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `export function App() {
  return (
    <Theme appearance="dark">
      <Button tone="accent">Ship it</Button>
    </Theme>
  )
}`;

export default function Example({ size = "2" }: { size?: Size }) {
  return <CodeBlock size={size}>{SOURCE}</CodeBlock>;
}
```

### File name and copy button

The `topbar` row holds a file name on one side and a copy button on the other. The button uses `done` to show a tick after copying, and `band` moves the code down so the row doesn't cover the first line.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Code, CodeBlock, Toolbar, ToolbarButton, iconStroke } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `export async function archiveProject(id: string) {
  const project = await db.projects.find(id);
  if (!project) throw new Error("Project not found");
  return db.projects.update(id, { archivedAt: new Date() });
}`;

// The name sits at one wall and the copy button at the other, so the row
// spans the pane. `band` tells the well to start the code below it.
export default function Example() {
  const [copied, setCopied] = React.useState(false);

  return (
    <CodeBlock
      band
      topbar={
        <Toolbar>
          <Code>archive.ts</Code>
          <ToolbarButton
            iconOnly
            done={copied}
            aria-label={copied ? "Copied" : "Copy code"}
            onClick={() => {
              void navigator.clipboard.writeText(SOURCE);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />
          </ToolbarButton>
        </Toolbar>
      }
    >
      {SOURCE}
    </CodeBlock>
  );
}
```

### Limited height

With `maxLines={6}` on a long file, six lines show and the rest scroll inside the block. Use it when a sample is long but only its start matters on the page.

```tsx
import { CodeBlock } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `{
  "name": "billing-service",
  "version": "2.4.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "lint": "eslint src"
  },
  "dependencies": {
    "stripe": "^18.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  }
}`;

// Six lines show, and the rest scroll. Nothing is cut off, so every line
// stays reachable by wheel, keyboard and screen reader.
export default function Example() {
  return <CodeBlock maxLines={6}>{SOURCE}</CodeBlock>;
}
```

### Status row at the bottom

The `footer` row sits under terminal output. Use it for facts about the code above, such as an exit code or how long a command took.

```tsx
import { CodeBlock, Flex, Text } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `$ pnpm install
Packages: +412
Progress: resolved 412, reused 398, downloaded 14, added 412, done
Done in 6.2s`;

// The footer is a second row at the bottom of the pane, for a status
// line or an action that belongs to the code above it.
export default function Example() {
  return (
    <CodeBlock
      footer={
        <Flex justify="space-between" align="center">
          <Text size="2" emphasis="medium">
            Exit code 0
          </Text>
          <Text size="2" emphasis="medium">
            6.2 seconds
          </Text>
        </Flex>
      }
    >
      {SOURCE}
    </CodeBlock>
  );
}
```

### Sizes

The four sizes, one above the other. One `size` changes the padding, the corner and the text together, so a larger block stays in proportion.

```tsx
import { CodeBlock, Stack } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `const invoice = await billing.createInvoice({
  customer: "cus_4821",
  currency: "eur",
});`;

// One `size` sets the padding, the corner and the text together.
export default function Example() {
  return (
    <Stack gap="5">
      <CodeBlock size="1">{SOURCE}</CodeBlock>
      <CodeBlock size="2">{SOURCE}</CodeBlock>
      <CodeBlock size="3">{SOURCE}</CodeBlock>
      <CodeBlock size="4">{SOURCE}</CodeBlock>
    </Stack>
  );
}
```

### In a card

A CodeBlock inside a Card with a heading, a description and an action. The block is set into the card, so it doesn't look like a second card.

```tsx
import { Button, Card, CodeBlock, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `curl https://api.example.com/v1/projects \\
  -H "Authorization: Bearer $API_KEY"`;

// A CodeBlock is recessed into the pane that holds it, so it sits inside
// a Card without looking like a second card.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "36rem" }}>
      <Stack gap="5">
        <Stack gap="2">
          <Heading size="6">Test your API key</Heading>
          <Text emphasis="medium">
            Run this request from a terminal. A list of your projects means the key works.
          </Text>
        </Stack>
        <CodeBlock>{SOURCE}</CodeBlock>
        <Flex justify="flex-end">
          <Button emphasis="loud">Continue</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `band?` | `boolean` | Moves the code down so that the `topbar` row doesn't cover the first line. |
| `children` | `React.ReactNode` | The code. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `footer?` | `React.ReactNode` | Content for a row at the bottom of the block, such as an expand button or a status line. |
| `hosted?` | `boolean` | Removes the block's own background, border and padding. |
| `maxLines?` | `number` | The maximum height of the block, in lines of code. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the code block, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `topbar?` | `React.ReactNode` | Content for a row at the top of the block, such as a file name, a language chip or a copy button. |
