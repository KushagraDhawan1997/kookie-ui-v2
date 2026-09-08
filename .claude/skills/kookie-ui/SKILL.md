---
name: kookie-ui
description: How to write @kookie-ui/react without fighting it — the refusals and what to use instead, the tone/emphasis/material vocabulary, where spacing lives, and how to look a component up. Run this before writing or editing any UI built on KookieUI, and whenever a prop you expected does not exist.
---

# KookieUI

This skill carries only what a lookup cannot: what the system REFUSES, and what to reach for
instead. Everything else — every prop, every part, every example — is one fetch away, and the
last section says how. Do not guess an API from another library's shape.

## The five rules every component inherits

- It sets no outer spacing. The container sets the gap between siblings. Use a Box to add space.
- Its size is an index, not a measurement. The same number means different things on different ladders.
- You choose the meaning and the loudness. The theme resolves the colour.
- CSS resolves every state. No JavaScript runs on hover, press or focus.
- It forwards className and style. Your style merges last, so your value wins.

## The vocabulary

Appearance is three independent axes, never one `variant`:

| Axis | Question it answers | Values |
| --- | --- | --- |
| `tone` | what does this MEAN | a closed set of families — `neutral`, the brand, the semantic ones, and the categorical ones. The rules file lists them; a component never names a colour |
| `emphasis` | how LOUD is it | `loud` · `medium` · `quiet` |
| `material` | what is it made OF | `solid` · `thin` · `regular` · `thick` |

`size` is an index (`"1"`–`"4"` on controls, `"1"`–`"9"` on type), stated as a string. Text
weight is `regular` · `medium` · `semibold`; there is no bold, and asking for one is a system
question, not a call-site one.

## Refusals, and what to write instead

| You reach for | Because you learned | Write |
| --- | --- | --- |
| `variant="solid"` | Radix, shadcn | `emphasis="loud"` (plus `tone` if it means something) |
| `color="red"` | most libraries | `tone="destructive"` — a component names a family, never a colour |
| `m` / `margin` on a control | everywhere | `gap` on the surrounding `Flex`/`Stack`/`Grid`, or `<Box m="4">` around it |
| `elevation` / `shadow` | Material | nothing. Depth is one app-wide `<Theme depth>` choice |
| `className="flex gap-4 p-6"` | Tailwind | the layout components. No utility classes ship, so there is nothing to hook onto |
| `asChild` | Radix | `render={<a href="…" />}` |
| a hex, a px, a rem | habit | a token index. If the value you need has no index, that is a finding for the system |

Every component refuses more than this, and each refusal has a written reason. When a prop you
expected is missing, read the component's refusals before working around it — the workaround is
usually the mistake the refusal exists to prevent.

## Spacing, once more, because it is the most common error

A component never states the space around itself. That is the container's decision, and the
container states it once for every child:

```tsx
<Stack gap="4">
  <TextField />
  <Button emphasis="loud">Save changes</Button>
</Stack>
```

Not `<Button style={{ marginTop: 16 }}>`. If one child genuinely needs different space, wrap
that child: `<Box mt="6"><Button/></Box>`.

## Looking a component up

Every page of the KookieUI docs site is served a second time as plain markdown at the same path
with `.md` on the end. That twin carries the abstract, the generated prop table, working
examples and the reason behind every refusal. Fetch it rather than guessing.

- `<docs-site>/components/<name>.md` — one component. A part is documented on its parent's page,
  so the slug is the ROOT component's export name in kebab-case: `SegmentedControl` is
  `/components/segmented-control.md`, and `MenuItem` is on `/components/menu.md`.
- `<docs-site>/llms.txt` — the index of every page.
- `<docs-site>/llms-full.txt` — the whole site in one fetch.

There is no site origin written anywhere in this repo, deliberately. Use the host you are
already on — `http://localhost:1403` when `pnpm --filter docs dev` is running, which is the port
that script pins.

If a KookieUI MCP server is configured in this session, ask it instead: it answers what a
component is, what it refuses, and which tokens exist, without a fetch. If no such tool is
listed, use the markdown twins above.

Offline, the types are the reference: `packages/ui/src/**` in this repo, or
`node_modules/@kookie-ui/react/dist/**/*.d.ts` in a consumer's. Every exported symbol carries
its reasoning on the declaration.

## Working inside this repo

The generated rules a consumer receives are `packages/ui/agents/AGENTS.md` — regenerate with
`pnpm --filter docs run agents`, never edit it. Before shipping a composed surface, run the
`composition` skill; this one is about the API, that one is about the arrangement.
