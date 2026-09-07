# Making KookieUI v2 the design system a model gets right

## 1. Where this already stands

The machine-facing transport here is already better than any peer's, and it is better for the reason that matters: it is derived, not authored. `apps/docs/app/(docs)/markdown.ts` builds every page's markdown twin from the same `ENTRIES`, `API` and example files the HTML renders, so a twin cannot disagree with its page by construction; `markdown.test.ts` asserts a chapter's twin is byte-equal to its `.mdx` with nothing prepended, which catches injected text as well as drift. `apps/docs/app/(docs)/llms.ts` derives its index from `PAGES` and reads the origin off the request rather than inventing one. `apps/docs/app/(docs)/components/registry.ts` carries 218 refusal entries across 55 components — a component's *refusals* published as structured data, which no peer surveyed ships at all. `apps/docs/app/builder/review.ts` holds the house composition rules as 17 executable checks with a stated reason and a pure fix each. And `packages/ui/dist/**/*.d.ts` already ships 330KB of rationale-bearing JSDoc that reaches hover and completion with no fetch and no install step.

What a model handed only the package still gets wrong is narrower than the survey suggested, and I verified each of these in the tree. Twenty of the 149 exported declarations in `dist/**/*.d.ts` carry no doc at all — Button, the whole Menu family, `SelectContent`, `PopoverContent`, `TooltipContent`, all five Toolbar parts — and Button's is not missing, it is *orphaned*: the block at `packages/ui/src/components/button/button.tsx:127-138` holds the sentence "There is no margin prop… write `<Box m="4"><Button/></Box>`", and `DoneSwap`'s block sits between it and `export function Button`, so `dist/components/button/button.d.ts:118` declares Button bare. `api.generated.ts` prints the opaque alias `Size` 38 times, `Tone` 13, `TypeSize` 11, `Weight` 7, `Emphasis` 7 — so the one machine document this system publishes never states a single legal value, in a system whose entire claim is closed unions. `<Button variant="solid" m="4">` produces one anonymous `TS2322` over the whole props object, naming no prop and no escape. `<Card className="flex gap-4 p-6" style={{padding:16, background:"#fff"}}>` compiles clean, and the ESLint rule that would see it has been a TODO at `eslint.config.js:3` since before the first control shipped. The five sentences every component inherits are exported as `EVERYWHERE` at `markdown.ts:216` under a comment reading "One home, read by the page and by the twin", and re-inlined verbatim at `apps/docs/app/(docs)/components/[slug]/page.tsx:411-417`, where nothing imports them.

## 2. The argument

Retrieval is not the bottleneck, and no fourth document fixes it. Everything a model needs to get this system right is already written down, in one home each; what is missing is that the two channels a coding agent cannot skip — the `.d.ts` it reads out of `node_modules`, and the diagnostic it repairs from — carry almost none of it, while the channel that carries it all is a website the agent has to already be visiting. So the plan spends nothing on new content and everything on moving facts that already exist closer to the compiler, plus one honest measurement, because the claim "this makes a model write better KookieUI" is currently unfalsifiable and everything below is priced as if we do not yet know.

## 3. The plan

### 3.1 Put the doc back on the declaration, and law it against the built artefact

**Ships.** Move `button.tsx:127-138` to sit immediately above `export function Button`, and add a node law that reads `packages/ui/dist/**/*.d.ts` — never the source — asserting every symbol re-exported from `packages/ui/src/index.ts` has `*/` on the line before its `declare`. It ships red on twenty declarations, which is the point. Close them as each component is next touched, not in one sitting.

**Failure removed.** A model that opens `node_modules/@kookie-ui/react/dist/components/button/button.d.ts` — the cheapest way any agent learns an API, and the only one that needs no network and no adoption — is currently told nothing about Button, including where margin goes. The sentence exists, reads correctly to any human reviewer, and is absent from the shipped artefact.

**Single home.** Nothing is authored by the fix itself. The relocated sentence already exists in `button.tsx`. For the other nineteen, write one line each where the component lives; do **not** copy `registry.ts`'s `abstract`, and do not invert that derivation as part of this move.

**Law that fails.** `packages/ui/src/**/dts-docs.test.ts`, reading the built output, with its turbo task carrying `dependsOn: ["build"]` — the `measure` task's shape, and the guard against the 2026-08-08 "did not run is a way of not failing" finding. Falsified by re-orphaning Button's block: source-level the law passes today, artefact-level it does not.

