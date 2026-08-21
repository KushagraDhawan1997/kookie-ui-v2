# Contributing

This document states how to set up the repository and what a change must satisfy.
[`docs/ENGINEERING.md`](docs/ENGINEERING.md) states the code conventions in full. This file does
not repeat them.

## Setup

You need pnpm 10 and Node 22.

```bash
pnpm install
pnpm --filter @kookie-ui/react exec playwright install --with-deps chromium
pnpm run build
```

Install Chromium. The test suite has a browser project, and the laws that only a browser can
answer do not run without one.

Build the package before you run the documentation app. The app imports the built output.

```bash
cd apps/docs && pnpm run dev
```

## Run the checks

```bash
pnpm run ci
```

That runs the build, both test projects, the linter and the CSS budget gate. Run it before you
push.

Read the reported test count. A browser that fails to launch reports a pass with a small count,
not a failure.

## What every change must satisfy

These come from [`docs/DECISIONS.md`](docs/DECISIONS.md). A change that breaks one fails CI.

- **Tokens only.** No raw pixel value and no colour in component CSS. Every value resolves
  through a `--*` token.
- **A component sets no outer spacing.** No margin prop on any control.
- **`size` is an index.** Closed unions, such as `"1" | "2" | "3" | "4"`. No raw length.
- **No component sets a shadow.** `--shadow-1` to `--shadow-5` are reachable only through the
  world chrome roles that `Theme` declares.
- **Reference a semantic name.** Write `--radius-control-2` in a component, never `--radius-2`.
- **CSS resolves every state.** No JavaScript runs on hover, press or focus.
- **No utility classes ship.** Class names are structural.
- **Never edit a generated file.** Each one opens with a header naming the config that produced
  it. Change the config and regenerate.
- **The CSS budget is a gate.** Growth over the baseline fails the build. Intentional growth
  means re-recording `baselineGzipBytes` in `packages/ui/budget.json` in the same commit.

## Tests are laws, not snapshots

A test asserts something somebody decided: a token identity, the one-step hover rule, an APCA
target, the CSS budget. It never asserts a rendered string nobody chose.

**A law reads the value the browser computes**, from a mounted `<Theme>`, in both appearances. A
law that reads an attribute string, a token name or an object in memory stops one step short of
the value that can be wrong, and it passes while the rendered result is incorrect.

**Falsify each law before you trust it.** Break the code the law is written for and confirm that
the law fails. A law that passes against the defect it was written for is not a law.

**Build the fixture so the general case and the special case give different answers.** A law over
a general rule, built on an input where both give the same answer, is a law about the special case
wearing the general one's name.

## Two rules about documentation

**Doc and code drift is a bug.** When code forces a decision to change, the document amendment
ships in the same commit.

**A settled choice earns a `LOG.md` entry.** Write one when a choice was genuinely open and got
closed: a reversal, a measurement that moved a decision, or a rejected alternative worth staying
rejected. Do not write one for tuning.

Chapters in `apps/docs/content` follow
[`apps/docs/content/AUTHORING.md`](apps/docs/content/AUTHORING.md). It states the language rules
and what belongs in a chapter.

## A component ships with its playground section

Every export that the package ships is rendered in `apps/docs` at `/preview`, and explained at
`/components`. Both are checked, so a component you forget to add fails CI rather than memory.

## Commits

Use conventional style: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. Keep each commit to one
concern.

## Releases

Releases run on [changesets](https://github.com/changesets/changesets). Add one with
`pnpm run changeset`. The release workflow is manual until the first publish.
