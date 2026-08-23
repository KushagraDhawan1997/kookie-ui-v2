# Kookie UI v2

A React design system. Base UI primitives behind a Kookie-owned API, colour generated in OKLCH,
token-only styling, and a CSS budget that CI enforces.

This is a ground-up rebuild of [Kookie UI](https://github.com/KushagraDhawan1997/kookie-ui). v1
is a fork of Radix Themes. v2 is its own system.

**Pre-release.** `@kookie-ui/react` is not on npm yet. Build the workspace to use it.

## The rules that shape the API

- **There is no `variant` prop.** `tone` states what a thing means. `emphasis` states how loud it
  is. The two questions stay apart, so a quiet destructive action is expressible.
- **A component sets no outer spacing.** No control takes a margin prop. The container states
  every distance, through `gap` on `Flex`, `Stack` and `Grid`.
- **`size` is an index, not a measurement.** One numeral joins a designed set: the height, the
  inline padding, the corner, the icon box and the label step.
- **No component sets a shadow.** `depth` is one word on the `Theme`. Each family then decides
  what it does with light.
- **No JavaScript runs at interaction time.** CSS resolves hover, press, focus and validity from
  data attributes on the element.
- **Every value is a token.** No component stylesheet holds a raw pixel value or a colour.

Each of those is a refusal, and each refusal has a written reason and a stated escape.

## Documentation

The site in `apps/docs` is the documentation. It has four parts.

| route | what it holds |
|---|---|
| `/` | 21 guideline chapters: getting started, philosophy, foundations and patterns |
| `/components` | the reference for 39 components, with generated props tables and the refusals |
| `/builder` | a composition editor that exports React code and reviews the result |
| `/preview` and `/matrix` | the judging surfaces: real screens, and the axis grid |

Run it:

```bash
pnpm install
pnpm run build
cd apps/docs && pnpm run dev
```

Build the package first. The documentation app imports the built output.

## Repository layout

```text
packages/ui     @kookie-ui/react: the components, the token generator and the tests
apps/docs       the documentation site, the component reference and the builder
docs/           the governance documents
```

## Commands

Run these from the repository root. They need pnpm 10 and Node 22.

| command | what it does |
|---|---|
| `pnpm run ci` | build, test, lint and the CSS budget gate. Run this before you push. |
| `pnpm run build` | checks the generated tokens, builds the JS and the types, bundles the stylesheet, then verifies the packed artifact |
| `pnpm run test` | two projects: the generator laws in Node, the computed values in a browser |
| `pnpm run lint` | ESLint and `tsc --noEmit` |
| `pnpm run measure` | the CSS budget gate. The numbers live in `packages/ui/budget.json`. |

The token layer is generated. Regenerate it after you change `packages/ui/src/tokens/config.ts`:

```bash
pnpm --filter @kookie-ui/react run tokens
```

## The governance documents

Read them in this order.

- [`docs/THESIS.md`](docs/THESIS.md) states what the system is for and how it governs itself.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) is the specification. It states what the system is now.
- [`docs/REVIEW.md`](docs/REVIEW.md) holds the audits and what each one resolved.
- [`docs/ENGINEERING.md`](docs/ENGINEERING.md) states the code conventions and the testing rules.
- [`docs/LOG.md`](docs/LOG.md) is the dated decision log. It states how the system became this,
  and what was rejected on the way.

`DECISIONS.md` is what the system is. `LOG.md` is how it got there. The chapters in `apps/docs`
state both for a reader who did not make the decisions.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). The tests assert system laws, never snapshots, and a
law reads the value the browser computes rather than the value a stylesheet declares.

## Licence

[MIT](LICENSE).
