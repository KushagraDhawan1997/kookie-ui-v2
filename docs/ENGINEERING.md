# KookieUI v2: Engineering Conventions

How the code is built so the system stays legible — to a stranger reading it, and to an agent editing it. These are the same property. DECISIONS.md says what the system is; this says how the code must read.

Companion to `THESIS.md` (why, and the governance tiers), `DECISIONS.md` (the spec) and `REVIEW.md` (the audit). Section references (§N) point at DECISIONS.md.

---

## 1. Principles

1. **The system is data; code is a small interpreter.** Recipes, prop tables, axis definitions are declarative literals a resolver walks. A reader sees the decisions themselves, not logic that implies them.
2. **Share mechanisms, never shapes.** One prop resolver, one variant engine, one state rule — consumed by every component. But each component is written plainly; no factory metaprogramming to save repetition. Understanding Button must mean understanding everything.
3. **Types are the refusals, enforced.** What the system forbids is unexpressible, not warned about. Margin doesn't exist in Button's type. Closed unions everywhere a scale exists.
4. **The DOM is honest.** Semantic axes render as data-attributes. Anyone inspecting the page reads the design decisions off the element.
5. **CSS does everything CSS can.** JS resolves props to attributes and vars once at render. Hover, press, focus, responsive, theming are stylesheet work. Interaction-time JS is ~zero and that is checkable.
6. **Every export is a decision.** Explicit `exports` map, no deep imports, no barrel spray. Public surface = documented surface. The map is verified, not trusted: every build runs `publint` and `are-the-types-wrong` (ESM-only profile; the CSS subpath excluded — attw can only type-resolve JS) against the packed artifact, because the repo has already shipped both failures they catch (LOG 2026-07-31: a hashed d.ts the exports map did not name, and stripped `"use client"` directives).
7. **Comments state constraints only.** A comment is a load-bearing "why this can't be otherwise" (cite the § if one exists) or it is deleted. Two exceptions that are function, not decoration: **JSDoc on every exported component, prop, type, and function** (it renders at the call site, so it is part of the enforcement surface beside the types; state intent, never restate the code), and the CHANGES rule below.
8. **CHANGES notes live at the edit point, dated, newest first, one line, why over what.** An anti-regression device, not a changelog: git is the changelog. Write one only where a future reader could plausibly undo the thing: a reversal of an earlier decision, a constraint the code cannot show (a compiler bug, a silent failure, a load-bearing value), or a fix whose reason is invisible from the fixed code. Never for tuning, and never for new code that is simply new. Decisions large enough to argue with go in `docs/LOG.md` instead.

---

## 2. Repo layout and component anatomy

```
packages/ui/
  src/
    styles/          index.css — the CSS entry point, imports only
    tokens/          generated output + generator config (color, space, radius, type)
    theme/           Theme component, appearance/hydration
    system/          the shared mechanisms: prop table + resolver, recipes, state rule
    test/            browser-test scaffolding; unreachable from index.ts, never published
    components/
      button/
        button.tsx
        button.css
        button.browser.test.tsx
    index.ts         explicit public exports only
apps/docs/
```

- No per-folder `index.ts`. The exports map ships one entry point, so a folder barrel re-exports to nobody and only adds a second place a name can be spelled — §1.6 with the indirection removed.
- One component = one folder, identical shape, no exceptions. Boring on purpose.
- `system/` is the only place mechanisms live. A component that needs a new mechanism adds it there or doesn't add it.
- Generated files open with a header naming the config that produced them. Editing one is structurally pointless and forbidden.

### 2.1 The control contract

What a new control must know about the shared layer, stated once (2026-08-06). Until this section existed the contract was discoverable only by reading `recipes.css` end to end and two shipped components — and the two checkbox audit defects were both a component getting one line of it wrong. Each clause names its enforcement; a clause with no law is marked, and adding one un-marked is the drift this section exists to prevent.

