# @kookie-ui/mcp

An MCP server for KookieUI. It answers what a component is, what it refuses and why, which
tokens exist, and whether a piece of code breaks the system's rules.

It exists because a model writing code against this system fails one way: it reaches for a prop
that does not exist. The API most models have memorised is Radix Themes' and shadcn's —
`variant`, `asChild`, `color`, a margin row on every component — and KookieUI refuses all of
them on purpose, with something else to write instead. The package says so at compile time and
the documentation site says so in prose. Neither reaches a model composing a snippet with no
checkout to compile. This does.

## Adding it

The server needs no arguments and no keys. It reads a snapshot built into the package.

### Claude Code

```bash
claude mcp add kookie-ui -- npx -y @kookie-ui/mcp
```

Or, to check it into a project so everyone on the team gets it, `.mcp.json` at the repo root:

```json
{
  "mcpServers": {
    "kookie-ui": {
      "command": "npx",
      "args": ["-y", "@kookie-ui/mcp"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "kookie-ui": {
      "command": "npx",
      "args": ["-y", "@kookie-ui/mcp"]
    }
  }
}
```

### VS Code

`.vscode/mcp.json` in the project:

```json
{
  "servers": {
    "kookie-ui": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@kookie-ui/mcp"]
    }
  }
}
```

### From this repo, without publishing

Point the command at the built file:

```json
{
  "mcpServers": {
    "kookie-ui": {
      "command": "node",
      "args": ["/absolute/path/to/kookie-ui-v2/packages/mcp/dist/index.js"]
    }
  }
}
```

## The tools

### `list_components(family?, query?)`

Every component, as a name and one sentence, grouped by family. Names and abstracts only.
Start here when you do not know what the system calls a thing — it calls several of them
something other than what you expect, and it ships none of some things you may look for.

### `get_component(name)`

The full reference for one component: what it is, what it refuses and why, a real example, and
every prop it declares. Takes an exported name (`Button`), a part (`MenuItem`) or a slug
(`alert-dialog`). It is the same document the documentation site serves at
`/components/<slug>.md`, so it is never a paraphrase of it.

### `check_usage(code)`

Reads a piece of JSX and reports what the system refuses in it: props that do not exist, values
outside a closed union, utility classes in `className`, raw lengths and colours in `style`.
Every reason it prints is the system's own sentence, carried from the package's refusal types
or the component's own reference entry.

```
<Button variant="solid" size="5" m="4">Save</Button>
```

```
### line 1 — error: `variant` on `<Button>`
KookieUI has no `variant`. Use `tone` for what a thing means and `emphasis` for how loud
it is — so a quiet destructive button is expressible.

### line 1 — error: `size` on `<Button>`
`size` is a closed set on Button. It takes `1`, `2`, `3`, `4` — never `5`.

### line 1 — error: `m` on `<Button>`
A component sets no outer spacing. Wrap it — `<Box m="4"><Button/></Box>` — or set `gap`
on the Flex, Stack or Grid that holds it.
```

It reads opening tags and literal values. It does not resolve identifiers, so a spread hides
what it carries and a prop whose value is a variable is not checked — both are reported rather
than passed over in silence. A clean result means nothing visible breaks a rule. It does not
mean the code compiles.

### `get_tokens(query, limit?)`

The generated custom properties and the values they resolve to, filtered by a query. It never
returns the whole set. The value shown is the one at `:root`, and any scope that redeclares the
token is named beside it, because a token that moves under dark or under a density has more
than one value and printing one of them without saying so would be a lie.

## Why it is shaped this way

**No tool returns everything.** A client truncates a tool result at about 25,000 tokens, and a
truncated result is the bad kind of failure: it ends mid-sentence and nothing says it was cut.
There are 54 components. So every list is filtered and says how much it left out, every detail
tool takes one component, and one function applies the budget for all four. A law sweeps every
answer the server can give — every component, every family, the widest token query — and
asserts each is under the ceiling.

**Nothing here is authored.** Every fact the server serves already had a home in this repo, and
a published package cannot import from a Next.js app. So `scripts/build-data.ts` derives a
snapshot at build time out of those homes and a law re-runs the derivation and fails when the
snapshot has drifted:

| What | Where it comes from |
| --- | --- |
| Component names, abstracts, families, refusals | `apps/docs/app/(docs)/components/registry.ts` |
| The reference document for each component | `apps/docs/app/(docs)/markdown.ts` |
| Prop names, types and descriptions | `apps/docs/app/(docs)/components/api.generated.ts` |
| The refused props and their escapes | `packages/ui/src/system/refused.ts` |
| Which refusals each symbol takes | each component's own `export type XProps` |
| Axis values | `packages/ui/src/system/axes.ts`, `theme/theme.tsx` |
| Layout props and their scales | `packages/ui/src/system/props.ts` |
| Tokens and values | `packages/ui/src/tokens/tokens.css` |

**It is not shadcn's server.** That one exists to install: its centre of gravity is an add
command over registries of copyable source. KookieUI is a dependency, so there is nothing to
fetch and no install command to compose — a consumer already has the source in `node_modules`.
What is scarce here is the boundary, not the code. So there is no add tool, no icon search
(this package ships no icon set, on purpose), no preview URL, and one tool that reads the
caller's own code back to them.

## Building it

```bash
pnpm --filter @kookie-ui/mcp run build   # derives dist/data.json, then bundles dist/index.js
pnpm --filter @kookie-ui/mcp run test    # the drift law, the scanner's laws, the budget sweep
node packages/mcp/scripts/drive.mjs      # starts the built server and calls every tool
```
