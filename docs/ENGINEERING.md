# KookieUI v2: Engineering Conventions

How the code is built so the system stays legible — to a stranger reading it, and to an agent editing it. These are the same property. DECISIONS.md says what the system is; this says how the code must read.

Companion to `DECISIONS.md` (the spec) and `REVIEW.md` (the audit). Section references (§N) point at DECISIONS.md.

---

## 1. Principles

1. **The system is data; code is a small interpreter.** Recipes, prop tables, axis definitions are declarative literals a resolver walks. A reader sees the decisions themselves, not logic that implies them.
2. **Share mechanisms, never shapes.** One prop resolver, one variant engine, one state rule — consumed by every component. But each component is written plainly; no factory metaprogramming to save repetition. Understanding Button must mean understanding everything.
3. **Types are the refusals, enforced.** What the system forbids is unexpressible, not warned about. Margin doesn't exist in Button's type. Closed unions everywhere a scale exists.
4. **The DOM is honest.** Semantic axes render as data-attributes. Anyone inspecting the page reads the design decisions off the element.
5. **CSS does everything CSS can.** JS resolves props to attributes and vars once at render. Hover, press, focus, responsive, theming are stylesheet work. Interaction-time JS is ~zero and that is checkable.
6. **Every export is a decision.** Explicit `exports` map, no deep imports, no barrel spray. Public surface = documented surface.
7. **Comments state constraints only.** A comment is a load-bearing "why this can't be otherwise" (cite the § if one exists) or it is deleted.

---

## 2. Repo layout and component anatomy

```
packages/ui/
  src/
    styles/          index.css — the CSS entry point, imports only
    tokens/          generated output + generator config (color, space, radius, type)
    theme/           Theme component, appearance/hydration
    system/          the shared mechanisms: prop table + resolver, recipes, state rule
    components/
      button/
        button.tsx
        button.css
        button.test.ts
        index.ts
    index.ts         explicit public exports only
apps/docs/
```

- One component = one folder, identical shape, no exceptions. Boring on purpose.
- `system/` is the only place mechanisms live. A component that needs a new mechanism adds it there or doesn't add it.
- Generated files open with a header naming the config that produced them. Editing one is structurally pointless and forbidden.

## 3. Naming

- **Package:** published as `@kookie-ui/react`; the styles entry is `@kookie-ui/react/styles.css`.
- **Files:** kebab-case (`icon-button.tsx`). **Exports:** PascalCase components, camelCase functions, no default exports.
- **Public tokens** (the §13 contract): unprefixed, as written in the spec — `--space-4`, `--radius-control-2`, `--accent-9`, `--accent-solid`.
- **Private mechanism vars** (responsive remap, internal plumbing): `--kk-*`. Undocumented, unstable, never for consumers.
- **Data attributes:** `data-tone`, `data-emphasis`, `data-elevation`, `data-material`, `data-size`, plus Base UI's state attrs (`data-pressed`, `data-disabled`). CSS selects on these; class names are structural only (`kk-button`), never variant-encoding.
- **Props:** the §3 taxonomy is the vocabulary; never invent a second spelling for an existing axis.
- **Commits:** conventional (`feat: button emphasis axis`), granular save points, one concern each.

## 4. The responsive mechanism (blocker 1 resolution — variable remap)

The public API is Radix-style responsive objects on every curated prop. Compilation:

- The component writes values as inline custom properties: `style="--kk-gap: var(--space-2); --kk-gap-md: var(--space-4)"`.
- The stylesheet ships O(props × tiers) fixed arbitration rules: base rule reads `--kk-gap`; each tier's rule reads `var(--kk-gap-md, fallback-chain)`.
- Values never appear in the stylesheet, so tokens and raw strings (`gap="13px"`) ride the same pipe at zero CSS cost.
- **Inheritance guard (required):** custom properties inherit; a nested Flex without `gap` would read its parent's. Register every `--kk-*` remap var with `@property { inherits: false }`.
- Tiers are container-query-keyed (`@md` = container tier), few, and semantic. Only Shell/page-gutter concerns key off the viewport.
- Prove and measure on Box alone before Flex/Grid/Stack exist (REVIEW.md amendment).

## 5. The layout layer

- **Box is the engine:** accepts the full curated prop set including container props and responsive `display` (a flex↔grid switch is legal — CSS ignores inapplicable properties).
- **Flex / Grid / Stack / Container / Spacer are typed sugar over Box:** preset `display`, narrowed prop types, zero additional CSS. The named components are where the library adds enforcement over raw CSS; they are not optional decoration.
- **A prop earns existence only if it adds** token resolution, responsive tiers, or constraint. Everything else is `style`. The prop layer is one declarative table (`prop → css property + optional scale`); adding a prop = adding a row.
- **Escape hatches:** `className` and `style` forwarded everywhere; consumer `style` merges last (escapes win, visibly). Ship an ESLint rule (`no-spacing-utilities-on-controls`) as the enforcement layer for defection.
- Promotion signal: an escape-hatch property recurring across consumer codebases becomes a table row.

## 6. Testing: laws, not snapshots

CI asserts the system's invariants; the manifesto is executable.

- **Token identity:** every size-2 control resolves the identical `--radius-control-2`, `--control-height-2`, `--control-px-2`.
- **State law:** every recipe's hover is exactly +1 step, press +2 (§8).
- **Contrast:** every generated solid passes APCA with its computed contrast token (§7).
- **Budget:** gzipped CSS measured in CI, hard fail on regression (§2). The number lives in one place.
- **Boundary:** margin/position props do not exist on control types (type-level test).
- No snapshot tests. A snapshot asserts nothing anyone decided.

## 7. Building with agents

- **Spec-cite rule:** every task names the § it implements. Doc–code drift is a bug; a forced decision change amends the doc in the same commit.
- **Gates before claims:** work is done when the law tests and budget gate pass, not when it compiles. Run them before reporting done.
- **Milestones:** §14 order with measurement gates between; nobody — human or agent — runs ahead of a gate.
- **Context hygiene:** research in subagents; parallel component build-out (post-Card, repetition phase) in worktrees; adversarial review pass plus human line-by-line read before merge. Merge only what is fully comprehended.
- **Entropy audit:** at each §14 gate, sweep for the AI rot signature — near-duplicate helpers, dead exports, off-pattern files, orphaned CSS. Nothing stays without a reason to exist.
- **Hooks (when code lands):** block edits to generated files; lint on write. CLAUDE.md carries the standing refusals so every session inherits them.

---

## Fold-in status

The 2026-07-31 session decisions are folded into DECISIONS.md: variable remap + container tiers (§2), Box-as-engine, typed sugar, className stance, DESIGN.md reconciliation (§3), hue-aware solid band, brand fidelity, contrast deltas (§7), variant-under-emphasis (§9), density scoping (§12), Tailwind bridge (§13), build-order amendments (§14), typography (§15).

Remaining before Button (tracked in REVIEW.md): focus-visible, disabled/loading, motion tokens, icon sizing. Dark-mode SSR gates Theme. Parked: Shell, migration, RTL.