**Cost.** Half a day for the fix and the law. The nineteen sentences are opportunistic.

**Strongest objection.** "Write 51 component docs" authors a second home for a sentence `registry.ts` already owns, and the derivation is deferred to a later move — the half-migrated state the strategy itself names as its main risk.
**Answer.** The objection is right and the move is cut to fit it. The orphan fix and the law ship alone. No abstract is copied into the package, no registry inversion is attempted, and the law is allowed to sit red — a red law naming twenty real gaps is a correct state, and this repo has shipped one deliberately before (the checkbox stacking rule).

**Does it change what a model writes?** Unknown, and measurable by move 3.7. The reach argument is solid; the efficacy is not measured.

---

### 3.2 The twin and the reference state legal values, not alias names

**Ships.** Teach `apps/docs/scripts/generate-api.ts` to emit `values: string[]` beside `type` whenever the checker resolves a prop to a finite string-literal union. `propsMarkdown` in `markdown.ts` and the reference page's cell read that one field, so the table says `"1" | "2" | "3" | "4"` where it now says `Size`.

**Failure removed.** 76 opaque alias occurrences in `api.generated.ts`. A model reading `/components/button.md` learns Button takes `size` and cannot learn whether that means `"2"`, `2`, `"md"` or `"lg"`. The values that matter most are `Tone` and `Emphasis`, where a Radix-trained model's error is not a wrong value but a different prop — so this move is correctness, not a cure for the Radix reflex, and should be described that way.

**Single home.** The TypeScript checker's answer over `packages/ui`, from the same program `resolvedPropNames()` already builds at `generate-api.ts:57-62`. No prop-to-axis map is authored.

**Law that fails.** Two. The existing `api:check` regenerate-and-compare covers the new field for free. The load-bearing one keys on the resolved **alias name**, not on the prop name and not on the values: `Size` must deep-equal `SIZES`, `Tone` must deep-equal `componentAxes.tone`, and the mapping must be total in both directions so a new alias with no axis fails red. Falsified by widening `SIZES` in `packages/ui/src/system/axes.ts` and confirming the twin goes red rather than quietly printing four values.

**Cost.** Half a day.

**Strongest objection.** "Every prop whose emitted values correspond to an axis" is either circular (correspondence by value) or wrong (correspondence by prop name — `componentAxes.size` is 1–4 and `componentAxes.typeSize` is 1–9, and `axes.ts:20` says outright that one union spans three unrelated ladders, so a name-keyed law false-reds on every `<Text size>`).
**Answer.** Correct, and the law is re-keyed to the alias name the checker already resolved. Both sides are then independent derivations of one home reached by two paths, and the falsification really does turn it red.

---

### 3.3 Refusals become types — the six a Radix-trained model actually writes

**Ships.** `packages/ui/src/system/refused.ts`: one `type Refused<M extends string> = M | undefined` and a short message per refused symbol, intersected into the prop types that would otherwise silently reject them. The `| undefined` is load-bearing — `exactOptionalPropertyTypes` makes a bare `?: M` throw a misleading `TS2375` on `prop={cond ? x : undefined}`. Scope is **six symbols**, not 218: `variant`, `color`, `highContrast`, `radius` on controls, `asChild`, and the margin row on anything that is not Box/Flex/Stack/Grid. Each carries a bare `@deprecated` for the editor strikethrough. Ship on Button and Card first, measure the diagnostic and the DOM, then widen.

**Failure removed.** Today's `TS2322` names no offending prop, no reason and no alternative, and the cheapest repair from that text is not "use `emphasis`", it is "stop passing props and use `className`" — which lands the model in the one hole nothing checks. The branded form yields one error per prop, anchored to its own column, with the escape in the message body.

**Single home.** The messages live in `refused.ts` and nowhere else. **Be honest about what this is:** it is *not* a relocation. I checked — `registry.ts` carries `variant` and `margin` and has no refusal for `color`, `highContrast`, `asChild` or `radius`, and its 46 symbol-shaped refusal names are prose keyed to nothing a type can match. So four of the six messages are new authoring, and the registry's rows are bound to them by a law asserting the two agree on the **set** of refused symbols, never on the sentence — the two audiences have incompatible constraints (`content/AUTHORING.md` binds the registry's prose; a diagnostic must be short and renders backticks literally).

