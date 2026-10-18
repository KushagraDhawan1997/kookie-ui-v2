# Agent eval

This harness measures whether the agent surface in `@kushagradhawan/kookie-ui-react` helps a coding agent build better screens. The surface is `agents/AGENTS.md` and `agents/docs/`.

It runs headless Claude Code on 8 product-style tasks in 3 arms, 3 times each (72 runs). Then it scores each app without a model.

## Arms

- **A, bare.** The package's `agents/` folder is deleted. There is no instruction file.
- **B, surface.** `init --write` puts the rules block into `AGENTS.md` and `CLAUDE.md`. The shipped docs stay in `node_modules`.
- **C, index only.** The same block, but `agents/docs` is deleted.

Every arm starts from the same Vite + React 19 + TypeScript (strict) app in `template/`. The app installs the packed package as a `file:` dependency. Each run gets a fresh copy.

## Scoring

All four measures are deterministic:

1. `tsc --noEmit` error count.
2. The package's ESLint plugin: errors and warnings.
3. `checkUsage` findings from `@kushagradhawan/kookie-ui-react/agent`.
4. Rubric checks for the task, read off the TypeScript AST (`lib/checks.ts`).

Each rubric check cites the sentence in `packages/ui/agents/docs/` that it enforces, with the page and line. `test/citations.test.ts` fails if a cited sentence moves or changes.

A run passes when the agent changed the app, tsc and the plugin report no errors, `checkUsage` reports no errors, and no rubric check fails.

## Before you start

`checkUsage` needs a snapshot of the docs registry. Build one once:

```sh
node --experimental-strip-types eval/agents/snapshot.ts
```

It writes `eval/agents/.cache/data.json`. You can also pass `--snapshot <file>` or set `KOOKIE_EVAL_SNAPSHOT`. If `packages/mcp/dist/data.json` exists, it is used.

The scorer loads the plugin from `packages/ui/dist`, so the package must be built.

## Unit checks

```sh
node --experimental-strip-types --test eval/agents/test/*.test.ts
```

These prove each check passes its good fixture and fails its bad one, that every citation is still on its line, and that the plugin and `checkUsage` report the refused props.

## Dry run

```sh
node --experimental-strip-types eval/agents/run.ts --dry-run
```

This packs `packages/ui`, builds the base app, copies it into 72 run folders and applies each arm. It checks that each arm holds what it should and prints every `claude` command. It never starts `claude`.

Add `--install` to run `npm install` in the base app. Without it, only the package is unpacked, so tsc cannot run on those folders.

Batches go to a folder in the system temp directory. The runner refuses a folder inside a git repo or under a `CLAUDE.md` or `AGENTS.md`, because Claude Code would read those files in every arm.

## Real run

```sh
export ANTHROPIC_API_KEY=...
node --experimental-strip-types eval/agents/run.ts --go --model claude-opus-5-5
node --experimental-strip-types eval/agents/report.ts <batch-folder>
```

- Each run uses `--bare`, so Claude Code loads no user memory, hooks, plugins or MCP servers. `--add-dir` loads the app's own `CLAUDE.md`. `--bare` needs `ANTHROPIC_API_KEY`.
- With a subscription login, pass `--no-bare`. The run then uses `--setting-sources project,local`, but your user `CLAUDE.md` can still load. Check one transcript first.
- The agent gets Read, Write, Edit, and Bash for `npx tsc` and `npm run typecheck` only. Anything else is denied.
- Each run stops after 10 minutes. Change it with `--timeout <seconds>`.
- Pass `--batch <name>` again to resume. Runs with a `result.json` are skipped.
- Scoring runs at the end. To score again, run `score.ts <batch-folder>`.

Before the full run, do one run of arm B (`--tasks 1 --arms B --reps 1`). Read its `transcript.jsonl` and confirm that the agent saw the `CLAUDE.md` block.

## Other options

`--tasks 1,3`, `--arms A,B`, `--reps 3`, `--parallel 1`, `--tarball <file>`, `--no-score`. See the header of `run.ts`.

## Files

- `tasks.ts`: the 8 prompts and the checks for each.
- `arms.ts`: what each arm changes, and what it must hold.
- `run.ts`: prepares the run folders and runs `claude` behind `--go`.
- `score.ts`: scores each run and writes `score.json`.
- `report.ts`: pass rate and mean findings per arm and per task, and a tally of wrong props in arm A.
- `lib/checks.ts`: the rubric checks and their citations.
- `lib/tree.ts`: the JSX tree the checks read. It expands local components in place.
- `fixtures/<check>/good.tsx` and `bad.tsx`: one screen each way, per check.
