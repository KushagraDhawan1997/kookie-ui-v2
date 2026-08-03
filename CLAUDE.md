# KookieUI v2

Ground-up rebuild of KookieUI. Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes, hard CSS budget.

## State

Blockers resolved 2026-07-31; code phase open, following §14's build order strictly.

Done: scaffold (1), token pipeline including the colour generator (2), Box and the responsive mechanism (3), Theme + Flex/Stack/Grid (4), and the pointer axis tokens (4b) — coarse cells, Theme `pointer` prop, preview matrix, laws. No runtime touch reserve: the designed geometry carries both the locked 24 floor (WCAG 2.2 AA) and the 44 target on the default path, so every control is one element. Theme shipped with dark-mode SSR still unresolved (REVIEW.md); that debt comes due at apps/docs.

**Button shipped 2026-08-03 (step 5)** on Base UI, the first runtime dependency: `size × tone × emphasis × bordered × loading`, plus Spinner. Exit gate met — +1,206 bytes gzipped for the whole control layer, of which ~480 is Button's own; additivity is law-tested, not just measured. Confirmed on a real iPhone. All transitions are zero until the motion system is designed (Kushagra's call; press stays instant whenever motion lands).

**Card shipped 2026-08-03 (step 6), then stripped to a shell 2026-08-04**: `size × material` (solid | thin | regular | thick) and children, one fixed treatment (opaque --color-surface seal + border), no tone/emphasis/bordered props, no anatomy slots, zero CSS of its own (a law asserts card.css does not exist). The governing criterion (LOG 2026-08-04): anatomy is system-owned only where something non-visual forces it (Dialog a11y, Callout status); layouts are blocks (kookie-blocks). Card-as-button is `render={<button/>}` — the surface layer notices element semantics.

**The elevation axis is deleted; depth is an app identity.** No call site chooses a shadow. Theme `surfaces="flat"|"elevated"` (sixth Theme prop) is the one sanctioned consumer: --surface-chrome composes var(--shadow-2), the border stays --tone-border (sharp, and contrast="high" reaches it), dark adds only the inset rim-light. --shadow-1..4 is otherwise a §13 resource for escapes/blocks via `style`.

**Layout space shipped 2026-08-04 (§3, §12):** `--layout-space-N`, the density-aware semantic layer every layout distance consumes — gap on Flex/Stack/Grid, Box `p`/`m`, surface padding (fixed picks, re-baked per density scope). Default is the 1:1 identity map onto the untouched space palette; compact/comfortable shift picks for steps 1-8 while the gutter band 9-12 holds. Raw space = palette + control-family picks (innards answer density via the designed sets, never twice); pointer never touches the layer. Preview has a page-wide density select.

**Next:** lock the v0 taste by eye (surface padding, layout-space picks incl. the gutter-band hold, material recipes, elevated chrome), then repetition across the component set — plus the §10 deferrals (Theme material policy clamp, brightness-floor branch, material border edge) and the §14 slice's standing debts (dark SSR at apps/docs, motion system, `material` returning to Button).

Read order: `docs/THESIS.md` (why it exists, the governance tiers) → `docs/DECISIONS.md` (the spec) → `docs/REVIEW.md` (audit + resolution log) → `docs/ENGINEERING.md` (how we build) → `docs/LOG.md` (dated decision log: why it became this, what was rejected).

`DECISIONS.md` is what the system is now; `LOG.md` is how it got there. A choice that was genuinely open and got closed — a reversal, a measurement that moved a decision, a rejected alternative worth staying rejected — earns a LOG entry in the same commit. Tuning does not.

## Non-negotiables

- Components never own outer spacing. No margin prop on any control. The escape is `<Box m>`.
- Tokens only. No raw px in component CSS; every value resolves through a `--*` token.
- No utility classes shipped, ever.
- `size` is an index, not a measurement. Closed unions: `"1" | "2" | "3" | "4"`.
- Appearance is resolved output. Components expose tone/emphasis/material, never raw fills. Elevation does not exist; no component exposes a shadow API. --shadow-1..4 is a fenced resource; Theme surfaces=elevated is its only stylesheet consumer.
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