**Law that fails.** Three. (a) A `tsc` fixture per symbol asserting the diagnostic **message text** contains the escape sentence — falsified by reverting one member, at which point the message reverts to "Property does not exist" and the grep fails. (b) An absence law: no `Refused<>` member may appear in `api.generated.ts`, the twin or `llms-full.txt`, or the reference starts telling agents Button has a `variant`. (c) A length cap on every message, asserted, because TypeScript truncates type display at a default length the *consumer* controls — measure that limit in the first commit rather than assuming it.

**Cost.** Two days for six symbols. Zero runtime bytes, zero CSS budget.

**Strongest objection.** Two, both real. The message string is itself a legal value: `<Button variant="KookieUI has no variant…" />` compiles, and `button.tsx` spreads `...props`, so the sentence lands as a DOM attribute. And this contradicts `ENGINEERING §1.3` verbatim — "what the system forbids is unexpressible, not warned about" — because after it, `variant` exists in `keyof ButtonProps` and appears in completion.
**Answer.** The DOM half is fixed mechanically: strip every refused key out of the rest-spread in the render path, with a mounted law asserting no refusal message reaches an element. The §1.3 half is a genuine doctrine change and gets amended in the same commit — "a refusal is unexpressible, or it carries its own reason and its escape" — because leaving §1.3 saying the opposite is the doc-code drift this repo calls a bug. The completion-visibility risk is real and unmeasured; the six-symbol scope bounds it, and 3.7 is how we find out whether it helps or hurts.

---

### 3.4 Two lint rules that can fail honestly

**Ships.** `packages/ui/src/lint/`, wired into this repo's own `eslint.config.js` over `apps/docs/examples/**` and `apps/docs/blocks/**`, discharging the TODO at `eslint.config.js:3`.

`no-refused-attribute` (error): flag `data-tone`, `data-emphasis`, `data-size`, `data-material` and siblings on any symbol imported from `@kookie-ui/react`. TSX exempts hyphenated attributes from excess-property checking, so this is a hole the compiler provably cannot see, and it re-grew the deleted `variant` axis from a call site once already (`card.tsx:99-110`).

`no-escape-abuse` (warn): flag a `style` value that is a raw hex, a raw length or a bare number **for a CSS property a Kookie prop already owns**, and flag a `className` string literal matching utility-class *grammar* (`^-?(p|px|py|m|mx|w|h|bg|text|font|flex|grid|gap|items|justify|rounded|shadow|border|space)(-|$)` plus arbitrary-value brackets). Every finding must name the token or prop that replaces it; a law forbids an under-specified message.

**Failure removed.** The highest-frequency failure and the only one with no detector anywhere. Types cannot catch it — `className` and `style` are documented escapes. Tests cannot catch it — nothing mounts a consumer's app.

**Single home.** The forbidden attribute set is computed as `data-${keys(themeAxes) ∪ keys(componentAxes)}`, never listed. The owned-property set derives from the Box prop table in `packages/ui/src/system/props.ts`. Neither authors a fact.

**Law that fails.** A derivation law asserting the rule's attribute set **equals** that union, so widening an axis without widening the rule fails CI. Plus fixture pairs where the negative controls are load-bearing: `style={{width: 240}}`, `style={{background: "var(--color-track)"}}`, `className="dashboard-header"` and `<ScrollArea style={{height:"160px"}}>` must all score zero. Falsified by deleting each detector.

**Cost.** Two to three days.

**Strongest objection.** Two of the four originally proposed detectors fire on the system's own correct code: `examples/scroll-area.tsx:5` is `height: "160px"`, and ScrollArea is the builder's one catalog exclusion *because* it requires a stated raw height; `examples/box.tsx` writes `background: "var(--color-track)"`, the sanctioned §13 escape. A lint whose first findings are on sanctioned escapes is disabled in week one, and per `THESIS §7` an escape you lint out has stopped being an escape.
**Answer.** Both detectors are cut. The raw-literal-anywhere rule is deleted; a length in a property the system does not own is the documented sizing escape, not abuse. The className rule keys on utility grammar rather than on "not `kui-`", so a consumer's own class names are untouched. The day-one run over the examples must report **zero**, and the vacuity guard is a deliberately-wrong fixture, which is what a vacuity guard is.

