# KookieUI v2

Ground-up rebuild of KookieUI. Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling, semantic axes, hard CSS budget.

## State

Blockers resolved 2026-07-31; code phase open, following §14's build order strictly.

Done: scaffold (1), token pipeline including the colour generator (2), Box and the responsive mechanism (3), Theme + Flex/Stack/Grid (4), and the pointer axis tokens (4b) — coarse cells, Theme `pointer` prop, preview matrix, laws. No runtime touch reserve: the designed geometry carries both the locked 24 floor (WCAG 2.2 AA) and the 44 target on the default path, so every control is one element. Theme shipped with dark-mode SSR still unresolved (REVIEW.md); that debt comes due at apps/docs.

**Button shipped 2026-08-03 (step 5)** on Base UI, the first runtime dependency: `size × tone × emphasis × bordered × loading`, plus Spinner. Exit gate met — +1,206 bytes gzipped for the whole control layer, of which ~480 is Button's own; additivity is law-tested, not just measured. Confirmed on a real iPhone. All transitions are zero until the motion system is designed (Kushagra's call; press stays instant whenever motion lands). **`material` returned 2026-08-04, and became a fill MODIFIER the same day** (§10 "Material is a fill modifier"): the veil is the component's *own* fill mixed toward transparent at the thickness alpha (`--kui-fill-src` indirection in both layers) — tone and loudness survive the glass, quiet is bare blur, the rung keeps its own label pairing, interaction steps the mix alphas, the filter never moves with state. Card is the special case (seal @ alpha = page glass, visually unchanged); derived fills carry `@property inherits:false` guards. v0 alphas, judged in the preview.

**Card shipped 2026-08-03 (step 6), then stripped to a shell 2026-08-04**: `size × material` (solid | thin | regular | thick) and children, one fixed treatment (opaque --color-surface seal + border), no tone/emphasis/bordered props, no anatomy slots, zero CSS of its own (a law asserts card.css does not exist). The governing criterion (LOG 2026-08-04): anatomy is system-owned only where something non-visual forces it (Dialog a11y, Callout status); layouts are blocks (kookie-blocks). Card-as-button is `render={<button/>}` — the surface layer notices element semantics.

**The elevation axis is deleted; depth is an app identity.** No call site chooses a shadow. Theme `surfaces="flat"|"elevated"` (sixth Theme prop) is the one sanctioned consumer: --surface-chrome composes var(--shadow-2), the border stays --tone-border (sharp, and contrast="high" reaches it), dark adds only the inset rim-light. --shadow-1..4 is otherwise a §13 resource for escapes/blocks via `style`.

**Layout space shipped 2026-08-04 (§3, §12):** `--layout-space-N`, the density-aware semantic layer every layout distance consumes — gap on Flex/Stack/Grid, Box `p`/`m`, surface padding (fixed picks, re-baked per density scope). Default is the 1:1 identity map onto the untouched space palette; compact/comfortable shift picks for steps 1-8 while the gutter band 9-12 holds. Raw space = palette + control-family picks (innards answer density via the designed sets, never twice); pointer never touches the layer. Preview has a page-wide density select.

**Surface radius is size-indexed (2026-08-04, §6):** `--radius-surface-1..4` picks from a widened surface band (palette 0-10: control 1-5, surface 6-9, overlay 10); size 3 anchors each level's old flat value; density never touches a surface corner; the semantics re-declare in every `[data-radius]` block (substitution-at-declaration). The preview's demos now space exclusively through kuiBox (flex + gap via the real resolver) — demos modeling margins was called out as a law violation and fixed.

**Audited 2026-08-03 (multi-agent, adversarially verified), and the findings are fixed.** Twenty-two defects, clustered in two places. The escape scopes: `contrast="high"` resolved **no rule at all** in light (the block was `:root`-scoped; Theme renders a div), `prefers-contrast: more` could never fire in dark (Theme stamped the `normal` the guard excludes), and `appearance="light"` had no block, so a light section inside a dark app stayed dark. The claimed-versus-actual law surface: four guarantees the docs named as CI-asserted could not fail, and writing them exposed a WCAG 2.4.11 failure — the dark focus ring sat at |Lc| 22 against the page and is now step 11 per mode. Also fixed: `inset` and `overflow` shipped as dead no-ops (shorthand before longhand, the §2 defect LOG 2026-08-02 already records fixing once for padding); `render={<a/>}` emitted `type="button"` and a focusable unannounced dead link; the `render` escape overwrote the target's ref, style and children; the control size join leaked the whole control family onto every Card; the chrome widths were raw px and the only geometry ignoring `--scale`; dark's seal had no hover step; `surfaces="flat"` could not escape an elevated ancestor; and `build` regenerated the very files the drift laws read, so ENGINEERING's "a hand edit fails CI for everyone" was false.

