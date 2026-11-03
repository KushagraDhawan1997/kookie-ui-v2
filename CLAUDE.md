# KookieUI v2

Ground-up rebuild of KookieUI. Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes, hard CSS budget.

## Before you build any screen

Read `RULES.md` first. It holds every settled composition rule, numbered, with how each is
enforced. Use the component that owns a job (band, toolbar, close, footer, title); never
hand-build one. Never edit a check or law, or swap a component, to get your work past a check.
If a check is wrong, stop and say so.

Before you show any screen, example or figure:

1. Run the screen check on every page you changed, opening dialogs and walking flows:
   `node scripts/review-ui/run.mjs <urls> [--press <name>] [--next <name>] --shots <dir>`.
   Fix every finding.
2. Look at the screenshots, light and dark, against `RULES.md`.
3. Hand the URLs to the `ui-reviewer` agent and fix what it finds. It has fresh eyes; you don't.

Only then show Kushagra. The check's own laws: `node --test scripts/review-ui/check.test.mjs`.

## State

Code phase open, following DECISIONS §14's build order. Motion was removed 2026-09-20: every
state change is instant, except motion that is the information (Spinner, Progress, Attachment).
The full history of what shipped, and why, is `docs/STATE.md`. Read it when you need the reasoning
behind a component; don't read it to start a task.

The front page hero follows the art direction in `../kushagradhawan-v3/FIGURES.md` (the ground and the composition). Read it before you change the hero.

Read order: `docs/THESIS.md` (why it exists, the governance tiers) → `docs/DECISIONS.md` (the spec) → `docs/REVIEW.md` (audit + resolution log) → `docs/ENGINEERING.md` (how we build) → `docs/LOG.md` (dated decision log: why it became this, what was rejected). `docs/archive/` holds records of removed systems (`motion-v1.md`); like a handover, it is never a source of truth for current behaviour.

`docs/handovers/` is a separate genus and NOT part of that order: one plain-English file per unattended session, written for the human reviewing that branch. It is the only place allowed to repeat what the four docs already say, because the reader has not been in the room. It is never a source of truth — where a handover and a governance doc disagree, the governance doc is right and the handover is stale. Nothing is read out of one and into code.

`DECISIONS.md` is what the system is now; `LOG.md` is how it got there. A choice that was genuinely open and got closed — a reversal, a measurement that moved a decision, a rejected alternative worth staying rejected — earns a LOG entry in the same commit. Tuning does not.

## Iterating vs shipping — READ THIS BEFORE THE RULES BELOW