**Does it change what a model writes?** Partly known and partly against us: the published behaviour of agents against lint failures includes adding disable comments. The honest claim is that this reduces the leak and makes it visible in the consumer's diff, never that it prevents it.

---

### 3.5 Answer `Accept: text/markdown` on the canonical URL

**Ships.** Middleware that serves the existing twin's bytes on the canonical path when `text/markdown` **outranks** `text/html` by position and q-value — presence-matching serves markdown to browsers behind extensions. `Vary: Accept` on `PAGES` routes only. `Link: <…>; rel="alternate"; type="text/markdown"` (a relative URI-reference, which RFC 8288 permits, so no origin decision is needed) and one `<link rel="alternate">` in the docs head. No content changes at all.

**Failure removed.** Claude Code's WebFetch sends an Accept header preferring markdown, as do Cursor and OpenCode. It does not *fail* on HTML — it converts HTML to markdown with a small model — so what this buys is fidelity and tokens, not access: today a 40-row props table and a refusals list get flattened by that converter, and those are exactly the sections moves 3.2 and 3.3 improve. State the payoff that way; the "silently gets markup" framing overstates it.

**Single home.** `twinOf()` at `apps/docs/app/(docs)/page-actions.tsx:123` for the URL shape, `markdownFor()` for the body, `PAGES` for which paths have a twin. One emitter, two transports.

**Law that fails.** Three arms, because the naive one cannot fail: a source law compiling `config.matcher` and asserting it matches every `PAGES` path and no `/md/*` path (this is the arm that reddens when the matcher is deleted); a unit law over a table of **real** Accept strings including a browser's, asserting the browser string returns HTML; and a byte-equality assertion between the negotiated body and the `.md` route's. Capture the real headers in `pnpm dev` for a day and paste them into the law's fixture, so the premise is measured rather than cited.

**Cost.** One day.

**Strongest objection.** `Vary: Accept` in front of a shared cache fragments the cache key across every distinct header string, and on most edge platforms `Vary` is a request rather than a guarantee — so a docs site that is one cached object per path becomes an unbounded set, and a mis-keyed cache serves markdown to browsers at random.
**Answer.** Scope `Vary` to `PAGES` routes, mark the negotiated branch uncacheable by shared caches unless the platform is proven to key on `Accept`, and check the deployed response rather than the middleware function.

---

### 3.6 Two hygiene laws that should not wait for anything

**Ships.** (a) Delete the five verbatim strings and the duplicated intro sentence at `apps/docs/app/(docs)/components/[slug]/page.tsx:405-418` and import `EVERYWHERE` from `markdown.ts:216`. (b) A source law asserting props-first spread order across every component — the convention `card.tsx:99-110` records as the fix for the `data-*` hole, currently held by memory across 149 exports and read by no law.

**Failure removed.** (a) is a rule-1 violation sitting inside the file that makes the rule-1 argument, verified live this session, and any new machine surface makes it a third copy. (b) is a shipped defect's repair with no law.

**Single home.** `EVERYWHERE` becomes the actual single home rather than a claimed one. The spread order is read from source.

**Law that fails.** The page's rendered list must equal `EVERYWHERE`, plus a source scan asserting none of those sentences appears as a literal outside `markdown.ts` — scoped to `app/`, excluding any generated corpus. The spread-order walk is falsified by moving one component's `...props` last.

**Cost.** (a) twenty minutes. (b) two hours.

**Strongest objection.** None raised against (a) by any critic. Against (b): none either.

---

### 3.7 One measurement, recorded, never gating

**Ships.** `eval/` with 15–20 prompts as data, two arms (bare import line, versus the twin of the pages a committed exact-match retriever picks), one pinned model, k≥5 samples, and two deterministic scorers only: does it compile against `apps/docs/tsconfig.json`, and does it leak (the move 3.4 rules run as a library over the generated text). Output is one report with the error taxonomy and a per-arm distribution, written up in `docs/LOG.md` with its date and model, and re-run deliberately — not nightly, not in `ci`, not a ratchet.

**Failure removed.** Every move above is a claim about what a model writes and none of them can currently fail at that level. This is what tells us whether the branded diagnostic redirects a repair away from `className`, whether the alias expansion moves anything, and whether the whole docs surface changes output at all.

