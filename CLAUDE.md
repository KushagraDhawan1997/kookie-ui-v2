# KookieUI v2

Ground-up rebuild of KookieUI. Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes, hard CSS budget.

## State

Docs only. **No code until the blockers in `docs/REVIEW.md` are resolved in `docs/DECISIONS.md`.** Do not scaffold packages, do not write components, do not "just prototype" past this gate.

Read order: `docs/DECISIONS.md` (the spec) → `docs/REVIEW.md` (blockers) → `docs/ENGINEERING.md` (how we build).

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

None yet (docs-only). Planned stack: pnpm + Turborepo + tsdown + Lightning CSS + Changesets + Vitest. Update this section the day the scaffold lands — commands first, exact invocations.
