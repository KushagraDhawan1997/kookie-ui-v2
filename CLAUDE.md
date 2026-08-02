# KookieUI v2

Ground-up rebuild of KookieUI. Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes, hard CSS budget.

## State

Blockers resolved 2026-07-31; code phase open, following §14's build order strictly.

Done: scaffold (1), token pipeline including the colour generator (2), Box and the responsive mechanism (3), and Theme — the first half of step 4. **Next is the rest of step 4: Flex, Stack, Grid as typed sugar over Box.** Theme shipped with dark-mode SSR still unresolved (REVIEW.md); that is a known debt, not a closed question, and it lands before an app renders one.

**Button (step 5) stays gated** on focus-visible, disabled/loading, motion, icon sizing (REVIEW.md resolution log). Do not run ahead of a §14 measurement gate.

Read order: `docs/THESIS.md` (why it exists, the governance tiers) → `docs/DECISIONS.md` (the spec) → `docs/REVIEW.md` (audit + resolution log) → `docs/ENGINEERING.md` (how we build) → `docs/LOG.md` (dated decision log: why it became this, what was rejected).

`DECISIONS.md` is what the system is now; `LOG.md` is how it got there. A choice that was genuinely open and got closed — a reversal, a measurement that moved a decision, a rejected alternative worth staying rejected — earns a LOG entry in the same commit. Tuning does not.

## Non-negotiables

- Components never own outer spacing. No margin prop on any control. The escape is `<Box m>`.
- Tokens only. No raw px in component CSS; every value resolves through a `--*` token.
- No utility classes shipped, ever.
- `size` is an index, not a measurement. Closed unions: `"1" | "2" | "3" | "4"`.
- Appearance is resolved output. Components expose tone/emphasis/elevation/material, never raw fills.
- Semantic references, not numeric coincidence (`--radius-control-2`, never `--radius-2` in a component).
- State styling lives in CSS via data-attributes. No JS at interaction time.
- Never edit generated files (they carry a header naming their source config).
- CSS budget is a CI gate, not a goal. Regression fails the build.

## Working rules

- Every implementation task cites the DECISIONS.md section it implements.
- Doc–code drift is a bug. If code forces a decision change, the doc amendment ships in the same commit.
- Follow the build order in DECISIONS.md §14 exactly. Each step has a measurement gate; do not run ahead of a gate.
- Tests assert system laws (token identity, +1-step rule, APCA, budget), never snapshots.
- Commits: conventional style (`docs:`, `feat:`, `fix:`, `chore:`), granular, one concern each.

## Commands

From repo root (pnpm 10 / Node 22; turbo fans out to packages):

- `pnpm run ci` — build + test + lint + budget gate, the full check; run before claiming any task done
- `pnpm run build` — tsdown (JS + d.ts) then Lightning CSS bundle to `dist/styles.css`
- `pnpm run test` — Vitest (node env; browser-mode project arrives with Box, §14 step 3)
- `pnpm run lint` — ESLint + `tsc --noEmit`
- `pnpm run measure` — CSS budget gate (regression ratchet); numbers live in `packages/ui/budget.json` only. Intentional growth means re-recording `baselineGzipBytes` in the same commit.
- `pnpm --filter @kookie-ui/react run tokens` — regenerate `src/tokens/tokens.css` from `config.ts` (also runs as part of build)
- `pnpm --filter @kookie-ui/react run preview` — emit `packages/ui/preview/density.html`, the size × density matrix for judging the numbers by eye