**Single home.** The compile oracle is the `tsc -p apps/docs/tsconfig.json` that already typechecks the 66 example files on every CI run. The leak scanner is move 3.4's code. The one authored artefact is the prompt list, and it is bounded: every prompt names a trap that must resolve to a live refused symbol, and a coverage law fails when one is renamed.

**Law that fails.** The scorers get vacuity guards of the shape `api.test.ts:55-61` already uses: at least one fixture must score clean and at least one must fail, so a scorer reporting nothing cannot pass. A deliberately-wrong fixture containing `className="p-4"` and `<Button variant="solid">` must go red on both scorers, naming the rule.

**Cost.** Two days plus API spend for one run.

**Strongest objection.** The original design — nightly generation, frozen fixtures, a CI ratchet in `budget.json`'s shape — was killed by three critics for one reason, and they were right: re-scoring frozen code against a changed package measures **API stability**, not docs efficacy, because a docs change moves nothing on frozen files. It would also go red on correct renames, which this repo does weekly, and the rational response to that is reflexive re-recording — the failure `budget.json` survives only because a byte count is unarguable.
**Answer.** The ratchet is gone. What is left is the one comparison that holds the model constant and isolates the surface — arm 0 against arm 2 inside a single run — reported, dated, never gating. The composition scorer, the JSX reader, the four arms, the committed corpus and the nightly are all cut with it.

**Does it change what a model writes?** This move is the only thing in the plan that answers that question, for itself and for the six above it. Until it runs, the honest position on 3.1 through 3.6 is: the reach arguments are verified, the efficacy is not.

---

### 3.8 Conditional: `requiresAncestor` in the twin

**Ships, only after 3.7.** The twin states, per component, which ancestor a part requires and which parts belong to it — `requiresAncestor` and `partOf` from `apps/docs/app/builder/catalog.ts`, and **nothing else**. Not `children`, not `slots`: those encode what the *canvas* will let a user drop, and publishing a builder-scoped restriction as a system rule is doc-code drift in the worst direction.

**Failure removed.** An orphaned `MenuItem` or `AccordionTrigger` throws out of Base UI at runtime, the compiler cannot see it, and no machine document states the rule.

**Single home.** `CATALOG`'s two fields, imported.

**Law that fails.** Not a docs law — a package browser law that **mounts** an orphaned part and asserts it throws, one per `requiresAncestor` entry. That makes the published claim falsifiable against the runtime rather than against a second data file, and it covers the five builder-excluded families for free, because their parts throw the same way.

**Cost.** Half a day plus the mount law.

**Strongest objection.** The failure class may be imagined. Models emit compound components assembled, because every training example shows them assembled; the nesting failure that actually occurs is wrong part *names* (`DropdownMenu.Item`, `TabsTrigger`), which the export list already carries. The "second-largest silent failure" claim was asserted with no measurement.
**Answer.** Accepted, which is why this is conditional and last. Run 3.7 first. If the taxonomy shows orphaned parts, ship it; if it shows mistyped part names, the budget belongs to the export vocabulary instead.

## 4. Refused, and why

**An MCP server exposing the reference, the refusals or the axes.** It is a third rendering of `registry.ts` after the HTML page and the twin, and the delivery is worse than what already ships: 55 registry entries do not fit Claude Code's 25,000-token tool-result cap (`mui/material-ui#46778` is exactly this, open and unfixed since August 2025), and tool schemas sit in context on every request whereas `/components/button.md` costs nothing until fetched. shadcn's MCP earns its place because shadcn copies source and has per-project mutable state; this package is one dependency with a closed export list. The test any future proposal must pass: does the tool *act*, and is it unreachable by Bash or fetch?

**Porting `review.ts`'s 17 house rules to consumer JSX, and the JSX→node reader that needs.** Killed by three critics on three independent grounds. `THESIS §3` reserves hard walls for the floors below the taxonomy layer, and composition is `DECISIONS §15` taste — this makes it a wall in a stranger's CI. The reader refuses spreads, `.map()`, handlers, conditionals and the consumer's own wrappers, so the denominator is selected by the parser's limits and the rules go quiet on exactly the code people write. `catalog.ts:1338`'s `EXCLUDED` removes Shell, Composer, ContextMenu, Command and ScrollArea, so app-shaped code scores green from a checker that structurally cannot see an app shell. And the proposed round-trip law — `read(serialize(doc)) === doc` over the six builder templates — is green by construction, because both sides were written against one another's vocabulary. This was the largest single line item in three of the four strategies. It is dead.