- **Classes:** `kui-control` opts into the skeleton, plus the component's own structural class (`kui-button`). Class names are structural only (§3).
- **The axes are stamped as data-attributes** (`data-size`, `data-tone`, `data-emphasis`, `data-bordered`, `data-material`, plus states) — and `solid` material writes **no** attribute: the layer's material selectors match only the three thicknesses. An identity a component fixes (a field's neutral tone) is still stamped; a prop the component refuses is not the same as an attribute it omits. *Enforced by: the mounted component laws; the attribute vocabulary lives in ENGINEERING §3 and `system/axes.ts`.*
- **`--kui-ct-*` stems come in three kinds, and only one is yours.** Layer-private (declared and read by `recipes.css` — do not touch), layer-to-component (`--kui-ct-mark`, `--kui-ct-slot-inset`, `--kui-ct-hosted-height` — read if the geometry applies), and component-owed: a control that re-sources its fill declares **all three** of `--kui-ct-fill-src` / `-src-hover` / `-src-active` (they are `inherits: false`; a partial re-source paints transparent under the pointer) and pairs them with `--kui-ct-label-color`. *Enforced by: the fill-triple law (per rule, every sheet).*
- **Roles, never painted names.** A component re-points `--tone-border`; it never mentions `--kui-border-color` — the state remaps rewrite roles and must reach every box. *Enforced by: the painted-variable law.*
- **Dress yields to state:** a component's own variant rules use `:where()`, so `invalid`/`disabled` (which use plain specificity) outrank them by source order instead of tying. *Enforced since 2026-08-06: no component sheet may use `:is()` at all — in a component sheet everything is skeleton or dress, so the ban is total there; checkbox's mounted checked-while-invalid law stays as the computed-value proof of the same rule.*
- **Slots:** adornments sit in `data-slot` wrappers whose value set is `SlotName` (`system/axes.ts`); presence-keyed and value-keyed rules must agree. *Enforced by: the slot-union law, sheets and sources.*
- **Wiring:** the stylesheet is `@import`ed by `styles/index.css` (*enforced: entry-walk law, both directions — the suite's `?raw` list is pinned against the entry*), and any new Base UI entry point joins `vitest.config.ts` `optimizeDeps.include` (*enforced: pre-bundle law; the prose rule in §7 stands as the reason*).
- **What fires without you:** the directory-walked laws — no axis in component CSS, no raw px, no self-invented shadow, ring tokens on every focus rule, no layout-owned stem, and this contract's own walks — audit a new stylesheet the day it exists. A component that ships a stylesheet must also ship a browser test file (*enforced since 2026-08-06: the test-file walk; Spinner was the one that had none*). **What does not:** the CONTENT of the mounted behavioural laws (the 2026-08-03 standard: computed values through a `<Theme>`, both appearances) is still written per component — a file's existence can be walked, its sufficiency cannot.

## 3. Naming

- **Package:** published as `@kookie-ui/react`; the styles entry is `@kookie-ui/react/styles.css`.
- **Files:** kebab-case (`icon-button.tsx`). **Exports:** PascalCase components, camelCase functions, no default exports.
- **Public tokens** (the §13 contract): unprefixed, as written in the spec — `--space-4`, `--radius-control-2`, `--accent-9`, `--accent-solid`.
- **Private mechanism vars** (responsive remap, internal plumbing): `--kui-*`. Undocumented, unstable, never for consumers.
- **Data attributes:** the semantic axes — `data-tone`, `data-emphasis`, `data-bordered`, `data-material`, `data-size`; one structural attribute, `data-slot` (the adornment wrapper inside a control, which the shared icon-box rule selects on); and the state attrs, some from Base UI (`data-pressed`, `data-disabled`, `data-invalid`, `data-focused`, `data-filled`) and some stamped by us from a prop we own (TextField writes its own `data-disabled` so the shared remap lands). `aria-invalid` is style-bearing too — it is the platform spelling of a state the stylesheet reads. CSS selects on these; class names are structural only (`kui-button`), never variant-encoding.
- **Props:** the §3 taxonomy is the vocabulary; never invent a second spelling for an existing axis.
- **Commits:** conventional (`feat: button emphasis axis`), granular save points, one concern each.

## 4. The responsive mechanism (blocker 1 resolution — variable remap)

The public API is Radix-style responsive objects on every curated prop. Compilation:

One table (`system/props.ts`) drives both halves — the resolver that writes the properties and the generator that writes the rules — so a prop cannot exist in one and not the other. Stems are short (`gap` writes `--kui-g`) because they ship on every element.

- The component writes values as inline custom properties: `style="--kui-g: var(--layout-space-2); --kui-g-md: var(--layout-space-4)"`. The resolver emits the density-aware layout-space layer, never the raw palette (§3, §12).
- The stylesheet ships O(longhands × tiers) fixed arbitration rules: the base rule reads `--kui-g`; each tier's rule reads `var(--kui-g-md, fallback-chain)`.
- Values never appear in the stylesheet, so tokens and raw strings (`gap="13px"`) ride the same pipe at zero CSS cost.
- **Inheritance guard (required):** custom properties inherit; a nested Flex without `gap` would read its parent's. Register every `--kui-*` remap var with `@property { inherits: false }`.
- **Longhands only, and an explicit fallback where the initial value is wrong.** An unset custom property resets its property to the *initial* value, not to an earlier declaration — see §2 of DECISIONS.md, requirements 3 and 4. Both are the same rule and both shipped broken before a browser test existed.
- Tiers are container-query-keyed (`md` = container tier), few, and semantic. Only Shell/page-gutter concerns key off the viewport.
- Prove and measure on Box alone before Flex/Grid/Stack exist (REVIEW.md amendment).

## 5. The layout layer

- **Box is the engine:** accepts the full curated prop set including container props and responsive `display` (a flex↔grid switch is legal — CSS ignores inapplicable properties).
- **Flex / Grid / Stack / Container / Spacer are typed sugar over Box:** preset `display`, narrowed prop types, zero additional CSS. The named components are where the library adds enforcement over raw CSS; they are not optional decoration.
- **A prop earns existence only if it adds** token resolution, responsive tiers, or constraint. Everything else is `style`. The prop layer is one declarative table (`prop → css property + optional scale`); adding a prop = adding a row.
- **Escape hatches:** `className` and `style` forwarded everywhere; consumer `style` merges last (escapes win, visibly). Ship an ESLint rule (`no-spacing-utilities-on-controls`) as the enforcement layer for defection.
- Promotion signal: an escape-hatch property recurring across consumer codebases becomes a table row.

## 6. Testing: laws, not snapshots

CI asserts the system's invariants; the manifesto is executable.

**Four of the entries below were prose, not law, until 2026-08-03** — the focus ring's APCA floor, the +1/+2 state rule, the margin-refusal type test, and the surface-radius cap probe (which read a token that no longer existed, so `0 < 100` passed unconditionally). Every one of them has since been written and, more importantly, *falsified* against the pre-fix code. The pattern in what was missing is worth keeping in mind when adding to this list: the absent laws were exactly the ones that needed a second value to compare against, rather than a single string to find. A law that greps for a token NAME proves the name is present, which is never the thing in doubt.

- **Token identity:** every size-2 control resolves the identical `--radius-control-2`, `--control-height-2`, `--control-px-2`.
- **State law:** every recipe's hover is exactly +1 step, press +2 (§8).
- **Contrast:** every generated solid passes APCA with its computed contrast token (§7).
- **Budget:** gzipped CSS measured in CI, hard fail on regression (§2). The number lives in one place.
- **Boundary:** margin/position props do not exist on control types (type-level test); style props do not leak out as DOM attributes.
- No snapshot tests. A snapshot asserts nothing anyone decided.

**Two projects, and the split is a trap worth naming.** The node project covers generators and resolvers: what the code *writes*. The browser project covers what an engine then *does* with it. Neither substitutes for the other, and the failure mode is subtle in both directions — `var(--space-0)` and `0` both compute to `0px`, so only a node test sees that difference; a stylesheet can be textually perfect and still compute nothing, so only a browser test sees that one.

**A browser test that hand-writes the markup proves the stylesheet, not the component.** Both are worth having, but a suite made only of the first kind leaves the entire React layer — prop to custom property, token index to `var()`, tier key to tier var, `render` merging, Theme nesting — asserted nowhere while looking thoroughly covered. Mount the real component.

## 7. Building with agents

- **Spec-cite rule:** every task names the § it implements. Doc–code drift is a bug; a forced decision change amends the doc in the same commit.
- **Gates before claims:** work is done when the law tests and budget gate pass, not when it compiles. Run them before reporting done.
- **Milestones:** §14 order with measurement gates between; nobody — human or agent — runs ahead of a gate.
- **Context hygiene:** research in subagents; parallel component build-out (post-Card, repetition phase) in worktrees; adversarial review pass plus human line-by-line read before merge. Merge only what is fully comprehended.
- **Entropy audit:** at each §14 gate, sweep for the AI rot signature — near-duplicate helpers, dead exports, off-pattern files, orphaned CSS. Nothing stays without a reason to exist.
- **Warnings in test output are signals, not noise.** Base UI logged the `nativeButton` mismatch on every mount for the whole life of Button, in our own suite's output, and it was read past — the defect it named (`render={<a/>}` shipping a focusable, unannounced dead link) sat in the 2026-08-03 audit's findings. A run is not green because the exit code is zero; unexplained console output from a dependency is a finding until it is explained.
- **A Base UI entry point must be pre-bundled before the browser suite mounts it** (`vitest.config.ts` `optimizeDeps.include`). An entry discovered mid-run is optimized in a second pass and ends up holding a different React than the page, so every hook inside it reads off `null` — which is how `@base-ui/react/input` failed the first time TextField mounted, with a stack that blames React rather than the config. Since 2026-08-06 this is a law (§2.1), not a memory: the walk greps every component's Base UI imports against the config.
- **A law that reads across a package boundary owes a build edge across the same boundary** (2026-08-08). `apps/docs`'s playground law parses `packages/ui/src/index.ts`, turbo's `test` task had no edge to the package, and so adding an export served a cache hit: the law enforcing "a component ships with its playground section" silently did not run, and a full `pnpm run test` reported green while two new exports had no section. `dependsOn: ["^test"]` is the fix. The generalisation is the audit lesson one layer out — a law that cannot FAIL is not a law, and "did not run" is a way of not failing.
- **Generated files are protected by a law test, not a hook:** the suite regenerates and compares against the committed artifact, so a hand edit fails CI for everyone rather than only the session that has the hook installed. **The build must therefore never write into `src/`** — it runs the generator with `--check`, which verifies and writes nothing. This was the hole until 2026-08-03: `build` began by regenerating the two files the drift law reads, turbo ran build and test as concurrent graph roots, and the generator won every race, so the law read a file that had just been repaired. Ordering the two tasks does not help — whichever runs first, a build that writes still destroys the evidence. `pnpm run tokens` is the deliberate way to regenerate. Lint-on-write hooks remain optional local ergonomics. CLAUDE.md carries the standing refusals so every session inherits them.

---

## Fold-in status

The 2026-07-31 session decisions are folded into DECISIONS.md: variable remap + container tiers (§2), Box-as-engine, typed sugar, className stance, DESIGN.md reconciliation (§3), hue-aware solid band, brand fidelity, contrast deltas (§7), variant-under-emphasis (§9), density scoping (§12), Tailwind bridge (§13), build-order amendments (§14), typography (§15).

Remaining before Button (tracked in REVIEW.md): focus-visible, disabled/loading, motion tokens, icon sizing. Parked: Shell, migration, RTL.

**Theme shipped ahead of the dark-mode SSR decision** (2026-08-02) — `appearance` hydration, inline script vs class on `html`. It was a gate and it was passed, which is worth recording rather than quietly renumbering: nothing rendered an app yet, so the debt was not yet visible, and it came due at `apps/docs`. **Paid there 2026-08-05** (LOG, REVIEW's third round): a pre-paint inline script stamps `data-appearance` — and `data-contrast`, because the generated high-contrast selectors need both on one element (§7) — onto `<html>`, and the root `Theme` runs `appearance="inherit"` so it stamps neither. One source of truth, no flash, hydration-safe. The choice between the two candidates named above went to the inline script for the reason next-themes did: a class on `html` still has to be *decided* before paint, so it needs the same script and buys nothing.
