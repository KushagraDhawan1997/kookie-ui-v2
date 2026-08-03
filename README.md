# Kookie UI v2

Ground-up rebuild of [Kookie UI](https://github.com/KushagraDhawan1997/kookie-ui). v1 is a Radix Themes fork; v2 is its own system: Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes (tone, emphasis, material), hard CSS budget.

Six of the §14 build steps have shipped — tokens, Box, Theme, the layout primitives, Button, Card — and the code phase is open. `CLAUDE.md` carries the current state and the standing rules; `docs/DECISIONS.md` is the spec.

- `docs/DECISIONS.md` — the design decisions, living document
- `docs/REVIEW.md` — audit of those decisions against v1 measurements; blockers and missing sections
- `docs/ENGINEERING.md` — code conventions, naming, the responsive mechanism, testing laws, agent workflow
- `docs/LOG.md` — dated decision log: why the system became this, and what was rejected