**Closing `SpaceValue` to a twelve-step union.** Verified false in the tree: `p` is not typed by `SpaceValue`. `resolve.ts:94-105` types padding by `PaddingValue` and margins by `MarginValue`, both `typeof BLEED | (string & {}) | number`, and `SpaceValue` covers the remaining rows including `width`, `height` and `maxWidth`, which `props.ts` declares `scale: null` under a comment saying there is no token scale for widths. Closing it deletes `maxWidth="34rem"` across `apps/docs/app/preview/specimens.tsx`. And `p="99"` does not silently paint nothing by accident — `resolve.ts:80` returns the raw value on purpose, with a comment saying CSS rejects it visibly and "a silent number there would be a value nobody chose". This is a written refusal, not an oversight. If Kushagra wants the row closed it is an API decision, not a repair (see §5).

**`variant?: never` as the refusal spelling.** Measured: it yields "Type 'string' is not assignable to type 'never'", which gives an agent nothing to act on and reads as though the prop exists with a bad value. `microsoft/TypeScript#13713` (custom error messages) is closed as Declined, so the string-literal carrier is the only route.

**`DELETED` re-export stubs for v1's names (`Callout`, `IconButton`, `DropdownMenu`, `Container`, `Inset`, `HoverCard`, `Skeleton`).** To make `<Callout>` print a redirect you must export `Callout` as a declared symbol, which puts thirteen Radix-shaped names into completion and into `dist/index.d.ts` — making the exact mistake more discoverable, and breaking the closed-export-list rule. Today's `TS2305: no exported member` already detects it; the missing half is the successor, and that ships as a lint rule message, which costs zero bytes.

**`AGENTS.md` in the tarball, and `kookie init` writing into a consumer's instruction file.** Measured: zero of the 522 packages installed in this repo ship an agent instruction file, because every agent's search path excludes `node_modules` — ripgrep honours `.gitignore` and `node_modules` is the canonical `.cursorignore` entry. The one surviving trigger, Claude Code reading a subdirectory instruction file after it opens a file there, fires only after the agent has already reached the `.d.ts`, which move 3.1 fixes better. And `init` is worse than useless: this repo already logged `next dev` writing an unauthored `apps/docs/CLAUDE.md` as a *defect* on 2026-08-06. Shipping a generator of unauthored instruction blocks is that defect generalised and sold.

**A generated `SKILL.md`.** Its facts are redundant by design, so its whole payload is one line telling the agent to run a checker — and Vercel's own published guidance is that framework knowledge belongs in bundled docs rather than skills, because skills cover workflows rather than lookups, measured at 79% against 100%. If the invocation line ever matters, it belongs wherever the install snippet lives.

**Growing `llms.txt`** — an `## Optional` section, per-section expansion, token headers. 97% of `llms.txt` files received zero requests in the month measured, and no major provider reads them. The existing 69-line derived index is the right size of bet.

**A `registry.json` in shadcn's shape, a prop manifest, or a DTCG token export.** The first is a distribution format for copying source (`files[].content`, `registryDependencies`, `cssVars`) and is meaningless for an installed dependency. The second is a second home for facts `index.d.ts` owns. The third is refused twice over: the preview draft dated 2026-07-30 says verbatim "Do not attempt to implement this version of the specification", and the format can say `--space-5: 16px` but cannot say "size is an index, not a measurement" — which is the class of fact a model gets wrong.

**Serving `docs/DECISIONS.md`, `LOG.md` or `THESIS.md` as machine documents.** 3,384 lines of argument in the internal vocabulary `content/AUTHORING.md` bans from reader-facing prose, containing reversed decisions and rejected alternatives stated at length. A model reading a rejected alternative as current guidance is worse than a model reading nothing.

**`robots.txt`, `sitemap.xml` and a `rel="canonical"` header.** All three need a stated production origin, and `llms.ts:13` refuses to invent one with the right reason. Move 3.5 needs no origin, because RFC 8288 permits a relative URI-reference. This is launch hygiene, not a machine surface, and it belongs on a different list.