**The lesson, and the standing rule it earned:** every broken axis was one where no law read a *computed value*. The tests asserted attribute strings, token *names*, and in-memory objects — each one indirection short of the thing that could be wrong, and in each case that thing was wrong. An axis is now proven by a law that reads a computed token through a mounted `<Theme>` in both appearances, or the emitted declarations where the question is what the generator wrote. Every fix in that sweep was falsified against the pre-fix code before it was accepted. 299 tests (was 265); budget 9358 → 9584 gzipped, re-recorded per commit.

**Text + Heading shipped 2026-08-04 (§15)**, the first of the post-slice repetition: one type system through two family slots — `size` 1–9 joining the paired scales, `weight` as token names, no tone (they read the surface's foreground context, §11) — resolved by the shared type layer `system/type.css`; neither ships CSS of its own, law-tested, and type's density/pointer invariance is a mounted law. **`emphasis` reached type the same day** (Kushagra's call), the third resolution of the one axis: fills for controls, dressing for surfaces, foreground roles here — loud `--color-text`, medium muted, quiet the new faint role (v0 neutral-10). Text rests loud (full contrast is the accessible resting state for reading); on a loud surface the ladder collapses to `--tone-contrast`.

**TextField shipped 2026-08-04 — repetition's first entry, and the additivity claim's first real test.** `size × material` + `leading`/`trailing` slots + the native input's props, for **+247 bytes gzipped** (against Button's +1,206 for the layer it created). No emphasis and no tone: loudness ranks actions, and a form where one field is louder than the next names nothing. The visible control is a WRAPPER around the input — which is what makes slots legitimate anatomy here after Card refused them (the border cannot stay on the `<input>` once an icon sits inside it, and the wrapper then owes caret-on-click, slot-aware layout, and a trailing control that keeps its own press). Validity is state (`aria-invalid` / Base UI's `data-invalid`), and its tone remap went into the SHARED layer beside disabled. Focus rings on `:focus-within` — a field's focus is a mode, not a keyboard affordance. `ref` goes to the input; `className`/`style` dress the wrapper.

**The audit after it found three "exactly one" claims already stale** (one box-shadow, one focus ring, three cursors), each guarded by a law that counted occurrences in a single file. Both laws now walk every shipped stylesheet and assert the value rather than the count — mutation-checked. Open, in §17: the `leading`/`trailing` vs Button's `icon`/`iconEnd` spelling (ENGINEERING forbids two spellings; renaming Button is an API break and Kushagra's call), TextField's absent `render` escape, and iOS zoom-on-focus below 16px at sizes 1-2.

**Next:** repetition across the component set — taste is the LAST layer (Kushagra, 2026-08-04: if the infrastructure is right, taste can be added later; every v0 value is a config line by design). The eye pass comes when the structure is done, and its accumulated list is: surface padding, layout-space picks incl. the gutter-band hold, surface radius band, material recipes, elevated chrome, the audit's dark focus ring. Plus the §10 deferrals (Theme material policy clamp, brightness-floor branch, material border edge) and the §14 slice's standing debts (dark SSR at apps/docs, motion system).

Read order: `docs/THESIS.md` (why it exists, the governance tiers) → `docs/DECISIONS.md` (the spec) → `docs/REVIEW.md` (audit + resolution log) → `docs/ENGINEERING.md` (how we build) → `docs/LOG.md` (dated decision log: why it became this, what was rejected).

`DECISIONS.md` is what the system is now; `LOG.md` is how it got there. A choice that was genuinely open and got closed — a reversal, a measurement that moved a decision, a rejected alternative worth staying rejected — earns a LOG entry in the same commit. Tuning does not.

## Non-negotiables

- Components never own outer spacing. No margin prop on any control. The escape is `<Box m>`.
- Tokens only. No raw px in component CSS; every value resolves through a `--*` token.
- No utility classes shipped, ever.
- `size` is an index, not a measurement. Closed unions: `"1" | "2" | "3" | "4"`.
- Appearance is resolved output. Components expose tone/emphasis/material, never raw fills. Elevation does not exist; no component exposes a shadow API. --shadow-1..4 is a fenced resource reached only through --kui-surface-chrome, which Theme surfaces=elevated declares — a law walks every stylesheet and asserts no rule names --shadow-N directly.
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
