# @kookie-ui/react

A React design system. Base UI primitives behind a Kookie-owned API, colour generated in OKLCH,
token-only styling, and a CSS budget that CI enforces.

**Pre-release.** This package is not on npm yet. Build it from the
[workspace](https://github.com/KushagraDhawan1997/kookie-ui-v2) and depend on it with
`"@kookie-ui/react": "workspace:*"`.

Peer dependencies are React 19 and React DOM 19.

## Setup

Two lines. Import the stylesheet one time, and put a `Theme` at the root of the tree.

```tsx
import "@kookie-ui/react/styles.css";
import { Theme } from "@kookie-ui/react";

export default function App({ children }: { children: React.ReactNode }) {
  return <Theme>{children}</Theme>;
}
```

The stylesheet holds the whole system: the generated token layer, the shared control rules and
every component's rules. There is no per-component import, and a component you add tomorrow
needs no new CSS.

`Theme` writes seven app-level values onto one element: appearance, density, radius, contrast,
pointer, depth and material. Everything inside reads them through CSS inheritance.

## An example

```tsx
import { Button, Card, Checkbox, Flex, Heading, Stack, Text, TextField } from "@kookie-ui/react";

export function NewProject() {
  return (
    <Card size="3">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6">New project</Heading>
          <Text size="3" emphasis="medium">Anyone in the workspace can open it.</Text>
        </Stack>

        <Stack gap="3">
          <Text size="2" weight="medium" render={<label htmlFor="name" />}>Project name</Text>
          <TextField id="name" required />
        </Stack>

        <Flex align="center" gap="2">
          <Checkbox id="private" />
          <Text render={<label htmlFor="private" />}>Keep it private for now</Text>
        </Flex>

        <Flex justify="flex-end" gap="3">
          <Button>Cancel</Button>
          <Button emphasis="loud">Create project</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```

That code sets no colour, no length and no breakpoint. Targets grow on a touch screen. Reading
steps rise on a handheld screen. Every value follows the appearance into dark mode and answers
`contrast="high"`.

## What the API refuses

- **No `variant` prop.** `tone` states meaning. `emphasis` states loudness. They are separate
  axes, so `<Button tone="destructive" emphasis="quiet">` is expressible.
- **No margin prop on any control.** The container states the distance. `<Box m>` is the escape
  for a one-off.
- **No shadow prop, and no elevation prop.** `depth` is one word on the `Theme`.
- **No raw sizes.** `size` is a closed union, and it indexes a designed set.
- **No `bold` weight.** The ladder stops at semibold. Rank with size and with the ink roles.

Each refusal has a written reason and a stated escape. `className` and `style` reach every
component, and your `style` merges last.

## Documentation

The documentation site lives in `apps/docs` in the repository. It holds 21 guideline chapters,
the reference for 31 components with the refusals beside the props, and a composition editor
that exports React code.

## Licence

[MIT](https://github.com/KushagraDhawan1997/kookie-ui-v2/blob/main/LICENSE).