**An LLM judge anywhere in a CI gate.** Position, verbosity and self-preference bias are systematic rather than random and grow with the quality gap. A judge in the gate is this repo's own "a law that cannot fail" defect wearing the opposite hat: a law that fails for reasons that are not about the system.

**Publishing the ESLint plugin from `packages/ui` right now.** The package is `0.0.0` and unpublished, so its only possible consumer is this repo, which already lints these rules from `eslint.config.js`. Putting a dev-tool config into a runtime exports map also collides with the `pack:check` ESM-only profile, since flat configs are routinely `require()`d. Add the export the day the package publishes, not before.

## 5. Open questions for Kushagra

**Does `ENGINEERING §1.3` change?** Today it says a refusal is unexpressible, not warned about. Move 3.3 makes six refusals expressible so they can carry a reason. *Recommendation: change it, in the same commit as the first branded prop.* The doctrine was written when the only reader was a human, and it costs a model the sentence that would have redirected it. If you would rather keep §1.3 whole, move 3.3 dies and moves 3.1 and 3.4 carry the plan.

**Does the package ship bundled markdown docs in `dist/`, and if so, how does anyone learn they are there?** Vercel reports 100% eval pass with version-matched docs bundled at `node_modules/next/dist/docs/` against 79% for skill-based retrieval — the strongest published number in the entire survey. But Next writes its pointer from `next dev`, a command every consumer runs, and KookieUI owns no command in the consumer's loop; pnpm 10 blocks lifecycle scripts by default. *Recommendation: defer until 3.7 runs, then revisit with the number in hand.* The one honest pointer we have is the README install snippet, which a human copies at install time, and that is a weak channel to build a mirror for. This is the biggest unresolved bet in the plan and the critics split on it.

**Does a raw length stay legal on `p` and `gap`?** `resolve.ts` deliberately admits `p="16px"` so opting out of the system is at least visible. Keeping it means the space rows can never be a closed union, which is one honest exception to "closed unions" that nothing currently states in writing. *Recommendation: keep the escape and write it down as a refusal with its reason,* rather than closing the row — the escape is used, and an undocumented exception is worse than a documented one.

**Do the two lint rules ship as `warn` or `error` in this repo?** *Recommendation: `no-refused-attribute` as error, `no-escape-abuse` as warn.* The first guards a hole with no legitimate use. The second sits on top of two documented escapes, and per `THESIS §7` a grudging escape hatch is policing with extra steps.

**Is there a production origin for the docs site?** Not needed by anything in this plan, and needed by sitemap, canonical and any artefact that ships a URL. *Recommendation: decide it once at launch, in one home, or state the absence as a refusal with its reason* — do not let a later artefact mint it as a side effect.

## 6. What week one is

Day one is the twenty-minute fix and the free law: delete the inlined `EVERYWHERE` copy at `components/[slug]/page.tsx:411-417`, import it, and add the two arms that keep it closed. Then the orphan fix and the built-`.d.ts` law, which ships red on twenty declarations and names every one of them.

Days two and three are the alias expansion — `values` emitted from the checker, read by both the reference page and the twin, held by the alias-keyed agreement law against `componentAxes`. That closes the largest content hole in the machine surface and it authors nothing.

Days four and five are the measurement, cut to its smallest useful form: fifteen prompts, two arms, one pinned model, compile plus a thirty-line leak scan, written up in `LOG.md`. It runs *before* the branded refusal types and before the lint plugin, because it is the only instrument that can tell us which of the two matters more, and because both of those are days of work justified by a failure mode nobody here has measured.

The visible win at the end of the week is a component reference and a markdown twin that state `"1" | "2" | "3" | "4"` instead of `Size`, a `.d.ts` that tells a model where margin goes on the component it is about to write, and one honest number saying whether any of it moved what a model writes.
---

## 7. Corrections after the completeness critique

The plan above is the synthesis. A completeness critic then read it against the research and
found ten gaps. Six are material and change the plan; they are listed here rather than edited
into the text above, so the original argument and the objection to it both stay readable.

