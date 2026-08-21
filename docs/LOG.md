# LOG

Living decision log. Newest first. Each entry: what, why, date, alternatives rejected.

This is the *why* behind the history, not a changelog: git is the changelog. `DECISIONS.md` says what the system is now; this says how it got there and what was turned down on the way, so a later reader cannot quietly re-litigate a settled question or re-try a dead end. (Naming differs from the site repo on purpose: there `DECISIONS.md` is the log, here it is the standing spec and the log is this file.)

Write an entry when a choice was genuinely open and got closed: a reversal, a measurement that moved a decision, a constraint the code cannot show, a rejected alternative worth staying rejected. Do not write one for tuning or for new code that is simply new.

---

## 2026-08-21 A driver gesture resolving is not the browser having settled

**What.** Eight laws read a state in the statement immediately after `userEvent.click/hover/tab`. They wait for that state now. One of them was red on main (`the click must have opened it: expected null not to be null`); the other seven are the same shape found by scanning for it rather than by waiting for CI to name them one per run.

**Why it is a defect even where it has never failed.** `data-popup-open` is React state Base UI commits in a render; the popup count is a mount; `:hover` is the browser's answer to a pointer that may still be covered. A driver gesture RESOLVING is not any of those having happened — asserting on the next line asserts that the effect is SYNCHRONOUS, which is a claim about the machine. The dialog law said so in its own comment ("the open is React state, and a synchronous DOM click leaves the assertion running before the commit") and then asserted immediately anyway, which is the whole genus in one law.

**Found by scanning, not by attrition.** Every red run this week produced exactly one member of this class, each fix revealing the next. The scan is mechanical — a gesture followed by an `expect` reading `getAttribute`/`querySelector`/`matches`/`activeElement`/`isConnected` — and it found all eight in one pass. Converting costs one line each and loses nothing: a state that never arrives expires the deadline into the same assertion, with the same value in the message.

**One candidate was deliberately NOT converted.** The alert's "an outside press did not close it" asserts a NON-event, and waiting for a non-event is backwards — a slow machine makes that law pass more easily, never less, so the wait would only delay a correct answer. Its strength comes from its negative control (the same press closes an ordinary Dialog), not from timing.

**Falsified**: a menu pinned closed fails the repaired law at the deadline with the honest null.

---
## 2026-08-21 The docs became a guideline document, and the writing audited the system

Kushagra: *"What I want to create is very close to HIG by Apple. Thats what Kookie is, its not just a UI library."*

The old site was a scaffold: a component registry, three instruments, and a home page. It could not state the system's content, which is a taxonomy and a set of decisions. Both already existed in `THESIS.md` and `DECISIONS.md`. Neither was published. So this work is mostly publication. The voice changes from descriptive to normative. THESIS §3 already asked for this and called it "teach relentlessly; enforce lightly". The published system did the opposite.

**A guideline document here still needs a reference.** Apple can ship a code-free HIG because developer.apple.com exists beside it. This project has no second site, no third-party tutorials and no Stack Overflow corpus. A guideline document with no reference documents a product nobody can install. So the reference stays and moves below the guidance. Refusals sit above the generated props table. A missing prop and a refused prop look the same in an API dump.

**MDX ships as a loader, not a framework.** The compiler is hard, settled and appearance-free, which is the Base UI test. A documentation framework adds a navigation tree, a table of contents, prev/next links and a content watcher. Each of those is small and we understand it. So `fumadocs-core` is refused and the compiler is taken.

**The syntax theme is generated from the ten tone families.** Shiki emits `var(--kd-code-token-*)`, and `prose.css` binds each name to a `--{tone}-ink` value. Those values are solved against contrast targets (§15, 2026-08-10). A stock highlight theme would be a second colour system inside the first, and the only text on the site held to no target. The theme drops bold and keeps italic, because the package refuses bold.

**Chapter metadata lives in TypeScript, not frontmatter.** Chapter order must be authored, so a registry exists in either case. Frontmatter beside it would be a second home for the same fields. TypeScript also checks it: `tsc` caught a documented `accentColor` prop that never existed. This decision removes `content-collections` and three related packages.

**Examples are real files.** The 31 inline specimens moved to `examples/<slug>.tsx`. The page imports each file and renders it, and reads the same file and shows the source. **Rejected: builder documents as the only source.** The builder's serializer produces JSX under a round-trip law, so it was the tempting mechanism. A builder document cannot express a handler, controlled state or an import. A documentation system built on it could never show a form that submits. Files are the base. The builder is the upgrade where the grammar fits.

The move also made the registry pure data, so `registry.test.ts` imports the values instead of parsing the source. A regex over source can only fail by finding nothing, and finding nothing is how a coverage law passes while covering nothing.

**The API tables generate from the types**, with a drift law on the `tokens.css` pattern: regenerate, compare, and never write during `build`. The table shows only DECLARED props. Expanding the full type gives 324 names for `FlexProps`. The AGREEMENT law uses the checker's full answer instead. A prop can be real and absent from the declared list: `gap` comes from Box's shared table, `rows` from the platform. The first spelling checked the displayed list and failed on eight correct sentences.

**One remark plugin ships.** GFM makes `| a | b |` a table. Without it the colour chapter's table compiled to literal pipes, which it did for an hour. Highlighting does not ride a plugin: Turbopack requires JSON-serializable plugin options, and a theme built from tones is an object. `mdx-components.tsx` maps `pre` to the CodeBlock instead, so prose fences and example sources highlight through one function. The plugin is configured in two files, so it owes an agreement law. It has one.

**Search is ours, not Pagefind.** Pagefind builds a BM25 index over rendered HTML and is better for a large site. It needs a post-build crawl and somewhere to serve the index. This site has about fifty pages and already holds its content as data. The index also covers the REFUSALS: "why can I not set a margin" is a real search, and the answer is a refusal. Recorded as replaceable.

**Three prose components do not exist:** a list, an inline `Link` (§11 planned one), and a static table. `prose.css` draws all three from public tokens. Each rule is small enough to delete when the component ships.

**The site moved into `Shell`**, its second real consumer. The nav uses `ShellNavGroup` and `ShellNavItem` plus one docs-local block: a collapsible group standing in for the tree the package will ship (Kushagra: *"kookie will ship a tree too, not today"*). It takes a label and children, so the migration is a deletion.

**The composition chapter renders the reviewer's real rules** from `RULES`, the array the builder runs over a live document. The rules existed in two registers, prose and checks, which drift in both directions. Now a rule added to the linter reaches the page the same day.

**The writing audited the system.** 47 exported props had no JSDoc, and they were the most central: `size`, `tone`, `emphasis`, `weight`, and the controlled-state trios. Less important props beside them carried careful comments. The law that caught them then turned out to walk registry ROOTS only, which hid 64 more on the compound parts. A law narrower than its rule cannot fail. Doc-code drift was found and fixed in `DECISIONS.md` §3, §4, §6, §7, §8, §9, §10 and §11.

**Two of my decisions were wrong first.** The site organised itself as `/components/<name>`, which is names-first: THESIS §2's stated inversion, applied to the system's own documentation by the author quoting it. And the chapter measure sat in the chrome, which is right for a chapter and wrong for the two other page shapes, so a third of the window stayed empty on every page.

**The first draft's language was wrong, and Kushagra rejected it** (*"like bro what is it"*). It used metaphor, filler and the passive voice. Every chapter was rewritten to ASD-STE100 Simplified Technical English: active voice, short sentences, literal vocabulary, no metaphor. `content/AUTHORING.md` now states those rules, so later chapters follow them.

## 2026-08-21 The dialog took four props and threw the rest away

Four findings from the Dialog audit, and they turned out to be one mistake with four faces.

**The wrapper declared what it wanted and dropped everything else, silently.** `DialogContent` took `children`, `className`, `style` and `ref`. I passed `id`, `aria-label`, `data-testid` and an `onKeyDown`: none of them reached the element, and none of them failed to type-check. The Select audit found the same shape in 2026-08-09 (a blocked `id`), and Menu's before that; this is its third home, and the reason it keeps coming back is that a hand-written prop list reads like a design decision when it is usually just what the author happened to need that day.

**Its second victim was the accessible name.** A dialog with no `DialogTitle` has `aria-labelledby` null and `aria-label` null, so a screen reader announces "dialog" and stops — and the obvious repair, `aria-label` on the panel, was accepted by the types and discarded. So a name was unreachable by BOTH routes at once, which is the only reason nobody had noticed one of them was missing. Both halves ship together: the prop reaches the element, and a dev build warns when neither is there. Warning, not a thrown error — a name is an accessibility obligation, not a structural one, and a half-built dialog in a scratch file should still render. The check reads the DOM rather than the props, because the name can arrive by either route and the element is the only place both answers are visible.

**`onOpenChange` was `(open: boolean) => void`, so a dialog could be told it closed and never why.** That makes the guard every form dialog owes — "you have unsaved changes, are you sure?" — impossible to write at all, and Base UI had been handing us both the reason and a `cancel()` the whole time. The second argument is now `{ reason, event, cancel }`. Two choices inside that: the reason STRINGS are Base UI's own (`escape-key`, `outside-press`, `close-press`…) rather than translated, because they are already plain and a mapping table would be a second home for one fact plus a way to drift; but the TYPE is declared here, so the API is the package's. The rename risk that creates is answered by the laws, which provoke a real Escape, a real outside press and a real close press and read the string back — never a table.

**And content wider than the panel was being deleted, which was one day old and mine.** A pane clips since `m="bleed"` shipped, so an overflow stopped being a visible spill and became a silent removal: measured in a size-2 dialog, an ordinary share link at 481px inside a 440px panel, a 12-column table at 718, a `<pre>` at 952 — no bar, no spill, no error. The synthetic 2000px box in the first audit made this look like a corner case; the realistic content showed it is not.

Two halves, and only one of them is a fix. Text that CAN wrap now does — `overflow-wrap: break-word` on the Theme root, which inherits, so one declaration covers a component's text, a call site's text and a portal's own bare Theme. **`break-word` and not `anywhere`**, and that is a measurement rather than a preference: `anywhere` also lets a long word shrink an element's min-content width, which would quietly change how every flex and grid item in the library is sized, while `break-word` breaks at paint and leaves every measurement alone. Both were tested; both fix the link.

What is left is content that must not wrap, and there the system's answer is a ScrollArea — which works as of the same day. So a **dev warning** ships on the three panes that hold content a call site wrote (Card, Surface, Dialog), naming the overflow and the fix. **Rejected: making the panel scroll sideways.** CSS resolves `overflow-x: auto` beside a clipped `overflow-y` to `hidden`, and hidden is a scroll container — the exact thing the flight rules spent two days keeping panes out of, and the reason a select's panel once slid its own contents under a growing frame. The pane keeps its clip and the author gets told.

**One mechanism finding, caught by the suite rather than by reasoning.** The clip warning's first spelling measured inside its own `ResizeObserver` callback, and Chromium answers that with "ResizeObserver loop completed with undelivered notifications" — which the browser project reports as a page error. Measured: zero on clean HEAD, one per run with the inline read, zero again with the measurement moved into a frame. Box's observer never hit it because it watches only the handful of boxes that opted into containment; this one watches every card.

Eight sabotage passes, all caught — including the two that matter most: spreading the call site's props AFTER the system's identity (a call site could then take `data-size`), and letting the name warning ignore `aria-label` (it would fire forever on a correctly labelled dialog). +25 bytes, baseline re-recorded 30988.

---

## 2026-08-21 A pane with neighbours had no column, and the dialog had no reach

The Dialog audit's own leftover, opened as "should we go back to dialog now, card is finally complete?" — and the answer was that Card was not.

**Two measurements, one shape.** A dialog stating `height: 400px`, holding a title, a `ScrollArea` and a Save button, computed a 1440px viewport that was never a scroll container, put the Save button at y=1705 and let `overflow: clip` delete it. The record from 2026-08-20 said the fixed-height case *worked* and only the responsive one failed; that was measured with the height on the SCROLLER, and with it on the PANEL both spellings fail. Then the same fixture on a plain `Card` failed identically — 1440px viewport in a 300px pane, button outside it — which is what turned a dialog bug into a surface-layer one.

**The cause in the pane is that `flex: 1` is inert in a block container.** Every sibling law in the suite mounts `render={<Stack gap="4"/>}`, which is already a column, so the fixture could not tell a working rule from a dead one — the degenerate-fixture lesson (2026-08-20) for the ninth time, and the tenth is that surfaces.css's own head comment NAMED the gap ("what is unguarded is only the sibling case, which needs a flex column for the scroller to take the remaining height at all") and shipped without closing it. DECISIONS had the same fact written as a design: "a header/list/footer panel adds only `render={<Stack gap/>}`". That is a workaround transcribed as an API.

**The fix is `:not(.kui-box)`, and the scope is the whole argument.** The system supplies a column only where the call site stated NO layout. A pane that is a Box said what it wanted: a column already works, and a row or grid is the arrangement surfaces.css records as unsupported — supplying a column there would silently contradict the call site's own word, which is worse than the limit. This does not repeat the `.kui-stack` refusal from the day before: that was rejected for excluding a hand-written `<Box display="flex" direction="column">` on spelling, and this asks whether anyone chose at all, which puts the hand-written Box on the same side as the `<Flex>` one.

**The cause in the dialog is one box, and it is named rather than generalised.** `.kui-dialog-body` exists only so the entry can blur the content (§24) and it stands between the pane and the caller's children, so every rule in the scroll block — each asking about a direct child — stopped at it. The body is now a column when it holds a scroller, and the six member rules read `:is(.kui-surface, .kui-dialog-body)`. It stays a name because it is the only such box in the library: Menu and Select put their scroller OUTSIDE the flying body, and AlertDialog owns its content and holds no scroller. A general "system-inserted wrapper" class would be one home for a fact with one consumer.

**Rejected:** `display: contents` on the body (kills the blur, which is the only reason the box exists, and would not make the structural selectors match anyway); duplicating the six rules into dialog.css under the second-member-self-keys rule (the bleed arithmetic would then have two homes for one consumer); and `.kui-surface > * > .kui-scroll-area` (it would catch a wrapper div a call site wrote, which is content, not the pane's content box).

**Left open on purpose:** whether a dialog holding a scroller should cap itself at the window. Uncapped it grows and the dialog's own viewport scrolls it, which is §24's design and right for every dialog without a scroller; with one inside, that is two scrolling surfaces and every peer caps. A default cap changes every dialog, so it is a design call, not a repair.

Six laws, six sabotage passes — including the two that matter most: deleting `:not(.kui-box)` (a stated row silently became a column) and dropping the body's scoping `:has()` (a dialog with no scroller became a flex column, which is the shatter risk this scope exists for). +49 bytes, baseline re-recorded 30963.

---

## 2026-08-21 Size 2 is the baseline, and the builder was quietly arguing otherwise

Two things closed at once, and only one of them was the wiring.

**The wiring.** The Shell gained a root `size` the day before precisely so an app states its navigation index once (#18, itself from this port). The builder — the consumer that motivated it — went on saying `size="1"` three separate times, on the rail, the sidebar and the inspector. A tool built and never picked up by the call site that asked for it.

**The index.** Kushagra, closing it: *"anything system default should use size 2 as default, that's our baseline."* So the fix is not `<Shell size="1">` with the literal in one place instead of three — it is no literal at all. The panes take the system's baseline, and stating `size="2"` here would be a second home for a number whose one home is the component's own default.

I had picked 1 because the editor's own controls are size 1 throughout, and read the panes as part of that chrome. They are not: a pane's `size` prices its NAV ROWS and its rail squares, which are navigation, not instruments. Measured, the correction is visible and it is an improvement — the rail's squares go 24 → 32 in a column 37 → 41, and the cramped look I had noted in the first screenshot and not acted on was this.

**And then the same day, the rest of it** (Kushagra: *"other than helper text, we should assume size 2 as default"*). The ~96 remaining `size="1"` sites across the editor's own chrome are swept: every button, field, menu, tab strip and label takes the baseline, and **helper text is the one carve-out** — a standalone explanatory sentence, or a diagnostic, stays at 1. Fourteen sites qualified and were named individually rather than matched by a pattern, because the obvious pattern (quiet ink) mis-classifies in both directions: the breadcrumb's `›` separator and its "Nothing selected" placeholder are quiet and belong with the controls they sit among, and the Theme panel's one explanatory line is medium and is helper text all the same.

**Two mechanics worth stating, both of which a blind sweep gets wrong.** A CONTROL drops the prop, because 2 is what Button, TextField, TabsList, Menu and Select already default to and re-stating a default is a second home for it. A `<Text>` must state `size="2"`, because Text anchors at **3** — dropping it there would have jumped every label two rungs, not settled it at the baseline. Kbd is a third case again: it has no default at all by design, so it drops the prop and inherits the line it sits in.

**And the export dialog's code well was a Card standing in for a ground** (Kushagra, same day). It is a `Surface` now — the pair's own sentence is that a Card is an object and a Surface is a ground, and the component's doc names this exact shape, *"a bed inside a card that holds something quieter"*. Measured after the swap: no cast, its own fill, the family-less hairline, and a corner inside the dialog's (77.4 against 90.3). This is the drift Surface was minted to stop, found in the builder for the second time — the canvas page was the first — and worth recording because both times the call site had reached for the only container that existed.

**Two boxes grew, and the argument is the same one both times: the content got bigger, so the box that holds it does.** The palette's longest name clipped by exactly 20px per column at the new index, so the sidebar goes 272 → 320 (measured against every pane afterwards: nothing clipped anywhere). And the export dialog goes size 3 → 4, because its code block is a `<pre>` that must not wrap and its longest line — the import — got 20% wider; at 720 the body fits and only the import still scrolls, which is what code does.

---

## 2026-08-20 Stillness is not arrival — and a borrowed clock has to be given back

**What.** `catchDissolve` hands back a `release()`, the two "a reopen that lands mid-dissolve is CAUGHT" laws call it the moment they take the dismissal back, and both then wait for the panel to REACH the box it left rather than for the box to stop moving.

**Why.** That law failed on main twice with the same shape — `expected 3.171875 to be less than 2`, then `3.109375` — and both numbers are 1% of the panel, which is the exit's own `scale: 0.99`. The recovery had not happened at all. **Holding a clock is borrowing it**: `catchDissolve` pauses the exit's animations to hold the window open, and a paused transition goes on rendering its held value, so a panel whose exit was seized can sit a percent small indefinitely if the browser's retarget does not displace it. Locally it always did (measured after the fix's first draft: `scale: none`, width exact, no animations left), which is why this only ever appeared on CI.

**The deeper error was mine, and it is worth more than the repair.** The first fix for that failure waited for "three consecutive still frames", reasoning that the spring needed outlasting. **Stillness cannot tell a box that has ARRIVED from a box that is STUCK** — and a paused transition is perfectly still. So the wait passed instantly on precisely the broken state it was written to outlast, and the law failed a second time with a nearly identical number. A wait must name the DESTINATION when the destination is what the claim is about; a recovery that never arrives then expires the deadline into the same assertion, with the honest number in the message.

**Both laws falsified after the change** (restore the replay branch in floating.tsx): `the reopen must catch the box where it is: 388px -> 66px`, and the alert on its flight arrangement. Green under CPU load and at `KUI_STALL=20`.

---
## 2026-08-20 A law that must catch a MOMENT does not run where the clock is not ours

**What.** `watchesFrames` (test/browser.tsx) excludes five laws from CI — the ones whose claim depends on WHEN they look. They still run in the `pnpm run ci` a human owes before pushing, the set is pinned by `src/test/frames.test.ts` in both directions, and vitest prints the skip count on the CI run itself.

**Why, and it is Kushagra's call: *"lets remove the core cause, dont test animations on ci machine"*.** Four rounds of instrument work in one day — every instant derived from the runner, three separate clock seizures (`sweep`, `catchDissolve`, `seizeFlight`), observers armed before the gesture — and CI went red on a *different* law each round, 15 of 21 runs, with the components correct every single time. Each fix was right and each one only revealed the next-most-fragile law. That is not a bug being closed; it is a class being enumerated one CI run at a time, and the cost is a red CI that everyone learns to read as noise. A test that cries wolf does not protect the code.

**The residue is genuinely wall time, and a measurement settled it.** What the seizures could not reach is a subject that IS wall time — floating-ui converges in a loop that is not an Animation, a release timer fires, the browser restores a scroll offset. A 20x CPU throttle (`KUI_STALL=20`, new, over CDP) reproduces **none** of the CI failures: the flight laws pass at 20x and only two 24-cell loops time out. So the failure mode is not slowness at all — it is *bursty* scheduling landing inside a specific window, which is exactly what a shared runner does and exactly what no bound can defend against. That measurement is why this is a structural fix and not another rewrite.

**The criterion is narrow on purpose.** The marker is for a claim that depends on when it looks: a transient state the law must be looking at while it exists, or a series it samples as the animation runs. It is NOT "the subject animates" — 47 laws call `inMotion()` and almost all read DECLARATIONS (the transition list, the baked spring curve, which clock a channel is on), which persist and are as true on a starved machine as an idle one. Those stay on CI, where they belong. The five excluded: the release seam (×2 arms), the submenu's aimed-seed frame, the dismissal taken back mid-flight, the select flight-width agreement, and the entry's page-scroll sampler.

**Two clauses keep this from becoming the defect it resembles.** "Did not run" is this repo's own favourite way of not failing (`docs:test` cache hit; turbo's filtered env starving the browser project — both green ticks over nothing). So: **reach for an instrument before the marker**, and **an excluded law owes CI whatever half of it is static**. The seam's defect is a difference between two states, not an event — the body under the flight's pin against the body in flow — so it is now read on a landed panel with the clocks pinned off, and it fails at exactly one padding (4px) against the original bug. The real-time twin keeps only what a static read cannot see.

**Rejected: de-jank the runner instead** (split `docs:build` off the browser tests so they stop sharing two cores). It lowers the frequency and removes no case — a shared VM can always stall past a window, and there is no bound. Worth doing on its own merits; never as the fix. **Rejected: excluding by `inMotion()`**, the marker that already exists — it is 47 laws, most of them deterministic, so it would trade a real flake for a large and silent coverage loss. **Rejected: a nightly job running them on the same CI machines** — the same machine class produces the same non-determinism, one alerting surface further from anyone who would act on it.

**Three things were caught by running this rather than reasoning about it.** The static seam law's first draft let the panel size itself, and the pin takes the body out of flow — it collapsed 215px to nothing, which is *why* the flight sizes the panel from its measurement, so the law now supplies `--kui-fly-w/h` exactly as the runner does. Its second draft drove the alignment by collision, which a landed panel does not reproduce ('start' where a pressed one resolves 'end'), so the arms are stamped instead. And its third draft claimed the end arm's inline edge, which is the POSITIONER's answer and not reproducible from a hand-stamped state — the claim is withdrawn to the block axis (arm-independent, and where the padding defect bit) with the end arm's inline behaviour left to the two laws that can see it honestly. **The set-pinning law caught a bug in itself**, too: its extractor's character class stopped at the apostrophe in "the panel's own contents", so a correctly marked law was recorded under a truncated title and the two directions disagreed. The quote is matched by backreference now — an extractor is an instrument, and an instrument is calibrated before its output is evidence.

---
## 2026-08-20 A flight is seized by its clocks — except where its subject is a wall-time loop

The first green merge did not hold: the next two main runs each surfaced another member of the same rotation, all in `menu.browser.test.tsx`'s flight laws, all rAF samplers. Two failures, three laws rewritten, and one instrument boundary discovered by being on the wrong side of it.

**`seizeFlight` (menu.browser.test.tsx): the flight is stepped, not sampled.** Armed before the press, it pauses every animation under the panel in the microtask the pose comes off — the depart edge — and steps them TOGETHER through forty-one stations of the engine's own rendering. The upward-containment law (CI: "the flight was never sampled: expected 4 to be greater than 6" — four frames is all a loaded runner painted, and the minimum-sample calibration failed honestly on a sound flight) and the end-aligned content law take it; both make RELATIVE claims — body inside panel, body against the panel's own edge — which survive what the seizure cannot reproduce. Falsified: a content-sized containing block under flight fails containment ("panel 60px held only 13px of its 59px body"), a deleted end pin fails the drift law with the full station series in the message. The containment law's ORIGINAL sabotage (delete the scroll-area stretch) went dead the same day it was written — main's scroll-region work now sizes the scroll area a second way — so the falsification target moved to the mechanism itself.

**And the release-seam law is deliberately NOT seized, because its subject includes a clock the seizure cannot step.** Fast-forwarding the springs renders the finished box under an EARLY placement — floating-ui's positioning is a wall-time loop that converges across the real flight, and it is not an Animation — measured as a 1-2px phantom jump, mirrored by alignment, in a state the browser never paints. The old law's own numbers proved the phantom (its before and after both read the converged position). So `before` is now a PROVEN-STILL flying frame: the natural end plateau — springs done, floating-ui converged, the strip a margin away — established the way the reopen law proves rest, three identical frames with the flight attribute still on. If the strip beats the proof, the GESTURE is re-run rather than asserted on a stale pair (CI: "it jumped vertically: expected 27.816 to be less than 1" — 27.8px of legitimate travel between two samples ~200ms apart); a seam that genuinely jumps fails on the first proven pair however many openings that takes, and three misses is an instrument failure that says so by name. Falsified: an 8px pin skew fails both alignments at exactly 8.

**The boundary, stated.** A clock seizure owns everything the engine renders FROM those clocks — sizes, poses, relative anatomy — and nothing that converges in wall time beside them. A claim whose subject includes a wall-time mechanism (a positioner, a timer's strip) must let real time deliver the state it asserts about, and prove that state by measurement (stillness, an edge) rather than by catching frames.

---

---

## 2026-08-20 The builder moves into the Shell, and the frame's hiding mechanism turns out to be dead

The builder shipped its own app frame — a `100dvh` flex column holding a top bar, three fixed-width boxes and four Separators — for the ordinary reason that it was written before the system had one. The Shell landed hours later. Porting it is the same argument the docs refused a docs framework with, and it does not get weaker for the parts that are "just editor chrome": the builder's whole claim is that this system composes, so a builder whose own frame is hand-rolled is arguing the opposite in the place it is loudest.

**What the mapping cost: nothing, which is the point.** Header, sidebar (272), content, inspector (304) each map onto a pane; the panes tile with one hairline per seam, so four `Separator`s and three width boxes are deleted. What the port BUYS, none of it written here: `<main>`, two named `<nav>`s and an `<aside>` as real landmarks instead of divs; the jump bar pinning itself because a `ShellScroll` beside it makes the pane a column; and a phone posture the app never had — the nav columns rest closed under 48rem, resolved in CSS at first paint.

**The Add/Layers strip became the rail, on the Shell's own sentence.** "The rail picks, the sidebar shows what was picked" is exactly what that two-tab strip did. Each square is a `ShellTrigger` with `action="open"` as well as a switch, because picking a region the sidebar is not showing must show it — the dead-control problem the same day's `armed` work named, answered structurally rather than by hiding the button. One list (`LEFT_REGIONS`) feeds the squares and the panel switch, and the panel's last arm is narrowed to `never`, so a third region without a panel fails `tsc` rather than silently showing the second one.

**Preview stopped unmounting the panels.** It was `{!preview ? … : null}` around each side pane, which threw away the panel's React state and scroll position along with its pixels; it is `open` now, so the pane closes and keeps everything. The prop is SPREAD — `{...(preview ? { open: false } : {})}` — and the type is what said so: `exactOptionalPropertyTypes` refuses an explicit `undefined`, which is the API stating that saying nothing and saying "I don't know" are different. Out of preview the nav panes are uncontrolled and keep the CSS-resolved `auto`; passing `!preview` would have frozen the sidebar open on a phone and killed the responsive default outright.

**The inspector is controlled where the sidebar is not, and the asymmetry is the Shell read straight.** A nav column's `auto` means "open on a roomy window", which is what this app wants; an inspector's `auto` means "closed until asked for", which is what it does not. So the one pane whose responsive default says nothing useful states its own — `null` for untouched, resolving through `useWindowClass()`, pinned by the first toggle. Measured before that existed: the builder opened on a 600px window with the inspector overlaying half the screen and a scrim over the canvas. **Recorded open**: this is a third resting rule the library does not offer, and the honest library answer is an inspector whose `auto` an app can mean. It lives in the app until a second consumer wants it.

**Rejected: leaving the frame alone and taking only the parts.** `ShellScroll` and the pane dress would have fixed the jump bar and the seams, and left the landmark question, the phone posture and four Separators exactly where they were — the cheap half of the port with none of the reason for it.

**Rejected: keeping the Add/Layers tabs and adding no rail.** Defensible as a smaller change, and it keeps a 37px column of screen. It also leaves the builder unable to switch regions while the sidebar is closed, and leaves the one component in the library nobody composes with unexercised by the app whose job is to exercise the library.

### And the frame could not hide a pane

Porting it found a defect in the Shell that all 46 of its laws were green through, and the finding is worth more than the port. **A pane holding the recommended anatomy could not be closed at all.**

Measured, on the composition the JSDoc tells people to write: a `data-state="closed"` sidebar computed `display: flex` and stayed on screen at every width, and a sidebar whose `ShellScroll` is its only child rested OPEN on a narrow window — the phone default this component resolves in CSS precisely so it cannot be got wrong.

Two rules decide how a displayed pane lays itself out, both at (0,2,0), both landing later in the cascade than the hides: shell.css's own `:has(> .kui-shell-scroll)` column rule, and surfaces.css's shared `.kui-surface:has(> .kui-scroll-area:only-child)`. The first comes after the hides in the same file; the second comes after the whole file. Against a pane holding a text node — which is what every existing law mounts — neither rule matches, and the hides win by having no opponent.

The fix is one class. Every pane already wears `.kui-surface`, so prefixing the four hide selectors takes them to (0,3,0) and settles it by RANK rather than by order — the shape the `--kui-sf-p` stand-down two dozen lines above already uses, against the same kind of opponent, with the reason already written out. **Not being displayed out-ranks being laid out**, stated once for all four hides rather than three that agree and one that happens to.

**Why no law caught it, and it is the degenerate-fixture lesson on the other side of the repo.** Every hide law reads `display` on a pane whose child is the string `"sidebar"`. That is not a law asserting the wrong thing — it asserts exactly the right thing — it is a law whose INPUT cannot tell a correct implementation from a broken one. The 2026-08-20 builder audit earned that sentence from eight laws at once; this is the ninth, in the package, found by a consumer rather than by a suite.

The new laws repeat all four hide conditions on the input where right and wrong differ, and on BOTH scroller arrangements, because the only-child arm and the sibling arm are beaten by two different rules and a law over one says nothing about the other. Falsified: five of the eight fail with the fix removed. The three that survive are kept and named rather than trimmed, because which ones they are is itself the finding — both explicit-overlay cases (that arm already carried two attributes, so it was the one hide never out-ranked) and the sibling arm at a narrow window (its only opponent is beaten on source order already).

**Postscript (merge with main).** Four of the shell's node laws were red on main when this started, and repairing them was part of this work. Main reached the same four independently and landed first — with a better answer on the one that mattered: the rail's per-index arms and the pane's hook stand-down MOVED into the join layer, following Dialog's own refusal, where this branch had carved them out of the law instead. Main's spelling is what survives the merge; the entry below carries it.

## 2026-08-21 Main went red on two laws that raced a window, one day after the rule against it

**What.** CI failed on `fix(dialog): the wrapper took four props and threw the rest away`. Two failures, neither in what that commit changed, and both the same shape: a law whose premise is a WINDOW rather than a state.

**The dialog's name warning.** `useNameWarning` fires inside a `requestAnimationFrame`, on purpose — Base UI stamps `aria-labelledby` when the Title child registers, so reading at the statement after the mount measures nothing and passes whatever the code does. The law answered that with `await setTimeout(60)`. On a quiet machine the frame lands inside 60ms; on CI it did not, and the arm that must warn counted zero. **Fixed by seizing rather than waiting:** the helper now takes what it expects, so the arm expecting a warning returns the moment one arrives and no bound can be too short, while the arms expecting silence wait the full deadline — the fair direction, and the one where a late warning would be a real defect rather than a slow machine. Falsified against a sabotaged warning.

**The select's release seam.** `the panel's floor is the trigger's RESTING width` reads `--kui-anchor-w`, which exists only while the flight does, and the panel's width on the release frame. It failed at 112 against 115.45 — the flight had not landed on the frame the loop read. **Its own sibling three laws down was already recorded in the excluded set for reading the same transient**, so this is the same kind and was simply never marked. Marked and recorded now, with the transient it must catch, per the registry's own rule.

**Both are one day younger than the rule they break** (*a premise that is a window is seized or edge-anchored, never raced*, 2026-08-20). The dialog one could be seized and was; the select one cannot, because floating-ui converges in wall time — which is precisely the criterion the exclusion exists for.

**Stated honestly: I could not reproduce either failure locally.** `KUI_STALL=20` passes both, which is consistent with the 2026-08-20 finding that the cause is bursty scheduling rather than slowness, and no bound defends against that. So the dialog repair is argued from the mechanism (the race is removed, and the law still fails against a sabotaged warning) rather than from a reproduction — and that limit is written here rather than left implied.

---

## 2026-08-21 Taking the plane away took the seam with it — a flush boundary is a rule

**What.** Kushagra, after the panes went flat: *"what is not so trivial is separation between shell panes when they are flush… we have used hairline for exactly this and I don't see why we can't use it here also. What is tricky is to see what gets it."*

**The ownership half was already right and is worth stating.** Each pane draws only its INNER edge — header bottom, rail and sidebar inline-end, inspector inline-start, bottom block-start, content nothing at all — so two neighbours can never draw one boundary twice. Both cases in the question are covered by that: rail|sidebar is the rail's inner edge, sidebar|content is the sidebar's. It is now law-asserted rather than left in a comment, including the negative (the content pane draws zero on all four sides), and giving the content an inline-start edge fails it.

**The pigment is what went missing, and my change is what removed it.** `--surface-edge` rests at a live `transparent` in the elevated world by design, because there a pane's boundary IS its cast. Standing the cast down left that promise with nothing behind it: measured 1px of `rgba(0, 0, 0, 0)` in elevated, and the correct hairline under `depth="flat"` — which is why the mechanism looked fine in one world and did nothing in the other.

**`--color-border`, not `--tone-border`.** The first is what a Separator draws and what a tab bar's hairline draws, both already law-pinned to resolve one colour; §7's edge order puts a frame seam exactly where a separator sits. The second is the pane-BOUNDARY role, and a flush pane has no boundary of its own to state — it is not a pane, it is a region of the page. In `flat` the two resolve identically, so nothing moves there; in `elevated` the seam appears, which is the whole repair.

**Rejected: re-pointing the role, which is what the rule says to do.** A component re-points a ROLE and only the shared layer touches the painted name (the checkbox audit's defect (a), and a law that walks every component sheet). Tried it: the surface edge role is not registered `inherits: false`, so setting it on the pane hands every card INSIDE the pane a visible edge in the elevated world — the `--kui-sf-light` trap, now the sixth time this system has been bitten by an unregistered custom property. **Rejected: moving the declaration into the shared layer**, which is where painting is allowed and where the shell's per-index facts already live — it works, but the seam's other half (the narrow-window drawer arm) has to stay in shell.css because the viewport boundary literal is law-pinned to appear exactly once there, and splitting one decision across two files to satisfy a rule about a third thing is worse than the alternative. **Taken: the property.** It reaches this box and no other, and the law's spirit is met rather than dodged, because the line carries no state — a pane has no invalid or disabled arm for a remap to have to reach.

**Two more node laws caught this on the way in, and both were in the half I keep skipping.** The painted-variable ban, and the axis-list ban — my new seam law had written `["elevated", "flat"]` and `["light", "dark"]` by hand, which is exactly the fourteen-private-copies problem the 2026-08-16 entry closed. Both are now derived from `DEPTHS` and `APPEARANCES`. This is the third time in two days that running only the browser project has hidden a node failure from me; the root command is the one the repo tells everyone to run, and it is the one I keep not running.

---

## 2026-08-21 A fill is one of three things a plane does — the first pass stood down one

**What.** The flush change shipped, and Kushagra looked at it: *"why does it still seem to have background?"* Correct. The pane's `background-color` was gone and the pane was still visibly lighter than the page, still with a soft gradient down its top and a shadow at its edges.

**Measured, with the fill already transparent:** a `background-image` carrying the surface's grain, bloom and sheen, and `box-shadow` at `0 1px 2px` + `0 24px 64px -12px` — every pane in the frame casting a full surface shadow at its neighbours. A pane level with the page is not a plane, and it does none of the three.

**Why the first pass missed it.** I reached for the fill because "background" in my head meant `background-color`. The law I wrote at the same time read `background-color` and nothing else, so it agreed with me — the same shape as every other law in this repo that measured the axis that was right. It now reads all three, and the drawer's dress comparison does too.

**Ground had already solved it, and the spelling matters.** `Surface` stands its light down as `background-image: none`, the PROPERTY, with a comment recording why: `--kui-sf-light` is not registered `inherits: false`, so standing down the hook reaches every pane inside and strips its rim — measured there when a card on a ground lost its own. Copied here for the same reason. `--kui-sf-fill` is different and IS registered non-inheriting, so the fill could safely be a hook; I checked rather than assumed, because the cost of being wrong is every card in a sidebar going transparent.

**A law had to widen, and the widening is bounded by VALUE not by selector.** `the shell paints no bed` forbade the word `background` anywhere outside two sanctioned rules — which catches a stand-down as readily as a paint, because it checks the spelling rather than the guarantee. The two new rules are exempted, and inside them the only values permitted are `none` and the surface layer's own hook: a bed cannot hide in that. Falsified both ways — a `background-color` smuggled into the flush rule fails, and a `linear-gradient` in the drawer's restore fails.

**And the drawer's restore may not name a material.** The first spelling restated the surface layer's full expression, `var(--kui-sf-light, var(--material-regular-rim, none))`, which a component sheet is forbidden to write (recipes.test.ts, the Dialog's own 2026-08-10 refusal). The bare hook is enough — every pane the surface layer dresses sets it — and where it somehow would not, an invalid `background-image` computes to `none`, which is the flush answer anyway. The mounted law reads the drawer's light against a pulled-off pane rather than taking that on trust.

**Two process failures worth recording, both the same shape.** I judged the first pass from a screenshot taken before `pnpm run build` ran, so I was looking at the previous stylesheet and called it correct. And I recorded the budget from `pnpm --filter … run measure`, which skips turbo's `dependsOn: ["build"]` edge and weighs a stale artifact — that is what broke CI on the merge. **The gate ran and answered honestly about the wrong input**, which is the degenerate-fixture rule one layer out: it is not enough for the measurement to be right, the thing measured has to be current. Both are the root command's job, and both were avoided by using the filtered form.

---

## 2026-08-21 Flush means flush to the page — so a flush pane paints nothing, and a drawer is not flush

**What.** Kushagra, on the shell: *"If a panel, content, etc is flush, why does it have any background? Flush should mean letting light pass"* — then, precisely: *"it should have no background at all. It's flush to page."* And on the objection I raised: *"when it becomes a drawer, it stops being flush… a drawer has a surface, so it gets surface."*

**The measurement that settled the first half.** In a flush frame, header, sidebar and content all painted `rgb(255,255,255)` in light and the identical near-black in dark — the same value a Card paints, all three the same as each other. The fill carried no information. And flush ALREADY deleted the corner and the border, so the fill was the last thing left of a surface identity the posture had otherwise stripped. A pane level with the page is not a plane.

**The objection I raised, and why it was wrong.** I said one case breaks it: a drawer on a phone, whose background is the only thing stopping you reading the article through the menu. Measured, and the drawer was already broken in the other direction — corner 0px, border 0px, a square borderless slab, because `[data-flush]` was still stamped while the pane sat over the content. So it was not a constraint on the change; it was a defect the change would have made visible. `flush` is the app's statement about the frame, and a pane over the content is not in the frame while it does so.

**Rejected: a new axis.** My first framing was "a pane paints when it is over something", which is true and is exactly what the deleted floating/stacked vocabulary said. Kushagra: *"we are no longer using terms like floating etc."* The whole point of the 2026-08-20 collapse to one boolean is that the outcome is derived, so this is one exception on the existing attribute pair and no new word.

**Rejected: resolving it in JS.** `usePane` already computes whether a pane is overlaying, and passing that into the dressing is a two-line change. It is also wrong: the window class is null until mount, so a server-rendered `defaultOpen` drawer would paint square for a frame and then correct. §27 exists to make first paint right with no script.

**Two mistakes kept, both caught by a law rather than by reading.** The exception's declarations went into the position rules first — which sit ABOVE the flush block in this file and therefore lose to it, so the drawer stayed square. Specificity states the exception where source order only implies it: `[data-flush][data-presentation="overlay"]` at (0,3,0). And the corner restore first restated surfaces.css's own join expression, which came out 38.712px against the 40 a pulled-off pane wears — because this file pins every pane to `--radius-surface-3` flat rather than riding the size join. **Restoring "the surface identity" means restoring what THIS component gives a pane off the frame, not what the shared layer would give some other box.**

**What it costs, stated.** A flush shell no longer supplies the app's background; the page does. That is the app's call in this system and always was, and the same hazard already existed for every Card on an unpainted page in dark — the shell filling the window was papering over it. In dark the frame steps from the seal down to the page and the change is visible; in light the two differ by a hair.

**What it opens.** Every flush pane is now the page colour, so "why is my sidebar the same colour as my editor" is the only question left — which is the §19 background-step gap, arriving from the Shell after arriving from the Card. Recorded there, not decided here.

---

## 2026-08-21 The app states its navigation size once, and `open` may be handed back

Two more from the builder's port, both smaller than the one above and both real.

**`size` had a default with no home.** Every pane defaulted to `"2"` independently, so a size-1 editor said `size="1"` on the sidebar, the rail and the inspector separately — and would have found out the day it added a row that a missed pane was silently size 2. `Shell` takes `size` now and a pane resolves to it unless it states its own. One context serves both hops: the root provides the app's index, a pane re-provides whatever it resolved to, and the rows read the same name. The literal lives in exactly one place, which is the thing a system with a size axis should not have had wrong.

**Passing `open` conditionally is supported, and now says so.** `{...(preview ? { open: false } : {})}` pins a pane closed while a flag is on and hands control straight back when it goes. It already worked — the uncontrolled state is left untouched while the controlled value is in force, so the pane returns to where the user last left it rather than to where the pin was — but nothing said it was allowed, so a refactor could have taken it away silently. React warns about this shape for form inputs because a value has nowhere to go; a pane's does. Documented on the prop and held by a law that closes the pane, opens it, pins it shut, unpins, and asserts it comes back open. Falsified against the alternative implementation (write the controlled value through to the uncontrolled state), where it comes back closed.

---

## 2026-08-20 The shell's late anatomy outgrew three of its own laws — and one law was seizing a member it never meant to hold

The shell merged to main red against four of its own node laws. Every failing rule was a DELIBERATE late addition with its reasoning written in place — the hover restoration, the rail's per-index arms, the pane's hook stand-down, the rail item's target expander — added after the laws were written and never reconciled with them. The resolution follows the system's own precedents in each direction rather than exempting anything.

**The per-index facts moved into the join layer.** `.kui-surface.kui-shell-pane[data-size]` (the `--kui-sf-p` stand-down) and the rail's three `[data-size="N"]` square arms now live in surfaces.css beside the overlay and ground joins — a component sheet may not name `data-size` (the Dialog's own refusal, 2026-08-10), and the alert-popup arms are the in-file precedent for a component-classed arm in the join. shell.css keeps only the axis-free size-2 rest; specificity carries the same outcome regardless of file order, and all 64 mounted shell laws pass unchanged, which is the move proving it moved nothing.

**The media law asserts the sanctioned SET, not a count.** The nav row's `(hover: hover)` guard is a capability query the count-of-two law had never met. The law now equals the exact set — the narrow boundary (derived from config), reduced-transparency, the hover guard — because a count of three would let a fourth form ride in by replacing one of these, while a set still fails first on any new @media.

**The no-bed law sanctions the hover restoration BY CURRENCY.** The restored hover must spend the control layer's own fill hooks (`--kui-ct-fill-hover`, pinned by the law), so the exemption is the row's state paint re-keyed and cannot quietly become a bed. The third non-roving row promotes the restoration into recipes.css, and the exemption dies with the promotion.

**The overlay-arm law grew a member boundary.** Its `[^{]*` ate `-item::after`, so the day the rail grew its anatomy the law seized the item's §16 target expander — a pseudo-element that must never carry a viewport cap — and failed on its own calibration message. The lookahead holds the set to the four panes; removed cap, added uncapped arm, fourth @media, raw hover colour and a header bed all still fail (five sabotages, run post-fix).

Budget −2 (30847 → 30845), the move compressing better; the baseline is re-recorded downward so the ratchet stays tight.

---

## 2026-08-20 The rotation's last four laws were each a window the machine could outrun — and a window is held open, not raced

The morning's deflaking round ("three different lies about time", below) left CI still red on 14 of the last 20 runs, rotating between two files. Every remaining failure was the same shape one layer deeper: a law whose PREMISE was a real-time window — a panel mid-dissolve, a pose still applied, a trigger clear of the panel covering it — reached by awaiting toward it, so a runner that stalled past the window failed the law on its own premise. All four are fixed by removing the race, not by widening a bound, and every rewrite was falsified against sabotaged code first.

**The select replay law was running TWO gestures, and its three CI failure modes were one defect.** The 8987e33 rewrite armed its mutation observer before a NEW reopen click and left the old reopen click standing above it — so the law reopened the select, then clicked the trigger of an OPEN select, and Base UI's toggle raced the observer's arming and the entry's own stamps. Which assertion failed ("never flew", "silhouette 70 ≤ 36", "the panel it ends in is a real one: expected 0") was pure scheduling: reproduced 3 of 3 under CPU load, in two of the three modes, and 4 of 4 green with the leftover click deleted. A law's gesture is part of its fixture, and a fixture with two gestures is a law about neither.

**The silhouette is read at the DEPART EDGE now, because the seed stamp is not the pose.** For a panel placed by its own contents, `begin()` stamps `data-seed` ALONE as the visibility gate — the geometry lands with the measurement, frames later, exactly as floating.tsx's own comment says — so reading the box in the seed stamp's callback races writes that legitimately come later and measures the un-posed panel (CI: 70 against a 32px trigger; the pose-skip sabotage reproduces the number exactly). `data-seed` leaving while `data-unfurling` stays is the runner's own definition of departure, and the box rendered at that instant is the value the flight's transitions depart from — a transition renders its start value until its clock advances, so the read cannot be too early and cannot be stale. The claim's own moment, read at the claim's own edge.

**`catchDissolve` (test/browser.tsx): a mid-dissolve premise is seized, not polled for.** Both "a reopen that lands mid-dissolve is CAUGHT" laws needed a panel visibly half-gone and still mounted — a window ~200ms of wall clock wide, which CI outlived between two statements ("the premise: the exit is still running: expected false to be true"). The instrument arms before the close and, the microtask the ending stamp lands, pauses every exit animation and sets its clock 60% in — `sweep`'s lesson pointed at a window instead of a series. The pause is also what holds the popup mounted BY MECHANISM rather than by scheduling luck: Base UI unmounts a closing popup when `Promise.all(getAnimations().map((a) => a.finished))` settles, and a paused animation's `finished` never does. The revocation then retargets the paused transitions exactly as it would live ones — measured: the recovery runs, the box is caught within a pixel of where it was held. Falsified against the restored replay branch: `388px -> 66px`, and the alert fails on the flight arrangement.

**Two premises stopped being assumptions about where things already were.** The open-trigger law put the pointer on the trigger while the entry's silhouette — the trigger's own box, sitting exactly ON it, hit-testing by design — was still covering it, so the hover landed on the panel and `:hover` read false; the trigger's center is now waited REACHABLE (`elementFromPoint`) before the pointer is put there. And `openItemAligned` read `data-side` off the first un-hidden frame, racing Base UI's second answer — a fallback side is stamped first and the overlap placement replaces it once the panel's real box is measured (CI: "expected 'bottom' to be 'none'"); it waits for the answer as a state now, and a placement that genuinely never resolves item-aligned expires into the same assertion. The alert's exit law had the same shape from the other side: `openByClick` resolves with the materialization still running, and a pose is a declared VALUE the transition pins cannot strip — the entry is landed before the ending stamp goes on.

**The standing rule gains its second half.** The morning's rule was: derive every instant from the runner's own observable events, never from the test's wall clock. The four remaining laws obeyed the letter of it — every wait was a state — and still raced, because a *premise* that is a real-time window closes on its own schedule however faithfully you poll toward it. So: when a law needs the world held in a particular mid-flight state, it either seizes the animation's own clock and holds the window open (`catchDissolve`), or it anchors the read on the runner's edge that defines the moment (the depart edge) — and where neither is possible the premise is not a law's to have.

---

---

## 2026-08-20 Building the rail: three declarations that looked load-bearing and were not

The rail and the sidebar's navigation shipped against the decisions logged earlier the same day. What is worth recording is not the design — that entry is above — but what the sabotage passes found in my own CSS, because all three findings are one shape: **a second mechanism quietly doing a first one's job, indistinguishable until one of them changes.**

**`aspect-ratio: 1` on the rail's square was dead.** The item states `inline-size: var(--kui-ct-h)` and the control skeleton already states `min-height: var(--kui-ct-h)`; both come from one size join and cannot disagree, so the square is square by construction. The sabotage that set the ratio to `auto` changed nothing.

**`align-items: center` on the rail's list was dead, and worse than dead.** The rail's content box is the square plus twice the air, so centring lands the square at exactly the offset `margin-inline: var(--shell-nav-inset)` produces. A sabotage deleting the margin outright SURVIVED because of it — and the margin is the mechanism the target expander is measured from (`::after { inset-inline: calc(-1 * var(--shell-nav-inset)) }`), so the redundant one would have kept the paint correct while the press quietly stopped reaching the pane's edge. One mechanism, and it is the one another rule depends on.

**`min-block-size: 0` on the scrolling region was dead** — `.kui-scroll-area` declares it for its own reasons, and ShellScroll IS a ScrollArea. So the pane contributes the flex and the scroller contributes the automatic-minimum override, which is a nicer division than the one I wrote.

The pattern generalises past this component: **a declaration nobody can falsify is a declaration nobody can rely on.** Each of these looked like belt-and-braces and each was actually a second home for one fact — the thing this repo audits other people's code for.

**Two law fixtures were caught the same way, and both were the degenerate-input shape (LOG 2026-08-20, the builder audit's own lesson).** The current-versus-hover law passed for a row that was not current at all, because "different from the hover colour" is also true of transparent — it now asserts the current row rests PAINTED before it asserts anything about which colour. And the scroll law used a long list, where `flex-grow` is irrelevant because shrinking already bounds the region; a SHORT list with a footer under it is the input where growth can be wrong, and that is the fixture the law uses now.

**One real geometry defect, found by a law rather than by eye: the half pixel.** A pane is border-box, so a flush rail's own seam hairline came out of the derived extent instead of sitting outside it, and the square landed 3.5px from the edge against a designed 4. It would have moved again the moment the rail stopped being flush and grew four borders instead of one. Stating the rail's extent as a CONTENT box is what makes the inset the same number in every posture.

**Recorded open: the tab strip.** I argued in the design conversation that a rail is a tab strip stood on its end, and for VS Code's activity bar that is true. But real tab semantics need `role="tablist"`, roving focus and PANELS — and the panels belong to the app, not the shell. A nav rail navigates, where `aria-current` is correct and `role="tab"` would be wrong, so the rail ships the nav row's vocabulary and the tablist variant waits for a shell that owns the panels it would switch. Also open, and named rather than guessed: the labelled rail needs its own designed widths, because a word does not fit in a column priced for a square.

---

## 2026-08-20 The posture audit: a bound with one end, and a comment that did arithmetic instead of measuring

Ultracode over the posture rewrite (26 agents, six lenses, one skeptic per finding instructed to refute and to default to refuted, plus a completeness critic). Nineteen candidates, fifteen survived, deduping to five repairs and four recorded. Every repair was re-measured by hand before it was believed, and every new or widened law was falsified against sabotaged code.

**The critical one was not mine and had been shipping for four days: every overlay drawer rendered 1px wide.** `max-inline-size: calc(100% - var(--touch-target-min))` on an absolutely positioned grid item resolves its percentage against that item's GRID AREA — which is the whole point on the block axis, and fatal on the inline one, because an out-of-flow item does not size its own `auto` track. The column collapses to zero the moment the pane leaves flow, so the cap computed −44px, clamped to 0, and the pane painted its borders and nothing else. Measured at a 375px window: rect 1px, `clientWidth` 0. That declaration was written by the 2026-08-16 audit to stop an overlay taking the WHOLE window; it made it take none. **Its law could not fail, and the reason is the shape this repo keeps paying for: it was a bound in one direction.** "A dismissal strip survives, and it clears the touch minimum" is delighted by a 1px pane leaving a 374px strip. The repair keeps the grid area for the axis that wants it and widens it for the axis that does not — a side pane spans every column, the bottom pane every row — and the law now asserts both ends, `min(designed, frame − floor)`, plus a content box wider than the floor.

**The half-applied fix, one run later, is the same lesson twice.** The overlay treatment has two implementations — the explicit arms and the `auto` restatement inside the media block — and the first repair went into the explicit arms only. The explicit path measured 288px and the `auto` path, which is the one every phone takes, still measured 1. The agreement law that exists precisely to hold those two together (2026-08-06: "a mechanism with two implementations owes a law that they AGREE") read four properties — position, z-index, and two insets — and not the width, and it compared them at two DIFFERENT viewports, where the boxes were never comparable in the first place. It now reads the box-deciding set including `max-inline-size` and the grid placement, reads the rendered width, and mounts both spellings at one viewport.

**Two were mine, and the first is the standing rule broken by its own author.** The floating rule's comment said the overlay arm's `z-index: 2` "simply outranks this, in either source order". `:has()` takes the specificity of its most specific argument, so the rule was (0,5,0) against the arm's (0,2,0): a pane that was both non-flush and overlaying computed z-index 1, tied with the scrim, and lost on tree order — the drawer was painted over by its own scrim and every press inside it dismissed the pane. I asserted specificity arithmetic in a comment instead of measuring it, in a repo whose whole discipline is that you measure. `:where()` drops the rule to (0,1,0), which is order-independent and needs no `:not([data-presentation])` guard — one of those would have killed floating for the `auto` panes that are the common case.

**The second was the derivation applied one pane too far.** `grid-column-start: rail-start` asked only whether the RAIL floats, so with a floating rail and a flush sidebar between it and the content, the content's area grew straight across the sidebar's column — and since both are static grid items at `z-index: auto` with the content later in DOM, the content's opaque seal painted 288px of sidebar out of existence, hit-test included. The premise is "the content is underneath THIS pane", and a flush pane in between means it is not; guarded with `:not(:has(> .kui-shell-sidebar[data-flush]))`, the rail simply grounds. **And the guard immediately falsified a second sentence of my own**: the block claimed the rail's rule wins "on source order", which the guard made untrue by raising it to (0,7,0). Measured with the two blocks physically swapped — `rail-start` either way. Specificity is the better mechanism to lean on, but only because it was checked this time.

**Also repaired: a glass pane never built the lens.** `usePaneDress` stamped the material and scoped the subtree but never called `useLensRef`, so a glass shell pane computed a bare blur/saturate/brightness chain while Card, Button, TextField, Select, Menu, Dialog and the rest all prepend `url(#kui-lens-N)`. §10's own porting note says the near-clear ladder is not self-sufficient — blur HIDES a backdrop, the lens RE-STATES it — so the shell was the one glass in the library defended by blur alone, on the largest boxes in the library.

**Two doc defects, one of which is my verification making the mistake it was verifying.** The component reference still documented `panes` and never documented `flush` — a prop that is now a TypeScript error at a call site. I had "fixed" that row in the posture commit with a `str.replace()` whose target never matched, then checked `count('"panes"') == 1` and concluded the survivor was the historical mention in the blurb. It was the row itself. That is the no-op sabotage of 2026-08-16 in a second home, and the rule it earned — a replacement must assert its own application — applies to verification, not only to sabotage. And §27 still said "no pane creates a positive z-index in the frame's context", false from the moment a floating pane started carrying one; the law guarding it mounted an all-flush shell, where the sentence cannot be false. Both now state the guarantee §20 actually needs: whatever the shell layers stays inside its own isolate, and the root takes no z-index of its own.

**Recorded, not fixed** — three of them are older than this change and one is a design question rather than a defect. (a) A GROUNDED pane resolves the theme's glass: the material is decided in JS from `flush` alone while floating is derived in CSS, so in the all-cards frame nothing floats yet every pane blurs. Two skeptics refuted this and the critic re-raised it; it is consistent with what the code claims (a grounded pane has the ground behind it, which is Card-over-page) and it is a decision, so it waits for Kushagra rather than being changed under him. (b) A FLUSH pane on glass has no seam at all: `--kui-border-color` computes transparent on glass and the material ring paints all four sides, so the one-hairline guarantee is not what flush actually delivers there. (c) A glass pane's ring scrolls out of the pane: `.kui-shell-pane` is a scroll container and the ring is an `::after` at `inset: 0`, which is laid out in the scrolled coordinate space — after one pane-height of scrolling the ring has left the pane. (b) and (c) live in the material layer and reach every scrolling glass surface, not only the shell, which is why they are not being patched inside a posture commit.

---

## 2026-08-20 Floating means ABOVE the content, and the shipped axis was the wrong half of v1's idea

`panes="floating"` kept every pane in its own grid column and put gaps between them. Nothing overlapped: the content got NARROWER rather than running underneath, so a creation app's canvas could not pass behind its own layers panel. Kushagra, building the Womp case: *"I want my content to float behind the sidebar and inspector… when something floats, content can go behind it, otherwise whats the point?"* Correct, and the word only earns itself in the overlapping version.

**v1 had the missing half and never joined it to the other one.** `presentation="stacked"`, documented verbatim as *"positions above content without displacing it"*, is exactly the geometry — and it shipped as a separate feature from `inset`, which carried the detached dress. Two halves of one idea, two features, never met. v2 then took `inset`, renamed it `floating`, and left `stacked` on the deferred list, which is precisely why the canvas case was unbuildable. There was a THIRD spelling: Toolbar's own `floating` meant detached-with-a-margin while its default meant *"inset mode with negative margins to go edge-to-edge"* — the exact opposite of the Shell's `inset`, one library, two words, swapped. That mode is `m="bleed"` since 2026-08-20, so the collision retires rather than being carried forward.

**The mechanism is already built.** A pane leaving the grid to sit over the content is the overlay treatment, which ships: an absolutely positioned grid child resolving its insets against its own grid area. Floating is that, minus the scrim and minus press-outside-to-close — permanent instead of summoned.

---

## 2026-08-20 One boolean, and the rest is derived: the author knows what a pane IS, the system knows what is BEHIND it

The first spelling was a three-value axis, and finding names for it failed three times — `raised | floating` (two height words for a difference that is not height), `detached | floating` (relational, off the house pattern where every value is a plain adjective for the thing itself), `grounded | floating`. Kushagra killed the axis rather than the names: *"Could be as simple as flush = true or false? Whatever can float, floats, whatever can be elevated, gets elevated."*

**The rule, in full:** a pane floats if the content is underneath it, and the content is underneath it only if the content is flush. Otherwise it grounds — its own surface resting on `--color-ground`, the card relationship at pane scale. One boolean per pane reaches all four postures: everything flush is the classic frame (VS Code); non-flush nav over flush content is the canvas app (Figma, Womp); flush chrome around non-flush content is the console (Canva, Xcode); everything non-flush is the all-cards look the shipped axis actually produced.

**Why the three-value spelling was worse than verbose — it could be told a lie.** It let a call site state a floating sidebar beside a grounded content card and get a panel hovering over a card for no reason. The derivation cannot be told that: nothing is behind the sidebar, so it grounds. `grounded` and `floating` are outcomes now, not vocabulary, which is why the naming problem evaporated instead of being solved. It is also checkable in the shape the audits like — a law can assert that any pane wearing glass has content behind it.

**Deleted with it: the root `panes` prop.** Kushagra: *"Why do I need `panes='flush'` to make content raised?"* Flush is the default and a default needs no saying, so the Canva layout is `<ShellContent flush={false} />` and nothing else. A root default plus per-pane override was refused on the same ground it always is here: one fact, two homes, and then a precedence rule somebody has to remember. `flush={false}` is mildly awkward JSX and it stays — three failed attempts to name the opposite is evidence the opposite is not a thing.

**Refused, with the cost stated:** above-the-content but hard against the window edge — a full-height translucent panel with the canvas sliding under it. v1 could express it only because its two switches happened to combine. We are deciding they are one thing, so you cannot be over the content without also being pulled in from the edges (Kushagra: *"we're making a call that two are the same thing"*).

**Two things arrive free, and both are evidence earlier calls were right.** Glass: the material system already says a surface expresses glass only where a backdrop is stated, so a pane in its own column has nothing to bend and a pane over the canvas has the canvas — "floating gets the material" is not a bundle the shell adds, it is the existing rule finally having something to bite on. And the flat world: `[data-depth="flat"]` re-declares `--surface-edge: initial`, so `var(--tone-border)` resolves at the element and a grounded pane draws its boundary exactly as a Card does, with no shell rule at all. Panes being `.kui-surface` bought a whole appearance.

**Floating owes what it covers, and v1 already solved that too.** A canvas under a floating inspector is fine because a canvas is infinite; a scrolling document loses its right margin forever. v1's Toolbar measures itself with a ResizeObserver and writes `--rt-toolbar-height` onto its parent, deliberately folding its own margin into the number so what it publishes is the space it OCCUPIES — and content pads by it (`pt="var(--rt-toolbar-height)"` is in v1's own guidelines). The shell needs no observer: a pane's extent is already the custom property the `width` prop writes, so the covered inset per edge is emitted in plain CSS and is correct at first paint. The guidance riding with it: text respects the coverage, media may ignore it — a hero image running under a floating panel is the `m="bleed"` sentence one level up.

**Spacing: no per-pane constant can work, and the proof is short.** With frame padding `P`, grid gap `G` and per-pane margins, requiring flush|flush to be 0 and grounded|grounded to be `g` forces grounded|flush to `g/2` for EVERY value of `G` — the two grounded panes each pay a share and a flush pane pays none, so a mixed boundary gets one share instead of two. It is algebra, not a spelling problem. What saves it is the derivation: when the content is flush the non-flush panes FLOAT, leaving the grid entirely, so the grid holds only flush panes and there is nothing to space. The problem exists only under a grounded content, where two of three regimes are free — everything grounded is today's half-and-half, and grounded-content-with-flush-chrome is the content taking the full gap on four sides while the frame and the flush panes pay nothing. **Deferred, logged, not built (Kushagra: "lets not worry about it"):** a grounded nav pane adjacent to a grounded content, which needs about eight `:has()` rules saying "if the thing next to you is grounded, give it air". No app in front of us mixes the two.

---

## 2026-08-20 The rail is not a thin sidebar, and the giveaway is that its width is not the app's to choose

I twice proposed that the rail might be the sidebar with its labels turned off. It is not, and the correction is Kushagra's: *"Rail is primary navigation, tools, regions… Rail = high level regions, and panel can appear as a secondary navigation expanding each item in rail. When collapsing, sidebar never converges to rail, sidebar can have many items, rail is intended to have a few."* They coexist and neither replaces the other — the rail picks, the sidebar shows what was picked. Mobile convergence (a rail becoming bottom tabs, the way a dialog should become a sheet on a narrow screen) is a separate question and deliberately untouched here.

**The measurable consequence: `width` is the wrong prop for a rail.** config justifies the raw-number widths as *"a pane's width is the app's content speaking"* — true of the sidebar, the inspector and the bottom pane, false of the rail, whose width is its item's box plus padding and nothing else. Shipped, it is 64 in both pointer worlds: a 32px item leaves 16px of air per side, a coarse 44px item leaves 10. The column does not answer the axis its contents answer — the 2026-08-10 icon-box finding one level up, where the one thing inside a control that the coarse world never re-priced was the box itself. The rule was argued for three panes and applied to a fourth it does not describe. **So the sidebar takes a width and the rail takes a size**, and 64 stops being an inherited number.

**The item is a square, not a row**, which is the second half of "different anatomy": a row is icon-then-label with a height of one text line plus air; a rail item has no label beside it. Icon-only by DEFAULT, because narrow is part of what a rail means — the moment it carries words it is wide enough to read as a small sidebar, which is the confusion this entry exists to end. Labels stay available as a switch on the rail (never per item: one word under one icon and not the next stops the icons lining up), and a labelled rail gets its own designed widths rather than handing the number back to the app.

**The item fills the rail's width, and its paint is inset (Kushagra: "I think I still need inset on rail items too, like sidebar").** That is Apple's sidebar geometry — since Big Sur a Finder row paints a rounded rectangle with a margin either side while the whole row still takes the click. The alternative, an item visibly narrower than its column with a live gutter around it, is Discord's and Slack's island look; it can be drawn by an app putting a circle inside its square, and it is not the system's default because a strip that is clickable and never lights up is the paint-versus-target disagreement the checkbox audit already paid for.

**Hover paints grey, selected paints accent — not an edge bar.** My proposal was the VS Code / Discord bar on the reasoning that our fills go rest → hover → pressed, so a fourth step has nowhere to go. Apple's answer is better and we can afford it: an accent fill is not a fourth shade of grey, it is a different colour, so grey means the cursor is here and accent means this is where you are, and hovering an already-selected item barely moving is correct. The bar survives as the fallback for an item that cannot be tinted — a workspace avatar, which is exactly why Discord uses it.

**A rail is a tab strip stood on its end**, which settles the behaviour: the region group is pick-one (arrow keys, one always selected, announced as selected), not a row of buttons that happen to look chosen. The exception is the bottom zone — an account or settings icon opens a menu and is never "current", so it is the same square with the same hover, no selected state, outside the arrow-key group.

Open, v0 by admission: the labelled rail's widths, and whether the seam between a selected rail item and the sidebar it opens should disappear the way a selected tab joins its page.

---

## 2026-08-20 A sidebar row stands level with a button, because the menu row is the exception and it never had this reason

Kushagra: *"menus use a lesser height row, not same as controls, but sidebar menu need to read same height as button control."* Measured, the gap the sidebar row would have inherited is not even constant — fine default runs 28/32/40/48 for buttons against 24/30/34/38 for rows, so 4, then 2, then 6, then 10, and coarse default runs 0, 4, 8, 12, with size 1 equal to its button by accident. §21's own config comment calls this *"one notch under the buttons at every size"*; it is anywhere from 2px to 12px and it hits zero in one cell. A sidebar row built on it would sit slightly under the button above it at one size and a lot under it at another — never wrong enough to file, never right.

**The reframe that costs nothing: the menu row is the shifted member.** Anything behaving like a control rides the height ladder; the menu row steps DOWN off it and §21 states the reason — a panel that appears for a second, is scanned and dismissed, with no buttons anywhere near it. A sidebar row does not get that reason. It is permanent, it sits beside real buttons, and it is a target you hit all day. So it reads `--control-height-N` like Button and the segmented track do, with the segmented control's law verbatim: mount a real Button beside it and assert the boxes are equal, measured rather than compared as tokens. No new designed numbers.

**It also comes due on §21's recorded debt.** That section left open *"a 'current' state for navigation rows (arrives with Sidebar)"*, and the sidebar row is the family's second member — the one the family-first argument said would expose the drift. The lit state is written in Base UI *Menu* vocabulary (`data-highlighted`), which unifies pointer and keyboard for a menu that has exactly one active row; a nav row needs two states that are not the same thing, *your pointer is on this* and *this is the page you are on*, and only the first is a hover.

**The sidebar's structure is a PANE fact, not a sidebar fact.** The pinned-header-over-a-scrolling-body problem is identical in the inspector (Figma pins Design/Prototype above a scrolling body) and the bottom pane (VS Code pins its tab strip), so one part serves all of them — and it is ONE part, not three: mark the single region that scrolls and everything else pins by being an ordinary-sized child. The evidence that it is missing is our own builder, which does not use ShellSidebar at all and rebuilds the panel by hand with 31 raw `style` escapes, five of them `minHeight: 0` — the flexbox incantation you need before an inner scroller works, which everybody gets wrong once and then copies forever.

**What the shell does NOT own: the instrument.** A tree is a separate component and a kookie-block, never kookie-ui (Kushagra). What the pane owes an app's own content is a box with a real height, the right region scrolling, alignment with anything above it, and `m="bleed"` for tree rows that want to highlight edge-to-edge — which the Card work shipped before this asked for it.

---
## 2026-08-20 A dismissal taken back is CAUGHT, not replayed — the quick reopen reversed

**What.** A reopen that lands while the panel is still dissolving no longer replays the entry. On that path nothing is posed, nothing is measured and no flight begins: Base UI takes the exit's target styles off, and the paint clock carries the panel back to rest from wherever the dissolve reached. Reverses the 2026-08-16 decision one paragraph below its own comment. Menu, Select, Dialog and AlertDialog all take it — it is the shared runner.

**A reopen is told from an OPEN by what the panel was doing when `data-open` arrived.** Mid-dissolve the ending stamp is still on — the panel is on screen, coming apart — and on a real open it is long gone. The arrival, never the presence: `data-open` is true for the whole life of every ordinary open, and a state that is true continuously cannot announce an event, which is the defect the 2026-08-16 spelling had already been through (it re-posed panels that had flown, measured as an alert re-blurring its own content at exit). `oldValue` is what makes it an edge.

**Why.** Kushagra, on a real dropdown: *"on second quick click it does show wrong animation"*. Measured, three times out of three: a panel dissolving at 355 x 98 and 58% opacity became 239 x 32 at full opacity **in the next frame** — 116px narrower, 66px shorter, instantly — and then unfurled again from the trigger's silhouette. With a short trigger the jump measures 358px → 64px.

That is what replaying costs, and the cost was never measured on 2026-08-16. The reading then was that a reopen with no fresh mount and no starting stamp was an open that had lost its animation, which is true of the STAMPS and false of the panel: the panel is on screen, at its natural box, already placed by floating-ui. An entry is how a panel ARRIVES, and this one has never left. What a revoked dismissal owes is the dismissal being taken back, and §8's own two clocks already say how — the box is physics, and physics does not teleport. Every interruptible animation on every platform reads this way.

**Rejected: replaying from the panel's current box.** It removes the teleport and keeps the unfurl, so it looked like the compromise. It is not one: the panel would still shrink before it grew, which is a second gesture the user did not make, and it costs a seed measured per reopen for the privilege. The absence is cheaper and truer.

**Rejected: a threshold.** "Catch it while the panel is still substantially there, replay it once the dissolve is nearly done" — the whole exit is about 200ms, so a user clicking again inside that window is doing a rapid toggle, and a threshold nobody has designed is a number the system would then have to defend at every rung.

**Two laws changed sides, and one was replaced whole.** Menu's and AlertDialog's "a reopen that lands mid-dissolve REPLAYS the entry" now assert the opposite, both falsified against the restored branch (`358px -> 64px`, three runs; `no pose: expected true to be false`). Menu's "a reopen RETIRES the flight it interrupts" lost its premise outright — there is no second flight to retire — and is replaced by the hazard it actually guarded: dismiss a panel WHILE AIRBORNE, take it back, and the interrupted flight's own pending clock must still land it, because it is now the only clock coming.

**The first cut deleted the branch outright, and Select's own law failed it.** A kept-mounted panel is reopened with no starting stamp at all, so that announcement is its ONLY one — "the entry replays on EVERY open, not only the first" came back with `the second open never flew — the entry ran once per lifetime`. The gesture to suppress was never "this announcement" but "this announcement in this state", and a branch is the wrong granularity for a claim that has a condition in it. Both directions are falsified now: drop the mid-dissolve guard and the two catch laws fail (`357px -> 65px`), remove the branch and Select's replay law fails.

**The instrument lesson, and it is this file's oldest one.** The first spelling of the new law read the box one animation frame after the click, which is a statement about the machine: on a quick pass Base UI has not removed the ending stamp yet, so there is nothing to see and the sabotaged runner PASSED it three times. It is anchored on the revocation now — waiting for the ending stamp to leave puts the read after the very microtask that would have posed the panel — and the sabotage fails 3/3 with the same message every time.

---
## 2026-08-20 The three flakiest laws in the suite were three different lies about time, and one was measuring an animation it could not see

Red on 9 of 13 CI runs, green here, rotating between three laws in `menu.browser.test.tsx`. Bound-tuning had already been tried twice. None of the three defects was the one the failures looked like.

**Law 2 — "the side it opens on is decided ONCE" — was the one to check on its merits, because a mid-flight alignment flip would be a product bug.** It is not. Timed against the flight rather than assumed: `data-align` goes `start -> end` exactly once, and always BEFORE the flight departs — 87ms pose, 93ms flip, 128ms depart at 1x CPU, and 379 / 530 / 755 at 20x. That flip is the runner pinning the positioner to the panel's real box and floating-ui answering the collision question once, which is the mechanism working. The law forbade any change FROM a value, on the stated premise that the attribute goes straight from absent to its answer; it does not, and whether the law's observer was installed before or after that legitimate flip was pure scheduling. **The window is now after DEPART**, which is what "re-decided as it grows" means, and the observer is armed before the press so it cannot miss anything. Sabotaged — the positioner pin deleted — the same probe reads depart at 117ms and the flip at 850ms, on the other side of the line.

**A first repair of law 2 was thrown away by its own sabotage pass.** It ended the watch when `data-unfurling` dropped; the sabotage's flip lands ~2ms later, so the observer disconnected through the gap and the law failed on a CALIBRATION instead of its claim. It now watches until the BOX is at rest, and rest is only recognised after the release so a spring plateauing mid-flight cannot end the watch early.

**Law 1 — "a reopen RETIRES the flight it interrupts" — put the machine inside both of its deadlines.** `stale` was stamped after `departed()` had spent a flush and three frames, which on a loaded runner is ~150ms of over-estimate, and every millisecond of it moves the bar later — so the law got stricter exactly as the runner got slower. Both deadlines are now stamped from the runner's OWN departures, observed where it actually sets its timers (`data-seed` leaving while `data-unfurling` stays). The `real + 400` ceiling was a timing claim wearing a guard's clothes and is the literal `expected 0 to be greater than 0` CI failure: a release that legitimately lands past it reports zero. Watching longer cannot weaken a claim that the release is LATE. Also corrected: the comment asserted a ~530ms clock; it is 730.

**Law 3 — "both channels actually MOVE" — went red once more after all this, and CI's own printed samples are what settled it.** The first repair removed the post-release sample from the scan, which was real (that step is instantaneous, the one shape a per-millisecond rate cannot normalise). It was not enough, and the series shows why:

```
widths 67,67,67,94,99,104,107,110,112,114,115,116,116,116,114,113,113,112,112,112,112
gaps      66,61,92,34,16,19, 3,11, 13, 28, 16, 13, 21, 87, 21,  9, 68, 68, 85, 72
```

The flagged interval is `107 -> 110` across a **three millisecond gap**: three rounded pixels reported as 1.07px/ms on an entry that is visibly a spring. **A per-interval rate is unbounded as the interval shrinks**, so the width's own 1px quantum becomes an arbitrarily large speed whenever two rAF callbacks land close together — and no bound can fix that, which is the second rate metric this law has now outlived (the first was a per-frame share, equally a statement about the machine).

**So the claim is a SHAPE.** "It grew rather than jumping" means the box was SEEN somewhere in between: a channel that lets go goes from its seed to its destination with nothing observed in the middle however finely you sample, and a channel that travels is caught there by any sampler that looks at all. No rate, no frame-rate bound, no arithmetic a short interval can inflate.

**It is weaker than the rate metric in exactly one case, and that case has a better home.** A width mistuned to sprint in 40ms still lands a sample in the middle third — sabotaged that way this law passes. `recipes.test.ts` fails it twice over, exactly and without frames: "inline-size 40ms linear — hand-typed duration" and "inline-size moves a box, it must spring". **A law that watches frames should own only what the setup cannot show**, and what the setup cannot show is a channel that is declared perfectly and CLAMPED — the defect this law was written for, still caught: remove `inline-size` from the entry's transition and it reports "width never moved".

**And law 3 could not run at all on a fast machine.** It pressed, waited a frame, then called `seeded()` to find the pose. Real input takes several frames to drive and the pose lasts two, so the pose was routinely over before `press()` resolved: run ALONE it failed 6 of 6, and 3 of 3 on the unmodified file, dying on "the entry never posed" while the popup plainly wore `data-unfurling` and `data-aimed`. It passed only as part of the full file, because earlier tests had slowed the machine down. **A law whose fixture only assembles when something else is loading the machine is not a law about the code.** Its sampler is armed before the press now, so it captures the silhouette frame whatever the frame rate.

**`seeded()` is deleted rather than kept.** It waited for `data-seed` to APPEAR on a popup the caller had already found, which reads as a helper and is a race by construction — every caller was looking after the fact. `watchPose()` is the shape that works: armed before the interaction, so the pose is observed rather than hunted.

**The standing rule this earns.** A law that watches a live animation must derive every instant it reasons about from the RUNNER's own observable events — its departures, its stamps, its releases — and never from the test's wall clock, a frame count, or a constant. Where that is impossible the claim belongs on the animation's setup instead. All three rewrites were falsified against a sabotaged `floating.tsx` and confirmed green on the restored one, and all three now print their full evidence — the sample series, the frame gaps, where the release landed, and both deadlines — so the next red run hands over numbers instead of a bound.

---

## 2026-08-21 A ground steps off the page, and it was never able to in dark

**What.** `--color-ground` in dark goes from `--neutral-1` — the page's own value — to a literal midway between `--neutral-1` and `--neutral-2`. And a ground stops carrying the pane rim: no grain, no sheen. Light is untouched.

**Why the colour.** Kushagra, on the builder's canvas in dark: a Surface holding cards read as a hole rather than a bed, and the cards on it were byte-identical to the builder's own panels. Measured, the dark ground and the dark page were ONE value, so only a hairline and the pane sheen separated a region from the page behind it.

**The cause is that light has a free step and dark does not.** A card's fill in light is pure white, which is not on the grey ramp at all — so the page can sit on rung 1 and still leave rung 2 underneath for a ground. Dark has no equivalent: the card cannot be "pure black", so it takes rung 2, the page takes rung 1, and there is no rung 0. `groundColor` was written as "darker in both modes", which is expressible in light and unreachable in dark, and the collapse was recorded at the time as an accepted consequence rather than as the dead end it was.

The rule is now **a ground steps off the page, away from whichever extreme that mode's page sits against** — down from near-white in light, up from near-black in dark. The two modes differ in direction and that is not an inconsistency to tidy: a page sits at an extreme of its own ramp in both, so away-from-it is the only direction there is. Rejected again, for the reason recorded in 2026-08-20's own entry: a relative alpha step still inverts the nesting in dark, because dark's ramp is built from white.

**Why the lighting.** With the ground at the midpoint the pane still read "too heavy", and the fill was not what was wrong. The grain is a fixed 4.5% white overlay, so what it does depends on what is under it: measured, it lifts a light ground by 0.002 and a dark one by 0.042 — the same token, 28× the effect — against tonal steps of 0.011. **The texture was louder than the entire ladder it sat in**, which is why every attempt to fix the colour failed; the ground had to be dialled down to a quarter-step (#101112) just to survive it, and only became judgeable at the midpoint once the rim came off. The sheen is already stated per mode (30 light / 10 dark) — someone noticed this asymmetry one layer up and not one layer down.

Refused: scaling the grain per mode. It keeps a glass texture on something that will never be glass and adds a second per-mode knob to maintain. The rim's own written argument is that a pane catches light and glass needs tooth; a ground is a bed, and the honest answer is that it should never have had one.

**Two instrument findings, both the repo's own documented traps, both made again.**

The rim was first stood down through `--kui-sf-light`, which is not registered `inherits: false` — so it reached every pane INSIDE the ground and stripped the card sitting on it. Caught by measuring rather than by reasoning, and fixed by stating `background-image` directly. That is the var-inheritance trap this layer has now hit five times, and it is why the law holds a card inside a ground against one that never met a ground.

And the first draft of the ordering law parsed luminance with a bare digit scan, which reads the literal **3 in `display-p3`** as the red channel — the calibration bug recorded on 2026-08-08, reproduced by the author who cited it. It failed loudly (`expected 0.07 to be greater than 1.04`) only because the number was absurd.

**One law overclaimed and was corrected before it passed.** "A ground sits between the page and the card" is true in dark and false in light, where the ground is below both (page 0.987, ground 0.967, card white). What the modes actually share is the step off the page, so that is what the law asserts — with the direction checked per mode, which a bare "they differ" assertion would not have caught.

## 2026-08-20 A scroll region inside a pane: the box is the pane's, the padding is the content's

**What.** A ScrollArea that is a direct child of any `.kui-surface` runs to the pane's own edges and moves the pane's padding inside its viewport. Automatic, in the shared surface layer, nothing at the call site: a card that IS a list states a height, and a header/list/footer panel adds only `render={<Stack gap/>}`. Menu's private spelling of the same idea — `padding: 0` on the popup with the pad restated on its viewport — was deleted onto the shared rule. +62 bytes gzipped.

**Why.** Kushagra, on the card scroll demos: a row cut short of the edge "gets cut because of the card's padding… ideally, vertically, it would be edge to edge… and the scrollbar also to be edge to edge, while preserving space horizontally." Then, on the composed answer: **"I want it fixed natively, independently, easily, I don't want to burden the call site."**

A padded pane holding an inset scroller slices every leaving row against an invisible line with empty padding beneath it, and floats the bar inside the pane. Move the box out to the pane's edges and the padding in to the content, and a row leaves under the pane's own corner while the first and last rows still sit in from the edges at rest — because padding that lives inside a scroller scrolls with what it pads.

**The mechanism was already in the repo, written once and kept private.** The menu solved exactly this on 2026-08-17 when its list moved into a ScrollArea, and it stayed inside menu.css for three days while the preview shipped the failing spelling one route over. Collapsing the two is what makes this a promotion rather than an invention, and the menu's own untouched laws — the ring-clearance `max()` among them — are what proved the pixels did not move.

**Rejected: leaving it to composition.** It works — measured: `mx="bleed"` on a wrapper, `flex: 1; min-height: 0` twice, and `padding: var(--kui-sf-p)` on the content, which is a call site naming a private token. That is the objection rather than a defence of it. **Kept the call site's: the height.** A pane's extent is the app's, the same class of value as the page's colour.

### The same day's audit, and what it corrected

**A row-direction defect, found by eye.** The only-child arm first shipped `display: flex` with no direction, argued safe because "with one item a row and a column are the same layout". False in the one way that matters: direction decides which axis `flex: 1` sizes and which `min-*: auto` floors, and those are not symmetric for a scroller — scroll-area.css floors the block axis at 0 and cannot floor the inline one. As a row item a 48rem list made the scroller 48rem wide, the pane clipped it, and BOTH bars vanished. A column fixes it, and the law that catches it needs a NARROWED pane: at full width the "wide" content is not wide, and the fixture proves nothing.

**`max-height` lost content in silence, and the cause was not where it was first written down.** A pane sized with `max-height` rather than `height` gave the viewport its content's height — measured a 160px pane holding a 496px viewport whose scrollHeight equalled its clientHeight, so it never scrolled, drew no bar, and `overflow: clip` removed 336px without an error. `height` worked, which is what made it a trap. The repair is one declaration — the scroller is itself a flex column, which gives the viewport a definite height from the flex line. The FIRST repair also stood the viewport's `max-block-size: 100%` down and credited that; reversing those declarations changed nothing at all, so they were inert and are gone. DECISIONS had blamed `.kui-dialog-body` for this failure; it happens in a plain card, and that entry is corrected.

**A row PANE is a real hole, and the fix was backed out rather than shipped.** "Being a direct child is guard enough — two scrollers side by side in a Flex are not children of the pane" is true when the Flex is nested inside the card and false when the card IS the Flex, one prop from the `render={<Stack/>}` the same paragraph recommends. Measured: two scrollers overlapping by 36px, with a point inside the left one's own rows hit-testing to the right one. A style query on layout's own `--kui-fd` was built and measured working — including the finding that a style query resolves against each element's OWN nearest container, so the scroller had to re-declare the stem or the viewport's half of the rule silently vanished — and then **backed out**, because §2's stem law forbids any layer from so much as mentioning a name layout declares, reading included, and that law's reasoning is sound. A `.kui-stack` class was refused too: Stack is `<Box display="flex" direction="column">` with zero CSS of its own, so a hand-written Box meaning the same thing would be excluded for spelling rather than for meaning. The limit is STATED instead of detected. The only-child arm needs no guard — an only child touches all four edges whatever the axis — and that is now the law, mounted in a row, a column and a grid.

**Recorded, not repaired: a `bleed` inside a scroller.** It resolves against the PANE's padding, and the viewport restates that padding only on the block sides the scroller actually bled, so a vertical bleed inside a list with a heading above it pulls content into a strip no scroll offset can reach. One custom property cannot hold two per-axis answers.

**Two process failures worth keeping.** A previous audit run let its agents use git; one restored `menu.css` from HEAD over uncommitted work and left the shared rule half-applied for forty minutes. And a sabotage-and-restore command interrupted between its two halves left the stylesheet sabotaged — found only because a measurement contradicted a law, which is the one thing that would have caught it. Audits get no git and no writes outside one named scratch file; sabotage belongs in an injected stylesheet, not in the tracked file.

## 2026-08-20 Preview is a MODE of the command context, and a promise is worth the number of doors that keep it

The builder's preview mode promises the screen without the editor, and it kept that promise in the keydown handler — where the guard was written. The ⌘K palette lists the same command table and never asked. Measured in a production build, preview on and every editor pane gone: the palette offered **66 editing commands**, and pressing Delete removed a node from the document with nothing on screen to say so. The `⋯` document menu survived too, with New, Rename, Duplicate and Delete-the-whole-document on it.

That is precisely the second home `commands.ts` was written to abolish, one layer up: the file exists so that "duplicate" has one implementation rather than one per surface, and then the RULE about when a command may run grew a second home anyway. It moves to where the table is. `CommandContext` carries `preview`, `armed(cmd, ctx)` is the single gate, and every surface asks it — key handler, palette, context menu, inspector row. Nothing calls `enabled` directly any more; the palette's three non-command row groups (templates, blocks, document switches) are gated where they are built, because the table cannot reach them.

**⌘F went with it, and that is a distinction worth keeping.** `global` had been carrying two questions: "does this work while a field has focus" and "does this work in preview". They are not the same question — ⌘F must reach past a focused inspector field, and must not put the caret in a Layers filter that preview does not render. So `global` keeps the first and `enabled` answers the second, now that the context holds what it needs.

**The law is the other half of the story, and it certified the bypass.** Titled "nothing that can EDIT the document is armed in preview", it walked `COMMANDS.filter(c => c.global)` — the set the KEYBOARD lets through — and asserted, two lines from the end, that the palette is global. It walks every command through `armed` now, checks the reachable set is non-empty, and checks the gate STANDS DOWN outside preview, which the flag-shaped version could not state at all. Falsified both ways: with no gate "duplicate" edits; with a mode-blind gate nothing is reachable and preview cannot be left. Preview offers seven commands now, all read-only.

---

## 2026-08-20 A law over the general case needs an input where the general case can be wrong

Ten findings from an audit of the same night's work, and after the two headline defects (above, and the width handle below) the pattern in what remained was one thing: **eight laws whose subject was degenerate.** Not laws that asserted the wrong thing — laws whose FIXTURE could not tell the right implementation from the wrong one.

- The drop line's positional law used three boxes of identical height, where document order and pixel order cannot disagree, so a row of a tall card and a short button drew its line 33px inside the card and the law was green. Four separate sabotages survived it — a line drawn on an item's edge, a line ±3000px away, a horizontal line 9999px right, a vertical line 9999px above its row — because its end arms fell back to ∓Infinity, its ±4 slack swallowed an on-the-edge line, and it read `line.y` alone and never the other three numbers.
- The row-grouping law called the shared function and claimed to speak for the gap bands, which are a closure inside the app it cannot reach: pasting the private copy back left it green. Its fixture was also all one height, where "overlaps the row's lowest edge" and "overlaps the last box" agree.
- The run-end law walked a path where the call it was testing was a no-op, because an earlier action in the same walk had already done the work.
- The chord-label law asked that the label was not the raw chord and held no "mod" — both survive a label that drops every modifier in the middle, printing Undo's chord for Redo across the whole app.
- The one-figure ordering law built its fixture top-down, so ids (minted sequentially) and document positions were the same list and a sort by id passed for a sort by position.

The rule this earns, and it is a sharpening of the 2026-08-03 lesson rather than a new one: that lesson said read the computed value, not the declared one. This one says the INPUT matters as much as the output — **a law over a general case must be built on an input where the general case and the special case give different answers, or it is a law about the special case wearing the general one's name.** A fixture of identical boxes, a fixture built in reading order, a walk whose earlier steps do the work of the step under test: each is a way of asking a question whose answer cannot come out wrong.

Two real defects fell out of writing the replacements. Two SEPARATE `Tabs` groups were being treated as tabs of each other, so one loud button in each read as "different panels", the figure budget called them mutually exclusive and a screen showing both came back clean — now each loud action carries the tab it is behind per group, and co-visibility is asked pairwise. And the review panel applied the fix its DEFERRED finding was holding: a finding's id is `rule:nodeId`, so matching it proves only that the finding still exists, while several repairs bake a computed value into their closure — a button 3 among siblings at 2 offers "Match it to size 2", and with the siblings changed to 4 the stale closure still writes 2, the value the live reviewer rejects, leaving its own finding standing.

That last law needed a shape this repo had not used here: proving the two fixes differ, and that `liveFix` picks the right one, still says nothing about the button a person presses, because both hold by `liveFix`'s own construction. The staleness lives at the call site, which no node test can mount. So the law reads the SOURCE — the handler may hold a finding only to learn its id, and `finding.fix` anywhere in the app is the defect coming back.

---

## 2026-08-20 A magnifier may not change the room, in the OTHER direction

The canvas width handle, fixed once and wrong again. The canvas is styled `canvasW * zoom` and also carries `maxWidth: 100%` inside an 880px parent, so past zoom 1 the painted box is CLAMPED and `offsetWidth` is no longer the width times the zoom. Measured at 150%: styled 1320px, `offsetWidth` 880. Dividing that by the zoom answers 587 for a canvas 880 wide, so a grab that moved **zero pixels** collapsed the canvas by a third and flipped every container tier inside it.

It is the first spelling's defect reflected through 1. That one divided only the pointer's DELTA and left the base in painted pixels, jumping 880 → 442 at 50%; the repair divided the measured box instead, which is right below 1 and wrong above. Both spellings share a premise — that the painted box is a reliable statement of the room — and the room is a thing the app already knows. A stated width is the truth at every rung; the measurement survives only as the opening value, and only at zoom 1, where zooming has not yet pinned a width and the divide is a no-op.

The arithmetic moved to `geometry.ts` beside the drop scan's, for the reason that file exists: the drag and the arrow keys had already drifted into different spellings of the same fact, and neither could be held to a law where it was. The laws model the CLAMP explicitly, which is what neither previous piece of reasoning did, and they fail against all three historical versions.

---

## 2026-08-20 A check that cannot run is a check that cannot fail — `turbo` and the browser laws

`pnpm run ci` is the command this repo tells everyone to run before claiming a task done, and in any environment where Playwright's browsers live outside its default cache it could not launch a browser at all. Turbo hands each task a filtered environment, so `PLAYWRIGHT_BROWSERS_PATH` never reached the browser project: `vitest run` inside the package found the browsers, `turbo run test` in the same shell did not, and the reported result was `Test Files 8 passed (37)` — a launch failure that reads like a pass. With the variable passed through, the same command runs 1,414 browser laws.

This is the 2026-08-08 `docs:test` finding in a second home. There, a missing build edge meant a law reading across a package boundary served a cache hit and silently did not run; here, a filtered environment means the same thing by another mechanism. Both times the failure mode was identical and it is the dangerous one: not a red build, but a green one that checked less than it claimed.

---

## 2026-08-20 One measurement serves all four layouts — the drop scan asked the wrong question

The builder's drop scan asked the container's `display` and got two answers: "flex row", measured on X, and everything else, measured on Y. That is wrong for half the layouts the builder ships, and the arithmetic says exactly how. Two cells of one grid row share a vertical midpoint, so the scan's `if (pointer > mid) index += 1` stepped over both at once — index went 0 → 2 and **position 1 did not exist**, unreachable by any gesture — while the indicator drew a full-width bar across the grid claiming to be between two rows the pointer was not between. A wrapped `Flex` failed the mirror case: measured on X alone, the wrap boundary was invisible, so the last item of one line and the first of the next were compared on an axis they do not share.

**The right measurement was thirty lines away and had been since the gap bands shipped.** `measureBands` groups children into visual ROWS by vertical overlap precisely so that one measurement serves all four layouts, and its comment says so. The scan never got the promotion. It has it now: a Stack is N rows of one, a Flex row is one row of N, a wrapped Flex or a Grid is the general case. Inside a row of several the pointer is decided on X and the line is vertical and one row tall; inside a row of ONE it is decided on Y, which is what makes a Stack read correctly without anyone naming it a column; between rows the line spans the container. Nothing asks the document which layout it is — the boxes say it.

**The arithmetic moved out of the app into `geometry.ts`, and that is the load-bearing part.** The version it replaces could only be checked by dragging, which is why it shipped wrong for two of four layouts and survived every review: a defect you can only see by hand is a defect nobody sees. As pure functions over rectangles it is law-tested — falsified against the old display-based rule, against rows that stop grouping, against a line that is always horizontal, and against an empty list answering index zero rather than nothing.

**Two corrections the same night, both mine, and the second is the first one's shape.** *A row holding ONE item is decided on Y* was written for a Stack, where every row holds one — and it also fires on the last line of a wrap. Measured: six cards wrapping to two lines, hovering the LEFT half of the only item on line two, the pointer below that item's middle, and the drop inserted AFTER the item it was pointing at the front of. What flows is the CONTAINER, not the row; only a container whose every row holds one item is a column. Then the gutter: read off the two items the index falls between in DOCUMENT order, under a comment claiming they "always straddle a row boundary". They straddle it in document order and do not BOUND it in pixels — a row's extent is the union of its children, so a tall card beside a short centred button ended at 208 while the button ended at 173, and a drop below the whole row drew its line at 175, inside the card, above the pointer that had just passed under it. Read off the ROWS the index falls between: same arithmetic, right numbers.

**Both laws that should have caught these had a degenerate subject.** The wrapped-row law's two probe points agreed under either spelling; the line law used boxes of identical height, so document order and pixel order could not disagree in it. The rule is the one this repo keeps re-learning at a new indirection: a law over a general case must be built on an input where the general case and the special case give DIFFERENT answers, or it is a law about the special case. Each fix was written as a failing law first, sabotaged in every branch, and re-measured in the browser against a build carrying the old spelling.

---

## 2026-08-20 A magnifier may not change the room: zoom pins the canvas width

The builder's canvas got a zoom, and the interesting decision is `zoom` rather than `transform: scale`. `zoom` participates in LAYOUT, so the scaled box's own height is right and the overlays — the selection ring, the gap bands, the insertion line, the resize handles — stay OUTSIDE it, unscaled. Their coordinates are screen deltas measured against an unscaled parent, which is what they already were, so **not one of those measurements changed**. A transform leaves the layout box unscaled and puts the overlays inside the scaled space, where every rect needs dividing and every instrument needs re-deriving — five instruments re-derived to avoid one property.

**Then a measurement moved the design.** Without a stated width the zoomed box takes 100% of its parent, and inside a scaled box a percentage resolves in the SCALED space: at 67% the canvas measured 1313 CSS pixels while painting 880, and the container tiers moved with it — the canvas silently became an `lg` room while claiming to be an `md` one. For a builder whose whole claim is that its tiers are honest, that is not a style bug. Zooming now pins the canvas width, so the room is fixed and only the distance changes. Verified at 67% and 150%: still `880px · md`, ring tracking its element to zero pixels, and a Separator dropped on the same target landing at the same index.

**Two conversions had to divide and two readouts had to stop.** Pointer travel is in screen pixels and the values it writes are CSS pixels, so the width handle and the resize steps divide by the scale. The box readout and the drag chip state the DESIGN size rather than the painted one: under a magnifier the painted number says how close you are standing, not what the component is. One caveat is stated in the code rather than hidden — because `zoom` re-lays-out at the scaled resolution, a box's own height can land a CSS pixel either side of its actual-size value (202 at 100%, 203 at 67%, 201 at 150%). The readout is telling the truth about the zoomed layout.

---

## 2026-08-20 The reviewer was the one surface that could mint a value the system refuses

An audit of the builder's review engine against §15 and the composition skill. Most rules had drifted from the sentence they cite, but one finding is different in kind: **the reviewer could write a value the package does not have.** The inspector picks from `componentAxes`, resize walks `sizeStepsFor` — and this file did arithmetic. `gap: String(Number(inner) + 2)` on a document at gap 11 wrote `gap="13"` onto a palette that stops at 12, which left the package as unitless raw CSS. The fix that promised to open a gap deleted it. That breaks the builder's founding premise from inside the one feature meant to enforce it. Fixes write through one door now, the gap repair clamps (open the outer where the scale has room, else tighten the inner), and a law walks every rule's repair and checks every value it writes against the axis it writes to.

**Two rules had drifted in a way worth recording, because both had a defensible-looking reading.** The figure budget was scoped to the nearest pane where §15 says "once per SCREEN" — so three plan cards with three loud buttons, the playground's own shape, were silent. It is the screen now, with a dialog or a menu counting as its own screen (it covers) and two tab panels never competing (they are never on screen together). And proximity fired on the brief's own intervals: "within-group must be two steps under between-group" had been applied to every nesting level, so a section at gap 6 holding groups at gap 5 was flagged and offered a repair that would break the house rhythm. It compares a GROUP — a layout whose children are content rather than more layouts — against the rhythm it sits in. A between against a between never competes.

**Two law clauses were missing and both were earned by a surviving sabotage.** The round-trip law asked whether the finding it was offered for had gone, which is one indirection short: `mixed-control-sizes` could move a row from 2/4/2 to 2/4/4 and go SILENT, having made the row worse. It re-reviews the whole document now and refuses any finding the original did not have. And a fix must be MINIMAL — at most one prop on at most one node — which is what catches `size-1-retired` also writing `emphasis: "medium"`, silently promoting a `quiet` line (§15's exception rung, for something stood down) into "real information said quietly". Neither "the finding went" nor "the value is legal" can see that one: the value it wrote was a perfectly legal emphasis. A third law now requires every rule to fire on a document the grammar allows, which is what would have caught the two dead arms the audit found — an AlertDialog exemption for a Button the grammar cannot put there, and a `Tabs` branch whose only job was to return false.

**One finding was a hole in the CATALOG, not the rule.** `accessible-name` was an error with no remedy: Button, Radio, RadioGroup and TabsList had no `aria-label` field, so the panel could raise the finding and offer nowhere to answer it — and the icon-only Button is a shape §4 ships on purpose. A law now walks every type the rule can flag and fails if one of them cannot be given a name.

---

## 2026-08-20 A seat is a fact about the parent, and the tree is held to it at one door

`slot` rides on the node in the builder's model, which is what made a component's `leading`/`trailing` seats cheap. It also meant every operation that carries a node across the tree — a canvas drag, a Layers drag, "move out of container", unwrapping the control it sat in — handed the new parent a child still claiming a seat that parent does not offer. `flowChildren` filters such a child out, and `flowChildren` is what BOTH the interpreter and the serializer walk: **the node stayed in the tree, in Layers and in storage, and was drawn and exported nowhere.** Measured: a Spinner dragged out of a Button's leading seat vanished from the canvas, and the export imported `Spinner` and never used it — code the export dialog calls ready to paste that fails lint on arrival.

**Where to repair it was the open question.** Fixing the four operations is four homes for one rule and no home for the fifth operation somebody writes next; it is also the shape that produced the defect, since each of those four was written without the seat in mind. Taken instead: the store's edit path, which every edit passes through. The cost is a walk per edit, and the constraint that made it affordable is identity: `normalizeSeats` returns the same node wherever nothing was wrong, so an untouched subtree still hands React the same object and the interpreter's memo holds — the 12ms-per-keystroke work is untouched. Rejected: normalizing in `sanitizeNode` alone (that runs on load, not on edit, so the ghost would live until the next reload) and dropping the offending node (a move meant "put it here", not "delete it").

**The one repair path that did exist was a tautology.** `sanitizeNode`'s slot guard read `CATALOG[n.type]`, which the two lines above it have already proven truthy, under a comment describing a check on the PARENT's seats that it never made. It asks the parent now, and one child per seat is enforced with it — two children claiming `leading` is a tree only the first survives, so the second was another ghost.

---

## 2026-08-20 An editing affordance has to know what mode it is in

Three defects in the builder with one shape, each closed by making the mode a fact the mechanism can read rather than a list of ids beside it.

**Preview left every destructive chord armed over a screen that draws no selection.** Preview renders with no stamps, so there is no ring; the selection is still live. Measured: with a canvas checkbox focused — Base UI draws one as a `<button>`, which the typing guard does not see — Backspace deleted the selected node with no ring, no toast and nothing on screen to say it had happened. `global` is a fact on the command row now, not four ids inside the key handler, and it means "cannot edit": a law runs every global command against a real document and fails if one dispatches an edit.

**⌘C/⌘X/⌘V were cancelling the keydown that GENERATES the clipboard event.** The design says the clipboard rides the real events — they hand over `clipboardData` with no permission prompt, which is what lets a subtree cross tabs — but the same chords were also rows in the command table, and `preventDefault` on the keydown suppressed the default action that emits `copy`/`cut`/`paste`. So the primary gesture quietly took the async-clipboard path the design rejects, losing the toast and, on an insecure origin where `navigator.clipboard` is undefined, the system clipboard. `viaEvent` marks the three rows; the keyboard steps aside and the row stays for the palette and the sheet.

**Typing was one undo entry per character.** A two-line description cost 120 presses to take back, and around 200 characters silently evicted every earlier snapshot — the card you built before you started typing included, because the stack is capped. Rejected: a time-based debounce, which makes undo depend on how fast somebody types. Taken: an edit names the GESTURE it belongs to, and consecutive edits sharing that name ride one snapshot; a different field, a different node, a selection or an undo ends the run. Only continuous values coalesce — picking size 2 and then size 3 is two decisions, so the inspector marks typed values and leaves closed picks alone.

**A fourth, from the same family:** a closed picker must be closed at the edge that READS it, not only where it offers. Picking a value resolves a mixed reading, which takes the "Mixed" row out of the live control's items, and Base UI answers a value that has left its items by emitting a reset — measured as the string `"null"` written onto every selected node one frame after the real pick landed.

---

## 2026-08-20 Surface is a ground — the pair that completes the family

An agent reported that the system cannot say "quiet grey box", so people reach for a card inside a card, which we tell them not to do. The conversation that followed reversed my position twice, and both reversals are the record.

**First I checked what the platforms actually do, and the report's framing was wrong about iOS.** Apple ships two background sets — plain and *grouped* — three levels each, and you pick a set per screen. In Settings the **page steps down and the groups sit at the normal surface level.** Apple has never shipped a grey group inside a white card. macOS is the same shape, and where it does recess something inside a container it is almost always a control (a text view, a list, a colour well), not a layout box. So the platform answer is three answers, none of them a grey box: step the page, or it is a control with its own dress, or use separators and type. We already had the last two. On that reading I recommended doing nothing but naming the page.

**Then Kushagra pushed back and I tested my own claim, which did not survive.** The system has no way to make a surface *at all*: every surface is a library component with a pinned identity, so an app or a block needing a region we did not ship hand-paints a div. I proposed exposing the surface layer as `Surface` with `fill` and `edge`.

**He refuted that, and the refutation has a sharp form:** `fill="seal"` plus `edge="hairline"` **is** the outlined card deleted the day before, reachable from every call site. So bounding the vocabulary is not the fix — having no vocabulary is. Walking the cases I had used to justify a general capability, only one was actually uncovered: sidebar beds, toolbars, tiles and empty states are all Card with `render` or `backdrop` today. The hole is one ground, not a capability.

**His builder canvas is what settled the shape** — a hand-painted div holding two cards, and it wears a **smaller corner than the cards inside it**, which is exactly the arithmetic a call site cannot be expected to carry. It also showed the thing is not a well inside a card: it is a ground holding cards, the page pattern scoped to a region.

**One measurement killed the elegant version.** The obvious design is a relative alpha step under whatever is behind it — one value, adapts anywhere, flips by mode for free, which is the alpha ramp's own property and an argument I had made twice. It is wrong in dark: dark's ramp is built from white, so a ground over the page lands near #161617 while the card it holds is #141516. The cards would be **darker than the ground holding them**, inverted in the mode where it is hardest to see. So the ground is an absolute pair. The platforms disagree on direction — Apple nests lighter in dark, GitHub's `canvas.inset` goes darker — and darker in both modes was taken, because it makes the word mean one thing and because our seal is a lifted grey rather than Apple's near-black.

**On whether the hairline should be a prop, on Button's `bordered` precedent:** no. There the border ranks, and quiet / quiet-with-a-border / medium say three different things. Two grounds, one lined and one not, say the same thing — the test an axis has to pass and the one `surfaceLook` had just failed. It is also load-bearing in dark, where the ground and the page are the same colour and the line is all that bounds the region.

**On the harm of someone composing a "card" out of it**, which was the standing worry: with no vocabulary they cannot. A ground is visibly not a card — no seal, no cast, no light. And the harm worth fearing is not people building something *different*, it is people building the same thing a second way, which then drifts out of reach of a fix. Anyone determined to hand-build a card can already do it in one line of `style`; this just means one legitimate thing stops requiring that.

**Rejected along the way:** a `background` prop on Box, Flex and friends (it supplies one fact of five — colour, but not corner, padding, clipping or text context — so it makes the thing hand-buildable rather than buildable, and it splits fill from ink, which is the rule the whole colour system rests on); layout props on Surface (measured unnecessary — `<Surface render={<Stack/>}>` already yields one element that is both); a formal ground *ladder* like Material's five container levels (a ladder needs a bottom you own, and we do not own the page, so only a relative step or a stated pair is expressible); and `Well` as a name (Bootstrap shipped one and deleted it in v4; almost nobody else has one, and the thing is a ground, not a hole).

**Its size join reads the overlay band deliberately** — a pane that contains panes must out-round its contents, which is Dialog's own 2026-08-10 relationship. Recorded, not fixed: with two unrelated consumers that band's name is wrong.

**The page took its name in the same change, and lost its twin doing it.** The plan carried two page roles, on Apple's own split. The second collapsed the moment `groundColor` was written: a page for panes is one step under the seal in light and the page's own value in dark, which IS the ground. So one role, `--color-page` (`--neutral-1` in both modes, the palette's end in each), and the pair reads as content-on-the-page, cards-on-the-ground. It is a name and not a mechanism — the library still paints nothing, a law walks every stylesheet and forbids one from reading it, and apps/docs stopped reaching into the raw palette in the file that judges every other value by eye. It resolves to the same pixels it had, which is the check on whether the name was honest.

Nine mounted laws, five sabotage passes. Two of the laws were instrument bugs first and both were caught by their own runs: one compared a raw radius token against a painted corner (the squircle multiplier sits between them), and the material-scope law gave its held card an explicit `backdrop`, which resolves through any pane scope — so it passed with a `GlassScope` deliberately transplanted in. A scope reset kills the *region*, so the region is what the law has to depend on. +70 bytes, baseline 29826.

---

## 2026-08-20 A pane holds what it contains, and a child may reach its edge

Kushagra asked for Card to be checked for technical completeness against shadcn, Radix Themes, MUI, Material 3, Chakra, Mantine and Ant — not visuals, coverage. Everything the peers have and this system refuses turned out to be refused **on record** (anatomy slots, variant/elevation, tone). Three things nobody refuses were simply missing, and two of them were one hole seen from two sides.

**The hole: a card could not hold a picture.** The padding lives on the surface, `m` only took scale indexes, and negative margins do not exist here — so nothing in the system could subtract a card's own inset, and the most ordinary card layout on the web was unbuildable. Every peer built a component part for it: Mantine's `Card.Section`, MUI's `CardMedia` + `CardContent`, Ant's `cover`. The second half: `.kui-surface` set a radius and never set `overflow`, so even a child that *could* reach the edge would have squared off the corner it sat in. That one was not a refusal — nobody had decided it.

**Where the padding lives is the real question.** Two roads, and the choice is not obvious. Move the padding INWARD (MUI, shadcn, Chakra: the content part pads, so a picture is just its sibling) — honest, but every card gains a wrapper and it is a slot by another name, which section 10's anatomy criterion refuses. Or keep the padding on the pane and let a child cancel it (Mantine's road). Taken: the second. Kushagra's framing settled which element states it — a prop on Card would mean "I pad nothing", which does not describe the actual layout, where the picture bleeds and the text does not. The child is the thing that knows.

**Then a value beat the prop I proposed.** I suggested `<Box bleed>`; the right answer is `m="bleed"`, and the refutation is arithmetic. A `bleed`/`bleedX`/`bleedTop` set is seven rows in the prop table, twenty-eight `@property` registrations, and a second mechanism writing `margin` that the existing var chain would have to arbitrate against — while the margin rows already carry every per-side and per-tier spelling `bleed` needs. Kushagra's own follow-up ("then it must exist on Flex, Stack too?") answers itself: they are Box with a display preset over one shared prop list, so the value lands on all four for free. It resolves to `calc(-1 * var(--kui-sf-p, 0px))` — the surface layer's padding hook, deliberately never registered `inherits: false`, which is the delivery mechanism; the nearest surface wins, so a card inside a dialog bleeds to the card. Margins only: padding and gap reject a negative length, so the word passes through there and CSS rejects it visibly, the out-of-range-index rule's own choice one value over. `inset` was left out rather than generalised into — reaching a pane's edge from normal flow is the case that exists.

**Clipping obliges something, and one panel already knew.** A clipping pane must pad at least the focus ring's reach, or a control resting against the inside of the padding loses the outer edge of its ring. The surface band clears it everywhere (tightest: compact size 1, 8px against 4px), and the menu's panel did not — which is why `--kui-menu-pad` has been a `max()` against the ring's own tokens since 2026-08-09. That floor is now the general rule with one existing exception rather than a local trick, law-walked across every size × density.

**I deleted two `overflow: clip` declarations as redundant and one of them was load-bearing.** With the base rule clipping, the flight rules looked like restatements — but a select's panel is the one floating member that scrolls itself, so `select.css` declares `overflow-y: auto` on that same element and beats the base rule on source order. Removing the flight's clip put the 2026-08-17 "Select still jumps" defect straight back. Restored, with the reason written where the line is. The menu went the other way: its popup declared `overflow: hidden` while its own comment said "clips", and a mounted law asserted `hidden` two lines under a sentence reading *"the popup's clip is permanent"*. Prose and code had disagreed for three days, invisibly, because the flight rule was overriding it for exactly the frames where it would have shown. The declaration is deleted and the law now asserts what its comment always claimed.

**Rejected:** an `overflow` escape on Card (`style` already reaches it, and a prop would invite per-card opting out of the system's one shape); `overflow-clip-margin` to buy ring clearance (it expands the clip rect uniformly, so a bled picture would paint past the pane by the same amount — it buys the ring by unbuying the corner); widening `componentAxes.space` to carry `bleed` for the builder (that list feeds `p` and `gap` too, where it would be offering a negative padding — a second derived list, `marginSpace`, states the narrower vocabulary instead).

Still open from the same review and deliberately not taken here: an interactive card has no `:disabled` arm while every control does; a card cannot say "chosen" (the playground's plan picker is radios because of it); and with `surfaceLook` gone there is exactly one surface treatment, so there is no inset panel or well — the section 19 background-step question, now sharper. All three are recorded, none is a bug in what shipped today. −6 bytes; baseline re-recorded 29756.

---

## 2026-08-20 High contrast leans on the glass: the rim stays, and the veil ladder raises a floor instead of a ceiling

Kushagra, on the glass panes at `contrast="high"`: *"it removes any rim or edge stuff, making it look cheap and incorrect. It's not taste, it's incorrect."* Two changes, and the first is a defect rather than a value.

**The rim stand-down had outlived its reason.** `contrast="high"` emptied `--material-<t>-rim`, and the comment beside it said why: *"or high contrast would resurrect the glint it just removed."* That glint was the LIFTED rim variant, and it was deleted on 2026-08-17 when the ring took the edge — so for three days the stand-down went on deleting the resting rim to defend against a value that no longer existed. **On its own terms it was also backwards**: the rim is a gradient painted INSIDE the pane (grain, bloom, sheen, consumed as `--kui-sf-light`), so it cannot lower the contrast of anything, and emptying it only removes the cue that the pane is a physical thing catching light. An accessibility setting that deletes information is wrong in its own terms, which is the sense in which "not taste" is exactly right. `config`'s own sentence — *high contrast leans on the glass, it does not unmake it* (2026-08-05) — had been true in prose and false in code.

**What the setting still trades is the EDGE, and that trade survives scrutiny.** The ring is white, so over a bright backdrop it disappears exactly as the veil does (measured: 1.00 against a pale sky at any opacity — a light-coloured edge cannot bound a page-coloured pane). And a ring plus a pigment border is two lines a pixel apart, which is the *"why am I seeing this thicker top border"* defect of 2026-08-07. So: one line, made of pigment, and the pane keeps everything else.

**The veil ladder now raises a floor.** Kushagra: *"the rule isn't 'make everything even more high contrast', it's 'ensure baseline high contrast across'"* — under which the rung furthest from the floor must move furthest. The shipped row did the reverse, and the numbers were unambiguous: thin moved LEAST (+21 light, +8 dark) while regular moved most (+33 / +19), so the thin→regular gap nearly doubled under the setting (15 → 27 light, 15 → 26 dark) instead of closing, and thick landed at 94–97% — solid in all but name, spending the material's identity on the rung that needed help least. Now thin travels furthest (+38 / +24), thick least (+21 / +10), the gaps compress to 8 and 6, and thick stays glass at 86 / 90. Monotonicity is unchanged and still law-walked per column, so three rungs remain three — three defended things rather than three degrees of defence. v0, to be judged in the playground.

**The law that pinned the wrong behaviour was confident and specific**, which is the part worth remembering: it asserted all three `--material-<t>-rim: initial` strings and even guarded that `rim-lifted` stayed dead — a law written from the same premise as the code, so it locked the defect in rather than catching it. It now asserts the opposite in the tokens, and a mounted law reads a real pane's `background-image` at both contrasts (identical recipe, veil thickened, pigment edge arrived), because the token half had already proved it can be pinned backwards. Both falsified by restoring the stand-down. −14 bytes.

---

## 2026-08-20 High contrast never reached a nested appearance Theme — the whole palette, since 2026-08-03

Kushagra, by eye in the preview: a dark card looked byte-identical at both contrasts while the glass beside it visibly gained an outline. I had measured the card the day before and reported it working, because I measured it the one way that hides this: `mounted()` builds a single `<Theme appearance contrast>`, and co-location is exactly the arrangement where the bug cannot appear.

**The defect is proximity, and it reaches everything.** The high-contrast rule lands on the element carrying `data-contrast`. Every name it re-declares — the border and text bands of all ten tones, each family's solid trio and label, `--control-edge`, `--field-edge`, `--color-track` — is also written by `colorDeclarations`, which lives in the APPEARANCE scopes. So any `<Theme appearance>` between that element and a component re-states the standard palette nearer to it, and a custom property resolves by proximity. Measured inside `<html data-contrast="high"><Theme appearance="dark">`: `--control-edge`, `--field-edge`, `--neutral-6` and `--color-track` all equal their standard values, and a card painted no boundary at all. That shape is not exotic — it is the supported path (the pre-paint script stamps `<html>`, §5's co-location requirement satisfied there) plus any dark section, and it is what apps/docs' preview canvas renders.

**Only glass escaped, which is the clue that found it.** The glass edge arrives through `[data-contrast="high"] [data-material]`, a descendant arm landing on the component itself, so nothing between them can outrank it. That asymmetry — glass answers, solid does not — is exactly what he saw.

**The fix is one more selector on the same rule**, not a second copy of the values: `[data-contrast="high"] [data-appearance="<mode>"]:not([data-contrast="normal"])`. The ancestor half is deliberately not mode-keyed, because a light Theme can nest inside a dark document and what matters is only that someone above asked. The descendant keeps its own opt-out guard, so a nested `contrast="normal"` still escapes — falsified separately, and removing that guard fails the law. +13 bytes.

**Two mechanism notes worth keeping.** The platform signal was never affected: its arm is already `[data-appearance="<mode>"]:not([data-contrast="normal"])`, which matches a nested scope on its own — so `prefers-contrast: more` has always worked and only the explicit prop was dead, which is most of why this survived every audit. And the guard law had to learn a second legitimate use: a `:not([data-contrast="normal"])` outside the media query is safe exactly when the selector also demands `[data-contrast="high"]`, because there the guard is an opt-out rather than the trigger. It is stated as that property, with a vacuity check that some guard still sits inside the media query.

**The lesson is the 2026-08-03 lesson with a new face.** Every law here reads a computed value through a mounted Theme, which is the standing bar — and all of them build the same DOM shape, so a defect that only exists in a different shape is invisible to the whole suite. The new law drives `document.documentElement` directly and reproduces the page, because the arrangement it is about is the one the harness cannot express. `block()` in tokens.test.ts also stopped pinning a whole selector list, which is pinning a spelling rather than a guarantee: three laws died at once on a rule gaining an arm.

---

## 2026-08-20 The look axis dies whole: surfaceLook follows controlLook out

Kushagra: "We need to deprecate surface look also, like we did with control look." The two halves died for the two different reasons an axis can be dead, and both are worth keeping distinct. `controlLook` (2026-08-19) had CONVERGED — the fill-first flip made its values byte-identical, so the prop moved nothing. `surfaceLook`'s second value had never been USED: `filled` shipped 2026-08-06 as a derivation, stayed v0, was never judged by eye and appeared in no real screen, while the lab port made `outlined`'s borderless pane the one judged surface identity. An axis whose default is the only value anyone has ever seen is a lever every call site can reach and none has needed — the fenced-resource sentence, applied to a Theme prop.

The deletion knowingly re-opens a settled refusal and that is the entry's real content: 2026-08-10 rejected "take the surface family OUT of the axis" partly because it "forecloses the tinted surfaces `filled` is meant to grow into". That future is now foreclosed on purpose. Answer: a tinted surface identity can return as a Theme VALUE the day a real app wants one (the tone-set rule), and its return does not require this prop to have survived — the §19 open question about the missing background step (raised the same day, the Card audit's nesting pass) is that direction's one home now.

Mechanically, the surface family's chrome collapsed one hop everywhere: quiet reads the seal directly, the interactive steps read `--color-surface-hover/-active` directly, and the one piece that still needs a NAME is the resting pigment edge — `--surface-edge`, a live `transparent` in the appearance scopes that `contrast="high"` and `depth="flat"` stand down to `initial` so `var(--tone-border)` resolves at the element (the material edge's pattern, and the dress edges' own shape one family over). The HC look-scoped arms died with the look blocks: the 2026-08-17 proximity trap they fixed needed a surface colour declared at the Theme element, and nothing declares one any more. The sealed-pane chain names the tone hairline directly — under reduced transparency a sealed pane now wears a boundary its solid siblings rest without, which is deliberate: a sealed pane has no light left to speak with. `dress` lost its surface rows (they were `filled`'s pigment), the density preview lost both look selects and its outlined-vs-filled demo (the controlLook half of which had been dead since 2026-08-19 and nobody noticed — emitted HTML has no law walking its axes), and the budget dropped 267 bytes (29763, re-recorded).

The laws that flipped the axis to prove an exclusion (Button, slider, switch, segmented control, progress) are deleted rather than re-keyed — with no prop there is no second look to compare, so those exclusions are structural. What survives re-keyed: the dress emission/consumption closure (now covering `--surface-edge` and asserting no `--dress-surface-*` re-grows), the HC outcome law (per family: a dressed edge MOVES, the pane's edge APPEARS — it rested transparent, so the old "not transparent at rest" arm inverted), the flat hairline, and the no-trace law widened to both dead attributes and the whole `--look-` namespace in both directions. Found on the way and fixed as ordinary debt: radio's look laws were still flipping a `controlLook` prop that had been deleted the day before — typed `theme: object`, so nothing complained while both mounts rendered the same cell.

---

## 2026-08-20 Resize steps the size index — the one answer this system has to "make it bigger"

The builder's fourth slice (Kushagra: "let's make resize work now", then the call that closed it: *"resize on components — where possible — increases size"*). What was open was what a resize handle may WRITE, and the package answers it: `width`, `height`, `maxWidth` and `flexBasis` are all `scale: null` pass-through CSS with no token scale behind them (§3's own taxonomy: *"there was never parity to chase there"*), so a Figma-style handle would state a raw length — the exact value class this builder refuses, and the reason ScrollArea is the one export excluded from the palette. A component's designed size vocabulary is its `size` index, so the drag walks that index and the box lands on a value the system designed rather than on a number the pointer stopped at.

**Only the corner carries it, and that is Figma's own grammar read honestly.** A size step is uniform — it moves height, padding, type and corner together — which is what a corner means everywhere; a SIDE handle would have to write one axis, and one axis is a width. So there are four corner handles and no edge handles, and the absence is the argument rather than an omission.

**A handle appears only where one writes something.** `sizeStepsFor` asks the catalog (grammar is data, not judgment in the drag handler — the file's own rule, and the sentence `canContain` already earns), so Card, Button, TextField, Heading and Text carry grips while Stack and Flex carry none. This is the same lie the same file deleted two hours earlier, when the first Figma-shaped chrome shipped resize handles with no resize behind them: a grip that writes nothing promises an interaction that does not exist. Their presence is now the information.

Three things fell out of building it. The starting rung is READ off `data-size`, never assumed — `size` is optional in the catalog, so an unstated one is the component's own default, and the DOM is the only place that knows it (every component stamps the attribute). The vocabulary is per component rather than global: a Heading walks `typeSize`'s nine rungs, a Button `size`'s four, because the catalog names the axis and the package owns the list. And each step writes through the updater form, since the document a drag starts on goes stale the moment its first step commits — with one gesture pushing exactly one undo entry (the first change pushes, the rest replace the present).

**A vertical handle** is refused outright with a reason: nothing in this system states a height, a surface has no height to own (§6), and a control's height comes from the ladder via the index the corner already walks. Two laws, both falsified against a sabotaged `sizeStepsFor` that answered for every type: the steps ARE the package's list for exactly the types owning a size axis and null elsewhere (with an explicit vacuity guard, since a law that covers nothing passes), and every rung the drag can reach survives the export's own no-length no-style refusals. Verified live through real pointer drags reading the MODEL from storage: a Button's unset size → 4 growing 62×32 → 81×48, a Card 3 → 4 from the top-left corner and 4 → 1 dragged back through it, a Heading 6 → 9, and one ⌘Z restoring the lot.

**The SIDE handles landed the same day, and what they may write was settled by measurement rather than by argument.** They speak about a node's SEAT — how it takes its share of the parent — which is the half of resize that is about the parent rather than the node: `flexGrow="1"` in a row (fill, unset hugs) and `gridArea="auto / span N"` in a grid. Both are `scale: null` props the package types raw, offered closed exactly like the flex keywords beside them, so neither can state a length. Which vocabulary applies is decided by the parent's MEASURED layout, never by the document: `direction` is responsive, so the tree cannot answer "is this a row" for the tier currently on screen, and the canvas is a real query container — only the DOM knows.

**Three refusals fell out, each measured.** A COLUMN offers nothing, because its children already stretch across it — that is the system's own full-width idiom, written into showcase.tsx beside the sign-in buttons (*"the layout does it, the button has no opinion about how wide it is"*). A CONTROL gets no side handle at all: §3 keeps layout props off components, and wrapping does not rescue it — measured, a `flexGrow` Box grows to 261px while the Button inside keeps hugging at 62px, because a grown box is not a stretched child. Grid span DOES survive a wrapper (a spanning Box carries its Card the full 397px), which is why the two halves reach different places and why only one of them could have been guessed. **And the span is spelled `auto / span N`, never the tidier bare `span N`** — on a real 3-column grid the bare form leaves the child at one column (195px against 397px), because the shorthand's first slot is the ROW. That one is pinned by its own law, since the wrong form looks like a simplification and fails silently.

Verified live: a Box in a flex row 24px → 842px on the drag and back to 24px when dragged in, a Box in a 3-column grid 286px → 874px at `span 3`, and zero side handles on a child of a column. Laws falsified in both arms — a sabotage letting controls claim a seat, and one restoring the bare `span n`.

**Found and reported, not fixed:** `/preview`'s filter-field specimen wraps a TextField in `<Box flexGrow="1" minWidth="10rem">` and the field does not fill it — measured in the shipped page at 174px inside a 755px wrapper. Same shape as the Button measurement above; the intended idiom is a design call, so it is Kushagra's.

---

## 2026-08-20 The canvas becomes a node — a wrapper you cannot see is a wrapper that lies

Kushagra, looking at the Layers tree: *"the canvas should render also in the layers, because isn't it a Flex too? … I still expect to see parent Canvas in layers so that I can manually adjust padding and gap."* He is right, and it was worse than a missing row: the wrapper already existed and already lied.

**The measurement that settles it.** The canvas rendered the document's roots inside a `Stack gap="5"` that the tree never showed, the inspector could not reach, and the SERIALIZER never emitted — the export wraps multiple roots in a Fragment. Measured on two roots: 16px between the cards on screen, nothing at all in the generated code. **And the law written to catch exactly this could not see it.** "Round-trip identity: the exported code IS the canvas" builds its expected side by re-implementing the tree with a Fragment, so both sides of the comparison agreed with each other while disagreeing with the canvas nobody rendered. One indirection short of the thing that was wrong, on the law whose title claims the opposite — this repo's oldest lesson, on the builder's anchor law.

**The shape: the canvas IS the document's single root**, a real `Stack` carrying `gap="5"`. That choice is what keeps it from becoming a second kind of thing — `findNode`, the drag, selection, undo, review and the serializer all speak `roots` already, so an ordinary node at `roots[0]` needs no special case in any of them. The serializer's own fragment branch simply stops firing, because there is always exactly one root. Rejected: a `doc.canvas` props bag beside the roots (delivers the same UI and buys four permanent special cases — tree row, inspector case, export wrapper, storage field), and a bespoke `Canvas` catalog type (the coverage law requires every catalog key to be a real package export, and inventing a component to name a role is the drift that law exists to stop). The row reads **"Canvas · Stack"**: the role first, the truth beside it, because it exports as a Stack and the label should not pretend otherwise.

**What it forced, each caught by a failing law rather than by foresight.** The migration lives in `reviveDoc`, the one gate every stored document passes, and is keyed on SHAPE rather than a version number — one root of the canvas type is already migrated, anything else gets wrapped — so a hand-edited or half-migrated file lands on its feet. Every document-producing path had to agree: `makeDoc`, the templates, and the starter, which was missed on the first pass and produced the sharpest failure — `isCanvasId` trusted position alone, so an unmigrated document handed the guard the user's own first element and froze it undeletable. The guard checks the TYPE too now, which turns that into a graceful decline. And **two review rules had to exempt it**: `empty-container` and `single-child-layout` both prescribe "cut it" or "unwrap it", and a finding against a node that cannot be removed is noise rather than review — an empty new document was being reported as a fault, and a canvas holding one card as a pointless layout. The exemption is one named predicate both rules ask, because that list will grow.

The review LAWS moved with it: `asDoc` now builds content inside a canvas, the way a real document is shaped. Reviewing a bare root list stopped describing anything real, and left alone it would have silently reviewed an exempt node.

Verified live: the row reads "Canvas · Stack" above the content, the inspector offers its gap and padding, Delete/Unwrap/Duplicate are refused on it and still offered on an ordinary Card, and the export now opens with the `<Stack gap="5">` the canvas actually draws. 355 laws.

---

## 2026-08-20 The canvas is a room, not a shrink-wrap — and the gutter is the world a shadow has

Kushagra, on a card in the builder: *"its shadows are cut. I'm having difficulty understanding whats my canvas."* Two symptoms, and measuring them found one cause each.

**The shadow was clipped by 20px at the bottom, and the gutter is why.** An elevated Card casts `0 24px 64px -12px`, which reaches ~44px below its own box; the canvas gutter was `p="6"` — 24px — and a scroll container clips at its padding box, so the bottom fifth of the cast was simply not painted. The other three sides fit, which is why only the bottom looked wrong. The gutter is now `p="9"` (48px): the whole world a canvas surface has is the padding around it, because nothing outside that box can be painted into.

**The canvas ended just under the document, and everything below it was NOT the canvas.** Measured: a 250px scroller inside an 880px region, and `elementFromPoint` 250px lower answering with the region AROUND the canvas rather than the canvas. Nothing was drawn to say so, so the eye had no way to find the boundary — the question was exactly right. The cause is in ScrollArea: the viewport is `max-block-size: 100%` with no block-size and its Content wrapper is unstyled, so both shrink-wrap. That is correct for the component's first consumer, a menu panel that hugs its rows until it hits the cap, and wrong for a canvas, which is a room. The root takes `display: grid` at the call site — a grid parent stretches its child, and the cap then lands it exactly on the area's height (250 → 880) — and the Content wrapper takes a scoped rule in the docs app's own stylesheet, because the component exposes no hook for it. §13's escape, spelled in the app rather than widened into a component for a case no other caller has.

**The page is painted INSIDE the document's own Theme**, which is the half that could not be guessed: the library owns no page colour (that is always the app's call), and the document carries its own appearance, so a page painted beside the Theme would show a light bed under a dark document. On the Theme element it takes `--neutral-1` in whatever appearance the document chose — the value /preview settled on for this exact job — with a hairline and the surface corner, against the workbench grey outside it.

The height threads down by FLEX rather than percentages: the ancestors between the scroller and the Theme are auto-height, and the zoom wrapper is conditional, so a percentage chain dies twice on the way. `min-height: 100%` plus padding also needs `border-box`, or the page hangs exactly one gutter past the scroller — measured at −48px before the fix, which is the same shorthand trap the ScrollArea's own comment records for its viewport.

**The document still sits flush against the page's edges, and that is deliberate**: a Card at the root of a page with no padding does sit flush, and inventing an inset here would have the canvas showing spacing the export does not have. What fills is the bed, never the composition. Verified live after: an even 48px gutter on all four sides, the shadow with 630px of room, the width handle still dragging the page 826 → 626, and a Separator dropped into the empty page below the document landing at the document root.

---

## 2026-08-20 The selection chrome stops impersonating focus, and traces the real shape

Kushagra, on a selected TextField: *"selecting an input field shows two selection boxes… there is an offset and it looks the same as focus ring of textfield."* Both halves were true, and there were three independent causes under them.

**It was wearing the focus ring's own spelling** — `--focus-ring-width` and `--focus-ring`, the literal tokens the package uses for keyboard focus — so the instrument and the state were the same colour and weight by construction. It is now a 1px hairline in **purple** (`#a855f7`), chosen because it is the one hue no token in the system uses: selection cannot be read as focus if the system owns no purple to confuse it with. The rest of the grammar is Figma's, on Kushagra's own reference: a shape outline hugging the element's real corners, a square-cornered bounding box over it, and a size chip.

**Two boxes appeared because a canvas control took real focus.** Clicking the field focused the input, lighting the package's genuine ring beside the builder's. A capture-phase handler now blurs anything focused inside a stamped node — clicking is selection, not operation, the same trade drag-to-move already made of text selection. Blurring in the focus event rather than preventing the mousedown is deliberate: it keeps native drag alive in every engine, and the width handle's own arrow-key focus never matches the stamp.

**The offset had two more causes, and both were arithmetic.** A `border` grows the box it is drawn on, so the trace was 2px larger in each axis by construction — both lines are `outline` with `outline-offset: -1px` now. And the ring was measured once at click time, while a button carries the hover rise: measured, the drift ran 0 → 0.9 → 1.0px across the recovery spring and back to 0 when the pointer left. It re-measures per frame while selected, committing state only when a number changes. After: 0.00px on all four numbers at rest, hovered and settled, and 0.11px for one frame mid-spring, which is a frame of lag against a moving target rather than an error.

**A fourth cause was hiding in the field family specifically**: TextField spreads unknown props onto its inner `<input>`, so the builder's stamp — and every measurement off it — sat on the input rather than on the `.kui-field` wrapper a person sees. One `visibleEl` resolves stamp → visible box, which also corrected the drop-line geometry and a click on a field's padding selecting the field's PARENT. Keyed on the input's class rather than the wrapper's, so a control sitting in a field's slot keeps its own box.

**Then the corner: radius alone is half a corner.** A surface draws a squircle (§6, the lab port), so the trace bulged past a card's real edge. Two things were measured before writing it — `corner-shape` is readable per element (a card computes `squircle`, a button `round`, so the instrument asks the element rather than knowing which components are surfaces), and an `outline` follows `corner-shape` and not just a border. Engines without the property compute `""` here AND draw arcs on the surface, so the trace stays right by construction — the same live-or-die pairing surfaces.css states for the knob and the shape. Verified on the card: 0.00px on all four numbers, both element and outline computing `squircle` at 64.52px.

Resize handles were **deleted** in this pass and returned two hours later with resize itself: a grip that writes nothing promises an interaction that does not exist, which is the scar the corner-handle rule is written against.

---

## 2026-08-20 The gutters are visible and draggable — DevTools' idea, this system's vocabulary

Kushagra, selecting a Stack in the builder: *"see how browser adds grid, we need the same philosophy, but of course done our way… so that gaps can be identified, and scaled too with mouse click and drag."* DevTools paints a layout's gutters because they are the one part of a layout you cannot click. The borrowed part is exactly that — showing the space — and the part that had to be ours is what a drag then WRITES: a gap here is a token index, so the band walks the space scale rather than measuring to a number, which is the same sentence the corner handles already earn one gesture over.

**One measurement serves all four layouts, and it asks the boxes rather than the document.** Children are grouped into visual ROWS by vertical overlap, then a horizontal band is drawn in each within-row gap and a vertical band between consecutive rows. A Stack is then N rows of one, a Flex row is one row of N, and a wrapped Flex or a Grid is the general case — no branch anywhere asks which layout it is. Overlap rather than a matching top coordinate on purpose: items of different heights sit on one line, and a top-coordinate match splits them into rows that are not there.

**Every band moves together, because `gap` is one prop** — which is also the honest picture of what a layout has: one gutter, not a set of them. Drawn as a soft fill and never an outline, since an outline in the gutter reads as a second boundary beside the selection's own.

**The band is inset on all four sides** (Kushagra: *"perhaps not edge to edge… I meant vertical too, all around"*). Edge to edge it fused with the selection outline at both ends and read as a ladder rung rather than as something lying in the gutter. Length-only was built first, on the argument that the band's THICKNESS is the measurement and must never be shrunk — and that argument is what the all-round call overrides, correctly: the band is a target and a location, not a ruler. Nobody reads its pixel height; the drag states the rung and the chip names it. Each axis caps its own inset at a quarter of that dimension, so the band shrinks WITH the gap instead of insetting itself out of existence at the bottom of the scale, and the corner is `min(--radius-control-1, half the short side)` — CAPPED, after the capsule spelling was tried and judged out the same day: half the short side alone turns a large gutter into a stadium (Kushagra, by eye), because a band is as tall as the gap it fills. The `min()` holds both ends — 14px on a 116px gutter, and 4px on an 8px one, which is that band's own half. **And the token has to be the SEMANTIC one**: measured at the overlay's scope `--radius-control-1` is 14px while the raw `--radius-1` is 9999px, since the palette's entries are capsule sentinels at `radius="full"` — §6's "never --radius-N in a component" showing its teeth in an app. Every instrument corner moved onto it in the same pass (the size chip, the drop line, the width grip, the drop hint), each through the same `min()` so a hairline cannot over-round.

**What the inset then forced is a hit floor, and it is §16's move for the mark family arriving in an editor.** At the smallest gap the honest paint is a hairline: measured, a 2px gutter paints a 1px band. So the PAINT stays the true gutter minus its inset while the TARGET grows to a floor around the same centre — 11px, the same shape the corner handles already use (a 14px box holding a 6px square). Verified at the bottom of the scale: 2px gutter, 1px of paint, 11px of target, and the drag still lands (gap 1 → 4).

**A per-tier gap shows its bands and refuses the drag** (measured: `pointerEvents: none`, default cursor). The canvas renders one tier's answer, so a drag would silently edit one entry of four while the screen may be showing another — worse than sending the author to the inspector, where every tier is visible at once. Recorded rather than solved: the drag could write the tier actually in effect, since the width handle already derives the active tier from the canvas's real width, and that is the better answer the day someone wants it.

Verified live: a Stack's two bands, gap 4 → 7 dragged down; a Flex row's single vertical band, gap 3 → 6 dragged right; and the per-tier refusal. Two laws, matching the pair the corner handles carry — a layout offers the space scale and nothing else does (with the vacuity guard, since a law that covers nothing passes), and every step the band can land on is a real layout-space token the export accepts. Found on the way, and worth keeping: selecting a container at all means clicking its gutter, because every other part of its box is covered by a child — the bands are drawn exactly where that click lands, which is a small coincidence in the feature's favour.

---

## 2026-08-20 The builder was losing the document on every reload

Found while building the resize handles, by a test that could not load the tree it had just written. The two storage effects fire on mount in declaration order — load reads, then write-through saves — and the write ran with the value THIS render still held, which is the starter document, straight over the stored one. Under StrictMode's double-invocation the second pass then read that starter back as if it were the user's work. Measured through the real UI: add a Card, two roots and thirteen stamps; reload, one root and nine. The document was gone, silently, on the most ordinary gesture a person makes.

The fix guards the write on the initial document's IDENTITY — there is nothing to persist until the document stops being the one nobody has edited — which is what makes it safe on BOTH StrictMode passes, where a plain "has the load run yet" ref is not: the load sets that flag and the stale write immediately follows it on the same pass. Storage is persistence, never truth (the docs' own storage lesson), and this was the case where persistence quietly wrote fiction. Rejected: ordering the effects by moving the write below the load (they already are — declaration order is not the problem, the stale closure is), and skipping the first write with a counter (indistinguishable from the StrictMode remount).

---

## 2026-08-20 The builder becomes an application, and the house style becomes checkable

Kushagra, overnight: finish the builder — "all features, no stone unturned". What follows is the shape that emerged, and the two decisions in it that were genuinely open.

**Everything the editor can do is now ONE table.** `commands.ts` holds every action as data (id, title, chord, enabled, run), and the keyboard, the ⌘K palette and the right-click menus are renderers over it. The alternative — what the builder had — put "duplicate" in a button's onClick, so giving it a shortcut meant writing the logic a second time in a keydown handler. Two spellings of one action is the entropy this repo keeps paying for, and a command's logic now has exactly one home. The chords are platform-aware (`mod` is ⌘ on Apple and Ctrl elsewhere, decided by the platform rather than by which key was held), and the OTHER modifier must be absent or ⌘D would fire Ctrl+D's command.

**State became a reducer over MANY documents.** A builder holding one document is a page; an app holds several, named, switchable, and independently undoable — history that reaches across a document switch is history nobody can predict. Two decisions inside it are worth keeping: a snapshot carries the SELECTION, so undo restores what you were looking at rather than stranding you on a node that no longer exists; and selection is a LIST whose last member is the primary, because "wrap these two in a row" is the composition gesture this editor exists for and one id cannot express it. Storage migrates the v1 single-document keys and stays what it has always been — persistence, never truth.

**Clipboard subtrees ride the clipboard EVENTS, not the async API.** `copy`/`cut`/`paste` listeners get `clipboardData` with no permission prompt and no user-gesture rules, so a subtree crosses documents, tabs and windows as ordinary JSON with a `kookie-builder/nodes` envelope; foreign text decodes to null and is refused. The async API is kept only as the palette's fallback path, where a gesture exists.

**Slots became seats, and the icon refusal is the interesting half.** A child may sit in a NAMED seat rather than in flow — one optional `slot` field on the node, deliberately not a second `slots` map beside `children`, because a map doubles every traversal in model.ts and every rule in review.ts to express what one field says. A seat serializes as the prop it is. What a seat ACCEPTS is closed, and an icon is not in it: §8 ships no icon dependency on purpose, so the builder has no icon component to name, and `leading={<SearchIcon/>}` would export an import the reader's app cannot resolve. This builder's whole claim is that what it exports compiles; a placeholder that does not is a worse answer than a written refusal.

**Blocks parameterize their CONTENT and freeze their AXES** — the shape agreed on 2026-08-19, now implemented. Prop names derive from the role each text plays (a Heading is a `title`, a Text a `body`, a Button an `action`) because `title` reads at a call site and `text3` does not; the captured words become defaults. Handing back the axes was refused for the same reason it was refused the first time: a block's loudness was its author's decision.

**And the thing only this system can have: REVIEW.** `review.ts` runs the house style as checks over the document — one focal action per surface, distances that differentiate, the retired size-1, every control named, empty and single-child layouts, tone as vocabulary rather than decoration, the heading ladder, orphan parts. It is checkable here and nowhere else for a structural reason: "one loud action" is not a lint anyone can write against arbitrary CSS, because there is no such thing as loud — here `emphasis="loud"` is a rung the system defined and a Card is a surface it named. Every finding selects its node, cites the system's own sentence, and carries a pure fix where one is unambiguous. The law that matters is the round trip: each rule is handed a document built to break it, its own fix runs, and the finding must be GONE. A repair that does not repair is worse than staying quiet.

**Writing the templates then corrected the reviewer twice, which is the part worth recording.** Six starting screens ship, and a law holds every one of them to ZERO findings — they are the brief demonstrated, so if the brief changes they fail CI until they follow. Two rules were wrong when measured against real compositions: rhythm was comparing gaps across DIFFERENT AXES (a row's internal gap does not compete with the column rhythm around it, and no eye measures them against each other), and the single-child rule was flagging layouts that do real work with one child (right-aligning a lone Save button is a composition, not an accident — `gap` is the only prop one child makes inert). Both rules narrowed. Two of the findings were genuine and were fixed in the templates instead: a group at gap 3 inside a group at gap 3, and gap 4 around gap 3.

Also landed: preview mode (the interpreter's existing export mode, so the screen you built is really usable — menus open, dialogs trap focus), an Xcode-style jump bar, a point-anchored context menu built from the real Menu, a per-document appearance, multi-select chrome, drag auto-scroll, and an empty state that opens on the templates rather than on nothing.

Rejected: a scored fuzzy matcher for the palette (a list that reorders as you type cannot be learned — every typed word must appear, and the order is the table's own); freeform canvas positioning, again (§3's outer-spacing rule holds inside the tool or the tool argues against the system); one shared history across documents; storing block parameter names (they derive deterministically from a frozen tree, so storing them would be a second copy of an answer the tree already gives); and `appearance="inherit"` in the export, which is the absence of a statement rather than a statement.

## 2026-08-19 Drag-to-move lands, and a drop names a place in the tree, never a coordinate

The builder's third slice (Kushagra: "I want to add drag to move"). What was open was the SEMANTICS, and three choices closed:

**The canvas element is the handle.** Every stamped node is `draggable` — no grip glyph, no modifier, no select-first. The trade is stated where it bites: text drag-selection inside canvas fields is knowingly given up (canvas text is a specimen; the inspector is where text edits), and components whose own interaction IS a pointer drag are exempted by a catalog flag (`dragOwnsPointer` — the slider, whose thumb rides pointer capture that native drag would race). Rejected: drag-only-when-selected (a second click tax on the most common gesture) and a per-node drag handle (chrome on every element of a canvas whose point is looking like the real screen).

**A drop resolves to (parent, index) by grammar and geometry, drawn as the line it names.** One mechanism now serves palette inserts, block inserts and moves: the walk up from the pointer asks `canContain` and skips the moving subtree, then the index comes from which sibling midpoints the pointer passed ALONG THE CONTAINER'S OWN AXIS (a row measures x, a stack measures y), and an accent line draws in exactly the gap the surgery will use — the gesture and the mutation share one computation, so they cannot disagree. An empty container keeps the dashed into-box. The payload rides a ref, not dataTransfer — HTML5 DnD only surfaces data on drop, and the grammar needs the type while hovering.

**Indices speak PRE-move positions, and `moveNodeTo` owns the arithmetic.** The pointer computes its gap among the current siblings, moving node included; moving later within one parent, the removal shifts everything left, so the stated index would land one late. The adjustment lives in the model op (falsified: removing it fails the law's every downward case), which also means the two gaps flanking the node itself are the same place and correctly no-op.

Tree rows joined both sides (draggable, and a drop ON a row means INTO it when its grammar accepts, else right after it), and blocks drag through the same pipeline as a clone. Verified live through dispatched DragEvents reading the MODEL from storage — the DOM probe lied first (a field's stamp sits on its inner input, so a direct-children scan missed a successful move), the wrong-element instrument mistake caught one more time by disagreeing with a second source. 86 laws.

---

## 2026-08-19 Flat means flat: the floating half-shadow retires

Kushagra, in the Card audit's flat pass: *"in flat world, nothing will cast shadow, including menus and dialog."* Reverses the 2026-08-09 overlap clause ("coverage is information, never none"), which had kept a half-faded cast under floating panes in flat via `floatingFlatFactor` 0.5. The clause was right when it was written and obsolete the day before it was retired: it existed because a flat world had no other way to bound a pane that covers content, and flat regained the hairline on 2026-08-18/19 ("light replaces line has a premise: light") — so a menu panel, being a surface, now draws its boundary in flat's own vocabulary, and the faded cast was two mechanisms doing one job. That redundancy, not the shadow's look, is the argument.

The same conversation settled the neighbouring question — why flat's separation line reaches solid surfaces and not glass. Both materials are supposed to earn separation from their own optics: glass's optics (veil, blur, ring) alter what shows through it, so its extent is visible in every legitimate placement — its zero-signal case, glass over a blank ground, is a misuse the convergence rule already routes to solid. Solid's optics are covering, and its zero-signal case — a white card on a white page — is the system's most ordinary scene. The hairline is a patch for the one material whose honest rendering fails in a legitimate scene; glass never qualifies. Recorded here because the asymmetry looks arbitrary until stated, and the next reader will ask.

Mechanics of the retirement: the generator emits the flat floating token as the list-legal no-op layer (never `none` — it poisons the fallback chains), `floatingFlatFactor` is deleted, the fade-derivation law is rewritten to pin the no-op with elevated as its negative control, and the menu's mounted law reverses its own old title — "a flat popup casts NOTHING" — asserting every computed layer invisible, both falsified against the restored fade. Rejected: keeping a fainter fade (any nonzero cast re-commits the two-voices problem); `none` as the emitted value (the 2026-08-17 pool deletion is the scar).

---

## 2026-08-19 The surface radius band is even — a ladder judged as a ladder

Kushagra, on /preview/card's new side-by-side sizes: *"Size 3 and 4 radius seems too close, or rather, size 1 and 2 aren't rounded enough."* The band ran 20/25/40/45 — treads of +5/+15/+5 — because the 2026-08-17 port anchored the lab's two judged cells exactly (mini card 25, card 40) and extrapolated the ends, so every cell had been judged and the SEQUENCE never had: four sizes read as two. Now 24/32/40/48 with the overlay-only top step at 56, equal 8px treads. Size 3 keeps the lab's 40 (the one value judged at card scale); size 2's per-cell anchor gives way to the ladder, named in config where the old anchor sentence stood. Values are the arc (fallback-engine) rendering and the squircle knob scales them uniformly, so the evenness holds in both renderings; dialogs and menus move with the band by construction, which is why the top step moved too (a size-4 overlay must stay rounder than a size-4 card).

Rejected: spreading only the extrapolated ends around the untouched lab pair (16/25/40/56 — a steady ratio, but it makes size 1 LESS round, the opposite of the eye's finding); bumping size 4 alone (fixes one adjacency and leaves the bottom pair reading alike).

**The LEVEL ladder followed the same hour** (Kushagra: *"small to medium jump is less compared to medium to large"*): with large evened, the default card's corner ran 8 → 16 → 40 across small/medium/large — +8 then +24, the size ladder's disease one axis over, because large had been re-priced twice (lab port, then the evening) while medium never moved. Medium's surface half is now 12/18/24/30/36 (even +6 treads), which puts the default card at 8 → 24 → 40 — +16 a side — and retires medium's old size-3 anchor (16, the pre-lab flat corner) the way large's went in the port. The equal-treads law extends to medium and was falsified against the old band; small is judged fine and stays outside the law on purpose — its +1/+2 treads would fail the spelling, and pinning a band nobody re-judged would be the law inventing a judgment. Rejected: the geometric midpoint (~11/14/18/22), which sits between the neighbours by ratio while breaking the even-treads rule the size ladder had just earned.

The audit-method note, recorded for the next component: a per-cell judgment does not compose into a ladder judgment — the new preview's job is exactly to put the ladder in one row where the sequence can be read. And a ladder judgment does not compose across AXES either: evening the size ladder inside one level is what broke the level ladder at one size.

---

## 2026-08-19 An interactive card is a block — the 2026-08-06 display item closes

`<Card render={<a href/>}>` — the pattern §10 names by hand — computed `display: inline`, because the interactive arm's reset stood down seven UA properties and never `display`. An inline box holding block children shatters into per-line anonymous fragments, each painting its own slice of seal and corner with the text spilling free; the audit that found it (2026-08-06) parked it on the open list, and it stayed invisible for thirteen days because every link-card specimen sat in a grid, whose items CSS blockifies for free. The per-component preview structure landed 2026-08-19, its in-use demo put a link card in plain flow for the first time, and Kushagra screenshotted the shatter within the hour — the new judging surface earning its keep on day one.

The fix is the one the open item sketched: `display: block` on `.kui-surface:where(button, a)`, making "rest is pixel-identical to a plain Card" true of the box and not only the dress. The visible trade, named when the call was made: a pressable card in plain flow used to shrink-wrap (a button is UA `inline-block`) and now fills its line like every other card; a call site that wants the old shape states a width. The law reads the COMPUTED display on all three elements in plain flow — grid-hosted assertions would pass with or without the fix, which is exactly how the defect survived — and was falsified by deleting the declaration (one failure, the right one). The docs demo's `display: block` workaround shipped and died the same day.

Rejected: leaving it to call sites (the promise "rendered as a link it becomes interactive" held only inside grids — half a promise); `inline-block` to preserve the button's shrink-wrap (it fixes the anchor by making the BUTTON the odd one out against the plain card, and a card that hugs differs from a card that fills by element, which is the inconsistency the identity rule exists to kill).

---

## 2026-08-19 The builder learns the container tiers, and the tier table goes public

The responsive slice, same day as the builder itself (Kushagra: "How will [it] work with container queries? … Yes"). The design premise held end to end: because §2's tiers are container-keyed rather than viewport-keyed, a builder needs NO device frames and no second rendering mode — the canvas needs a width.

**The model speaks the package's own `Responsive` shape.** A stored prop value is a string or `{ initial?, sm?, md?, lg? }`, and the export is the package's own spelling — `direction={{ initial: "column", md: "row" }}` — with three rules the serializer enforces rather than hopes: tiers emit in resolution order however the document states them, `{ initial }` alone collapses to the plain string (the false-boolean rule one value shape over: only one spelling of a statement may exist), and an unknown tier or a per-tier value on a non-responsive prop THROWS. Every tier's value is still a pick from the same closed list — responsiveness multiplies where a token applies, never what a value may be. `tierNames`/`tiers` join `componentAxes` as public exports so the tier chips and the width readout derive names and boundaries instead of restating 30/48/64rem.

**The inspector grows tier chips, not a breakpoint editor.** A responsive prop shows its base picker, one indented `@ tier` picker per stated override, and quiet `+ sm + md + lg` chips for the rest; adding a tier copies the base so the override is immediately visible, unsetting the last override collapses back to a plain value. `container` joins Box's entry as a real prop, carrying its §2 trap as an inspector note (a container left to shrink-wrap renders 0px).

**The canvas is a real query container, and the width handle is a label on real behaviour.** The canvas content sits in a `<Box container>` layout-sized by a drag handle (arrow keys too), so a per-tier value inside answers the canvas's room exactly as it will answer an app column's — measured live before shipping: the same document computed `flex-direction: row` at full width and `column` at 473px, through the real resolver, no simulation anywhere. The probe measured the WRONG element first (the outer Stack, which is always column, matched a loose "flex with a button in it" scan) — the wrong-element instrument mistake again, caught because the wide reading disagreed with the boundary arithmetic.

All three new serializer rules were falsified against sabotaged code (unordered emission, a dropped tier, the responsive gate removed) and each failed exactly the law written for it. Rejected: window classes in the builder (they answer "which shell", an app-architecture question a document that lives INSIDE a shell cannot ask); device-frame presets (a frame is a width wearing a costume, and the costume implies fidelity the tiers do not key on); free-width input beside the handle (a stated px is a raw length — dragging quantizes nothing, but it also STATES nothing into the document, which is the difference).

## 2026-08-19 The builder ships: a constrained composition editor, and the axis lists go public

Kushagra's ask, verbatim in spirit: a visual GUI builder — drag and drop components, adjust spacing, export React code, "but not just any spacing… only using kookie ui tokens. Overriding or adding custom values will be hard." The reading that shaped everything: the builder does not ADD constraint to an open canvas the way every commercial builder does (and loses), it WITHHOLDS the escapes from a system that is already closed — so the product is the system's refusals given a UI. Agreed before building: live canvas inside a real `<Theme>` (no artboard), blocks as frozen subtrees with content-only parameterization, one Theme identity per document, local-first persistence.

**Where it lives:** apps/docs `/builder`, a bare-viewport three-pane route (palette+layers / canvas / inspector+theme), chrome `@kookie-ui/react` end to end — the docs' own no-third-party-UI stance applied to an editor. "Drag and drop" resolved as TREE SURGERY, never coordinates: a drop inserts into the nearest ancestor whose grammar accepts the type, palette insertion lands beside the selection, and no gesture can state a distance — gaps and padding are Select pickers over the layout-space indices.

**The mechanism is four small files over one table.** `catalog.ts` is ENGINEERING §1.1 applied to the builder itself: one entry per package export (prop schemas, containment grammar, preset subtrees), with every axis list DERIVING — which forced the API decision LOG 2026-08-16 recorded as open ("exporting the axis value lists from the package's public API… waits"). It stops waiting: **`componentAxes` is public** — one lowercase object (the coverage laws take uppercase value exports as components, and `themeAxes` set the shape), every list derived from the single home that already owns it (`SIZES`/`RUNGS`/`MATERIALS`, config's tone table, `fontWeight`, `fontSize`, `space`). The inspector generates itself from the schemas; its "Not here, on purpose" section renders the component reference's own `refusals`, which is the part no other builder can have — a missing knob that carries its argument. `serialize.ts` exports idiomatic JSX (real imports, only stated props, a Theme wrapper only for axes differing from `themeDefaults`) and THROWS on anything outside the catalog rather than degrading. `render.tsx` is the interpreter; canvas mode stamps `data-b-id` (the entire selection mechanism — one listener, no editor props on any component), export mode renders clean.

**The two anchor laws, both falsified before trust:** coverage (every export placeable or excluded with a ≥40-char reason — ScrollArea is the one exclusion: its job needs a stated raw height, the exact value class the builder refuses) and ROUND-TRIP IDENTITY — the exported code is compiled (esbuild) and rendered against the interpreter's export mode, byte-identical modulo React's positional useId salts, which are normalized order-preserving so aria wiring must still correspond. **The sabotage pass earned a law the day it ran:** `effectiveProps` is ONE home shared by serializer and interpreter, so a prop dropped THERE moved both sides identically and round-trip stayed green — agreement is not fidelity; a third law now pins the export to the document's own statements. Also found live, by running `pnpm dev` (the command this repo's history says nobody runs): the starter document minted ids from a module counter during render, Strict Mode's double-invoked initializer advanced it between server and client, and hydration saw two documents — stable depth-first ids for render-time trees (`withStableIds`), the global counter only for post-mount gestures.

**Closed with it:** specimens.tsx and matrix-explorer.tsx's tone-list comments claimed "the package exports the type, not the value" — no longer true, so the comments now state what the literals still own (the judged sweep ORDER; membership has the package home), and the preview's `SIZES` copy derives outright.

Rejected: freeform canvas positioning (violates the outer-spacing non-negotiable by construction); raw lengths anywhere in the builder, including the one that excludes ScrollArea; JSX IMPORT (round-trip in the other direction is open-ended parsing — the document format is truth, code is a build artifact); axis-level props on saved blocks (reopens exactly the freedom the system closed — blocks are frozen subtrees until real use argues otherwise); exposing `style` as a marked escape panel (every escape in the tool is an escape in every exported block forever — waits for a real need, the tone-set rule).

## 2026-08-19 A solid surface hosts glass: the pane scopes the region, never the author

The 2026-08-18 audit's headline: `useMaterial` consulted the pane mark before the caller's own `backdrop` and before the ambient region, so `pane === "solid"` returned solid unconditionally — and since every Card, Button and field wraps its children in a pane scope that defaults solid, no explicit placement statement was expressible inside any card. The prop, the `<Box backdrop>` region and the public `useMaterial({backdrop:true})` were all silently discarded, while four pieces of shipped prose promised the opposite. Kushagra's call, verbatim: *"Bug, the whole point of solid surface is to be able to host glass."*

The distinction that fixes it: glass-on-glass is PHYSICS (the backdrop is spent, overriding the author is correct), but solid-hosts-nothing was an INFERENCE, and an explicit statement is the author contradicting the inference in writing. So `GlassScope` now resets `BackdropContext` in both arms — a region marked outside a pane stops at its edge, keeping the unmarked default exactly as cheap as before — and the solid arm falls through to `opts?.backdrop ?? region`, so a statement made inside the pane resolves the theme's material. The reset also closed the audit's third finding for free: a nested `<Theme>` inside a glass card used to re-open the stale outer region and paint full glass on glass; with the region reset at the pane, its in-flow subtree resolves solid unless re-marked.

Two companion repairs from the same audit cluster: Card's `render` escape now wraps the composed RESULT in the scope rather than only `children` (a render target that keeps its own children was rendering them outside any pane — measured as a Button painting a second backdrop-filter inside a glass card), and Card's lens gate excludes `on-glass` like every sibling consumer (an on-glass pane declares no backdrop-filter, so the map it minted was unreachable by construction).

Rejected: keeping the veto and fixing only the prose (the case list §10 itself gives for a backdrop — a map, a canvas, a feed — is content a consumer puts INSIDE a card); a dev warning on the discarded statement (a warning documents a defect instead of fixing it).

---

## 2026-08-19 controlLook is deleted

Kushagra: *"Delete it."* The fill-first flip (2026-08-17) pointed both of the axis's values at the same dress roles, so the prop stamped an attribute and moved nothing — held two days by an identity law precisely so this would be a decision rather than a drift. The deletion is total: no Theme prop, no `[data-control-look]` emission, no look-table rows for the field and mark families. The sheets consume `--dress-field-*` / `--dress-mark-*` directly, one indirection fewer, and a law asserts the emitted css carries no trace of the old attribute.

What the deletion bought beyond entropy: the 2026-08-17 conformance trap cannot recur for these families. The look blocks landed on the THEME element, nearer to a field than the `<html>` carrying `data-contrast`, which is how high contrast went inert the day outlined took a live value; the dress lives only in the appearance scopes now, and the HC pass stands `--dress-field-edge` / `--dress-mark-edge` down to `initial` with plain specificity doing the rest — the scoped-arm machinery survives only for `surfaceLook`, the half that still exists. The guarantees the axis's sixteen laws carried were each re-keyed, not dropped: the dress edge is live unconditionally, states outrank it, `surfaceLook` cannot reach a field, and the bare render equals the themed render.

Rejected: re-separating the two values (nothing in the system wants a second control dress; the 2026-08-10 split's cell — a plain card holding dressed inputs — is now simply the only state), and keeping the prop as a reserved no-op (a lever every call site can reach and none can feel).

---

## 2026-08-19 Base UI 1.7 stays, and the keyboard keeps the entry flight

The 1.6 → 1.7 bump arrived with Tabs/SegmentedControl (its fixes are on those primitives), and it changed a fact this system had built on: 1.7 stamps `instantType: "click"` for any trigger press whose `nativeEvent.detail === 0` — which is every keyboard Enter/Space, and every programmatic `.click()`. The flight runner bailed on any `data-instant`, so a keyboard user got no entry animation at all while a mouse user got the full silhouette flight — a decision this system never made, measured live (zero observer records across a whole keyboard open).

The call: keep 1.7, exempt `"click"`. An open is an open — the same physics for every input; stillness belongs to `prefers-reduced-motion`, never to the keyboard. Both homes changed together (the runner's bail and the stylesheet's `[data-instant]` stand-down now read `:not([data-instant="click"])`), and the law drives a real keyboard through CDP with the pose watcher armed before the press, falsified against the unconditional bail. The other instant types keep their suppression: a dismissal the pointer committed to and a menubar group hop are genuinely not reveals.

Rejected: reverting to 1.6 (the bump was deliberate and its fixes are real); distinguishing keyboard from programmatic clicks (Base UI conflates them at `detail === 0`, and a synthetic open flying in a test harness is harmless — the laws that need stillness land their panels explicitly).

---

## 2026-08-19 The veil takes opaque twins — an alpha source multiplies through a mix

The 2026-08-17 alpha-ramp move made the mid rungs' and both dress families' fills alphas, and the material veil is `color-mix(source alpha%, transparent)` — a formula whose percentage is only the veil when the source is opaque. An alpha source multiplies: a glass field's designed 62% veil measured 4.13% on the shipped playground, its value and placeholder sitting on raw blurred backdrop, and only the loud rung (opaque solid) kept the defense the ladder was judged with.

The fix is the recomposition law used forward: `aN` over the seal IS step `N`, so every moved source gains an opaque twin (`--tone-soft-solid` per tone, `--dress-*-solid`, `--disabled-fill-solid`) and one rule — `.kui-control[data-material]` — re-points the generic roles to the twins wherever a material is stamped. Solid controls stamp nothing and never see it; on glass, the ladder renders exactly the colours it was judged with. The count-law that guards material scopes learned the one sanctioned shape (`--X: var(--X-solid)`) and strips it before asserting, so a material block naming a tone role in any other shape still fails.

Rejected: painting a seal underlay beneath the veil (it whitens the loud rung the ladder already judged); mixing the seal into the formula (color-mix averages, it does not composite); walking the sources back to opaque steps everywhere (re-opens the dark-card vanishing-fill defect the alpha move fixed).

---

## 2026-08-19 The dead palette goes per-mode, and conformance reaches the places light cannot

Four repairs, one session, all from the 2026-08-18 audit's confirmed list.

**Dead recedes from live, in both modes.** The disabled remap's literal `a3` was one step under dark's live wells and byte-identical to light's — a disabled button in light computed exactly a live medium button's box in all four painted channels, and an icon-only disabled button was indistinguishable from a live one. `disabledSteps` states "one ramp step under the live rest" per mode (light fill a2, dark a3), and the dead BORDER moved onto the ramp too: the old opaque `--neutral-6` out-contrasted a live field's alpha edge in dark, so the one disabled control drew the strongest boundary on the row — the invalid-in-dark defect's shape, on the other state.

**High contrast reaches glass.** An HC glass pane measured 1.000:1 on every side — border a literal `transparent`, the conic ring painting unchanged, the fallback the sheet's comment relied on unreachable. The ring is light and cannot be strengthened, so under HC it yields (`--material-ring-opacity: 0`) and an element-scoped arm hands the pane `var(--tone-border)` where the tone resolves. Dark's floating veil was baked from literals and is now a token the HC pass re-declares, so the one pane covering live content defends like the cards beside it.

**Reduced transparency actually seals.** The sealed-veil arm was (0,2,0) under the dark-floating fill rules' (0,3,0), so the preference stripped the blur and LEFT the translucency — a menu stayed half see-through with raw page content reading through the rows. The seal is restated at the floating rules' own weight, and the sealed pane's edge routes through a new `border-sealed` look slot (outlined stands down to the tone hairline; filled hands the sealed pane the same dress edge every other card wears — the old chain died when outlined's border became a live `transparent`).

**The flat world gets its hairline back.** "Light replaces line" has a premise; `depth="flat"` declares the ring, pool and cast away, and an ordinary outlined Card measured 1.026:1 against the page with no border and no shadow. `[data-depth="flat"][data-surface-look="outlined"]` stands the look role down so the tone hairline resolves at the element; `filled` keeps its dress edge; elevated is untouched. v0, eye pass.

---

## 2026-08-19 Elevation's leftovers, the a11y viewport, and the counts stop being counts

**Glass matter completes.** Quiet's cast was a literal `none` written before the pool existed — the one glass control with no inner seat shade while the medium beside it had one; it reads the pool now. A pressed loud glass button never tightened (the press chain resolved the glass value before the active variant could be consulted, measured byte-identical under a held pointer): the transmitted press rows exist per thickness now (`fadeShadow` over `controlChromeActive`, like everything glass casts) and the press rule consults the glass-active chain first. The disabled glass hover filter takes the same `:not()` guard every other hover rule carries — a dead glass control brightened under the pointer. And `--kui-control-chrome-medium` is deleted outright: emitted, declared in three world scopes and stood down in the disabled arm, for a value nothing read since the fourth flip.

**The menu's viewport stops being focusable.** ARIA voids `role="presentation"` on any focusable element, and Base UI stamps a tabindex on the ScrollArea viewport unconditionally — so the first adoption exposed a nameless `generic` between `role="menu"` and its menuitems (read off the CDP accessibility tree) and added a tab stop inside a roving-focus widget, while the wrapper's comment claimed otherwise. `focusable={false}` strips the attribute in the menu; the standalone ScrollArea keeps its tab stop, because a bare scroll region must be keyboard-reachable. The scrollbars and corner carry `presentation` too — they were landing as roleless children of the menu's role.

**Three tally laws became structure.** `{loud: 9, medium: 3, quiet: 2}`, a 14, a 15 and a 17 — each a census only its own comment explained, failing on any legitimate refactor and passing on the same number of wrong arms (the 2026-08-08 anti-pattern, re-shipped under time pressure). The claims they buried are what got written: one bare resting definition per rung, and per-thickness SYMMETRY for everything material — every arm that names one thickness names all three, so a merge that leaves one thickness reading another's tokens breaks the equality while an honest refactor moves the counts together.

---

## 2026-08-19 The tab rule goes back to left + width, and the audit that made it necessary

The rule shipped drawn by BOTH inline edges, argued as free structure for a motion not yet designed: two edges can travel at two speeds, and it "costs the same two declarations either way." The cost claim was false. Base UI computes `--active-tab-right` as `scrollWidth − left − width`, in the tab list's SCROLL coordinate space; CSS resolves an absolutely positioned box's `right` against its containing block's PADDING box. They agree only while the bar fits. Measured, four ordinary tabs in a 200px column: the rule rendered ZERO pixels wide, degrading a pixel per pixel of overflow on the way there — the ordinary narrow-window path, invisible to the suite because its viewport is pinned wide, and invisible to the law because it mounted an unconstrained bar. Kushagra: "why is this controversial? whatever everyone else does." `left` + `--active-tab-width` is Base UI's own example and every other library's, and the two are computed in one space so they cannot disagree. Two edges is a thing to reach for when a motion needs them, and it will need a coordinate fix first. Rejected: `overflow-x: auto` on the list, which makes the rule both zero-width AND mispositioned; and subtracting the overflow, which keeps a spelling whose only argument was that it was free.

## 2026-08-19 Audited the day after: the components trusted the shared layer, and the laws trusted the components

Thirty-one agents over six lenses, every finding put to a skeptic, the three worst re-measured by hand. Twenty-three survived, deduping to nine defects and eight laws that could not fail. **One mistake, five times: the components inherited the shared control layer by ASSERTION rather than by measurement, then the laws were written from the same assertion** — each defect arrived with a confident comment stating the false premise and a law reading that comment's own inputs instead of the rendered output. The worst was invisible text: `--color-thumb` and `--color-text` are the same token in dark by construction, so the chosen segment's label was painted in its own fill at 1.00:1, with `contrast="high"` moving neither, while three separate laws asserted the ink and the fill against their own tokens and never against each other. Closed by minting `--color-thumb-label` beside the fill it answers to — both entries values the generator had already solved, nothing newly judged. Two of the five were defects this repo had already closed and cited BY NAME in the comment that re-committed them: the missing border term is audit D3 (2026-08-06), and a disabled state written in non-tone roles the shared remap cannot reach is the slider rail (2026-08-07), now on its fourth appearance. The laws went 42 → 51 and the segmented file gained the `@ts-expect-error` refusal probes it shipped without — which is exactly how a `nativeButton` the mark family had closed by name got back in and broke Space selection. Recorded not fixed, because it is systemic and pre-existing: Base UI's composite navigation reads its own React direction context rather than the DOM's `dir`, so RTL arrow keys move focus — and on the segmented control the VALUE — in the wrong direction, on every component in this package that never renders a `DirectionProvider`, Slider included since 2026-08-06.

---

## 2026-08-18 Tabs and the segmented control: two objects that look alike, and the role is what separates them

Built together because the mistake worth preventing is reaching for the wrong one, and shipped as two components sharing no CSS: a tab bar switches what is under it, a segmented control sets a value in place.

**The segmented control is a radio group, not a row of toggle buttons.** Base UI offers both and they announce differently — `ToggleGroup` renders `role="group"` holding `aria-pressed` buttons, `RadioGroup` renders `role="radiogroup"` — and picking one of several IS a radio group. It also gets arrow-keys-select for free, which is what every platform's segmented control does. The multi-select formatting case is genuinely toggle buttons and genuinely a different component (§11's own row). Recorded because it closes the 2026-08-06 audit's deferred question — how selection state is spelled on a control the system did not have — with a real role from the primitive rather than an aria attribute bolted onto a Button, and because "it looks like buttons so use buttons" is the reasoning a later reader will re-try.

**Two decisions were made by NOT building something.** The segmented control has no indicator element: Base UI's Tabs measures the active tab for you, RadioGroup does not, so a gliding thumb here would mean writing the measurement ourselves for a motion that is being designed in another room — the curtain's own lesson (2026-08-17), one week old. The selected segment paints its own box; when the motion pass wants one object gliding between homes, the measuring hook arrives with it. And `segmentInset` is numerically `switchInset` and was deliberately not merged with it: both mean a grip in a channel, but the second member of a family self-keys and the third promotes, and renaming a shipped token to earn a family name needs a third caller.

**Tabs' indicator DOES ship, and it re-measures at interaction time.** Named as the third bounded exception beside the floating layer's flight measurement and the lens, rather than let through quietly: CSS cannot read a sibling's box, so an indicator that is one object has no other implementation. It is drawn by both inline edges rather than by an offset and a width — two edges can travel at two speeds, which is what a rule that stretches toward its destination needs, and it costs the same two declarations now. Physical `left`/`right`, against this package's usual preference for logical insets, because Base UI's measurement is physical and a logical pairing puts the rule on the wrong side of an RTL bar.

**Rejected:** shadcn's `TabsTrigger` / `TabsContent`, the first time this package has declined shadcn's vocabulary after taking it for Menu, Select, Dialog and AlertDialog — a *trigger* here opens a floating layer, and a tab opens nothing. Exporting the indicator (structure, not API: a consumer who must place it is one who will forget). A louder fill or a heavier label for the active tab (a fill reads as a button among links; semibold is wider than medium, so the whole bar reflows on every switch). `--tone-ink` for the tab's ink, which exists only under a stamped `[data-tone]` and would have quietly resolved to nothing on a component that refuses tone.

**Two laws were thrown away for being unfalsifiable, both caught by their own sabotage pass.** "The rule is drawn by both edges" read `left !== "auto" && right !== "auto"` — which cannot fail, because getComputedStyle resolves both insets to USED values on a positioned element, so `translate` + `width` reports a length just as happily; rewritten to nudge each variable and watch the box answer. And "one glass per stack" asserted that segments carry no backdrop-filter, which passed with the `GlassScope` deleted, because a segment never asks for a material in the first place; rewritten to put a material-expressing component inside the track. The 2026-08-03 lesson yet again: a law one indirection short of the thing that could be wrong.

Base UI was bumped 1.6.0 → 1.7.0 in the same change, and both of its fixes are on the primitives this uses: the Tabs pre-hydration script is excluded from client bundles, and RadioGroup's form values align with native submission. +229 bytes gzipped for both components; 42 mounted laws; `segmentInset` and `tabRule` are v0 for the eye pass.

---

## 2026-08-17 The lab becomes the default: chrome, ring, radius, squircle — and the day's laws end 1345 green

The material lab stopped being a reference and became what the package ships. The chrome roles took the lab's literals — `controlChrome` is the LIT rung verbatim (contact + an 8/20 drop + light's inset under-shade; the white inset rim retired, the gradient catch says it better), with `-medium` and `-active` variants beside it and the glass POOL (the shade settling inside a pane — matter, so it joins the cast in both depth worlds). The material's edge became the RING — a masked conic `::after` wrapping the squircle, spectral on `thick`, the border itself `transparent` — after the 1px hairline it replaced was measured producing BOTH judged double-line defects (the button stripe, the dialog's doubled edge). The rim went three layers and its LIFTED variant was deleted: elevated already speaks through cast and pool, and a second brighter rim was one fact in two homes as paint. The surface radius band was re-authored to the lab's arcs (top steps 40/45/50) under `@supports (corner-shape: squircle)` with one knob, 1.613 — the lab's own 0.62 inverted — and floating panes at 1.75 (Kushagra, by eye: "just a little more radius, only in squircle"). Loud glass runs HOT (`oklch(from … calc(l*1.04) calc(c*1.6) h / 0.8)` — derived twice wrong from the wrong source chroma before being measured against accent's own rendered solid), glass ink remaps landed (muted/faint/border/row-wash/keycap as alphas), dark floating panes LIGHTEN toward white (46/62/78%), and the scrim re-priced to 0.18/0.32 at blur(8) saturate(.8) — it now out-frosts the near-clear ladder on purpose, because the ladder went sharp and a scrim's job is pushing the whole app back. Rejected on the way: keeping the hairline beside the ring (double edge), the solid seat pool (`pool.solid` killed — it drew the elevated world's double bottom line), and per-family glass re-pricing (the evidence was tuned against the lab's own blur defect). Depth's default flipped to `elevated` with the port — light is the world's resting state — and `flat` spells `0 0 0 0 transparent` because `none` is illegal inside a shadow list once the pool joined it.

## 2026-08-17 Material expression becomes placement: the backdrop fact

Kushagra: "a button should behave non glassy until it's over a hostile background — there is no point of having a glass button unless there is something behind to refract… cards have no reason to have thin material, yet if I want dropdown menu to have thin material, I am forced to use it on theme." The resolution keeps §10's one-value doctrine intact and gates EXPRESSION on placement: `backdrop` is a boolean placement fact — never a thickness — as a REGION mark on Box (`<Box backdrop>`, React context; placement is a fact about a place, stated once) and a per-component escape on Card (renamed from `overContent` — the new name says what glass actually needs), Button, TextField, TextArea and SelectTrigger. Resolution order: own prop > region > solid; floating panes pass `true` by construction; a solid pane scopes its subtree solid. The performance half is the point: theme `thin` no longer makes every in-flow control pay a backdrop-filter — measured on /preview, flipping a region's mark drops every filter inside it. Rejected: expression-by-default (the shipped first cut — a glass control on a calm card refracts nothing and pays a full readback), a `glass` boolean (still owes a thickness), and marking components instead of places as the primary spelling (a toolbar of five controls is one fact, not five props).

## 2026-08-17 The fill-first flip: fields and marks become wells, and three old rules die of it

The lens the port earned — fill is identity, light replaces line — applied to the components still wearing the border-first world: a field's resting identity was a solved hairline on the seal, an unchecked checkbox "IS its hairline" (audit D2's own sentence). Both families now rest on the dress WELL with the dress edge supplementing (Kushagra: "a field resolves to a light fill solid, border supplements… there's just one 'look', the right look"). Three standing rules died as consequences, each recorded rather than quietly deleted: the field family's fill PIN (its reason — the material's mix ramp moved — was spent when control-scale material moved the ramp into the sources); the 2026-08-10 boundary-hover rule and its `edgeHoverMix` config value (both families now step their fill, and keeping the border mix made a hovered field move in two currencies — Kushagra: "hover too aggressive"; a config value no rule consumes is a lever, the `bold` deletion's sentence); and `controlLook`'s two answers — outlined and filled now emit byte-identical declarations for the field and mark families, held by an IDENTITY law so re-separating them is a decision made in the open. Whether the inert prop survives is Kushagra's recorded open call. The flip also broke `contrast="high"` silently — the look role's value at the Theme scope beats the `<html>`-level stand-down by inheritance proximity, so the request reached NO boundary on any family, measured byte-identical in both appearances — fixed with look-scoped stand-down arms derived from `lookAxes`. The lesson is §6's oldest one wearing new clothes: a stand-down must land where the value it stands down actually lives.

## 2026-08-17 Elevation goes selective: the fourth flip, and the field's last

Kushagra, from a screenshot where Cancel floated exactly as hard as Save: "when elevated, cards, buttons with highest emphasis or the darkest fill may elevate, but why should medium emphasis or text area or text field elevate at all?" The rule that survives: depth separates the FOCAL and the FLOATING; everything else sits in or on the plane. Loud casts and catches; cards, popups, grips and the keycap's relief keep their role-semantics depth; the medium rung and the whole field family stopped casting — a medium fill is a wash ON the plane, and a well is carved INTO it, which is the fourth flip of the field-elevation question and the first one made under the fill-first identity (the third flip's premise — a field is a raised control like its button — died with the bordered box). On glass those rungs keep the POOL alone (`--kui-ct-pool-glass`, matter not lift); the press-tighten rule re-keyed to `[data-emphasis="loud"]` so a pressed medium button cannot resurrect a shadow its rest no longer owns. Rejected: standing the world's medium chrome down globally (the variants stay for the world scopes; no rung consumes them at rest).

## 2026-08-17 The soft rungs, the track, the dead palette and the dress go alpha — a fill states itself relative to its ground

Kushagra, on a dark AlertDialog whose Keep-it button had no visible fill: "we have solved it by how we do hover states on dropdown, that comes off nicely, why are buttons not?" The diagnosis: the menu row's wash is the ink at low alpha — RELATIVE, so it separates from any bed — while `--tone-soft` was an opaque indexed step priced against one bed, invisible on a panel one step away. The generator already owned the machinery (`alphaOver`, the a-ramp solved against the seal), so the fix is pointing roles at it: `soft` = a3/a4/a5 with dark ONE STEP UP (dark's 2→3 delta sits under a JND on a panel bed — compression at black, the focus ring's own per-mode precedent); `--color-track`; the disabled remap's fills (a3 — a dead off-switch at a dark card's pooled bottom measured invisible, the same bug in the remap's own home); and the look dress for fields and marks (`--neutral-aN`), with the SURFACE family deliberately opaque — a pane SEALS, and alpha nesting died by eye in 2026-08-04. Non-tone roles gained the one dead factor, `--disabledDim` (70%): both grips dim in lockstep (the full melt to `--tone-soft` stays the recorded failure — one indistinguishable capsule — and full-strength read live), and writing the rule caught the slider's dead RAIL, which reads `--color-track` directly and had never dimmed — the disabled-slider-handle shape's third appearance.

## 2026-08-17 The grips and the keycap leave the button's chrome; the cap's edge leaves the tone system

The lab port turned `--control-chrome` into the lit BUTTON chrome — an 8/20 blast plus an inset under-shade priced for a 32-44px box — and three role-semantics consumers were still reading it: both grips (swollen halo, a drawn line inside a white circle) and the keycap (a bare cap read as a small floating button). Each got its own cap-scale value: `--grip-cast` (contact + a short drop), `--kbd-relief` (top-face catch + a whisper of drop — a key is pressed INTO its surface, so its depth is relief, reversing 2026-08-08's chrome read). The slider thumb's solved hairline went with it (the switch thumb never had one — "a hairline the colour of whatever sits behind a MOVING part is a halo in one of its two homes"), and Kbd's edge went achromatic (`--kbd-edge`): a cap's relief must read identically on any bed, so tone now moves the cap's fill and ink and the tone-blind edge is law-asserted as an equality, not dropped.

## 2026-08-17 ScrollArea ships as one export, Menu scrolls its list instead of its panel, Select waits on a measurement

Custom scrollbars over NATIVE scrolling: Base UI keeps the platform's overflow and momentum and only draws the bar — an overlay alpha capsule (the a-ramp again), no track, visible only while scrolling or hovering, in fast and out slow on the paint clock. ONE export: the viewport, bars and corner are assembly, not API (§10's anatomy criterion), and the refused props each reuse a recorded sentence (size — Progress's; tone/emphasis — the instrument rule; material — it draws INSIDE a pane; orientation — the content decides). Menu adopted it: the popup keeps glass, corner, bounds and cast, the viewport inside carries the padding, the ring clearance and the scrolling — and the adoption produced two real regressions the existing laws caught: `panelSeam` read the popup's now-zero padding (every submenu sat one padding above its trigger; the function's own comment had warned against exactly this indirection) and the viewport was content-box, overflowing its clipping popup by 2×padding. Both falsified against the pre-fix code. Select deliberately did NOT adopt (noted in select.tsx where the wiring would go): the overlap placement and the curtain both care who the scroll container is, and that is a measurement, not an assumption. Two instrument lessons worth their cost: a synthetic `el.click()` makes Base UI stamp `data-instant`, which the entry runner honours — the flight looked dead in a probe and was correctly suppressed; and real driven input is slow enough that an entire entry can finish between two statements, so the flight laws arm a MutationObserver before the press instead of sampling a fixed frame. Also with the day: overlay padding steps one size up for the WHOLE family (promoted from the alert's arms — the dialog was judged under-padded for the alert's own reason), and the `no JS at interaction time` law was rewritten to read component SOURCES for interaction handlers (the old one asserted `:hover` appears in a stylesheet, which could not fail).

## 2026-08-17 The preview is held to a written composition standard, and information design becomes a rule

Two passes over apps/docs under Anthropic's frontend-design skill, then a repo skill of our own (`.claude/skills/composition`: Gestalt and the classical principles as checkable rules in the system's vocabulary — proximity as ≥2-step gap contrast, one figure per surface, rhythm off the scale only, proportion as size-matched innards). The Dialog section had been wearing the ALERT's content ("Delete workspace?" — §25's boundary run backwards) and was re-drawn as what a dialog is: a task modal, with size-proportionate controls (a size-3 dialog holds size-3 fields and buttons — the call site's job, since §24's index prices only the box). Swept: 22 size-1 texts off composed surfaces (§15's own retirement, finally enforced), two toneless-loud primaries to accent (one figure), flat rhythm in five compositions, a separator dividing what distance already divided. And a rule that outranks taste, now a standing memory: helper text must carry what a label cannot — a consequence, a scope, a constraint, a disabled reason — never a DEFINITION of the control ("Members sign in with a second step." under a two-factor switch is filler; no real settings row explains what two-factor means). No eyebrows, ever, joined it in the same memory.

## 2026-08-17 The one component with a full state machine and no motion was the card you can press

Asked plainly — *"is there any component left that doesnt have our motion principles?"* — and the honest answer took a measurement rather than a reading, because the gap was in a component nobody would list. Mounted a `<Card render={<button/>}>` beside a Button:

```
card:    transition-duration: 0s        translate: none
button:  0.22s paint / 0.55s geometry   translate: 0px
```

Its fill DID step white-to-grey on hover. It just snapped there, its box never moved, and its focus ring appeared rather than landing.

**It is a dating artifact, not a decision.** Card-as-button shipped 2026-08-03; the motion system landed 2026-08-09/10 and was written against `.kui-control`. §8's roster names button, mark, field, select trigger and slider grip — every one of them a control — and an interactive SURFACE was never in it. §10 had already said the right thing two months earlier ("reuse the control state machine, never invent a surface one"); what nobody noticed is that the sentence has to be as true of how a thing moves as of what colour it turns.

**Everything else came back covered or refused on purpose**, which is what made the one gap worth trusting: fields do nothing by measured decision, Spinner and Progress are motion-as-content, and Separator, Kbd, Code, Blockquote and the type family have no states to move between.

**Kushagra's call: *"should work like button, but because of larger area, perhaps a little different physics."*** Implemented as the control layer's block verbatim — two clocks, lively recovery, stiff press, the shared `kui-ring-land` arrival, the shared one-pixel hover rise — with only the two press DISTANCES the surface's own. That is §8's own rule ("a family says how far it moves and never how long") rather than a concession to it.

**The scale is the number that could not be shared, and the argument is arithmetic.** Scale is relative and these boxes are not the same size: a ~64px button at 0.975 moves each edge 0.8px; a 400px card at the same factor moves each edge 5px, which reads as the page flexing. 0.995 puts a 400px card at 1.0px per edge — matched on EDGE MOVEMENT, which is what the eye reads, not on the ratio, which it does not. The law states that arithmetic and carries the calibration that the shared factor must fail it.

**Rejected, by my own arithmetic, before it was built: a second SPRING.** §24's "mass forbids overshoot" is a real precedent and it argues for `poised` over `lively` on a big box. Then: lively's overshoot is 10.7%, the travel is one pixel, and 10.7% of a pixel is a tenth of a pixel. There is nothing to see, so there is nothing to fix — and `poised` would have been a second curve on this path bought with a plausible story. The same check kills it for the scale channel (0.2px on a 400px card).

**Rejected: paint-only, stating the refusal the way a field's is stated.** It was the safer proposal and I recommended it as an option; the call went the other way and the physics question is what settled it — a card that changes colour but does not answer the finger is not a stated refusal, it is a button missing half its feedback.

**An existing law caught the implementation, correctly.** `resolveHooks` in recipes.test.ts substitutes a channel's hook variables before asking whether it rides a token and springs — and it knew `--kui-ct-` only, because the control layer was the only thing that moved when it was written. The surface's `var(--kui-sf-move)` came back unresolved, so a correctly-sprung translate reported as unsprung and a correctly-tokenised duration as hand-typed. Those failures were RIGHT: an unresolvable hook is indistinguishable from an invented one. Widened to both private stems rather than given an exception, so the third layer that starts moving joins there.

**Two instrument findings, both from laws that measured nothing before they measured something.** The first draft opted the whole block into motion, so a correct hover rise read `0px` — the first sample of a running 550ms spring — and looked exactly like a missing rule; stillness is the default in these laws now, and only the two that are about the clocks themselves opt back in. And the ring law used `el.focus()`: on a BUTTON Chrome matches `:focus-visible` only when the last interaction was a key, so it asserted nothing and reported the ring missing. It tabs to the card now. Five sabotage passes, each arm falsified alone.

+74 bytes gzipped, measured against a real build — not against `dist/` as it sat, which is the mistake the same session made an hour earlier and reported as "zero".

---

## 2026-08-17 A submenu flies from the seam, because a silhouette is only honest when the panel lands on its trigger

Kushagra, on the playground: *"the way submenu appears is quite aggressive, it is correct because it treats the entire submenu trigger as origin, but it ends up traveling a lot, especially if dropdown menu is wide."* Both halves are right, and the second is what the first causes.

**Measured before anything was changed**, sampling the child panel per frame on a 365px menu: the seed is `353 x 30` at x=10 — the sub-trigger row, whole — and the panel lands `92 x 73` at x=376. So it slides **366px right while shrinking to a quarter of its width**, overshooting to 398 on the elastic spring on the way. Both of those numbers ARE the parent panel's width, which is exactly why it gets worse the wider the menu is. Every other member of the family unfurls out of something smaller; the submenu was the one running backwards.

**The rule that broke.** §22's silhouette is honest where the panel LANDS on the thing it came out of: a menu hangs off its button, a select straddles its field, and in both the first frame reads as the trigger's own body about to lift. A submenu never lands on its row — it lands beside the panel the row is in — so photographing the row starts the panel somewhere it will never be. This was reasoned about in 2026-08-10 and *refused* then ("its seed then flew in from the side, thrown over the parent"), and the 2026-08-15 morph re-opened it on the strength of the measured overlay. What neither pass did was measure the travel at a realistic width.

**The fix is keyed on the placement, never on the component.** The positioner already publishes `data-side` (measured: `inline-end`), so the runner asks the question the placement has answered rather than asking a component what kind of thing it is — and Dialog, Select and any future side-anchored panel are covered by the same sentence. A side-opening panel keeps the row's height and corner, because that shared edge is real and the submenu does emerge at the row's own line; it drops the width photograph back to the family's designed seed; and its x offset is **zero**, because the positioner is already holding the panel's start edge at its final place, so the seed simply begins there and grows out.

That zero is worth its own line: it makes the case **direction-blind for free**, which the measured offset was not. No left/right decision is taken anywhere, so RTL is the same code — the "the seed is a SIZE and nothing else" mechanism surfaces.css already relies on.

**Decided in `aim()`, not where `--kui-seed-w` is written.** That is the first moment the placement is certain — the aim returns early until the positioner carries `data-side` — and the pose is invisible until the aim stamps `data-aimed`, so no frame can paint the wrong seed. Writing it earlier would have meant reading a stamp that may not be there yet, which is the failure mode this runner has already been caught by twice.

**Rejected: keeping the row silhouette and only shortening the seed to the submenu's own width.** It removes the backwards shrink and leaves the entire 366px slide, which is the larger half of what was complained about.

**Two laws moved.** The new one (`a panel that lands BESIDE its trigger grows out of the SEAM`) is falsified in both arms independently — reverting the offset reproduces `-358px`, reverting the width photograph reproduces `352.625px`. It opens by HOVER, and that is load-bearing: the first spelling used `defaultOpen` on the sub, which mounts both panels in one commit and places the child against a parent that has not settled — the pre-fix travel measured **5.8px** there instead of 366. It also reads the LAST seeded frame rather than the first, because the runner aims twice and the first aimed frame sits against a positioner still at the document origin (10px, not 366). Both were caught by sabotaging the fix and finding the law's failure message too small to be the defect. The older law that asserted the row silhouette kept only the half that did not change — the edge the positioner holds and the pivot that follows it — rather than being taught the new geometry, so the seam has one home.

---

## 2026-08-17 A select's panel is placed by what is inside it, so it is placed before it is posed

Kushagra, after the fix below had closed the page's own movement and a flicker survived it: *"will it be solved if animation is changed for select where it still flies, but the selected item always appear on top of trigger 1:1, so that the remainder of the list sits a little above and below the trigger depending on the item's position, like radix — you can see apple is exactly where it is on screen."* And then, on the first attempt at it: *"I would expect same animation as dropdown, but only the position changes… I still expect the animation."*

**So `alignItemWithTrigger` is back to Base UI's default**, reversing the 2026-08-09 pin. That pin was priced on the parts and the height model the macOS overlap drags in; the arrows stay refused (wheel, trackpad and keyboard scroll the panel, and an arrow is a control nobody here has designed), and the height model turns out to be the thing that makes the entry honest rather than a cost to bear. The chosen row now lands on the value it replaces and the rest of the list falls above and below it.

**The entry is unchanged, and that is the decision.** A gesture was built first that was not: a curtain, the box at its settled size and place from the first frame with only the reveal animating, on the reasoning that a travelling panel is a panel whose chosen row is somewhere it will not stay. It was measured, law-tested and judged, and rejected on sight — the family has one entry for anchored panels and a select is a member of it. What changes is where the flight LANDS, not what it does. Recorded because the argument for the curtain was real and the answer to it is a mechanism, not a compromise: the page no longer moves because the panel is placed and focused BEFORE it is posed, so the browser's own reveal never sees a displaced row at all.

**Placed before posed, and that ordering is the whole fix.** Base UI computes the overlap from the panel's REAL box. The runner poses on the frame the panel mounts — the pose is the first styled frame, which is §22's own rule — so the placement was computed against a box the size of the trigger, and the chosen row settled 66px below where it belongs. A select's plan now carries `placedByContent`, and the entry waits for the box to hold still before it poses. Nothing is lost by waiting: the pose is transparent until it is aimed, so those frames were never on screen.

**Two pose rules had to be re-keyed, and one of them was already a latent defect.** The silhouette's geometry and the body's squish were keyed on `data-seed` — the VISIBILITY gate — rather than on `data-unfurling`, the flight. A select wears the gate from the frame it opens and does not wear the flight until the measurement, so both rules applied during the placement window and shrank the very box the placement is measured from. The squish alone was worth 58px.

**And the flight borrows an inline height.** An item-aligned panel is laid out as `height: 100%` of a positioner Base UI has sized — that is how it fills a constrained box and scrolls the chosen row onto the trigger — and an inline declaration beats every rule in a stylesheet. So the entry's block-size channel was dead: the seed height written, the pose matching, and the panel at its full height for every frame of an unfurl that was supposed to grow out of a 31px trigger. The runner takes the property for the length of the entry and puts it back exactly as it found it. **Rejected: `!important` in the family's sheet.** It wins the cascade and leaves the library's intent unstated; the flight only needs the axis for the length of the entry, and borrowing says so.

**The width step at the end was a premise that had gone stale.** The panel's floor is `max(--floating-min-w, --anchor-width)` and `--anchor-width` does not exist until Base UI has placed the panel, so the entry publishes the number itself and the two must agree by INPUT. `heldAnchorWidth` predicted the trigger's SCALED box, on the stated premise that floating-ui measures anchors with their transforms — which is what the held press relies on to still the panel. Base UI 1.6 does the opposite and says so in its own source: it reads `getScale(trigger)` and normalises the rect by it before positioning. Measured on an open select, trigger rect 83px at `scale: 0.975` against `--anchor-width: 85px`; on a wide trigger the panel widened 351 → 360 on the release frame (Kushagra: *"it jumps a bit in width at the end"*). It publishes the resting box now. The law reads the AGREEMENT rather than either number, and its first sabotage pass was worthless — flipping a divide to a multiply changes nothing when the scale at measurement time is 1, which is exactly when the old code's damage came from its PREDICTION rather than from the scale it read. Falsified against the old function instead.

**The leftward lean was raised as a suspected bug and closed as designed.** Item-aligned means the chosen option's TEXT lines up with the trigger's value text; our rows reserve a tick gutter the trigger has no equivalent of, so lining the text up moves the panel left by the difference (measured ~65px on a grouped panel). Kept, with the escape recorded: Base UI aligns the left EDGES instead when the trigger holds no `Select.Value`, which would mean rendering the value ourselves and taking over label resolution.

**Rejected: the curtain.** Built in full — one recipe covering both placements by clamping the reveal into the box, a bleed so the clip never cut the panel's own cast, the content printing without the family's rise because a translate moves every row's rect. It is a good gesture and it is not this family's. Deleted rather than left behind a flag: a mechanism with no consumer is the entropy this repo keeps paying for.

---

## 2026-08-17 A select's entry was moving the page, and shutting one door moved the symptom to the other

Kushagra, on the playground: *"why is it on preview page, opening some dropdown menus shift or move the page"* — then, after the first fix, *"Select still jumps"*, and then the fair question the whole entry rested on: *"IS KOOKIE UI THE ONLY LIBRARY ON THE PLANET USING BASE UI?"*

No, and the answer to that question is the diagnosis. Every other Base UI consumer opens a select in place — it fades and scales a little, at its final size, in its final position. Ours FLIES: the panel's first frame is the trigger's own silhouette and it grows and travels to where it belongs (§22, the locked floating entry). A select is also the only floating member whose open focuses something INSIDE the panel — the selected row — and the browser answers a focus by scrolling that element into view. So the reveal happens mid-flight, against a box that is deliberately far smaller than the list it holds and tens of pixels from where it will settle. The gesture is ours, so the defect is ours; nobody else has it because nobody else moves.

**The reveal has two things it can scroll, and both are wrong.** With `overflow: hidden` on the flying box the panel is a scroll container, so the browser scrolls the PANEL: measured `scrollTop: 57` on an eight-row select with the fifth selected. Nothing settles there — the whole list fits the moment the box finishes growing — so the browser clamps the offset back down frame by frame and the contents visibly slide under a growing frame. Refuse the panel with `overflow: clip` and the browser walks one step outward and takes the PAGE instead: measured 65px, and it STAYS, because the panel travels on and the page keeps what it gained.

**So the fix is both doors, in two layers.** `overflow: clip` while the box is not its own size (surfaces.css), so there is no offset to take and none to unwind; and the page parked for the entry's opening frames, restored inside the scroll event itself rather than on a later frame, so it never renders anywhere but where it was (system/floating.tsx). Guarded on the trigger being fully in view, which is what keeps a legitimate reveal legitimate — a programmatic open on an off-screen trigger genuinely may move the page.

**I shipped the wrong half first, and the reason is worth keeping.** `hidden` was chosen deliberately on 2026-08-16, with a law and a comment arguing for it, precisely because it stops the page moving — and it does. What made it look right is that the symptom it leaves is quieter: contents sliding inside a panel that is growing anyway reads as part of the animation. The first fix was measured on the page's number alone, and the number it was measured on was the one it fixed. The law now samples BOTH per frame, across the whole entry, in the one member whose open focuses anything.

**Corrected with it:** the earlier note claimed a 2151px single-frame flash survived the page hold. It does not. That number came from a probe reading in the wrong order (a `requestAnimationFrame` callback runs after the frame's scroll events, so a sample taken there cannot show what the handler already undid) and from a file mounting three subjects into one page. Measured per frame on a calibrated case, the offset from the parked position never exceeds a pixel.

**Rejected: making Base UI focus without scrolling.** It is the honest upstream fix and I named it as ours to wait on, which was wrong twice over — it is not our repository, and the scroll is only harmful because our panel is somewhere it will not stay. **Rejected: dropping the travel for Select.** It closes the defect by deleting the judged entry from one member, which is the family's whole point given away for a scroll offset. **Rejected: doing the travel with a transform on an inner wrapper.** A row's box moves with any ancestor transform, so `getBoundingClientRect` — which is what the reveal reads — moves with it either way.

---

## 2026-08-16 The lab's depth and its lens both port, after I shipped the colour without either

Kushagra, on the ported glass: *"Why is there no refraction on preview? The depth is different totally… we just needed to port final decisions we did on lab2 to main package, why do you refuse to do things I ask"*. The complaint is accurate on both counts and the cause is the same in both: I ported the material's **colour** and left its **structure** in the lab, then wrote the omissions down as constraints instead of building them.

**The depth.** The palette's drop rows were contact + one ambient halo, topping out at `0 16px 32px -8px`. The lab's panels are contact + drop + BLAST, and the blast is most of what the eye reads as depth — 32px/80px under a card, more than double the reach the palette could express. The instruction was the right shape and it is what shipped: *"We have shadow tokens in package world, redefine them so that they create whats on lab2."* No component gained a shadow and no literal was written outside config; the rows now carry the lab's own geometry (row 2 the button, 3 the menu, 4 the solid card, 5 the card).

**The roles re-point, and that half needed an argument.** surfaceChrome 3 → 5, floatingChrome 5 → 3. The lab prices a cast by the size of the box throwing it — *"a smaller caster owes a smaller shadow, or it reads swollen"* — and a card is a bigger box than a menu. This reverses the 2026-08-09 call that a floating pane must out-cast everything: the palette is ordered by REACH, not by rank, and a panel's authority comes from covering what is under it, not from throwing a bigger shadow than a card three times its size. The palette stays one ordered resource and the roles pick their rung, which is exactly what the roles are for — no new mechanism, and the numbers all live in config.

**Found doing it:** `fadeShadow` read a literal `shadow[mode][2]` for the transmitted surface cast, so moving surfaceChrome to row 5 left every glass pane transmitting a row nothing else used. `floatingRow()` had solved this identical problem for its own role and was never generalised — the two-homes drift this repo keeps re-catching, caught this time by an arithmetic assertion rather than by eye.

**The lens, and the objection I raised that did not survive contact.** I recorded refraction as blocked because it needs the element's resolved pixel geometry, which the token pipeline cannot supply. That is true and it is not a blocker: the floating layer already measures its own box on every open (`--kui-fly-w/h`), so the seam existed and I declined to use it. §2's non-negotiable is *no JS at interaction time*, and a map built on mount and on resize does not touch hover, press, focus or scroll.

**Why it is not decoration.** The judged ladder is near-clear stone — blur 2.4/4/5.6, a quarter of what the old §10 floor demanded — and it is legible in the lab because the bezel BENDS the backdrop. Blur hides a backdrop; a lens re-states it. The sharp ladder without the lens is the one configuration in which retiring the 12px floor is a straight loss, and that is precisely what the package shipped for one commit.

**Rejected: walking the blur back up.** The obvious repair for "sharp glass is less legible" is more frost, and it would have quietly undone the thing that was approved. The ladder is Kushagra's judgment; the missing defense was a mechanism, so the mechanism is what shipped.

**Rejected: a separate overlay element carrying the lens.** It would let the base blur survive on engines that cannot render an SVG filter in a backdrop-filter, without any support test. But two stacked backdrop roots filter each other — the overlay would bend an already-blurred backdrop rather than bending and then softening — so it changes the material to buy the fallback. The chain stays single and the fallback is the empty `var()` substitution instead.

**Two mistakes worth keeping.** `"chrome" in window` as a support gate is FALSE in headless Chromium, so the first version disabled the lens in the one engine that renders it — a sniff that fails closed in the browser it exists to open is worse than no sniff. And a law I wrote for the solid case could not fail: "a solid card's chain carries no url()" is satisfied by a solid card having no `backdrop-filter` at all, however much work was wasted building it a map, which the forced-on sabotage pass demonstrated. It reads the custom property now.

**WebKit is stated rather than guessed.** It may parse the value and paint nothing, and because the seam is a var() substitution, that case costs the blur too. Verify on a real Safari; if it fails, narrow the support test, never the seam.

---

## 2026-08-16 A nested Theme was measuring itself into nothing, and making material a Theme property is what exposed it

Kushagra, on the newly ported glass: *"how do i see it properly on /preview"*. The honest answer turned out to be that he could not, and the reason was a package defect three commits old.

`.kui-theme` carried `container-type: inline-size` unconditionally, and the caveat was written down beside it in `layout-css.ts` as an accepted cost: a query container's contents do not contribute to its own inline size, so a Theme dropped onto a shrink-to-fit element collapses to 0px. Accepted, because a nested Theme used to be a rare thing — a denser toolbar, an airier hero, regions that already had a width from layout.

**`material` becoming a Theme property (2026-08-16) is what changed the frequency.** `<Theme material="thin">` is now the only way to put ONE pane behind glass, so the playground's material specimens became nested Themes in a flex row — and all of them rendered at zero width, three glass panes stacked on top of each other over the hostile bed. Measured: 0px, 0px, 0px, where the content wanted 97 and 104.

**Nothing failed.** 1,300 laws passed on both sides of the fix, because not one of them read a nested Theme's width or its containment. This is the 2026-08-03 lesson for the nth time — an axis with no law reading a computed value — and it is worth noting *which* value: writing the law against `container-type` would have been one indirection short again, since the property was never the complaint. The law measures the WIDTH, and it fails with `expected 0 to be greater than 40`, which is the defect stated in its own terms.

**The fix is Box's 2026-08-08 rule applied one element over**: containment serves a box's CHILDREN, so the box's own props are no signal for it. A Theme's axis props are no signal either — "this region is compact", "this pane is glass" says nothing about whether anything inside wants to measure it. Only the DOM-outermost Theme is a container now; tiers in a nested one fall back through opted-in ancestors to the root, exactly as they do inside a plain Box, and §2's floor is untouched.

**Rejected: fixing the call sites.** Wrapping each specimen in a sized Box, or giving them `flexGrow`, makes the playground correct and leaves the trap loaded for every consumer — and the trap is now on the path the material API pushes people down. A defect whose frequency was raised by an API decision is that decision's cost to pay.

**Rejected: a dev warning, like Box's.** Box warns when a container renders 0px because the collapse there is a legitimate composition the opt-in cannot save — the author asked for containment. Nobody asks a Theme for containment; they ask it for glass. A warning would be telling someone their correct code is wrong.

**Rejected: keeping the portal exclusion as a following override.** `.kui-theme.kui-portal { container-type: normal }` used to win on specificity (0,2,0) against a (0,1,0) blanket rule. The narrowed rule is itself (0,2,0), so the two would tie and the exclusion would survive on source order alone. It moves into the selector: one home for which Themes are containers.

Found alongside: `/preview`'s environment panel had `material` in its state and derived its default from `themeDefaults` — which is precisely what the existing law checks — while no chip could flip it and the canvas `<Theme>` was never handed it. A default that derives is not an axis that works, so the new law asserts both halves for every axis.

---

## 2026-08-16 The judged glass ports — read off the screen, not off the stylesheet

Kushagra, looking at the fixed lab: *"whatever these values are look good."* So the material's numbers are settled, and what ports is what the browser resolved — not what the source says, because those are two different things and the gap is the whole story of the day.

Two multipliers sit between the lab's written numbers and the screen. A global **Frost dial at 20%** scales every blur, and a per-mode **knob set** scales veil, saturation and sheen (light: veil 85, saturation 115, sheen 85; dark: veil 95, saturation 130, sheen 55). Nobody has ever looked at the written numbers. Reading them into config would have shipped glass five times frostier than the thing that was approved.

So the values were EXTRACTED — computed `backdrop-filter` and `background-color` off mounted panes in both modes — and the arithmetic was checked against them afterwards rather than trusted in advance. They agreed to the digit, which is reassuring and was not the point: the extraction is the source.

**The ladder, from 5/16/32 to 2.4/4/5.6.** The new glass is four to six times sharper than what shipped. That is not tuning, it is a different material — the lab's whole direction was near-clear stone, because refraction needs detail left to bend, and heavy blur erases what it bends.

**Two laws had to change, and both were wrong rather than merely inconvenient.** The monotonicity law parsed blur radii with `\d+`, so a fractional value did not fail it — it returned null and CRASHED, which is worse than either passing or failing. And the scrim law asserted the scrim blurs less than the THINNEST material, on the reasoning that a full-viewport backdrop is the most expensive thing the library paints. That premise does not survive contact with the judged ladder, and it was wrong before it broke: a scrim defocuses the whole application to push it back, while thin glass deliberately stays clear so structure ghosts through. There is no reason the pane that hides everything must blur less than the pane designed to hide almost nothing. The ceiling still binds — the scrim may not out-frost `thick`, or the thing behind a dialog reads as more solid than the dialog.

**Three component laws restated the radii as literals** and failed on the numbers while the claim they exist for — three thicknesses blur in order, the default does not blur — was never in question. They derive from config now. A law that must be edited every time taste moves is a law nobody trusts when it goes red.

**Recorded, unresolved, and the first thing to check in the playground: the sharp ladder is not self-sufficient.** In the lab it works because the lens does the legibility work — refraction bends detail the blur no longer hides. Refraction has NOT ported (Chromium-only, needs runtime, keyed on pixel geometry the token pipeline cannot supply for content-sized boxes), so in the package this ladder defends with blur and saturation alone. Quiet text on thick glass over a photograph was already marginal in the lab, where the lens was helping. §10's stated 12px "defense floor" is now unmet at every rung, deliberately and by judgment; what replaces it is a measurement nobody has taken yet.

Not ported, and not because of the numbers: the shadow stack (depth owns shadows; no component may name one), the pointer-tracked rim (JS at interaction time, and a second light model contradicting the one the shadow palette, the material rim and the elevated world all derive from), and the Lit rung's literal shadows (same rule; it can only reprice by choosing palette rows).

Budget re-recorded 25327 → 25334.
## 2026-08-20 The shell merges into a system that moved under it

The shell branch was cut from 2026-08-16 and merged after four days of trunk work (the lab
port, selective material, the look axis's deletion, Tabs/SegmentedControl, ScrollArea, the
builder). Seven files conflicted; what is worth recording is not the conflicts but the three
places where the merge revealed a CLAIM that had quietly gone false.

**The section number.** Both sides took §26 — main for Tabs and the segmented control, the
branch for Shell. The published trunk keeps the number it has already cited in its own State
file, so the unmerged section moves: Shell is §27, and the citation renumbered in fourteen
places across source, laws, config, registry and the handover. Worth stating as a rule: a
section number is a name, and an unmerged branch does not own one.

**The look axis is gone, and the shell's own record cited it three times** — "seal, edge,
look, material and depth all arrive from surfaces.css", and the flush-seam paragraph's claim
that the axis reaches a seam. `controlLook` died 2026-08-19 and `surfaceLook` 2026-08-20, so
those sentences described a system that no longer exists. The seam claim survives through
`contrast="high"`, which is what actually reaches a border now; the rest was deleted rather
than reworded, because a list of what arrives from the surface layer must be the real list.

**The material model moved, and the shell's material law was encoding the old one.** Material
became SELECTIVE (§10, 2026-08-17): a surface expresses the theme's glass only where a
backdrop is stated, and resolves `solid` on calm ground — plus a new `on-glass` value for a
member standing on a glass pane. The shell's law asserted "a glass theme's pane stamps the
material", which was true when it was written and is now false BY DESIGN: the pane was
behaving correctly and the law was wrong. Rewritten, and deliberately stated RELATIVELY —
against a Card under identical placement, in both a calm region and a marked `<Box backdrop>`
one — because "a pane is a card among cards" is the shell's own identity claim (§27) and an
absolute assertion would rot again the next time the material model moves. What it pins is
membership, not a value. Falsified twice (panes never stamping; GlassScope removed).

**The builder's coverage law caught the eight Shell exports** — every export must be placeable
on the canvas or excluded with a written reason. Excluded, and the reason is the interesting
half: the builder composes what goes INSIDE an app frame, and the Shell is that frame, so a
Shell on that canvas would be an app inside an app. Its parts go with it, each for the same
reason: a pane places itself by grid area, which means nothing on a canvas with no frame to
arrange it.

Everything else survived untouched: 42 mounted + 8 node shell laws green against a rewritten
surface layer, a new depth palette, squircle corners and the fill-first flip — which is the
strongest evidence available that the shell really does sit ON the system rather than beside
it. Budget 29,756 → 30,361 (+605, the shell's own cost on main's larger sheet; it measured
+610 on the old base). The two motion laws still failing are main's own container flake, in
files byte-identical to main.

## 2026-08-16 The shell audit: a per-pane obligation could not see the plural, and the laws could not either

Ultracode, 17 agents (eight lenses, eight skeptics, one completeness critic), every finding re-measured in a mounted browser. 44 raised, 33 survived, seven repairs. DECISIONS §27 carries the shipped summary; this records what the day actually taught.

**The defect and the lesson are the same sentence: an obligation written per member cannot see the set.** Containment lived in each pane's own effect, so each pane knew exactly one thing — itself — and had to guess at everything else by taking a snapshot of "the others". Both halves of that guess were wrong the moment two panes overlaid at once: the others INCLUDED a live sibling overlay (two visible drawers, both dead), and the snapshot recorded values another pane's effect had already written (whichever cleanup ran last restored `inert = true` onto the header and the content, permanently). No amount of ordering fixes it, because ordering is not what is missing — the whole set is. The repair is to move the obligation to the only place that can see the set, which is the root, and it is the same shape as three earlier promotions in this repo (the mark family, the field family, the floating machinery): the member self-keys until a second member proves the fact was never the member's.

**What made it shippable was a fixture, not a blind spot.** Every overlay law mounted one live overlay, because the shared fixture's inspector and bottom resolve `auto` → closed at narrow — so the file's 27 laws swept states, presentations, widths and postures and never once swept COUNT. The repo's 2026-08-08 sentence ("a law about one axis of a two-axis mechanism is half a law") turns out to have a second reading: the axis can be *how many of the thing there are*, and a fixture that fixes it at one hides everything downstream of it. Recorded because it generalises past the shell — Menu's submenus, stacked dialogs, and any future multi-pane surface have the same untested axis.

**The comment was worse than no comment.** The shipped code priced this case explicitly — "two overlays closed out of order would restore a beat early (accepted: the scrim closes all of them)" — which is a considered-looking sentence that got the magnitude wrong (forever, not a beat) and named as mitigation the exact path that produces the failure (the scrim closes them together, which is what strands the snapshot). An accepted-cost comment asserts a measurement nobody took. It should have been a law, and the standing rule is now that an "accepted" edge in a comment either gets a law or gets deleted.

**Three defects were one shape: a boundary the component never stated.** An overlay had no viewport cap (at 320px the pane WAS the window, the scrim rendered 0px, no route back); the frame had no `box-sizing`, so the floating posture's padding overflowed its own declared height; the header had no inline bound, so its content pushed document-level scroll and the app frame stopped bounding the app. Each is the component declining to say how big it may get, and each was invisible at the one viewport the suite pins (1280 wide).

**Two of the repair's OWN laws could not fail, and both were caught by their own sabotage pass.** The `inherits: false` law read a fixed-length window from the start of a registration, which spans into the next one — so flipping `--kui-shell-w` to `inherits: true` passed, because the window found `--kui-shell-h`'s `false`. That is the repo's commonest law defect (measuring the axis that was already right), committed inside the law written to catch that class of defect. And the floating-containment law re-parented its subject after mounting, so a percentage height resolved against the wrong box and it reported 336px of "gap" — an instrument that moves its subject is measuring something else. Both now read through the loud extractor and an in-tree container respectively. Two sabotage scripts also silently did nothing (a wrong count, a stale assert), which is the same lesson the build already recorded and evidently did not learn hard enough: a sabotage must assert its own application AND its own arithmetic.

**One regression was introduced by the repair and caught by an existing law**, which is the system working: splitting containment and focus into two effects put the inert pass first, so it blurred the trigger before focus was captured and the return landed at `<body>` — the exact ordering LOG recorded learning hours earlier. They are one effect now, capture first, and the note explains why the split is illegal rather than merely discouraged.

**The open question about containment's reach was answered the same day, by naming the placements** (Kushagra: "Shell should be able to sit at app root, its designed for it, or be placed in a modal or dialog or whatever too"). The audit left "containment stops at the shell root" as a design question — does a shell overlay trap like a dialog, or IS a shell the page? The answer is that both sanctioned placements are already correct, for different reasons, and stating them is the whole fix: at the ROOT, containing every child of the shell IS containing the app, because there is nothing else; inside a DIALOG, the enclosing layer owns everything outside, so the shell doing its own children is exactly its share and a second trap would be wrong. What that framing exposed is a real defect it would otherwise have hidden: measured, a Shell inside a Dialog laid out and contained correctly, and ONE Escape closed the pane AND the dialog — the audit's layer-blindness in the opposite direction, which the root-bound listener fixed only for dialogs opened FROM a pane. The pane is the innermost dismissible thing, so it answers and stops the key (`stopPropagation`; deliberately not `preventDefault`, because a dismissal is not a cancelled default and the flag is what other layers read to know it was handled). Both placements are law-pinned and falsified. The residual placement — a shell embedded as a widget in a page that traps nothing — is one the component does not claim; the pointer half is covered by the scrim regardless.

Recorded with it, because it is the same shape one axis over: `auto` answers the WINDOW, not the container. That is right for the placement the component is designed for and wrong for an embedded one, so an embedded shell states `presentation` and `open` explicitly rather than inheriting an answer about a window it does not fill. Making `auto` container-keyed was considered and refused on §18's own argument — a window class picks a SHELL, and container tiers deliberately answer a different question.

**Still open and honest** (§27): containment is post-mount, so a server-rendered `defaultOpen` overlay is uncontained for keyboard and AT until hydration — the same honest-null shape §18 already takes, and not patched quietly, because a half-answer would be indistinguishable from the answer.

## 2026-08-16 The shell ships, and the building closed three questions the spec left open

Same day as the spec (§27 carries the shipped summary; this entry records what was decided rather than executed). The build was the spec followed to the letter plus three genuinely open calls:

**An untouched pane with EXPLICIT overlay presentation rests closed — at every width.** The spec's auto posture ("nav columns rest open on roomy windows") collided with `presentation="overlay"` the moment both existed: auto-open plus always-overlay means a scrimmed overlay standing open at first paint on a desktop, which nobody asked for and nothing summoned. The rule that resolves it: an overlay is SUMMONED, never ambient — so auto under an explicit overlay presentation is closed, and only an explicit `open`/`defaultOpen` or a toggle raises it. Stated in the stylesheet (the CSS is the resolution's home), mirrored in the JS `expanded` computation, and the mounted law that pins the cell was falsified against the mirror broken.

**Flush seams are single hairlines by INNER-EDGE ownership, not by collapse.** Header draws its block-end, rail and sidebar their inline-end, inspector its inline-start, bottom its block-start, content nothing — so no seam is ever two borders, at any pane combination. Spelled as per-side `border-width` overrides that never touch the border's COLOUR, which stays the surface system's: the look axis and `contrast="high"` reach a flush seam exactly as they reach a card's edge. Rejected: negative-margin overlap (a hack that breaks the moment a pane is translucent) and stripping borders entirely (Separator-between-panes — a landmark boundary is not a composition).

**Even floating spacing is the HALF-GAP construction, and grid `gap` was rejected with arithmetic.** Track gaps bill both sides of an EMPTY track: with four columns declared and two panes present, the gap money shows up at the edges unevenly — v1's doubled-margin defect by other means. Half the gap as the frame's padding plus half as every pane's margin makes pane-to-pane and pane-to-edge distances equal by construction at every combination, with nothing conditional anywhere. The overlay treatment rode the same grid insight: an absolutely positioned grid item resolves insets against its own grid area, so an overlaying sidebar sits exactly under the header row — measured never, derived always.

**Two instrument findings, recorded because they will bite again.** A sabotage can be a no-op: the JS-mirror falsification's replace target misspelled one character of the source, replaced nothing, and reported a fully green suite as "proof" the law could not fail — sabotage scripts assert their own application now (`assert target in source`), which is the calibration rule ("an instrument must be calibrated against a known answer") applied to the falsification tool itself. And the focus capture in the overlay effect originally ran AFTER the inert stamping — making the trigger's subtree inert blurs it, so the capture remembered `<body>` and focus never returned; caught while writing the focus law, before it shipped, which is the order the 2026-08-03 standard exists to force.

**Deliberately absent, with the precedent named:** zero transitions (Menu shipped instant and gained its unfurl the next day; the shell's spring entry is the recorded follow-up, and a node law asserts the absence so its arrival is a decision, not drift). The four pre-existing motion laws that fail on a slow container under full-suite load (menu channels ×2, select entry, ring travel) fail identically on the clean tree and are an environment fact, not a shell one; the ink-solve law's timeout was the one that was honestly wrong (5s default against ~5.1s of real compute on the slow machine) and got explicit headroom in its own commit.

## 2026-08-16 The shell is spec'd by deleting v1's, and every deletion is one straddle removed

DECISIONS §27. The session read v1's Shell whole — 4,300 lines of TS, 643 of CSS, 46 test files, plus its own audit report with open P0s — and the spec that came out is mostly subtractions, each one removing a fact that lived in two places.

**The finding that anchored the day: `presentation` was advertised as an axis and implemented as a component switch.** v1's Sidebar early-returns an entirely different tree when overlay resolves (`if (isOverlay) return <Sheet.Root>…`, shell-sidebar.tsx:456) — so crossing a breakpoint unmounts the whole nav subtree (scroll, focus, state gone on a window resize), every DOM prop silently dies on that branch, `resizable`/persistence/peek are off, and the accessible name is a hardcoded "Navigation". This is the agreement-law rule (2026-08-06) in its unwritable form: two implementations that cannot agree because they are different components. v2's pane is one element, always mounted; presentation is `data-` dress; overlay's real obligations (scrim, Escape, containment) attach post-mount to the same box.

**Rail/Panel versus Sidebar was a naming collision, not a design choice.** v1's Sidebar `thin` mode IS a rail — the same region shipped twice under two names, which is what forced the exclusivity warning, the `displayName` child-scanning, and the rail→panel close-cascade with its conflict-resolution callbacks. Renamed (rail = narrow icon column, sidebar = wide column, independent), the whole apparatus has nothing to arbitrate. The cascade is deleted as an app opinion dressed as a rule: VS Code's columns are independent, Slack's rail cannot close — an app that wants linkage writes three lines.

**The header closed as a criterion, not an option (Kushagra, verbatim: "if it isn't wide its not shell header then its content header").** One geometry: header row, columns beneath. The Linear posture is a shell without a ShellHeader plus a header composed in Content. Rejected: a `headerPosition` axis — it would make the shell choose between two app structures it cannot know.

**`inset` unbundled into `panes="flush" | "floating"`, and the middle draft died in this conversation.** First cut: a Root-level switch turning on a gap and corners, with the shell painting a backdrop "bed" behind the gaps. Kushagra's correction, two moves: under the 2026-08-16 material model nothing paints a bed — panes seal their own fill, gaps show the app's page, so the bed question dissolves — and floating is not a bundle of effects, **floating IS the gap**: panes that are not touching, with the gap and the visible corners as what not-touching looks like. Consequences: no gap prop, no consumer-facing gap variable (v1 documented overriding `--shell-inset-gap`; that is how a shell drifts off its own app's rhythm — the distance is `--layout-space-N` and answers density), corners from the surface band, lift from `depth`. v1's per-pane margins also double between panes versus the window edge (16 vs 8, measured in the CSS) — container-owned gap makes that unevenness inexpressible. Rejected: the name `inset` (§4 uses it for the opposite direction — `rowInset`, `slotInset`); per-pane opt-in (v1 needed an InsetContext registry solely to re-aggregate the scattered decision — the Material-to-Theme shape). Recorded open: the mixed posture (Linear: nav flush, content floating).

**State ownership closed as pane-owned, dialog-pattern.** v1 declared intent on panes and stored state on the Root — the straddle behind the child scanning, the `breakpointReady` gate, the init-fire P0 its audit records fixing, the hydration test file, and the `setTimeout(0)` sync in useResponsiveInitialState. Its 46-file suite is the diagnosis: nearly all state-plumbing tests, one layout test. v2: each pane owns `open` like Dialog; the shell does no width arithmetic (panes state their inline size, content takes the remainder), so there is nothing to sync and the trigger registry is the one crossing. The responsive default is "auto until touched" — `data-state="auto"` resolved per §18 window class in CSS, explicit stamp on first user action — so first paint is scriptless and right, hydration cannot mismatch, and mount-time open/close callbacks are structurally impossible rather than carefully suppressed.

**Widths are the first sanctioned raw numbers (Kushagra: "how do you set widths otherwise?").** No ladder exists to consult — a pane's width is app content speaking, §13's room question — and pricing it against a neighbouring ladder would be the fraction wall's ninth instance. Designed defaults in config (the `switchW` genus), one custom property per pane, the `width` prop writes that property inline; resize later writes the same name, which is the room left for it. Rejected: a shell width ladder (`size` indexing widths — an index cannot know the app's file tree), and raw px in the stylesheet (defaults emit as tokens; the budget laws hold).

**Deferred with reasons: resize** (later but very important — lands with the JS-at-interaction carve-out written the way useWindowClass earned its sanction, plus min/max, persistence, and the ARIA wiring v1 never finished), **peek** (highest structural cost per benefit in v1: a context slice, absolute overlays, a z-band, per-pane CSS), **stacked**, **mixed posture**. All four wait on real screens, the tone-set rule.

Not ported, closed here so they stay closed: v1's z-ladder (1/30/31/32/40/50 — §20 names the shell as the ancestor that buries popups), raw px and raw rgba shadows in shell.css, `var(--gray-2)`/`var(--radius-3)` numeric coincidence, the `100vh` default behind a `[style*='height']` sniff, the second controlled channel (`size`/`defaultSize`/`sizeUpdate`/`sizeUpdateMs` beside `open` and `expandedSize`), and per-pane callback meta vocabularies that disagreed pane to pane.

## 2026-08-16 Every theme axis gets one home, and two laws that could not fail get replaced

The `DEPTHS` move earlier the same day fixed one axis and left seven. `themeAxes` now holds every Theme axis and every value it takes, the unions derive from it, and `themeDefaults` is asserted to live inside it key for key. It is exported, which is what finally lets the docs stop restating: `/preview` and `/matrix` each carried their own copy of all seven lists, and they had no choice — the lists were not exported, so that entropy was FORCED rather than chosen. Publishing the table is the only fix, and it is additive.

Deliberately NOT merged with the harness's `POINTERS`/`APPEARANCES` in test/browser.tsx, which look like the same fact and are not: those are the RESOLVED worlds a law walks (`fine | coarse`, `light | dark`) and exclude `auto` and `inherit`, which are instructions about where to look rather than values anything resolves to. Collapsing them would have been the entropy rule applied past the point where two things are actually one.

**Two laws written for this could not fail, and both were caught by their own sabotage pass.**

The first looped every axis and asserted the stamped attribute came back equal. An attribute is written verbatim, so a value nothing implements stamps itself exactly as happily as one that does — it passed a sabotage adding a third depth rung, which is the entire class of bug the table exists to catch. Whether a value is IMPLEMENTED is a question about the emitted stylesheet, so it moved to a node law that reads the shipped CSS; what remains in the browser is the one thing a mount can settle — that `appearance="inherit"` and an unchosen `contrast` stamp nothing, while `pointer="auto"` DOES stamp, an asymmetry worth pinning because making the two agree would break one of them.

The second, the node law, then passed a sabotage that DELETED a value from the table — because an axis whose list has lost a value is simply an axis that gets walked less, and every loop over it keeps passing. It now checks both directions against the emitted CSS as an independent second source: a selector styling a value the table does not offer means one of the two is wrong and neither can notice alone. Falsified in both arms.

**One more, found while fixing the docs.** The component-reference coverage law parsed `packages/ui/src/index.ts` with `^export \{ … \}` anchored to a single line. The day the theme export grew past the line width and broke across lines, every name in that block left the coverage set. It failed loudly here only by luck — the registry documents `Theme`, so the reverse arm caught it — and in the other direction it is silent: a multi-line block of genuinely new components would not be seen at all, and "every export is EXPLAINED" would pass while explaining none of them. The parser stops caring about formatting. Its first fix then over-corrected, stripping the `type ` keyword and pulling every `…Props` into the coverage set; types had been excluded by accident of that prefix all along, and are now excluded on purpose.

## 2026-08-16 The port's "biggest blocker" was not a defect — it was a guarantee with no law

The audit reported that the veil is built from `--color-surface` rather than the component's own fill, breaking §10's fill-modifier rule so that tone and the look axis never reach a glass pane. I passed it on as the one thing that had to close before any recipe could port. It was measured on **lab2.css**, where it is true. In the package it is false: `surfaces.css` mixes `--kui-sf-fill-src`, the surface's own fill source, which is precisely what "a fill modifier, never a fill of its own" means.

Measured on a mounted Card at `material="regular"` — outlined `srgb 1 1 1 / 0.64` against filled `srgb 0.966 0.967 0.969 / 0.64` in light, `0.079…/0.71` against `0.109…/0.71` in dark; and a destructive glass button at `srgb 0.996 0.913 0.907` against neutral's `srgb 0.932 0.935 0.937`. Different colour, same alpha, in every case.

**The finding was still worth having, because the actual defect is one layer up: nothing proved any of it.** Six audit agents and an adversarial refutation pass could not distinguish a correct package from a broken one, because the guarantee had no law — so the lab, which *is* broken, was the only evidence in the room and it read as the system's behaviour. This repo's standing lesson has always been stated as "a law that reads a declared value is one indirection short"; this is the same lesson from the other side, where the count of laws is zero and the failure mode is not a false pass but an outside reader reasonably concluding the opposite.

The law asserts BOTH halves at once — the two looks resolve different colours, *at the same alpha* — because either alone is half a law: differing colours with a drifting alpha would mean the veil had been replaced by a fill, and equal alphas with equal colours would mean the dress never arrived. Falsified by transplanting the lab's exact defect into `surfaces.css`, which is the only falsification that proves the law catches the reported bug rather than some neighbour of it.

Left standing, and correctly: no surface currently HAS a tone to carry. Card and the popups that wear its constants all stamp `data-tone="neutral"` as a fixed identity, so the mechanism is proven and idle until the first tone-forward surface — which `surfaces.css` already predicts in prose ("a tone-forward surface will tint its own veil the day one floats").

## 2026-08-16 Material becomes the Theme's, and the question that killed the ladder was "what if I say thick?"

The proposal on the table was material-as-theme-property with a per-FAMILY offset: the theme picks a rung, a dialog sits one above it, a control one below — the shape the mark family already uses (`switch track = mark(n+1)`) and the shadow palette already uses (surfaces row 3, controls row 2). Kushagra killed it in one move: **`material="thick"` has no rung above it.** Clamping at the top would be an exception, and the same clamp at the bottom would make `solid` not mean solid.

The answer is that there was never a ladder to walk. **Material means what it says — what the app is BUILT of.** A table and a chair made of the same oak are the same oak; they do not get oak+1. One value for the whole scope, everything translucent in the app is that material, and no component can hit a ceiling because no component picks a thickness. What makes a dialog read heavier than a menu is coverage and its scrim — the same glass over 900px obscures far more than over a 170px menu, and the dialog already pushes the page back on its own. Nothing needed a second thickness to say it.

**The evidence for per-family re-pricing had also just evaporated.** "Control surfaces need their own parameters" is written into the lab three times as a system rule; the blur audit earlier the same day showed the control cells declared *half* the card's blur and drew 2.3× more of it, so that rule was tuning against a defect in the wrong direction. Re-judge on the fixed lab before assuming a button and a card want different glass.

**Rejected: a `glass` boolean.** It would still owe a thickness beside it — two props for one fact — and it mis-states `solid`, which is a material (the rung where light stops passing through), not the absence of one.

**Rejected: keeping a per-component override.** This was my recommendation going in and the audit refuted it, correctly. Deleting the prop with no replacement leaves a themed-glass app rendering glass card → glass field → glass button by default, which is exactly the composition the 2026-08-16 one-glass-per-stack call forbids, and the prop was the only thing enforcing it. What replaced it is better than either: the rule is enforced **structurally** — a member that paints a veil scopes its subtree and everything below resolves solid — so the composition is unreachable rather than merely discouraged, and no call site declares anything.

**Two mechanism choices, both React rather than CSS, both load-bearing.** The value travels by CONTEXT and each component stamps its own `data-material`, so all 28 selectors stay element-keyed: a descendant-keyed rule (`[data-material] .kui-surface`) would make every control inside a glass pane paint its container's veil, which is the defect the `@property inherits: false` guards already fixed four times. And a `<Theme>` RESETS the glass scope — which is what makes portals correct: `MenuContent` renders a bare Theme inside its portal (§20), so a menu opened from a glass card is glass again (it paints over the page, not inside the card) while a field composed inside that card is opaque. That forced the popup of Menu, Select, Dialog and AlertDialog to split into an inner component, because React context follows the tree and reading the material in the outer body would resolve the card's scope.

`layered` is dropped in the same change. It was a performance switch — "look like glass, cost nothing" — and the audit measured that its sealed composite cannot be identical: it baked `--neutral-2`, a page colour the library has twice declined to own, lost a specificity fight in dark, and could not answer the thickness axis. There is no free glass; opting out of the cost is opting out of the look, and that is `material="solid"` on a nested Theme.

Cost: **zero CSS.** The stylesheets did not move, which is the strongest evidence the move was done at the right layer — an axis changed owners and the cascade never noticed. Six new laws, every one falsified first (three levels of nesting, the Theme escape, the solid-parent negative control, and both portal directions); one of them, "a solid card does not stand its children down", exists because a scope applied unconditionally would silently kill the axis and every other law would still pass.

## 2026-08-16 The lab was never rendering its own numbers, and the bug was a second home for one fact

Found while auditing the material work ahead of the port. `lab2.css` set `--l2-noref: 2.8` behind `:root:not([data-l2-refract="on"])`, and **nothing has ever written that attribute to the root**. `data-l2-refract` does exist — written by `page.tsx` onto individual `.l2-menu` elements, with a filter id as its value. Two different facts wearing one name, and the html stamp this guard waited for was renamed mid-session to `data-l2-engine`, which now appears nowhere in the repo. So the guard matched permanently.

Measured before the fix, reading computed `backdrop-filter` off mounted panes: a `.l2-regular` glass button drew **blur(5.6px)** while a `.l2-card` drew **blur(2.4px)** — the button rendering 2.3× the card's blur while DECLARING less than half of it (10px against 12px). The split is because the filter chain is written twice and the copies disagree by one term: the CSS copy (`lab2.css:133`) multiplies by `--l2-noref`, the JS copy injected for refracting panes (`page.tsx:255`) does not. The variable's whole purpose is to add defocus when refraction is *unavailable*, so a refracting pane should indeed skip it — but that intent lived only in the JS string.

Fixed by DELETING the guard, not by repairing it: the foot of the same file already states the fact correctly, keyed on `data-l2-flat`, which the Refraction switch really does write. Verified after: refraction on → ×1 everywhere, off → ×2.8 everywhere. One population either way, which is the design as written, and the honest on/off comparison exists for the first time — before this, both states blurred identically and the switch changed only whether the lens was present.

**What it invalidates, recorded because the numbers are still on disk and look authoritative.** The control material cells — "control surfaces need their own parameters", written into the CSS three times as a system rule — were tuned against this. They declare half the card's blur and drew more than twice as much, so the re-price was correcting a defect in the wrong direction and the rule it produced has nothing behind it. Every performance figure from the parked audit was taken at the inflated blur, and blur cost climbs fast with radius, so none of them is a port baseline. And every eye judgment on glass buttons, menus and dialogs was made at a blur the source does not describe.

**The lesson is the 2026-08-03 lesson in a new place.** A law that read this would have had to read a COMPUTED filter through a mounted pane; nothing in the repo reads the lab at all — `allStylesheets` walks `packages/ui/src` only, so the judging surface the whole material design is being decided on is the one surface with no laws over it. That is defensible while it is scratch, and it is exactly why nothing should port from it on the strength of its written numbers.

## 2026-08-16 Fourteen private copies of "how many values does this axis have"

Ahead of any decision about a third depth rung, the port audit counted the blast radius and found the axis was covered by literals: eight law files each carried their own two-value depth array, six their own three-value thickness array. Every one of them passes today and every one would keep passing after the axis widened, covering the new value with nothing — a law one indirection short of the thing that can be wrong, which is this repo's most-repeated defect.

`depth` now owns a `DEPTHS` list beside its union in `theme.tsx`, with the union deriving from the list so the two cannot disagree. The thicknesses needed nothing new: `GLASS_MATERIALS` has lived in `system/axes.ts` since that file existed and was simply never reached for — `surfaces.test.ts` imported it at line 13 and then restated the literal twice further down the same file. `test/browser.tsx` re-exports both beside the `POINTERS`/`APPEARANCES`/`DENSITIES` it already owned, so a browser law imports every axis list from one place; node laws take them from the source modules, since the harness pulls in the browser context.

The law that keeps it closed reads the SOURCE, not the values — a copy that agrees with the export today is precisely the copy that will silently disagree tomorrow, so the assertion is that no second copy exists at all. It checks both orders, because one of the offending files spelled the pair backwards and a naive law would have missed it. Falsified in both arms before it was accepted. It also caught its own author immediately: the first draft of the explaining comment spelled the literals out, and the walk reads its own file — which is the correct behaviour and is now what the comment says instead.

Deliberately NOT closed: `matrix-explorer.tsx` and `preview-app.tsx` restate the same lists (and four other axes besides). Closing those means exporting the axis value lists from the package's public API, which is an API decision rather than a refactor, so it waits.

## 2026-08-16 Accent goes back to blue, because a colourless brand has nothing to carry through glass

The grey accent (2026-08-10) was a real position and it survived six days on flat surfaces: prominence at zero chroma comes from lightness, `lowChromaThreshold` routes the solid to step 12, and a near-black primary in light is what a grey brand honestly looks like. The material work is what refuted it, and the refutation is structural rather than aesthetic. **A fill under a material is the component's own colour mixed toward transparent** (§10, "material is a fill modifier") — so the thing that survives the mix is saturation. Every categorical family in the glass sweep still said something at thin and regular; the primary action said nothing, because there was nothing in it to survive. A brand that disappears exactly where the system's most expressive surface is is not a brand.

`accent: { hue: 250, vividness: 1 }` — blue's *recipe*, not a copy of its rendered hex (the same identity argument as 2026-08-04, pointed back at blue; it also compresses, which is why the flip costs nothing). Worth stating exactly, because the shorthand "accent ≡ blue by construction" overclaims: the two are separate config entries holding the same two numbers, and what cannot drift is their *rendering*, since identical inputs meet the same generator. They must stay separate entries — `accent` is rebindable, `blue` is a fixed categorical family, and a consumer rebranding to green needs `accent ≡ green` with `blue` untouched. So this is a coincidence of the default, not one fact written twice, and it earns no law: a law pinning them equal would fail the moment someone rebrands, which is the supported path.

**Rejected: keeping grey and raising the veil's opacity under a loud rung** — that is the material apologising for the palette, it flattens the thickness ladder exactly where thin is supposed to be thin, and it would have had to be an exception written per-thickness. **Rejected: a chromatic accent only under glass** — two accents, one system, and the drift is guaranteed the first time someone judges a button on a solid page. What the low-chroma branch keeps is its generality: it is keyed on chroma and not on the name "neutral", so a user shipping a desaturated brand still gets step 12 and the wider state scale. Nothing about the mechanism moved; only the input did.

Recorded late, and that is the finding worth keeping: the flip landed in `color-config.ts` during the material session with **no LOG entry**, while `DECISIONS.md` §7 and `CLAUDE.md` both went on asserting a grey brand as the shipped default. Three homes for one fact and only one of them moved — doc-code drift of exactly the kind this repo calls a bug, committed by the author who wrote the rule.

## 2026-08-16 The dialog's entry locks on depth, and the audit before it collapsed two runners into one

The adoption pass, run against an audit of everything the motion work was about to merge (six dimensions, every finding handed to a skeptic: 22 confirmed, 6 refuted).

**The entry: A of four, tuned then locked.** Judged on lab2's mass strip at 55vw/55vh and 88vw/85vh — depth-only settle, a 12px rise, a pure fade, and a "placed" set-down that arrived from above (heavy things are LOWERED; a free-floating plane rising reads as levitation). Depth won, then took two corrections on the eye: faster and further (600ms, 3% rather than 2%) with a *very slight* single overshoot, which is what minted `poised` (ζ0.8, ~1.5% of travel, one crossing). And the content's one channel: **blur → sharp on the box's own clock, nothing else** (Kushagra: "if the container mass takes some time to get in focus, content should also do same, no travel bc we dont know how its arranged inside"). That is the ownership rule stated as physics — an alert's anatomy is the system's and may be printed; a dialog's content is the consumer's, and blur is the only channel that presumes nothing about an arrangement we do not own. Two costs recorded with it: filter over a large subtree is the recipe's most expensive paint, and a running filter makes the body a containing block, so a consumer's `position: fixed` child re-anchors for the length of the entry.

**The audit's headline was ENTROPY, and it was right.** Two entry runners — the anchored one and the alert's — had been written five days apart, had converged on the same job (pose, measure, depart, release by clock), and had already drifted four ways: a laid-out guard that worked in one and was DEAD in the other (`parseFloat` of `--floating-seed` reads the unresolved string `calc(56px * var(--scale))`, so `|| 0` had quietly meant "bail if width ≤ 0" since the day it was written), a flight registered a microtask too late to be retired, a body measured after the writes that invalidate its layout, and a listener whose removal only one of them reached. Four defects that were nothing but the gap between twins, each of which would have had to be fixed twice. **They are now one runner**, with the single genuine difference — does this panel fly from the trigger that opened it? — asked three times and nowhere else; and the two names for the same measured box (`--kui-floating-w/h/bw`, `--kui-ov-w/h/bw`) collapsed to one (`--kui-fly-*`). The unification immediately exposed a fifth: the quick-reopen clause was keyed on `data-open` being PRESENT, which is true for the whole life of every ordinary open, so it re-posed panels that had already flown — a state that is continuously true cannot announce an event, and the announcement is the ending stamp being REVOKED.

**The critical finding was one channel missing from a list.** The floating exit restated the entry's geometry — the mechanism that lets a mid-flight dismissal keep becoming instead of snapping — but omitted `box-shadow`, which that entry genuinely runs (the pose stands the cast down and the flight fades it up). Dropping a property from `transition-property` cancels its running transition, the cancellation was read as a dismissal, and a menu dismissed 35ms in snapped 169 → 303px in two frames. Fixed twice over: the channel restated, and the dismissal listener taught that only GEOMETRY cancellations mean a flight died. **And the class is now closed by law** — the exit's channel list is DERIVED from the entry's and compared, so a hand-maintained list can no longer drift.

**Three mechanisms had no law at all**, which is how each survived. The springs: nothing read `springs` or the emitted curves, so `elastic` — the easing of every geometry channel in both families — could have been replaced by a ringing curve with the suite green, while DECISIONS and CLAUDE.md both claimed a re-derivation law existed. Now the emitted `linear()` is checked against the physics config states (an independent implementation, not the generator's own function) AND each curve's claimed behaviour is counted off its samples: peak under bound, crossings ≤ 1, exits never above 1. The flight retirement: assertable only by interrupting a flight that is still airborne and claiming the panel is still becoming in the gap between the stale deadline and the real one. And reduced motion for the floating family, which had only a string scan of the guarded region for the words it expected to find — a scan that was green through the whole life of the two defects the mounted law found in an afternoon, and that went RED on the day those rules were correctly deleted. A law that fails on the fix and passes on the defect is worse than no law.

**Reduced motion changed shape as a result.** The guard used to declare an inverse of every pose declaration; maintaining that inverse is what produced both defects (it had missed the aim gate, so a posed panel stayed invisible, and `min-inline-size`, so a posed panel lost its width floor and measured 77px against its own 112). The inverses are deleted: a pose is stamped by the runner, and the runner refuses under the setting, so the only way one exists is the setting being turned on mid-flight — which the runner's own next frame undoes. What the guard owes is now exactly two things, both mounted-law-asserted: nothing moves, and nothing is measured. The **dialog's** pose is the deliberate exception and states why: it is Base UI's stamp, not the runner's, so it lands whatever the user asked their OS for — the entry that owns no JS is the one whose pose must be undone in CSS.

Also closed: three documents claiming "four motion laws moved verbatim" when three moved and none verbatim (a number restated in three homes drifts in all three); a harness guard that looked for a portal at teardown, which is precisely when the case it names has already removed it (it records the fact when it happens now); and a seam law that compared an animating width with a settled one under full-suite load, failing at 1px on a defect that measured 10.

Rejected: rebuilding the two runners as one abstract mechanism with a strategy object (the difference is one boolean about the panel, and three guarded blocks state it more plainly than an indirection); a single transition list per family with the clocks as variables (it would make the dropped-channel class structurally impossible and is the better design — recorded here as the next simplification, not taken tonight because it changes the shape of every motion law and the completeness law already closes the defect); and content print on Dialog (ownership).

## 2026-08-16 One glass per stack, questioned at the alert and held

The lab2 alert exploration ended with glass actions on a glass pane — the reference glass buttons, judged good ("fixed now") — which is precisely the composition §10's one-glass-per-stack rule forbids, and the day's last call closed the question the exploration opened: **the rule holds generally** ("generally, glass on glass doesn't be allowed"). The lab look is not a loosening — and the lab examples themselves were returned to the component's own solid buttons the same hour, because a judging surface that models the forbidden composition is an argument against the rule it sits under. If the alert's glass actions ever earn shipping, they arrive as the alert's own carved exception — stamped by the component, §6's role-corner shape — with the general prohibition intact and no consumer path to compose glass inside glass. Along the way the Cancel rung settled on its third setting in one day (bare quiet: medium read near-solid in dark, and a border on glass is pigment on a pane), which is what let the material own the button's whole appearance — the quiet rung contributing nothing is exactly what makes it the right box for glass to dress.

## 2026-08-16 AlertDialog ships, and the materialization moves home

The split entry below decided it; this is the build. Kushagra's calls on the way in: `size` stays, Menu's own argument — fixed slots do not preclude the index, and here it prices padding, corner, TITLE and DESCRIPTION type and the buttons, which Dialog's size may not touch because Dialog does not own its content; the width is controlled with no API to override it; and the two actions split the row equally, filling it.

**What the fixed anatomy bought, each piece measured:** the width is a designed FIXED ladder (`alertWidth`, strictly narrower than the dialog's at every index, law-tested), published by the shared overlay join re-pointing `--kui-overlay-w` — the switch join's re-point shape, so the panel sheet consumes one name and never says `data-size`. The layout is a two-column grid on the entry's own body element: non-buttons span, actions take a column each, a lone Action spans whole, and Cancel-first-in-DOM is simultaneously the start position, the reading order and the initial focus (Base UI's first-tabbable rule — no focus machinery at all). Cancel and Action are priced Buttons with no `render` escape; Action defaults LOUD, legal exactly here because the anatomy guarantees one Action — §11's one-focal-point rule held by construction.

**The materialization moved as the motion agent sequenced it:** recipe re-keyed from `.kui-surface.kui-overlay` to the alert's popup, the OverlayBody runner promoted to system/floating.tsx on its second consumer, THREE motion laws moved and re-targeted, Dialog's content rendered bare. (Corrected 2026-08-16 by audit: the count was written as four and "verbatim" in three documents — three laws left dialog.browser.test.tsx, the fourth was the quick-reopen replay written new that day, and the three were re-targeted rather than copied. A number restated in three homes is a number that drifts in all three.) Dialog opens with no entry for exactly one commit — the follow-up lands its large-mass entry — and the recipe was never ownerless. Deleting the re-keyed seed rule fails the moved laws; nothing else moved.

**Three instrument findings, all mine:** a click aimed at the backdrop times out forever, because the full-screen viewport sits over it — an outside press is a press on the viewport's empty corner; a `defaultOpen` mount focuses the POPUP (Base UI's touch-safe default), so the focus law must open by real click; and the harness's pointer-parking guard could not see a portalled button — it read the HOSTS, portals land at body — so a click on a button that unmounts with its popup left the pointer parked where the next file mounts. The guard now treats a portal's presence as the signal itself (one slider law had already flaked exactly this way in a full run).

**Lab2's fake alerts are replaced with the real component**, wrapped in the lab's own classes so the squircle-and-refraction treatment applies there — and the materialization needed no lab stand-down at all, because the shipped entry now IS the alert's.

Rejected: props-instead-of-parts for the closed content (the family's part vocabulary holds; the closure lives in what the parts refuse); an initialFocus mechanism (document order already answers the APG); a new entry for the alert (the whole point of the split is that the shipped one is its gesture); and Escape refusing to close (Base UI keeps it, and a keyboard "not now" is Cancel by another route). Open with the section: vertical stacking for long action labels. 17 mounted laws, six sabotage passes; budget re-recorded.

## 2026-08-16 A quick reopen has no birth — the popup Base UI hands back, and the flight it interrupts

Kushagra, on the dropdown: open, close and reopen in very quick succession, and the reopen has no entry — "just a bit of scale and fade in." Probed before it was touched: a reopen that lands mid-dissolve finds the popup still MOUNTED (Base UI keeps it for the exit transition) and flips it back with no fresh mount and **no starting stamp at all** — the measured attribute stream is `data-closed` off → `data-open` on → `data-ending-style` off. Every entry mechanism in the system was keyed on a BIRTH (the node's mount, or `data-starting-style` appearing), and this open has neither, so the panel merely recovered from its half-dissolved pose: opacity easing home from 0.77 plus the exit's `scale 0.98` returning — which is exactly what he saw.

**Three repairs, all in the floating layer, so Menu, Select and the alert share them.** The observers learn the second announcement: `data-open` returning while the ending attribute leaves IS an open. A new flight retires the previous one first: an interrupted flight's release clock is keyed on the very attributes the new flight also wears, and a stale timer would strip the newborn flight mid-air. And the menu's `transitioncancel` dismissal listener arms the frame the flight DEPARTS, never at begin — a flight born mid-exit cancels the exit's own dying transitions the moment the seed's `transition: none` lands, and a listener armed at begin caught those cancel events as a dismissal and released the flight on the spot (measured: fully set up and stripped within the same few milliseconds).

Two laws, one per family, each falsified by re-deafening the observer. One instrument note recorded with them: Base UI removes the ending stamp on its own FRAME, not in the reopen's commit, so a law reading at 0ms reads before the announcement has landed. And one deliberate non-transfer: the dialog's coming focus entry does NOT take the replay — there, recovery from a mid-dissolve pose is visually the entry itself, so the reopen law moved to the alert with the runner rather than being re-pointed.

## 2026-08-16 Alert dialog and dialog split — the materialization is the alert's gesture, and the difference must be built

Kushagra, judging the materialization on the lab's half-screen and 88vw panes: *"my fear is true. What we finalised is good for alert dialog… they are semantically different."* The entry the dialog arc converged on — travel, overshoot, a point origin rising from below — is an ARRIVAL gesture: an interruption announcing itself. That is correct at alert mass and wrong at modal mass, where the same inertia reads as the room moving rather than a thing arriving. The purpose split drives it: an alert comes *at* you and stops you; a dialog is *summoned* — called upon, opened by the user's own hand — so it should mostly just be there.

**The decision: AlertDialog becomes its own component, likely the next one built, and the difference is the point.** It is not a variant or a prop — Base UI ships it separately for the same reason (`role="alertdialog"`, no outside-press dismissal, focus forced to an action), and dialog.tsx has carried the refusal "a decision, not a variant" since §24 shipped. The anatomy splits with the role: an alert's content is FIXED (title + description + actions), which is what licenses the system to animate it — the molten hold and the print are animations of anatomy the system owns. A dialog's content is the consumer's — forms, whole workspaces — and the system cannot print what it does not own. The shipped materialization (seed, rise, unfurl, print) transfers to AlertDialog whole; Dialog gets a new entry.

**The large-mass principles, labbed 2026-08-16 (lab2's mass strip, four candidates judged side by side):** mass lowers frequency (clocks stretch), mass forbids overshoot (damping rises toward critical — the one-crossing allowance spent in the other direction), mass shortens travel (until at the limit the motion transfers to the environment: the scrim IS the arrival, the heaviest things don't move — the world moves around them), and mass softens onset (a spring from rest has no instant velocity). The direction leading on the eye (not yet locked): **depth, not distance** — the scrim pushes the app back (§10's own sentence) and the panel comes forward, a small z-settle with a very slight single overshoot, zero x/y travel. The panel comes into focus, not into view. **The content shares exactly that and nothing else:** blur → sharp on the box's own clock — depth of field is a property of the mass, so what is printed on the plane focuses WITH the plane; blur is also the one channel that presumes nothing about arrangement, which makes it the only honest animation for content the system doesn't own. Two costs recorded with it: filter over a large subtree is the recipe's most expensive paint, and a running filter makes the body a containing block (a consumer's `position: fixed` child would briefly re-anchor mid-entry).

Rejected: the small rise (a free-floating heavy plane rising reads as levitation — heavy things are LOWERED, which is what the still-standing "placed" set-down candidate states instead), the pure fade (the null baseline — honest, but earns nothing), content print on Dialog (ownership), and one prop on one component covering both gestures (the same reasoning that keeps `modal` off the API: it is a decision, not a flag). Values are lab v0; the split is the decision.

## 2026-08-16 The materialization is tuned into the family — one curve, two speeds, and an exit that keeps becoming

The arc between the first materialization (the superseded entry below) and the alert's inheritance, iterated live in the lab and closed the same day. **The recipe's final form:** Kushagra — "I also meant the dialog container itself expanding from a circle in center" — and a clip was judged out on sight (a clip only opens a window INSIDE the panel's rectangle; the growing circle flattened against the box edges instead of BEING the box). What replaced it is a real box: the runner measures the panel's natural card at open — the floating machinery's mechanism without its anchor, the aim deleted — and the pose is a small circle (`border-radius: 50%`, because a fixed radius is a circle for exactly one frame and a percentage keeps the box CURVY as it opens; `padding: 0`, because border-box floors at the padding sum and the first "circle" posed 50px wide), sitting fully below the card's own footprint (half the measured height plus a designed lift — a dialog is summoned, and it surfaces), transparent at birth, with no hold: one event, phased inside itself. The content leaves the flow for the flight and is pinned where FLOW will put it, not centered — "centered equals flow" is arithmetic only while the panel's height is content plus padding, and a min-height panel snapped its content upward at release (measured on the lab's 85vh pane).

**The family unification, three verdicts in a row** (*"not of the same family"*, *"dialog feels snappy… not wrong, but different"*, *"content animation feels different too"*): panel geometry rides ONE spring everywhere — `elastic` (ζ 0.62, ω 10.835: ~8.4% single overshoot, one crossing), minted to replace per-recipe curves — and the clocks split by what they serve. **Box clocks are SPEED-matched to their travel** (the overlay's journey is ~1.7× the menu's, so fall 560 / spread 800 / materialize 700 against the menu's 320/480/380 — a longer journey at the same felt speed), **content clocks are TIME-matched to the family** (print 380 and the 8px echo shared verbatim — the content takes no journey, so its clock is the family's signature). This supersedes the clock values recorded in the entry below (materialize 400 / reveal 200 / revealDelay 240 were the first cut's). A grander overlay spring was minted on the same reasoning and deleted within the hour (*"No this isnt right, made it worse"*): the family reads as one because the CURVE is one; grandeur comes from travel and clocks, never from a second curve.

**The audit's find, measured before it was believed: dropping a property from `transition-property` CANCELS its running transition.** Escape mid-flight snapped the box 125 → 560 in one frame under the fade, because the ending rule listed only opacity and scale and the flight's geometry springs died with the list. Both families' ending rules now RESTATE the entry's geometry channels — a mid-flight dismissal keeps becoming while it dissolves (measured continuous, 149 → 202 → 311) — and a settled exit starts nothing on them, because the values do not change. Rejected on the way: a blur on the CONTAINER (built on both families, removed on request — depth of field belongs to the content; the material's own edge must stay sharp while it forms), and three seed sizes judged before the small one held.

## 2026-08-15 The dialog materializes — the floating principles cross a family boundary without their animation

> **Superseded in place:** the recipe below is the FIRST cut. The scale growth gave way to the circle-rise with a measured box, the calm spring to the family's elastic, and the clocks quoted here were retuned — see the 2026-08-16 tuning entry above. The finished materialization then moved whole to AlertDialog (the split and build entries above). Kept as written because the principles it states are the ones everything after it obeyed.

Kushagra, the same session the silhouette locked: *"lets apply similar 'principles', not the same animation, principles, to dialog opening, I think the container is the same surface."* Then, on the first cut's uniform `scale 0.96`: *"Shouldnt container also grow like it does?"*

**What transferred is the grammar, not one line of the recipe:** geometry springs and paint eases (the two clocks); the box BECOMES rather than blinking in finished; the content is one molten unit — empty, blurred — printing as the box lands; the exit dissolves because leaving is never the entry reversed. **What could not transfer is everything anchored:** a dialog comes from nothing, so there is no silhouette to photograph, no position to aim, no travel — its entry is a materialization, and a panel with no source honestly FADES (the opaque-from-frame-one rule holds in both directions: a body lifting off a trigger does not fade in, a body from nowhere does).

**The growth is scale, and that is not the rejected zoom.** Scale was judged out for menus because it shrinks a photograph of the finished panel — content visibly stretching aboard. The dialog's content is held invisible until the box lands, so there is nothing aboard to stretch and a scaled box reads as a growing container; `0.92 0.8`, asymmetric on the family's own axis grammar (more travel in the block axis — the panel unfolds the way a menu falls before it spreads). That argument is written into the rule, because it is load-bearing: if the molten hold ever leaves, the scale must leave with it.

**Mechanically the lightest entry in the system:** all CSS on Base UI's own `data-starting-style`/`data-ending-style`, no JS, no measurement, no release clock — and Base UI's semantics decide when it plays (a real open transitions; a `defaultOpen` mount is instant, measured: the stamp never appears on mount, which is why every law here opens by CLICK). Its own token family, `overlayMotion` (materialize 400 / reveal 200 / revealDelay 240 / dissolve 140 / settle 160, all v0): the families share a grammar, not a token home, and the clock-vocabulary law learned the third prefix. The scrim rides the paint clock beside its fill in dialog.css; the panel's recipe sits in the shared layer beside the floating block, keyed on the family class.

Laws: entry pose + split clocks + the box-actually-grows sweep, the dissolve (read pinned — the child's print transition is still mid-delay that soon after an open, and an unpinned read reports the value in flight), and total reduced-motion stand-down; the spring-agreement assert falsified against a sabotaged channel before being trusted.

## 2026-08-15 The silhouette locks — the entry answers where the panel came from, and every intermediate is retired

The circle's restoration (the entry below) opened a same-day iteration run that ended somewhere simpler than any stop on the way. Built and judged out in sequence, each on Kushagra's eye in the lab: the circle at 72px with a **quadrant growth center** (the seed's center a quarter of the panel in from the anchored corner, per-side sign arms) and a hold-then-unfurl beat (geometry delayed by the fade clock so the circle was *seen* as a circle); a **fluid spring** for the unfurl (ζ 0.92 / ω 5.8, minted because calm front-loads ~92% of its travel — *"the fluid spring isn't good"*, deleted whole); a **three-stage silhouette→circle→panel choreography** (trigger's box morphing into the circle while traveling to the quadrant — *"nvm, revert"*); and a **covering placement** (the panel pulled back over its anchor by the anchor's height so the trigger visually became the menu — *"Nah the previous one was better"*). The verdict that locked: *"make the circle shape of trigger exactly, and make it start from where the trigger is, thats all, no h/4 w/4."*

**What shipped: the seed is the trigger's own box — width, height, corner — sitting exactly ON the trigger, opaque from the first frame, unfurling straight into the panel through the unchanged emergence channels, with the content held as one blurred empty body that prints as the shape lands.** The designed diameter (40 → 72 → 56 across the day) survives only as the anchorless fallback. A submenu's seed is its trigger ROW's silhouette — the 2026-08-10 adjacency exception is superseded, because what it guarded against (a row-shaped seed *flying in* from the side) was a property of the judged lean, not of the overlay: a measured position starts ON the row and grows the short true distance out.

**Four mechanisms, each bought with a measured failure:**

- **The position is measured, not derived** (`--kui-from-x/y` — trigger rect against positioner rect + the popup's layout offsets; a translate, never a margin). The first spelling measured synchronously in the entry callback and re-proved the 2026-08-10 warning it had dismissed: on a clicked open the popup has its own layout (the laid-out bail passes) while the positioner's transform is still wherever the last frame left it, and the panel flew across the page (*"going all over the page lol"*).
- **The aim waits for placement**: a microtask past the commit's layout effects, re-checked one frame later (floating-ui's own positioning can land a beat after), with the seed released the frame after that.
- **The seed is a static pose** (`transition: none` on `[data-seed]`): under the live transition list, every aim write started a translate transition whose cancellation at seed-release read as a mid-flight dismissal — the release fired two frames in and the panel snapped (measured 36.9 → 350 in one frame). The release clock is therefore read the frame the seed comes off, when the computed list is the flight's own.
- **Invisible until aimed** (`data-aimed`, stamped in the same write as the offsets): a silhouette painted before placement sits wherever the last layout left it — measured, one frame at x=2275 — so an un-placed pose is never seen. A reopen starts un-aimed; an anchorless panel is born aimed.

**Also found on the way, in the lab:** the seed read as a rounded square inside lab2's glass experiments — lab2 stamps `corner-shape: squircle`, and a squircle at 50% radius renders square-ish, which is invisible in any suite that never dresses a panel. The interim fix (seed states `corner-shape: round`, the corner channel morphs the shape) retired with the circle; the lock needs neither, since the silhouette wears the trigger's own corner.

**Laws restated, not weakened:** the first-frame law claims the trigger's box and position (within the held press's ~1px drift — the trigger shrinks under the press after the silhouette measures it, so the claim is overlay, not simultaneity); the two-triggers law inverted back (an icon and a wide button get *different* seeds, the difference itself the calibration); the end-aligned content-slide law measures the content's distance from the panel's own end edge, because the box now travels in screen space by design and the content rides it; and every law reading the flight's transition list first strips the seed, whose list is deliberately `none`. The transition-vocabulary laws that quoted the circle (`--floating-travel`, the fluid spring, `-fluid` in the must-spring regex) are deleted with their subjects.

Rejected and staying rejected: growth centers that are not the trigger (the quadrant answered "where does it grow from" with a designed point, and the honest answer was already measured), springs tuned per-recipe rather than per-role, and the covering placement (the gap survives — the silhouette departing across it read better than the morph-in-place).

## 2026-08-15 The circle comes back — the day of forming recipes ends where the emergence began

Kushagra, on the clip morph: *"OMG this is so bad"* — and then the verdict that closed the whole exploration: *"The one we had before we started this discussion, that was much closer to what I wanted. The menu needs to grow from a circle, small circle, to its shape."*

**Restored: the committed emergence unfurl** (the four out-of-phase channels, the leans, the body counter-squish — now actually running, since his `--motion-rise` fix rides along), **with the seed swapped from the trigger's silhouette back to the designed circle** — the 2026-08-09 original. A seed is a system fact, not a photograph of what was pressed: one diameter whoever opened the panel, leaning onto the thing it came out of, unfurling into the panel's own box. The 2026-08-14 entry below records the three forming recipes built and judged out in between (condensation, deep scale, clip morph); the trigger-silhouette morph of 2026-08-10 retires with them. The entry's synchronous trigger measurement survives with one job — the width floor — and the seed vars it still writes are deliberately unread, law-asserted (a 28px icon and a wide form trigger conjure the same circle).

One CSS fact the swap forced: the leans read the seed-var fallback chain, and with the vars still written a 40px circle leaned by a whole trigger-height — the lean now reads the designed diameter directly, the same number the seed does. Two harness facts came out in the re-run: `inMotion()` must precede a `defaultOpen` mount (the entry begins at mount's microtask and reads its release clock off the harness's pinned zeros — the flight was cut at 75px and snapped 275 more at release), and the decided-once collision law is a MutationObserver now, not a frame poll (under full-suite load the whole entry fits in two frames; a flip between frames is a record, not a gap).

What survives of the day permanently: the dangling-var law (a `var()` without a fallback must resolve somewhere — `--floating-rise` is the shape it catches), the reduce-suppression per-file stand-downs, the held-width floor, and the body's working counter-squish. Rejected and staying rejected: every recipe where the panel does not grow — the eye's one consistent verdict across four attempts is that growth from a small, shape-free origin into the panel's own box is the read, and the circle is that origin.

## 2026-08-14 The entry stops being ported and starts being formed — judged against iOS's own frames

The unfurl was judged out the day it finally worked. The body's counter-squish had shipped reading `var(--floating-rise)` — a token that never existed — and a dangling `var()` invalidates its whole declaration, so the squish had been silently absent since 2026-08-09; Kushagra found it in the lab ("the container moves nicely, but the text doesn't move or stretch with it") and fixed the name. With the stretch finally whole, the verdict came at once: *"a rigid body is conjured up, and as a result of that inertia, it stretches… I want the body to form, to be created, not to be ported."*

**Two recipes were built before the one that landed.** The first condensation was born at its final size at `scale 0.96` — mechanically clean, judged too slight: a breath under full scale reads as a finished object blinking in, not as growth. His iOS frames settled the direction: iOS **grows** the menu from the trigger, but as one piece of matter — springing open with a visible overshoot, content aboard and **molten**, heavily blurred, sharpening only as the material sets. Growth without re-layout is the whole trick: nothing stretches because the thing scaling is finished underneath and merely coming into being.

**Three recipes in one day, and the third held.** The first condensation (scale 0.96) was too slight. The second grew — `scale 0.4 → 1` with a droplet corner morph — and was judged out on sight (Kushagra: *"the shape morphing isn't solved… doesn't look good"*): scale at any depth shrinks a *photograph* of the finished panel, and a mini-panel zooming is not a forming one. The web search he asked for settled it — Emil Kowalski's floor for menu scale is 0.9+ ("gentle, never deep"), and the one credible web recreation of the iOS menu (beUI's context menu) uses **no scale at all**: a **clip-path inset morph**, the window collapsed at the pointer expanding to reveal a finished panel in place.

**The shipped form is that mechanism on this system's bones:** the panel is born at its final layout size in its final place; a rounded window (`inset(t r b l round R)`, quads set by the same per-side/align arms that set the transform-origin, `round` reading the panel's own `--kui-sf-radius` chain) collapses onto the anchored corner and expands on the lively spring — the material's footprint grows like liquid spreading, the content is uncovered at full size, and nothing ever zooms or stretches because nothing ever transforms or re-lays-out. The flight's held target overshoots to `inset(-80px)` so the shape lands a beat early and the cast — invisible while any clip holds, since a shadow lives outside the border box — blooms through the widening slack instead of popping at release; the release's swap to `none` is a discrete change over an identical paint. Presence rides opacity, the body stays under `blur(6px) → none` so readability lands last (blur joins the PAINT set — focus is the viewer's read, not the box's mass), and the spring visibly overshoots in the clip itself (measured −7% mid-flight). Measured live across the final recipe: the window's insets run 83% → 24% → −7% (the spring's own overshoot) → slack, with layout width constant to the tenth of a pixel on every frame. Deleted whole: the lean, the seed silhouette, the width/height interpolation, the unfurl clip, the positioner-hold pins, the body counter-squish and pin, the pointer-events dance, and the submenu's adjacency special case — each existed to move or stretch a box. Surviving: the synchronous width floor (the measurement's one load-bearing job), the per-open replay, the release clock, the corner-pivot machinery.

**The laws moved instruments with the recipe.** Layout width — `getComputedStyle`, transform-blind on purpose — now carries the floor and seam claims, because the rect is the channel that is *supposed* to move; "content does not slide" became "a row's unscaled offset within its panel never changes", the relative claim the old defect actually violated; the replay signal moved from height to opacity. Three sabotages each failed exactly their own law (a size channel re-added, the blur removed, the sharpening snapped). Two instrument finds along the way: a `defaultOpen` entry begins inside mount's layout effect, so `inMotion()` must precede `mount()` or the release clock reads the harness's pinned zeros and releases mid-fade; and the seam tolerance is one device pixel — the entry's floor and floating-ui's dpr-snapped one may differ by a sub-pixel at release, and the defect the law guards was ten of them.

**The finding under the finding became a law:** nothing walked a component sheet for `var()` names that resolve nowhere — the gap's other half, flagged in the fix's own comment. Now: a `var()` without a fallback must resolve to a declaration somewhere in the shipped sheets (fallback-bearing reads are hooks and stay free; JS-written names carry an allowlist with a sentence each). Falsifying is trivial forever: `--floating-rise` is the shape it exists to catch.

Rejected: keeping any width/height interpolation (that IS the porting read); the near-1 condensation (too slight); DEEP scale with a droplet corner (a zooming photograph, judged out on sight and against the practitioner floor of 0.9+); a bouncier spring (damping is sacred — the clip's own travel makes the lively spring's overshoot visible, measured −7%); blur on the panel instead of the body (it would smear the material's own edge, and the material is exactly what must read as setting).

---

## 2026-08-11 The panel compressed at release, because the two width floors measured different triggers

Kushagra's screenshots: a select whose panel has no reason to be wider than its trigger opens wide, then compresses with a jump. Measured live on the Deliver-to specimen: flight at 402px, settle at 392, a 10px step the frame the flight ends.

The two floors disagreed about which trigger they were flooring on. The entry's own `--kui-anchor-w` reads the trigger's rect on the open's first frame — before the held-press transition has visibly moved — so it reads the RESTING box. Floating-ui measures anchors WITH their transforms (the very fact the held press leans on to still the panel), so its settled `--anchor-width` reads the trigger at `scale: 0.975` — the held box. Flight targets 402, release removes the entry's var, the floor falls to 392, the panel steps. The held press (2026-08-10) created the disagreement; neither floor was wrong about its own moment.

**The fix is agreement by input, not by timing: the entry floors on the trigger AS HELD.** `heldAnchorWidth` corrects the rect from the scale the anchor is at to the scale it is heading to — the end value of its running scale transition, read off the Web Animations API. Generic on purpose: an anchor that never deforms (a submenu's trigger row) has no scale transition and passes through untouched, so no family knowledge enters the JS. The seed stays the rect the eye currently sees; only the TARGET moves. Settled-vs-flight now differs by Base UI's device-pixel snap (0.06px measured), which the pixel grid absorbs.

**The law that had covered this seam passed all along, and the reason is the half-law lesson yet again:** it mounts with `defaultOpen`, where the trigger is BORN holding the press — no scale transition ever runs, both floors read the same scaled box, and the axis that was right was the axis under test. The click axis — the one a user takes — is the broken one. Its sibling law now opens by real click, calibrates that the held press genuinely shrinks the trigger, and asserts the release frame does not step; falsified against the raw-rect floor, failing at exactly the reported geometry (360 → 351).

Rejected: dropping `scale` from the held press (removes the cause, changes a judged design — Kushagra's call, not the mechanism's); keeping `--kui-anchor-w` past release so the settled panel stays at the resting width (the stale-stamp class of bug — Base UI's own floor updates on reposition, ours would not); reproducing Base UI's device-pixel snap in the entry's floor (rebuilding the other side's arithmetic is the transmission law's lesson, and the mismatch it would remove is sub-device-pixel).

## 2026-08-10 Dialog, and the two sentences it falsified on the way in

Kushagra picked Dialog over Badge and Tooltip as the next component, with four calls: it takes the size index, it draws no cast but must respect `material`, the backdrop is §10's designed scrim, and there is no system-drawn ✕. Motion is deliberately absent — another pass owns the entry.

**"A dialog has one size" (§6) died the way "a card has no size index" died.** The overlay band was one palette step because nothing that used it varied; the moment the component took the index, its padding and its width moved and a fixed corner was the exact mismatch the 2026-08-04 Card amendment was written to end. `--radius-overlay-1..4` now leans one step up the surface band (7-10), so an overlay wears the corner of the card one size up — one relationship, true at every level by construction, with the old flat value surviving as what size 4 wears. Minting a disjoint fifth band was rejected: the palette has no room above 10 without renumbering, and "a dialog is rounder than a card of its size" is a relationship worth stating rather than four more numbers to judge.

**"A floating layer always states its coverage" (§22) is satisfied by the scrim, not owed a shadow.** The dialog casts nothing of its own; what it keeps is the world's ordinary surface chrome, so it lifts exactly as much as a Card does in an elevated app and not at all in a flat one. The law asserts that equality in both worlds with a flat-world menu as the negative control, because "no shadow anywhere" would otherwise pass for it. It also stays OFF `kui-floating` — that class carries the concentric corner (written for a pane hugging rows) and the floating cast, and wearing it for family-resemblance would have imported both.

**The scrim was designed on 2026-08-04 and had never been emitted.** It is minted as its own pair per mode rather than as a fourth material, and the reason is the ladder's own definition: a material makes the component's OWN fill translucent to defend a foreground, while a scrim pushes the app back. Black in both modes — a scrim mixed from the page colour vanishes in dark, which is where dimming needs the most help — and dark leans harder for the same reason. `contrast="high"` and `prefers-reduced-transparency` share one answer, more pigment and no defocus, because the two preferences want the same thing here.

**Two mechanisms fell out of it being the first UNANCHORED floating component.** Ambient direction (§20) was read off the trigger, and a dialog need not have one; with nothing measured the hook rested at its `ltr` initial value and PortalScope stamped it, overriding the `rtl` a portal would otherwise inherit — the runtime-switch fix's own finding (a stale stamp is worse than no stamp) arriving by a different road. It falls back to the document element now. And the panel is centred by auto margins inside Base UI's scrollable viewport rather than by `align-items: center`, which clips: a centred flex item taller than its scroll container overflows in both directions and the container cannot scroll to the top of it, so a long dialog would lose its own title.

**The first cut of dialog.css put the per-size arms in the component sheet and a shipped law refused it.** `data-size` in a component stylesheet is exactly what recipes.css's no-axis walk forbids, and the fix is the floating join's own shape one band over: the shared layer's overlay size join answers `data-size` with the corner and PUBLISHES the designed width (`--kui-overlay-w`) for the pane to consume — so a Sheet that wants the window's whole width simply will not read it. The width ladder is named `--overlay-w-N` for the family for the same reason: the token is spelled in the shared layer, and a family token wearing one member's name is the drift §23 renamed `--menu-p` to avoid.

Refused with reasons in the registry: Header/Footer (Card's cut — layout is not anatomy; Title and Description ARE parts, because `aria-labelledby`/`aria-describedby` force them), the corner ✕ (same positioned slot; `DialogClose` places a real Button, which is also what a touch screen-reader user needs), `modal`/`disablePointerDismissal` (an alert is a decision, not a flag), and a `size` on the title — no surface here sizes the type inside it, so the parts state §15's composition steps and a dialog matches the confirm card by construction. Open: whether a size-1 dialog deserves a smaller title, and whether a long dialog should scroll its body instead of its viewport (the pinned-header shape, which Sheet will ask about too). 18 mounted laws, four sabotage passes; +295 bytes gzipped.

## 2026-08-10 The grip squashes when held, and finding its key re-measured the suppression the whole layer trusted

Kushagra asked whether the slider thumb needs physics-based distortion, and the answer split: **distortion on the hold, physics on the travel never.** During a drag the pointer IS the physics — Base UI writes the position inline, and a spring between finger and grip is lag on a direct manipulation (§8's "motion that IS the content", one instrument over) — so the grip's transition carries exactly one channel, `scale`, and a mounted law holds the computed list at one. The squash is the family's own `--press-squash`, no new number: held for the drag like the open trigger holds its press, recovery spring at release. The family rule's "a grip never deforms under a drag" loses its deformation half and keeps its travel half.

**The key is `data-dragging`, not `:active`.** Base UI stamps it on the thumb from the first pointerdown frame — thumb press or track grab alike — and it survives the pointer leaving the strip under capture, which `:active` is not guaranteed to. On a range slider the stamp is root state, so both grips squash while either is held; recorded as the stamp's granularity (Base UI writes no per-thumb active attribute), judged in the playground's range specimen. The press-clock restate rides the same stamp so deformation and clock arrive atomically — and honesty about it: the sabotage pass proved the restate redundant on every grab a desktop harness can drive (`:active` lit even on Base UI's preventDefault path, and the shared press rule's pair reached the thumb by inheritance), so it stands on the touch-timing argument, not on a measurement. The law asserts the observable and was made falsifiable by pinning a wrong clock instead.

**On the way in, the reduce suppression turned out to have the 2026-08-10 ring defect's second verse.** The shared stand-down covers `.kui-control *` at (0,1,0); the tick, the dot and the switch grip declare their clocks in sheets that import later — the dot's `.kui-radio > svg > circle` outruns it at (0,1,2), the others tie and win on file order. Measured before claiming: the tick kept its 0.38s draw under `reduce`. The coverage law read which selectors appeared in the guarded block — the exact spelling of the ring's lesson, on `transition` this time. Fix is doctrine, not arithmetic: **the sheet that declares a clock stands it down itself, on the declaring selector**, end of file, so the tie goes to the stand-down by construction; four sheets now carry the block (checkbox, radio, switch, slider) and each was falsified by deleting it — every deletion failed exactly its own subject.

**The new mounted law was itself caught measuring nothing first.** Its first spelling pointed at an unchecked radio and a checked box's dash — both ride their own instant-out arms (`transition-duration: 0s`) in every mode, so deleting their stand-downs changed nothing and the sabotage pass failed the law rather than the code. Re-pointed at the live states (checked radio, indeterminate dash) with per-part calibration: each subject must have a running clock in motion mode before its stillness assertion counts. An instrument has to be pointed at the state it names — third time this lesson has earned its sentence.

Rejected: springing the travel (lag on direct manipulation); `:active` as the key (capture stranding, and the family squash rule's own `:not(.kui-control *)` scope was never the right door); a per-thumb squash on range sliders (no platform stamp to key it on; revisit only if the pair-squash fails the eye); raising the shared stand-down's specificity instead of per-file blocks (no spelling wins against an arbitrary component selector by construction — the doctrine scales, arithmetic does not). Keyboard-step and track-tap easing stay open with the eye-pass list: a discrete jump has no pointer to track and could ride the recovery spring, iOS's own answer.

## 2026-08-10 The playground's page goes back to `--neutral-1`

Kushagra: *"Lets set previews bg to neutral 1."* This reverses yesterday's entry (below) after one day of living with it.

**The seal-as-page experiment did what it was built to do, and the answer was that the surfaces hold.** A flat card on a white page in light, with nothing but its hairline to be a card with, is legible — which was the thing under test. It is not the thing the page is FOR. `/preview` exists to judge whether a card, a menu, a glass pane and a filled field look right beside each other, and a page painted the same colour a card seals with makes every surface argue with its bed before it argues with the eye. The glass sections were the clearest case: a material judged over a backdrop identical to the seal is a material judged over nothing.

So the free step of contrast comes back deliberately, and the harder bed is a thing to switch to when a surface is under suspicion, not the standing ground for a page whose job is composition.

The system still paints no page background of its own, so this remains entirely the app's call — nothing about the library moved, in either direction, on either day.

Rejected: keeping the seal and adding a page-colour toggle to the environment panel (the panel holds Theme axes; a page colour is not one, and an app-level control there would read as a system feature); `--neutral-2`, still too much separation for the same reason it was turned down yesterday.

---

## 2026-08-10 The icon was the one thing in a control that touch never re-priced

Kushagra, from the playground: the icons *"don't seem to scale"* on coarse, with the guess that the box grows and the stroke does not.

**The guess was one layer off, and the measurement is the whole entry.** At size 2, default density, the coarse world grows the button 32 → 44, its label 14 → 16, its line box 20 → 24 and its checkbox sibling 16 → 20 — and the icon sat at 16 in both worlds. Nothing about it scaled, stroke included: a stroke lives inside the glyph's viewBox and scales with the box, so a box that never moves takes its stroke with it.

**The cause was one sentence covering two axes.** `iconSize` was documented as "NOT part of the density or pointer sets — the icon grid is a perception floor, not a breathing-room choice", and that is a correct DENSITY argument: a compact size 2 and a comfortable size 2 are the same control at different airiness, so the glyph inside them is the same glyph. Pointer got attached to it with no argument of its own — and pointer is not breathing room. Coarse means the screen is held close and touched, which is precisely why it re-prices type steps 1–4, the line box and the whole mark family. §12 had even written the implication down already: type, the icon box and the gap between them are "one label cluster", and two of the three answered the pointer axis.

The box is now its own designed ladder per world — 16/16/20/24 fine, 20/20/24/24 coarse. Deliberately NOT a ride on the line box the way the mark family is: a mark is one line of its label by identity, but an icon has to land on the 16/20/24 grid the sets are drawn for, and a type step lands wherever the ramp lands. Coarse stops at 24 rather than continuing, so sizes 3 and 4 share a value the way 1 and 2 already do.

Two laws, both falsified against the pre-fix ladder: the emitted one (both worlds declare it in full, coarse is never smaller, and — the vacuity guard the mark round taught — some size must actually rise, since every other assertion is satisfied by a coarse world identical to the fine one), and the mounted one, reading the PAINTED width of an icon inside a real Button per size. The second is the one that matters: a token law would have passed on the day the token was written and said nothing about whether an icon in a button ever reached it.

Rejected: riding the type band like the marks (lands off the drawing grid); a coarse ladder continuing to 28 (28 is not a grid the icon sets draw for); changing the stroke (it is user units in the viewBox — the box was always the only lever).

---

## 2026-08-10 The ink ladder stops being picked and starts being aimed

Kushagra, still in the taste pass: *"there's not a lot of contrast difference between the three."* Measured on a card, the three type rungs ran 103 / 78 / 65 in light and 94 / 67 / 36 in dark — so in light the top rung sat 26 points from the middle and the middle sat 13 from the bottom, which is the unevenness the eye had caught without a number.

**The real finding was underneath it: the two halves of the system reached their inks by different means.** Neutral took designed steps 12/11/10; every chroma family faded its one text colour by a fixed 74% and 52%. Neither answered "how much contrast" — one asked "which grey" and the other "how much fade" — so the ladders could not be compared, and in fact were not comparable: the chroma families landed wherever those percentages happened to put them.

Now the rungs are **targets**, and the fade is solved per family per mode to hit them, against the harder of the seal and the page. This is the `--accent-label` / `--control-edge` mechanism doing its fourth job, so it introduced no machinery. Every family lands within a point of target on both beds.

**What was deliberately NOT solved is loud.** Kushagra's call, and the obvious "finish the job" edit is to solve all three — so it has a law of its own. Loud stays the family's designed text colour; it is the accessible resting state for reading, and a target number is not the right owner of the system's most-used ink.

**The rung definitions changed, and two consumers moved with them.** Medium is `apcaFloors.body` exactly — real information said quietly. Quiet is 30, below the reading floor on purpose: the exception rung, for something deliberately stood down. So placeholders left faint for muted (faint had claimed the placeholder as its own case back when it merely meant "the quiet one"), and `--color-text-caption` was deleted outright — minted one day earlier for menu and select group labels, which is exactly what muted now means.

**A claim I made and withdrew, again.** I proposed quiet at 45 and flagged that it would sit under the reading floor. Kushagra's 30/60/90 makes that sharper, not softer, and the honest resolution was not to argue the number down but to say what the rung is FOR and write the exemption down. The 2026-08-07 rule keeps text floor-checked in standard mode; this is a stated carve-out for one rung that is not for reading, not a quiet erosion of it.

Left open, unfixed and recorded: a chroma family's loud ink measures ~66 in dark, so a coloured ladder there is 66/60/30 and its top two rungs read as one. The fix is a per-family loud, which is the exception this whole rewrite deleted, so it waits for the eye pass rather than being smuggled in beside it.

Rejected: solving loud (above); lowering muted for chroma families only (the exception again); keeping the caption role "just in case" (an emitted ink nothing reads is the `font-weight-bold` lever, one axis over, and that one was deleted for the same reason a day earlier).

---

## 2026-08-10 The look axis splits in two, because one answer could not say "plain card, filled inputs"

Kushagra opened a taste pass with a proposal — `look` should be separate for controls and surfaces — and it was refuted twice before it was accepted, which is why the accepted version is narrower than any of the three shapes it went through.

**The refutations, in order.** First: §19 defines the look as ONE physics applied without exception, the per-family resolution already exists inside the single axis, and `surfaces` (the depth prop) had the only good name a second axis could want — so a split buys combinations, not resolution. Second, when the proposal became *take Card off the axis instead*: the exits granted to the slider, switch and progress bar are all "this thing has no resting surface", and a card is the most resting surface in the library, so it cannot use that door; the honest version of that idea is the split spelled as a subtraction. Third, when it became *one object-valued prop*: partial overrides need merge semantics no other Theme axis has, and an inline object literal is a fresh identity every render — the memo bug of 2026-08-06, re-committed as an API.

**What settled it was a screenshot, not an argument.** A white card holding grey filled inputs — the most ordinary form on the web — and it was unreachable, because `filled` moved the card to `--neutral-2` and the field to `--neutral-3`, one step apart, which is mush. Kushagra's own sentence for what he could not build: *"I can't create enough contrast… I need a way to distinguish between what is background, and what is foreground."* Card leaving the axis would have delivered exactly that picture and was still refused, because it forecloses the tinted surfaces `filled` is meant to grow into — and that is the one thing an app is most likely to want from this axis next.

**A claim I made and withdrew, because the correction matters more than the claim.** I argued the split forces the emitted greys into a 2×2 table — that a filled control's step must depend on whether the surface behind it is filled. It does not, for the case that motivated the split: a light grey input reads correctly on a white card with today's values untouched. The coupling is real only in the both-filled cell, which was already mush before the split and is a taste question about which steps `dress` picks. So the split ships with **no colour changes at all**, and both-filled stays on the eye-pass list.

`depth` is the rename that made room: the prop had been `surfaces`, which names the family it dresses rather than the question it answers, while §19's own four-worlds frame states that question as *"does light exist"*. Nothing is published, so the rename is free.

Rejected: the object-valued prop and the Card exit (above); a `look="filled"` string shorthand meaning both (it makes the grey-on-grey world the shortest thing to type); a compound `[data-surface-look][data-control-look]` selector (the two axes are answered separately, so each block declares only its own families — a law now asserts the families partition, because two blocks writing one role would make the losing prop silently inert); and `surfaceLook`/`controlLook` as camelCase was accepted rather than avoided, on the `iconOnly` precedent.

---

## 2026-08-10 The lit row's tick was the third thing standing on a fill that moved without it

Kushagra, on a Select open at `contrast="high"` in the playground: the accent tick against the solid row *"looks weird"* — should high contrast keep a lighter background and darken the label instead, the way a medium-emphasis button does?

**The proposal was measured and rejected, and it is worth staying rejected.** Medium's fill is `--tone-soft`, which is byte-identical to the fill the conformance arm replaced: 1.16:1 light and 1.08:1 dark against the panel. Those are the exact numbers from the 2026-08-09 audit that put the lit row on the solid rung in the first place, so a lighter high-contrast fill does not soften the setting — it undoes it, and leaves the highlight below the 3:1 WCAG 1.4.11 owes a non-text indicator. Any pastel lands there by construction: a soft fill is dress, and dress is designed not to shout.

**But the eye had found something real, one element over from where it was pointing.** `--accent-solid` is `#0094fc` in BOTH appearances — one designed pigment, not a per-mode pick — while the solid row it now sits on inverts: near-black in light, near-white in dark. So the same tick measures 5.21:1 in light, where it clears the floor and only offends, and **2.65:1 in dark, where it is under the floor** — a conformance failure on the surface whose entire purpose is clearing floors, shipped by the fix that was written to clear them.

The repair is the previous fix's own sentence applied once more. That arm already reads *"a fill that changes underneath ink that does not is the half-fix that ships"*, and it moved the fill and the label and stopped: the indicator was the third thing riding the same fill, and nothing looked for it. Under `contrast="high"` a lit row's tick now takes `--tone-contrast` alongside its label — 16.5:1 light, 17.6:1 dark — so the row speaks with one voice.

**What the accent gives up is exactly one row**: the one that is both lit and checked. Every other checked row in the panel keeps `--accent-solid`, at rest, in both appearances, in standard mode — and the tick's PRESENCE is what says chosen, never its colour, since an unchecked row has no tick to compare against. Every OS menu resolves it the same way. Rejected alongside the lighter fill: a second, per-mode accent step for this case, which would mint a value to serve one state on one surface when the row's own contrast ink already answers it.

**The law that let it through was two-thirds of a law.** It mounted both appearances, asserted the fill moved and asserted the label followed, and never read the indicator — the one-sided-law lesson (Progress, 2026-08-08) in its three-part form. It reads all three now, and its negative control is an UNLIT tick still wearing the accent, which is what fails if the new arm is ever written without its state guard and swallows every checked row in the panel. Both sabotages were run.

## 2026-08-10 The seed becomes the trigger itself — the morph, unblocked by the machinery built for a different bug

Kushagra: *"What happened to the idea that it feels like it morphs from the buttons? Lets try that — its in the artifact you did."* It was, and it was refused on 2026-08-09 for a stated mechanism: the seed wanted to be the trigger's own box, floating-ui publishes the anchor's dimensions asynchronously, and the seed frame cannot wait. That blocker died this afternoon as a side effect of the first-open pop fix — the entry now measures the trigger ITSELF, synchronously, per open, for the width floor. The same measurement is three more style writes.

**The seed is the trigger's silhouette: its width, its height, its corner, sitting exactly over it.** No position is ever read — the one reading that would race the positioner. The overlay is exact by construction instead: the seed is pinned to the panel's anchored corner, the anchored corner IS the trigger's corner (that is what align start/end means), and the travel is its own height plus the gap — a gap STAMPED on the popup from the same constant the positioner is given, so the two cannot disagree. Measured live: trigger 925,606 32×32, seed 925,606 32×32, same 16px corner.

**The half-seed sideways lean is deleted whole, clamp and all — including the clamp shipped two hours earlier.** A fixed circle near a variable trigger needs a judged distance, and any judged distance is wrong at some width (the icon-button finding of the morning). A matching shape needs none: the sideways travel is zero for a 28px icon and a 620px form trigger alike, asserted at both extremes by one law. The morning's clamp was the right fix for the circle; the circle was the wrong seed.

**The morph's one structural consequence reached the release.** It waited on the inline channel's `transitionend`, inline-size being the longest clock — and the morph's seed is the trigger's width, which for a select is routinely EXACTLY its panel's width: equal start and end means no transition, no event, and pins that outlived the flight forever (measured: the first-open law timed out with the flight attribute still set). No single channel is safe to wait on — a panel can be one seed tall, a side can be gapless — so the release is now by the clock, read off the popup's own computed transition list (duration plus delay, longest pair), which keeps the clocks' one home in the tokens. `transitioncancel` stays for dismissal; the release also stands down when the flight attribute is already gone, because the suite lands panels by stripping it directly.

**The submenu's seed stopped flying — its claim is ADJACENCY, not overlay** (Kushagra: *"the submenu appears very different"*). It did: the morph made every seed its trigger's box, and a submenu's trigger is a ROW at `inline-size: 100%` of its panel — so the lateral lean that had been a 40px nudge inherited the row's width and became a ~200px flight in from the side, the child panel visibly thrown across its parent. A submenu cannot sit ON the thing it came from without covering the parent panel, so its version of the morph is the other honest claim: a row-height SLIVER, level with the trigger row (the §22 seam already holds the child's first row to it), appearing beside it and growing down into the list — the row handing off to the panel, nothing travelling anywhere. The side rules now declare no lean at all, the same absence-is-the-mechanism sentence the aligns learned; the law pins zero travel and the sliver's row-height, falsified against the returned flight at −96.9px.

**The lock became a HELD PRESS within the hour** (Kushagra: *"button goes down when clicked, but with select or dropdown, its not happening — I want it to go down, and stay there"*). Locking an open trigger at rest killed the wobble and the press with it: menus open on pointer-DOWN, so the open stamp lands the instant the sink begins and cancelled it before it was visible. The right model was his: the open state IS the held press. `[data-popup-open]` now holds `press-travel` and `press-scale` — the click latches down, the panel keeps it there, closing lets it back up — and the stillness survives, because held-at-one-value moves nothing the panel hangs from whether the pointer stays or goes. Two laws had to learn that the held press SCALES the trigger 0.975: each was reading the trigger's rect at a moment with a different scale than the one its claim was about.

**And an open trigger's geometry was first LOCKED at rest — the call this superseded** (Kushagra: *"leaving the mouse off triggers also moves the menu as the button moves back to its OG position"*). Not cosmetic: floating-ui measures the anchor WITH its transforms, so the trigger's 1px hover settle — 550ms of lively spring — dragged the whole anchored panel with it. While its popup is open a trigger is a hinge: both geometry rules (rise and press) stand down under `[data-popup-open]`, in button.css and the select trigger alike, while the paint states stay — the lit open fill, the press fill on the closing click — because paint moves nothing the panel hangs from. The law's own instrument note: Base UI inerts the page behind an open menu, so the rising-twin calibration must run BEFORE the open — the first spelling waited fifteen seconds for a twin the backdrop would never surrender.

**An open trigger stays lit, the select trigger presses like a button, and the pointer-events stand-down lasted one hour** (Kushagra, closing the day: *"dropdown menus trigger also should remain in state where it activated"*, *"its also an onclick trigger"*, *"we need to cancel pointer events, it annoys"*). The open state was §21's sentence said a third time — the submenu's row, then the select trigger, now the menu trigger — so it promoted to the shared layer: any control whose popup is open holds the HOVER step, rows keeping their own richer rule. The select trigger takes the button family's press and rise verbatim (its own tokens, no new numbers): §8's "a field does nothing" is about the box the eye rests inside, and this is a button in field dress. And the flight hit-tests again — the stated trade of the pointer stand-down (an eager click dismisses instead of selecting; a row under a resting pointer cannot light as the panel arrives) bit within the hour, exactly as stated, and the cursor's brief flip over the trigger is accepted as the lesser annoyance. The reversal note lives in the stylesheet where the `auto` is load-bearing either way: the held box around the flying panel is a dead region the panel must punch back through.

**And the overlap window went to the BUTTON — the same hour, third judgment on one frame** (Kushagra: *"pointer events none in beginning so that cursor doesnt change, and opacity 0 until it moves out of trigger, so that button isnt invisible for that time"*). The opaque seed fixed one lie and told another: the button vanished under a blank chip while the panel overlapped it, and the chip flipped the hand cursor to default on the frame the menu opened. Both asks are one idea — while the panel still overlaps the trigger, the BUTTON is the real thing (visible, hoverable), and the panel becomes real as it separates. Spelled as: the seed back at opacity 0 with the reveal DELAY holding it there exactly the overlap window, the fade running while the fall carries it clear; and `pointer-events: none` for the whole flight, so the cursor never flickers and a mid-flight press is refused rather than landed on a row that is not yet where it will be — the stated trade being that an eager click inside the ~480ms flight dismisses instead of selecting, reversible if it annoys. The morph's read now comes from the EMERGENCE, not from a chip replacing the button.

**And the seed is castless, and the light fades up — the hour before** (Kushagra: *"but its not over button?"*). It WAS — measured at the pixel — and invisibly: the circle recipe's fade-in survived into the morph, so by the time the panel could be seen it had grown off the trigger, and the visible entry still began below the button. The overlay law was true while the thing it promised was unwatchable — a law about geometry cannot see opacity, which is why the morph law now pins both. A morph is the button's own body lifting, and a body does not fade in; what still arrives gradually is the LIGHT — the seed casts nothing, and the floating shadow fades up on the reveal clock as the panel lifts, elevation gained honestly instead of a full drop shadow popping in around a button-sized chip. `box-shadow` joins the PAINT side of the two-clocks law (light, not mass) in both spellings. The dissolve keeps opacity: leaving is not the entry reversed.

**Kept from the circle:** the designed `--floating-seed` survives as the fallback for an entry that never measured; the submenu sides keep their full-row travel (a submenu's seed is its trigger ROW); the body squish, the reveal, the dissolve and both clocks are untouched. The circle-vs-morph judgment is Kushagra's, made on the playground; the circle was never wrong at a wide button — it was wrong at a narrow one, and the morph is the version with no wrong width.

---

## 2026-08-10 The entry becomes the family's, and the second member finds the bugs the first could not

Kushagra: *"Can we apply the same animation to select now?"* — and the answer was a promotion, not a copy. The recipe moved out of menu.css onto `.kui-surface.kui-floating`; select.css gained zero motion CSS. The second-member-self-keys rule was set aside deliberately: the mechanism was family-named end to end before Select existed (the JS finds its panel with `closest(".kui-floating")`, the measured box is `--kui-floating-w/-h/-bw`, the clocks are `--floating-*`, both members already published the same pad hook) — the only component-level thing about it was the selector, an accident of Menu shipping first. Copying ~130 lines would have duplicated every seam, pin and precedence decision of the last two days into a file that can drift, and three of those days' bugs WERE drift.

**The promotion earned its keep by what the second member's laws caught within the hour — five real defects, none of which Menu could show.**

*A wrapper sat inside the listbox.* The measuring body is a div between the panel and its rows, and a `role="listbox"` may contain only options and groups — Select's structural law reported it on arrival. Menu has had the same hole since the wrapper shipped, with no law that could see it. `role="presentation"`, which is what the markup always meant.

*The seed borrowed an attribute React owns.* The measurement stripped Base UI's starting stamp to read the natural box and put it back by hand — a bet on the framework still intending to remove it, which Menu's lifecycle happened to honour and Select's did not: the hand-written attribute stayed forever and every menu in the APP opened as a 40px circle and stayed one (StrictMode runs ref callbacks twice; the second pass measured the seed the first pass had set, and the suite — which never double-invokes — stayed green). The seed is our own attribute now, removed by us, and a law mounts the real menu under `<React.StrictMode>` because what is under test is the interaction with React's lifecycle, not our code alone.

*The specificity of a promotion.* The width floor is two classes; the seed's stand-down used to tie it and win on source order within one file. Moved to a sheet that loads earlier, the same tie went the other way and the panel opened at its 112px floor. Every selector in the moved region carries `.kui-surface` now — stated as specificity, so the family's entry cannot be outranked by a component stating a resting fact.

*The dead region outlived its flight.* While the positioner holds the panel's final box, the gap around the small panel would swallow a click, so pointer-events stood down — cleared by JS on `transitionend`. A panel landed any other way kept a dead region over the page forever (Select's choosing law found it by timing out). It keys on the flight attribute now: state-driven, gone exactly when the state is.

*And the entry ran once per NODE.* Kushagra: *"animation on select only once. Next time, its instant."* The entry lived in the body's ref callback — once per DOM node — which Menu's unmount-on-close lifecycle happened to re-run every open. The mechanism now begins per OPEN: it watches for Base UI's per-open starting stamp. Which immediately surfaced the deeper one: on a reopen the fresh positioner can still be ZERO-WIDTH when the callback runs, so the "natural" measurement read the panel as its own padding and the entry flew TOWARD 10px — the panel visibly shrank. A reading at or under the seed now means "not laid out yet", bails before touching any attribute, and the stamp retries it. The law that pins this was itself caught passing on the sabotage: it asserted `max > min`, which any motion satisfies, shrinking included — direction is `last > first`, plus a landed panel bigger than two seeds.

**And the icon button, from the same screenshots** (*"it starts from right next to the button then goes down"*): the seed's sideways lean was a judged half-seed, and the judgment was made on wide text buttons, where 20px lands the circle comfortably ON the label. On a 32px icon button the same 20px pushed the circle's centre clean off the control — the entry read as a shape appearing beside the button and dropping away, which breaks the seed's one claim. The lean now aims at the trigger's own middle, capped at the judged half-seed: a wide button computes the old 20px byte-identically (pinned by the law's second arm so the fix cannot re-tune what was judged), a narrow one centres. The magnitude is spelled min-then-subtract because the first cut floored at a raw `0px` and the tokens-only law refused it — correctly: the floor was conservatism, and centring on a narrow trigger is better than pinning to the panel's corner. The trigger's width is measured by the entry itself off the node the direction mechanism already holds — never floating-ui's `--anchor-width`, which arrives too late for the seed frame (the 2026-08-09 corner collapse, still the precedent).

---

## 2026-08-10 Why a menu that opens left looks worse than one that opens down — two answers, one fixed and one recorded open

Kushagra, on the playground: *"I don't genuinely understand why a dropdown menu that opens to left looks and performs so different to the one that opens bottom."* Measured, it is two separate faults that happen to co-occur on every `...` button near a right edge.

**The first is a layout fact, not a motion one, and it is fixed.** A block child lays out from its container's inline-start, so the body's origin IS the panel's left edge. Start-aligned, that edge stands still and the right edge does the growing — the words sit where they will end up and the box opens around them. End-aligned, the growing edge and the content's origin are *the same edge*, so every row travels the panel's whole width on the way in. Measured on a 209px panel: the body's left edge moved **21px start-aligned and 175px end-aligned**. One reads as a panel opening; the other reads as the text being dragged in sideways, because it is.

The body is now pinned to the edge the box is *not* growing from, for the whole flight. Absolute positioning rather than an auto margin, and the reason is worth keeping: an auto margin resolves to zero when the available space is negative, which is the entire flight — the box is deliberately smaller than its content the whole way, so the one mechanism that looks tidier fails in exactly the case it exists for.

**The pin shipped with a jump, and the jump was in my own probe output while I read the column next to it** (Kushagra, within the hour: *"the inside of the menu jumps after animation finishes"*). An absolutely positioned box resolves its insets against its containing block's PADDING box, so `inset: 0` lands the body inside the border and *outside* the padding — a few pixels off for the whole flight, snapping into place on the frame the panel returns to normal flow. Same shape as the checkbox target of 2026-08-06, whose inset was short by its own border: **an inset is measured from a box, and it is never the box you were picturing.** The insets read the pad the panel actually uses rather than the designed token, because menu.css widens it so a focused row's ring stays inside the pane.

The law that holds it is about the SEAM, not the padding: sample the body across the frame the flight ends and require continuity on both axes. A law naming the padding could only ever catch the spelling already fixed, where any property that differs between the flying state and the settled one produces exactly this symptom. **And the first sabotage of it passed, which was the sabotage's fault**: one token spells both the panel's padding and the insets, so zeroing "the insets" zeroed the padding too and the two agreed again. A sabotage that changes both sides of an equation tests nothing — the same vacuity the laws keep being audited for, one level up, in the tool used to check them. The block axis needs the same treatment (a `top`-side panel grows upward and would slide its rows vertically) and absolute positioning covers both. One consequence, stated in the sheet and in the law it broke: while the flight attribute is set the panel can no longer size itself from its content, so the measurement must be live — which it always is, since the same effect sets all three.

**The second is the real one, and it is recorded open rather than fixed: the collision detection is running against the animating width.** Sampling `data-align` frame by frame, an end-aligned panel reports `start` for its first several frames and flips to `end` about a third of the way in. That is not a race in our code and not a bug in Base UI — it is *correct*: a 40px seed genuinely fits to the right of the trigger, and a 209px panel genuinely does not. So the positioner answers the question honestly, twice, and the panel spends the first stretch of its entry with the wrong alignment — wrong `transform-origin`, wrong lean, wrong body pin — and then re-anchors mid-flight. **The panel's own entry animation is feeding the thing that decides where the panel goes.**

The fix that follows is a change of mechanism, so it waits for a judgment: animate a `clip-path` inset instead of the box's size. The panel would occupy its final box from frame zero — so collision is decided once, correctly, and nothing re-anchors — while the reveal still runs out of the seed corner. It also makes the body pin unnecessary, since a clip never moves the content. The cost is that it is a genuinely different thing on screen: the panel's real box (and its backdrop-filter, and its shadow) exists at full size from the first frame rather than growing into place.

---

## 2026-08-10 Hover reaches the boundary, the field's ring stays instant because the engine says so, and reduced motion turns out never to have worked

The fields' turn in the motion pass. Three things came out of it and the one that was asked for is the smallest.

**A field and a checkbox had no hover state at all, and it was structural.** Kushagra, on the playground: *"there's no hover darkening of border on text field or checkbox."* Measured before anything was written: a hovered TextField and TextArea computed **byte-identical to their resting selves** — border and fill, both appearances. The shared hover rule steps the FILL, and these are exactly the two families whose fill is deliberately held still: a field's by the invariant it has carried since 2026-08-04 (three sources, then the derived pair, so a glass field stops lightening under the pointer), a mark's because its seal barely moves inside its own box. So "states are uniform steps on the ramp" reached nothing whatsoever for two families, while §8 claimed in writing that a field's states are carried by its border and its ring.

The step is a **mix toward the family's own ink**, not a pick off a ladder, and that is the part worth recording. The two solved edges were binary-searched against APCA tiers, so they sit BETWEEN rungs by construction and "+1 step" has no meaning on them. A mix also carries the tone (a destructive field darkens its own red) and needs no second number for dark, where the ink is light and the boundary steps the way dark actually reads. One config value, v0. It writes the painted name while READING the role, because writing the role would be a cycle; it keeps the glass edge first in the chain, so a material still outranks a pointer resting on the box; and it is held to (0,2,0) so `invalid` and `disabled` still win on source order — being wrong or being dead outranks being pointed at.

**The field's ring emerged from its own edge for about an hour, and the engine refused it.** The story was right: a button's focus came to it *from* somewhere, so its ring contracts into place from outside where the eye can catch it; a field's focus is somewhere you *are*, so its ring should grow out of the box instead of flying at it — same property, opposite travel, and it needs no click-versus-Tab split precisely because an emerging ring points at nothing, which is the split text inputs can never have (`:focus-visible` matches on click for them in every browser).

Kushagra killed it on sight — *"it grows in steps, like so jaggedy"* — and he was reading the mechanism, not the taste. **Chrome resolves `outline-offset` to whole CSS pixels**, so a ring animation renders one frame per pixel of travel however long its clock is. Measured: the field's 2px of room is exactly three values (0px, 1px, 2px) across 49 frames. Three steps is a stutter. The landing survives only because it travels twice as far — 6, 5, 4, 3, 2 — enough to read as movement on the same 260ms. **So the ring's travel is bounded below by the engine at about 4px**, and a field has no room to spare: its only distance is the offset itself. The refusal is now a law that measures the pixel quantisation, so if an engine ever starts interpolating it is worth reopening.

Rejected with it, and worth staying rejected: a colour fade (the common answer — Stripe, shadcn, macOS), because a ring is a truth claim about where keystrokes land and a truth claim does not fade in, and because it mixes paint into a channel that is otherwise pure geometry; Material's thickening outline, because our border sits on the wrapper and a width change moves the value inside it by a pixel. Starting the ring *under* the border — a bigger image, more travel — is recorded unbuilt.

**Then the finding nobody was looking for.** Writing the field's arrival meant the system briefly had two animations instead of one, which meant looking at how the first was suppressed — and it was not.

`:not()` takes the specificity of its most specific *argument* rather than summing its list. So `.kui-control:focus-visible:not(input, textarea, .kui-row)` is (0,3,0), the stand-down `.kui-control:focus-visible { animation: none }` is (0,2,0), and a media query adds nothing. **The focus ring went on landing for every user who had asked their operating system for stillness**, for six days, while §8 claimed in writing that suppression is total.

Two laws had the chance to catch it and neither could. The suppression law walked `transition` declarations — this is an `animation`, because there is no previous `outline-offset` to travel from, so it was never in scope. And even for transitions the law asked only whether a selector was *present* inside the guarded block, never whether it *won*. That is the 2026-08-03 lesson in a new spelling: **the law read the text of the stand-down instead of the value it produces.** Exactly the same shape as the audit finding from 2026-08-08 — a law about one axis of a two-axis mechanism is half a law — except the missing axis here was not an axis of geometry but the second of the two ways CSS moves anything.

**The fix is structural, not arithmetic.** Which arrival a control gets is now a hook, `--kui-ct-ring`, and reduced motion stands the *hook* down rather than the rules that read it — so a recipe and its suppression share a selector, the tie goes to source order, and specificity can never separate them again. The `:not()` is `:where()`-wrapped as well, since the named-out list was always a filter and never a claim to specificity; that spelling is what set the trap.

**The harness can now enter a media query, which it never could.** `asksForStillness()` drives `Emulation.setEmulatedMedia` over CDP, so `prefers-reduced-motion: reduce` genuinely matches and the shipped block is the thing under test. Before this, the entire reduced-motion story in this repo was asserted by reading stylesheet text — every character of which was correct while the ring moved. A media query the suite cannot enter is a media query the suite cannot check.

**And one more instrument lesson, from a failure that only appeared in a full run.** The hover laws move a real pointer, and unmounting a host does not move it back — so the next file mounted at the same coordinates and got a control that was already `:hover` before it read anything. Three radio look-axis laws duly failed, reading a hovered border where they meant a resting one, and passed perfectly when run alone. **Passing alone and failing together is the signature**, and the fix belongs to the harness rather than to the laws: it parks the pointer at the far corner of the pinned viewport after any test that left something hovered. Cheap because it is guarded on an actual `:hover` rather than run for all thousand-odd tests.

Nine mounted laws, every one falsified against the pre-fix code (ten sabotage passes across the day, all caught first time — including the realistic wrong spelling of the ring, written as a `var()` *fallback*, which reads as tidier and quietly lets a hosted button inherit the wrong arrival). Two node laws widened: animations join transitions in the suppression law, and the selectors that declare an arrival must be the selectors that stand it down.

**Also corrected here: a claim that went stale the day before.** §8 still said "exactly one stylesheet moves, and a law names it — `menu.css`", written when the emergence recipe was the only judged motion and left standing when the control layer started moving. Naming sheets stopped being the mechanism then; what replaces it is that a duration cannot be *typed*, `var()` stripped first so an easing that happens to be a motion token cannot launder a hand-written `150ms`.

**Not changed, and the refusal is the rest of the fields' answer.** Nothing else on a field moves. It does not travel or scale under the finger — §8's "a field does nothing" holds, and it is now measured under a real pointer rather than asserted — and the fill stays pinned, restated twice because material's mix ramp is a second thing that can move a fill. A field is the one control the eye rests *inside*. Its states are the border and the ring: the border now steps, and the ring stays still because the engine will not let it move well over two pixels.

---

## 2026-08-09 Motion reaches the control layer, and the press keeps its 2026-08-03 finding by splitting it

Menu's exit stays open (entry below); everything else moved. Button, checkbox, radio, switch, the fields and the shared skeleton, for **+506 bytes gzipped** — the whole control layer, because the clock is stated once and each family says only how far it moves.

**The finding that zeroed motion for six days is intact, and the two clocks are what saved it.** An eased press never reaches its colour inside a ~60ms tap, so the control reads dead on a phone. The resolution is not a compromise: a press's PAINT is instant, exactly as that finding demands, and only its GEOMETRY rides a spring. `--kui-ct-paint` is one variable every control reads — hover shortens it, press sets it to zero — so a state can restate the clock without restating which properties are paint. A tap gets its colour on the first frame and its travel is a physical fact underneath.

**Three things the pass forced structurally, each caught by a law rather than by eye.**

*The switch thumb had to be drawn by both its edges.* `inset-inline-end: auto` cannot be animated to, so a thumb pinned by one edge could only ever teleport. Both ends are lengths now, and the lean it takes while held lives in those same two properties — which is principle 4 made mechanical: deformation sharing the travel's channels cannot sequence after it. `aspect-ratio: 1` came off with them: the four insets close the square by construction, and left in place it silently outranked the lean, so the grip could not stretch at all. Its own law caught that — it stretched the thumb and measured no stretch. The corner went from `50%` to a stated half-height at the same time, because 50% of a leaning (non-square) box is an ellipse.

*A mark must not state a resting transform.* `scale: 1` looks like harmless symmetry with Button's, and any non-`none` transform value makes the element a containing block AND a stacking context — so every mark became one, and a later sibling's target expander began painting over an earlier sibling's paint. That is exactly the hit-test the 12px stacking rule exists to prevent (§16), and **five laws failed at once**. Button states its identity and a mark does not; `none` interpolates as the identity anyway, so the squash still springs and the stacking context exists only while the mark is actually held.

*And the harness had to learn stillness.* The moment states became eased, six appearance laws started reading the first frame of a transition instead of the value they name — the colour a hover is leaving, not the one it is arriving at. Nothing about those laws was wrong; they were reading a moving thing at a moment they never chose. So the harness holds the page still by default and a law that is ABOUT motion calls `inMotion()`. That default immediately proved itself twice: three motion-as-content laws (Spinner, indeterminate Progress) had to announce themselves, which is the right shape — and my own new switch-shape law failed until I took `inMotion()` OFF it, because with the clock live a `getBoundingClientRect` right after a change returns the animated value, not the target. **The same instrument error, three times in one session, in both directions.**

**Judged calls worth keeping.** The ring lands only where it answers something — after a Tab the eye must FIND focus; after a click it already knows, so that would be decoration. `:focus-visible` draws the line for free everywhere except text inputs, where browsers match it on click too, so those are named out by element. Glyphs draw IN and never OUT: nobody watches a tick un-draw, and watching a deselected radio deflate puts the eye on what was just abandoned. Hover warms in 80ms and cools in 220 — arriving is something the user did, leaving is something they stopped doing.

**Fifteen sabotage passes, fourteen caught first time.** The one that got through is worth recording: the law asking whether a transition channel names a motion token passed `scale 150ms var(--motion-spring-stiff)`, because the channel does name one — its EASING. A law that checks for the presence of a token is not checking the thing the token was supposed to replace; it strips the `var()` references first now and asserts nothing time-shaped survives.

**Three same-day corrections, all from Kushagra's eye, all naming something the laws could not see.**

*The button did not rise.* I had withheld the hover LIFT on the argument that it needs the open flat/elevated shadow ruling — *"its different to the key one, key one also raises on hover."* Wrong on the facts: the lift is geometry and the cast is chrome, and only the second one is blocked. One pixel, guarded by `hover: hover`, and it brought the LIVELY spring with it — which turned out to be the more important half. Geometry now has two clocks the way paint does: a press is short and stiff (it must beat a ~60ms tap) and everything else is the object RECOVERING — rising to a pointer, settling back, a squashed mark springing out — which is long and lively. One clock for both flattens the strike and the recovery into a single gesture.

*The switch was being squashed.* — *"why does switch even have scale on press?"* The mark family's squash reached it because a switch IS a mark by family, and the reason it should not is the family's own split: a checkbox and a radio ARE their glyph's box, so a press has nowhere to go but into the box; a switch is a channel with a grip in it, and squashing the channel moves the very thing the thumb is crossing.

*And the thumb barely leaned.* — *"switch might travel but it doesnt scale the thumb like our example did, why did we spend hours refining that?"* Two faults under one symptom. The lean was 3px against a 20px grip, a seventh of it, where the judged demo stretched about 38% — invisible, and the whole reason the switch was the benchmark. And it was keyed on the THUMB's own `:active`, which matches the element being activated and its ANCESTORS but never its descendants: pressing anywhere on the track except the grip itself did nothing at all. Both fixed; the lean hangs off the root now.

**Six sabotage passes on that batch, and NONE of the four state-behaviour ones were caught the first time.** The reason is worth stating plainly: `:active` is the one interaction state a headless harness cannot genuinely produce, so every law in reach was reading a declaration — and a declaration cannot tell you a rule never matches. `:hover` CAN be produced (`userEvent.hover`), which is why the rise now has a law that moves a real pointer, and it is the law that caught the missing lift. The press states are covered structurally instead, with the limitation written down rather than papered over.

**And the instrument trap fired twice more, in both directions.** My switch-shape law failed until I took `inMotion()` OFF it — with the clock live, a `getBoundingClientRect` right after a change returns the animated value, not the target. Then the hover law failed for the mirror reason: it read the rise 0ms into a 550ms clock and saw nothing. Three times in one session, twice by the author who wrote the rule down.

**Deliberately NOT shipped:** the button's shadow crossfade. It needs the flat/elevated ruling that is still open, and unlike the lift it genuinely cannot be faked — a cast that does not exist has nothing to step.

---

## 2026-08-09 Motion ships, on Menu alone — and the exit is a dissolve, not the entry reversed

The grammar was chosen and judged in a scratch demo (entry below this one). What was still open was whether it survives the real component, where Base UI owns the popup's position and lifecycle. It does. Built as a throwaway route first — `apps/docs/app/motion-lab`, the real `<Menu>` three times over with three different exits and nothing else different — on Kushagra's own instruction: *"do it in a way where its easy to reject and experiment, like a sandbox, and when lock down how it works, we can then do it correct way."*

**The exit was the open question and it is answered: DISSOLVE.** Three were built side by side — fold back into the seed (the demo's own, which Kushagra had already called *"not right"*), mirror the entry on a compressed clock (the iOS symmetry argument), and hold the geometry, settle back a hair, dissolve. Kushagra: *"For now, dissolve, otherwise it works beautifully."* The reason it wins is worth keeping: **an entry answers "where did this come from" and an exit answers nothing.** The viewer is already looking at the thing they dismissed, so retracing the path spends 300ms narrating a fact nobody needs. The symmetry that iOS keeps is of PATH, and a dissolve does not contradict it — it declines to travel at all.

**Three shapes were rejected before the shipped one, each for a stated reason.** `interpolate-size: allow-keywords` would have animated `height: auto` with zero JS and no measurement, and it is Chromium-only — unimplemented in Safari and Firefox as of August 2026, which is the wrong half of the market for a system aiming at Apple's bar. The grid `0fr → 1fr` trick is pure CSS and works everywhere, but it forces `max-content` sizing on the rows, which is the unbounded-row defect the Select audit closed four days ago. Animating `scale` instead of the box is the rigid-body failure the whole grammar exists to avoid. So the destination is measured, in ~20 lines that run once per open — inside the sanctioned zone, because opening a panel is already script: Base UI measures the anchor and writes the position, and one more read in the same commit changes nothing about the rule that guards hover, press and focus.

**Then the origin was wrong twice, and the fix was to delete a mechanism rather than add one** (Kushagra, judged in the playground against three real menus): *"if menu opens to right, trajectory should be to go down, then right. And if left, to go down, then left. Currently it seems going direction side first, then down."*

Two faults, one visible symptom. The first is ordering: the tall channel had the longest clock on the reasoning that a panel's height has the furthest to go — true, and the wrong thing to optimise, because **the axis that finishes LAST is the one the eye reads as the direction of travel.** A slow width made every menu unfurl sideways and then drop. The vertical leads now (`fall` 320, `spread` 480), and the tokens are named for their axis rather than for an assumed order.

The second is direction, and it took two dead ends to find the answer. The seed carried a lateral offset — half a seed toward the panel's start edge — which pointed the same way whichever side the panel opened toward, so a right-aligned `⋯` menu emerged from its far corner and crossed the whole panel to get home. The obvious repair is to hold the panel's OUTER box constant (slack on the far side, so the positioner never has to re-solve its position while the box grows) and it **cannot be done**: the popup is a block child of a shrink-to-fit absolutely positioned box, so it is over-constrained and the browser drops the far margin outright — measured, a literal `margin-inline-end: 72px` computed to `0px`, and a start margin fared no better.

The no-offset spelling that followed was worse — Kushagra, on sight: *"It looks terrible now."* Correct, and the reason names the missing half: a seed with no offset sits at the panel's own destination and inflates there, which is morph-in-place, the read this grammar was chosen against. **Motion tells the truth about space, and things come from somewhere** (principle 1); a panel that never travels has stopped telling it.

**What shipped separates the two questions, which is what none of the earlier spellings did.** *Direction* is layout's, and the answer is the absence: the positioner already holds one edge of the panel at every size — the top under a menu, the start edge beside a submenu, whichever inline edge `align` names — so a panel that simply grows unfurls away from the edge nearest the thing it came out of, for free, with no offset needed. *Travel* is paint's: a `translate` carries the seed onto its trigger and closes that distance as the panel grows. A translate cannot re-size the positioner, so it cannot re-solve the panel's position, so it cannot fight the direction — which is exactly what the margin did. `data-side` and `data-align` set only the lean and the pivot; the growth direction is nobody's declaration.

**The seed wanted to be the trigger's own height and cannot be.** `--anchor-height` is exactly the right number — a menu's seed is its button, a submenu's is its row — and the positioner publishes it ASYNCHRONOUSLY, because floating-ui resolves a promise. On the frame the seed has to apply, the variable is unset; every rule reading it is invalid at computed-value time; and invalid does not mean "fall back to the cascade", it means the property takes its INITIAL value. Measured: the panel's corner collapsed to 0px. `--floating-seed` is a designed constant now, and that is the better answer anyway — a seed is not a small photograph of the trigger. At a menu's inception the shape it will take is unknown, which is the whole reason it is a circle.

**And then the entry was still visibly wrong, with every static law green — because a property can be perfectly specified and still have nowhere to go.** Kushagra, on the third look: *"it starts at a certain width, left to the trigger, then it goes down and it shrinks, and then when it reaches the correct vertical position it expands again."*

The inline channel was declared, listed in the transition, riding the spring — and `min-width: max(--floating-min-w, --anchor-width)` beat it outright. The seed frame stood the floor down; the frame after it did not, so the panel **snapped to 112px the instant the seed ended and stayed there for the whole entry**. Traced frame by frame: `w=40 → 112` in one step, then 112 for every remaining frame while only the height and the lean moved. What unfurled was a wide bar growing taller, which is precisely what it looked like. The floor means "a *settled* panel is never narrower than the trigger you pressed"; a panel mid-unfurl is deliberately narrower than everything, and is not settled — it is stood down for the whole flight now, and the flight is released on the LAST channel to land rather than the first.

**The lesson is a new shape, and it is the 2026-08-03 lesson's other half.** That one said a law must read a computed value rather than a declaration. This one says a computed value read at ONE MOMENT is still not enough for anything that moves: at the seed frame the width was 40px and correct, at rest it was 112px and correct, and the entry between them was broken. Nothing that samples a single instant can tell a channel that travelled from one that was pinned at its destination. There is now one law in the file that watches real frames — click, sample across the whole entry, and assert both axes report more than two distinct sizes with no single frame covering a fifth of the distance. It is the only law here that could have caught this, and it caught the release-timing variant too.

**Two defects found by writing the laws, both invisible to the eye and both real.**

*The measurement started the animation backwards.* Reading `offsetWidth` flushes style, which makes whatever is computed at that instant the baseline the transition machinery compares against. Removing the seed attribute to measure, then putting it back, therefore read as seed → natural (a real change: the browser began animating the panel AWAY from its seed) and then natural → seed. The panel spent its first frames travelling the wrong way. Transitions are pinned off across the whole measurement window now, so both flushes are inert.

*And it rounded.* `offsetWidth` returns an integer, so a panel that wants 115.33px got pinned to 115 — and a third of a pixel was the entire difference between "Alpha" fitting its row and wrapping to a second line, in one cell of twenty-four. Caught by the row-geometry law, which had nothing to do with motion. A measurement that feeds a length must be as precise as the length.

**The existing laws were reading the wrong moment, and that is the instrument-calibration lesson again.** A synchronous mount reads the entry's FIRST FRAME: Base UI renders `data-starting-style` in the initial commit and drops it a frame later, so every law in the file was grabbing a 40px seed with its body squished to half height. Three of them duly measured it — one asserted a row was 12px against its 24px cell and had been passing for the wrong reason the moment motion existed. The file now has its own `render` that lands the panel at the mount point, shadowing the harness's, so a new law cannot forget to; the motion laws use a separate opener that leaves the entry alone.

**One element was added to the anatomy and it is not a part.** The content has to squish while the box grows — judged twice, both directions, in the demo — and you cannot scale a box's contents without a box holding them. `.kui-floating-body` is invisible to the API, unreachable by the caller, and sanctioned the way Spinner's `<span>` is: mechanically forced, not layout convenience. It also owns the width pin, because text that re-breaks mid-flight is two animations fighting.

**Cost: +887 bytes gzipped** (21,684 → 22,571) for the whole motion system — both curves, the floating family's durations, the seed, and Menu's entry and exit. The curves are most of it; they are large strings that gzip well, and they are the thing that was judged, so the sample counts are not trimmed to save bytes. Nine sabotage passes, each one caught by the law that names it. One law was passing vacuously — its default panel happened to land on a whole pixel, so the subpixel claim was never tested — and now picks the cell where the rounding actually broke a row, with a calibration assertion that fails if that cell ever stops having a fraction to lose.

**Left open on purpose:** every other component. The grammar is settled and the tokens exist; what a switch's thumb, a button's press or a field's focus do with it are transcriptions of recipes already judged in the lab, but they are eye-pass work. Select is nearest and deliberately gets nothing today — it wears `kui-floating`, so the machinery is one line away, but a select opening is a different gesture from a menu opening and has not been judged.

---

## 2026-08-10 The brand goes grey, and four laws that proved an axis against `accent` go red

Kushagra: *"Can you set it for app?"* — accent, permanently, to grey.

**One config line, and the generator needed no exception.** `accent` is `{ hue: 250, vividness: 0.04 }` now: neutral's own recipe verbatim rather than a second near-zero number, so the identity that made `accent ≡ blue` points one family over instead of being deleted. §7's `lowChromaThreshold` already says that below 0.18 a scale cannot carry prominence by saturation and `--accent-solid` resolves to step 12 rather than step 9 — **and that rule is keyed on chroma rather than on the name "neutral" precisely so a desaturated brand is caught by it.** It was written for this case a week before the case arrived. The primary button is near-black in light and near-white in dark, which is what a grey brand means; `lowChromaStateScale` (2.1) is what keeps its three states apart, since a grey has only lightness to separate them.

What changed is that this branch is no longer hypothetical. It is now the default path for every primary button, checked mark and focus ring in the system, so the widened state deltas and the step-12 solid are exercised by the suite's ordinary cells rather than by neutral alone.

**Five laws broke, and all five broke the same way: they proved something by contrasting `accent` with `neutral`.** One config law asserted `accent.vividness > lowChromaThreshold` while claiming in its own name to key "on vividness, not on the name" — a claim it could never have tested, because a generator branch written as `tone === "neutral"` passes that assertion too. Four mounted laws asserted that a toned Button or Kbd differs from a bare one, with `accent` as the toned probe.

**The rule they earn: `accent` is a CONFIGURED identity and is never a valid probe for "these two differ".** It equalled blue by construction until today and equals neutral by construction now; a law that needs two things to be different must name a chroma family, which cannot collapse into neutral without someone editing it on purpose. The config law is rewritten to build two scales from constructed vividness values either side of the threshold, so it measures the mechanism instead of the palette; the mounted four use `blue`. This is the 2026-08-03 lesson in a new place — a law one indirection short of the thing it claims to check — except here the indirection was the palette rather than the DOM.

+58 bytes gzipped, re-recorded.

---

## 2026-08-10 The docs install Hugeicons — a decision §8 had already made, that the docs had not kept

Kushagra: *"The docs app should only use hugeicons."* Stroke 1.5.

**This closed a gap between the spec and one of its two consumers rather than deciding anything.** DECISIONS §8 has said "Hugeicons is the blessed set — installed by the app (and the docs), never by the library" since the icon box was written. apps/docs was drawing its own strokes instead, and an audit had even *defended* that in 2026-08-06's REVIEW: the "every visible pixel is @kookie-ui/react" stance survived challenge over the hand-drawn icons, on the grounds that §8 names this exact case. Both readings are right about the stance and only one is right about the set: §8 says the app installs its own set, and it also says which set.

**The stance it looked like it breached is narrower than its shorthand.** "No third-party UI" is about COMPONENTS — a design system whose docs run on someone else's buttons argues against itself. An icon is not a component here; §8 refuses to bundle one precisely so the app can choose. The hand-drawn set was the app declining to choose, which was fine at three glyphs and stopped being fine when the playground started showing real screens made of them.

**Wrappers, not re-exports.** Call sites say what a glyph MEANS (`SearchIcon`) rather than which drawing was picked (`Search01Icon`), so swapping a drawing is one edit in one file; and the props that must be right every time — `aria-hidden`, the stroke, and *not* passing `size` — are stated once. `size` is deliberately absent: the control layer sizes a slot's svg through `--kui-ct-icon`, and a `size` prop would emit width/height attributes for the CSS to beat. It does beat them, presentation attributes losing to any declaration, but relying on that is a mechanism nobody wrote down.

**And the number is not pixels.** 1.5 is user units in a 24 viewBox, so the painted stroke is 1.5 × box/24 — 1.0px at the 16px boxes sizes 1 and 2 share, 1.5px only at size 4. Measured in a mounted browser rather than asserted. `absoluteStrokeWidth` cannot fix it: it rescales against the `size` prop this file never passes, so it would silently do nothing. Recorded in §8 with the box, because "stroke width stays open" had been sitting in that paragraph since the icon box was written and is now closed in both places at once — the package's own carets and the docs' set are both 1.5, matching by construction rather than by coincidence.

---

## 2026-08-09 The playground's page becomes the seal, and a card loses its free step of separation

The system paints no page background — no `.kui-theme` rule sets one — so the page colour has always been the app's call, and the preview had quietly been giving every card one free step of contrast against its bed by painting `--neutral-1`. Kushagra asked why light mode was not simply white, then: *"I dont want preview to use neutral 1."*

It is `--color-surface` now: pure white in light, the seal's own colour in dark. Because `surfaces="flat"` is the default, a card's only separation from the page is its hairline — which is the harder bed on purpose. If a surface cannot hold itself there, the surface is what is wrong, and the judging surface should be the one that shows it.

Rejected: `--neutral-2`, a step the other way, which separates cards *more* and hides exactly the failure this page exists to catch; and painting nothing at all, which would have left a pinned-dark canvas as dark specimens floating on the site's light bed.

---

## 2026-08-09 The house style corrected: the floor rises to 16px, size 1 is retired, the eyebrow is refused

Kushagra, hours after the house style was first written: *"Still feels too small, the type I mean, even body… size 1 should be forbidden unless for specific cases like footer text… Low entropy, and I dont like entropy. Kookie UI prefers succinct, self explanatory titles, no eyebrows."*

**The argument for writing any of this down got sharper in the same message, and it belongs in the record: _"I can control spacing using density, but the type is on the consumer."_** Every distance in this system answers to an axis — `density` re-prices the layout scale, `pointer` the control ladder — so a call site that touches neither still gets coherent spacing. Type has no such axis. `size` is a free index at every call site, which means the only thing between this system and nine opinions per screen is a written rule. That is the whole justification for §15's house style existing, and it was missing from the first draft.

**Two of the seven rules were reversed the same day they were written, and both for the same reason: they came off the reference sheet rather than out of this system.** The eyebrow — a size-1 label above a big heading, naming the kind of thing that follows — is two elements doing one element's job, and it exists to let the heading be clever. A title that has to be set up was not succinct enough. With it went the sentence-with-a-period headline: "Notifications" beats "Preferences" over "Notifications." Recording the reversal rather than editing it away, because the reference set is still the right posture and a later reader needs to know exactly which parts of it were not adopted.

**The ladder is now five steps and a floor.** Page 8, section 7, card title 6, body 3, label and meta 2. Body moved 14 → 16, which is the change that made everything else legible; card titles moved 20 → 24 to hold 1.5× over the new body. **Size 1 is retired from composed surfaces**: 12px is for genuinely marginal text — a footer, a legal line, a dense reference table's own chrome — and never for "this matters less", which is what the muted and faint ink roles already say at 14 or 16. A screen reaching for 12px to make room has a spacing problem, not a type problem.

Found while applying it: a `Code` chip inside a paragraph breaks across lines like any other word, and `acme-` over `production` reads as a rendering fault rather than as a value. The name moved into the field's label, where nothing can break it. Not a component defect — a composition rule, and one the house style implies rather than states.

---

## 2026-08-09 The house style gets written down — five references, seven rules

Kushagra, with five screenshots: *"The real screens have a type hierarchy problem too. See these, I want this vibe, and lets record it somewhere."* The set: Rauno Freiberg's site, Pangram Pangram's foundry pages, and two Awwwards boards.

**Why record it at all.** "Taste is the last layer" has been this project's rule since 2026-08-04, and it was quietly being read as "taste is undefined". It is not — the references share one grammar, and two consecutive passes at the playground failed on the same points, which is what an unwritten brief produces. It is now DECISIONS §15, "Composition: the house style": seven rules, the reference set named so a later reader can look at the same thing. No law enforces it and none can; it is a brief, not a token.

**The diagnosis it produced was one number.** The card titles were size 3 over a size-2 body — 16px over 14px, a ratio of 1.14. The references run 1.5–1.8× on a card and 3–4× on a page hero. 1.14 is not a hierarchy, it is a rounding error, and no amount of weight or colour fixes a ratio. Titles went to size 5 (1.43×) and the page's own heading to 7. **This is also the second time in one day that the answer to "make this rank higher" was a bigger step rather than a heavier face** — the same sentence that removed bold, arrived at from the opposite direction.

**The device the screens were missing is the eyebrow.** Every reference puts a tiny quiet label above its big heading — "Winners", "Academy", "Update" — and it is not decoration: it names the KIND of thing, which is what frees the heading below to be a sentence ("Choose a plan.") instead of a label ("Plan"). Rejected on the way: uppercase and letterspacing on the eyebrow, which is the same idea wearing a costume — the ramp already has a bottom step and a faint ink role, and using them keeps it inside the system.

**And meta left the prose.** "Roughly 2 minutes left · started 4 minutes ago" was a caption doing the work of a table. Facts now sit in labelled rows on hairlines — label left in medium, value right — which is Awwwards' course-card arrangement and reads as structure rather than as an aside.

---

## 2026-08-09 Bold is refused: three weights, and hierarchy goes back to size and ink

Kushagra, looking at the playground: *"We don't use bold, we shouldn't, I don't like it."*

**What made it wrong was not the weight, it was the redundancy.** This system already has two designed ways to say a thing is more important than the thing beside it — the size ramp (nine steps) and the emphasis ladder resolved as ink roles (loud/muted/faint, §15). A 700 face is a third, and unlike the other two it is not on a ramp: it is a single step that lands wherever a call site puts it. On the playground it landed on every card title at once, which is how it got noticed — the heaviest thing on a page whose whole subject is restraint.

**Refused in the type, not re-defaulted.** Changing `Heading`'s default from `bold` to `semibold` would have fixed the page and left the decision holding by memory: `weight="bold"` still compiles, so the next call site re-introduces it and nothing fails. `Weight` is now three values (ENGINEERING §1.3 — types are the refusals, enforced). The token goes with it: an emitted `--font-weight-bold` that no component may name is a lever waiting to be pulled by hand, which is the fenced-resource mistake §13 exists to prevent. An app that genuinely needs 700 has `style`, and the set widens by config the day something real forces it — the tone set's own rule.

**The removal caught a law that would have failed on the fix rather than the defect.** `type.test.ts` looped a literal `["regular", "medium", "semibold", "bold"]`, so deleting the weight left the law demanding a rule for a value that no longer exists. It derives the set from `fontWeight` now, and gained the assertion the removal actually needs: no weight OUTSIDE the config's set has a rule, so re-adding a `bold` block fails. Its mounted half asserts 700 is unreachable at both ends of the ramp in both families. Both falsified — a `bold` rule re-added to the stylesheet fails the node law, and a heading defaulted back to 700 fails the browser one. −10 bytes gzipped.

---

## 2026-08-09 The playground's type ladder: a section and the cards inside it were the same size

The second taste pass on the same page, and the fault was structural rather than a value. Section headings and card titles were both `Heading size="4"` at the same weight, so the page had no step between "here is a section of the playground" and "here is a card inside it" — nesting the eye could not see. The ladder is now one step per level of nesting: page 7, section 5, card title 3, body 2, caption 1, with the showcase's cards dropped from size 4 to size 3 so the whole board sits at one padding.

The `jump to` index took the environment panel's own arrangement — a quiet size-1 label above a wrap of chips. The page already had an idiom for "a labelled group of chips", and a second unlabelled wrap of the same buttons read as stray links under the lede rather than as an index. One idiom, used twice, is the cheaper answer than a second one.

---

## 2026-08-09 The playground gets real screens, in the same page — a matrix cannot show a composition

Kushagra, on the shipped confirm card: *"its not 'extensive' enough… but also, its not tastefully done… I'm not seeing real examples, what a real consumer will use."*

**The first proposal was two routes** — `/preview` for exhaustive specimens, a new `/examples` for whole screens — and it was rejected on the spot: *"Preview without examples doesnt make sense. See the core of what kookie ui v2 is, no hollow and empty preview."* The rejection is right and worth keeping rejected: a specimen page whose examples live somewhere else is a page nobody judges taste on, because the judgement needs both in one scroll. What shipped is one page with a `Real screens` section ahead of the first component section.

**Why a matrix cannot find these faults.** The confirm card's three defects were a 14px title over a 12px body, size-1 buttons inside a size-3 card, and a full-width rule under a right-aligned pair. Every one of them is a RELATIONSHIP between two components, and a specimen table has exactly one component in the frame by construction. The tables answer "is this cell right"; nothing on the page answered "do these five things look like one designed thing", which is the question the system exists to get right.

**Two cross-family tables landed with it, out of alphabetical order on purpose.** `Sizes` puts every control at one index on one line — five ladders joined at one index (§4), and a control that drifts half a step is invisible in its own table where every neighbour drifted with it. `Tones` prints ten families across every consumer that resolves one. Both sweep an axis ACROSS components, which is the permutation no single component's section can hold.

**The law is the anti-hollow clause, and it is shaped against the cheapest way to satisfy it.** Counting `function X(` would have passed on the file's shared helpers alone, so it counts only fragments the page actually RENDERS, requires the set to reach across seven components in different families, and forbids any fragment from painting a colour of its own — a screen that reaches past the system for a value is the argument failing quietly. Falsified twice against sabotaged sources before it was trusted.

One gap is left visible rather than papered over: a nav row starts its label and a button centres it, so the shell's sidebar uses `style={{ justifyContent: "flex-start" }}`. That is not a missing button prop — it is a nav component the system does not ship yet, and the escape is left in place where it names the gap.

---

## 2026-08-09 The Select audit: a rule written for one element, applied to a different one — four times in one component

Forty-five agents over Select and everything it touches, every finding re-measured in a mounted browser and handed to a separate agent whose job was to refute it. Thirty-four raised, twenty-four survived, eighteen distinct repairs. Four of them are the SAME shape, and it is the shape the architecture sweep named: a mechanism whose argument was written for one element and then applied to another.

**The field family's pinned fill got its second member wrong, and the pin was right.** `text-field.css` pins all three fill sources and states why: *"a field's fill does not move at all: the border and the ring carry its states."* Both carriers are a text input's — the field's ring is a MODE keyed on the caret being inside, and there is no caret in a button. Measured, Select's trigger computed rest = hover = press = OPEN, byte-identical across seven properties, while Base UI was stamping `data-popup-open` and `data-pressed` on it and nothing in the package read either.

Two things were considered and rejected before the fix landed. **Refusing to move the fill at all** and signalling the open state on the border instead: rejected because no value exists for it — a new border colour is a dress decision, which is Kushagra's, and the fill already had two designed siblings going unused. **Giving the trigger the MARK family's fill triple**, which the look axis already publishes for a pressable sealed box: rejected on measurement — under `filled` a mark's resting fill is `--neutral-4` against a field's `--neutral-3`, so the trigger would have stopped matching the TextField beside it at rest, which is the one thing its whole membership is for. What shipped adds `fill-hover`/`fill-active` to the FIELD family and leaves the pin on the members that are entered rather than pressed. The values are derived, not judged: outlined reuses the surface roles verbatim, and filled walks the same +1/+2 the surface and mark families walk from their own resting step. The dark ladder ends one past the edge step, which is the posture `surface` already ships in dark — that precedent is what makes this a derivation rather than a fourth opinion. Still v0.

**One measurement changed a finding's severity and is worth keeping.** The audit reported "on a touchscreen, tapping a dropdown produces zero feedback until the panel paints." Measured, the panel opens on POINTERDOWN — visible one frame later — so the press gap does not exist, and what actually survives is that an *open* trigger looks like a closed one. The fix is the same, the reasoning is not, and a future reader should not re-derive a touch-feedback argument from a premise that was false.

**`readOnly` is refused, and this is the fourth appearance of one defect class.** HTML states `readonly` does not apply to `<select>`; there has never been a read-only dropdown, so there is no appearance to inherit. It shipped fully accepted — Base UI honoured it by refusing to open while this system drew nothing at all, hand cursor included, while assistive technology was correctly told it was read-only. Two audiences, two answers, which is worse than not having the prop. **Designing one was the alternative** (drop the seal like a read-only TextField, and drop the chevron, which promises an opening that cannot happen): rejected because the chevron-less trigger is a new visual nobody has judged, and because the platform's own answer to "submits but cannot change" is a disabled control beside a hidden input. Text field and text area fixed this same accepted-and-invisible defect; checkbox, radio and switch refuse it. Select now refuses it.

**A separator between option groups is refused, and the reason closes a door on purpose.** The panel IS the listbox, and a listbox may hold only options and groups — the menu's separator rules, correct one component over, produced markup an accessibility scan reports as a violation, from library markup a consumer cannot fix. **Radix and shadcn both keep a select separator by making it `aria-hidden`**, and that is exactly the route Separator already refused when it declined `decorative` ("a rule hiding from assistive technology is a styled Box"). Letting it back in here would have been the same rule losing an argument it already won. The GROUP is the divider a listbox has, and it divides in the accessibility tree too.

**The concentric corner was the fraction wall's eighth instance, hiding inside the fix for its seventh.** `--radius-control-N` at `full` states half the control height, and a row does not ride the height ladder — so the pane wrapped half a box its rows do not have: 18/20/24/28 declared against rows the browser can only paint at 12/14/17/19, missing in 21 of 24 cells by up to 9px, wider than the pane's whole padding. What makes this one worth the entry is that **the law agreed with the bug**, because it read the same declared numbers the CSS did. The row family gets `--radius-row-N` — the identity at every level but `full` — and the law now caps the row's corner at half its MEASURED height, which is the CSS spec's own rule rather than a re-derivation of the stylesheet's arithmetic.

**Ambient direction was measured once, and once is never.** Every library that switches language at runtime writes `document.documentElement.dir` in an effect, which runs strictly after the render that would have re-measured — so the single read in the trigger's ref callback landed before the change and never happened again. Measured, a page switched to Arabic in place opened its panel at 534–672px where the correct answer was 339–600px, and closing and reopening did not recover it. The sharp part: **the stale stamp is worse than no stamp**, because it OVERRIDES the direction portalled content would otherwise inherit — removing it from a stale panel fixed it instantly, which is what proved the stamp was the thing that was wrong. A polling interval was rejected (direction is an attribute change; the platform already has the event). The fix is both halves: an un-keyed effect for a change under a re-render, a MutationObserver on the document element for the far commoner change with no React render at all. Menu had the same defect and inherits the fix.

**And a law was thrown away by its own sabotage pass, which is the only reason it is worth anything.** "An open trigger does not look like a closed one" opened by CLICK — which leaves the pointer resting on the trigger, so `:hover` alone satisfied it and deleting the open-state rule entirely left it green. It opens from the keyboard now and asserts that nothing is hovering. Three of the four pre-existing vacuous laws were the same family of mistake the 2026-08-08 audit already named — *a law about one axis of a two-axis mechanism is half a law* — and this one was written by the author who had just finished quoting it.

---

## 2026-08-09 The menu separator stops bleeding — a rule divides rows, not the panel

Kushagra, judging the flip's output: "the separator goes end to end… it should respect the padding no?" It shipped breaking out of the panel's padding by a negative margin, argued as "a rule that stops at the panel's padding reads as a broken border."

The argument that beats it is about SCOPE: a separator divides rows, and the rows sit inside the panel's padding, so a line wider than the rows is dividing the panel — claiming an extent it does not have. It was also the single place in the system where a Separator escaped its container's inset; everywhere else it spans the content box like any other child, which is what §1's no-outer-spacing rule buys. The radius default moving to `full` the same hour is what made it visible: against capsule rows and a rounded panel corner, an edge-to-edge line reads as cut off by the container rather than as a divider between groups. Kept rejected: shadcn's `-mx-1` full bleed and iOS's — iOS full-bleeds its ROWS too, which is this same principle reaching a different answer from a different anatomy, and ours are inset.

The law was rewritten with it, and its own sabotage pass caught it being half a law twice over. Restoring the negative margin fails the new row-extent arm — but dropping the GROUP arm from the selector left it green, because with the bleed gone the only thing that arm still supplies is the vertical rhythm, and the rhythm was asserted on the loose separator alone. Both members now, both falsified. A law about one member of a two-member rule is half a law: the Progress-axis lesson, one component over.

## 2026-08-09 `full` becomes the default radius — and the flip finds the hole §6 predicted

Kushagra's call, one sentence: the theme default is `full`. The flip itself is two lines (config + Theme DEFAULTS — the two homes a law already keeps agreeing). Everything after was the system finding out which of its guarantees were quietly `medium`-shaped.

**The first casualty was §6's own 2026-08-05 bug, resurrected whole:** the capsule band and pill padding were only ever emitted into `[data-radius]` scopes, and the default level's single-attribute block is deliberately skipped — so the un-themed `:root` path rendered raw `9999px` clamping and plain padding. **Two architectures were then built, measured wrong, and torn down inside the hour** (both are worth staying dead): an inheriting pill *binding* at `:root` baked against `:root`'s raws — a probe showed `var(--control-px-pill-1)` computing to the default's number inside a compact scope, substitution-at-declaration re-proven on the author who had just cited it — and a *level-flavored family* (density blocks carrying full's values) failed the composition law in the exact direction it was written for: a nested raw `data-density` clobbered an outer `data-radius="none"`. The settled architecture is the system's own: family blocks level-blind, answers co-located per (level × density × pointer) cell plus every level block, `:root` carrying the default's baked answer, and the one unreachable-by-Theme degraded shape (split raw stamps with no radius anywhere) recorded in §6 rather than papered.

**Eleven laws were default-implicit and said so under the flip.** The size-join, card-corner, textarea-uniform-frame and icon-inset laws all asserted medium's numbers off bare mounts; each now pins its level explicitly (`radius="medium"` mounted, one comment each), because a law about a palette-legible fact should not move when the default does. One was wronger than stale: the menu 24-cell law compared row corners against `--radius-control-N`, which equals the row's own `--radius-row-N` at every level except `full` — naming the wrong token passed for exactly as long as the default made them equal, the audit's tick-law lesson reproduced in geometry. And one law is NEW because the sweep found nothing asserting the bare un-themed path at all: a bare Button must render `h/2` and pill padding, falsified against the `:root` emission removed.

**The flip's last casualty was the docs themselves, and it earned an export.** The preview's environment panel and /matrix each held their own copy of the six axis defaults, so the one surface whose job is showing what the system does kept opening at `medium` after the system moved to `full` — a literal is indistinguishable from the truth until the truth moves. The package now EXPORTS `themeDefaults` (the resolved set Theme falls back to) and both surfaces derive; a docs law reads the panel's source and fails on a restated axis, falsified. `appearance` stays a literal `"inherit"` on purpose — that is a choice the preview makes, not a default it copies.

Same session, the smaller eye-pass calls: the six control glyphs unified at stroke 1.25 (they drifted 2/2/1.5 across three files) with the two carets redrawn — straight legs, one quadratic through the apex ("too curved" killed the full-bow first draft); group labels one step under faint via the minted `--color-text-caption` role (faint is the placeholder's; a heading and an invitation are different jobs); size-2 fine rows softened 28 → 30 (`rowInset` [4,5,5,6] — "the 32 → 28 jump seems too much"). Hugeicons-as-dependency refused on the package's one-dependency stance; its weight ratio adopted instead.

## 2026-08-09 Select ships as the proof: the floating family generalises, and two promotions land on the second member

Menu's mechanisms were designed as a family's and Select is the first test of that claim — it passes almost embarrassingly: the fold, the row family (line-box height included), the concentric corner, the floating chrome, the reserved gutter and the accent tick all arrive with zero new design. What Select actually added: a field-shaped trigger (it WEARS `kui-field`, so a Select beside a TextField computes the same seal, edge, height and corner — asserted as an agreement law against a mounted TextField, not claimed), the value machinery (hidden input, `items` for the closed trigger's labels, placeholder in the faint role), and the combobox/listbox a11y contract that is the reason a styled menu cannot be a select.

Decisions worth the entry: **the §20 machinery promoted to `system/floating.tsx` on its second consumer** — a JS mechanism with laws behind it promotes at two (render.ts's own precedent), while the CSS second-member-self-keys rule stands for paint (select.css restates the panel facts self-keyed; the third floating panel promotes them). **The panel tokens renamed to the family** (`--menu-p` → `--floating-p`, `--menu-min-w` → `--floating-min-w`): a select consuming a menu-named token is the two-homes drift wearing a component's name. **`alignItemWithTrigger` pinned false** — Base UI defaults to the macOS overlap, which drags in scroll-arrow parts and a different height model; the dropdown geometry is the one already designed, and the macOS mode is recorded open WHOLE. **`items` accepted as a prop** after measurement: Base UI resolves labels from mounted options, the panel keeps itself mounted only after first open, and a closed-from-birth select displayed "b" for Beta — the map is Base UI's own documented answer, not an invention. Rejected: `SelectValue` as a part (a prop, not an element); `render` on the trigger (re-opens the a11y question a real button answers); `multiple` (a different control wearing the same name); deriving labels by walking children (RSC lazy nodes answer `type` wrong — the 2026-08-06 lesson, pre-empted this time).

Two test-instrument findings, both the settled-frame lesson's kin: Base UI ignores a pointer release inside its press-drag window (mousedown-open-drag-release is one gesture), so a click fired straight after mount selects nothing — the law waits the window out; and "the panel closed" is `checkVisibility() === false`, not removal, because a select's panel stays mounted after first open (it IS the label store). Sabotage pass: dropping PortalScope fails three laws, dropping the caret stand-down fails one, dropping `data-selected` from the shared accent rule fails two.

## 2026-08-09 The row leaves the height ladder: a row's box is its line plus one designed inset

The menu read "uncomfortably sparse" (Kushagra, in the playground) and the measurement agreed twice over: a size-2 row was a 32px button box around a 20px text line, and the empty fraction ROSE with the index (12/12/16/22px of air across sizes 1-4) — the fraction wall's shape, vertically. The diagnosis is §21's own first sentence taken one step too far: rows rode the control cells *including the height*, and a button prices its box for standalone pressing while a row sits in a list.

The research split cleanly by pointer culture. Desktop-calibrated systems compress rows below buttons — shadcn's item is `py-1.5` + line under an `h-9` button (32 vs 36), macOS runs ~24px rows under 28px buttons — and they do it by DROPPING the height, not shrinking it: the row is its line plus padding. Touch systems refuse to dip (iOS menu rows 44, Material 48 over a 40 button). Radix Themes, Fluent and Ant keep row = button and read like it.

Closed as the line-box derivation, the mark family's argument one member over: row box = `line-height + 2 × rowInset`, designed per (density × pointer) cell, pointer priced through §17's type bands which already raise the coarse line — nothing designed twice. Fine default 24/28/34/38 (the shadcn/macOS one-notch-down relationship, size 2 landing on the 28 Kushagra named); coarse default 36/40/44/48. The inset began as ONE number per cell — constant air, the ratio falling with size — and went per-size within the hour (Kushagra: size 4 read "a bit cramped, just a little"): fine default `[4,4,5,6]`, flat at the bottom and one step at the top, so the constant-air principle survives as a ceiling on growth rather than an equality. The border term is ceded in the padding so the rendered box is exact. **A correction is part of the record:** the first coarse proposal invented a 40/44 floor for rows, argued from "44 is a floor on the default path" — and Kushagra rejected it against the config itself: the height ladder's own coarse sizes run 36/44/52/60 with size 1 deliberately under the target and NOTHING widening it back (§16's no-reserve sentence). Rows get the same honesty: coarse size 2 sits a stated 4 under its button's 44, and no floor exists anywhere. Rejected along the way: a row-height ladder (four more designed numbers that must agree with type — the per-size INSET that replaced the constant is not that ladder: it prices air, and the box still derives from the line); the `--kui-ct-py` hook (unregistered, it inherits — a hosted control in a row's slot would take the row's padding, the `--kui-h` shape); and pseudo-element target expansion for coarse rows (rows stack touching, so an expander steals hits between neighbours — the checkbox's D1 defect verbatim).

## 2026-08-09 The menu's eye pass: a derived corner, a higher cast, and the tick takes the accent

Three judgments in one playground session, each against a shipped v0, and the biggest closed as a RULE rather than a number.

**The panel corner is concentric — "menu item radius + padding = container radius" (Kushagra, verbatim) — because no fixed pick can be.** The third corner in a week: the overlay band broke on sight (dialog-priced), the fixed surface-1 that replaced it was judged "perfect at large/size-3" and then caught cell by cell — medium worked at sizes 1-2 and went off at 3-4, large broke at 1, 2 and 4 — which is the two curves agreeing exactly where their sums coincided and nowhere else. The row corner moves with the size index AND the radius level; a surface pick moves with neither; so the panel now derives, and the mechanism is shaped for the family, not the component: the popup stamps `data-size` (the ship-day refusal reversed — its real target was the surface join's padding pick, which the new arms re-state), the derivation lives in surfaces.css as the FLOATING SIZE JOIN, and the panel's padding crosses through the `--kui-floating-p` hook, so Select and Popover inherit concentricity without a line. `none` is guarded to mean none — zero-radius concentric arithmetic yields "rounded by exactly the padding", a bug wearing the formula. The law reads both browser-resolved corners and asserts the SUM, in all 16 (size × level) cells, never rebuilding the calc from the tokens it suspects. Rejected: per-size arms in menu.css (per-size spellings belong to the shared layer — the switch join's rule); making the corner ride the surface band (the recorded-open one-liner — it answers size but not level, half the observed breakage).

**The floating chrome rises to row 5.** Row 4 — "one step past the surface lift" — read too low beside the panel it covers; the palette's top is the honest statement for the layer that sits above everything. The flat fade tracks by construction now in BOTH homes: the generator and the law each parse the row out of the config value instead of keeping a copy of "row 4", because the law's copy went stale the moment the value moved — the two-homes drift, caught in the act.

**Checked speaks accent through the indicator, not the row's ink.** The whole-row `--accent-label` read dark, and the WHY closed the question: accent-label is a text ink, generated between ladder steps 11 and 12 because prose owes the APCA body floor — so the one thing it cannot do is look like the accent. The tick is a glyph, owes only the 3:1 non-text floor, and now wears `--accent-solid`, the same value a checked checkbox fills with: one selected colour across the system, label neutral, indicator carrying the state — every platform's own spelling. The dead-tick stand-down survives the move (accent named directly, so the disabled remap cannot reach it; the row's `:not([data-disabled])` is what dims it). Rejected: keeping accent-label (readable, but it renders selection as emphasis); tinting tick AND label with the solid (text at step 9 fails the body floor — the exact trade accent-label exists to make).

## 2026-08-09 The Menu audit — one shape three times, and RTL was never once mentioned

Ultracode audit of the Menu slice (47 agents, eight lenses, every finding measured in a mounted browser and adversarially verified before it counted): 38 raised, 35 survived, deduping to fourteen repairs. Recorded here is what moved a decision; the repairs themselves are in DECISIONS.

**The pattern, worth naming because it recurred three times in one slice: a mechanism whose ARGUMENT was written for a top-level element, then applied to a nested one.** The width floor means "never narrower than the trigger you pressed" — and a submenu's anchor is its trigger ROW, `inline-size: 100%` of the parent panel, so the rule silently became "never narrower than the panel you came from" and compounded 446.59 → 437 → 427 down three levels. The portal wrapper re-stamps the axes a React Theme chose — and with no Theme above it, it could not tell "nobody chose an appearance" from "someone chose light", so a dark, elevated, compact document opened a white, flat, default menu: §20's own mechanism producing the exact failure §20 exists to prevent. And the stacking frame contains the z-indexes that are its DESCENDANTS — it says nothing about where it paints among its own siblings, so any positioned ancestor at `z-index: 1+` puts app content over every popup. Each was true of the top-level case and each was written as though it were unconditional. **The check that would have caught all three: for every rule, ask what its argument refers to, then ask whether the nested instance has one of those.**

**RTL, and the fact that no lens had to be clever to find it.** Zero occurrences of `rtl`, `dir` or `direction` in either portal law file; the §20 hostile axis set is six Kookie axes; the only RTL statement in the package was a comment about slot NAMES. It was broken three independent ways — the wrapper had no `dir` to re-stamp, Base UI positions from a context whose only setter (`DirectionProvider`) this repo never rendered, and the chevron was a fixed rightward path. What made the fix one mechanism rather than three: the trigger is the only node a menu owns that stands in ordinary flow, so its COMPUTED direction is the ambient direction — the same read whether the app spelled it `dir` on an ancestor or `direction` in CSS, which an attribute-only check gets wrong. **Rejected: a `dir` prop and re-exporting `DirectionProvider`.** Direction is ambient like appearance on the un-themed path; asking every Menu to be told again is the `device` prop's mistake. A deliberately LTR panel inside an RTL app arrives as a prop the day something needs one.

**The focus ring, and the defence that downgraded it.** Three verifiers independently measured the ring being clipped by the popup's scroll box — invisible at compact — and all three downgraded it to cosmetic on the same unmeasured premise: that the `data-highlighted` fill is a visible indicator. The completeness critic measured the premise. 1.16:1 in light, 1.08:1 in dark, and `contrast="high"` — the surface the 2026-08-07 rule designates as the conformance one — moved it by nothing while moving the panel border 1.98 → 4.09. **So the rule gained the clause it was missing: a keyboard highlight is a SIGNAL, not resting dress.** It is the row family's answer to the question the focus ring answers. Under high contrast a lit row now goes solid with contrast ink (20.6:1 light, 17.5:1 dark). Stepping two rungs up the quiet ladder was the first cut and was **rejected on measurement** — `soft-active` reaches 1.31 and 1.34, which is louder dress, not a signal. Standard mode is untouched, exactly as the rule says.

**Two constants that could not track what their own comments said they tracked.** `SUB_ALIGN_OFFSET = -4` carried the comment "must track `menuPadding`" — and `--menu-p` is a layout-space pick that moves with density while a JS number moves with nothing; the panel's border was never in the arithmetic at all, and the first row aligned with its trigger in NONE of the six cells. Both offsets are now one reading of the parent panel's own padding and border, taken at position time. **Read off the DOM, not re-derived from the token**, because the padding is `max(--menu-p, ring reach)` and a constant that reconstructs the author's arithmetic is the 2026-08-03 lesson one layer down.

**Five laws could not fail, and the worst of them is the one the spec names as enforcement.** The §20 agreement law reads twelve properties the token CASCADE delivers, and the wrapper re-stamps the cascade by construction — so a dropped stamp was its only reachable failure, and it was blind to every portal defect found here. It gains `direction` and an RTL arm where that fact can differ; the file header now states what an agreement law can and cannot see, and points at the named laws covering what a portal SUPPLIES rather than inherits. **An agreement law is a floor, not the enforcement.** The others: the submenu law asserted a fill `data-highlighted` also produces, so the arm it named was never reached; MenuSubContent's re-theming had no law at all; the 24-cell row law named padding in its own comment and asserted none — and when the assertion was written it read `--control-px`, which is not the token in play (a slotless side takes `--control-px-PILL`; they are equal at every radius but `full`, which is why the wrong name still passed).

**And one new law shipped vacuous, caught by its own sabotage pass.** The RTL agreement arm selected its subject as `popups[length - 2]`; the in-flow twin precedes the portal in document order, so it compared the twin against itself and survived the sabotage. Selected by anatomy now, with an explicit identity check. **An index is not an identification** — the same sentence as `within()`, arriving through a different door.

Refused, not fixed: the row family's lit identity is keyed to two Base UI Menu attributes (`data-highlighted`, `data-popup-open`), and §21 commits four members to that contract family-first. A Sidebar button or List item emits neither, so it would match the hover stand-down and no rule that lights it — the stand-down's cost with none of its benefit. Recorded as an open question rather than patched: the answer is a Kookie-owned lit attribute the row family stamps, which is a decision for the second member, not a repair for the first.

## 2026-08-09 Menu ships on the row family, and a floating pane casts in every world

The first floating component, built on §20's groundwork the same day it closed, with every design call made in `docs/menu-brief.md` (a working paper, deleted with this ship) before a line was written. Three structural things landed with it.

**The row family (§21), declared family-first.** §11 had already named menu item, command item, list item and sidebar button one family; the mark family's argument (four ladders in one weight class drift) applied before the drift instead of after it. The row rides the EXISTING control cells — zero new geometry — and its three own facts each earned their spelling the hard way in one session: the checked-accent rule lost to the quiet rung on source order until it moved after the emphasis ladder (a row STAMPS quiet, so the rung competes); its `:not([data-disabled])` had to live INSIDE the `:where()` because accent-label is not a tone role and the disabled arm's remap cannot reach it — the rule stands itself down instead; and rows answer `data-highlighted`, never raw `:hover`, with a stand-down rule inside the one hover guard, because Base UI unifies pointer and keyboard into the highlight and two cursors on one menu is the bug every hand-rolled menu ships.

**The floating chrome (§22), and the §5/§10/§11 amendment it forced:** *overlap is not expression; a floating layer always states its coverage.* A card's shadow ranks (the app's switch); a menu's shadow is information — the popup genuinely covers content — and facts don't turn off with the style switch (Kushagra: "shadow is information"). Elevated reads palette row 4; flat is the SAME row generator-faded at `floatingFlatFactor` — derived like the glass transmission, so it cannot drift — and never none. The paint re-points the surface layer's one cast site (`.kui-surface.kui-floating`, last in the sheet), so the box-shadow count law held at six, and source order makes it win against glass transmission (a glass menu in a flat world still casts — the transmitted tokens are none exactly there) and the reduced-transparency stand-down. Recorded open: whether a thin floating pane should cast a FADED floating chrome (the transmission × floating product).

**The registry learned `parts` (the one law amendment).** Twelve flat exports (a namespace export silently escapes both coverage laws — their regex never sees `export * as`) would have meant twelve entries, eleven of them stubs about parts nobody documents standalone — the exact box-ticking the anti-stub laws exist to prevent. An entry now carries `parts: [{ part, blurb }]`; the coverage law accepts either home, forbids both, floors part blurbs, and proves its own parse against Menu's ≥10 parts. The playground law needed nothing: the composed section renders all twelve tags because a real menu uses them.

The decisions from the brief, recorded: **size on the root like Button** (Kushagra, reversing the withhold proposal — a size-4 button must not open a size-2 dropdown; rows stamp the index from context, which crosses the portal); **API = shadcn/ui's dropdown-menu vocabulary with credit** (MIT; the fold Radix Themes and shadcn reached independently — Content owns Portal → Theme → Positioner → Popup); **`tone="destructive"` as a union of one**; **glass opt-in like Card**; **motion instant** (designed in its own track; Menu is its first retrofit). Refused: `Shortcut` (trailing slot + Kbd already exist), `MenuSeparator` (a re-export renaming the standalone), `Arrow`/`Backdrop`/`Viewport`/`LinkItem`/collision knobs/`modal`/`openOnHover`; `inset` answered by geometry (checkable indicators stay mounted, so the gutter reserves) with the plain-beside-checkable case recorded open.

**The corner reversed within the hour, in the playground (Kushagra, by eye).** The popup shipped on `--radius-overlay` because §11 said "floating" — and 24px is priced against a DIALOG's box, so a menu panel held a far larger fraction of it than the value was ever judged at: the fraction wall's seventh instance (**corrected 2026-08-09, audit**: this said it was the FIRST caught by eye and that instances 1-6 were all caught mechanically, which the entry one page down contradicts — the sixth, the atom corner, opens with "Kushagra, in the playground". It is the second caught by eye, and the wall has spanned both detection modes since the day before this one). `--radius-surface-1` replaced it — the smallest surface corner for the smallest surface, and the concentric answer: row corner + panel padding ≈ panel corner, which is why a highlighted row nests the shell's curve instead of leaving slivers. Judged perfect at large/size-3. Rejected along the way: keeping overlay and shrinking it (a dialog still wants ~24 — one band cannot price two scales, which is §6's own band argument); a menu-private raw radius (a palette pick exists that reads right, and a raw value would be the first corner outside the bands). Recorded open: the panel corner is size-blind while row corners grow with `size` — if a size-4 menu reads square-shelled, the panel corner rides the size index through the surface band.

**And the row weight reversed the same evening, the same shape as the corner:** rows shipped medium because the control skeleton says a control label is medium — a Button decision reaching a LIST through the shared class, the TextField value's bug one family over. Rows now state regular in the family block (content dress; every platform menu agrees), and a mounted law holds the pair apart — row regular, the Button beside it medium — so neither can quietly absorb the other.

Two of this ship's laws were wrong before they were right, both the same shape: the test file's own `openMenu` read the FIRST `.kui-menu-popup` in the document while mounts accumulate per test, so four laws compared stale popups — including one that compared a popup against itself; and the submenu law then read the LAST popup, which by then was the child panel. A helper that finds "the subject" is itself an instrument, and it was calibrated against a known answer both times before its output counted.

## 2026-08-09 Portals close: content re-themes through context, and the outermost theme becomes the stacking frame

The groundwork for every floating component (Menu first), closed by measurement rather than argument. The failure was demonstrated before the mechanism existed: a card portalled to `document.body` inside a dark/compact/elevated Theme rendered as a correct-looking light-mode card — white fill, wrong corner, wrong padding, no shadow — because every token keys on attributes the portal landed outside of. And the stacking half was demonstrated the same way: a `z-index: 50` header inside the theme painted over the body-level portal.

**Portalled content re-themes** by wrapping in a bare `<Theme>`: React context crosses portals, CSS attributes do not, so the wrapper re-resolves and re-stamps every axis where the portal lands. Measured byte-identical to an in-flow twin under the hostile axis set, under `contrast="high"`, and under `appearance="inherit"` with the html-stamped dark apps/docs actually uses. Radix Themes ships the same shape in production — the cross-browser evidence a Chromium-pinned suite cannot supply itself.

**The frame** is `isolation: isolate` on the DOM-outermost `.kui-theme` (`:not(.kui-theme *)` — the fact is CSS-expressible, so no React sentinel). App z-indexes resolve inside the app; portals, later siblings, paint above by DOM order; nobody memorises a number. Measured free: zero new composited layers, no style/layout delta on an 8,000-element page, fixed positioning untrapped (the CSSWG resolution removing container-type's containing block has shipped in all engines), glass byte-identical — with `opacity: .99` as the sabotage control that proved the blur instrument could see damage.

The laws came falsified: deleting the frame rule re-demonstrates the covered-portal bug (2 laws fail), un-wrapping the portal re-demonstrates the white-card bug (2 laws fail), respelling isolation as opacity fails the node spelling law, and a build assertion pins the rule's survival through Lightning's minifier, which no browser law covers (they read committed CSS). One constraint from the adversarial review stands as a dev warning + JSDoc: **the root Theme must never render onto `<body>`** — portals would land inside it and the frame inverts silently; a sentinel would fail identically, so this is portalling's own constraint, not the selector's.

Rejected: **the z-index ladder** (MUI 1000–1500, Mantine 100–400, shadcn `z-50` — memorised numbers, breakable top rung, and shadcn only needs one because it takes Radix's primitives without Radix Themes' frame); **portalling into the Theme element** (re-inherits the clipping problem portals exist to escape — a Theme on a scrolling sidebar clips its own menus); **Radix's `position: relative; z-index: 0` spelling** (same stacking effect, plus an unwanted positioning anchor); **a React is-root context sentinel** (adds a field for a fact CSS can state). Recorded as a tie, not solved: third-party 999999 widgets beat every approach equally.

## 2026-08-09 Motion's grammar is chosen: physics, not clips — judged on a switch and a button

The motion system's deferral (§8, 2026-08-02) ends its *direction* question, judged side by side on a throwaway page (plain HTML in a scratchpad, iOS proportions, none of our tokens — deliberately not the package) holding one switch and one button built both ways. Kushagra's verdict on the switch: "no competition." No code ships; §8's zeroed-transition law stands until the system is designed against these principles.

**The distinction that settled it: the web animates with clips, Apple animates with physics.** A clip has a duration and a curve — time is the input, and the animation is a performance that plays. A spring is attached to the *object*: position, velocity, target — state changes move the target and the spring chases it, so interruption is not a feature but what falls out when nothing is ever "playing." Motion.dev has springs, but its culture attaches them to animations (mount, stagger, reveal — motion about *appearing*); the primitive is the same, the grammar is the direction Kushagra could feel and not name. GSAP is the clip grammar perfected — its core object is literally a timeline — and free now, and still wrong for us, besides being a runtime dependency against the no-JS-at-interaction law.

**The mechanism costs zero runtime: real spring curves baked into CSS `linear()`.** Curves are generated from a damped spring model (a node one-liner; the demo's three: settle ~500ms/6.8% overshoot, ~650ms/16%, stiff ~140ms) — the same shape as the colour generator: designed physics in config, emitted as values. The honest limit is recorded with it: CSS retargets a transition from the current *position* but not the current *velocity*. The spring curves start steep, so a reversal still reads alive (ease-in-out starts slow, which is exactly why interrupting the web default feels mushy). Carrying true velocity — a thrown sheet — needs ~50 lines of JS spring math, owed only by gestures, decided the day a draggable component exists.

**The principles the demo earned, in the order they were learned:**

1. **Motion tells the truth about space.** Things come from somewhere: a menu grows from its trigger, a sheet from its edge. Motion describes real travel; travel carries information.
2. **Motion follows travel.** The switch is the benchmark *because* its thumb goes somewhere — its motion carries state. A control that travels nowhere earns almost nothing (the bouncy scale-from-center button — "Pop" — was rejected as a performance in a spring costume: travel in no direction, at nobody).
3. **Never animate toward the finger; press is never eased.** Down is the user's act. The demo's best button sinks on a stiff ~140ms spring that is 80% deep by 60ms — it beats a real tap, so it never reads as eased; colour stays instant. This *refines* §8's press-stays-instant law rather than reversing it: the law's history (the 120ms ease that never arrived on a real phone) was always about easing, and its true statement is "instant signal, stiff-spring travel." Only the return — the object's act — is expressive.
4. **Deformation leans toward the destination, and stretch shares the travel's own properties.** The switch thumb is drawn by its two edges and only the edges animate: pressed, the far edge leans toward where the thumb is going (never both sides — the first cut stretched by `scale` from a flipping origin and read as collapse-then-move); released, un-stretch and travel are the same two properties moving, so they cannot sequence. iOS's own trick.
5. **Two clocks: colour is signal, geometry is physics.** The track's colour settles faster (~180ms ease-out) than the thumb arrives (~500ms spring, visually settled ~250ms). One clock for everything is the clip tell.
6. **An object exists all the time, not just during the click.** The button only reached the switch's league when it was given mass at every moment: hover lifts it 1px (life before touch — iPadOS's pointer idea), press sinks and squashes it, release pops past rest and settles. A held control is *held* — a real place, not a paused frame.
7. **Leaving is faster than arriving, and exits don't bounce.** Demoed on the menu: enter timing lives on the open state's transition, exit timing on the closed state's, so the asymmetry is structural — CSS itself enforces it.
8. **Motion that IS content stays its own category** — Spinner and indeterminate Progress already answer it (slowed, never stopped) and are untouched by any of this.
9. **Damping is one value everywhere; travel is the only amplitude dial.** Learned by falsification: short-travel controls looked dead, so their curves got looser (~27% overshoot) — and read as *mechanical*, "just spring." The tell is ringing: those curves cross rest two or three visible times; the switch's curve (the one that read as "no competition") crosses ONCE, blooms, and comes home on a long soft tail, second ripple under 1%. Fluidity is that shape. When an overshoot is invisible, the fix is more travel or a channel that can show one pass — never less damping.
10. **Fluidity is parts arriving at different times; one transform is a rigid body, however good its spring.** The switch's fluidity was located, not designed: its thumb is drawn by two edges animating different distances, so it deforms through flight. The menu only stopped reading as "a big block moving" when it got the same thing deliberately — width committing early, height blooming, position descending, three springs out of phase, every point tracing a curve.
11. **Nothing appears; things become — the judged menu IS the button, changed shape.** iOS 26's morph ("the button morphs into the overlay, visual continuity throughout"; menus get it automatically), made web-honest and reached through three failed spellings in one afternoon: (a) an unfurl scaling near the trigger — a second object, however good its springs; (b) the first morph, which grew out of the button and then *travelled down to where a dropdown would sit* — two ideas fighting: the button's spot IS the menu's spot, the top edge never moves; (c) the fixed morph gone rigid inside — the container folded while the text stood still behind a moving window. The keeper ("I think its perfect", Kushagra): closed, the panel sits exactly on the trigger's capsule geometry, not yet matter (no fill, no blur, no shadow); open, that same rect grows down and out on springs — width committing early, height blooming — while the glass **materializes** (blur and fill condensing: becoming solid, not becoming visible) and the CONTENTS deform with the body, the sheet un-squishing on the same spring the height rides. The trigger hands its body over and takes it back; exit condenses into the button, faster, no bounce. Two collateral findings: the open height is MEASURED from content, never authored (a hard-coded 358px produced a menu with a void on a rendering with different metrics — the guessed number is the clip grammar's spelling in layout); and the rows only sat right at **concentric radius** (item corner 18 = menu corner 26 − padding 8) — §6's open-list rule, deferred to v1+1, making its first appearance as a necessity rather than a taste multiplier.

12. **Depth is contact; paint is state.** Researched for the toggle button (HIG: a button-toggle shows its state "typically by changing the background"; iOS 26: a selected toolbar toggle becomes the tinted glass while the press stays the same transient dip): no platform expresses a persistent state as a held depression. A toggle presses like any key and returns to the SAME rest as its siblings, rising already wearing its ON fill — travel carries the finger, fill carries the state, and a control that stored state in its travel would sit off its siblings' baseline and have nowhere left to go when actually pressed. The rule immediately caught its own violation in the demo: the menu trigger had been given a held-sunken state while its menu was open (built before the rule existed) — reverted to engagement as paint at normal depth, which is also macOS's own spelling (the open menu's title is a highlight, not a depression). The checkbox already obeyed this (tick = fill, never depression); the toggle made it a law.

13. **Velocity handoff is real, small, and only gestures need it — the recorded ~50-line JS exception was built and judged on a draggable sheet ("the boss").** The spring's state is position + velocity, and a target change resets NEITHER — that one sentence is the entire mechanism: flick the sheet and it leaves at your speed, hesitate and it springs home, grab it mid-flight and it is simply in your hand again at its current position, because there was never a clip to interrupt. Decision on release: a fling past ~900px/s wins regardless of position; below that, the halfway line decides. The CSS `linear()` grammar keeps everything else — this JS exists only where a finger's momentum must survive the release, and semi-implicit Euler at display rate is all of it. Two calibration scars from the same hour: an injected "launch velocity" beneath the spring's own natural peak is arithmetic theater (measure the natural peak before calling anything a launch), and the first launch used exactly that.
14. **A presented object arrives with velocity and no bounce; only the user's own momentum may make something bounce.** Apple's sheet recipe, researched then reproduced: presentation is damping 1 with initial velocity injected — it launches hard and decelerates clean — while the drag-release keeps the softer spring because the finger's momentum earned it. This is press-stays-instant one level up: the system's motion is disciplined, the user's motion is honored.
15. **Overdrag deforms from the planted anchor; it never displaces.** Pulling the open sheet past its rest STRETCHES it from its bottom edge (asymptotic rubber band — resistance grows toward a ceiling, never linear) — and because the anchored edge never moves, revealing ground behind it is structurally impossible rather than hidden by margin. Corollary kept anyway: an object that springs owns bleed beyond its rest pose in every direction its spring can carry it (iOS's under-the-home-indicator trick). And the world is coupled to the same value: the page recedes into a dark well on the SAME progress the finger drives — drag and depth follows frame by frame, overdrag presses the world slightly deeper, a flick lets it swell back at the throw's speed. One force, every layer feeling it.
16. **The traveling highlight (segmented control, tabs) is the switch's edge trick between siblings, and one pair of edges yields all four behaviors.** The indicator is drawn by its left/right edges; DIRECTION decides which edge leads (the leading edge on a faster spring, so it stretches toward its destination and gathers on arrival — deformation-in-flight without a second mechanism); pressing an unselected destination LEANS the indicator toward it before release commits, and the lean flows into the travel because they are the same two properties (the switch's own guarantee); boundaries are safe by construction, since a lean always points inward at a target and targets only exist inside the container; the selected segment is GRABBABLE and snaps to the nearest home from wherever it is dropped; and keyboard selection JUMPS — keys are not travel, and gliding across intermediate stops is false motion.

**Open, explicitly: the dropdown's EXIT is still not right (Kushagra, 2026-08-09, after the teleport fix).** The entry (emergence from the seed) is judged wonderful; the exit — one-clock condense back into the seed on the stiff spring — is better than the slam but not correct yet. The question underneath is enter/exit symmetry: iOS keeps the PATH symmetric (same bodies, same route) but not the CLOCK (dismissals shorter, no bounce, glass clears faster than it forms); a true time-mirror of the entry is built easily if the eye wants to compare. Revisit before the recipe transcribes into Menu.

**Open, explicitly: how motion's shadow half meets `surfaces="flat" | "elevated"`.** The demo button's press compresses its shadow (nearer the surface, casts less) and hover grows it — which reads as the life of the thing. Whether a flat world's press may gain a cast, or whether motion only modulates the chrome a world already declares, is §5's question and Kushagra's call; the discussion is live.

Rejected: GSAP (clip grammar perfected, runtime dependency); motion.dev's grammar (springs attached to performances, not objects — the tool is fine, the culture leans away from Apple); an interim duration/easing token palette (tokens the timeline, not the physics — the token set, when it comes, is spring parameters per weight class); scale-from-center press feedback on buttons (travel in no direction); animating the press with an ordinary ease (re-litigating the 2026-08-03 phone finding — dead on a real tap); low-damping curves as the fix for invisible bounce (they ring — principle 9 is the correction, learned the same afternoon); the menu as a uniform scale from its own corner (a photograph enlarging — principle 10's negative); the morph-then-travel spelling (the panel became the button's body and then moved to a dropdown's position — principle 11's (b), the one reversal of the day that was reversed BACK once anchored in place); materialization grafted onto the solid unfurl (parts arriving on separate clocks of *existence* read as staged assembly — out-of-phase is for geometry; in the final morph the condensing is the body itself forming, which is a different thing); a hard-coded open height (the void bug — a popup measures its content); a held-sunken menu trigger (state stored in the travel channel — principle 12's violation, caught same-day); linear overdrag resistance (tracks the finger forever and eventually shows ground; the rubber band is asymptotic); overdrag as displacement (lifting the whole sheet — deformation from the planted anchor replaced it, principle 15); a launch velocity below the spring's natural peak (changed nothing while looking principled — principle 13's calibration scar).

Kushagra, on the playground's invalid columns: a checked invalid mark rendered a confident accent tick inside a destructive border, and it read wrong. It WAS the system's own unfinished argument — 2026-08-04 made the focus ring destructive on invalid because "two chromatic signals arguing on one control" outweighed peer consistency, and the fill was the one property that sentence never reached.

The ecosystem was checked before the shape was chosen, sources read rather than remembered: Material 3 paints the checked error box in the full error solid (Flutter's own M3 defaults: `selected + error → colors.error`, glyph `onError`) and Spectrum does the same through its negative-900 box paint; Chakra keeps the accent fill inside a red border (where we were); Apple, Radix and Ant never paint the control at all. Material's answer was rejected as a shout — and Kushagra's design instinct named the alternative directly: **if the error takes the fill, it takes it the way disabled does** — the SOFT wash. So the arm sends a checked mark's fill to destructive's soft trio, the glyph to the family's designed label-on-soft pairing, and stands the solid's light catch down (a gradient over a wash is fog — the medium button's sentence). Checked only: a resting invalid mark keeps its seal and edge, because an empty box has nothing to re-fill.

Precedence carries the design: `:where()` on the checked pair keeps the arm at (0,2,0) so state outranks dress, and it sits BEFORE the disabled arm in source, losing that tie on purpose — dead outranks wrong. One shared arm covers checkbox, radio and the switch track; the whole family's suites passed without an edit, and the new laws were falsified by deleting the arm (with a vacuity guard: the sound solid must still catch light in the elevated world, or the stand-down assertion asserts nothing).

## 2026-08-08 The atom corner is em — the fraction wall's sixth instance, caught by inheritance

Kushagra, in the playground: every sized component's corner scales with it, and the atoms' did not — Code and Kbd wore `--radius-control-1` at every step, so a size-9 chip carried size 1's 4px. The shape of the mistake is the one DECISIONS §6 keeps naming: a corner riding a band priced for a box the component does not have. The checkbox did it with the control band (a fraction of a HEIGHT ladder a mark is not on), Progress nearly did it with the rail ladder, and here it arrived by inheritance again — take the control band's smallest pick because it looked right at the default size.

The fix is the atoms' own band with the atoms' own unit: `--radius-atom`, one designed em per radius level, because the atom family had already made the em argument twice (the padding, the cap's floor) — the box is a property of the glyphs, so the corner is too. Emitted as raw em TEXT, which is the load-bearing detail: a raw length substitutes at USE and resolves against each consuming atom's own font, so one declaration prices every step of the ramp and both scales correctly by construction — no per-size cells, no second ladder. The axis still reaches it (`none` squares a chip, levels order, `full` near-pills a one-line chip), density never does, and Kbd agrees with Code as a ratio of their own fonts rather than in px, which is the em doing its job.

Rejected: per-size atom radius cells (nine values per level for one em relationship); keeping the control pick and capping it (the mark family already proved the cap cannot see the axis that moves the fraction); and `--radius-mark-N` (the mark band is px picks for fixed boxes — an atom's box follows a 12–56px type ramp).

## 2026-08-08 The cap gets a face and a lift — two same-day reversals, both judged on sight

Follow-up to the family move below, both Kushagra's calls from the playground.

**The face.** At bare line-height the cap read cramped — a keycap has a face, not just a line. Real block padding and `vertical-align: middle` give it one, and the trade is priced rather than dodged: a cap this tall cannot also fit inside every line box, so a line holding a cap may grow by a bounded sliver (law-held at ≤3px, split symmetrically by `middle`; GitHub's caps make the same trade). The earlier law said "never spreads" and had already forced the cap down to line-height 1 — that law was holding the wrong thing, rhythm over the object, and the judgment reversed the priority. A floor law lands with it so a future tuning cannot crush the face back.

**The lift.** "No shadow" was the day-one refusal — the classic tiny-inset-shadow case, §5's most tempting spot — and it reversed on sight for the grips' own reason: a key cap is a PICTURE of a raised physical object, so depth here is role semantics, not the app's elevation dial. It reads `--control-chrome`'s VALUE (never the world switch — flat and elevated render the identical cast, law-asserted as an equality), and the row's inset light catch turns out to be exactly a keycap's top face. Sixth box-shadow consumer; the count law moved and names it. What stays refused is the cast moving with `Theme surfaces` — the registry entry now says precisely that.

## 2026-08-08 Kbd leaves the mono slot — a key cap names a key, it does not quote code

Kushagra, judging the caps in the playground against Radix's: the ⌘ read too small, and the cause was the family, not the discount. A monospace cell draws every glyph inside one fixed advance, so symbol glyphs like ⌘ are drawn compact to fit — the discount shrank an already-compact drawing. Radix's cap turned out to be SANS (`--default-font-family` at 0.75em in a padded cap, read from their stylesheet), and the platform agrees: macOS menus set shortcuts in SF Pro. So the cap wears the body family, and "Kbd is Code plus an edge" — one day old — narrows to the fill, the tone indirection and the join membership; the family and the box are the cap's own.

With the family move came the cap geometry and its own factor. `kbdScale` (v0: 0.9 as shipped — first cut 0.85, raised the same day, deeper than the chip's 0.925 — small glyphs in a roomy cap are what make a key read as a KEY; the two factors are law-asserted apart so a config edit collapsing them is caught). `inline-block` + `min-inline-size: 1.6em` + centered text, so a one-glyph K stands near-square instead of shrink-wrapping into a sliver; `white-space: nowrap` because a key never wraps, which also retires `box-decoration-break` (no second fragment to lose). And a snug own line-height, because the inherited one is the step's raw px box and a cap that stacks padding on it spreads its own paragraph — found by the law measuring line heights with and without a cap at the small steps, which caught two padding values before one fit.

Rejected: keeping mono and raising only Kbd's scale (the ⌘ stays proportionally compact at any size — the drawing is the problem); a designed px cap ladder (nine values for one em relationship, the fraction wall again).

## 2026-08-09 The audit's second pass — the leads that survived, and the one the numbers hand back

Round one verified 8 of 30 findings; the other 22 went unverified under a cap. This is what happened when they were checked properly, each in an isolated worktree so the sabotage could not disturb a concurrent session. Twelve confirmed, five refuted, and six had already been closed by the round-one commit.

**The one that renders wrong: "dead outranks wrong" held for the fill only.** The invalid arm declares `--kui-ct-label-color` as the destructive FAMILY token; the shared disabled arm rewrites tone ROLES and therefore could not reach it. Measured: a dead invalid tick rendered the same full-strength red as the LIVE one — 3.8x the contrast of a plain dead tick in light, and louder than a live SOUND tick (Lc 82.5 against 68.3). The rule exactly inverted, in the one state that means "you cannot touch this". The arm now stands the glyph down as `--tone-contrast`, the role, so the shared remap reaches it and one change to the disabled palette still moves everything.

**Three mechanisms had no law, and each was proved by sabotage.** Kbd's corner: replacing `var(--radius-atom)` with a literal `0.35em` — which equals `medium`, so the ratio-against-Code law still agreed — left the whole suite green while the radius axis reached nothing, i.e. a silent FIFTH exception to §6's kill switch, which says there is no fifth without the paragraph growing a sentence. The invalid wash's reach to Radio and Switch: narrowing the shared `.kui-mark` selector to `.kui-checkbox` left every suite green, so the family's promotion was asserted by one member only. And the playground: the invalid-CHECKED state shipped the day it was "judged in the playground" while every Invalid cell in all three mark matrices was UNCHECKED — the one case the arm does not touch. All three now have laws; the playground's is DERIVED rather than listed (it reads `recipes.css`, and only demands the specimens while the rule is actually there), which is the shape that survives the design changing.

**Refuted, and worth staying refuted:** `--kui-ct-cast` does not leak out of Kbd (the inheritance channel is real, but every consumer re-declares it before painting); a multi-word cap does not overflow a narrow column; and a missing `--radius-atom` would not ship a square cap silently — three other laws fail first.

**Left open, because the numbers hand back a design question rather than a fix.** The wash reaches the switch TRACK, which has no glyph to carry the signal — and there the state delta collapses from 2.981:1 (light) / 4.239:1 (dark) to **1.038:1 / 1.129:1, APCA Lc 0.0 in both appearances**: a hue rotation at constant luminance, which is verbatim the failure this log recorded on 2026-08-04 for the invalid BORDER, one property over. In dark the grip still carries it at 14.5:1; in light nothing on an invalid switch reaches 3:1 for on-versus-off. The design's second half — the glyph carries the meaning — is what makes the checkbox and radio fine and the switch not. Recorded here rather than fixed: the two permitted options (scope the wash to the glyph-bearing members, restoring the switch's status quo and letting its destructive EDGE signal at 3.97:1/9.43:1; or give the track `--destructive-solid`, which is Material's shout this system already rejected) are Kushagra's call, not an audit's.

**Also closed:** two LOG headings my own edits had eaten, orphaning both entries' bodies; the shadow consumer count, which said *two* in §5's law sentence while the law asserted six (the third drift of that number, and the second in that section); the `--kui-ty-scale` comment, which still described one "mono discount" for two atoms with different reasons; and three comments still teaching blanket containment as current. DECISIONS §15's letter-spacing sentence was corrected rather than implemented: it claimed the tracking follows the discounted glyphs "by construction", which is true for a stated size and false for the inherited one (the chip wears the parent's px tracking over ~8% smaller glyphs) — re-tracking every inline literal is a visible change, so it is named as open for the eye pass instead.

## 2026-08-08 The mono atoms take a discount — same line, smaller glyphs

Kushagra, judging Code and Kbd: mono reads bigger at the same font-size (wider advance, taller x-height), and the line-height half already felt right — so the correction lands on the glyph size alone. `monoScale` (v0: 0.925, between GitHub's 85% and Radix's 0.9em, judged in the playground) multiplies into the atoms' font-size in both size arms; line-height keeps the step's line box, letter-spacing keeps the step's em and follows the glyphs by construction.

The mechanism is one indirection in the type join rather than a second ramp: every size arm's font-size becomes `calc(token * --kui-ty-scale)`, registered non-inheriting at 1 — the identity for every member, and the mono atoms stand it down to `var(--mono-scale)`. Non-inheriting is the point, applied before it bit rather than after (the `--kui-h` lesson): a Text nested inside a Code takes its full step. The inherited-size arm is the same factor spelled `em`, which reads the parent's size — exactly what an unset size means.

Rejected: `font-size-adjust` (normalizes x-height by specification, but the correct aspect value depends on which font the SYSTEM STACK resolved on this machine, and config cannot know that); per-step designed mono sizes (a second nine-value ramp to maintain for one optical fact); and doing nothing (the chip visibly outweighed its own sentence, which is what prompted the call).

One law fix rode along: the harness's `tokenOn` resolves through a width probe, which rejects a unitless number as invalid and answers `0px` for a healthy token — `numberOn` (an opacity probe) joins it, found because the first spelling of the new laws asserted against a token that read as zero.

## 2026-08-08 Containment becomes opt-in — a plain Box is a plain box again

The 2026-08-05 live defect closes as a reversal of §2's blanket mark: `container-type: inline-size` leaves `.kui-box` and moves behind `.kui-box[data-container]`, stamped by a new `container` prop on Box (and through it Flex, Grid, Stack). The defect was never a bug in the mechanism — it was the mechanism's price paid in the wrong places. Inline-size containment removes a box's contents from its own width by specification (the no-loop rule container queries are built on), so every Box asked to shrink-wrap — a flex-row item being the most ordinary spelling in the library — computed to zero. The playground's own Layout section shipped broken the day it landed, which was the "decide against a real break, not on principle" condition being met.

**The insight that unlocked it: the mechanism needs ONE measurable ancestor, not a mark on every box.** A tier reads the nearest ancestor container, and Theme has been a container since 2026-08-02 — so with no nearer mark, a responsive value measures the themed area, which behaves like the window: the graceful floor, not a failure. Marking every Box bought nothing except the guarantee that the nearest ancestor was always one element away — and paid for it with the collapse everywhere.

**Rejected:**

- **Automatic marking, keyed on the Box's own responsive props.** The mark serves the box's CHILDREN, never the box itself, so its own props carry no signal about whether anything inside will measure it. There is nothing honest to automate on.
- **A hidden inner wrapper carrying the mark.** Preserves shrink-wrap on the outer element, but doubles every Box's element count for a feature most Boxes never use — §8's element discipline applied to the layout engine.
- **The blanket status quo plus documentation.** A library whose plainest composition renders invisible cannot be documented into correctness.

The ecosystem check ran before the call: no peer defaults containment onto a layout primitive. Tailwind v4 ships container queries in core and still requires the explicit `@container` class per element; shadcn's blocks mark each measuring card by hand; Mantine/Radix/Chakra mark nothing. The prop is the same shape with a type.

**The meaning shift is the real cost, named:** a responsive value used to measure its immediate parent Box; it now measures the nearest opted-in ancestor. Call sites that relied on an unmarked immediate parent being the boundary need the prop added there. Today that is nobody — the reason to decide this before the component set grows. The "wrapping re-targets" open item narrows with it: a plain wrapper is now transparent to measurement (law-pinned), and only a deliberate `container` wrapper re-targets.

**The trade does not vanish; it moves behind the prop and gets three warnings.** A container Box still cannot hug its contents — width must arrive from outside (`width`, `flexGrow`, a grid track, a stretching column; guidance in one sentence: put `container` on things layout already sizes). The prop's JSDoc states it, the registry's Box entry records it, and dev builds warn at the moment a container Box with children renders 0px wide — the only layer that fires when it actually breaks. Laws pin both directions and were falsified against the re-added blanket mark: four failed, each naming the exact regression.

## 2026-08-08 The component reference is a registry with a coverage law, not twenty pages

`/components` and `/components/[slug]` land as ONE renderer over a data file (`registry.tsx`), which is ENGINEERING §1.1 applied to the docs themselves: the system is data, code is a small interpreter. Adding a component means adding a row. Writing twenty hand-authored pages was the obvious alternative and was rejected for the reason the package rejects per-component recipes — twenty places for one claim to drift, and no way for CI to notice when one of them stops being true.

**The section that carries the argument is `refusals`, and it is the reason this route exists at all.** An API table generated from types can only show what a component HAS. It cannot distinguish "Button has no `variant` because we deleted it, and here is why the deletion is load-bearing" from "Button has no `variant` because nobody got to it" — and that distinction is most of what this system is. So every entry names what it refuses and gives the reason, and a law asserts no entry ships without at least one.

**The coverage law is the playground law's sentence one route over**, and the two are deliberately different failures: `playground.test.ts` says every export is RENDERED, this says every export is EXPLAINED. Eleven components were visible in the playground and undocumented before tonight. It also checks the other direction (no page describing something the package no longer exports) and two anti-rot clauses, because the cheapest way to satisfy a coverage law is an entry that says nothing: a blurb has to be a real sentence, and a refusal list cannot be empty. All three were falsified against a sabotaged registry.

**`tsc` caught a factual error in the prose, which is an argument for docs that compile.** The Theme entry documented an `accentColor` prop. There isn't one — accent is hue-authored in config and baked by the generator, so it is one app-wide identity rather than a per-subtree choice, and the runtime prop I had confidently written up has never existed. A markdown docs site would have shipped that sentence. This one failed the build, and the corrected entry now records the absence as a refusal with its reason.

## 2026-08-08 Blockquote: the rule is tone-less, and the SPELLING is half the decision

+27 bytes gzipped, two declarations, and one thing genuinely open when it started: does a chosen tone tint the quote's rule?

It does not. §11's rule for the type family is that tone re-scopes the ink trio — and the temptation to widen it here is real, because a red quote beside a grey bar looks half-finished at first glance. What settles it is §7's edge order: a quote's rule sits exactly where a separator's sits, under both solved tiers, carrying no identity of its own. That is what `--color-border` was minted to paint, and a law now asserts the two components resolve the same colour. A quote whose BAR carries meaning is a Callout — a tone-forward surface, already on §11's list, and the right component for the job.

**The spelling is the other half, and it is the more dangerous one.** `var(--tone-border, var(--color-border))` reads like the accommodating choice: tinted when a tone is stamped, neutral otherwise. It is not — custom properties inherit, so an unstamped quote inside any stamped ancestor would silently take that ancestor's family. Same shape as the `--kui-h` collision and the transmitted glass cast: a value arriving through the cascade from somewhere nobody was looking. Written as the flat `--color-border`, with a mounted law that nests an unstamped quote inside a `destructive` ancestor and reads the computed border — the sabotage run confirms that law is what fails when the fallback form goes back in.

Everything else came free: the ramp, the weights, the emphasis rungs, the family slot and the zeroed margin are the shared layer's, and `<blockquote>` is the element that arrives with the most UA margin in the set, so the non-negotiable finally gets tested where it actually bites. It anchors at size 3 like Text rather than inheriting its line like Code — a quote is a block, so it states its own step — and the indent is `em`, which makes the atoms' argument a family pattern rather than a one-off.

## 2026-08-08 Code and Kbd: §11's row said `medium`, and implementing it would have been a bug

The two cheapest components left, and they still forced one correction and one first. +75 bytes gzipped **for both**, because almost everything they look like was already written — the ramp, the weights, the emphasis rungs and the margin reset are the type layer's, and what these atoms add is a family slot and a fill.

**The correction.** §11's inert-atom row reads `emphasis: medium`, and `medium` there names a *fill* rung — the word belongs to the CONTROL resolution of the axis, where medium is `--tone-soft`. Implemented literally, a code chip would climb the ladder with its fill while its ink read the same axis as foreground roles: one axis, two resolutions, one element. That is precisely the incoherence §9 deleted `variant` to avoid, so the row is corrected instead of implemented. These are type, they take the type resolution (loud/medium/quiet = the three foreground roles, resting loud), and §11's "subtle fill" becomes a fixed identity — Card's sentence at atom scale. What the atoms add over Text is that the tone reaches **both** colours: a chip carrying a fill has a second thing to tint, and a law reads both, because "the ink went red and the box stayed grey" is exactly the half-fix that ships.

**`size` is optional with no default, which no other component does.** Text anchors at 3, and a Code that inherited that anchor would push a size-1 caption's inline literal to 16px — the component would just stop being used inside small text, silently. Unset means the element states no step at all and takes the line it sits in; the type join keys on the attribute's presence, so the absence is the mechanism rather than a special case.

**The first non-token length in the package: `em` padding**, and the argument is the mark family's own. A mark is one line of its label because its box is a property of the type beside it; a chip's breathing room is a property of the glyphs inside it. Both alternatives already have scars here — one designed constant is wrong at one end of a 12→56px ramp, and nine picks into a palette with nothing between 2 and 4 is the wall the mark ladder, control padding and the slider track each hit. The tokens-only law's regex catches `px` only, so nothing failed; it is written down in DECISIONS and in the stylesheet because a law's regex is not the rule.

**Kbd repeats Code's facts self-keyed**, which is the family rule and not laziness: the second member self-keys, the third promotes (the field family's own sentence, LOG 2026-08-05). Badge and Tag are next on §11's list. Its edge is `--tone-border`, not one of the solved tiers — those were solved for controls whose identity *rests* on the hairline, and a cap has a fill to carry it. No shadow, refused deliberately: a key cap is the single most tempting place to reach for the inset shadow the elevation deletion removed.

**Found on the way, and fixed: `docs:test` was a cache hit that could not fail.** `playground.test.ts` parses `packages/ui/src/index.ts` to enforce "a component ships with its playground section" — a law that reads a file OUTSIDE its own package. turbo's `test` task had no edge to the package, so it hashed `apps/docs` alone, and a full `pnpm run test` reported 43 docs tests passing while Code and Kbd had no section at all. `dependsOn: ["^test"]` folds the package's test hash into the docs', which is also the honest direction: the docs' laws are downstream of the package. Third instance of one lesson (after the scan law that ran off-viewport and the transmission law that rebuilt its own expectation): **a law that cannot fail is not a law, and "cannot run" is a way of not failing.** The rule earns a clause — a law that reads across a package boundary owes a build edge across the same boundary.

## 2026-08-08 Progress ships without a size axis — the ladder was asked first and refused

§19 predicted this component twice before it existed ("a bar is a rail with no grip"), and the prediction held for everything except the one number a bar has. Well = `--color-track`, fill = `--tone-solid` under a stamped accent identity, outside the look axis by the instrument rule, no target mechanism because nothing hits it — all four arrived by derivation, none needed a decision. What needed one was the thickness, and the answer is an absence.

**The rail's ladder was asked first, as the rule requires, and it refused.** `--slider-track-N` (4/5/6/7) is designed as ~0.25 of the fine MARK — a constant fraction of the thumb it serves. A bar has no thumb, so riding it would size the bar against a box the component does not have. That is verbatim §6's sentence about the checkbox corner, which rode `--radius-control-N` and thereby held a fraction of a height ladder a mark is not on; it is also the wall control padding hit, and the mark ladder, and the slider track itself. **Fifth instance of one mistake, and the first one caught before shipping rather than after** — reached this time by inheritance (take the neighbour's ladder) instead of by arithmetic (divide by the neighbour's box), which is why it was worth naming as its own shape.

So the shape is Separator's: one designed thickness (`--progress-track` = 6, v0), extent from the container, no index. 6 rather than the default rail's 5 because a rail carries a grip that lends it presence a bar must find in its own weight — and inside the rail ladder's range (4–7), so a bar and a rail still read as one kind of line.

**Withholding is the additive direction, and that is what made the call makeable without a taste pass.** Adding `size` later costs nothing; removing it is an API break. The counter-argument was NOT refuted, only deferred, and it is recorded open rather than buried: `--mark-N` *is* `--line-height-N`, so the rail ladder is equally "a quarter of a line of text", and a bar sits in text flow under a label where that reading is perfectly good. If the index is granted, the honest move is a rename — `--slider-track-N` → `--track-N`, one ladder with two consumers — because a shared thing wearing one consumer's name is what the `--kui-h` collision was.

**Rejected on the way:**

- **Progress as a `.kui-control`.** It is how Slider gets the ladder, and it is how Slider gets its 44px target — which is exactly why it is wrong here. The skeleton is the interactive one (a height that IS a target, a button cursor, a label's type, a border, `user-select: none`); opting in would mean overriding most of what opting in declares, and standing a 44px box on the coarse path around a 6px line. The class is its own.
- **A size join in `progress.css`.** Structurally impossible and correctly so: a walked law forbids `data-size` in any component stylesheet, and a second law pins `[data-size="N"]` to exactly one occurrence in the shared layer. The three joins that exist (`.kui-control`, `.kui-surface`, `.kui-type`) each live in a *system* layer keyed on a family class, and Progress is not a family. The architecture said no before the design did.
- **Base UI's `Progress.Track` part.** It exists to be the positioned parent of the indicator, and the root already is one. Two elements, not three — a div with no job is anatomy, and the anatomy criterion (§10) admits it only where something non-visual forces it. Same test refuses `Progress.Label` and `Progress.Value`: a label is `aria-label` or a `<Text>` with an `id`, a formatted value is a `<Text>`, and both would be layout bought as anatomy.
- **Deferring indeterminate to the motion system.** The collision was assumed and does not exist. §8's law bans a `transition` — the easing of a state CHANGE, which is what the motion system was deferred to design. A sweeping segment is motion that IS the content: the Spinner's category, already shipped, already reduced-motion-answered. So it takes the Spinner's answer too — slowed, never stopped, because a busy indicator that stops moving is information lost. Nothing here reads `--motion-duration` or `--motion-easing`; the motion system still lands on an empty field.

`tone` is left closed and recorded open: a failed upload in `destructive` is the exact vocabulary the six-tone widening exists for, and Slider's refusal does not transfer (it was priced on EMPHASIS — "a form where one slider is louder than the next names nothing" — not on hue). Adding an axis to a component whose §11 row was written the same day is assignment, not derivation.

+115 bytes gzipped for the component, the token and the laws. Twenty-six mounted laws, each falsified against a sabotaged stylesheet before it was accepted — including the two vacuity guards the Slider round taught (a radius law that would pass if `radius` did nothing, a look law that would pass if `look` did nothing).

## 2026-08-08 The melt has to survive a state, and four gaps the audit left below its cut

Follow-up to the audit above, taking the findings that sat under its verification cap.

**A dimmed channel must not become a drawn one.** The switch's off state melts its edge into
the well, and the melt sat at (0,1,0) while BOTH shared state arms outrank it — the mark
family's sends the fill to `--tone-soft`, the control layer's sends `--tone-border` to
`--neutral-6`. So a disabled off switch wore a visible hairline that the LIVE one does not
have: the only off switch in the system with a boundary, and a state that ADVANCES where
every other disabled control recedes. The fix restates the edge as the FILL it melts into
rather than as a colour, so it follows the dimmed well wherever the family arm takes it.
Why the family arm is right for the other marks and wrong here: a checkbox IS its hairline,
so greying the hairline is greying the control; a switch is a channel, and dimming a channel
must not draw it. Rejected: exempting the switch from the border remap entirely (the state
still has to say something — it says it with the fill); dimming the well and keeping the
resting `--color-track` edge (a live-coloured edge on a dead fill is the same mismatch
pointing the other way).

**And four gaps that were about coverage rather than behaviour.** The slider thumb's corner
law ran at one size in one pointer world and compared the corner to half the HEIGHT — which
the capsule it guards satisfies exactly as a circle does, so the shape reverted on 2026-08-08
had been passing it unchanged; it is spelled like Radio's and Switch's now, and DECISIONS §6's
"all four law-tested at every level in both worlds" stops being true of three. The switch's
inset had no bound at all: every law measuring the grip computed its expectation FROM the
inset, so the value was anchored to nothing and 8px would have kept them all green — two
bounds now say what the part IS (a grip fills most of its channel; travel is worth crossing)
rather than what it measures, the width's own posture since the day it shipped. Four laws in
tokens.test.ts read the raw emitted sheet, comments included, one of them an occurrence COUNT
— in the file that records "a law a comment can satisfy is not a law, and one a comment can
FAIL is not one either". And the docs app proved its two appearance implementations agree
while proving that neither reaches a page: rendered shell laws now assert the pre-paint script
lands in the head, that a route sits inside the Theme with appearance left to `<html>`, and
that a page-shaped route wears the chrome — including the 404, which is the one Next reaches
by itself and the one that broke. Both were falsified against the broken tree before being
trusted. The structural half lists `/preview` as the deliberate bare-viewport route, so the
next one is a decision rather than an omission.

The playground gained the field family's glass (a shipped axis on two components with no
specimen, on a page claiming every axis, with the hostile bed already built) and a Layout
section for Box/Flex/Grid/Stack — one section, not four, because they answer one question
between them and four stubs would each show the same grey tiles.

## 2026-08-08 The audit after Switch: the well answers high contrast, and the grips agree when dead

An ultracode audit of the Switch commit and the playground commit. Thirty raised, sixteen verified adversarially, and the shape of the package-side findings is the shape of the last three audits: **five of six were laws that could not fail.** The two design questions that came out of it are recorded here; the law fixes are in the commit and need no argument.

**A resting well owes the conformance axis an answer once a control can be made entirely of it.** `--color-track` was never re-declared in the `contrast="high"` blocks, so an off switch was byte-identical with the setting on and off in both appearances — and in light that is a ~1.2:1 track carrying a white grip on a white page, i.e. a control whose only separation from the background is a 0.1-alpha drop shadow. The slider had an argued exemption for the same role ("a well is a region the APCA-passing fill moves through"), and the audit's real finding is that the argument does not transfer rather than that it was wrong: a slider's state is carried by its fill and its thumb, both held to floors, while an OFF switch has no fill portion at all. So `trackWellStepHigh` joins the config at step 6 in both modes, and the standing rule keeps both clauses intact — taste rules the resting value in standard mode (step 4 stays), `contrast="high"` is where it must move. Rejected: solving the well to an APCA target the way `--control-edge` is solved (a hairline's one job is its own contrast; a well is a region whose neighbours already clear their own floors, so a band step states the same intent without inventing a second solver); strengthening the grip instead of the well (fixes light, does nothing in dark, and puts the fix on the part that moves).

**A grip keeps its fill when dead — the switch's argument was always about grips, not about switches.** The same-day correction that shipped with Switch (the thumb keeps `--color-thumb` under `disabled`; only the cast stands down) was written as a switch decision, and the slider thumb — being a `.kui-mark` — kept taking the family's `--tone-soft` arm. Measured: in dark the two grips that DECISIONS §5 and the switch's own law call one role landed at opposite ends of the lightness scale, the slider's sitting darker than its own rail, which is precisely the invisible handle that minting `--color-thumb` existed to prevent, returning under one state. The slider now takes the switch's answer. The reason it generalises is that the argument never mentioned switches: a grip's POSITION is the value, so greying it erases the reading rather than dimming it — the same sentence that stops the family's disabled rule erasing a checked checkbox's glyph. Rejected: greying both (reverses a judgment made in the playground a day earlier, and the dark-rail case is a real invisibility, not a taste); keeping the divergence and amending the docs (the two controls would have needed a stated reason to differ, and the audit could not construct one — "a switch's grip carries state, a slider's carries position" is a distinction without a consequence, since both are read by position).

**And the law that could not fail is now a class, not an incident.** The five: the switch's width ladder had no mounted law naming its token at all (collapsing every size onto one width kept 882/882 green); the hosted-slot law mounted the single cell where the mechanism it names is a no-op; the slider's square-grip law ran in 1 of 24 cells, so re-shipping the reverted capsule on every coarse cell passed; the token density law read the one scope the family cannot appear in; and two structural laws matched on strings that the first component to actually do the forbidden thing did not contain. The pattern is narrower than "assert computed values" — every one of them asserted a real computed value, in a cell or a spelling where the defect could not appear. The addendum: **choose the cell that can fail, and prove it by making it fail.** Each fix here was falsified against the shipped tree before it was accepted, and one law was written to count how many cells it actually exercised, because a scan that skips every cell passes.
## 2026-08-08 Separator ships as two tokens and a role — and its API questions close by inheritance

Built ahead of Progress (Kushagra's call — the cheapest component left, since §11 promised its row "a border token" and `--color-border` has existed since Checkbox minted it). The component is Base UI's `role="separator"` div wearing `--color-border` at `--border-width`; +63 bytes gzipped, seven mounted laws, and every structural law took it on arrival via the walks — which is what the walks were built to do.

Three decisions closed, none requiring new design:

**`orientation` is API here after Slider refused the same word.** The refusal criterion travels, not the refusal: Slider's vertical needs its own designed geometry set (§4's cells, thumb travel, track pricing), and a vertical hairline is the same two tokens with the axes swapped — zero designed values, so the prop costs nothing and the platform stamps `aria-orientation` for free. A refusal priced on design cost does not bind a case with no design cost.

**Radix's `decorative` is omitted.** A purely visual rule that must hide from AT is not a Separator — it is a styled Box, the escape that already exists. One component, one meaning; the prop would be a second spelling of "this is not what the component says it is."

**Extent is the container's, stated as the outer-spacing sentence applied to length.** No `size`, no length prop: horizontal fills the block that owns it, vertical stretches to the flex row (`align-self: stretch`), and `flex: none` keeps a distributing Stack from squeezing the rule toward zero. An inset separator is the parent's layout, exactly as spacing is.

The paint is deliberately the QUIET hairline, law-asserted negatively (background ≠ `--control-edge` in both appearances): the edge order (§7, 2026-08-07) pins separators with cards under both solved tiers, and this is the first component to consume that sentence as its whole identity.

## 2026-08-08 The slider thumb goes back to a circle — the capsule reverted on sight

The horizontal capsule (2026-08-07, `--slider-thumb-w-N` at 24/30/36/40) was judged in the preview beside the shipped set and reverted: too wide (Kushagra, by eye — the same eye that asked for it, one day later). The thumb is back on the family's square, both axes `mark(n)`, radius half the mark — Radio's own statement, and the platform's posture (iOS, Material and Radix all ship the handle round).

What the revert deletes is the whole designed set, not just the override: `sliderThumbW` leaves config, `--slider-thumb-w-N` leaves the emitted tokens, `--kui-ct-thumb-w` leaves the size join. The family's derivation is an identity again (`slider thumb = mark(n)`, no per-axis carve-out), which is the §4 sentence the capsule had complicated. The §6 exception count stays FOUR and the arguments stand unchanged — the shape moved and came back; the radius axis never reached it in either shape. The switch-track capsule's justifying chain ("a circle only nests in a curve") is *strengthened*, not weakened: the grip it cites is a circle again, literally.

Kept from the capsule's day, because they were never about the width: the always-on cast, `--color-thumb` ("dark shouldn't be dark"), and the rail's `min()` squaring at `none`. Rejected: keeping the ladder with narrower values (a designed set whose every entry equals the mark is the identity wearing a token's cost); a compromise width (the complaint was the axis existing, not its magnitude).

## 2026-08-08 Switch ships shifted: one width ladder, two worlds, and the well that left the look axis

The mark family's fourth member, and the first to consume the one-index shift §4 wrote the day the family was designed. Three questions were genuinely open when it started — the width, the corner, and the look-axis membership — and each closed by derivation from something already settled rather than by a new judgment call.

**The width is designed once, indexed by what the track IS.** The pre-scoping left it as "Material 1.63x, iOS 1.65x, Radix 1.75x — all fractions, so ours will be a designed number," and the trap in that sentence is the plural: a designed number per size PER POINTER WORLD is eight numbers, four of them guesses about coarse. The closure: the track is mark(n + 1), so index the width ladder by the MARK STEP the track is (steps 2-5: 34/40/44/48) and let both pointer worlds price their cells through the same band picks that already price the marks. Fine reads the ladder straight; coarse reads it one entry up because its track rose one step; the size-4 cell repeats where the band collapses, exactly as the height it belongs to does. Four designed numbers, both worlds derived, and the emitted cells hold 1.67-1.71 of their tracks in all eight — inside the peers' band without ever writing a fraction. Rejected: pointer-invariant width (the slider thumb's posture — but a switch's width IS its travel, and a coarse size-1 switch at the fine width has 10px of it, a stub); a second designed coarse ladder (two sets of taste to keep in sync, the drift §4 exists to prevent).

**The thumb's inset is the designed constant, because the identity fails.** thumb = mark(n) reads as the family's own kind of sentence (the switch's grip is the checkbox beside it), and it was refused on arithmetic: the inset it implies is (mark(n+1) − mark(n)) / 2, and the handheld band's 4/5 collapse drives that to ZERO at coarse size 4 — a thumb flush with its track. So the inset is designed (2px, all sizes, both worlds) and the diameter derives — in the stylesheet itself, from the two block insets plus aspect-ratio, so the one place the family shrinks a box under its token (the hosted floor) shrinks the thumb with it instead of overflowing.

**The capsule breaches the kill switch, and the count is now four — argued, per the rail's own lesson.** The chain: the slider thumb's capsule is settled role semantics (a square grip reads as a bead that stuck); the switch's thumb is the same grip one control over, so it holds its circle; and a circle only nests in a curve — a round thumb in a square channel reads as a bead in a rail, which is a slider. The rail's `min()` escape (audit R8's fix) was tried on paper and does not transfer: half a 20-28px track dwarfs `--radius-control-N` at the mid levels, so `min()` would flatten the capsule at `medium` while leaving it at `full` — a corner that answers the radius axis only sometimes, the worst of both. §6's "only two" sentence is restated at four with the argument attached; Radix squares its switch at `none` and it reads as a segmented control with one segment, which is the failure being refused.

**Off is a well, and the whole control leaves the look axis.** The membership question looked open (a switch is binary like the checkbox; the mark dress rule would have caught it automatically) but was already closed twice over: §11 decided the off-track wears `--color-track` the day Slider minted the role, and §19's second half says the axis dresses things whose resting state is a surface with a boundary. An off switch is not a small surface you read — it is the channel the thumb has not crossed, felt for, like the rail. So the unchecked rule stands the dress down to the well (all three interaction sources, static — a well does not step; the moving part is the state), the edge MELTS into the fill rather than leaving (a borderless off switch would be two pixels smaller than its checked self and the row would shift on every toggle), and the mounted negative law asserts byte-identity across looks with the checkbox as the tautology guard. Rejected: the dressed off state (contradicts the recorded `--color-track` decision, and a filled-look app would darken a well that is already one); keeping the mark edge on the well (Material 3's posture — but the system's own sentence is that a well is edgeless, and the rail sits beside it in every form).

**The shift lives in the shared join, because two laws own the alternatives.** Component stylesheets may not mention `data-size` (recipes.test) and each `[data-size="N"]` appears exactly once in recipes.css, so the per-size shift could be stated in neither place a first instinct reaches for. The join blocks gained the shifted entry (`--kui-ct-mark-up`, plus `--kui-ct-sw-w`) and one `.kui-control.kui-switch` rule after the join re-points the mark token — winning the tie on source order, which the comment states. `--mark-5` exists to hold the top of the shift (the line box of type step 5, the same sentence as the other four), and the coarse-rise law learned the honest exception: step 5 HOLDS under coarse instead of rising, which is the wrinkle §4 recorded the day the shift was designed, now asserted as an equality instead of skipped.

**The thumb inherits the grip's exceptions rather than re-arguing them:** `--color-thumb` fill, casts always by reading the palette VALUE, and the disabled stand-down stated on its own element because it is not a `.kui-mark` and the family's arm cannot reach it — the exact hole the 2026-08-07 audit found on the slider handle, closed here before it shipped rather than after. **The stand-down's first spelling took too much (corrected same day, judged in the playground):** it also sent the thumb's fill to the track's own remapped `--tone-soft`, and the grip vanished into its channel — "Disabled" and "On, disabled" rendered as one indistinguishable grey capsule. The thumb's position is the switch's STATE, which makes it the tick, and the family's disabled rule never erases a tick (a disabled checked checkbox keeps its glyph). So disabled stands down the CAST alone and the grip keeps `--color-thumb` — iOS's and Material's own posture — while the dimmed track and the dropped shadow are what say dead. The law asserts the grip's fill differs from its track's in both appearances. Borderless, unlike the slider's grip: a hairline the colour of whatever sits behind a MOVING part is a halo in one of its two homes; the cast is what lifts it. The box-shadow consumer count law moves 4 → 5.

Three of the new laws were falsified against sabotaged CSS before being trusted (the shift deleted, the cast re-pointed at the world switch, the capsule re-pointed at the mark band — 18 failures, then green on restore). Two law-side defects were caught by their own first runs and recorded in the file: a thumb radius of 50% computes as the percentage (the law now asserts the percentage AND the square box it is 50% of), and "the thumb's left edge crosses the midline" is geometrically impossible for a grip half the track's width — the CENTER crosses.

Budget re-recorded with the component. Still open, recorded: the width, inset and well pairing are v0 for the eye pass; a hosted switch keeps its travel but a genuinely tighter slot shortens the channel (judged acceptable, unasserted beyond the common cell).

## 2026-08-07 Two escapes that only went one way — the audit of the elevation work

The ten commits above were audited adversarially and came back with two defects of the same
shape, plus doc drift that is still open. Both fixes are recorded here because both are about
a rule this system already had and had stopped applying, not about a new value.

**The rule: every scope declares its own value, and a value that can only get louder has no
way back down.** Stated at the top of the elevated world's own block — a descendant selector
had no reset, so `flat` could not escape an elevated ancestor — and then broken by the same
block eight lines later. The lifted glint was wired as `--material-thin-rim:
var(--material-thin-rim-lifted)`: a re-declaration of the GENERATED name. `elevated` could
raise it and `flat` had nothing left to point at, since the resting value and the name that
would carry it back are the same name (and `initial` deletes the rim rather than resting it).
So a nested flat Theme kept the brighter line. It escaped review because it usually
self-corrects for an unrelated reason — a nested Theme normally stamps `data-appearance`, and
that scope re-declares the generated name at the element — leaving the hole open exactly where
appearance is INHERITED, which is how apps/docs mounts its root and therefore how every Theme
under it resolves. The rim now rides a `--kui-` pointer like every other value in those two
blocks, and the law asserts BOTH ends; it previously asserted that `flat` declared nothing,
pinning the bug as if it were the design. One thing the pointer taught: it must fall back to
the generated name at the consumption site, because the un-themed document has no
`[data-surfaces]` scope above it and a bare `<Card material>` lost its glint entirely — caught
within the hour by TextField's own law, which mounts without a Theme on purpose.

**The rule, second instance: "always" is about the world, never about state.** The thumb casts
in every context by role semantics (§6's kill switch, second named exception), and the way that
is spelled is reading the palette row's VALUE rather than the world switch — which is correct,
and which also walked it out of the shared disabled arm, since that arm stands the world switch
down. A dead handle kept its full shadow and its white top line: the one control in the system
that stayed lifted while disabled, sitting beside a disabled Button that had correctly gone
flat. The stand-down is stated on the mark FAMILY rather than on the thumb, so the switch
inherits it the day it ships, and at (0,2,0) so it beats the thumb's own declaration.

Both laws were falsified against the pre-fix code before being accepted — five cells, all
failing, all for the reason claimed.

The audit's three remaining defects closed the same night, and the first two are one rule
again — **the fallback chain is the mechanism, so every arm of it has to be reachable.**

**A pane's cast leaked into everything inside it.** The glass rules re-pointed
`--kui-surface-chrome` — the name the WORLD declares on the Theme element and every surface
reads by INHERITANCE. That inheritance is the delivery mechanism, not an accident, so writing
the faded row onto it handed that row to the whole subtree: a plain opaque card inside a glass
card cast a third of its shadow in light, and in dark also lost the rim-light, because the
transmitted row carries no inset. Worth recording what does NOT work, because it is the
obvious move: registering `--kui-surface-chrome` as non-inheriting kills elevation outright —
the world's value would never reach a card at all. The fix is a second name that does not
inherit (`--kui-sf-cast`), holding the pane's own value and consulted FIRST, which is exactly
the shape the control layer had already arrived at the day before (`--kui-ct-cast-glass`). The
surface layer had the same problem and never got the same answer. Reduced transparency's
stand-down moved with it, and that line is now load-bearing rather than decorative: it used to
spell `--kui-surface-chrome: inherit`, which reads the PARENT ELEMENT rather than the world —
harmless while transparency-reduction was global, and wrong the moment the pane's cast lived
in its own name.

**A disabled glass control still floated**, 12 of 16 cells. The disabled arm stood down
`--kui-control-chrome`, which is the SECOND item in the chain; a glass control resolves through
`--kui-ct-cast-glass` first, and that reads three per-thickness names the arm never touched. So
a dead glass button computed a shadow byte-identical to its live self, next to a dead solid one
that had correctly gone flat. The stand-down names the three world rows rather than the glass
value, and that is a specificity fact rather than a preference: two of the arm's three
selectors outrank the glass rules, but the `:has()` arm — the one that answers a field whose
own input is disabled, which is precisely the TextField case — ties at (0,2,0) and loses on
source order.

**And the transmission law could not fail.** It rebuilt its expected value with `fadeShadow`'s
own `.replace(/\/ ([0-9.]+)\)/g, …)`, character for character, which asks whether the generator
ran the function and never whether the function does anything. Demonstrated rather than
argued: respelling one palette row as `rgba(0, 0, 0, 0.1)` — valid CSS, not matched by that
pattern — makes the generator return the row unfaded, and the old law passes, because it
computes the same unfaded string. The law now parses alphas independently (handling the comma
and percentage forms the generator does not), and asserts three things the copy could not: the
derived row is not the row it came from, every alpha is the source times the factor, and the
ladder is ordered thin < regular < thick < solid. Its tolerance is one unit in the last emitted
decimal, stated with its reason — `0.11 x 0.35` lands on 0.0384999… in binary, so a half-step
window fails on float representation rather than on anything real.

Ten new mounted laws, every one falsified first: nine against the unfixed stylesheets, and the
sealed-pane law against a build with the fix applied but the reduced-transparency arm left
alone. One law was thrown away in the process for being unfalsifiable — a sealed pane nested in
a glass pane, which cannot exist, because transparency-reduction seals both.

Still open in DECISIONS' list: the stale prose the renumber left behind — the tuning comments
that still name row 2 for cards, the two field stylesheets that still state as a decision that
a field never casts, and the "exactly one box-shadow" line above a system with four.

---

## 2026-08-07 The pane parts reach the field family — the card's material fix, one layer down

Kushagra: *"The text field and text area's material representation is bad. We fixed this
with card, but seems like text field and area was left behind."* True on all three parts:
a glass field wore an opaque tone border on a pane of light — the exact sticker the
2026-08-05 card fix named — no rim, and cast the full control row as if solid.

What landed, all through the material's existing vocabulary:

- **Edge:** the glass field wears `--material-<t>-edge`, routed through ONE private name
  (`--kui-ct-glass-edge`) slotted into the field's border chain OUTSIDE the material
  section — which keeps the material rules free of tone names (the material-names-no-colour
  law caught the first spelling) — and lets the invalid and disabled arms stand it down
  with one line each: state outranks glass, mounted.
- **Rim:** the top light catch, painted from the border box so it slides UNDER the edge
  (the two-stacked-lines dead end, avoided this time on the first try), lifted under an
  elevated sun by the world's existing remap.
- **Transmission:** glass CONTROLS cast the control row faded per thickness
  (`--control-chrome-<t>`, derived from row 2 exactly as the pane's rows derive from row
  3). Routed through `--kui-ct-cast-glass`, an intermediate only casting rungs consume —
  the first spelling re-pointed `--kui-ct-cast` directly and would have given a QUIET
  glass button a shadow (caught by refutation before tests) — and registered
  `inherits: false`, so a loud button hosted in a glass field's slot does not cast as if
  it were itself glass. Sealed fallback and reduced transparency stand the glass value
  down: a sealed pane is not glass.

Buttons deliberately get no glass edge — borderless by rank, their glass needs none. The
material occurrence law learned the fourth legitimate site (3 environments + the field
family's pane parts) and re-pinned at seven.

---

## 2026-08-07 Fields rejoin elevation at control scale — the third flip, and why it is not a waffle

Kushagra: *"I would argue that text field + area also need the same shadow elevation button
got."* This re-opens a twice-decided question, so the record has to say why the third
answer differs from both earlier ones rather than merely overruling them. 2026-08-04
lifted fields WITH THE CARDS — surface-scale depth, the sentence "it lifts with the cards"
asserted, not judged. 2026-08-06 reversed it on the well argument: elevation separates a
plane from what is behind it, and a field is content of a plane. Both rounds were arguing
about SURFACE elevation, because that was the only elevation that existed. The four-worlds
frame minted control-scale light, and under it a field is a raised CONTROL: it casts the
button's row 2 through the same world token — never the card's row 3, which is what the
2026-08-06 rejection was actually rejecting. shadcn and Stripe ship exactly this posture
(a small input shadow beside the same button shadow). Flat worlds, panes (one lift),
and the disabled arm all stand it down through the existing plumbing; no catch, because a
field has no solid fill to light. The negative laws reversed to positive ones; the
box-shadow consumer count re-pins at four.

---

## 2026-08-07 The thumb leaves the family's square: a horizontal capsule

Kushagra: the thumb should stretch — and the first cut read the direction BACKWARDS,
shipping a narrow vertical bar for minutes before the correction: *"I meant to stretch it
horizontally... it should be wider than it is taller."* Recorded with the mistake because
the ambiguity was real ("longer vertically" parsed both ways) and the next reader should
know which way it resolved. The grip's fourth departure from the family on the same
argument as the other three (dress, look, world switch): a grip is shaped by what it does.
Its BLOCK size stays the mark ladder — one weight class beside a checkbox, the coarse rise
still arriving through the family's own story — and the inline axis WIDENS to
`--slider-thumb-w-N`: 24/30/36/40 raw designed px (the fourth family to hit the
no-palette-rung wall), pointer-invariant because the block axis carries the coarse answer.
The capsule radius is h/2 — the short axis, the circle's own number — and stays role
semantics: the radius axis never reaches it, `none` included. Base UI measures the
element's real width for edge alignment, so positioning needed nothing; the preview's
static mock reads the width token.

---

## 2026-08-07 The thumb casts always and goes light in the dark — the grip's two identities

Kushagra, closing the thumb's deferral: *"Slider thumb needs elevation always, its how it
should be, and dark shouldn't be dark."* Two decisions, both identity rather than dress.

**The always-on cast is the kill switch's second named exception, beside the circle.** The
elevated axis says flat worlds declare none, and the thumb breaches that on the same
argument the radio's circle breaches `radius="none"`: role semantics outrank theme
uniformity. A grip that does not sit above its rail stops reading as a grip, and every
platform ships the handle shadowed in every context — iOS's thumb casts inside every app
identity Apple has. Mechanically the breach IS the spelling: the thumb reads the palette
row's VALUE (`--control-chrome`) instead of the world switch (`--kui-control-chrome`), so
the flat world's `none` and the pane's one-lift stand-down simply never reach it. The
box-shadow consumer-count law re-pins at three with the reason in its comment. No catch —
a gradient on a near-white circle is invisible.

**The fill left the seal: `--color-thumb`, the value-control family's third role.** Pinning
the thumb to the seal made dark's handle seal-dark on a dark rail — nearly invisible, the
exact failure the peer platforms avoid by keeping the handle LIGHT in dark (iOS ships it
white). Light keeps the seal; dark takes `--neutral-12`. A role, not a family name at the
consumption site, for the track well's own reason: the element stamps `accent`, so a
neutral value can only arrive through the role layer. Routed through `--kui-ct-fill-src`
so the disabled remap keeps winning — and the fill-triple law made the rule declare all
three states identical, which is the honest spelling of "a handle does not fill, it moves."

Unwound implicitly: the dark-rail contortions that existed to keep the rail off the
thumb's colour stop being load-bearing (a near-white handle collides with nothing), though
the rail's current steps stay until the eye pass says otherwise. Still open, unchanged:
the thumb ignores `invalid` and `disabled` ring colours (the cascade problem LOG already
records), and the slider remains deaf to `contrast="high"` on the outlined default path.

---

## 2026-08-07 Elevation reaches the material: a pane transmits the shadow it is given and catches the light above it

Kushagra, after the button light landed: *"What about material? How does elevated affect
material? It has to be deeper than what it is."* He was right that it was shallow: an
elevated glass card wore the identical row 3 an opaque card wears, and the material's rim
never changed between worlds — the glass was a painted effect, not a substance light
responds to. The liquid-glass observation from the four-worlds day, applied: what makes
blur read as material is exactly this response.

Two seams, both config, both through the elevated scope so flat is untouched by construction:

- **Transmission (the cast).** Glass passes light, so a pane's shadow is the surface row
  FADED per thickness — `transmission: thin 0.35 / regular 0.55 / thick 0.75` (v0), the
  generator deriving each faded row from the palette row by scaling its alphas. Derived,
  never authored: a hand-written glass shadow would be the second source of shadow truth
  the button-shadow refutation killed, and the law re-derives every faded row to hold it.
  The re-point rides the element (`--kui-surface-chrome: var(--kui-surface-chrome-<t>)`,
  world-declared, none in flat), and both re-seal paths — no backdrop-filter support, and
  reduced transparency — take the world's full chrome back with explicit `inherit`: a
  sealed pane is not glass and stops transmitting.
- **The lifted rim (the catch).** Under a sun the pane's edge catches harder: `rimLifted`
  per thickness and mode, remapped in the elevated scope (`-rim` → `-rim-lifted`, mode-blind
  block, pigment in the appearance scopes — the look axis's rule). `contrast="high"` empties
  the lifted variant beside the resting one, or the remap would resurrect the glint the
  setting had just removed.

A stale claim died on the way: the config comment still said separation "composes
var(--shadow-2) on its own authority, so glass floats even in a flat world" — the weld
DECISIONS records as reversed 2026-08-05. The comment now states the reversal.

Two defects the preview caught the same hour, both fixed as rules rather than values:

- **The rim was two lines pretending to be one border.** Backgrounds originate at the
  padding box, so the rim's 1px line sat just BELOW the translucent edge — the "paints
  inside the border strip — two lines" dead end §5's chrome notes already record, rebuilt
  in the material. `background-origin: border-box` slides the rim under the edge; they
  composite into one brighter line.
- **One lift per pane.** Buttons on dark glass cast "an extremely dark shadow": dark's
  alphas assume a dark page that swallows them, and a pane swallows nothing — the bright
  backdrop shows through and the cast lands on it like ink. A material surface stands the
  control cast down for its subtree (inherited, no selector reaching into the control
  layer); the pane is the raised thing, its contents sit flush, the catch stays. iOS's own
  posture for controls on glass.

---

## 2026-08-07 The palette gains the control row and one anatomy; the elevated world lights its buttons

The four-worlds frame's first build, and its shape was corrected twice by Kushagra before a
line was written — both corrections recorded because each killed a design that was locally
reasonable and wrong.

**First correction: the world token was named into the wrong namespace.** The plan proposed
`--kui-ct-chrome` — the control layer's private registered stems, where `inherits: false`
registration can silently kill inheritance: the documented `--kui-h` trap, nearly
re-committed by the author who documented it. This is the incident that minted the
refute-before-presenting working rule (CLAUDE.md). The token is `--kui-control-chrome`,
sibling of `--kui-surface-chrome`, world namespace.

**Second correction, his refutation verbatim: "Designing new shadow for buttons creates
exception in the world... why not have more shadow tokens?"** The plan had the button's cast
as a bespoke value living only inside the chrome role — which is TWO sources of shadow
truth, and a shadow escapes and blocks could never reach. Row 1 being the inset well made
the original "compose row 1" idea wrong on sight (it would press the button INTO the page),
and the fix is the palette growing, not a side-channel: **five rows, ordered by height** —
1 the well, 2 the new control drop, 3-5 the old 2-4 renumbered while nothing is published.

**The redesign: one anatomy, five heights.** Every drop row is a CONTACT line (small
offset, near-zero blur — what reads sharp) plus an AMBIENT halo (negative spread — what
reads raised), x always 0, ambient offset strictly growing with the row; a law asserts the
anatomy per row per mode, so "simplify to one blur" fails before it ships. Dark keeps the
geometry and raises alpha. v0, judged in the preview.

**The button lights up, and the wiring is the rung's.** `surfaces="elevated"` now declares
`--control-chrome` (cast: `var(--shadow-2)`, dark prepends the rim-light — the surface
chrome's sentence one scale down) and `--control-light` (catch + seat: two gradient layers
painted over whatever fill the rung chose, tone-independent by construction, NOT a shadow —
flat declares `none`, the material rim's reasoning). The rung-once law rejected a
selector-level join (`.kui-button[data-emphasis=...]` would have been a second mention of
the rung), which forced the better shape: loud and medium map `--kui-ct-cast`/`--kui-ct-light`
to the world tokens INSIDE the emphasis ladder, quiet maps `none` — declared, not omitted,
so a quiet button inside a louder surface cannot inherit an ancestor's cast. The 2026-08-06
"a button stays flat" negative law is DELIBERATELY REVERSED: its replacement asserts the
elevated loud button's computed shadow equals row 2 exactly, the catch is a gradient, flat
is byte-identical to today, quiet unlit, one light across all tones, disabled standing both
down. Material stands the catch down and keeps the cast (a gradient on a veil repaints the
material's own face; depth is the app's, even for a pane).

Deferred, stated: the slider thumb joins when the mark family's light is designed; the
tone-tinted cast under a loud button (systematic versions exist — shadow colour mixed from
the fill — but they break "no button owns a shadow" uniformity; decide after the neutral
version is judged).

---

## 2026-08-07 The four worlds: the identity axes get their meanings, and taste gets its frame

Kushagra opened it from the elevated dark preview — the filled card's top rim-light reading
as diffused lighting — with reference screenshots spanning a glowing split-button, soft
white buttons with gradient depth, and dark buttons whose fills carry a lighting narrative.
The ask was explicitly NOT "add these": it was that `outlined`, `filled`, `flat` and
`elevated` cannot stay visual recipes — "we need to start from what outline or filled even
mean" — and that flat's sharpening, done while staying honest about Lc, is where Kookie
separates from peers.

The frame that held (now in §19): `look` answers *what the interface is made of* — drawn
(regions declared by line; print, blueprint) versus molded (regions declared by material; a
field is a pressed well, a card a slab) — and `surfaces` answers *does light exist* — flat
is a diagram, elevated has one sun above, casting down and catching on top. Four worlds,
each with a stated physics, and every taste value judged against its own world's statement
rather than against the other worlds. The liquid-glass lesson as read here: a look is a
physics applied without exception, not an effect; the role machinery was already the
mechanical half, and the statements are the design half it was missing.

Decisions taken with the frame:

- **The elevated taste pass grows the CATCH half of light** — rim, fill light, seat — as
  paint only (`background-image`, the shadow list): no filters, no extra elements, no JS.
  The dark rim-light was the catch's first resident; casting without catching is half a
  light source.
- **Sharp is not dark** — flat's modernisation is line consistency (weight, rhythm, corner
  precision), with the per-run Lc report as the conscience. This is the stated
  differentiator versus peers.
- **States stay one vocabulary across all four worlds** — the deep version (drawn states
  speak in line, molded states in material) is recorded and REFUSED for now; any future
  bend is per-channel expression of the same fixed signal, never a different signal.
- **The outer glow is declined as overreach** (the "New" button reference): a resting
  control never radiates; hero moments are the app's `--shadow-*` escape.

Where the work starts, in order: the elevated world's light (dark-first, where the catch
reads best — new dress roles in the elevated scope, the material rim's mechanism, flat
pinned byte-identical by negative law), then flat's line pass, with the eye-pass list
reorganised per world so each value cites the physics it answers.

---

## 2026-08-07 Dark's control edges rest softer than light's — the split's first taste edit, and the direction becomes a law

The morning's solve held one Lc target across both modes, and the peer comparison said that
is not how a border feels: at the same Lc 46, the ring measures 2.4:1 on white and 6.4:1 on
the dark page — the WCAG 2 meter's dark-bed inflation agreeing with the eye that a mid-grey
line GLOWS in a dark UI. Every peer ships dark borders fainter than light ones (Radix and
shadcn near 1.2–1.5:1 against our 4.3–6.4), and the original complaint that started the
control-edge work — "what I would expect when high contrast is on" — was a dark-mode
complaint. So `controlEdgeLc`'s normal targets split per mode, dark under light. The first
pair (mark 38, field 24 — one notch down) was judged in the preview and still read heavy;
Kushagra moved both to the tier below: **mark 46 light / 30 dark, field 31 light / 15
dark**, rendering dark `#95999c → #75787b` and `#777b7e → #525557` — each dark family now
resting one full APCA tier under its light self (fine detail → large, large →
discernibility). Light is untouched; `high` stays mode-invariant, because conformance does
not dim with the lights, and the anchor law now steps `high` above BOTH modes' resting
values.

This is exactly the edit the mode split exists to permit — a taste value moved by eye with
the report watching — so the entry is here for the one durable part: the DIRECTION is now a
law (dark < light per family), while the values stay free. A future "simplify: one target"
cleanup has to argue with the glow, not just flatten a table.

Even at the softened pair, dark sits above the peers (4.1:1 ring, 2.4:1 field on the WCAG
meter, where Radix and shadcn ship ~1.2–1.5:1) — the report keeps both meters in every run.

---

## 2026-08-07 The contrast rule splits by mode: taste rules standard, APCA rules high contrast — borders and fills only

The rule, verbatim from Kushagra: "APCA rule checks for high contrast mode, taste over APCA
rules in standard." Scope confirmed as **borders and fills**; text pairings, the focus ring
and the invalid edge stay floor-checked in standard mode — signals, not dress, and a signal
that only works under an opt-in setting is not a signal.

Two unresolved tensions from the previous day forced it, and it dissolves both:

- **The two rulers split on one hex.** The solved light control edge (`#a3a6aa`) clears its
  APCA target of 46 while measuring 2.44:1 in WCAG 2 terms — under the normative 3:1 that the
  step-pick it replaced cleared at 3.17. The divergence is largest exactly where we work
  (light greys on white); a value cannot be optimised to two disagreeing meters, and the day
  had already spent hours discovering that each fix by one meter reopened the other.
- **Filled's borders were picked steps beside outlined's solved ones** ("WHY THE FUCK ARENT
  THEY APCA") — an inconsistency with no principle to arbitrate it as long as "standard mode
  owes APCA" was the claim, because filled's whole point is to identify by fill, and holding
  its border to a border-contrast floor un-makes the look.

The resolution is not "solve more"; it is naming where each authority governs. Standard mode
is DRESS: the resting border and fill values — solved edges and picked dress steps alike —
are taste, judged in the preview, held to no floor, and the eye pass may move any of them.
`contrast="high"` is CONFORMANCE: its solved edge targets are the ones law-anchored to
`apcaFloors`, and the look-border stand-down already routes filled through those same edges,
so both looks conform under the setting built for exactly this. The anchor law moved
accordingly (the normal targets' floor assertions deleted; the high targets now pinned ≥ the
fine-detail floor and strictly above their own resting values, so the setting always does
something). The normal-mode emitted-hex law survives as a drift check — the generator must
render the stated number — explicitly relabeled as not-a-floor.

**The rule grew its second clause the same day (Kushagra: "we still decide them based on
contrast, we still run checks, but not to validate, but to catch how off we are — it's
always good to know").** Taste is still contrast-informed — the numbers are how the values
are reasoned about; what changed is only what a bad number DOES. So the suite gained a
report: every run prints where each resting border and fill sits against its advisory tier,
on both meters (APCA Lc and the WCAG 2 ratio, because they disagree exactly where this
palette works), asserting only that the measurement happened. A slide toward invisible shows
up in the test output the day it ships, instead of surfacing as a preview argument later.
The report writes to stdout directly — the runner drops intercepted console output for
passing tests, and a report that only prints on failure never prints.

Rejected: solving filled's dress edges to a faint APCA target (the previous evening's open
proposal — it would have made filled "consistent" by extending APCA's authority into exactly
the territory taste was about to reclaim); re-solving the standard edges to WCAG 2 ratios or
to max(APCA, 3:1) (same move, other meter); and pulling the focus ring or invalid edge into
the split (they carry state, not identity — WCAG 2.4.11/1.4.11 bind the default for those,
and their existing standard-mode laws are untouched).

---

## 2026-08-07 Filled's wells stay soft, and high contrast is the accommodation — argued to rest with measurements on both sides

The control-edge day ended on filled. The wells measure single-digit Lc against their beds
(the APCA implementation clamps under-10 to 0.00, which briefly overstated this as "zero" —
method note from the audit, relearned). Against APCA's advisory discernibility tier of 15
that is a real shortfall, and I proposed solving the fills up to it. Kushagra pushed back
three times, and each push held:

- *"In what world is this low contrast"* — with preview screenshots. Both true: a large soft
  well is plainly visible to typical vision on a bright screen, AND marginal for the low-vision
  users the tier protects. The tiers are calibrated for the margins, not the median eye.
- *"That 30 applies to hairline"* — the tier split held for borders (45 fine detail / 30 large)
  but the FILL owes at most the discernibility tier, because the fill does not carry meaning:
  the label, placeholder and caret identify the field. WCAG 1.4.11 does not bind it.
- *"Isn't this what high contrast is for?"* — rejected for the outlined border (the normative
  rule binds the default), accepted here (advisory tier, identity carried elsewhere) — WITH the
  requirement that the setting actually deliver. Measured: it does, already. The morning's
  look-border stand-down makes contrast="high" drop filled's soft dress edge and resolve the
  solved control/field edges at their HC tier — light field border #e0e1e2 → #a3a6aa, dark
  checkbox #46484a → #b0b3b5 — law-tested in the mounted HC suite before this entry was
  written. Nothing needed building; the mechanism composed.

The position, stated once: **outlined conforms at rest through its boundary (normative, solved
45/30); filled reads as filled at rest, is identified by its content, and conforms under
contrast="high", which restores strong boundaries.** The soft filled fill is a decision, not a
finding; the audits that keep rediscovering it should land here.

---

## 2026-08-07 The control edge: solved, shared, and the reading of the guidance that reshaped it

Started as taste — Kushagra: *"the mark control's border in outline mode is a little too dark.
It is what I would expect to be when high contrast is on."* Measured, he was right twice over.
The dark ring sat at `#bcbec0`, Lc 66.5 against a floor of 45, because the pick-the-first-
passing-rung rule met a ladder that folds back between steps 9 and 11: step 9 misses the floor
by 2.9, and the next rung over the fold overshoots it by 21. And the surrounding borders it was
judged against sit at 1.35:1 (light) and ~1.5:1 (dark) — under the 3:1 the floor encodes — so
the one conforming boundary in the library read as an outlier: shadcn's checkbox measures
1.24:1, which is the norm this was being compared to.

**The argument that settled scope was his:** matching the ring down to the field breaks the
checkbox (D2's whole point); accepting filled as soft while holding outlined to the floor is
incoherent ("if we accept filled as soft, outline has no reason to comply"); so *read the
guidance again*. APCA's non-text tiers answered it: **Lc 45 is for fine detail — hairlines;
Lc 30 is for large solid shapes; 15 is bare discernibility.** A hairline and a fill are
different classes with different floors. So outlined (identity = a 1px line) owes 45, filled
(identity = a solid well) owes 30 — filled keeps its idea AND a conformance path, and the
"one floor for everything" I had been arguing was simply wrong. Filled's fills are still short
of their 30 and stay open; today shipped the outlined half.

**Amended the same day, in the preview: the field family sits one tier DOWN.** The first cut
put fields on the mark's 45 — "one boundary, they match" — and Kushagra rejected it on sight:
*"Text Field + Area being much larger than checkbox, they appear very dark. I think we should
stick to 30 floor for field and areas."* The guidance supports it: 45 is the fine-detail tier,
and 30 is the tier for LARGE elements — at equal colour, the long border of a large box reads
far heavier than a small ring. So `--field-edge` is the same solve at `controlEdgeLc.field`
(31; high 46 — a field under contrast="high" wears what a mark wears at rest, one ladder
offset by size class). Light `#c0c2c5`, dark `#777b7e`. The consistency law became an ORDER
law: ring strongest, field one tier down, card under both, three distinct — a collapse in
either direction fails. `apcaFloors` gained `nonTextLarge: 30` and the config law pins each
family's target to its own floor.

**What shipped.** `--control-edge` supersedes `--mark-edge`: SOLVED, not picked — binary
search on the neutral recipe's lightness for the value that just clears `controlEdgeLc.normal`
(46, the floor plus rounding margin) against both the seal and the page. Light `#a3a6aa`
(46.3), dark `#95999c` (46.1) — the dark ring calms from a third-of-the-way-to-white to just
past the floor, which was the original complaint. Consumers: the mark family as before, and
now the FIELD family under outlined (`.kui-field, .kui-textarea` re-point `--tone-border`,
the mark family's own pattern, so the state remaps keep winning) — an outlined field's fill
is the seal it sits on, so its border is all that identifies it: D2's criterion applied
honestly, and the consistency he asked for. Field, area, checkbox and radio now resolve ONE
boundary, law-tested component-against-component with the card as the negative control.
Cards and separators keep the quiet hairline.

**Generated colours are not a new pattern** (his check before agreeing): every step in the
palette is already solved output, and `--accent-label` is already generated between rungs 11
and 12 for exactly this no-rung-where-needed reason. And the solve composes with the tone
axis: it searches lightness, which is what APCA measures, so run on the accent recipe it
yields an accent-tinted boundary at the same guarantee — that is how an accent variant would
land if ever wanted.

**The laws grew both directions.** The old floor law could not fail upward — any
sufficiently dark grey passed — which is exactly how the overshoot shipped. The new one holds
floor AND ceiling (target + 4 Lc of two-bed slack), reads the EMITTED hex so the solve is in
the loop, and a config law pins the target itself to `apcaFloors.nonText` + 2, because the
ceiling law reads the target and would follow a drifted one — mutation-tested at target 66,
caught. `contrast="high"` re-solves at 60: designed, where before dark moved by band accident
and light never moved (R9's half-truth made whole). Hosted-control note, stated not hidden: a
control in a field's slot inherits the field's `--tone-border` and wears the boundary too.

Rejected: matching the ring down to the quiet border (breaks D2 in dark, ~0 Lc); one floor
for hairlines and fills (contradicts the guidance's own tiers); accepting the overshoot as
"floor-bound" (it was rung-bound, not floor-bound).

---

## 2026-08-07 The slider leaves the look axis entirely — and the membership test grows its second half

Kushagra, from the regenerated preview: *"Slider has basically no reason to subscribe to look
axis, like button has no role. We'll see this repeat with progress."* Plus the observation that
finally made the shape visible: *"in light mode, the rail looks fine, but in dark, the filled
mode has a weird rail. Its basically invisible."*

He was right about the rail, and it was my doing: pinning the thumb to the seal a few hours
earlier forced dark's filled rail down to the page step to avoid becoming the thumb's own
colour, and a rail at `--neutral-1` inside a filled card at `--neutral-3` is very nearly
nothing. That was the third symptom in a row from one wrong premise, so the premise went.

**Three passes, all arguing about the parts, none about the thing.** The rail was excluded at
first on "an edgeless well has no border-versus-fill trade to make" — a statement about the
part, which stopped being true the moment `filled` stopped being a trade, so the rail was let
IN. It was then DRAWN as an outline — `outlined` applied to a path by analogy with surfaces —
and read as a bead resting on nothing. The thumb then left on its own merits, and the rail
followed it into the corner described above. Each fix was locally reasonable and the direction
was wrong every time.

**The rule that survives is about what a slider IS.** The axis dresses things whose resting
state is a *surface with a boundary* — a card, a field, a checkbox — because for those, "how
does this app draw a resting surface" is a question with an answer. A slider has no resting
surface. It is a rail, a fill and a grip: an instrument, every part shaped by what it does
rather than by the app's identity. Button belongs to no dressed family on exactly this
argument, which is the connection Kushagra drew, and Progress will land here too — a bar is a
rail with no grip.

**So the membership test grows a second half.** §19 said "membership IS role consumption": a
family is dressed because its sheet consumes the roles, and only for that reason. That is the
MECHANICAL half and it is still true — it is what makes membership checkable. What was missing
is the DESIGN half: a family should consume them only if its resting state is a surface. The
mechanical half alone is what let a slider into the axis twice, because "this part could read a
role" is always true of any part that paints.

The law asserts all five painted parts together — rail, rail edge, fill, thumb, thumb edge —
across both looks, with a checkbox in the same app as the negative control so it cannot pass in
a world where `look` has stopped working altogether. Together rather than one each, because a
component leaves an axis completely or it does not leave it, and a law checking only the rail
would have missed the thumb, which was dressed until the previous commit. Mutation-tested by
pointing the rail back at a look role: five laws fail.

Unchanged by any of this, and now the slider's only open defect: the thumb ignores `invalid`
and `disabled`.

---

## 2026-08-07 The thumb leaves the look axis — the mark family shares its box, not its dress

Kushagra, after the drawn-rail revert: *"I further think the handle / thumb also shouldn't
subscribe to look axis."* The mark family had answered the axis once for all three members,
which read as the promotion paying off — one rule instead of three, and a law pinning checkbox,
radio and thumb to the same computed pair in both looks. Right shape, wrong membership.

**The criterion is what the two things ARE.** A checkbox at rest is a small empty surface with
a boundary, and `look` is precisely a statement about how the app draws its resting surfaces —
so it takes the dress for the same reason a card and a field do. A handle is not a surface you
read; it is a grip you move, and its job is to stay the same recognisable object while
everything behind it changes. Button belongs to no dressed family on exactly that argument
(its border is rank, not dress), and the thumb lands in Button's category despite sharing the
checkbox's geometry down to the pixel. So the family shares its **box** — one ladder, one
corner, one target rule — and not its **dress**, and that divergence is now stated rather than
assumed.

The selector is not new: `:where(:not(.kui-control *))` already means "a mark that is itself the
control" in the target rule two blocks down, where the thumb is excluded from growing its own
hit area for a related reason. Reusing it makes "is this mark a control or a part of one" one
question with one spelling. Specificity stays equal to the family block (`:where()` contributes
nothing), so the file reads top-to-bottom as identity-then-dress.

**It immediately reintroduced the collision the track joined the axis to fix, through the other
door.** With the thumb pinned to the seal, and dark's seal being `--neutral-2`, the filled rail
at `--neutral-2` became the handle's own colour again — 1.000:1, the handle invisible on its
rail, caught by the law written for the first instance. Dark's filled rail moved to the page
step: a deeper well inside a filled card, with the handle a clear step above it. Worth noting
that the law caught this the same session it was written for a different cause, which is the
argument for laws that assert a RELATIONSHIP (this must not equal that) over laws that assert a
value — a value law would have needed rewriting here and would have gone quiet instead.

Not fixed, and unchanged by any of this: the handle still ignores `invalid` and `disabled`.

---

## 2026-08-07 The drawn rail is built, judged and reverted — and it takes the slider's contrast fix with it

`outlined` was made to mean *drawn* on the slider rail: an empty channel bounded by a hairline
instead of a solid grey bar, with the accent portion painted inside it. Built, regenerated into
the preview, rejected on sight. Kushagra: *"handle doesnt look good w outline."* A solid handle
sitting on a transparent rail reads as a bead resting on nothing, and the rail is the one part
of this control whose job is to show the handle where it sits.

**The shape of the mistake is what is worth keeping.** The design argument was sound and
general and still wrong here. "Outlined means drawn rather than filled" is a rule about
SURFACES — regions that have content inside them, where an outline still describes the region.
It was applied to a track by analogy. A rail is not a region; it is a path, and a path drawn as
an outline stops looking like a path. So: the look axis REACHING a part is not the same as the
axis's usual expression SUITING that part. The rail's honest answer to the axis is the
fill-versus-fill trade it already had — one grey, then a sunk grey — a smaller difference than
the other families get, and that is a property of what a rail is rather than a gap to close.

**What the revert costs, recorded as open rather than quietly lost: the slider is deaf to
`contrast="high"` in the outlined world again.** Measured, both appearances: rail fill, handle
fill and handle edge all byte-identical between normal and high. The rail's fill is a
mid-neutral that sits outside every high-contrast band, and with no edge there is nothing to
strengthen — so the accessibility escape does nothing at all on this control on the default
path. The drawn rail closed that as a side effect, which was the one genuinely good thing about
it, and the fix now needs its own answer. Untried candidates: a rail fill picked to land inside
a contrast band, or a hairline that appears only under `contrast="high"` (the material's
stand-down pattern, inverted).

Also still open and unrelated, restated because the original request bundled the two: the
handle ignores `invalid` and `disabled`. That is a cascade problem — the mark family declares
its ring colour ON the mark, which beats the state colour inherited from the control — and no
change to how the rail looks can fix it. Removing that declaration is not available either: it
is the same line that gives all three marks their resting ring, and deleting it turns a
checkbox's grey ring pale blue (measured), undoing audit D2.

Kept from the reverted work, because they were separate commits and stand on their own: the
rail squaring off at `radius="none"`, and §6's corrected "only two corners" count.

---

## 2026-08-07 The rail squares off — an exception has to be argued, not merely unreached

Audit R8, fixed rather than documented away (Kushagra: "we need to fix this").

§6's kill switch says `radius="none"` squares everything, with exactly two named exceptions:
the radio and the slider thumb, both circles because shape is role semantics — a square radio
reads as a checkbox, and a square handle reads as a bead that stuck. The claim "these two
corners are the ONLY two the radius axis never reaches" appears in §6 twice, in LOG and in
CLAUDE.md, and it was false. The slider RAIL was a third: its cap is `calc(track / 2)`, and
`--kui-ct-track` resolves to a designed raw px with no palette token anywhere in the chain, so
nothing about the radius level could ever reach it. Measured under `none`, both pointer worlds,
every size: rail 2 / 2.5 / 3 / 3.5px while the root, Button, Checkbox and TextField all read 0.

The case for keeping it was real and was rejected. Every platform ships a rounded rail even in
a square theme, and square end caps on a 4px well do look broken — so "argue the cap as role,
the way the two circles are argued, and correct the count in four places" was a legitimate
option and is what the audit itself proposed. What decided it against: those two exceptions
were each argued from a confusion the square would CAUSE (a square radio is a checkbox), and no
such confusion exists here — nobody mistakes a square-ended rail for another control. It was
never an exception anyone chose. It was a value the axis could not reach, and discovering that
after the fact is not the same as having decided it. A theme that promises square corners
should not keep one rounded thing on the page because of how a token happened to be spelled.

The fix needs no new token: `min(calc(var(--kui-ct-track) / 2), var(--kui-ct-radius))`. At every
level that has a corner the control radius dwarfs half a 4-7px rail, so all those cells render
byte-identically and the capsule is untouched; at `none` the control radius is 0 and the rail
squares with everything else. The cap stays a property of the rail's own thickness rather than
becoming a pick into the box palette, which is right — a well is not a box.

The law that replaces the missing one checks both halves, because only checking `none` would
let a future "simplification" reprice every level: square at `none`, and exactly half the rail
at every other level, per size. Its negative control is the thumb, which must still be round
under `none` — squaring the rail must not have squared the handle. Mutation-tested by restoring
the bare `calc()`: all four sizes fail.

---

## 2026-08-07 Forced colors is declined, not deferred — and declining it is the accessible answer

Audit finding R3, carried unfixed since the Radio/Slider round because its scope was a
decision rather than a repair. Kushagra: "our library is too premature to solve it."

The defect is real and was re-measured before the call, not taken on the audit's word.
Emulating `forced-colors: active`, a radio's selected and unselected states resolve to the
same visible thing: the accent fill is forced to Canvas white and the indicator dot stays
white, so the one mark distinguishing them disappears into the backplate. Screen readers are
unaffected — the hidden input still carries `checked` — which is what makes this precisely a
sighted-low-vision failure, on the users the setting exists for.

What decided it was not cost. Forced colors is **all-or-nothing per page**: the browser
substitutes the user's palette everywhere at once. So a radio taught to answer it, sitting in
a form beside a slider and a field that were not, produces a screen where some controls are
legible and others are not — and the user has no way to know which of the two they are looking
at. Half-support is worse than none, and this library has ten controls and a material to get
through before the answer would be uniform. Rejected accordingly: patching Radio alone (the
finding's literal fix), and patching the mark family alone (its natural boundary, which still
leaves fields and buttons out).

Recorded in §19's open list rather than left in REVIEW, because REVIEW is where findings go and
this is now a property of the system: a known, measured, accepted gap. The point of writing it
down is that three audit rounds have now found it, and the next one should recognise it instead
of raising it again.

Not to be confused with the contrast axis, which is supported and unrelated: `contrast="high"`
and `prefers-contrast: more` shift our own values within our own palette (§7). Forced colors
takes the palette away.

---

## 2026-08-06 `filled` stops being a trade, the track joins the axis, and every look law is rewritten to compare something

The look axis was audited the day it shipped (ultracode, 38 agents, adversarially verified — REVIEW.md carries the record). The machinery came back clean: ten roles in five scopes and nowhere else, the cascade resolving, `initial` behaving at every consumption site, the P3 rewrite reaching through, nested Themes escaping both ways, and `outlined` byte-identical to the bare render for all six dressed members in both appearances. **Every value `filled` shipped was wrong, and not one of the axis's laws could see it.**

**The premise was the bug.** `filled` was defined as a *trade* — `border: transparent` on all three families, on the theory that a fill replaces a hairline. Kushagra, from the preview's outlined/filled pair: *"filled surfaces can have slight border, but their main pull is filled bg, not border."* Reversing that one word fixed four separate findings at once, because every consumption site already had a correct fallback waiting: the mark family got back the boundary `--mark-edge` was minted for one day earlier (audit D2 — an unchecked box IS its hairline, and `filled` had dropped it to |Lc| 0.0); `contrast="high"` started working again on every dressed family, having had no edge left to strengthen; and the **read-only field stopped being invisible** — readOnly drops the seal by design, so the border was the only thing bounding it, and the dress deleted that too. That last one is the clearest argument against the trade: a state and a dress, each individually reasonable, multiplied to a control that paints nothing at all.

Rejected: keeping filled's border at the *same* weight as outlined's (`initial`, zero new tokens, and contrast="high" for free) — Kushagra chose a softer dedicated edge, so the fill stays the dominant signal and a filled card is visibly less edged than an outlined one. 
**That choice immediately produced the round's best defect, and I shipped it myself.** The stated cost of a bespoke edge was that a faint step *outside* the high-contrast band would look correct while silently killing the accessibility escape — so the edges were picked from inside `contrastHighBands.border`, and a law was written to pin the membership. Both the pick and the law were wrong in the same way: **the band indexes the ladder 0-based, and token names are 1-based.** `contrastHighBands.border = [5, 6, 7]` emits as `--neutral-6/7/8`, so the `--neutral-5` edges chosen for the surface and field families were never re-declared under high contrast at all — and the law passed because it compared 1-indexed names against 0-indexed positions and the two ranges happened to overlap. Measured against the artifact: tokens 6, 7 and 8 move under `contrast="high"`; token 5 does not. The claim was false for two of the three dressed families, written into two documents, and green.

This is precisely the defect class the audit that prompted all of this was about — a law agreeing with its author's arithmetic rather than with the artifact — reproduced within the hour, by the author who had just written the warning against it. It is the third recorded instance of the pattern, and the statement narrows each time: 2026-08-03 said *read a computed value*; the look audit said *read the right element and the right box*; this one says **read the OUTPUT, never the input you derived it from.** Config membership is an input. The emitted declaration is the artifact. The pixel a component computes is the truth.

The fix is not a better pick. `contrast="high"` now stands every look border down to `initial`, so the tone system resolves the edge at the element — which is exactly what the material already does with its glass edge under high contrast, making this a precedent reused rather than a mechanism invented. It also ends the competition between softness and reachability: the resting edge can now be as soft as taste wants. The replacement law is an **outcome** law, mounted — a real component's computed `border-top-color` must differ between `contrast="normal"` and `"high"`, per family and per appearance. Mutation-tested by deleting the stand-down: four cells go red, and the mark cells correctly stay green, because that family's edge already sat on a step the pass moves.

**An index is not a colour, and this is the third time that has cost us.** `filled` named raw `--neutral-2/3/4` in one mode-blind block. In dark, those *are* `--color-surface` and its two states — so the entire surface family resolved byte-identically to `outlined`, and the axis did nothing but delete the card's hairline across half the world. The `[data-look]` blocks cannot hold the fix: they are one block per look on purpose (co-location — a compound `[data-appearance][data-look]` would resolve for Theme and miss the un-themed path the stylesheet explicitly promises), so they may only carry mode-blind mappings. The pigment moved into `--dress-<family>-<slot>` roles declared per appearance scope, exactly the shape `--color-surface` already is. The first instance of this bug was `--color-text` baked at `:root` (§8); the second is recorded in `surfaceColor`'s own comment, where dark's card hover equalled its rest for the same reason; this is the third. A higher step is *darker* in light and *lighter* in dark, so recessed and raised are opposite arithmetic and the ladders are not each other's copy.

**The track joined the axis, reversing a decision recorded hours earlier.** It had been excluded on "the look trades a border for a fill, and the track never had a border — an edgeless well has no trade to make." True of the trade, and the trade is what stopped being the design. Kushagra, from the preview: *"slider doesn't respect outline at all rn."* The exclusion also hid a measured defect: the thumb reads `--look-mark-fill` and the track read `--color-track`, and **both resolved to `--neutral-4` in both appearances** — a filled slider's handle was its own rail at 1.000:1. Rejected: moving the *mark* family off `--neutral-4` instead, which would have dragged checkbox and radio off a value that suits them to fix a collision that is the slider's; and giving the thumb its own fill outside the mark family, which splits the identity the mark-family promotion was built on. The well moves and the handle stays. What replaced the old "track pinned unmoved" law is a pair: the track must *differ* between looks, and the thumb must never equal its rail in either look.

**The lesson, and it is 2026-08-03's rule with the hole finally named.** That rule said an axis is proven by a law reading a *computed value* through a mounted `<Theme>`. Every look law did exactly that — and every one of them still measured nothing, because *reading a computed value is not the same as comparing it to anything*. `card.browser.test.tsx` asserted a filled card equalled `var(--neutral-2)`, the name its author had just typed, so the law and the bug agreed with each other and both were wrong in dark. `text-area`'s law was titled "filled matches TextField exactly" and never once mentioned TextField. **Not one law compared the two ends of the axis, and not one compared a dressed part to the thing behind it.** Both comparisons now exist, per family and per appearance, and both were mutation-tested against the shipped-and-broken config before being trusted: put dark's surface back on the seal, put the borders back to transparent, put the thumb back on its rail, put an edge outside the contrast band — each kills its law. The rule grows: **a law that reads only one value has not made an assertion, it has taken a reading.**

---

## 2026-08-06 The look axis: rank and dress split, and the border keeps both jobs

Kushagra's taste question, held against the system until it factored: v1 and Radix felt more expressive because of variants (`soft`, `surface`), yet variants are exactly what this system refuses — and Button already shipped `bordered`, which looked like the same sin. The reconciliation is that variants fused two questions. **Rank** — which action is louder — is per call site and already ours (`emphasis`). **Dress** — how the app draws resting chrome — is an app identity with no home. The border pixel serves both, resolved per family the way emphasis is: Button's `bordered` is rank (the preview matrix shows it: quiet+border is the classic outline button, a real half-step — quiet < quiet+border < medium — derived instead of named) and SURVIVES as a prop; a one-look family's border ranks nothing and moves to Theme. First proposed as "fold `bordered` into the Theme look"; Kushagra refuted it with the matrix and the refutation stuck.

`look="outlined" | "filled"` (§19), the seventh Theme prop. Vocabulary: `outlined | soft` rejected — an edge-word and a feel-word are not one axis; `outlined | filled` is Material's own text-field pair, both naming how the boundary is drawn. `bordered` as a value rejected: that word now means rank. Membership is role consumption per family (surface, field, mark — Kushagra's hierarchy: lightest, one darker, darkest), with mounted flip laws for members, a per-rung negative law for Button, and the axis's home pinned (only tokens.css may put a colour in a look role).

Two mechanics earned their scars the same day. The first cut put `var(--tone-border)` in the outlined border roles and every outlined border silently went transparent — §6's own substitution-at-declaration, violated by its author, caught by the mounted identity laws before it ever ran in a browser: the value baked at the Theme scope where no tone exists. `initial` + consumption-site fallback (the material edge's pattern) is the correct spelling, and the emission law now asserts `initial` BY NAME as load-bearing. And the painted-variable law rejected the field sheets declaring `--kui-border-color` — the checkbox audit's law, holding one component later, forcing the field-family rule into the shared layer where it belonged.

Deferred on the tone-set rule: the accent-tinted well (a value on this axis, never a second prop), and any hover step for filled fields (a field's fill does not move; the border and ring carry its states — whether filled needs a substitute cue is an eye-pass question).

**Caught by eye, same day: the look roles were the only colour roles not repeated per appearance, and dark mode paid for it.** Kushagra, from the regenerated preview: cards, fields, text areas and radios all rendering WHITE in the dark sections. A look role holds a colour, and a `var()` inside a custom property substitutes where it is **declared** — so `--look-field-fill: var(--color-surface)` emitted only at `:root` baked the light seal, and every dark region that was not also a look scope inherited it. Every other colour role in the system already repeats in both appearance scopes for precisely this reason (`--color-text` baked at `:root` was the same lesson in §8); the new axis simply was not held to the rule. Both appearance scopes now carry the default look's roles, with the `[data-look]` blocks later so they win on the co-located element.

What made it invisible to 755 laws: every mounted look law went through `<Theme>`, which stamps `data-look` beside `data-appearance` on one element, so the roles were always re-declared where the mode was decided. The bug lived exclusively on the **un-themed** path — raw `data-appearance="dark"`, which the emitted stylesheet explicitly promises works standalone and which the preview uses throughout. The law added for it renders a Card inside a bare `data-appearance` div and asserts it equals the themed dark render and differs from the light one; it fails against the pre-fix generator. The general lesson is narrower than "test both appearances" — it is that a law which only ever exercises the *sanctioned* path cannot see a defect in the *supported* one, and this system supports both on purpose. The preview also gained the top-level `look` select it should have shipped with (stamped on the root and on every appearance scope, exactly as the contrast toggle already had to be), and the look demo's mark row moved to definite grid tracks after hitting the known Box shrink-wrap collapse — labels piled on top of each other, the defect the checkbox section already documents.

**Postscript, same day: the axis and the mark-family promotion landed in parallel and had to be reconciled.** The look wiring was written against `.kui-checkbox`; Radio and Slider promoted the family's rules into `.kui-mark` in the shared layer hours later. Rebasing the wiring onto the family — one rule instead of three — is what the promotion was for: Radio ships a single declaration (its circle), Slider says nothing about dress at all, and both answer the app's identity, pinned by a law that asserts all three members resolve the SAME computed pair in both looks. The merge also corrupted `outlined`'s field and mark entries with `filled`'s values, and the thing that caught it was the "outlined ≡ the bare render" law — the end-to-end form, doing exactly the job the config-reading version of the same law could not have done. The slider TRACK stays outside the axis and now has a law saying so: the look trades a border for a fill, and a part with no boundary has no trade to make.
## 2026-08-06 The audit's rule grows: a mechanism with two implementations owes a law that they agree

The apps/docs slice was audited the way the system layer was on 2026-08-03 — independent lenses, every finding handed to a verifier told to refute it, nothing surviving that was not personally reproduced. Twenty-seven confirmed, five refuted, eight distinct defects. The full round is in REVIEW.md; what belongs here is the part that changes how the next thing gets built.

**2026-08-03's rule was "an axis is proven by a law that reads a computed value."** It was written because every broken axis in that sweep had a law one indirection short of the thing that could be wrong. This sweep's defects were not one indirection short. They sat where **no law existed at all**, and in two different shapes.

The first shape: `apps/docs` was not in the test graph. It had no test harness, so the appearance mechanism — the thing the entire dark-SSR debt was paid with, and the headline of the slice — carried zero assertions, and two crash-the-site defects shipped through a green `pnpm run ci`. The second shape: the underline invariant had quietly become **two sites with one law**, so deleting `surfaces.css`'s half left all 509 tests passing while a card-as-link underlined its contents. That is the focus-ring and box-shadow lesson arriving a third time, which is what makes it a pattern rather than an incident: a single-site fact becomes a multi-site one silently, and only a law that reads the value *at every site* notices.

So the rule grows two clauses. **A mechanism with two implementations owes a law that they agree** — here a pre-paint script string and a React store, both reading the same keys, both stamping the same attributes, kept in step by nothing but discipline; the law now compares them attribute-for-attribute across all eighteen cells. And **the first thing a new app in this repo owes is somewhere for its laws to live**, before it owes anything else, because an app outside the test graph is a place where the standing rule cannot reach.

**Writing that law immediately caught the fix being incomplete**, which is the cleanest possible argument for the clause. Guarding the storage reads stopped the crash, and the toggle was still dead for the same visitors: `apply()` re-derives from storage, so a write that could not persist was invisible to the very next read. Memory is now the session's truth and storage is persistence. Nothing about that is visible from reading the diff; it took a law that ran the two halves against a throwing environment.

**The other thing worth carrying forward is where the worst defect lived.** `pnpm dev` was broken on every route because an element created in a Server Component crosses the RSC boundary as a lazy node, and `composeRender` dereferenced it blind. It is DEV-ONLY — production Flight sends a real element — so `next build` was clean, `next start` was clean, the screenshots were clean, and the command a human would actually type was the one nobody typed. **Verify the developer's path, not only the artifact's.** The fix is upstream's, through the public `React.Children.toArray`; Base UI has carried the identical workaround all along, which is the second time render.ts has had to record "where upstream handles a case and we do not, that is our defect."

Refuted and staying refuted: the "every visible pixel is @kookie-ui/react" stance over the hand-drawn icons — §8 already says the icon set is "installed by the app (and the docs), never by the library", naming this exact case — and the containment diagnosis written into DECISIONS the day before, which survived independent re-measurement.

Five confirmed findings were deliberately NOT fixed, and are in DECISIONS' open list rather than here: each is a system decision (should a Button rendered as a link announce as a link; should a field be shrinkable by default; the card-as-link box; the surface margin; how selection state is spelled before a Segmented Control exists). Fixing a system decision inside an audit cleanup is how a decision gets made by whoever happened to be holding the broom.

## 2026-08-06 Fields leave the elevated world: a well casts no shadow

For two days `surfaces="elevated"` lifted TextField and TextArea with the cards, on the sentence "a text field is a bordered box sitting on the page — it lifts with the cards, or the identity is only half applied" (2026-08-04). Kushagra kept pulling the thread — first the membership question (why fields and not button or checkbox), then the vocabulary (the prop says *surfaces* and a field is a control) — and the sentence turned out to be asserted, not judged. Elevation separates a plane from what is behind it. A field is a **well**: something you look and type into, content of a plane, not a plane above one — and a recessed thing casting a drop shadow is physically incoherent. The platforms already agree: Material's fields are filled or outlined, never raised; no OS shades an input. The floating search bar one might cite is a promoted toolbar *containing* an input — a shell, not a form field.

The membership criterion is now one sentence in §5: elevation dresses boxes that establish a plane of their own. Button's box is the action, a mark's is the state, a field's is a well — all three stay flat, each pinned by a mounted negative law under `surfaces="elevated"` (Material's raised buttons are the cautionary counterexample: shadow-as-loudness, fused into the rank ladder). The box-shadow walk re-pins the consumer count at exactly one — the surface layer — so a second consumer is a decision that fails a law first, not a drift.

Rejected: keeping fields in and renaming the prop around them — the set was wrong, not just the word. Recorded beside it: an elevated world *deepening* the well (an inset shadow) is a coherent future taste question; a lift never was.

## 2026-08-06 One Size union across three ladders, on purpose

The architecture review flagged that the exported `Size` serves three unrelated scales — Button and the fields read it as the control height index, Card as the surface padding + corner index (default "3" against everyone else's "2"), Checkbox as the mark index. They share a numeral, not a scale. Kushagra's call: keep the one union. §4 already defines a size as "an index, not a measurement" — the index never promised that two components at size 2 share a box, only that each family resolves its own designed ladder at that step. Splitting the type would encode in the API a sameness the system never claimed, and cost a breaking rename across every component for a distinction the resolved tokens already carry.

Rejected: `ControlSize` / `SurfaceSize` / `MarkSize` as distinct public unions — more honest-looking at the call site, but the honesty is false precision (all three are the same closed "1"–"4" set), and the day a family needs a different index count the union splits then, with the evidence in hand. Recorded in `system/axes.ts` beside the type; here so it stays closed.

## 2026-08-06 The alpha ramp composites over the seal, and its law stops grading its own homework

The recomposition law took its backdrop from the emitter's own `pageBackdrop` — the same value the alpha solve consumed — so the law was a tautology: it could verify the arithmetic but never notice the backdrop being the wrong colour. And it quietly was. The page colour existed as three near-identical statements (`surfaceColor.light.rest` `#ffffff`, `pageBackdrop`'s own white / hand-built dark approximation, and the generated `--neutral-1`), and the two modes told different stories: light solved against white — which happens to be the seal — while dark solved against a page approximation, which is why dark's neutral overlay hexes came out faintly pink (`#fff0f1` for a grey ramp).

Kushagra's call: the ramp officially sits on the **surface seal**, not the page — an alpha fill's usual home is a card or a field, both sealed. `alphaBackdrop` now reads config's `surfaceColor` (a literal directly; dark's `var(--neutral-2)` resolved through the same generator that emits it, via a steps-only build that breaks the solve's cycle), and the law derives the seal independently from config, so an emitter/seal divergence now fails CI. Dark's ramp re-solved: 98 declarations moved by a hair, the pink cast gone; light was already seal-based and did not move. Budget 18,137 → 18,129.

Rejected: compositing against the page (`--neutral-1`) — it matches the word "page" but not where alpha fills live, and dark's seal (`--neutral-2`) is the surface story §10 already tells; leaving the tolerance recorded — the deltas were invisible, but a law that cannot fail is the audit's oldest finding.

## 2026-08-06 Slider: the control is the target, and the track needs two things the system did not have

Repetition's fourth entry, landing with Radio (below). Three questions were genuinely open, and two of them minted something.

**The target needed no mechanism at all, and that was the design.** A slider's thumb is a mark, and the checkbox's answer — an invisible expander to the box a control of its size would occupy — was sitting right there. Wrong tool: the slider root already IS a control of its size. It takes the size join and `min-height: var(--kui-ct-h)`, the whole strip is pressable (Base UI's control part hit-tests track presses to the nearest thumb), so the height ladder's guarantees — the 24 floor, the 44 coarse default — arrive with zero new machinery. The thumb's own expander is *scoped out*, and that scoping generalised the slot-only exclusion into the real rule: **a mark inside another control never grows its own target** (`:not(.kui-control *)`), because overlapping thumb expanders on a range slider would resolve track presses in tree order, overruling Base UI's nearest-thumb logic — the D4 inversion wearing a new coat.

**The track's colour needed a role: `--color-track`.** §11 says "track low", and low means neutral — the checkbox's "neutral off" one control over — but the element stamps `accent` for its fill, and a component stylesheet cannot say neutral without naming a family (the role-not-family law). Same structural forcing that minted `--mark-edge`, so the answer sits beside it in color-config: step 4 both modes, v0. Deliberately NOT held to the mark edge's non-text floor — a well is a region the APCA-passing fill moves through, not a hairline identity, and iOS/Radix both ship it subtle. The switch's off-track and progress/meter inherit the role.

**The track's thickness needed a ladder, and the space palette refused it the same way it refused the mark.** A plausible track ladder is 4/5/6/7; between 4 and 8 the palette has nothing, so a pick either repeats a step or doubles between sizes 2 and 3 — the third family to hit this wall, and the answer is the established one (height, px, pxPill): `sliderTrack`, raw designed px, ~0.25 of the fine mark across the index. Density- and pointer-invariant: the coarse world's extra allowance is the control's height, not a fatter line (iOS holds 4pt against a 28pt thumb). Law: the track never reaches half its thumb, in both pointer worlds.

Fixed identities, refused as API: `thumbAlignment="edge"` (the handle stays inside the rail's ends — every platform's shape; exposing it would make the rail's endpoints a per-call-site opinion) and horizontal only (`orientation` refused: the root rides the height ladder and the track ladder holds a fraction of the fine mark, and none of those numbers were placed for a vertical box — vertical ships as its own designed set the day something forces it, the tone-set rule). The thumb rests as every mark rests — seal and mark edge, no hover step: a handle does not fill, it moves. Range sliders are the same component: array value, one thumb per entry, `index` stamped for SSR.

One law corrected itself before it earned trust (the checkbox scan's lesson recurring): the first keyboard law dispatched a synthetic KeyboardEvent, which cannot drive a native range input, and the first focus law ran before Base UI's edge-alignment measurement — the input sits `visibility: hidden` until first layout, refuses focus, and the law would have skipped itself. Both now wait for the settled frame and assert the focus landed before asserting anything else.

Rejected: a thumb-level expander (above); track thickness as a mark fraction ("I don't like fraction" — the objection is standing policy); track colour as `--tone-soft` (under the stamped accent that is a *tinted* track, and §11 says low, not soft-accent); `--color-surface-active` as the well (role abuse — a name meaning "surface pressed" painting a resting region); vertical as a pass-through prop (undesigned geometry shipping today beats no geometry only in libraries without laws).

## 2026-08-06 Radio lands, the mark family promotes on its third member, and the circle breaches the kill switch on purpose

Repetition's third entry. Radio is the checkbox's shape sibling and brought almost nothing of its own — which is the finding: with the slider thumb landing in the same change, the mark family reached three members, and TextArea's promotion rule fired exactly as written. The box, the invisible target, the hosted floor, the seal-and-edge resting identity, the disabled fill arm, the accent ON state and the glyph-is-the-box rule moved from checkbox.css into `system/recipes.css` as `.kui-mark` rules; checkbox.css keeps the tri-state's glyph picks, radio.css keeps one declaration. The ON state is written once for the binary controls (`:where([data-checked], [data-indeterminate])`, still losing to the state remaps — the precedence question travels with the rule), so Switch inherits the whole apparatus the day its stylesheet exists. A structural law pins the promotion: no component stylesheet may size a mark's box or re-point the mark edge. Laws that mounted the family's geometry through Checkbox needed not one edit, which is the promotion demonstrating it changed nothing.

**The circle is the entry's one real decision.** §6's kill switch says `none` squares everything, and a radio under `radius="none"` would be a square — indistinguishable from the checkbox beside it in any form that has both. The checkbox already decided this question from the other side: its corner caps below the capsule at `full` because "a circular checkbox reads as a radio — shape is role semantics, and role legibility outranks theme uniformity." Mirrored, the same sentence forbids the square radio. So a radio (and a slider thumb, for the platform's reason — a round handle on a rail is what a handle is) is a circle at every radius level, stated as `calc(mark / 2)` — the capsule as the rule, §6's own correction — and the breach is narrow and named: the kill switch owns every corner that is dress; these two corners are role, and they are the only two. Law-tested at every level in both pointer worlds, `none` included. (The count was wrong until 2026-08-07: the RAIL escaped too, by arithmetic rather than argument — see that day's entry.)

The group: Base UI's `RadioGroup`, wrapped with zero CSS and no class — selection, `name`, roving focus are the platform's; layout is the caller's Stack (`gap="5"` holds the 12px stacking rule at every density), with `render` left open so the group can BE the Stack. `readOnly` refused on both Radio and the group, inheriting the checkbox's LOG-recorded refusal.

Rejected: keeping the ON state per-component (identical bodies in two files, with Switch queued to make it three); a `Radio` that owns its own label prop (the label is a sibling — the non-negotiable, third control in a row); squaring the radio under `none` for the kill switch's purity (role legibility outranks theme uniformity, already decided once); `--radius-full` as the circle's spelling (dies under `none`, and 9999px asks the rendered box — the §6 correction's whole point).

## 2026-08-06 The budget gate pins its compressor: pako in the lockfile, not the runner's zlib

CI went red on a +20-byte "regression" no commit caused. `dist/styles.css` was byte-identical on both sides (167,744 raw) — the build is deterministic — but the gate's number came from `node:zlib`, and Node vendors zlib: Node 22.23 (CI) and Node 25.2 (the machine that recorded the 18,137 baseline) emit different, equally valid gzip streams for the same input at the same level, 20 bytes apart. The last green run agreed with its baseline exactly, because back then both sides compressed alike; the divergence began the day the recording machine's Node moved. The law was measuring the environment, not the stylesheet — the standing audit lesson one layer down: a gate's number must be a function of the artifact alone, and a compressor outside the lockfile is an input nobody pinned.

`measure-css.mjs` now compresses with pako, pure JS and exactly pinned, so the number is identical on every platform and Node version. Pako's level 9 lands on 18,137 for the current bundle — the recorded baseline — so the number did not even move; only its provenance did.

Rejected: re-recording the baseline to CI's number (leaves a ±20 band where a real local regression hides, and moves again whenever either side's Node does); pinning Node to an exact patch in CI and on every machine (fixes today's pair, not the class — the compressor stays outside the lockfile); ratcheting raw bytes instead (deterministic and dependency-free, but §2 states the budget as wire cost, and gzipped is the unit the ceiling means).

## 2026-08-06 The spinner gains a wrapper: composited rotation outranks one element

An external audit (Vercel's react-best-practices rules, run over the whole repo) matched the Spinner against its animate-the-wrapper rule: the `kui-spin` transform sat on the `<svg>` root, and an SVG element's CSS transform is not reliably composited — some engines run it on the main thread. For this control that is not a micro-optimisation: a busy indicator exists to keep moving while the main thread is busy, so a main-thread rotation freezes at exactly the moment it is for. The component's own comment claimed "a single composited rotation"; the claim was precisely the assumption the rule disputes, and nothing enforced it.

The animation, the icon box, `fill: currentColor` (inherited into the svg) and the ref move to a `<span>` wrapper; the svg fills the box at 100%. One element becomes two, and the criterion that allows it is the anatomy criterion already governing wrappers elsewhere: the second element is forced by something non-visual (animation reliability under load), not by layout convenience. Done now because nothing is published — the ref retypes from `SVGSVGElement` to `HTMLSpanElement` at zero cost, which stops being true the day there is a consumer.

The same audit's remaining runtime findings landed as separate commits: Theme's `resolved` memo depended on the parent context's *identity* rather than the six fields it reads, so a nested Theme re-rendered its whole subtree on ancestor changes it overrides; `useWindowClass` built fresh `MediaQueryList`s on every snapshot read and every subscribe (now one shared trio per document, lazy so SSR never allocates it); the spinner's spoke elements and the resolver's digit regex hoisted to module level. Everything else came back clean or not applicable — the no-JS-at-interaction-time law means most of the rule set has nothing to bite on, and the barrel/tree-shaking posture passed by mechanism (unbundled output, `sideEffects`, deep Base UI imports).

Rejected: keeping the one-element spinner with `will-change` or a translate hint (a hint requests a layer; it does not change which thread animates an SVG root's transform in the engines that main-thread it); animating an inner `<g>` instead (same element class, same question, plus a second SVG node).

## 2026-08-06 The mark edge: a control that IS its hairline gets its own resting colour

The audit's D2: an unchecked checkbox failed WCAG 1.4.11 outright — its entire visual identity is the 1px `--color-border` hairline, and that role (neutral 7) measures |Lc| 22.8 light / 10.3 dark against the surface, against the non-text floor of 45 the system itself declares and enforces for the focus ring and the invalid edge. The floor existed; nothing pointed it at the border a mark rests on. The checked state passed, so the failure was precisely the state every form starts in, and `contrast="high"` only reached 2.87:1 in light.

Kushagra's call, and the scope IS the decision: **a new role for the mark family only — checkbox, switch, slider (and radio with them) — nothing else changes.** The alternative was re-stepping `--color-border` itself, which would have darkened TextField, TextArea and the card seal in the same stroke; refused because their identity does not rest on the hairline (a field has a seal and a value) and the quiet edge is a deliberate part of how surfaces read.

`--mark-edge` resolves per mode to the FIRST neutral step clearing the floor against both the surface and the page, measured through the shipped generator: light 9 (Lc 58.8), dark 11 (66.5 — dark's step 9 misses at 42.1, and its step 10 is darker still; the dark ladder folds back past the solid). Per-mode steps are the `--focus-ring` precedent. Material's unchecked outlines sit in the same territory in both modes, so this lands beside the platform rather than away from it. The picks live in color-config.ts; the law lives beside the invalid edge's and was watched failing at step 7 in both modes before the picks were accepted.

Rejected: re-stepping `--color-border` for everyone (above); a raw designed hex (goes deaf to `contrast="high"`, which reaches the mark automatically because the role resolves through the re-declared neutral scale); leaving it to the eye pass (a WCAG failure is not taste).

## 2026-08-06 Marks in a stack need twelve pixels — the overlap is governed, not removed

The audit's D1, its largest finding: below the target's reach, the LATER of two stacked marks owned pixels inside the EARLIER one's painted box (both invisible targets hit-test in tree order), so a real click on one checkbox toggled the next — measured, 6px of a 24px mark stolen at a 4px gap under coarse — while the shipped sentence said "a stacked list is clear at any layout-space gap the system offers" in three places. The scale starts at 2px; the sentence was false at its bottom rungs.

Four options were put up and Kushagra picked the rule: **keep the expanding target as it is, state the spacing it obliges — 12 real pixels between stacked marks — and check it automatically.** Twelve is one more than the worst reach in any cell (11 with the border term), a real rung (space 4; the default density's `gap="4"` sits exactly on it, `gap="5"` is the smallest index that holds it at every density since compact resolves 4 to 8px), and the law mounts the rule rather than deriving it: two marks at exactly 12px in all 24 (pointer × density × size) cells, every point strictly inside the first's paint must belong to the first — plus a negative control at 4px that must KEEP stealing, so the twelve cannot rot into decoration.

The law itself earned a correction before it earned trust: the first cut ran after enough mounts had pushed the pair off-viewport, `elementFromPoint` answered null for every row, and all 24 cells passed while measuring nothing. A row nobody claims is now an error, not a zero.

Rejected: clamping the reach to half the tightest gap the scale offers (~1px — kills the mechanism to save the worst layout); expanding on the inline axis only (nothing sits beside a mark but its label, but the vertical reach is where the value is, and a rule beats an asymmetry); dropping the expansion entirely (returns every fine cell to a sub-24 target, the thing the expansion exists to fix); leaving the sentence and hoping (it was already false).

## 2026-08-06 A hosted mark stays a mark — behaving beats a rule nobody can enforce

The audit's D4: a checkbox in a field's trailing slot rendered 20 wide and 24 tall. The hosted-control rule pins `height` to the slot's derived box — right for a Button, which is a container for a label, wrong for the one control whose box IS its mark — and physical `height` beats logical `block-size` in the cascade while `inline-size` sails through unopposed. The corner then held two different fractions of two different axes, the exact class of thing the `--radius-mark-N` fix was written to end. Worse, on a fine pointer the mark kept its own expanding target inside the container: 36px of reach inside a 32px field, the inversion §4's hosted rule exists to prevent.

Two options: make it behave, or declare the combination unsupported. The deciding fact, surfaced when Kushagra asked what a block would take: **a true block is impossible** — the slots accept any node, so "unsupported" could only ever be a written rule, and anyone ignoring it would get the broken rectangle. He chose behaving ("A"). Both axes now come from one expression — the mark, floored by the hosted box for the cells where the slot is genuinely tighter — and the mark's own expander is scoped out of slots entirely (`:where` keeps the exclusion at class specificity), so the container-matched coarse target from the shared layer is the only target a hosted mark has. A law pins that the exclusion does not leak to marks that merely sit inside a label or a form. Radio and Switch inherit the geometry.

Rejected: the written-rule "block" (unenforceable, and a documented broken cell sits badly with a system whose demos are law-checked); filling the hosted box instead of keeping the mark (24×24 in a size-2 field — a hosted checkbox LARGER than a standalone one, growing on entry); suppressing the coarse container-matched target along with the mark's own (it is the sanctioned §4 behaviour for anything hosted).

## 2026-08-06 readOnly is refused on Checkbox — the standard pattern is that there is none

The audit (D5) found `readOnly` accepted and resolving to nothing: a checkbox that looked live, stepped its fill under the pointer, kept the pointing cursor, and silently refused the click — three affordances promising a toggle Base UI then denied. The open question was what it should look like; four candidates were mocked in the preview and judged.

Kushagra asked the question that dissolved it: what does everyone else do — why are we reinventing the wheel? Checked rather than answered from memory, and the finding is that **the wheel does not exist.** The HTML `readonly` attribute is defined for text fields and deliberately not for checkboxes; the WHATWG's stated position is that a read-only checkbox has no useful distinction from a disabled one. Material has an open feature request from 2019 it never shipped. Ant the same. Adrian Roselli's article on the subject is titled "Avoid Read-only Controls". The libraries that do accept the prop — Chakra, Base UI — draw it identically to a live control, which is not a pattern but the same bug this audit had just flagged.

So the prop is refused by the type, beside `render`, `children` and `nativeButton`, and the mock section came off the preview. The one real capability lost is submission: a read-only value goes with the form where a disabled one does not. Accepted — it is rare, and an app that needs it sends the value itself. Radio and Switch inherit the refusal.

Rejected: the four mocked appearances (no-fill, faded, Kushagra's grey tick, and the shipped nothing) — not on their merits, but because designing an appearance concedes the state should exist, and the platform's own position is that it should not; keeping the prop functional-but-unstyled (the Chakra/Base UI shape — the exact defect being fixed); mapping it to the disabled look (the two differ in form submission, and identical dress on different behaviour is a lie in the other direction).

## 2026-08-05 A mark's corner held a fraction of the wrong box — the radius bug, third instance

Checkbox shipped its corner riding `--radius-control-N` with a ceiling at `full` to stop it becoming a radio. Kushagra caught the rest of it by eye within the hour: "size 4 looks much more rounded than size 1."

Measured, and it was worse than it looked. The control radii are designed to hold ~0.2 of the HEIGHT ladder; a mark is not on that ladder, so the corner was holding a fraction of a box the control does not have — **0.250 → 0.385** across the index at default density, and **0.462** at comfortable size 4, which is a circle in all but name.

**The second half is the part worth recording, because no ceiling could have caught it.** `--radius-control-N` is DENSITY-indexed. Density does not touch a mark's box — that was a deliberate call when the family landed, since a mark sits beside a label and the label does not move either — yet it was re-cutting the mark's corner, and the guard I had written only looked at the `radius` LEVELS. A theme could not reach the failure; an axis could. This is the third instance of one lesson (the control corner in 2026-08-04, control padding on 2026-08-05, now this): **a fraction is only meaningful against the box it is a fraction of, and inheriting a ladder is not the same as being on it.**

`--radius-mark-N` is the family's own picks into the palette — steps, not raw px, so the levels still reach it (`none` must square a mark like it squares everything else), density-invariant like the mark itself, and at `full` it holds at `large`'s values, which is the sentence the surface band already uses one band over. The fraction lands in 0.17-0.25 at the default level (the per-level bands and the corrected claim: 2026-08-06, audit D13).

Rejected: a raw designed ladder per size (4/5/6/7 would hold 0.25 exactly — the palette cannot, since it has no 5 and no 6.5 — but a raw number goes deaf to the radius levels, and `none` squaring every corner is not negotiable); keeping the ceiling as the whole mechanism (it is a guard against a theme, and the defect arrived through an axis); making the ceiling density-aware (it would have hidden the real fault, which is that the corner was reading the wrong ladder at all).

The laws that now exist are the ones whose absence let this ship: the spread across the size index stays under a third at every level, no (level × density × pointer × size) cell reaches half the box, and density declares no mark corner at all. The first of those fails against the shipped ladder at 1.54.

## 2026-08-05 Checkbox: the mark family is the line box, and the target is a control of its size

Repetition's third entry, and the first control that leaves the height ladder without leaving the size index. Four questions were genuinely open, and Kushagra closed each one against a different argument than the one I brought.

**The API closed first and cheaply: no `tone`, no `emphasis`, no `material`, no `render`, no `children`.** §11 already assigns the family its one tone (neutral off, accent on), which is an identity rather than an axis; loudness ranks actions and a checkbox is not one; blur inside a 20px square is a 20px square. `children` goes because the LABEL is a sibling — a mark sits beside its label, and the row that owns them both is what spaces them.

**The size: not the space palette, and not a fraction either.** My first proposal anchored the box at ~1.2x its own font step. Kushagra rejected the shape of it — "I don't like fraction" — and asked the better question: why not the space tokens? Measured, and the answer is the control-padding failure one family over (third instance of this lesson, after radius and padding): across a mark's plausible range the palette offers exactly **two rungs, 16 and 24**, so a four-step ladder either repeats steps (16, 16, 24, 24) or overshoots (12, 16, 24, 32). Radix hit the identical wall from the other side and wrote a fraction to escape it — their switch size 2 is `calc(var(--space-5) * 5/6)`, which exists only because the palette has no 20.

What resolved it was **the line box**: `--mark-N` IS `--line-height-N`, an identity rather than a ratio. A mark occupies exactly one line of the label it sits beside. It aligns with that label by construction, and it **grows on a phone with nothing designed twice** — §17's handheld band raises the type and the mark rides it, which is where Spectrum ends up by scaling every component 1.25x on touch and maintaining both scales by hand. Rendered 16/20/24/26 fine, 20/24/26/28 coarse.

**It is one ladder for four controls, and that was Kushagra's catch too** — asked mid-decision whether the switch and slider thumb would share the checkbox's height, which is not a question I had put on the table. Four separately designed ladders in one visual weight class drift, and a checkbox beside a switch in one form has to read as the same size of thing. So: checkbox = radio = slider thumb = `mark(n)`, switch track = `mark(n + 1)`. The shift is not invented — it is what Radix arrives at by hand (their switch heights ARE their checkbox ladder moved up a step) and what Material shows in the extreme (32 track against an 18 box). §1226 is amended accordingly: the switch still leaves the control height ladder, it just no longer gets a bespoke pair that can drift.

**The target reopened a §16 rejection, and narrowed it rather than reversing it.** §16 refused invisible pseudo-element expansion outright: "its safe extent depends on neighbour gaps, which CSS cannot read." Kushagra's answer was to reach for the rule the field already uses for a hosted control — the hit area is the CONTAINER's box, not a hardcoded 44 — inverted: a mark has no container, so it grows to the box a control of its size would have occupied. That is what makes it legitimate, because **the extent is no longer guessed**: it is `--control-height-N`, the same number the Button beside it occupies.

Two things changed in the building. It applies in **both** pointer worlds, not coarse-only like the hosted rule — a fine cell's mark is 16-26px, under WCAG 2.5.8's minimum at the small sizes, and "a mouse is precise" is not what the criterion says. And it is **capped at `--touch-target-min`**: the raw ladder reaches 68px at comfortable coarse, 20px of invisible reach per side, which is exactly the silent overlap §16 feared. With the cap the widest reach in any of the 24 cells is 10px (law-tested), so a stacked list is clear at any gap the layout-space scale offers. The floor token gets its first stylesheet consumer, having been minted for the `max()` reserve §16 dropped.

**Two defects the laws caught in the writing, both about a component reaching past the shared layer.** The resting box first declared `--kui-border-color` directly, so the shared `invalid` remap — which rewrites the tone ROLES — could not reach it, and a checkbox with `aria-invalid` kept its calm neutral edge. And the checked rule was written with `:is()`, tying with the invalid remap at (0,2,0) and winning on source order, so a checked invalid checkbox looked entirely fine. `:where()` fixes the second by stating the precedence question in a selector: **being ticked is dress, being invalid or disabled is a state, and a state outranks dress.**

Rejected along the way: a designed raw ladder for the mark (10 numbers, uncoupled from type — the fallback if the line box ever feels wrong at size 4, where 26/28 is larger than any peer ships); fewer than four sizes (Radix ships 3, Fluent 2, Material 1 — but `size` is a closed union by law, and a call site passing an index from a variable cannot have one component refuse it); no expansion at all (the honest reading of "peer-sized paint", and it fails 2.5.8 on paint in every fine cell); a padded footprint instead of a pseudo-element (self-contained, but the component's footprint would stop matching its paint); and stamping `data-tone` from the checked state in JS (the state attribute is Base UI's, but styling that reads it belongs in CSS — §1's no-JS-at-interaction-time).

**--color-border is minted with it**, and it is not scope creep: "neutral off, accent on" needs the element to stamp `accent` for its ON state, which leaves the resting edge with no way to be neutral except naming a family in a component stylesheet — the one thing the role-not-family law forbids. §11 already promised Separator "a border token" that did not exist.

CSS 17706 -> 18017 gzipped (+311, the whole thing: the mark family across four scopes, the corner ceiling, the role token, the size join and the component). 60 mounted laws, 10 at the token layer.
## 2026-08-05 The docs are built out of the system, and dark SSR closes where it was due

The docs framework question ("undecided (Next/Astro/Vite)" since the scaffold) closed on a stance, not a comparison. Kushagra, on Mintlify and Fumadocs: a UI design system shouldn't have its docs built on another system — if those were good enough, KookieUI wouldn't need to exist. So the decision has two halves: **bare Next.js App Router is the rendering substrate, and every visible pixel is `@kookie-ui/react`** — no docs framework, no third-party UI, ever. A framework that renders whatever components it is given does not violate the stance; a docs product that ships its own components is a standing counterexample on the system's own homepage. Content is plain TSX until a content pipeline earns its place (a pipeline is not a UI system, so MDX later would not reopen this). The docs are thereby the system's first real consumer, which is the other reason to build them this way.

**Dark SSR resolved with the shape §18 had already retracted TO.** The server cannot know the visitor's appearance, so the HTML ships without one and a synchronous script in `<head>` stamps `data-appearance` on `<html>` before first paint — stored choice first, `prefers-color-scheme` otherwise. The root `<Theme appearance="inherit">` stamps every axis *except* appearance, so the scope the script writes is the only source of truth. The script owns `data-contrast` too, and that is load-bearing rather than tidy: the generated high-contrast selectors are `[data-appearance][data-contrast]` on ONE element (§7 — Theme normally co-locates them), and a Theme with inherited appearance stamps no appearance at all, so contrast stamped on the Theme div could never match in dark. Hydration is safe by construction — the appearance store is `useSyncExternalStore` over the same localStorage keys, with server snapshots that render the toggles neutral and correct on the client without a mismatch; system mode tracks `matchMedia` live. Verified in a real browser: stamped before paint, survives reload, dark+high co-locate.

**Being the first consumer earned two findings inside the first hour.** A Box sitting where its parent shrink-to-fits it — a row-flex item, the most ordinary header composition there is — collapses to width 0, because every Box is `container-type: inline-size` for the tier mechanism and inline-size containment sizes an element as if it had no contents; the generator's own comment had always named this for Theme, and nobody had asked about Box. Recorded in DECISIONS' open questions with the taught escapes (`flexGrow` takes width from space distribution — the one sizing route containment leaves open — `width` states it; column items stretch and are safe). And a Button rendered as an anchor wore the UA's link underline into the control dress — the audit had fixed the anchor's semantics and never asked about its clothes; fixed in the skeleton (`text-decoration: none`, +5 bytes, computed-value law in the render-composes suite). The judging matrix at `/matrix` is the gate the density entry named — twelve heights across three levels "cannot be judged by reading a config file" — now standing: size × density per pointer world, radius/pointer/surfaces/contrast switchable in place, the tone × emphasis board, the type ramp.

Rejected: Mintlify/Fumadocs (the stance above); appearance mirrored into React state or context (a second source of truth and a guaranteed flash — the html attribute IS the store); `data-contrast` on the root Theme (can never match in dark, above); Astro despite being the site's own choice (these docs exercise React components and close a React hydration debt — the substrate follows the components, and REVIEW had framed the debt in RSC/`"use client"` terms from the start).

## 2026-08-05 A material is a pane with four parts, and only one had been designed

Kushagra, on the preview's glass cards: thin material as blur plus the ordinary card border reads "cheap — the border looks slapped on." It was. The material owned only its body (the alpha mix and the filter); its edge came from the tone system (opaque step-7 pigment on a translucent pane), it had no lighting, and no relationship to depth. The missing parts were being filled in by systems designed for opaque, in-flow surfaces — which is exactly what cheap looks like.

Three parts landed, each per thickness and mode, all v0. The **edge** is now the material's own translucent white hairline (`--material-<t>-edge`), consumed with a `var(--tone-border)` fallback that resolves at the element — closing §10's long-open "does the material border stay opaque" question with the platform answer it had already sketched. The **rim** is a top inner light catch, painted as a `background-image` gradient deliberately rather than a shadow: the first cut composed it into `box-shadow` and ran straight into `none` being illegal inside a shadow list — flat worlds declare `none` — which would have meant rewriting every "computed box-shadow is none" law; a background layer keeps the one-box-shadow law untouched and cannot leak into nested cards, since `background-image` is a real property, not an inherited custom one.

**Separation was welded to the glass for one hour and then given back to the app.** The first cut had every pane compose `var(--shadow-2)` on its own authority — "a pane with content behind it is above it, flat world or not." Kushagra called it: the persistent elevated look overrides the `surfaces` identity. Rim and edge are what the material IS; depth is what the app SAYS. Glass in a flat world now has edge and glint, no lift; the elevated world lifts it like everything else.

**High contrast leans on the glass rather than unmaking it** — his second catch, same session. The first cut reused the reduced-transparency fallback (95%) and collapsed all three thicknesses into one near-opaque slab. Each thickness now carries its own designed `alphaHigh` triple — more opaque, never fully — and the edge and rim empty so the border returns to the tone system, the one place the contrast setting can reach it.

Tried and declined the same session: **fading blur** (the frost dissolving top-to-bottom with the light, one masked `::before`) — built as page-CSS-only in the preview, judged, reverted. Recorded because the technique is real and cheap if scroll-edge chrome ever wants it at Shell.

Rejected: the pane carrying its own `var(--shadow-2)` (above — reversed on sight); rim as `box-shadow` (the `none`-in-a-list trap, plus custom-property inheritance into nested cards); one fallback alpha serving both high contrast and reduced transparency (two preferences, one designed answer each); leaving the edge on the tone border for `contrast="high"` reachability alone (the setting now gets it back by emptying the material edge, which is strictly better than never having a designed one).

## 2026-08-05 A textarea's frame is the inset — the one-row-equals-TextField identity is reversed, same day it shipped

TextArea shipped with its block padding DERIVED from the height token — `(h − line − 2·border)/2` — so a one-row textarea sat exactly where a TextField's value sits. Kushagra caught the cost in the preview within hours: with a second line, that residue stops being invisible centering and becomes the visible top margin of a paragraph — 13px at the sides, 9px above in the coarse world, an asymmetry nobody designed. The diagnosis that closed it: **centering leftover is not an inset.** In a fixed-height control, the vertical space is residue the eye never judges; in a grown box the eye reads a frame and expects the four sides related. One number was doing two jobs and only one had ever been chosen.

Three candidates, two rejected on the record:

- **A compromise value between the residue and the side padding** — rejected by Kushagra outright: worst of both worlds, fixes neither the frame nor the alignment, and mints a third unexplained number.
- **Keeping the identity** — died on the use-case audit. Every real textarea is a multi-row paragraph (comment, description, ticket, address, commit body); a one-row box is what TextField is for, and the chat composer — the one genuine one-row-that-grows case — is its own component with more props and its own needs, not a reason to bend the paragraph control.
- **What shipped: block padding IS the side padding.** One inset, all four sides, no new number. The one-row law is deleted; the size index still joins every non-height fact (law amended to say exactly that); a `rows={1}` textarea sits taller than a field, accepted.

**No exception for roundness** (Kushagra: "lets try with no exception"): at `full` the pill bump stays horizontal-only, so radius never buys height. The bump corrects text running *sideways* into the corner at its widest swing; vertically the curve has flattened to under half a pixel at the x where text starts. Flagged for the eye pass — a rounded textarea's top corners are the case to judge — and the preview note points at it.

---

## 2026-08-05 The capsule is half the height TOKEN — full's control band states the rule instead of riding the clamp

Kushagra caught it in the preview the day TextArea shipped: at `radius="full"` the three-row textareas were stadiums — corners scaling with the box, the first line of text deep inside the curve. The control band priced `full` at 9999px and let CSS clamping find the capsule, and clamping asks the *rendered* box: right for every control whose height is its token's, wrong the moment one grows, which TextArea does by design (§4's non-fixed-height class — so every future growing control inherited the bug).

Two fixes were argued and the first was refuted in review: a `min(radius, h/2)` cap in text-area.css states a true rule in one component's stylesheet — a system gap patched locally, the token still lying about what it means. The precedent that decided the layer was Card's: the surface band never had this bug because `full` re-prices it to designed corners at the *palette* level. The control band now makes the same move — the generator emits `--radius-control-N: calc(var(--control-height-N) / 2)` in every full cell, beside the heights it halves (substitution-at-declaration, each world's own ladder). Fixed-height controls render byte-identically — 9999 was only ever a trick to reach h/2 — and TextArea is correct with zero CSS of its own.

One visible change accepted knowingly: a pill control whose label wraps (200% zoom, WCAG 1.4.4) used to stay a full stadium and now keeps h/2 corners — judged more correct by the same principle (a corner must not scale with accidental height). Rejected alternatives: exempting TextArea from full (breaks the one-row ≡ TextField law) and giving it the surface band's answer (breaks the same law the same way). The raw palette steps 1–5 keep 9999 as a §13 escape; the old law that pinned the literal `9999px` is rewritten to assert radius = height/2 — the literal was the bug's spelling.

---

## 2026-08-05 The semantic core completes: success, warning, info — each a family, none an alias

Kushagra, closing the open question the docs had carried since the tone set was born ("do success/warning/info earn system-tone status, or stay app-defined?"): the set completes. The forcing was his product call rather than a component landing first — scrutinised and accepted: status names are universal and stable, so the shipped-early-gets-squatted risk that killed Card's slots does not apply to them, and the widening was already unblocked by the amber finding (below).

**Each name ships as its own generated family resolving to a pigment already judged and law-passed:** success on green's hue (150), warning on amber's (80 at vividness 0.9), info on blue's (250). Not aliases into those families, though today they render identically — names are meanings, and a meaning must stay independently correctable: success can drift toward teal someday without `green`, a colour-as-data name, moving with it. The accent/blue pair set the precedent (same hue, two names, two jobs), and gzip absorbs duplicate scales well. Ten tones total; +~2.9KB gzipped for the three.

**Warning is the amber question answered.** The 2026-08-04 position was that warning could not ship without either orange standing in or a generator exception; the day amber earned membership (below), warning stopped needing either.

Rejected: aliasing the semantic names onto the data families in the tone indirection (saves bytes, welds two meanings to one correction knob — the action-at-a-distance §7 already refuses across tones); waiting for Callout/Toast to force each name (the principled default, overridden knowingly — the names are not speculative the way Card's slots were); warning-as-orange (a stand-in with a recorded expiry, expired).

## 2026-08-05 Amber joins at vividness 0.9 — the refusal was real, but the input space was not exhausted

The 2026-08-04 entry recorded amber as unable to ship: hemmed at its cusp in both directions, refused by the state-separation law, waiting on "a designed exception" in the generator. Chasing Kushagra's tone-set widening reopened it, and the finding is that no exception was ever needed — **the failure was specific to full vividness, and vividness is a designed per-tone input the first attempt never varied.**

The mechanism: at vividness 1.0 the chroma curve asks for everything hue 80 holds, which parks the resting solid exactly ON the sRGB cusp. From the cusp, any lightness move sheds chroma steeply, the mud-guard (states keep ≥75% of resting chroma) halts the travel at .032, and the .035 separation floor refuses it — by .003, which is why the preview looked fine while the law said no: a 0.003 lightness step is precisely the "nearly visible feedback" the floor exists to catch. At vividness 0.9 the fill sits 10% off the cusp, the same excursion affords .035+, and every law passes in both modes and both contrast levels. Sitting slightly off maximum saturation is what buys the visible press state; that trade IS the fix.

Why amber still reads softer than indigo, recorded so nobody chases it: yellow's saturation lives at high lightness (dark vivid yellow is brown — it does not exist), blue's lives at low, and one shared lightness ladder means each hue keeps only what the gamut holds at that depth. §7's saturation-for-lightness trade, visible for the first time with both hues in one sweep. Radix has the identical asymmetry and hides it by hand-placing every scale.

**Rejected: carrying the light pin into dark (Radix's own move — their dark amber 9 is byte-identical to light).** Kushagra spotted it in their dark palette, it was measured viable (a pinned #FFC53D passes every light law at full vividness; only our re-derived dark fails), and the fix was scoped: let a pin carry to the dark solid band. He chose the hue-80 v0.9 row by eye instead — config only, dark stays dark-tuned. The carry stays recorded here as the known route to a brighter amber if taste ever wants it. Also rejected: every pinned amber tried (#FFC53D, #FFB224, #F5A623, #FFAE00, #EFA400 — all fail dark separation, because a pin derives full vividness and dark re-derives from it), and the pin-plus-vividness-override hybrid (passes at 0.85, but needs an intake extension the chosen answer doesn't).

## 2026-08-05 The exports map gets its promised validators, and "leaning ESM-only" stops leaning

Prompted by "is the repo set up well": Part III of the planning doc named `publint` + `are-the-types-wrong` as the package-output validation, and neither was installed — while the repo had *already shipped* both failures they exist to catch (2026-07-31: a content-hashed d.ts the exports map did not name, and stripped `"use client"` directives; the build's assert-own-files check was the partial cover). Both now run against the **packed artifact** at the end of every build (`pack:check`), so the exports map is verified rather than trusted, and the gate rides CI. Mutation-checked: pointing `exports.types` at a file that does not exist fails by name. ENGINEERING §1.6 carries the standing rule.

**The decision inside the chore: the module-format lean became a stance.** The spec said "ESM-first, leaning ESM-only (dual if adoption reach matters)." Validating under attw's `esm-only` profile closes that: node10 resolution and `require()` are now *formally* the unsupported paths — reported as ignored in every build log rather than silently untested. Reopening means changing one flag, but from this point shipping dual is a decision someone must make, not a drift that happens. The `styles.css` subpath is excluded from attw only because attw can exclusively type-resolve JS; publint still covers the file's existence.

Rejected: a separate CI step instead of the build tail (the build is what packs — a check that can be skipped by running the build alone re-creates the claimed-versus-actual gap the audit closed); validating the source tree instead of the packed tarball (the 2026-07-31 defects were only visible in the artifact); the strict profile (it fails ESM-only packages on node10/CJS by design, which would force dual output nobody decided to ship).

## 2026-08-05 TextArea: one element, because the anatomy criterion answers twice; padding derived, not designed

Repetition's second entry, and three questions inside it were genuinely open:

**Wrapper or bare element — the anatomy criterion, applied twice with two answers.** TextField's wrapper is forced: a slot puts an icon inside the border, the border must leave the `<input>`, and the wrapper then owes the caret redirect, slot layout and hosted-control focus. TextArea was decided by asking the same question, not by copying the neighbour: it has no slots — an adornment floating over a scrolling paragraph is not a designed position — so nothing non-visual forces a second element, the border stays on the `<textarea>`, and every wrapper debt never exists. The temptation rejected was symmetry ("the field family shares one anatomy"); the criterion outranks the family resemblance. The stylesheet consequence is accepted and bounded: text-field.css's facts repeat self-keyed in text-area.css because the field's selectors are structural (`:has(> .kui-field-input …)`) and this component has no child to ask — the THIRD field-shaped control is the signal to promote the family into the shared layer, not the second.

**The block padding is derived — the one place the system's anti-derivation stance inverts.** §6 rejects derived values where the number is taste (radius-from-height). Here the number is a geometric identity BETWEEN two components: a textarea sits beside fields in a form, and its first row must sit exactly where the field's value sits. `py = (height − line − 2·border) / 2` makes that true at every size in every world by construction; a designed number would be the same four values today and free to drift tomorrow. Taste has no opinion for the identity to override — when it does (the eye pass), the identity is the thing to re-judge, not the values.

**`resize` is a stylesheet default, not a prop.** Vertical-only (horizontal resize makes the element wider than the column that owns it — the one axis that breaks the layout around it); `none` and `both` are one `style` away. A `resize` prop was considered and refused by §3's own rule: a prop earns a row only if it adds something raw CSS lacks, and this one would rename a CSS property.

Also closed: the disabled remap's third arm (`.kui-control:disabled`) for the control that IS the native form element — no stamp, the native attribute is the one truth both routes land on; and the type refusals (`children` — React's form contract is `defaultValue`; `cols` — the field's `size` argument verbatim; `render` — the element cannot move). Cost: **+91 bytes gzipped**, against TextField's +247 and Button's +1,206 — the additivity curve, third point.

---

## 2026-08-05 Two width vocabularies, and they are correct — a window is unique, containers are legion

Raised immediately after §18 shipped: tiers say `sm / md / lg`, window classes say `narrow / regular / wide` — two word-families for width, and `md` and the narrow boundary even share 48rem. One vocabulary was considered seriously, and the unification is genuinely available: room words work as thresholds for the two upper tiers without inversion (`{ initial, regular, wide }` — "when this slot has regular-window room"), `initial` is the narrow state by mobile-first construction, and only `sm` (30rem, sub-class) lacks a name.

**Kushagra's argument killed it, and it is the better argument: normative words need a unique referent.** A window is one per app — "a regular window" judges one thing against one norm, so state words mean something. Containers are *everything* — a sidebar, a gallery, a pane — and "a regular container" is relative to expectations of the particular thing: a regular sidebar and a regular gallery are wildly different widths. Room words smuggle in a norm that containers do not share. `md` survives precisely because a T-shirt size is semantically empty — an absolute measurement label that means the same 48rem in a sidebar and a gallery, claiming nothing about what is normal for either.

So the vocabularies stay split, on principle rather than by accident: **states of the unique thing get normative words; measurements of the many things get size labels.**

**The number coincidence is recorded as coincidence, deliberately unpinned.** `md` = 48rem = the narrow boundary and `lg` = 64rem = the wide boundary — but tiers judge where *content* breaks and window classes judge where *shells* break, and the eye pass must stay free to move them apart. Deriving one from the other (the `narrowMedia` move) was considered and rejected: §6's sin is coincidence silently *relied on*, not coincidence existing. Nothing may assume a slot at `md` has "a narrow window's worth of room"; if the numbers ever need to agree by rule, that is a new decision, not this one.

---

## 2026-08-05 Window size classes: three, named for room, one boundary shared with the narrow band

The gap the tablet discussion surfaced (§17, LOG below) closed the same day, as §18. Three decisions inside it, each of which was genuinely open:

**Three classes, not four.** Kushagra opened at four (and the system does follow 3s and 4s). What settled it: a window class exists to pick the navigation shape — bottom bar, rail, sidebar — and there are three shapes. The platform survey said the same from both directions: Apple's two is the documented failure (rail and sidebar collapse into one "regular"), and Material's four-then-five is compensation for not having container queries — their "at 1600px add an inspector" is a *room* question our container tiers already answer in the pane that asks it. Three ships as a closed union with the tone set's widening rule: `expanded` joins the day a real shell forces it, not before.

**Named for room, never hardware.** `phone | tablet | small desktop | desktop` was on the table and was rejected with its own author's argument: users run apps in windowed mode, so device names lie — an app in half a 5K display would be "tablet" with no tablet anywhere, and a phone-preview canvas inside a desktop tool would be a "phone". Every platform that started from device names retreated to window-measured classes. The device question is `pointer`'s (§16, §17); the window class is pure room. `narrow | medium | wide | full` was also rejected (Kushagra: `medium` is not the middle of four, `full` is vague) — at three the shape resolves to **`narrow | regular | wide`**: blunt words, and the unmarked middle rung, material's habit.

**The narrow boundary IS the narrow type band's number, by derivation.** Not two thresholds that happen to agree: `narrowMedia` is built from `windowClass.narrowMax` in config, a law pins the derivation, and the shared word is the point — display type shrinks exactly when the app goes to one column, including at exactly 48rem (boundaries land downward, law-tested at the exact widths). This closes §17's "same numbers or independent" question as *same, mechanically*. The wide boundary opened at 64rem and moved to **75rem the same day** (Kushagra: 1024 is too small — and the arithmetic agrees: `wide` promises a sidebar, and at 1024 the content behind ~260px of sidebar is narrower than a narrow window). 80rem was rejected for where the boundary would *sit*, not what it would grant: exactly on 1280, one of the most populated widths in the wild — half of every 27" display, WXGA fullscreen — so the commonest desktop posture would flip shells with a pixel of drag. A threshold sits in quiet territory between populations; almost nothing lands exactly on 1200. Re-judged by eye when a real shell exists.

The mechanism is a hook, `useWindowClass()`, and deliberately NOT a token: no emitted declaration keys on a window class (law-tested), because a class picks a shell and a shell is components. SSR returns `null` honestly — the server has no window, and a guessed class paints a guessed shell. ~~The pre-paint stamp that would close that gap is the same debt dark-mode SSR carries, and the two are now formally one deliverable at apps/docs: one inline script, both answers stamped before first paint.~~ *Retracted same day — see the entry below.*

---

## 2026-08-05 The window half of the pre-paint stamp is retracted — false symmetry with dark mode

Same day as §18 shipped, Kushagra's standing rule — every claim scrutinised against standards — killed half of it. The recorded plan was one inline script at apps/docs stamping two answers before first paint: dark mode and `data-window`. The symmetry is false, and the window half fails twice:

**CSS never needed the stamp.** Media queries read the window width natively, before paint, with no script — it is the standard mechanism and the one our own type bands already use. `data-pointer` earns its attribute because *pinning* overrides what media queries would say; window pinning is deferred and may never land. Until it does, `data-window` duplicates a native capability.

**JS cannot use the stamp.** Hydration: React's first client render must match the server HTML, and the server rendered the `null` branch — so the first frame is the null branch no matter what an inline script stamped on the root. This is not a Kookie limitation; next-themes, the reference implementation of the dark-mode script, has exactly this shape — the script fixes CSS only, and its hook returns undefined until mount.

**The standard answer for a first-paint shell is CSS-shaped**: both navigations in the HTML, the exported boundary queries picking which shows. No JS decides layout, so nothing flashes. The hook serves post-mount decisions — what to fetch, what to route — which is what a runtime signal is for.

What survives: the dark-mode inline script, alone — the industry-standard fix (next-themes, Tailwind docs), and needed only because `appearance` can be authored rather than system-followed; pure system-following is plain `prefers-color-scheme`. The `data-window` attribute is no longer reserved; it exists the day pinning does, as pinning's mechanism, or never.

---

## 2026-08-05 A pill pads wider — but only on an edge where text meets the curve

Kushagra, judging the preview at `radius="full"`: on buttons and fields without a leading icon, the text sits too close to the left edge, and the fix should be system-wide. Then, on the first cut, the refinement that turned out to be the whole design: a side holding an icon or a hosted control needs no correction — the password field (bare text, trailing Show button) compensates only its left edge; the search field (leading icon, trailing Clear) compensates neither.

The cause is geometric, which is what makes this the system's job rather than a call-site taste knob. Padding is measured at the vertical midline, where a pill is at its widest; the eye judges the gap at the text's cap line and baseline, where the corner curve has already swung inward. At `medium` radius the encroachment is sub-pixel where the text lives; at `full` the radius is half the height and the label reads crammed against a curve that the same padding clears perfectly at every other level. His intuition — pad by half the height, so the text starts where the straight walls start — is the classic capsule rule and the safe maximum; the placed values sit just under it (~0.40–0.44 of the box), because full half-height overshoots at the large sizes.

**The mechanism: a second designed number per cell, identity everywhere but `full`.** `pxPill` joins `height` and `px` in every (density × pointer) set; `--control-px-pill-N` resolves to `var(--control-px-N)` at every radius level (re-declared wherever `px` is — substitution-at-declaration) and only the full cells state raw values. Unlike the control radii there is no palette indirection to carry the level into a pointer world — the radii ride `var(--radius-step)` and the full palette re-prices the step, but a raw length has nothing to ride — so the full cells exist per pointer world too, and a mounted law pins the coarse cell precisely because a missing one would silently fall back to the fine value.

**Per side, read off the DOM.** The skeleton now pads each inline side independently; a side whose direct child is a `[data-slot]` wrapper resets to the plain padding, and the field's hosted-control rules still tighten past that to the slot inset. Which required Button's slots to *wear* the wrapper — they were bare children, so the stylesheet could not see them — and closing that hole closed a second one for free: §4's hosted-control geometry (`.kui-control > [data-slot]`) had only ever worked in TextField, so a control in a Button's trailing slot was silently unsized. One spelling for the adornment wrapper, everywhere (ENGINEERING §3's `data-slot`), and the `filled()` slot predicate moved to the shared layer since both components now ask it.

Rejected: a `calc()` off the radius or height (a ratio nobody chose is not a design — the slotInset/radius lesson, third time); re-declaring `--control-px-N` itself under full (the slot sides need the plain value to fall back to, and a wholesale re-declaration erases it); half the height as the value (right rule of thumb, wrong at size 4, where it turns padding into a third of the control's width); compensating every side regardless of slots (pushes an icon visibly off its edge, which is the complaint mirrored).

## 2026-08-05 The device prop is dropped — coarse means handheld

Kushagra, on being walked through what `device` survived on after the split: "I'm not designing for kiosk and POS terminal." And that was the prop's whole remaining justification — the two cases where "the primary input is a finger" and "the screen is close to a face" disagree, which no media query can tell apart.

Strike those and the prop was indefensible on three counts:

- **It had no consumer.** Its auto signal asked exactly the question `pointer` asks, so in every product actually being designed for, nobody would ever set it.
- **The name wrote a cheque the implementation didn't cash.** A prop called `device` set four font sizes and nothing else — no targets, no spacing. Someone setting `device="handheld"` expecting a mobile mode would get bigger paragraphs and identical buttons.
- **It held two spellings open.** The prop said `handheld`, the band said `held` — the same two-spellings debt just paid off on Button's `icon`/`iconEnd`, one day old.

So: the band is renamed `handheld` (Kushagra: the better word regardless, one word everywhere), the prop, its type, its `data-device` attribute and its emitted scopes are deleted, and the band now rides the POINTER axis's own `[data-pointer]` scopes — its steps are emitted inside the pointer world blocks. Pinning `pointer="coarse"` forces the whole coarse world, geometry and reading type together; `pointer="fine"` is the escape and re-declares the identity steps. The preview's pointer select judges phone type now; its device select is gone. Neither world touches the narrow band's steps — a pointer says nothing about width.

Two laws changed meaning with it, deliberately: "type never takes density or pointer" is now "type never takes density" (pinning pointer legitimately moves the reading steps — that is the point), and §16's "coarse world never touches type" became "the coarse world's type declarations are exactly the handheld band's".

**To bring it back** — a touch screen genuinely operated from a distance: re-add the Theme prop stamping `data-device`, emit the band under `[data-device="desktop"|"handheld"]` plus `@media (pointer: coarse) { [data-device="auto"] }` instead of inside the pointer worlds, and restore the pointer-invariance law. The commit before this one carries the complete working mechanism; this entry is the pointer to it.

---

## 2026-08-05 One type band was doing two jobs, and Apple's own table is what showed it

Kushagra, on the question of whether iPads need their own band, with a screenshot: Apple's page is titled **"iOS, iPadOS Dynamic Type sizes"** — one table for both platforms. Body is 17pt on an iPhone and 17pt on an iPad.

Which quietly demolishes the width half of our rule. The `handheld` band (shipped 2026-08-04) fired on `(pointer: coarse) and (max-width: 48rem)`, and the *cited* justification for the band was "HIG: iOS body 17pt against macOS 13pt" — a **touch platform vs desktop platform** contrast. The width gate silently converted that into **phone vs tablet**, a split the source does not make. And it did not even make that split well: a 13" iPad Pro is 1032px portrait and 1376px landscape, the 10.9" is 820px, so at 768px the gate separates an iPad mini in portrait from every other iPad. That is where a threshold landed, not a boundary anyone chose.

Chasing the fix exposed the real defect, which was structural rather than numeric. **The band was doing two unrelated jobs:**

    reading steps 1-4 ROSE    16 -> 18   because a held screen is close to the eye
    display steps 8-9  FELL   56 -> 40   because a narrow screen is seven characters wide

Viewing distance and line length. Different questions, different answers, welded to one signal — so the middle of the range came out wrong in both directions. A tablet lost a rise it should have had, and a squeezed desktop window kept 56px headings though the line-length argument applies to it identically.

So: two bands. `held` on `(pointer: coarse)`, `narrow` on `(max-width: 48rem)`. Each emits only the steps it MOVES, which is what lets them coexist — held owns 1-4, narrow owns 8-9, steps 5-7 are nobody's, and neither can silently overwrite the other on a phone where both apply. The generator derives the moved set from the picks, so tuning a pick moves the emission with it.

Two consequences worth recording.

**`device` stops being an axis and becomes an escape.** Its auto signal now asks exactly the question `pointer` asks. It survives on two cases no query can answer: a touch-only kiosk or wall display (coarse, held by nobody, read from two metres, wanting *bigger* type), and a POS terminal that wants coarse targets with desk-distance text. Without the prop, type and targets are welded and neither is expressible. §17's framing as "the third device-facing question gets its own signal" is now overstated and has been rewritten.

**There is no tablet band, and the thing Kushagra was actually reaching for is a different deliverable.** Figma-on-iPad ships a reduced interface — but sort what differs and it is: which features exist (a product decision), navigation shape (width), tap targets (the pointer axis), and type (where Apple says tablet equals phone). Nothing is left for a band to hold. What IS missing is a **window-level size class** for app-shell composition: our tiers are container-keyed on purpose, and "which interface should this app show" is a viewport question the system currently cannot answer. Recorded as open, shaped like Material's compact/medium/expanded.

Rejected on the way: **`any-pointer: coarse`** as the held signal — it means "touch exists somewhere on this machine", so it would permanently inflate a mouse-driven touchscreen laptop and override density, an axis built precisely so people could choose airiness. `pointer` tracks how the machine is being used now: flip a 2-in-1 into tablet mode and it becomes coarse, flip it back and it does not. That also closes §16's long-open `any-pointer` question for geometry, with the same answer — capability is not use.

One test-infrastructure note, because it was a live falsification: the browser suite's viewport was under 768px, so the moment the narrow band existed every law that read a step-9 size was silently asserting against the narrow world while claiming to test the base palette. The viewport is now pinned wide, and the narrow band has its own laws that resize the page for real.

---

## 2026-08-05 Two layers were writing to the same private names, and one of them was Box

`--kui-h` was the control layer's height stem AND the layout mechanism's stem for Box's `height` prop. So were `--kui-px` and `--kui-py`, against Box's `px` and `py`. Three names, six meanings.

This is not a tidiness complaint. The layout mechanism registers every one of its stems `inherits: false` — correctly, so a Box's padding does not leak into its children — and that registration applies to the NAME, not to the layer. So `--kui-h` was silently *absent* on any element that did not declare it, which is exactly why the hosted-control geometry needed two hops: the container had to compute the height and hand it to the slot, because the slot could not read the container's `--kui-h` at all. That was the second thing the collision broke; the size join leaking the whole control family onto every Card was the first, and it was fixed at the symptom in the 2026-08-03 audit by scoping the selector, leaving the name shared.

The control layer now wears `--kui-ct-`, which is the convention the surface layer already had (`--kui-sf-`). With the names distinct, the slot can simply read the container's height and the second hop is gone — one registered property deleted, and the mechanism reads the way it should have.

`--kui-border-color` stays shared, on purpose: `[data-bordered]` is written once and read by both `.kui-control` and `.kui-surface`, because containment is one idea. So the law is not "no shared names" — it is the narrower one that could not have been satisfied by accident: **nothing outside the layout mechanism may so much as MENTION a name the layout mechanism declares.** Mention rather than declare, because reading a stem you do not own is the same defect from the other side, and `--kui-py` was precisely that — read by the control skeleton, declared by Box.

Two laws had to learn to strip comments to make this work, and the reason is worth recording: these stylesheets explain why a rung, a family or an abandoned stem is *absent*, which means writing it down, which made both laws fire on their own documentation. The cheap fix each time is to delete the sentence. That is the wrong direction for a codebase whose comments are the argument, so the laws now read code.

---

## 2026-08-05 The iOS zoom hole was bigger than the size 1 everyone had pencilled in

Safari zooms the whole page when a text input under 16px takes focus — the layout shifts off-centre and the user pinches back. It is the only way a control in this system can break the page *around* it just by being tapped.

The device axis (§17) was recorded as having mostly closed this: the handheld band lifts size 2 to 16px, so "sizes 2+ are safe on a phone, size 1 is the known edge." The first half is true and the second half was wrong. An iPad in landscape is past the handheld conjunction's 48rem threshold, so it resolves as `desktop`, takes the desktop type ladder — 14px at size 2 — and Safari zooms on the default size of the default control. The axis that was supposed to answer this is optical (where the screen sits); the question is motor (a finger is touching it). Wrong axis.

So `--input-font-floor` rides the POINTER world: 0px on fine, 16px on coarse, and the input's font size is `max()`ed against it. It lands on the input alone — the box keeps its designed height, the label its designed step — so a size-1 field is still visibly a size-1 field, and the control≡type parity the size index rests on is untouched.

**Rejected: lifting the handheld type ladder so size 1 renders 16px.** It fixes one control by making the caption step unusable — a phone that cannot render small secondary text has lost more than it gained.

**Rejected: a bare `@media (pointer: coarse)` rule.** Same rendered result, but it would be the one geometry answer in the system that cannot be pinned, escaped, or read as a computed value through `<Theme pointer>` — which is how everything else in the pointer axis works and how it gets tested.

---

## 2026-08-05 readOnly was a prop that resolved to nothing

`<TextField readOnly />` was fully accepted, refused keystrokes, and looked pixel-identical to the editable field beside it. The only feedback was typing and having nothing happen.

The temptation is to reach for the disabled treatment, and it is wrong: a read-only field is live. Its value is selectable, copyable, focusable, in the tab order, and submitted with the form. Exactly one thing is gone — the invitation to type — so exactly one thing changes: the **seal**, which is what makes a field read as a well you put a caret into. Border, text contrast and the caret cursor all stay, because each of them is still telling the truth.

One trap, and it is CSS's: `:read-only` matches anything that is not `:read-write`, which includes a *disabled* input. Without `:not(:disabled)` every disabled field would lose its fill on top of the disabled remap — two states painting one box.

Closed at the same time, from the same audit: `type` became a closed union. On the native element `type` is not an axis but a component selector, and unconstrained it let `type="hidden"` render a visible empty bordered box — the wrapper draws the border and the height, and it cannot honour a type nobody told it about. And slot content now DESCRIBES the field through `aria-describedby` rather than floating beside it unlinked; described rather than labelled, because an adornment qualifies the value and does not name the field.

---

## 2026-08-05 Control padding leaves the space palette — the radius bug, one family over

Kushagra, judging the preview: "in both text field and button, at size 2 to size 4, the horizontal padding seems a bit too much." He was right, and the interesting part is *why* it was too much, because the answer is a mistake this system had already made once and already fixed once.

`--control-px-N` was a step index into the space palette. The palette is a **layout** rhythm — a hybrid curve, near-linear at the bottom and geometric at the top — so through the band controls actually live in (8, 12, 16, 24) it grows about **1.44x per step**, against a control height ladder that grows about **1.20x**. Two ladders climbing at different rates, joined by a shared index, cannot hold a ratio between them. Measured across default density: padding ran **0.286 -> 0.375 -> 0.400 -> 0.500** of the box. Size 4 was carrying half its own height in side padding, and v1 of this system used a flat 0.375 — so the top of the ladder was 33% past the project's own reference constant while the bottom sat under it.

Coarse/comfortable was worse and gave the game away: it needed a fifth step past 32 and the palette had none, so it repeated one — `[16, 24, 32, 32]`. A size-4 control padded no wider than a size-3 control, shipped, with no law that could see it.

This is section 6's capsule bug in a different family. Radius climbed with the size index until size 4 read as a pill; the fix was to hold it near a constant fraction of the box, and the mechanism that made that possible was **widening the radius palette inside the control band** — that is what the extra step at index 10 exists for. Space cannot take the same fix: inserting a step renumbers every layout pick, and `gap="6"` would quietly change meaning across the whole system.

So control padding joins `height` as a **designed raw number per set**, six sets of four. All twenty-four cells now sit in **0.24-0.38** of their box, and three laws hold it there: the band per cell, absolute monotonicity across sizes, and the compact < default < comfortable ordering that height already had. Every one of them fails against the config that shipped — including the coarse/comfortable repeat, which is exactly the kind of defect that survives because no law was ever pointed at it.

**Rejected: adding a step to the space palette.** It fixes the resolution and breaks the meaning of every layout number in the system, to serve one family that is not a layout family.

**Rejected: a fraction of the height, computed.** Same objection Kushagra raised against a computed `slotInset` the day before — a ratio nobody chose is not a design — and the same reason radius is *held near* a fraction by designed points rather than derived from one.

Not a violation of "reference, never restate" (section 6): there is no palette entry being restated. What the rule forbids is a component knowing `12px`; `--control-px-N` is still the only name any component may use. It does now carry `--scale` directly instead of inheriting it from the space token, which a law pins — a raw length emitted without it would have dropped control padding out of the one geometry that answers the scale escape.

Size 4 came down 24 -> 16 (-33%), size 3 16 -> 13, size 2 12 -> 10, size 1 unchanged. v0, like every number here, and now correctable per cell instead of per palette step.

---

## 2026-08-05 A field's ring answers "is the caret here", not "is focus anywhere in this box"

Fallout from making a hosted control a first-class pattern the day before. The field rang on `:focus-within`, which fires for **any** descendant — and the descendant is now routinely a button. Tabbing to a clear button lit the field's ring and the button's own `:focus-visible` ring, one nested inside the other, saying two different things at once.

The framing problem underneath is the more important one. Section 8 defends the field's departure from `:focus-visible` on the grounds that *a field's focus is a mode*: you do not press a field, you enter it, and the box has to say where your keystrokes land. A ring that fires when focus is on a button inside the box says something that is not true. It was a correct rule asked a question it was never meant to answer, and the fix is to ask the right one: `:has(> .kui-field-input:focus)`. The border still belongs to the wrapper; the ring still encloses the slots; a hosted control rings itself, like any control.

Rejected: excluding slots from `:focus-within` with a `:not(:has(...))` arm. Same rendered result, but it states the rule as a list of exceptions to a question that is still the wrong question.

---

## 2026-08-05 Two things a field claimed about itself that its CSS did not deliver

Both from the TextField audit, and both the same shape: a comment asserting an invariant that half the mechanism did not honour.

**A glass field's fill did move.** text-field.css pins all three fill *sources* to `--color-surface` and says, in a comment, that a field's fill does not move at all — the border and ring carry its states. True of the sources. But material is a **fill modifier** (section 10): it mixes the source toward transparent on a ramp of its own — rest, hover, active — so the thing that moved was the mix, not the source. At the middle thickness in light that is 64% -> 72% -> 80% of the same white. The trailing button was enough to fire it just by being crossed on the way to the caret. Fixed by pinning the *derived* hover and active fills to the resting derived value, which names no thickness — a fourth one would not touch the rule. Deliberately unguarded: where nothing derives a fill the reference is invalid at computed-value time, the property falls to the guaranteed-invalid value, and the shared layer's own fallback chain takes over exactly as before.

**A `Field.Root disabled` field looked entirely live.** The component stamped `data-disabled` from its own prop and the comment claimed that was sufficient "because we own the prop". It is not — Base UI computes `fieldDisabled || disabledProp` at the *input*, so inside a disabled fieldset the flag never passes through this component at all, and the element that paints was never told. The identical problem was solved for `invalid` one line away, in the shared layer, with `:has()`. It now reads `disabled` the same way. Direct child only, because a disabled clear button is a grandchild and a field is not disabled because something inside it is.

The audit's own summary of the 2026-08-03 sweep applies unchanged: a law that reads the component's attribute instead of the browser's computed value is one indirection short of the thing that can be wrong. Both of these had laws. Neither law asked the engine.

---

## 2026-08-04 A control inside a control, and the mapping the call site was being asked to invent

Kushagra, on the preview: the Show and Clear buttons inside a field do not compose — they are the same height as the field. Measured, they were: 87.5% of the box in the two cells he was looking at, 100% under coarse at size 1, and 1px of slack in the composition a consumer would actually write (`<TextField trailing={<Button/>}/>`, both at their own default size). In that last case the field also **grew 2px past its own size token**, in 16/16 measured cells — `box-sizing: border-box` plus a hosted control that exceeds the content box.

His hypothesis — "perhaps size 1" — was already what the preview shipped, and it did not work. Dropping one index only ever buys 2-4px because adjacent heights are 4-8px apart, and **no size index in the ladder seats a hosted control with visible air**. That is the actual finding: the system had exactly one nesting rule (§10's "one glass per stack") and none for geometry, so a call site had to DERIVE the relationship — and the mapping it was asked to infer was non-uniform (2px, 4px, 4px) and undefined at size 1, where nothing in the system fits a 26px content box.

The space was also asymmetric by **13:1**. The sides came from `--control-px` (12px at size 2); the top and bottom came from whatever the height left over (~1px). Two numbers from two places, one of them nobody chose.

**One designed `slotInset` per size now drives all four sides**, and the hosted height is that inset subtracted rather than a second designed ladder that would drift out of agreement with the first. Rejected: a fraction of the container (~0.7) — Kushagra, "I don't like fraction" — and the ladder had already learned that lesson with radius, which is deliberately held near a constant fraction *because* letting it climb made size 4 read as a capsule. A designed number per size is what every other control quantity here is.

**Touch: the hit area matches the CONTAINER's content box, not 44.** Kushagra caught the flaw in targeting 44 directly — at coarse size 1 the field is 36, so a hosted control grown to 44 would be a *larger target than the thing containing it* and would overlap its neighbours in a stacked form, which WCAG 2.5.8 counts against you. Matching the container means the hosted control inherits whatever compliance its container already has, and size 1 keeps the one deliberate sub-44 compromise §16 already made rather than inventing a second one.

Two mechanisms this cost, both lessons this system has already learned once:

- `--kui-slot-h` and `--kui-hosted-height` are **registered lengths**. Unregistered, a custom property inherits as a token stream and `var(--kui-h)` inside it substitutes on the element that USES it — the hosted control, where `--kui-h` is that control's own height. Measured 24px at every field size, i.e. the container's size having no effect at all. Fourth instance of substitution-at-declaration, after radius, density and surface padding.
- The container computes and the **slot captures**, because the hosted control is also a `.kui-control` and re-declares `--kui-slot-h` from its own index. The slot is a plain span with no size join, so a value parked there survives.

Found on the way, and it is why the container must do the arithmetic at all: `--kui-h` is registered `inherits: false` by the layout mechanism, because Box's `height` prop shares the stem. So it is simply *absent* on the slot. The stem collision the 2026-08-03 audit flagged was fixed at the symptom (scoping the size join to `.kui-control`); the name is still shared, and this is the second thing it has broken.

**`iconOnly` ships with it, as a prop on Button rather than a second component.** v1 had a separate `IconButton` and it failed in a specific way: it was opt-in by memory, so people and agents alike reached for `Button` and got a pill where they wanted a square. One component cannot be forgotten. The glyph goes in `children` because for this button the glyph *is* the content, not an adornment beside one — spelling it through the leading slot would make that prop mean two different things depending on a boolean. And the prop is explicit rather than inferred from "has a glyph, no children" precisely so the type can demand an accessible name: an icon-only control with no `aria-label` announces "button" and nothing else, and here it does not compile.

**The adornment spelling closed at the same time**: Button takes TextField's `leading`/`trailing`. `iconEnd` is not RTL-correct, and a trailing slot holding a *control* is now routine rather than exceptional. The break is theoretical while the package is unpublished; two spellings would have been permanent.

Rejected: an `IconButton` component (above); inferring `iconOnly` (an unlabelled icon button would still compile); targeting 44 for hosted controls on touch (above); a `--slot-control-height-N` token family (24 declarations across six worlds restating a subtraction — measured 422 bytes gzipped — that one `calc()` does once).

## 2026-08-04 The invalid state was a hue rotation at constant luminance, and the ring drowned it

Kushagra, looking at the rendered preview: the invalid border is too light, and a validity state should read as high-emphasis. Both halves were right, and the measurements are worse than the complaint.

`--destructive-border` is step 7, and step 7 shares its lightness with every other tone **by law** — the shared-ladder test asserts exactly that. So the entire validity signal was a hue rotation at constant luminance. Against the field own fill: 22.8 -> 23.9 Lc in light (+1.1), and 10.3 -> **9.8** in dark. **Going invalid lowered contrast in dark mode**, and at constant luminance the state is close to invisible to a red-green colourblind user. Both modes sat far under the Lc 45 non-text floor the system already enforces on the focus ring — a floor adopted the previous day and never applied here.

The ring made it worse. On a focused invalid field the accent ring measured **6.4x** the visual weight of the error border it surrounded (2px at Lc 76.5 against 1px at Lc 23.9), so the error indication was at its faintest at precisely the moment the user focused the field to fix it.

**Both now read `--invalid-edge`**, one token picked per mode — `--destructive-solid` in light (Lc 65.4), `--destructive-11` in dark (65.2), because step 9 clears the floor in light and misses it in dark at 36.1. That is the same per-mode shape the focus ring itself took on 2026-08-03, for the same reason.

**This reverses §8 one-ring rule for the invalid state, and half of that rule defence was false.** §8 argued a destructive ring "would have to re-clear the APCA floor per mode — the trap the audit found in the dark ring." Measured, it does not struggle at all: destructive clears Lc 55-65 in both modes. What genuinely argued for one ring was consistency with Spectrum, Radix and Primer; that is real but outweighed here by two chromatic signals arguing on one control. **The rule survives for tone and dies only for state** — a destructive-tone Button still rings accent, and a law pins that. A tone is chosen; a state is not.

The related trap, named so it stays named: the fix is that invalid one *resolved appearance* is loud, **not** that loudness becomes selectable. An `invalidEmphasis` prop would be an axis nobody varies, which §9 calls a component fact rather than an axis — the reasoning that deleted the elevation axis.

Rejected: keeping the accent ring and thickening the border instead (the two signals still argue, and stroke width is not the variable that was wrong); a per-tone ring generally (tone is chosen, and the Spectrum/Radix/Primer convergence stands); an `invalid` emphasis rung (above).

## 2026-08-04 The tone set widens to six, and the widening catches the generator not following its own comment

Kushagra, closing the colour discussion: "a few basic families are fine, so the middle ground." The framing that got there: Radix's per-button colour is mechanically identical to kookie's `tone` — attribute plus variable indirection — and the only real differences are how many scales ship (Radix pre-ships ~30, ~29.3KB gzipped by v1's own measurement) and whether the names are pigments or meanings. The middle ground keeps the closed set and the config-only widening, and adds a small colour-as-data vocabulary — tags, calendars, charts, badges — where the colour IS the information and a status name would be dishonest: **blue** (hue 250), **green** (hue 150), **orange** (pinned `#F76B15`). Cost measured at ~1.15KB gzipped per family; `Tone` now derives from the config instead of restating it (the audit lesson — a local union literal kept holes invisible to CI).

**The first green failed a law, and the law was right twice.** The state-separation law (hover/rest/press ≥ .035 L apart) rejected every green tried, at the same ~.03 regardless of input — a systematic wall, not a bad pick. The cause: dark-mode solids sit at the hue's cusp, and the state-excursion code's own comment says "the direction is chosen by which way affords more of that travel," but the code implemented only a cliff-edge flip (change direction when the preferred side cannot even reach hover). A hue parked at its cusp kept the short side and compressed both states. Red and purple never exposed the drift because their away-from-label side always affords the full excursion — the §2-style lesson again, this time *inside* the generator: a comment is not a law.

**The naive fix failed the other law, which is the finding worth keeping.** Choosing the longer direction unconditionally spends label contrast — toward-label travel dropped amber's active state to Lc 55 against its black label, under the 60 floor. The landed rule: the flip is **gated on the label law** — taken only when every flipped state still clears APCA (60, or 75 under `contrast="high"`). Green passes the gate with room (67+ on every state); amber can afford neither direction (away washes out below the separation floor, toward breaks the label floor) and therefore **cannot ship as a tone**. Both laws hold unchanged; membership in the tone set is what gives. Amber joins the day the generator earns it a designed exception, not before — recorded in the config beside its absence.

Rejected: pre-shipping a palette (v1's 29.3KB, walked away from on measurement); pigment names as the general API (the semantic core stays semantic; the basics are data-vocabulary, a different job); weakening either law to admit amber (the separation floor is the interaction-visibility promise, the APCA floor is the legibility one — a colour that needs a law bent is not a colour the system has yet); hue-authored orange (at hue 55 the generated solid cannot hold a clearing label; the pinned value passes everything, and a placed number that works beats a generated one that does not).

## 2026-08-04 The device axis: type follows where the screen sits, and the third device question gets its own signal

Kushagra, from Apple's "Ensuring legibility" table (iOS body 17pt, macOS 13pt): text should respect breakpoints, "but not in the same way as coarse and fine — on a mobile, what you want is a larger font size." The observation is the dissociation that forces a third axis: `pointer` is motor (can a finger hit the box), this is optical (how far the screen is from the eye), and they come apart on exactly the devices that matter — a touchscreen laptop is coarse at desk distance, an iPad with a keyboard is fine at reading distance. §16 had left "whether body text shifts under coarse" open; the answer turned out to be that it was the wrong question — type never follows pointer at all.

**Shipped as §17.** Theme prop `device: desktop | handheld | auto`, the pointer axis's exact shape: auto follows the platform, pinning forces a band (and is how phone type gets judged on a desktop — the preview grew a device select). The auto signal is a **conjunction**, `(pointer: coarse) and (max-width: 48rem)`: coarse alone is the touch laptop, narrow alone is a squeezed desktop window whose boxes did not grow; both together is a screen held in a hand. This does not reopen §16's width rejection — geometry still never reads width; the conjunction gates type and, later, the interaction-model adaptations (dialog→sheet) that THESIS Part II promises and that had no signal to key off until now.

**The band is a re-pick of indices, non-monotonic by design.** Handheld maps each step to a new index into the three paired palettes, so every rendered step stays a designed triple. Reading sizes rise one index (body 16 → 18, against the HIG's 17pt), the middle holds, display sizes come *down* — 56px on a 375px screen is seven characters a line, so "bigger on mobile" as a multiplier is wrong at both ends. Steps 4/5 and 7/8 collapse on a handheld, the price compact already pays in layout space. A found constraint shaped the mechanism: re-picking *within* one token family via `var()` is impossible (handheld maps step 5 onto its own name, and a self-referencing custom property is IACVT, taking the whole chain down), so a band re-prices the palette in place with raw values from the same config source — the radius-level mechanism (§6), one family over. No second token name, because raw type has no legitimate consumer the way raw space does: `--font-size-N` stays the one spelling and no consumer learns a band exists.

**Control labels follow for free, and the claim finally has its law.** The session opened with me asserting the control join dropped letter-spacing — false; tracking shipped with Button, and the grep that "found" the bug never searched for it. What was genuinely missing was the *law*: control≡type parity (same computed font-size, line-height, letter-spacing at every size, both bands) is now pinned in the mounted suite, so "one definition of what a size step means" is a guarantee rather than a reading of the file. A quiet dividend: the handheld band renders size 2 at 16px, which stops iOS's zoom-on-focus for the default-adjacent field sizes with no floor mechanism and no broken size promise; size 1 stays exposed, recorded open.

Rejected: pointer alone as the signal (the touch laptop gets phone type); width alone (the squeezed window's boxes did not grow); a scaling multiplier (wrong at both ends of the ramp); per-prop device tiers à la Tailwind's `sm:` (the system owns device adaptation, opt-out — THESIS Part II; per-prop device intent surviving as a common need would mean the defaults had failed); a second semantic token layer over the type palette (layout space needed one because raw space has real consumers; raw type has none); spacing or geometry answering the axis (gutters must not inflate on the smaller screen, and two axes pushing one box compose a height nobody designed — both now band-scoped laws).

## 2026-08-04 Container-keyed tiers re-litigated and re-affirmed; window breakpoints stay dead, and an unnamed cost gets a name

Kushagra, sus of container-based responsive props after the device-axis discussion, asked for the user-level cons and then directly: "should I switch to window based then." The full re-litigation, run to the end this time so it stays closed: what a consumer loses with container tiers is (1) no way to say "on mobile" per-prop, (2) no single page-wide breakpoint moment a designer can draw as three frames, (3) Tailwind muscle memory reading `md` as a window width, (4) the shrink-wrap collapse. Against that: window width is a *proxy* that conflates "how much room do I have" (containers answer exactly) with "what is this device" (the device axis answers exactly), and once both real signals exist the proxy has no remaining job — every honest `sm:` decomposes into one or the other.

The external record agrees, which was checked rather than assumed: Shopify Polaris rebuilt its responsive props on container queries (`@container (inline-size > 300px)` values, an explicit `QueryContainer`); Chakra's open discussions ask to move breakpoints *from* viewport *to* container; Panda shipped container conditions; Tailwind 4 added container queries under a distinct `@sm:` spelling while keeping `sm:` for the viewport — the industry's migrations all run window→container, none back, and the consensus split (containers for components, media for device-level type and interaction) is exactly §2 + §17. The 2025 State of CSS names container collapse as the common frustration — the same footgun §2 already documents and law-pins, a cost of the feature, not of this design.

Two things came out of the challenge worth keeping. First, a discipline failure worth not repeating: mid-discussion I escalated an observation into a "narrow containers to regions" recommendation with no disconfirming evidence — a hypothesis competing against a decision with written reasons and accepted costs. Withdrawn; the standing rule is that decisions reopen on the build's evidence (the docs app is this one's gate), not on argument quality. Second, a real cost that had never been *named*: **wrapping a subtree in a plain Box re-targets which container its children's tiers measure** — a direct consequence of nearest-ancestor resolution, documented as mechanism but absent from §2's cost list, unpinned by any law. Recorded in the open list; it gets named in §2 with a law when that section is next touched. (Polaris's explicit-container shape is external precedent for the withdrawn alternative — recorded here so the fact survives, and so nobody mistakes its existence for a reason to reopen.)

Rejected: window/viewport breakpoints as the responsive-prop mechanism (v1's model; the proxy argument above, plus THESIS Part I — familiarity is an adoption argument and adoption is explicitly not the loss function); merging device and container into one breakpoint system (a narrow desktop card and a full-width phone block dissociate in both directions — one name for two operations is the false-sameness error THESIS opens with); per-prop device overrides as the escape hatch (same rejection as in the §17 entry).

Kushagra, minutes after the emphasis ladder: "colour should be supported by text, just like button" — and, offered the cheap version (a coloured text is one colour per family) against the full one (every family carries all three emphasis strengths), he chose the full ladder. Both halves of the call were his; the shape it landed in is the system's.

**Semantic only, which was the other half of his question.** `tone="destructive"` says *error*; the theme resolves the pigment. Radix's Text takes any of thirty scale names, and that is precisely the API §7 forbids — a component that names a colour cannot be rebranded by config, and the working non-negotiable ("components expose tone/emphasis/material, never raw fills") would be dead the day type violated it. Future statuses (`success`, `warning`) arrive as generated tone families when a component forces them, and Text gets them for free because the prop is the family set.

**The ladder could not be scale steps, and that finding shaped the mechanism.** Neutral's three rungs are designed steps (12/11/10) because a gray scale has twelve grays. A chroma family has exactly one designed text colour: step 11. Step 12 is the high-contrast variant — loud destructive resolving to it would render an error in near-black maroon, when the entire point of `tone="destructive"` is that the error reads *red* — and steps 9/10 are the solid fills, *more* vivid below the text step, not less. So a chroma family's loud ink is 11, and the lower rungs fade the ink itself: `color-mix` toward transparent, the material mechanism (§10) applied to text. New roles `--{tone}-ink/-ink-muted/-ink-faint` join the tone indirection; the type layer re-scopes the three foreground roles onto them in one `[data-tone]` block that names no family. Neutral's inks equal the tone-less roles exactly, so `tone="neutral"` and no tone are one ladder — law-tested, because two ladders one step apart is the kind of drift nobody notices until a screenshot does.

**A tone stamps only when chosen, and an explicit tone survives the loud-surface collapse.** The collapse protects text that never chose a colour; a call site that puts red text on a solid blue banner asked for exactly that, and the escape's own rule applies — a choice spelled at the call site is the call site's to defend. (The general answer to colour-over-fill legibility remains §10's deferred brightness-floor branch, not a per-case swallow.)

Rejected: one ink per family (the recommendation on the table; lost to the axis's own promise — a rung that exists for neutral and silently vanishes for accent makes emphasis conditional on tone, §2's additivity broken at the API instead of the stylesheet); raw colour names on Text (Radix's thirty-name prop; §7's autopsy); scale-step lower rungs for chroma families (step 10 is a solid — "faint red" via steps selects a *louder* colour); the alpha ramp as the fade (a-steps match their solid's appearance by construction — an a11 line looks like 11, which fades nothing).

Kushagra, hours after Text shipped without it: will Text have emphasis — "a low grayish text vs strong"? The morning's ship had answered no ("no tone, no emphasis; decoration is the call site's `style` against the role tokens"), and the question exposed that answer as a category error of the polite kind: muted body copy is not decoration. It is the second rung of a ladder the system already designed — every surface sets `--color-text` **and** `--color-text-muted`, the tone-forward rungs re-scope both — and the shipped API made the most common text treatment in any app ride the lawless escape.

**The resolution is the axis, not a new prop.** The precedent was already in the codebase twice: controls resolve `emphasis` as fills (§9), surfaces resolve the same three rungs as dressing (§10). Type is the third resolution — foreground roles: loud reads `--color-text`, medium `--color-text-muted`, quiet a new `--color-text-faint` (v0 at neutral-10, awaiting the eye like every placed value). One axis, one vocabulary, three layers each answering it in their own terms — versus a `muted` boolean, which was the recommendation on the table and lost because it would have been a ladder wearing a boolean: the moment a third level exists (iOS ships four), the boolean is API debt.

**Text rests loud, the deliberate inversion of the control default.** §11's mantra — nothing loud by accident — ranks *actions*; a paragraph is not competing for a focal point, and full contrast is the accessible resting state for reading. The system's resting states now read as a sentence: surfaces rest quiet, controls rest medium, text rests loud — each layer's safe default is the opposite end of the same axis, for its own reason.

**Two placed choices carried in the same commit:** quiet is below body-copy contrast by design (a timestamp, a placeholder — never a reading-length line, the call site's law, same shape as §16's "size 1 below the touch target is a choice, not a defect"); and on a loud surface all three rungs collapse to `--tone-contrast`, because the APCA-chosen contrast is the one colour guaranteed against a solid tone fill — legibility over hierarchy, made a law rather than left as an accident of the re-scope.

Rejected: a `muted` boolean (a ladder wearing a boolean; the role layer already had two rungs and iOS's four says the count grows); "strong" as a rung (already spelled twice — `weight` prices it, `render={<strong/>}` means it; a third spelling would drift); a text-specific union name (`variant`, `hierarchy` — the axis exists, renaming it per layer is how one idea becomes three APIs); keeping the style escape as the API (semantics spelled where review sees them is the thesis, and `bordered` on Button set the precedent for a role-reading modifier).

## 2026-08-04 TextField: the second control costs 247 bytes, and three "exactly one" claims turn out to be stale

Repetition begins, and the point of going second is that the additivity claim finally has something to compare against: **+247 bytes gzipped for a whole control**, against the +1,206 Button paid to create the layer. The size index, the emphasis-free skeleton, the disabled remap, the states and material all arrived from `recipes.css` untouched. That is §2 measured rather than asserted.

**What is genuinely new is the wrapper, and it is what makes slots legitimate here after Card refused them.** A field that holds an icon inside its border cannot keep that border on the `<input>`; once a wrapper owns the border it owes three things no consumer can compose from outside — clicking anywhere lands the caret, the input yields to the slots without breaking `::placeholder` or selection, and an interactive trailing control keeps its own press. That is the anatomy criterion (LOG 2026-08-04) doing real work in both directions: it refused Card's title/footer because nothing non-visual forced them, and it grants a field two slots because the border's position does.

**Decisions closed:** no `emphasis` and no `tone` on a field — loudness ranks actions against siblings, and a form where one field is louder than the next names nothing (the Card argument, arriving at a control). Construction (filled vs outlined) is an app identity, not a per-field knob. Validity is state, never a prop: `data-invalid` inside a Base UI `Field`, `aria-invalid` standalone, and the remap went into the SHARED layer because Select and Combobox can be wrong too. Focus rings on `:focus-within` — a field's focus is a mode, not a keyboard affordance; you do not press a field, you enter it.

**The adversarial audit's real yield was three claims that had gone stale without anyone editing them.** "Exactly one `box-shadow` in the system" (§10) — already about to be false, and the law that guarded it counted occurrences in *one file*, so a second element legitimately needing depth made the doc wrong and CI silent. "One ring, defined once" (§8) — already false since card-as-button shipped a second ring, months before TextField added a third. "Cursors: three states" — four. In every case the doc's number was a count of something the law also counted in one place, which is the same failure the 2026-08-03 audit named one level down: **a law that counts occurrences in a single file proves nothing about a system.** Both laws are now rewritten to walk every shipped stylesheet and assert what actually matters — every focus rule resolves the same three ring tokens, every `box-shadow` resolves `--kui-surface-chrome` and never reaches past it to the palette — and both were mutation-checked before being trusted.

The audit also found the interactive-element list written twice, in the click handler and in a CSS `:not(:has())` guard, already disagreeing about `textarea` and `[tabindex]`; the guard turned out to be unnecessary (a control inside a slot paints its own label colour) and was deleted rather than synchronised. And the icon-box rule had been copied into the component because the shared selector is `.kui-control > svg` and a slot's icon is a grandchild — the copy is gone and the shared rule now covers `[data-slot] > svg`, which is what makes `data-slot` a system convention rather than dead output.

One defect found by hand rather than by any auditor, because it needs a device: **iOS zooms the page on focus for any input under 16px**, which is sizes 1 and 2. Recorded in the open list unfixed — the fix (a 16px floor under coarse) trades away the promise that size-2 type is size-2 type, and that is a taste call.

Rejected: an `invalid` prop (nothing chooses to look invalid); a destructive focus ring on invalid — REVERSED 2026-08-04, and the reason given here was false: destructive clears the APCA floor in both modes (55-65 against a floor of 45), and the accent ring measured 6.4x the weight of the error border beside it; putting the invalid remap in the component (Select and Combobox wear it too); compound `TextField.Slot` children (arbitrary stacking, the shadcn header failure); label/description/error parts (Base UI's `Field` already does the `aria-*` wiring, and the labelled arrangement is a block).

## 2026-08-04 The icon-label gap joins the label cluster, out of the density sets

Kushagra, reading the rebuilt card demos: the gap between a button's icon and label should not be controlled by density. Correct by the axis's own definition — density grows the box and holds the content, and the system already said so twice without noticing the third instance: type never takes density (the whole point of the axis) and the icon box is explicitly "size-indexed, but never density-indexed" (a perception floor). The gap that binds those two is part of the same **label cluster**; a compact button squeezing icon against label was the content moving when only the box should.

`gap` leaves the density sets. `controlGap` is size-indexed, declared once at `:root` and re-declared per pointer world — fine 4/8/8/12, coarse 8/12/12/16, because the coarse box is a full size step larger and the cluster spreads with it (§16's designed-set values, preserved exactly). Density blocks no longer declare it, which IS the invariance, law-tested: same 8px gap at every density, 12px under coarse. CSS shrank 21 bytes; the ratchet was re-recorded downward.

Preview, same session: title + description became one coupled text group (tighter to each other than the group sits to the actions — two nested Stacks, the block pattern), the card-as-button demo got the same structure it had missed, and the first render exposed a real footgun worth remembering: **a `kui-box` is an inline-size container, so in a shrink-to-fit context (a flex column with `align-items: flex-start`) its width cannot come from its contents and it collapses to nothing.** Stacks stretch; that is the default for a reason.

Rejected: making the gap fully pointer-invariant like the icon box (the coarse judged sets placed larger gaps and nothing argued against them — flattening would have been a silent v0 change smuggled inside a refactor); keeping identical gap rows in every density level as data (a set that never varies is a constant wearing a set's costume, and the emission would still invite divergence).
## 2026-08-03 The two escape axes nobody opened in a browser were the two that were broken

Found by an audit of the whole repo, not by use: `contrast="high"` resolved **no rule at all** in light mode, and `prefers-contrast: more` could **never fire** in dark. Both had shipped since the token pipeline landed, both were "covered" by tests, and neither could have been caught by the tests that covered them.

The mechanism is one line — the high-contrast block took `mode === "light" ? ":root" : '[data-appearance="dark"]'`. `:root` only ever matches `<html>`; Theme renders a div. So light stamped `data-contrast="high"` onto an element no rule could see, while dark worked *by accident*, because its scope happened to name a second attribute that Theme co-locates on the same node. The platform signal failed the mirror-image way: the guard `:not([data-contrast="normal"])` was correct, but Theme stamped a defaulted `normal` on every node, so the one element carrying `data-appearance="dark"` always also carried the attribute that excluded it. The same sweep found the third member of the family: light colour tokens lived only at `:root`, so `<Theme appearance="light">` inside a dark app rendered fully dark — `light` and `inherit` were indistinguishable, and only the dark direction of a nestable axis actually nested.

**Why it survived: every law asserted one indirection short of the thing that could be wrong.** `theme.browser.test.tsx` asserted that `contrast="high"` *writes its attribute* — which it always did, correctly, while resolving nothing. The preview did exercise light high-contrast and did show it working, because the page toggle stamps `document.documentElement.dataset.contrast` by hand and `:root` matches `<html>` — so the one place a human looked was the one place the bug could not appear. The generator already knew this failure mode and carried three comments about it ("an escape that does nothing is not an escape") on density, radius and pointer: the three axes that had been debugged by eye. The fix had been applied per incident and never turned into a rule.

The same sweep caught the identical shape one layer down, in the values rather than the scopes. `contrast="high"` re-declared `--tone-solid-hover` and `--tone-solid-active` but not `--tone-solid`, on the assumption that re-declaring step 12 would carry the role with it — but the role is baked as a *literal*, not `var(--tone-12)`, so rest stayed at its normal-contrast value while hover and active moved beneath it. The neutral loud button pressed **lighter** than it rested, on the opposite side of hover, reachable with no prop at all through `prefers-contrast`. The law that should have caught it compared two `Scale` objects in memory — true in JS, and never once checked against the stylesheet. It now reads the emitted declaration text and applies the high block over the base the way the cascade does.

**The rule now:** an axis is proven by a law that reads a *computed token* through a mounted `<Theme>`, in both appearances, or the *emitted declarations* where the question is what the generator wrote. Attribute assertions are kept, but they are no longer the proof. Theme stamps `data-contrast` only when the axis was actually chosen — a defaulted value is not a choice, and writing it opts the user out of an accessibility signal they never declined. Light gets its own `[data-appearance="light"]` block, so both directions of the appearance axis escape.

Rejected: leaving light on `:root` and having Theme also write to `documentElement` (a component that reaches outside its own subtree cannot nest, and two Themes would fight over one attribute); dropping the `:not()` guard so `prefers-contrast` reaches everything (it would override an explicit `contrast="normal"`, which is a real opt-out, not an absence); a single `:where(:root, [data-appearance="light"])` base (zero specificity loses the tie to the dark block inside a dark subtree).

## 2026-08-04 Material becomes a fill modifier — the white veil dies in hours, colour survives the glass

Supersedes the fill model in the entry below, same day, on Kushagra's question after seeing the neutral glass: colour has to survive material — and "if the veil can tint with neutral, why can't it tint with whatever colour the button's fill already is? Why complicate?" He was right, and the correction dissolved the entry-below's central rule rather than patching it. The white veil was never "neutral tinted" — it mixed the *page* colour (`--neutral-1`), a third colour the material chose for itself. The category error mirrors the one that killed the alpha shell (LOG 2026-08-04, below): material had quietly become a fill, when its whole job is modifying one.

**The model: material makes whatever fill the component would have painted translucent at the thickness alpha, and adds the filter — it never names a colour.** Rungs publish their fills as sources (`--kui-fill-src[-hover/-active]`, `--kui-sf-fill-src`); the painted value reads through a fallback chain that collapses to the rung's value when no material is on; material re-derives every state as `color-mix(src, alpha)`. The alphas stay the designed `[rest, hover, active]` ladder; the tokens they were baked into (`--material-*-fill`) are replaced by bare alpha tokens applied at the point of use. Everything the first cut special-cased falls out for free: tone and loudness both survive (loud accent glass is translucent accent-9; "loud sleeps" lasted one commit), quiet glass is bare blur (the absence of a fill, frosted), the rung keeps its own label pairing (`--tone-contrast` stays paired to a fill that is still there, merely translucent), and the label re-scope to `--tone-label` is deleted. The opaque environments (no backdrop-filter, reduced transparency) become the fill nearly sealed at the fallback alpha — a 30% veil defends nothing without blur.

**Surfaces are the same law one level up, and Card is its special case, not an exception:** the quiet rung's source is the opaque seal, and the seal at the thin alpha *is* the old page-coloured glass — Card never visibly moved. Tone-forward surfaces (Callout, Banner) will tint their own veils the day one floats, with no second material table. The interactive surface steps re-derive too, fixing a latent quirk the first cut inherited: a glass card-as-button flashed opaque `--color-surface-hover` under the pointer. New leak found and guarded: the derived fills (`--kui-sf-fill*`) now exist only on material surfaces and would inherit into nested plain cards — `@property inherits: false`, the border guard's lesson, third instance.

Rejected: the white veil with tone on the label (shipped for hours; erased the axes and made the material a fill); a tinted-glass second table (the modifier gets tinting free — a second table is the tone × material product by another name); label re-scope to `--tone-label` under glass (the rung's fill is still there; thin-over-bright-photo legibility is the deferred brightness-floor branch's job, not a label swap); keeping the veil neutral for the *fallback* only (one model per law — the fallback is the same mix at a higher alpha).

## 2026-08-04 Material returns to Button: glass owns the fill, tone rides the label

The standing debt from §14 step 5 ("material deliberately does not ship on Button") comes due: Card proved §10's recipes against the photo backdrop, so the axis extends to the control layer. What was genuinely open was not *whether* — §10 already said "available on any component that can float, buttons included" — but *how glass composes with the control machinery*, which has three fills and a designed label pairing where a surface has one fill.

The composition: **while a material is on, it owns the whole fill triplet, and the rung's dressing sleeps until it comes off.** The rung fills were designed against the page; glass is designed against an arbitrary backdrop, and the two do not mix — a hover that flashed `--tone-soft-hover` over glass would be the page's answer to a question the photo asked. Interaction instead steps glass's one ramp, the mix percentage: each thickness carries designed `[rest, hover, active]` alphas moving toward the seal (§8's +1/+2 rule translated), monotone per column so thickness reads as one dimension mid-interaction. The filter never moves with state — a blur change re-samples the backdrop and shimmers. The label re-scopes to `--tone-label`: `--tone-contrast` is APCA-paired to `--tone-solid`, a fill that is no longer there, and the neutral glass takes the label token — so tone still reaches a glass button, on its label, which is iOS's own answer (tint the symbol, not the glass). In the opaque environments (no `backdrop-filter`, reduced transparency) the fill is the near-opaque fallback and hover/press read the seal's own steps (`--color-surface-hover/-active`) — the fallback is the seal's neighbour, so it responds like the seal.

Mechanically: the material block lands in recipes.css (the shared layer — every control that will ever float reads it), three-environment shape copied from the surface layer; `Material` moves to button.tsx and Card imports it, so types flow one direction; `button.css` still names no axis, material included, law-tested. The loud-under-glass consequence ships to the preview for judgment ("loud sleeps") rather than being reasoned about.

Rejected: tinted per-tone glass (a tone × material product the token layer never pays, and the platform tints symbols, not glass); keeping the rung's label and branching on backdrop brightness (that is §10's deferred brightness-floor mechanism — it arrives designed, not as a side effect of a prop landing); gating material by emphasis or per component (axes never select against one another; the library defines what material looks like, never where it goes); stepping the blur for hover feedback (re-sampling shimmer).

## 2026-08-04 The surface corner takes the size index, and the preview stops breaking the system's own law

Two catches from one screenshot of the padding-index row, both Kushagra's.

**Surface radius follows size now.** Every Card wore radius step 6 flat, on the §6 premise "a card has no size index" — a premise that quietly died the day Card grew a size index for padding, and looked wrong the moment four sizes stood side by side. The surface band widens from two steps to four plus the overlay (palette 0-10: control 1-5, surface 6-9, overlay 10), and `--radius-surface-1..4` becomes size-indexed picks, joined by the surface size join in surfaces.css. Placed rules: size 3 anchors at each level's old flat value (small 8, medium 16, large 24) so the default card never moved; `full` still caps the band at large's values; **density never touches a surface corner** — density reaches a card through padding, the corner follows size alone. Fixing this surfaced the third instance of the substitution-at-declaration bug: `--radius-surface` lived only in `:root`, so a nested radius Theme re-priced the palette and cards ignored it. The surface semantics now re-declare inside every `[data-radius]` block, the default level's included (the escape lesson, radius axis this time), and a mounted law pins a nested small Theme's card at 8px.

**The preview was violating the no-margin law in its own demos** — card bodies pushed with `margin-top`, demo rows with inline flex-gap strings — "the biggest blunder we could make," and correctly so: the preview is the system demonstrating itself, and a demo that spaces by margin documents the exact habit the system forbids. Every demo distance in the surface section now goes through `kuiBox` — the real resolver, emitting real `--layout-space-N` references — so the demos are Boxes with flex and gap all the way down and follow the density select like any consumer's layout would. Heading rhythm inside the section rides the same stack gap, margins zeroed.

Rejected: surface radius per density (padding already answers density; a second mover on the corner has no semantic); reusing control-band steps for small surfaces (at `full` the control band is 9999 — a size-1 card would become a lens, which is the exact case the disjoint bands exist for); a bare `--radius-surface` kept as an alias (two names for one thing is how drift starts).

## 2026-08-04 Layout space: the rhythm becomes a semantic layer, hours after the per-family fix

Kushagra, immediately after surface padding got its own density sets: if `gap="4"` does not answer density, the index is a unit conversion — "what's the point of writing gap = 4 if it's absolute too, when the user could have written 16px?" The analogy he reached for is the system's own logic: contrast does not change which role a component reads, it changes what the role resolves to. Layout props had no role layer to re-resolve — they consumed the palette raw — which is the actual reason density "couldn't" touch them.

**The layer: `--layout-space-N`, consumed by every distance BETWEEN things** — gap on Flex/Stack/Grid, Box `p`/`m`, and surface padding — with the default level a 1:1 identity map onto the palette and compact/comfortable re-picking steps from it (designed sets, section 12's shape). The palette itself stays untouched, which is the constraint that killed the obvious alternative: space is shared currency between layout and control innards, and control px/gap already answer density through the designed sets, so re-pricing the palette would compress a compact button twice and welding compensation into the density sets would end per-cell correctability. The boundary rule that falls out: **raw space = the palette plus the control family's picks; layout space = everything else.** This superseded the morning's per-family surface padding sets the same day — surface padding is now fixed picks into the layer (identical rendered values), one lever instead of two.

Placed choices in the v0: steps 1-8 shift one palette step per level; the gutter band 9-12 holds at identity, so section 12's original protection — compact must not collapse page gutters — survives as a designed choice rather than a prohibition. Pointer never touches the layer, extending section 16's judgment (a phone needs more content per inch, not less). Surface padding re-bakes inside every density scope — substitution-at-declaration, again. Cost: +108 bytes gzipped.

Rejected: re-pricing the space palette under `[data-density]` (double-applies to control innards; ends correctability); a separate Theme `spacing` identity knob re-pricing the palette, the radius-levels pattern (same double-application, plus a second knob for what density already means); shifting the whole curve including gutters (`p="9"` page margins collapsing 96 -> 64 is Radix's `scaling` coarseness re-admitted); coarse pointer re-picking the layer (nothing forced it, and the section 16 law says gutters hold on small screens).

## 2026-08-04 Surface padding takes density — the deferral closes on first sight of the gap

Kushagra, looking at the shipped Card: density does not move a card, "I mean it should." The question had been explicitly deferred in section 10's open list ("whether surface padding takes density — lands at Card"), and it closed the first time the gap was visible: a compact app whose controls tighten while its cards keep default air is half-adjusted, which is not what a density level means.

The mechanism is the one density already uses everywhere — a designed set per level, never a multiplier. `surfacePadding` becomes per-level step indices into the space palette, one step apart (compact 8/12/16/24, default 12/16/24/32, comfortable 16/24/32/40), emitted inside the existing `[data-density]` blocks; the space palette itself stays untouched, so compact still cannot shrink page gutters. No pointer cells: surface padding does not vary by pointer, and the single-attribute block matches under any pointer scope. Cost: +31 bytes gzipped, baseline re-recorded. The per-level steps are v0 values awaiting the eye, like every other placed number. The preview gained a page-wide density select the same commit — the density x size matrix keeps its pinned sections, because it is the axis laid out, but everything else on the page (cards included) now follows one control the way it would follow an app's Theme.

Raised in the same message and left OPEN, deliberately: whether `--radius-surface` should follow the size index. Today every Card size wears radius step 6; the config comment "surfaces have no size index" predates Card growing one for padding. Not decided here — it is a taste call on real screens, and the surface band would need more than two steps to express it.

Rejected: a density multiplier on the padding (the same reason density is not a multiplier anywhere: no cell would be correctable alone); putting surface padding into the control family emission (it is section 10's family, not section 4's — a surface has no height to own and the families should stay separately correctable); pointer-axis cells for surface padding (nothing varies).

## 2026-08-04 The shadow's home is the Theme, and Box learns it does not paint

Three corrections inside one afternoon, each Kushagra's: the palette values were rebuilt on researched geometry (negative spread is the sharpness mechanism — Tailwind's sm/md/lg verbatim, because the first two attempts were soft fog with short blurs and the reference card shadow was sharp); the `<Box shadow render={<Card/>}>` composition was judged "ugly, not for my system", which forced the real question; and the answer was the lever recorded a day earlier — **Theme `surfaces="flat" | "elevated"`**, an app identity beside `radius` and `density`. Named `elevated`, not `shadowed`: shadows are not semantic, sitting up is; row 2 is merely tonight's resolution of it.

The forcing argument for the Theme world over a Card prop: a per-card, four-value visual knob that nothing semantic drives is the elevation autopsy's exact profile re-admitted through the side door, ending in `shadow="2"` cargo-culted onto some cards and not others. One world rule dresses every surface on the element that owns the radius — which also kills the wrapper problem (a Box is a sharp-cornered rectangle; its shadow peeks past a rounded card's corners).

**Box's `shadow` prop died the same hour, on taxonomy:** "I thought Box is purely a layout component — why does it get to define shadow?" Correct; the prop was paint on a layout primitive, shipped for a day, and the honest escape was always `style` with the palette tokens. Laws now pin all three refusals: no shadow prop on Box, none on Card, exactly one `box-shadow` in the surface layer and it lives inside the `[data-surfaces="elevated"]` scope reading row 2.

Rejected: `surfaces="shadowed"` (names the resolution, not the semantic); a Card `shadow` prop (the side-door elevation axis); keeping Box's prop for convenience (layout components do not paint, and convenience was the argument for every leak the system has deleted).

## 2026-08-04 Taste gets its escape valve: shadows as a fenced resource, interactivity from the element

Kushagra, after the elevation deletion settled: where does visual taste come in — a card *looks nice* with a bit of shadow, but that is not everyone's taste. The resolution keeps the identity and prices the taste: KookieUI's surfaces are flat by system decision, and shadow becomes a **resource with a fence** rather than an axis. `--shadow-1..4` in the public contract — the system's one index shape, 1 the inset well (his call, over Radix's six), mode-aware, values only in config. No semantic component may read them, law-tested; the sole API is Box's closed `shadow` prop, the same tier as `m`: decoration spelled where review sees it. If the flat identity itself ever feels wrong on a real screen, the recorded lever is a Theme-level designed set — not a resurrection of elevation.

Card-as-button landed the same session, and its shape is the anatomy criterion applied again: interactivity is forced by something non-visual — the element — so the pattern is `render={<button/>}` and the surface layer keys on `:where(button, a)`. No `interactive` prop, no ClickableCard component. Rest pixel-identical to a plain Card; hover washes the seal (guarded), press steps instantly (unguarded), one shared ring; a button cannot nest a button, so HTML enforces the one-action-zone rule for free.

Rejected: six shadow steps (a menu, not an index); free strings on Box's shadow (`style` already exists for lawlessness; the prop's value is that it cannot be lawless); shadow props on Card or any semantic component; a data-interactive attribute (a prop restating what the element already declares); responsive shadow (no known use; the remap pipe is there if one appears).

## 2026-08-04 The alpha-nesting theory dies by eye, and the shell seals

The preview made two claims Kushagra caught as false in one screenshot: "three distinct levels" over a nesting demo whose levels were indistinguishable, and a "solid" card over a photo that had no background at all. One root cause: the shell's fill was `--tone-a1`, 1.2% alpha — too faint to differentiate nesting, too transparent to be a surface over media. His framing closed it: **why does a card have an alpha background — isn't that material's job?** It is. Translucency belongs to `material` exclusively; the alpha default was material's responsibility leaking into the shell.

§10's alpha-nesting paragraph is retracted rather than tuned: the theory ("stacked surfaces auto-differentiate by compositing") was written before a value existed and falsified when one did. At the neutral end of the ramp the effect is arithmetic, not perception — nested surfaces visibly separate by **border**. The shell now seals with `--color-surface` — and the first value was wrong for half a day: sealed at `--neutral-1` the card was page-coloured, i.e. invisible where it lives most, caught by Kushagra on sight. The seal is paper ABOVE the page: white over the #fcfcfc page in light, `--neutral-2` in dark (the Radix panel answer). "Solid" finally means solid over media, and the material cells became a true comparison. The alpha ramp keeps its one honest surface job: the tone-forward rungs (`--tone-a3`), where the fill carries chroma and is visible. `--tone-a1` left the role set.

The laws inverted with the decision: "the fill is translucent" became "the fill has no alpha channel in any spelling" (the first draft asserted `rgb(` and was immediately schooled by the P3 block resolving to `color(display-p3 …)` — test the property, not the spelling).

Rejected: darkening the alpha step until nesting reads (chases perception with arithmetic; the border already does the job); a seal at the page colour itself (an invisible card — the half-day mistake above); keeping a1 alongside the seal as an optional tint (1.2% buys nothing; a token nobody can see is budget without a job); a nesting demo at all (nested same-fill cards separated by borders demonstrate a border, not a mechanism — the law keeps the truth, the preview stops performing it).

## 2026-08-04 Card strips to a shell, and the anatomy criterion falls out

The elevation deletion kept going. Kushagra, in sequence: why does a Card have an emphasis ladder at all — a solid card is "a purely visual tool, which is what you did also" (the preview's own `loud accent` demo cell was decoration, which proved the point); then, after a five-slot anatomy (Header/Title/Description/Action/Footer) had been argued down to three (Title/Description/Actions), the sharper question — *why this layout and no other?* A titled card is one layout among many, and a system that blesses one is silently deprecating stat cards, media cards, profile cards. "Card is a block, not a component."

**The criterion, worth more than the component: anatomy is system-owned only where something non-visual forces it.** Dialog's title/description are forced by a11y wiring; Callout's by status semantics; nothing forces a Card layout. Layouts are blocks (kookie-blocks), built from the shell plus Text/Heading/Flex when they exist. So Card is `size × material` and children — one fixed treatment (neutral quiet alpha + border) written as constant data attributes, resolved through the same shared layer, chosen by no one.

**The slot autopsy, recorded so it stays dead:** the header Action slot died first (its legitimate tenant is card-object operations — dismiss, overflow — whose components don't exist; shipped early it gets squatted by task actions, which is shadcn's own login demo putting Sign Up top-right against its own footer buttons). Header died with it — a wrapper with no horizontal relationship left to lay out. Footer died by name: positional names attract positional tenants, Apple's `Section(footer:)` already means fine print, and the semantic name was Actions. Then the whole trio died as anatomy, by the criterion above. What survives anyway: the one-task-action-zone rule as the documented pattern, and the foreground-context roles, which Dialog and Callout's *forced* anatomy will consume.

**Also named:** on controls, `bordered` genuinely is part of the emphasis ladder — the composed cells reproduce v1's five variants exactly — and §10's containment framing was half true. The prop stays; the reading changes.

Emphasis/tone/bordered props deleted from Card; a `@ts-expect-error` law pins each refusal. Apple as the external check: no Card component exists in SwiftUI — `GroupBox` and inset `Section` ship one fixed treatment, materials are the real axis, card-ness is composed.

Rejected: five surface-emphasis rungs (folding border in); demoting `bordered` to a system-owned ingredient on controls (Button needs its ladder public); a `Card.Content` wrapper (padding lives on the shell, so content is just children); `Card.Media` (full-bleed is its own design problem, buildable from tokens meanwhile); shipping anatomy slots that a block can express with three primitives.

## 2026-08-03 Elevation dies on first sight, and it was never an axis

Kushagra, on seeing the v0 shadow ladder rendered: shadows for elevation is a no go — and then the sharper question, "why does our card need any elevation ladder?" It doesn't. The post-mortem matters more than the deletion: **nothing ever chose elevation at a call site.** §11's own defaults table fixed it per component — a Card was always `raised`, a Menu always `floating`, a Dialog always `overlay` — and a prop that nothing varies is a component fact wearing a prop's clothes. §9's rule (axes are derived, not assigned) should have caught it before a preview had to.

What replaces the ladder costs nothing. In-flow surfaces separate by border and fill — the alpha nesting demo already proved three levels of depth with one token and no shadow. Detached components design their own detachment when built: Dialog's separation was already specced as its backdrop scrim (§11), and whether a Popover needs anything beyond border + opaque fill is a judgment for when a Popover exists, made against a real backdrop.

Deleted: the shadow tokens, the `elevation` prop, the ladder rules, and the preview block that displayed them — an hour after they shipped. A law now asserts the surface layer names no shadow and no elevation. The budget gave back 164 bytes.

Rejected: keeping shadows for the overlay tier only (the components that need separation get to design it, and pre-buying a shadow scale for them repeats the same over-modelling); elevation-as-fill-lightness (dark-mode convention, but it collides with the emphasis rungs which already own fill); keeping the axis with all levels resolving to nothing (a rung that is not visibly distinct is not a rung — §9's own words).

## 2026-08-03 Card lands as pure data attributes, and the surface layer is recipes.css one level up

§14 step 6, closing the first vertical slice. The measurement: **+590 bytes gzipped for the entire surface world** — shadow ladder, material recipes, foreground context, the surface rungs — and the additive claim now has its limit case: **Card ships not one line of its own CSS.** There is no card.css, and a law asserts the file does not exist; the component is data attributes over the shared layer, so Panel, Callout, Popover and Dialog will each cost the same nothing.

**Decisions made on contact:**

- **Surface rungs resolve through the alpha ramp, controls through solid steps — same axis, two dressings.** Quiet is `--tone-a1`, medium `--tone-a3`, loud the solid. §10's nesting argument decided it: an alpha fill composites over whatever is behind it, so three nested quiet cards differentiate with one token and no per-level colour math. `a1`/`a3` joined the tone indirection roles, so a medium destructive Callout is a data attribute, not a colour.
- **Foreground context is two new roles, not a mechanism.** `--color-text` / `--color-text-muted` exist at :root as neutral 12/11; tone-forward rungs re-scope them (`medium` → `--tone-text`, `loud` → `--tone-contrast`). The law that matters: the surface re-scopes only the foreground roles, never the tone indirection — a neutral Button on an accent card is still a neutral Button, asserted mounted.
- **The surface world is emitted per mode**, because a var() resolves where declared — `--color-text` baked at :root would carry light neutral-12 into a dark subtree, the same lesson `--focus-ring` taught.
- **Material's three environments are cascade order, not logic**: near-opaque fallback first, the real recipe under `@supports (backdrop-filter)`, `prefers-reduced-transparency` last so the accessibility override wins. A law pins the order.
- **Bordered is genuinely shared:** the surface skeleton reads the same `--kui-border-color` the control layer's `[data-bordered]` rule sets — containment is defined once for the whole system.

v0 taste shipped for judging in the preview, same contract as the coarse numbers: the shadow recipes (two-layer, higher alphas in dark because a dark page swallows shadow), surface padding on the size index (12/16/24/32, default 3 = 24), and §10's material table against a deliberately hostile gradient backdrop.

Rejected: Base UI for Card (nothing behavioural to buy; Box's cloneElement render pattern is the house style); opaque step fills for surfaces (kills nesting, §10 already argued it); a separate surface state machine (interactive surfaces reuse the control one when they arrive); shipping a card.css for symmetry (an empty file is a place for drift to start).

## 2026-08-03 Button meets a real phone, and three settled answers reverse

Every defect in this entry was invisible in desktop Chromium, including its device emulator, and each was found by Kushagra on hardware — a preview on an actual iPhone falsified more of §8 in an evening than the test suite could. The suite asserts what the stylesheet *says*; only a device says how it *feels*.

**"Applied uniformly" was wrong, and the correction is a designed asymmetry.** The canonical transition promised every state change at the same 120ms. On a phone the button read as dead: a tap lasts ~60ms, so an eased press never reaches its colour before it starts returning — a mouse hides this because a click holds the button down through the ramp. Press now lands instantly (`transition-duration: 0s` on `:active`) and release eases, which is also how native controls behave. Second touch defect, same session: unguarded `:hover` left tapped controls stuck in their hover fill, because touch synthesises hover on tap and holds it — every hover rule now sits under `@media (hover: hover)`, and `:active` deliberately never does, since on touch it is the only feedback there is. The hover law initially *passed against a comment* — the prose explaining the guard contained ":hover" — so the law now strips comments first: a law a comment can satisfy is not a law.

**The cursor reversal.** §8 had chosen the arrow on native-platform-parity grounds. The argument did not survive the medium: on the web the hand means "this responds" — a convention old enough to be a human factor rather than a style — and every system a consumer has used shows it. Now tokenised as a designed set: `pointer` at rest, `progress` while loading (busy, not frozen — `wait` overstates), `default` when disabled (the hand promises a response the control will not give; `not-allowed` scolds). The loading cursor also fixed the blocking mechanism: `pointer-events: none` stops hit-testing, and an element that takes no pointer events shows no cursor, so activation blocks through the disabled attribute instead.

**The Spinner stopped being clever.** The border-trick arc (one element, no SVG) was the spec's pride and was rejected by eye; the conic-gradient replacement failed structurally, because a conic gradient cuts angular wedges and the native idiom is parallel-sided bars. Wrong primitive, not wrong tuning. It is now twelve static SVG spokes rotated as a whole by a `steps(12)` keyframe — the tick from spoke to spoke *is* the look — still zero JS, one composited transform per frame, `currentColor` for free.

This audit also closed §Open's "how does quiet render" (bare at rest, decided at the first real Button as planned) and caught the disabled cursor as genuine doc-code drift: the spec said arrow, the stylesheet still showed the hand. Fixed in CSS with a law, not by amending the doc — the doc was right.

Rejected: guarding `:active` alongside `:hover` (removes the only feedback touch gets); `not-allowed` on disabled; `wait` while loading; keeping the eased press with a shorter duration (any ease loses a race with a 60ms tap; the asymmetry is the fix, not the number).

**Superseded the same day, by Kushagra: transitions are zero until the motion system exists.** The 120ms transition and the press asymmetry were shipped without approval, and taste-level decisions are not the implementation's to make. All transitions removed — every state change instant on both pointer worlds, motion tokens wired but unread, a law asserting the recipe layer names no `transition`. The press finding survives as a constraint handed to the future motion system: whatever lands, press stays instant. The hover guard and `touch-action` stay — they are input-hardware correctness, not motion.

## 2026-08-03 Button lands, and the additivity claim stops being an argument

§14 step 5. Base UI behind the Kookie surface — it supplies the `<button>` semantics, keyboard behaviour, `data-disabled` and `focusableWhenDisabled`, and every visible decision stays ours. First runtime dependency in the package.

**The measurement the step exists for: +1,206 bytes gzipped for the entire control layer**, 8,105 against a 40,960 ceiling. The decomposition is the actual result — `button.css` is about 480 bytes and contains three declarations, because everything that varies lives once in `system/recipes.css` and is shared by every control that follows. The second control costs its structure and nothing else.

**Byte counts cannot prove additivity, so laws do.** A measurement tells you today's number; what tells you the *shape* is that a component's stylesheet names none of the axes. `button.css` may not contain a tone, a rung, a size index or a colour token, and the recipe layer may never select one axis against another (`[data-emphasis="loud"][data-tone="accent"]` is the exact rule that starts the multiplicative slide). Both are asserted. The tone indirection is generated from the tone list, so a fourth tone is a config line, not a CSS edit.

**Two things changed on contact.**

The Spinner's 2px ring sat *outside* its 16px box, so a loading button rendered 4px wider than the same button at rest — the zero-shift promise falsified by a `box-sizing` default, caught by the law that asserted it. And the focus ring named `--accent-solid` directly inside the shared layer, which made the "a rung names no family" law fail for a good reason: the ring genuinely is always accent (§8), but writing that in the recipe layer leaks a family into the one file that must stay tone-blind. `--focus-ring` is now a generated role token, re-declared per mode because a `var()` resolves where it is declared.

**Disabled is a tone remap, and that turned out to be better than the spec's wording.** Rewriting `--tone-*` to a flat neutral rather than forcing `--kui-fill` means every rung keeps its own shape while going flat: a disabled quiet button stays bare instead of growing a fill it never had at rest. Same reason opacity was refused — the state should be a designed pair, not a filter over one.

**`material` deliberately does not ship on Button.** §10's recipes are v0 pending measurement against real backdrops, and §14 assigns that proof to Card. Shipping unmeasured glass to hit a table row would be exactly the false precision this project keeps catching.

Rejected: a wrapper element for icon slots (`> svg` sizing plus `--kui-icon` costs no DOM, and minimising layers was the explicit constraint); a paint layer inside the control (the reserve it existed for was already deleted); hiding the label while loading; per-component emphasis rules.

## 2026-08-03 44 was never the floor, and dropping that error removes a mechanism

Kushagra, reading the coarse matrix: a coarse compact size 1 at 32px is a *conscious* design choice, a consumer reaching for size 1 is doing it deliberately, and raising it to 44 to satisfy a floor destroys the reason they reached for it. Correct — and checking the premise made it stronger than a compromise.

**WCAG 2.2 SC 2.5.8 *Target Size (Minimum)* is 24×24 CSS px at Level AA.** That is the enforceable requirement. The 44×44 number is SC 2.5.5 *Target Size (Enhanced)* at Level AAA, and Apple's HIG figure. §16 had been written treating AAA as the locked floor, which is the "false precision" failure THESIS §4 names — asserting a stricter standard than the evidence supports, and then building machinery to satisfy the overstatement.

Refiled by tier: **24 is locked** — no designed cell in any pointer world at any density may cross it, and the system's smallest control (fine, compact, size 1) sits at exactly 24. **44 is the opt-out default** — default density, size 2, coarse, which is what a consumer gets without choosing anything. Going below takes two deliberate acts: asking for size 1, or setting a denser theme.

**The consequence is a mechanism deleted.** With both guarantees carried by the designed geometry, no control needs a layout box that differs from its painted box, so no control needs a second element to paint into. The `max()` reserve is dropped; Button is one element plus its content slots, which is what "minimise layers" actually requires. The reserve only ever earns its keep for something whose visual size is genuinely below 24 — a Checkbox glyph — and that is a Checkbox decision.

Two laws replace it: every cell clears 24 in both worlds, and the default path clears 44 in geometry alone.

Rejected: raising coarse size 1 to the floor (erases the size index exactly where someone reached for it); a per-control `max()` reserve (a runtime mechanism compensating for a misread standard); keeping 44 filed as tier 1 (it is a target, not a requirement, and calling it locked would make every deliberate small control a violation).

## 2026-08-02 The pre-Button states close, and loading refuses to eat the label

Four of Button's five gates decided in one pass (§8, §4); motion deferred to its own discussion without gating — Button ships on §8's single canonical transition.

**Focus is one ring, always accent.** `:focus-visible` only, `outline` (follows radius natively, pills included, cannot move layout), offset 2, and the colour does not follow the control's tone — "where is focus" is one question system-wide, and Spectrum, Radix and Primer all landed on the same answer. The 3:1 adjacent-contrast requirement is a law, not a hope.

**Disabled remaps roles; opacity is refused.** Opacity is the industry shortcut (Material's 38%) and it stacks on tinted surfaces, silently voiding every generated contrast guarantee. The neutral remap keeps a designed, testable pair. Cursor stays default: `not-allowed` scolds, native platforms don't.

**Loading keeps the label, reversing Polaris/Primer.** Kushagra's call, and the reasoning is better than the industry pattern: a button that loses its label stops saying what it is doing. Spinner replaces the icon when one exists (same box, zero shift); otherwise it joins the label, and the slight width change on text-only controls is the named, accepted cost. Spinner itself is deliberately primitive — one element, border-top on `currentColor`, one rotate keyframe, no SVG, no JS — because performance is the system's first constraint. Under reduced motion it slows rather than stops; a stopped busy indicator is information lost.

**Icons are slots, not a dependency.** `--icon-size-1..4` = 16/16/20/24 (sizes 1-2 share 16: the ecosystem's grid has nothing legible below it). Hugeicons is the blessed set, installed by the app and the docs, never shipped by the library — a bundled set is dead weight, an update treadmill, and a licence surface. Only the box is pinned; the icon system proper stays open.

Rejected: label-hiding loading (above); a per-tone focus ring (two questions in one signal); `not-allowed` cursor; opacity-based disabled; shipping hugeicons as a dependency; a third motion duration nobody has ever justified.

## 2026-08-02 The preview finds the edge the laws could not state: the outermost Box has no tier context

Steps 4 and 4b shipped (Flex/Stack/Grid, the coarse cells, the Theme `pointer` prop), and building their preview rigs surfaced a constraint no string or mounted test had a reason to probe: **a tier reads the nearest ancestor query container, and a Box is a container for its children, never for itself.** The rigs' outermost Box sat at one column at every width — correct per spec, useless per intent. Every browser law had wrapped a Box in a Box, so the suite was structurally incapable of noticing; the demo built for human eyes found it in one render. A law now pins the edge, §2 documents it, and whether Theme's element should be a container (making "inside a Theme, tiers always work" the rule) is an open question gating Button.

Same arc, worth one line each: the coarse world costs +519 bytes gzipped for ~20KB raw of cells, which is the emission strategy's whole bet paying off; the preview page defaulted to no `data-pointer`, so the media-scoped `auto` path could never have fired on a real phone — sections now default `auto`, making a phone on the LAN the honest test of §16's default; and the fine escape must *re-declare* the fine sets, because a nested scope that declares nothing inherits coarse and escapes nothing.

## 2026-08-02 The pointer axis: touch is a second geometry, not a mobile mode

New §16, THESIS.md folded into the repo, and the pre-Button gate list grows to five. The frame that settled it: **fine and coarse are two complete designed renderings of geometry, the way light and dark are two complete renderings of color.** Same components, same index, same laws — different placed values. The signal is what touches the screen (`pointer: coarse`), never width: an iPad at 1024px gets coarse values at full desktop width, and a narrow desktop window keeps fine ones.

**The floor is locked; the geometry is an opt-out default; the numbers are taste** — the first decision to sort by THESIS §7's tiers end to end, which is most of why the tiers earned their fold-in. The 44px floor encodes twice: coarse height sets place most sizes at or above it by design, and a `max(44px, height)` layout reserve covers the sizes that deliberately stay small, so size 1 and size 2 remain distinct instead of both flattening to the floor. Reserving layout space instead of overlapping neighbours is what dissolves the collision problem that killed hit-area expansion. Opt-out is a Theme prop symmetric with appearance — `pointer: fine | coarse | auto` — and pinning it doubles as the desktop preview mechanism.

**Spacing does not move, and that is the load-bearing exclusion.** Controls grow, gaps hold, layouts adapt on their own; a space palette that inflated under coarse would widen gutters on the smaller screen. Static surfaces hold too — but interactive surfaces (rows, list items, clickable cards) are §10's "ghost-emphasis control wearing a container", so they are tap targets and inherit the floor through machinery they already reuse.

**`min-height` replaced `height` in §4 on the way** — fixed height stays the design intent, but a hard `height` clips a 200%-text-resize label (WCAG 1.4.4) and truncates wrapped ones. Identical render in every normal case; growth only where the alternative is clipping.

**Corrected mid-arc, worth keeping:** the 17px mobile body figure was imported from Apple's *native* HIG as if it were evidence — the web ships ~16px bodies almost universally and iOS Safari doesn't honour Dynamic Type — so whether body text shifts under coarse (vs control labels only) stays open, and the type shift is not the growth mechanism anyway: under §4's model only the height token can grow the box, and both families re-place independently.

Rejected: rem-derived geometry from a root font-size switch (one root scales gutters and type together — a multiplier by the back door, on the axis we control rather than the one the user does; rem's real job, honouring the user's text preference, is a separate open question); the floor as `max()` on the height token itself (size 1 and 2 both render 44 and the index collapses); invisible hit-area expansion via pseudo-element (its safe extent depends on neighbour gaps, which CSS cannot read — the overlap failure is silent); responsive `size` as the mechanism (opt-in, so the floor depends on every author remembering — the exact inversion THESIS §7 forbids); width or breakpoints as a signal anywhere in the axis.

## 2026-08-02 An audit of the layout layer: the browser suite was testing the stylesheet, not the components

Swept the work from the token pipeline through Theme against the docs. The finding that matters is not any single defect but what the suite's shape was hiding.

**A browser test that hand-writes its own markup proves the stylesheet and nothing else.** Every one of the twelve browser laws mounted `<div class="kk-box" style="--kk-p: ...">` — the markup Box is *supposed* to produce. So the stylesheet was thoroughly proven and the entire React half was asserted nowhere: prop to custom property, token index to `var()`, tier key to tier var, the `render` merge, Theme's nesting and inheritance. It looked like coverage because the tests were about the right subject; they entered the system one layer below the part nobody had checked. Real components are mounted now, and the resolver has node laws of its own.

**The split between the two projects is itself load-bearing, in both directions.** `p={0}` emitted `var(--space-0)` — the palette starts at 1 — and rendered `0px` anyway, because an unset custom property falls back to the property's initial value and padding's is zero. No browser test could ever have caught it; only reading what the resolver *writes* shows a working token apart from a broken one. The mirror case is the one from the entry below: a stylesheet can be textually perfect and compute nothing. Bare indices are bounded by the palette now, and out-of-range digits pass through as raw CSS where a wrong value is at least visible.

**`layout.css` was generated, committed, and unlawed** while `tokens.css` had a drift test — so a hand edit to the half of the CSS carrying the responsive mechanism would have survived CI. Both are covered now, and both mutations were checked to actually fail.

**The type refused the ordinary conditional prop.** The package compiles with `exactOptionalPropertyTypes`, under which `Partial<Record<...>>` rejects `p={cond ? "4" : undefined}`. A type that turns the normal spelling into an error pushes people to the escape hatch, which is the opposite of what §3's whole enforcement argument depends on. `| undefined` is explicit now.

Smaller, all fixed: nine screenshot artifacts were committed, one of them from a debug test file that no longer exists (`__screenshots__` is ignored now); `config.ts` still carried the disjoint-bands-make-it-safe argument that the browser had disproven and §6 had already been corrected for; the docs spelled remap vars `--kk-gap` where the code writes `--kk-g`; and the entry below claimed §14 step 4 when only Theme had shipped.

Not fixed, recorded instead: **Theme shipped ahead of the dark-mode SSR decision**, which REVIEW.md listed as its gate. Nothing renders an app yet so the debt is invisible, and it comes due at `apps/docs`. Naming it beats quietly deciding the gate was never real.

## 2026-08-02 Box and Theme land, and the browser finds four things the string tests could not

§14 step 3 and the Theme half of step 4 — Flex, Stack and Grid do not exist yet, and the first version of this entry claimed the whole step. The responsive mechanism is generated from one prop table, Box is the engine and Theme scopes the tokens, and the suite gains a browser project because the claims that mattered most had been asserted in prose for days and verified nowhere.

**Every failure below was found by the browser suite within minutes of it existing.** Three of the four were invisible to a test that reads generated CSS as text, because the text was correct and the *engine* disagreed with what we thought it meant.

**A shorthand followed by longhands does not degrade the way it looks like it should.** `padding: var(--kk-p)` then `padding-block-start: var(--kk-pt)` renders 0 whenever `pt` is unset, because an unset custom property makes its declaration invalid at computed-value time and the property falls back to its *initial* value rather than to the earlier shorthand. Shorthands are expanded now, and the specificity of `pt` over `py` over `p` lives inside one var chain per longhand, where it behaves.

**Every Box was an inline element.** Same rule, worse blast radius: `display: var(--kk-d)` with nothing set falls back to `display`'s initial value, which is `inline`, not `block`. Width and height were ignored, block padding collapsed, and `container-type` does not apply to inline boxes — so no Box was ever a query container and no responsive tier could ever have fired. The prop table now carries an explicit fallback for properties whose CSS initial value is not the sensible default; `display` is the only one that needs it.

**And the one that invalidated an argument in the spec: a custom property reference is substituted where it is DECLARED, not where it is used.** `--radius-control-2: var(--radius-2)` in `:root` is baked to the default palette immediately, so a `[data-radius]` block further down the tree never reaches it — setting a radius level did nothing to control radii. The disjoint-band design was justified on the grounds that the two axes never write the same token and therefore compose; that reasoning was wrong, and only a browser could say so. The generator now emits every (radius x density) cell, which is exact because Theme writes both attributes on one element. Bands still earn their keep for `full` capping surfaces; they just were not sufficient.

**`"use client"` was being stripped by the bundler**, which the audit had warned about and the tsdown bump had not actually fixed: bundling merges modules and drops their directives, and the failure only appears in a consumer's RSC app. Output is unbundled now, and the build walks the source for directives and fails if any is missing downstream.

The mechanism itself: one prop table drives the resolver and the stylesheet, so a prop cannot exist in one and not the other. Cost is O(longhands x tiers) and does not move when tokens are added, because no value ever appears in the CSS. Tiers are container-keyed, three of them, semantic.

Rejected: a shorthand-plus-longhand emission (above); `banner: '"use client"'` on the bundle (marks every export a client module, including ones that are not); reading custom properties directly in tests (`getComputedStyle` hands back the unresolved token stream, so a probe has to actually use the value).

## 2026-08-02 Colour finishes: chroma against the boundary, P3, contrast, and a brand colour going in

Everything after the generator's first landing, in one entry because it was one arc: making the output actually look right, then making the section's headline claim true.

**Chroma was authored as absolutes, and they were wrong in both directions at once.** Every light step of every hue asked for more than sRGB holds and was silently clamped — so the curve did nothing through steps 1-8 and hold-L-reduce-C was doing all the work, which is the reverse of what §7 describes. Meanwhile the solid band asked for *less* than available: red sat at .17 where sRGB allows .254. Chroma is now a **fraction of what the gamut holds at that lightness**, and the per-tone knob is `vividness` from 0 to 1. Red gained 50%, green 29%, magenta 31%. The curve means what it says at every step, nothing is silently clipped, and P3 became a parameter rather than a rewrite.

**P3 ships behind `@supports`, layered over the sRGB values rather than replacing them.** It was worth the bytes precisely where sRGB constrains a hue most: cyan +31%, sky +25%, blue +22%, against indigo's +4%. Blue and sky had been sitting *at* the sRGB ceiling — 0.185 of a possible 0.187 — so their flatness was the gamut's shape, not an under-ask. The alpha ramp deliberately stays sRGB: its least-alpha solve assumes sRGB compositing, and surface nesting gains nothing from a wider gamut.

**`contrast="high"` is generated, and its claim is "as much contrast as each colour permits", not a fixed shift.** The first version asserted a uniform +9 Lc, which is the dangerous kind of law: insisting every band move is exactly what pushed yellow's borders below their cusp and turned them olive. Bright hues now take no border shift at all and gain in the text band, which is the one place the ladder structurally guarantees headroom. A band that stays put is the setting working; the only failure is a pairing that comes out worse. Both cases are asserted, so nobody later "fixes" the no-op.

**Six bugs came out of looking at the preview, and four of those were found by a law rather than by eye.** The pattern is worth keeping: each one was invisible until a law existed that stated the intent.

- The contrast token was recomputed per gamut, so P3's more saturated red tipped APCA to black — the same button rendered white-on-red on one display and black-on-red on another. Decided on the sRGB rendering now: the label is a design decision, not a per-display computation.
- A fixed interaction direction ("darken in light, lighten in dark") reasons against the background and therefore walks a fill *toward* its own label half the time. Dark destructive pressed measured Lc 59; every dark-labelled bright hue measured 53-55. Direction follows the label now, so hover and press are strictly more legible than rest.
- The excursion is bounded by **what the hue can hold**, not a fixed delta. Yellow was olive going down and washed out to near-white going up, shedding 54% of its chroma — a fill at its cusp is hemmed in on both sides. States now travel as far as they can while keeping 75% of the resting chroma, direction chosen by which way affords more of it.
- Neutral's states were 0.24 / 0.20 / 0.16 and read as one flat black. A low-chroma solid moves *toward* its label (the visible direction, safe because it started at an extreme) and takes a wider step, since a grey has only lightness where a hue also shifts saturation.
- The two state-widenings were multiplying rather than taking the larger, dropping dark neutral's pressed label to Lc 55.
- High contrast pushed dark neutral's step 12 past pure white. Found by the law being written for the bug above it.

**The intake landed last, and it is what makes this a system rather than a generator.** `toneFromColor` takes a CSS colour: hue as-is, vividness as the colour's chroma measured against what its own lightness could hold, and the input's lightness carried as a pin. Light mode reproduces the supplied hex **byte-identically at step 9**; dark mode re-derives, since no promise was made about a dark solid. Verified against Radix violet, Vercel blue, Linear indigo, Radix red and yellow, and a teal — and every one is put through the full legibility suite in both modes, because pinning that bought fidelity at the cost of the guarantees would make this a colour picker. Out-of-band inputs snap, and a near-black brand colour falls through the low-chroma path to a near-black solid, which is what it wanted. Generated solids also round-trip: any step 9 on the preview can be pasted back in as an accent to reproduce its own scale.

Final shape: 106 laws, 4,316 bytes gzipped against a 40,960 ceiling, for three tones in two modes with full alpha ramps, a P3 block and a high-contrast block.

Rejected: `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts the output did not change, never that it is correct); normalising vividness across the configured tones so hues read at equal intensity (it works, but adding a destructive red would then silently change how the accent looks, and action at a distance is worse than a documented asymmetry); compressing the state excursion rather than reversing it (a fill near its cusp can only go lighter by shedding chroma, so the pressed yellow stopped being yellow).

## 2026-08-02 The colour generator lands, and interaction states learn to move away from their label

§14 step 2b. Three tones in both modes generate from a hue angle and a chroma peak each, 2,102 bytes gzipped for the whole token file against a 40,960 ceiling. `culori` does the colour-space work at build time; APCA-W3 0.1.9 is implemented directly, thirty lines, so the contrast guarantee has no licence question attached to it. The browser does no colour maths.

**The law tests earned their existence three times before the generator was finished.** Each failure was a real design defect, not a wrong assertion, which is the whole argument for laws over snapshots.

**First: the dark text role missed its own target.** `--destructive-text` measured APCA Lc 57 on the soft fill it sits on, under the Lc 60 body-text bar. Fixed in the ladder, dark step 11 from .77 to .80, rather than by lowering the bar.

**Second, and the interesting one: a fixed interaction direction walks a fill toward its own label half the time.** §7 said darken in light, lighten in dark, reasoned against the *background*. But in dark mode lightening a solid moves it toward its white label — the destructive pressed state landed at Lc 59. The same fault in mirror image hit every bright hue in light mode: yellow, lime and cyan carry black labels, and darkening on press dropped them to Lc 53-55, the worst cases in the system.

The rule is now **away from the label, never a fixed direction per mode.** The label is chosen on the resting fill, then hover and press move away from it, so the interaction states are *strictly more* legible than rest and only rest has to clear the bar. It reads correctly too: pressed separates further from its label rather than muddying into it. One exception falls out of the arithmetic — a fill already at an extreme has no room to move away (dark neutral rests at L .94 with a black label), so it moves toward the label instead, which is safe precisely because being at an extreme is what left the margin.

Worst case across every hue tested, both modes, is now Lc 68. It was 53.

**Third: the cusp pull needed to be stronger than guessed.** At 0.55 the bright hues sat in the middle-lightness zone where neither black nor white clears comfortably. 0.72 puts them where dark text has room.

The hostile-hue suite is the reason all of this surfaced: brand yellow, neon lime, hot magenta, cyan, near-black navy and a near-grey accent, each asserted against the same laws as the shipped tones. The near-grey case also confirms the low-chroma solid remap keys on chroma rather than on the tone being *named* neutral.

Also built: the alpha ramp (least-alpha overlay that composites back to its step, law-tested by recompositing), and colour swatches in the preview, because Lc numbers say a colour is legible and nothing but an eye says it looks right.

Rejected: pulling in `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts that the output did not change, never that it is correct); lowering the target to Lc 45 for interaction states, which would have passed all three bugs.

## 2026-08-02 highContrast does not ship, because both of its jobs are role-layer bugs

Radix's per-component `highContrast` was being reached for as a *look* — a darker, more authoritative button label — which is not what the name says and not what the mechanism is for. Two orthogonal problems were hiding under one prop, and neither one is about contrast.

**Radix's step 11 is placed at a floor**, the minimum clearing 4.5:1 on the backgrounds it sits on, so `highContrast` is an escape from a value tuned to a threshold rather than to how it should look. We generate and verify with APCA, so the default can sit where it looks right and still be provably legible. That removes the reason the escape existed.

**Fix one: a UI label is not a link.** `--accent-text` (step 11) stays where it is, because links and prose on a tint want the lighter, more chromatic value and *should* look different from a button label. Controls read a new `--accent-label`, generated between 11 and 12 — enough weight to read as a label, enough chroma to still say accent rather than ink.

**Fix two: prominence comes from chroma or from lightness, and at zero chroma lightness does all the work.** A mid-grey solid never reads as loud, whatever its lightness. So below a chroma threshold, `--accent-solid` resolves to step 12 rather than step 9. Keyed on chroma, not on the name "neutral", so a desaturated brand accent gets the same correction. Dark mode falls out free: step 12 there is near-white, giving the light primary with a dark label that Vercel, Linear and Radix all ship.

**Both live in the role layer, and that constraint is what makes them right.** The first instinct was to bend the solid band's lightness by chroma, the way section 7 already bends it by hue. That breaks the system: neutral step 9 at L .2 would sit *below* step 12 at .24, destroying the ladder's monotonicity and the guarantee that step 9 reads as the same step across every hue. Section 7's "do not mutate the scale" earns its keep here.

**Consequence worth remembering: the ramp runs out at 12.** A low-chroma solid cannot take +1/+2 for hover and press, so those derive as generated L-deltas off step 12 — the same problem that made `--accent-solid-active` a generated token rather than a step.

So `contrast` is now only what it should always have been: a Theme-level accessibility setting, honouring `prefers-contrast: more`, that shifts values globally. Section 7 previously framed it as a design knob with a cost to budget; that framing was wrong.

New law for the build: a label must clear APCA against **every** background in its rung, not only the resting one. Medium rests on step 3 and presses to 5, and the press state is where a label that passed at rest fails silently.

Rejected: a per-component `highContrast` prop (an appearance escape hatch, contradicting appearance-as-output, growing a boolean on every component whose meaning shifts per rung); moving step 11 darker (links and prose need it where it is); a step 11.5 (the scale does not gain steps — extra states live in the role layer); keying the solid remap on `tone === "neutral"` (misses the desaturated brand accent, which has the identical problem).

## 2026-08-01 Emphasis collapses to three rungs, border leaves the ladder, and material becomes backdrop defense

Supersedes the variant decision made earlier today and the material parts of sections 9-11. Kushagra's call, worked out in parallel with the token build.

**The five-name recipe set is dead.** `solid / soft / surface / outline / ghost` named construction rather than loudness, which is why four emphasis rungs could never map onto it cleanly. The earlier fix — keep `variant` public underneath `emphasis` as a documented escape — preserved the mixed metaphor instead of removing it, and left users with two props and no rule for choosing between them. There is now one axis: `emphasis = loud | medium | quiet`. Three rungs, because a rung has to earn a visible step to exist, and three stays obviously separable (roughly what iOS ships).

**`bordered` is the reason the ladder ever looked lossy.** `surface` and `outline` were never loudness levels; they were *containment*, a different question. As an orthogonal boolean it reproduces the whole old range from two comprehensible props: `quiet + bordered` is the old outline, `medium + bordered` the old surface. The blocker that opened this whole thread turns out to have been a factoring error, not a counting error.

**Material is backdrop defense, not decoration**, which is what makes it testable — does the label survive — rather than aesthetic. It is `solid | thin | thick`, off by default, and available on any component that can *float*, buttons included. That corrects the old "containers only" reading in both directions: a Card in a solid layout has nothing to defend against, and a Button over a photo does. `thin` and `thick` are two recipes rather than two magnitudes, since saturation and opacity do not order monotonically between them.

The load-bearing detail is that the brightness floor's direction follows the label: dark label brightens the backdrop, light label darkens it, which is what lets a control survive an arbitrary photo instead of the demo one. It needs no new plumbing — section 7's APCA-derived `--accent-contrast` already carries exactly that signal, so the material reads it and the label never moves.

**Performance has no clever fix, so the rules are architectural**: one glass per stack (the toolbar is the glass, its buttons are plain), material on fixed chrome that content scrolls under rather than on things that move and re-sample every frame, `prefers-reduced-transparency` honoured, `@supports` fallback to opaque. Blur radii are provisional until measured on a mid-tier device.

**Placement stays the user's.** Material over a solid surface is a muddy smudge, and the answer is allow-and-guide rather than block (rigidity leaks) or silence (people ship the smudge and blame the library) — the same stance as `className` forwarding and the margin escape.

Rejected: keeping `variant` as a public escape beneath `emphasis` (two props, one job); four or five rungs (a rung that is not visibly distinct is not a rung); border as a rung (the original error); `regular` as a material level (it was either the off-state or a status word on a magnitude axis); naming the loudness prop `variant` (the docs would spend forever explaining that the prop is not about looks); gating material placement by component (the library defines what material looks like, never where it goes).

## 2026-08-01 The radius prop becomes designed palettes, and the palette splits into two bands

The Theme `radius` prop was the last multiplier standing after density lost its own. It is now five designed palettes (`none`, `small`, `medium`, `large`, `full`) emitted under `[data-radius]`, and `--radius-factor` is gone.

**`full` is what settles it.** A pill comes free because CSS clamps `border-radius` to half the smaller dimension, but §6 requires surfaces to be *capped* at the same time, so a dialog does not become a giant lens. One factor scales controls and surfaces by the same amount and structurally cannot do both. A designed palette can: the control band goes to 9999 while the surface band holds at its medium values. The multiplier was already broken for the level that most needed care.

**The palette split into disjoint bands, and that is the load-bearing part.** Steps 1-5 are the control band, 6-7 the surface band. Density only ever picks a step; a level only ever says what a step is worth. No token is written by both, so the two axes compose instead of racing.

The alternative considered first was letting the radius level re-declare `--radius-control-N` directly and relying on source order, since the generated file controls it. That fails on nested Themes: a custom property set by a nearer ancestor wins regardless of source order, so an inner Theme setting only `density` would silently drop an outer Theme's `full`. Disjoint bands survive that; cascade ordering does not.

`none` squares everything including `--radius-full`, since a kill switch with an exception is not a kill switch. Surfaces moved up a step with the split, so a card reads 16px and a dialog 24px where they were 12 and 16 — a deliberate consequence of giving surfaces their own band, worth re-judging by eye.

**Caught on the first look at the preview: `full` was capping surfaces at medium's 16/24 while `large` already sat at 24/32, so cards got squarer as the dial turned up.** The cap now sits at large's values, and a law asserts the real invariant — for any step, the value never decreases across `none, small, medium, large, full`. Turning the dial up must never turn a corner down. Worth noting the shape of the miss: the cap was chosen against the requirement it came from (§6's "do not let a dialog become a lens") without checking it against its own neighbour on the ladder.

Two more law-test corrections fell out of building it. The "palette is non-decreasing" law was wrong: at `full` it must drop at the band boundary, so it now asserts monotonicity within each band. And the test helper that sliced a rule body ran to end-of-file, so a density block appeared to contain every later block's declarations; it now bounds at the closing brace. Both were tests asserting something looser than intended, which is the failure mode worth watching in a suite built on absence checks.

## 2026-08-01 The corner is held to a fraction of its box, and the palette gains a 10

Seen in the density matrix on the first render: the largest controls read as capsules. The cause was that radius climbed with the size index rather than with the box. Measured against its own height, default ran 0.14 at size 1 to 0.25 at size 4, comfortable reached 0.40, and compact came out at 0.30, rounder than default, because it reused the same radii on smaller boxes. A dense mode being bubblier than a roomy one is backwards.

**The rule is now that a corner holds near a constant fraction of its box (~0.2), growing in absolute terms with size but not in proportion.** §6 already said a bigger control wants a bigger corner; it did not say how much bigger, and "proportionally rounder" was the wrong reading. Resulting ratios: compact 0.17/0.21/0.18/0.20, default 0.14/0.19/0.20/0.21, comfortable 0.18/0.20/0.20/0.20.

**The palette gained a 10px step to make that expressible.** Controls live between 4 and 12, where the old curve jumped 8 to 12 with nothing between, so every correction overshot by 50% and the size-4 corner had nowhere to land. Eight steps is still inside §6's perception cap. Surfaces moved up with the renumbering: `--radius-surface` is now step 5 and `--radius-overlay` step 6, both unchanged in pixels.

Rejected: leaving the palette alone and choosing coarser control radii (the wobble was the problem, and no combination of 4/6/8/12 holds the ratio); dropping the climb entirely for one flat control radius (a size-4 corner genuinely should be larger in absolute terms, which §6 is right about).

## 2026-08-01 Scale keeps its wiring and loses its API

`--scale` stays a multiplier on every length token and stays at 1; the Theme `scale` prop is deferred. Once density took "bigger box, same type," the only case left for scale was "everything bigger, type included," and that splits into browser zoom (which already does it, and is where accessibility guidance points), a config change to the anchors (for a permanently larger system), and the size index (for one larger region). None of those needs a runtime knob today.

**Keeping the wiring costs nothing that matters.** At `--scale: 1` every token resolves to exactly its designed integer, so the arbitrary products only appear if someone opts in. The price is about fifteen characters per token, highly repetitive, which gzip removes almost entirely.

**Not shipping the prop is what avoids the problem**, because a shipped `scale` would be the one factor in the system still producing values like 26.78px after density stopped. Adding a prop later is non-breaking, so this is the reversible direction.

Rejected: stripping `--scale` from the calcs entirely (cleaner, but it forecloses the option for a saving gzip already provides); shipping the prop now as a free multiplier (arbitrary products, and nobody has named the steps it should have); designed sets for scale the way density got them (density re-declares ~16 control tokens per level, scale would re-declare ~40 — every space step, radius step, type step and line height, plus the control family — for a knob with no demonstrated demand); CSS `zoom` as the sanctioned scoped mechanism (it does not reach portaled content, so a zoomed region's popover renders unzoomed; fine as an app-root escape, wrong as an API).

## 2026-08-01 Density becomes designed sets, not a multiplier, and it takes radius with it

Density's job is breathing room at a fixed type size. Canva's signup button is the case that names it: the same label size in a much taller box with a much larger corner. `size` grows everything including type; density grows only the box. v1 had size 2 at 32px height with 14px type and that pairing was right, but some interfaces want the bigger box without the bigger type, and reaching for size 3 to get it moves the type too.

**It is a set of designed values per level, not a multiplier.** Two reasons, and the second is the decisive one. A multiplier produces arbitrary products (`32px * 0.95 * 0.875` = 26.6px), which the system rejects elsewhere: §6 already forbids deriving radius from height on the grounds that each value should be a designed point on a curve. More importantly, a multiplier makes every taste correction *global* — you cannot say "spacious size 2 should be 44px, not 45px" without moving all four sizes in that level. Designed sets make each correction local, and correction is the actual work.

**Shape:** designed heights per level, plus a step offset into the existing palettes for the families that reference them (control-px, control-gap, radius-control), with a per-cell override where the offset lands wrong. Roughly twelve raw numbers and three offsets, about the same decision count as the multiplier model, with the fractions gone and every rendered value a placed point.

**Radius joins the set.** This reverses the call made earlier the same day. Holding radius fixed is right across a small delta, where the radius-to-height ratio moves 0.19 to 0.21 and nobody sees it. It is wrong across density's real range: a 44px box wearing a 6px corner reads boxy, and §6's own argument ("a bigger control wants a bigger corner") is about visual size, not about the size index.

**Untouched, deliberately:** the space palette, so compact never shrinks page gutters, and type, which is the entire point.

**Theme level only, with nested Theme as the escape.** A per-component `density` prop duplicates `size` (a spacious size 2 at 44px against a default size 3 at 40px is two knobs producing overlapping geometry with no rule for choosing between them), and density is a property of a region rather than of an element. The airy hero CTA is reached by putting a nested Theme on the hero section that already exists, via §5's `render` escape, so it costs no extra DOM. Same mechanism §7 uses to rebind accent for a subtree instead of adding a per-component color prop.

**One law, and only one:** for a given size, compact < default < spacious. Spacious size 2 landing above compact size 3 is not drift, it is what density means; a law forbidding it would encode taste as correctness.

**Built the same day, and two details changed on contact.** The step offsets became explicit per-level arrays: an offset could not carry radius (compact at -1 put a size-1 control on `--radius-0`, a square corner), and once one family needs its own array the offset saves nothing over twelve readable rows of data. Compact therefore keeps default's radii deliberately, since a fixed corner reads boxy when the box grows, not when it shrinks. Measured cost of the two extra levels: +108 bytes gzipped, against the +50% guess, so the whole token file is 730.

The heights landed at 24/28/34/40, 28/32/40/48, 34/40/50/60, built so one density step moves the box about one size step while the label holds: compact size 2 stands where default size 1 does, comfortable size 2 where default size 3 does, all three setting their label at font-size 2. That pairing is the axis stated in numbers.

Still open: the numbers themselves, the level names and count (§5 says `comfortable`, which may understate the airy end), whether surface padding takes density (lands at Card), and a size-by-density matrix in the docs app — which is the real gate, because twelve heights across three levels cannot be judged by reading a config file.

Rejected: multiplicative density (arbitrary products, global corrections); density as "another spacing token series" (height is not spacing, and §3 forbids aligning the scales — `--space-7` at 32px matching a size-2 control at 32px is exactly the coincidence the doc warns against); a per-component density prop; a cross-level ordering law.

## 2026-08-01 The token pipeline lands, and density enters at the semantic layer only

Space, radius, type, and the control family generate from `src/tokens/config.ts`, which now holds every raw pixel constant in the system. The generator is §12's multiplier table expressed as code, which is the point: `--scale` is global, `--density` reaches only control height and control inline padding, `--radius-factor` only radius, and the law tests fail if any family drifts from that table.

**§3 and §12 contradicted each other, and the fix keeps both.** §3 specified `--control-px-1: var(--space-3)`, a pure reference with no multiplier; the amended §12 says control spacing takes density. Emitted as `calc(var(--space-3) * var(--density))`, both rules hold: the semantic token still points at the palette instead of restating 8px (§6's reference-not-coincidence law), and density enters at the semantic control layer exactly as §12 says. The space palette itself stays density-free, so a compact theme tightens controls without shrinking page gutters. That coupling was the defect REVIEW.md flagged in Radix's single `scaling` knob.

**Values that were illustrative are now pinned:** line heights 16/20/24/26/28/32/38/48/62px (ratios running 1.33 to 1.5 through the reading sizes, tightening to 1.11 at display), letter spacing flat through the reading sizes then -0.005 to -0.025em, system stacks as the family defaults with `--font-heading` chaining to `var(--font-body)` so §5's `font` shorthand falls out for free. `--radius-full` is deliberately not scaled: it is a clamp sentinel, not a measurement.

**Generated files are protected by a law test, not a hook.** The suite regenerates and compares against the committed artifact. Proved by appending a comment to `tokens.css` by hand: the test failed, and passed again after regeneration. A hook only protects the session that has it installed; a test fails CI for everyone, including a future contributor who never read ENGINEERING.md.

**The budget ratchet fired on its first real growth**, refusing 20 to 604 bytes gzipped until the baseline was re-recorded in the same commit. Working as designed: intentional growth is cheap to accept and impossible to take silently.

Rejected: a single derived line-height ratio (§15 already argues one ratio is wrong at both ends of a nine-step ramp); unitless line heights (they would re-derive the ratio from font-size, which is the derivation §15 rejects, and paired px values scale correctly through `--scale` anyway); density on the space palette (compact would shrink page gutters, the coupling defect); a PreToolUse hook guarding generated files (protects one machine, not the repo).

## 2026-07-31 The scaffold ships audited, and the budget gate becomes a ratchet

pnpm, Turborepo, tsdown, Lightning CSS, Changesets, Vitest, with the CI budget gate wired on day one per §14. Two adversarial audits ran against the result before anything was committed, and two of their findings were real defects invisible from the working tree.

**The published package would have had no types and no client directives.** tsdown 0.12 emitted a content-hashed `index-BNjKmUhF.d.ts` while the exports map promised `./dist/index.d.ts`, so every TypeScript consumer would have gotten "could not find a declaration file"; the same version stripped `"use client"`, which would crash any hook-using component imported from a Next.js server component. Both fixed by moving to tsdown 0.22, and the build now asserts its own output files exist. That assertion immediately earned itself by catching 0.22 defaulting to `.mjs`.

**The budget gate contradicted its own spec.** All three documents say the build fails on *regression*; the script checked only a fixed 40KB ceiling, so every byte of creep from zero to 40,959 would have passed silently. It is now a ratchet: `budget.json` carries a baseline alongside the ceiling, and any unexplained increase fails.

Two smaller corrections worth remembering: Lightning CSS was doing bundle and minify only, because without `targets` it emits no prefixes and passes nesting through untranspiled, so §2's promise of "minify, autoprefix, nesting" was two-thirds inert; and the release workflow failed on its first push trying to publish 0.0.0 without an `NPM_TOKEN`, so it is manual until there is something to publish.

Rejected: Bun (pnpm's strict isolated `node_modules` makes phantom dependencies fail immediately, which is a correctness gate for a published package; `Bun.build` emits no declarations; `bun test` has no browser mode, and the CSS law tests need a real browser to evaluate `@property` and container queries); ESLint 10 and TypeScript 7 despite both being current (typescript-eslint 8 pairs with ESLint 9, and TS 7's native compiler is an ecosystem-compatibility bet the scaffold does not need to take); a `no-restricted-imports` depth pattern for package boundaries (it false-positives on legitimate nesting like `src/components/button` importing `src/system`).

## 2026-07-31 The review's blockers close: responsive props compile by variable remap

REVIEW.md's three blockers are resolved in the spec, and the largest one reversed a diagnosis the doc had made confidently.

**The CSS-size story was wrong about the shipped codebase.** Measured v1: ~91.5KB gzipped, of which component CSS is ~55KB (`sidebar.css` alone 48KB raw). The doc had argued colors were the bulk and component CSS was lean; component CSS is not lean, the real mass is responsive prop utilities, and the doc had no compile story for them at all.

> **Corrected 2026-08-02.** This entry originally put v1's colour scales at ~2.8KB gzipped and concluded the colour diagnosis was simply wrong. Re-measured, `tokens/colors/` is 31 scales at 29.3KB gzipped — ~1.1KB each, so 2.8KB was a sample read as a total. Colour is a major term and generating only the configured tones earns its place; the surviving claim is only that component, layout and utility CSS together are much larger, so responsive props are the bigger lever. Recorded rather than edited away, because the wrong number is what made the argument feel decisive, and a number that convenient should have been checked twice.

**Variable remap is the answer, and its shape is what makes it small.** The component writes tier values as inline custom properties; the stylesheet holds a fixed set of arbitration rules per prop that decide which tier's variable wins. Values never enter the stylesheet, so cost is O(props x tiers) forever and the token dimension, the multiplier behind the 55KB, disappears entirely. Raw strings like `gap="13px"` ride the same pipe at zero additional cost, which pregenerated classes structurally cannot do. Because the mechanism is value-agnostic, structural props (`direction`, `columns`, `display`, `areas`) remap identically to spacing.

**Tiers are container-keyed, few, and semantic**, so a component adapts to its slot rather than the window and the same Grid is correct in a drawer and a main column. Both native platforms independently landed there: iOS ships two size classes, Android three window classes, and neither has per-prop pixel breakpoints anywhere in its API.

The other two blockers: the fixed L ladder now bends for the solid band only, as a bounded continuous function of hue, because saturated yellow does not exist at L .62 and an arbitrary user hue means a brand yellow will eventually arrive; and `variant` becomes public underneath `emphasis`, because four rungs cannot address five recipes and `outline` was otherwise unreachable through the semantic API.

Rejected: pregenerated token-by-breakpoint utility classes (v1's mass, and no way to express an arbitrary value); build-time scanning of consumer source in the manner of Tailwind's JIT or Panda (requires a compiler in every consumer's build, breaks on runtime-computed props like `gap={isCompact ? "2" : "4"}`, and contradicts §2's no-build-step position); a fifth emphasis rung or deleting `outline` to make the ladder cover the recipes (distorts the semantic layer to protect an abstraction); viewport breakpoints as the primary tier vocabulary; Braid-style `className` lockdown (kills legitimate escapes such as consumer grid placement and animation libraries; a shipped lint rule polices defection instead).