**The default is ITERATING.** Make the change, show it, stop. Most of the time Kushagra is looking
at something, not shipping it, and the discipline in "Working rules" is written for the moment a
decision is finished — not for the twenty tries before it. Applying it to every tweak turns a
thirty-second change into ten minutes and burns his hours, which is the complaint that earned this
section (2026-09-07: *"every time we make even a simple change you do so fucking much... most of
the time I am iterating, I dont need it all to be so permanent until I say so"*).

**While iterating, do NOT:**
- write laws, or sabotage-test anything
- amend `DECISIONS.md`, `LOG.md`, or any doc
- run `pnpm run ci`, or a whole test project
- re-record the CSS budget
- rename things, tidy neighbouring code, or fix anything not asked for

**While iterating, DO:** make the change, run `tsc --noEmit` if types could break, look at the
result (a screenshot or a measurement when the change is visual), and report in two or three lines.

**When he says "ship it"** — or lock it in, make it permanent, or asks for the full pass by any
other words — do everything the working rules ask, for every change since the last ship: laws with
their sabotage passes, doc amendments, budget, `pnpm run ci`.

**Two things survive into iteration, because they cost seconds and prevent losing work:**
- If a change breaks an EXISTING law, say so in one line. Do not fix it until ship.
- Never leave the tree broken: a change that does not typecheck is not a change.

**When in doubt, iterate.** Under-doing it costs one message. Over-doing it costs an hour.

## Non-negotiables

- Components never own outer spacing. No margin prop on any control. The escape is `<Box m>`.
- Tokens only. No raw px in component CSS; every value resolves through a `--*` token.
- No utility classes shipped, ever.
- `size` is an index, not a measurement. Closed unions: `"1" | "2" | "3" | "4"`.
- Appearance is resolved output. Components expose tone/emphasis/material, never raw fills. Elevation does not exist; no component exposes a shadow API. --shadow-1..5 is a fenced resource reached only through the world chrome roles (--kui-surface-chrome, --kui-control-chrome), which Theme depth=elevated declares — a law walks every stylesheet and asserts no rule names --shadow-N directly.
- Semantic references, not numeric coincidence (`--radius-control-2`, never `--radius-2` in a component).
- State styling lives in CSS via data-attributes. No JS at interaction time.
- Never edit generated files (they carry a header naming their source config).
- CSS budget is a CI gate, not a goal. Regression fails the build.

## Working rules

**These apply at SHIP, not while iterating — see the section above.**

- Every implementation task cites the DECISIONS.md section it implements.
- Refute a proposal before presenting it (Kushagra, 2026-08-07). Attack your own plan the way the audits attack shipped code — scope reach, inheritance/registration, precedence, which existing law it breaks — and present the plan WITH its strongest objection either killed or answered. The rule earned itself the day it was written: a proposed `--kui-ct-chrome` world token sat in the control layer's private registered namespace, the `--kui-h` silent-inheritance trap re-committed by the author who documented it.
- Doc–code drift is a bug. If code forces a decision change, the doc amendment ships in the same commit.
- A component ships with its playground section (Kushagra, 2026-08-08). Every component the package exports is rendered in apps/docs `/preview` — law-checked (`apps/docs/app/preview/playground.test.ts` walks the exports against the rendered tags), so forgetting fails CI rather than memory.
- Follow the build order in DECISIONS.md §14 exactly. Each step has a measurement gate; do not run ahead of a gate.
- Tests assert system laws (token identity, +1-step rule, APCA, budget), never snapshots.
- Commits: conventional style (`docs:`, `feat:`, `fix:`, `chore:`), granular, one concern each.

## Commands

From repo root (pnpm 12 / Node 24; turbo fans out to packages):

- `pnpm run ci` — build + test + lint + budget gate, the full check; run before claiming any task done
- `pnpm run build` — tsdown (JS + d.ts) then Lightning CSS bundle to `dist/styles.css`, then `pack:check` — publint + are-the-types-wrong against the PACKED artifact, so the exports map is verified rather than trusted. attw runs the `esm-only` profile: node10 resolution and `require()` are formally unsupported, not silently untested (LOG 2026-08-05).
- `pnpm run test` — Vitest, two projects: node (generator/config laws) and browser mode (computed values through a mounted `<Theme>`, the standing rule after the audit)
- `pnpm run lint` — ESLint + `tsc --noEmit`
- `pnpm run measure` — CSS budget gate (regression ratchet); numbers live in `packages/ui/budget.json` only. Intentional growth means re-recording `baselineGzipBytes` in the same commit.
- `pnpm --filter bench bench` — the performance budget: six heavy screens (v1's five, plus a glass Shell) measured in Chromium against `apps/bench/budget.json`. Needs a build first. `bench:update` re-records it on purpose; `bench:serve` shows the screens at :4173.
- `pnpm --filter @kushagradhawan/kookie-ui-react run tokens` — regenerate `src/tokens/tokens.css` from `config.ts` (also runs as part of build)
- `pnpm --filter @kushagradhawan/kookie-ui-react run preview` — emit `packages/ui/preview/density.html`, the size × density matrix for judging the numbers by eye
- `pnpm --filter docs run dev` — the documentation site, **always on port 1403**. The port is pinned in `apps/docs/package.json` (2026-09-07): a bare `next dev` takes 3000 and silently walks to 3001 when something else has it, so every screenshot, every `curl` in a law's fixture and every link handed to a human meant a different address depending on what else was running.