**a. The measurement cannot measure the two moves it is scheduled to arbitrate (critic 1).**
Both arms of 3.7 vary the *twin*. Generation is single-shot, so a branded diagnostic acts only
on a repair turn and a `.d.ts` acts only if the agent opens `node_modules` — neither is visible
to the instrument. 3.7 needs a repair turn (compile, feed the real `tsc` text back, re-score)
and an arm that varies the package with the docs held constant, or it answers no question any
move asks. This also breaks week one: 3.7 cannot sit before 3.3 until that is fixed.

**b. The ESLint plugin is withheld on the one objection ruled out of bounds (critic 5).**
"The package is `0.0.0` and unpublished" is exactly the premature-at-launch argument the scope
correction forbids. These are mechanical AST checks with no parser-limits problem, and the
largest measured failure — avoiding the system through `className` and `style` — lands entirely
in consumer code. Ship `@kookie-ui/react/eslint` and price it into `pack:check` now.

**c. A permanently-red law is not a law (critic 6).** 3.1 ships red on twenty declarations in a
repo whose rule is `pnpm run ci` before claiming anything done. Ship it as a ratchet with the
twenty recorded in a file that may only shrink — `budget.json`'s shape, which this repo trusts.

**d. 3.2's law cannot be shipped as written (critic 8).** Totality in both directions false-reds
on `RadiusLevel`, `ShellPresentation`, `TextFieldType` and every finite union that is not an
axis, and the obvious repair is an authored allowlist — a second home. Assert one direction
only: every name in `componentAxes`/`themeAxes` must resolve to an alias whose values deep-equal
it. Non-axis unions print their values unbound.

**e. The Radix reflex is scoped to six control props and misses the three shapes a model emits
first (critic 2).** Verified in the tree this session:

- `<Theme accentColor="blue" scaling="95%" />` — anonymous `TS2322` naming neither prop, and
  `Theme` is the first thing a model writes. `accentColor` is already a recorded refusal.
- `<Tabs.Root>` / `<DropdownMenu.Trigger>` — `TS2339: Property 'Root' does not exist`, which names
  the mistake but not the flat export that replaces it. There are 63 flat exports and no
  namespace objects.
- `as` on Text and Heading, where this system uses `render`.

Derive the branded set from v1's props plus Radix Themes' own `<Theme>` props rather than a
hand-picked six, and have the lint rule flag the member-expression call shape by name.

**f. Nothing detects a missing stylesheet import (critic 4).** Perfect JSX without
`import "@kookie-ui/react/styles.css"` renders an unstyled app with zero diagnostics — the only
failure that produces nothing at all. A dev-only Theme warning that reads a sentinel token off
its own mounted element and names the import when it resolves empty. This package already ships
seven warnings of that genre.

Two further critic items are judged correct but smaller: the composition rules' `why` sentences
could ride into the JSDoc of the prop each governs, with an agreement law (critic 3); and
3.6(b)'s source scan should be a mounted law that renders every component with hostile
`data-tone`/`data-emphasis`/`data-size` and asserts the resolved attribute is the component's own,
because source order does not prove an attribute cannot reach the DOM (critic 7).

## 8. What was verified by hand, not taken on an agent's word

Every load-bearing factual claim below was re-measured in this tree before the plan was accepted.

- `packages/ui/dist/components/button/button.d.ts:118` declares `Button` with no doc comment.
  The sentence naming the margin escape sits at `button.tsx:127-138` and is orphaned by
  `DoneSwap`'s block, which stands between it and the export.
- 24 exported declarations in `dist/**/*.d.ts` carry no doc: Button, the Menu family,
  `SelectContent`, `PopoverContent`, `TooltipContent`, all five Toolbar parts, `useTheme`.
- `api.generated.ts` prints the opaque aliases `Size` 38 times, `Tone` 13, `TypeSize` 11,
  `Weight` 7 and `Emphasis` 7. It never states a legal value.
- `<Button variant="solid" m="4">` produces one anonymous `TS2322` over the whole props object,
  naming no prop and no escape. `<Card className="flex gap-4 p-6" style={{padding:16}}>`
  compiles clean.
- The ESLint TODO at `eslint.config.js:3` is still open.
- The five `EVERYWHERE` sentences at `markdown.ts:216` are re-inlined verbatim at
  `components/[slug]/page.tsx:411-417`, under a comment claiming one home.
- KookieUI v1 is published as `@kushagradhawan/kookie-ui@0.3.22`, ~401 downloads last month —
  too small to be memorised. The corpus risk is Radix Themes, which v1 forked.
