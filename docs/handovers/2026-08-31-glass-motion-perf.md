# Glass + motion performance assessment (2026-08-31)

Six-lens audit, every finding adversarially refuted before it reached this report. 30 of 50 raised findings survived. Assessment only — nothing was changed.

# Glass + Motion Runtime — Final Assessment

## 1. VERDICT

**Yes, it is fast — on the default path it is nearly free, and almost everything expensive is opt-in.** `themeDefaults.material` is `"solid"` (`theme/theme.tsx:300`) and `useLens` returns before installing anything for `solid`/`on-glass` (`system/refraction.tsx:955`), so an app that never says `backdrop` pays zero lens, zero observer, zero filter. Motion is CSS-only: 41 transitions, zero uses of `all`, every property named, and the entry flight measured indistinguishable from solid at real panel sizes (8.33 ms both, glass and solid, 12 and 40 rows).

**The single biggest cost is the lens's per-frame GPU application, and it is a count cliff, not an area cost.** Measured on an M4 Pro: `blur+saturate` alone is flat at ~0.25 ms from 0 to 24 panes; add `--kui-lens` and it runs 3.28 / 5.17 / 7.32 / 9.60 ms at 4 / 8 / 12 / 16 panes — ~0.45 ms marginal per lensed pane, so twelve of them consume ~44 % of a 16.7 ms budget before anything else draws. Nothing in code or docs bounds the count, and `<Box backdrop>` is a *region*, so one authored word yields N lensed elements.

**The single biggest risk is five components handing React a fresh ref identity every render** (`dialog.tsx:324`, `alert-dialog.tsx:253`, `popover.tsx:265`, `composer.tsx:137`, `select.tsx:208`), which releases the filter and re-mints the map on any parent re-render — the exact defect Card, Shell and Notice were repaired for on 2026-08-26, with a per-component law each and no structural one. On a controlled Composer that is per keystroke.

The honest summary: the architecture is right, the defaults are right, and the findings below are a count bound that does not exist, five missed call sites, one animation on the wrong property, and a set of doc sentences that state bounds the code no longer holds.

---

## 2. THE COST BUDGET

All figures measured unless marked. Chromium (repo's pinned Playwright), Apple M4 Pro via ANGLE Metal unless noted; phone columns are CPU-throttle proxies and do **not** model a phone GPU.

### Main-thread JavaScript

| Work | Cost | Where |
|---|---|---|
| Lens map generation, per distinct box, warm | 0.24–0.40 ms (button 96×32 0.26, field 240×32 0.26, menu 240×300 0.38, card→320×208 0.28, dialog→320×240 0.36, full-page→320×200 0.28) | `refraction.tsx:376-586` |
| Glint mask, per distinct box | 0.14–0.32 ms, then a cache hit forever (`glints`, `refraction.tsx:689-698`) | `refraction.tsx:597-698` |
| First map on a cold page (JIT + `bendMemos` fill) | 9.1 ms, then 0.5 ms | `refraction.tsx:315-325` |
| Lens re-mint from an unstable caller ref | ~0.9 ms attributable per parent render, synchronous inside the commit (1.0 ms median vs 0.1 ms baseline, 600×420 card) | `refraction.tsx:851-860`, `1117` |
| Anchored panel open — this package's own reads | ~8 forced style/layout flushes pre-paint; 14 distinct geometry read sites across all phases; each flush scoped to the popup subtree (~30–40 layout objects), **not** the document | `floating.tsx:613,801,804,832,852,875,938` |
| Anchored panel open — document-wide, incl. Base UI + floating-ui | 20-row menu: 5,449 `getComputedStyle`, 1,398 `getBoundingClientRect`, ~254 position solves; **3.6 ms** summed inside every instrumented read | driven by the trigger's press spring under `layoutShift` |
| Same, real pointer press (spring largely spent) | 78–86 solves | — |
| ScrollArea observer traffic during a menu flight | 116 RO batches / 117 entries, **2.2 ms total**, 0.019 ms per callback, **0 React re-renders** | Base UI `ScrollAreaViewport` |
| `panelSeam`, per position pass | 3 calls (2 in `offset`, 1 in `transformOrigin`) = 6 `getComputedStyle`, ~1 forced flush | `menu.tsx:57-70`, `819`, `823` |
| Shell dev safe-area guard | ~2 `check()` per painted frame in which Shell renders; ≤7 rects + 6 gCS; 1 RO alloc + observe + disconnect **per render** | `shell.tsx:507-578` |
| Tree, per arrow key | 0.90 ms @55 rows / 2.50 @209 / **6.00 @506** / 12.40 @1001 — linear, ~0.012 ms/row; flatten+Set is 0.005 ms of it (0.08 %) | `tree.tsx:215,230,421-425` |
| `resolveBoxProps`, per Box | 35–140 ns; 0.13 ms for a 300-node full re-render | `system/resolve.ts:117` |

### GPU / paint

| Work | Cost |
|---|---|
| Lens, marginal per pane (320×220, repainting backdrop) | **~0.45 ms/frame** in the 4–16 pane range; 4/8/12/16/24 panes = 3.28 / 5.17 / 7.32 / 9.60 / 9.75 ms mean; frames >10 ms = 2 / 0 / 0.5 / 17.1 / 25.1 % |
| `blur+saturate` without the lens | **Flat** 0.19–0.29 ms, 0 % dropped, 0→24 panes, 1.69 M px covered |
| Cliff | ≥11–12 lensed elements each ≥~70 k px. Not a pixel budget: 8 panes at 600×400 (1.92 M px) drop 0 %; 12 panes at 320×220 (845 k px) drop 10 % |
| Lens cost with a *static* backdrop, one composited box moving elsewhere | 12 panes **6.08 ms/frame** vs 0.13 ms with `--kui-lens` removed — it does **not** require a repainting backdrop |
| `box-shadow` row 4 (`0 24px 64px -12px`), per surface per full repaint, DPR2 | ~0.15–0.2 ms. 12 surfaces repainting: 16.7 ms (vsync, 0 dropped). 60: 25.0 ms. Glass cast (contact+32+80): 41.6 ms at 60. Blast blur 64→16 px recovers ~100 % (25.0 → 16.7) |
| Dialog entry, whole composition | GPUTask 2.29 ms/frame vs 1.16 ms for solid-panel-no-scrim — **~2×**, ~14 % of a 60 Hz frame |
| Scrim | 1.296 M CSS px at 1440×900 = 5.18 M device px at DPR2, `blur(8px) saturate(0.8)`, live for `--overlay-reveal: 150ms` (`dialog.css:37,41`) |
| Body arrival blur | `filter: blur(6px)`→0 over ~504×700 for `--dialog-settle: 600ms` (`surfaces.css:2158,2788`) — compositor-animated, main thread 0 |
| Indeterminate Progress | **120.3 layouts + 120.3 style recalcs per second**, 16.55 ms/s TaskDuration vs **0.47 ms/s** for the identical `translate` keyframe; unchanged offscreen (5000 px below fold) and under `prefers-reduced-motion` |
| Ring/glint pseudos on a *resizing* pane | ~1.26 ms/frame per pane vs a plain hairline (1.353 vs 0.092); flat in box area (300→2400 px: 2.32 / 1.89 / 1.22 / 2.31 ms) — per-element layer setup, not raster area |
| feTurbulence rim on every `.kui-surface` | **Free.** 200 repainting cards with it and no shadow = 8.3 ms, identical to no background-image |
| ScrollArea scroll-edge mask | **Free.** 400-row list, 8.3 ms with and without |

### Bytes

`dist/styles.css` = 313,949 raw / **35,394 gz**; baseline 35,419, ceiling 40,960 (`budget.json`). Gzip deltas by concern (non-additive — dictionary sharing; residual ~14 % is selector text):

| Concern | Declarations | Raw | gz delta | % of budget |
|---|---|---|---|---|
| Glass (`backdrop-filter`, masks, conics, `--material-*`, `[data-material]`) | 508 | 34,711 | 4,159 | 11.9 % |
| Motion (transitions, `linear()`, clocks, keyframes) | 91 | 8,238 | 1,743 | 5.0 % |
| Shadow (`box-shadow`, `--shadow-N`, chrome/cast/relief/pool) | 112 | 6,359 | 1,009 | 2.9 % |
| Everything else | 6,034 | 215,227 | 23,085 | 66.0 % |

Sub-items: 5 `linear()` springs = 2,294 bytes / **714 gz (2.0 %)**, 173 sample points, each appearing exactly once (`tokens.css:172,190-193`); reducing steps 36→24 recovers 233 gz. 215 `@property` = 10,858 raw / 897 gz, **no measurable style cost** (A/B on a 4,505-element page: within noise). 5,092 of 6,745 declarations are custom properties; the substitution-at-declaration radius/padding cells alone are ~65 KB raw (`--radius-row-1..4` at 4,205 bytes each × 93 cells). Per-pane inline `--kui-glint` data URL: 1,278 chars (96×32 button) → 4,838 (any pane at the 320 cap). Dev `console.warn` strings shipping in every bundle: 2,655 bytes / ~1 KB gz. JS on disk 55 modules / 414,620 raw / 135,516 gz, but bundled+minified a Button-only import is **6,250 gz** and the whole namespace **26,142 gz** — both under the CSS baseline.

---

## 3. FINDINGS

**1. No bound on concurrent lensed panes; past ~11–12 the frame budget collapses.**
`system/surfaces.css:1319/1381/1420`, `refraction.tsx:1119`. Measured: 12 lensed panes = 7.32 ms/frame (44 % of budget), 16 = 17.1 % of frames over 10 ms, 24 = 25.1 %. `blur+saturate` alone is flat at ~0.25 ms across the same range — the docs' stated lever ("how many elements blur", `DECISIONS.md:1062`) names blur where the cost is the lens, and "one glass per stack" bounds *nesting* via `GlassScope` while `<Box backdrop>` marks a *region* and yields N siblings from one word. Cost does not require a repainting backdrop (12 panes = 6.08 ms with only an isolated composited box moving). Firefox pays zero; Android Chrome pays it on a weaker GPU, so the threshold there is lower — unquantified.
*Fix:* bound the lens by element count or viewport proximity (the 2026-08-24 handover's own unimplemented step 6).

**2. Five lens-bearing components mint a fresh ref identity per render, re-minting the map.**
`dialog.tsx:324` `ref={mergeRefs(lensRef, nameRef, clipRef)}`, `alert-dialog.tsx:253`, `popover.tsx:265`, `composer.tsx:137`, `select.tsx:208` — all unmemoised, versus `card.tsx:102` `React.useMemo(() => mergeRefs(lensRef, clipRef), [lensRef, clipRef])`. React detaches with `null`, `detach()` runs `release(s.id)` (`refraction.tsx:1117`), and `release` does `filters.delete(key)` + node removal (`:851-860`), so the reattach misses. Measured `url(#kui-lens-1)` → `url(#kui-lens-2)` per parent render, ~0.9 ms synchronous in the commit, plus a fresh ResizeObserver + MutationObserver and a `backdrop-filter` re-raster of the pane. Composer is per keystroke on a controlled value. Three per-component laws exist (`card.browser.test.tsx:1049`, `shell.browser.test.tsx:3413`, `notice.browser.test.tsx:251`); `useLensRef` itself has none, and each mounts its subject with no caller ref, so none exercises the public path.
*Fix:* memoise inside `useLensRef` or add one structural law over every `useLensRef` call site.

**3. The DEV flag does not fold, so dev-only observers run in production under any bundler that does not shim `process`.**
`shell.tsx:87`, `box.tsx:23`, `clip.tsx:30`, `nesting.tsx:36`, `floating.tsx:1718`, `theme.tsx:174` — all `const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";`. esbuild with `--define:process.env.NODE_ENV='"production"'` emits `typeof process>"u"||!1` — the `!1` folds, the `typeof` survives. Verified: the shipped expression evaluates `true` in a process-less realm; a bundled `dist/index.js` leaves 5 live sites and declares `process` nowhere. Next/webpack shims it (Turbopack chunk compiles to `let k=void 0===t.default` → false), which is why the docs app never showed it. Under Vite/Rollup/Parcel/bare ESM this ships one `ResizeObserver` per Card/Surface/Dialog (`clip.tsx:77`), two observers per `<Box container>` (`box.tsx:104-106`), and Shell's dep-less measuring effect. Five source comments and `recipes.test.ts:955-963` state the opposite; the byte cost attributable to the fold itself is only 100 raw / 15 gz (esbuild does not DCE the bodies), so the 2,655 bytes of warn strings ship everywhere regardless.
*Fix:* a `development`/`production` export condition, or a bare `process.env.NODE_ENV !== "production"` that every bundler folds.

**4. Indeterminate Progress animates a box offset, so it is the one animation in the library that cannot survive a busy main thread.**
`progress.css:73-87` — `animation: kui-progress-sweep 1.6s linear infinite` with `from { inset-inline-start: -40% } to { inset-inline-start: 100% }`. Measured: 120.3 layouts + 120.3 recalcs/s, 16.55 ms/s attributable, versus **0.47 ms/s** for the identical `translate` keyframe and 0.07 ms/s static. Unchanged offscreen; unchanged under `prefers-reduced-motion` (only the distance per frame moves). Eight bars = 35.30 ms/s. The Spinner's rotation was moved to a composited HTML wrapper on 2026-08-06 for exactly this reason ("a busy indicator that freezes when the main thread blocks fails its one job", `LOG.md:5812`), and `progress.browser.test.tsx:229` asserts only `animation-name` and `animation-iteration-count` — no law reads which property animates.
*Fix:* `translate` with a direction-aware sign for RTL (the one thing `inset-inline-start` gets free).

**5. A glass floating panel runs the whole filter chain per frame over a box that changes size, for the entire 345–600 ms entry.**
`surfaces.css:1888-1894` animates `block-size`/`inline-size`/`translate`/`border-radius`/`scale`; the same element carries `backdrop-filter: var(--kui-lens, ) var(--material-regular-filter)` (`:1381`), and the lens is deliberately installed for every frame since 2026-08-23 ("0 frames without a lens", `LOG.md:2292`). The filter region is `objectBoundingBox 0 0 100% 100%` with `preserveAspectRatio="none"` (`refraction.tsx:783-791`), so the map re-stretches per frame. Shipped graph is **10** primitives (rim and pre-blur are gated off by `config.ts rimSaturate: 0` and `refraction.tsx:801`). Glass menu 320×263 @DPR2 over ~31 frames ≈ 104 M pixel ops; Dialog does not resize but `scale` on a filtered box invalidates identically (~339 M over 36 frames). `DECISIONS.md:1063` states the rule the library's own entry escapes: "A blurred element that itself moves re-samples its backdrop every frame" — written as consumer placement guidance. RISK: needs a non-solid Theme. At one panel it measured free (8.33 ms glass and solid, 12 and 40 rows); it compounds with finding 1.
*Fix:* nothing cheap — either accept and document the per-frame cost, or stand the lens down for the flight frames and reinstate the 2026-08-23 seam at a landing.

**6. A dialog or alert entry stacks two (default) or three (glass) filter passes, none of them priced.**
`dialog.css:37,41` puts an unguarded viewport-sized `backdrop-filter: var(--scrim-filter, none)` (`blur(8px) saturate(0.8)`, `tokens.css:886`) on a `position: fixed; inset: 0` element; `surfaces.css:2788` animates a real `filter: blur(6px)`→0 over the consumer-authored body for 600 ms; under a glass theme the panel's own chain reads the scrim's changing output. `tokens.css:877-880` and `DECISIONS.md:1767` declare the scrim explicitly *not* a material, so it falls outside the only rule set that counts filtered elements. Measured GPU 2.29 ms/frame vs 1.16 ms baseline (~2×, ~14 % of a 60 Hz frame). Escapes exist but are preference-gated: `prefers-reduced-motion` zeroes the body blur (`surfaces.css:2848`), `contrast="high"` and reduced transparency stand `--scrim-filter` to `initial`.
*Fix:* nothing structural — record the scrim in the material cost section so it stops reading as free.

**7. A continuous resize that is not a flight regenerates the map and an 11-node filter every frame.**
`refraction.tsx:1174` `s.ro = new ResizeObserver(measureUnlessFlying)` with no throttle; the non-flying branch calls `measure()` synchronously (`:1159-1162`). The comment at `:1123` calls the flight "the one gesture that resizes a pane continuously" — the TextArea resize handle is a second (`text-area.tsx:97` `useLensRef` on the wrapper, `text-area.css:70` `resize: vertical`, verified by a real 60 px drag) and a window-resize drag is a third. Per frame per resizing pane: ~1.5–2.5 ms (corner sweep, `putImageData`, `toDataURL`, 11 SVG nodes grafted, one removed). A vertical textarea drag keeps `bendMemos` warm (scale is width-driven) so it sits at the low end; a **window** drag changes width, churns the 16-key memo and puts every pane on the cold path — approximately the handover's 57.6 ms cold-screen tax, per frame. Phones render no resize handle, so this is desktop-only.
*Fix:* rAF-coalesce or quantise the fitted bezel so near-twin boxes share a key (the handover's own unimplemented step 7).

**8. Typing in a glass Composer regenerates the map on every line-boundary crossing.**
`composer.css:73,80-81` gives the input `field-sizing: content; min-block-size: 1lh; max-block-size: 8lh`, and the lens is on the pane that hugs it (`composer.tsx:95,146`). 14 regenerations for a 1→8→1 line cycle (the shrink direction is a *miss*, since `release` deletes at users 0). Steady state per crossing: ~0.3–1.0 ms of JS (the glint is a cache hit, the Snell solve is a `bendMemo` hit, the map is a 320×26–104 strip), plus a `url(#id)` swap forcing a fresh PNG decode and full backdrop re-raster — the larger half on a phone, unquantified. The path is literally inside the stated envelope ("on mount and on resize"), which is the point: the enumeration never contemplated a keystroke-driven resizer, in the one file whose comment (`composer.css:70-72`) brags about retiring v1's per-keystroke JS.
*Fix:* same as 7 — coalescing bounds both.

**9. `panelSeam` is a fifth interaction-time mechanism, and the enforcing law is structurally unable to see it.**
`menu.tsx:823` `<BaseMenu.Positioner sideOffset={seam} alignOffset={() => -seam()}>` where `seam` is `panelSeam` (`menu.tsx:57-70`, two `getComputedStyle`, a `closest`, a `querySelector`). Base UI evaluates the function form three times per position pass (`useAnchorPositioning` offset middleware ×2 + transformOrigin), and floating-ui's `autoUpdate` leaves `ancestorScroll = true`, so every scroll event on the parent panel's own `.kui-scroll-viewport` — and page scroll on touch, where Base UI skips the lock — drives a pass. `DECISIONS.md:1829/1853` enumerate exactly four exceptions, each buying its licence with "never on hover, press, focus or scroll". `recipes.test.ts:963`'s regex matches no plain function handed to a third-party prop, and `menu.tsx` carries no exemption entry, so the law reports it clean. **Measured cost is negligible** (scroll frame mean 8.33 ms open vs closed; 8.50 ms at 6× throttle).
*Fix:* record it as the fifth exception, or hoist the two reads to the open.

**10. Two unbounded-descendant `:has()` arms on the Shell root widen style invalidation for every structural DOM change inside the app.**
`shell.css:442` and `:1362` — `.kui-shell:not(:has(.kui-shell)):has(> * .kui-shell-pane[data-state="open"][data-presentation="overlay"])`. The only two of 82 `:has(` in the artifact with a descendant combinator inside. Measured (forced flush per mutation): +10.9 % @50 elements, +16.2 % @800, +18.0 % @2000. Realistic batched frame (30 insert + 30 remove): +0.063 ms @800, +0.135 ms @2000 — linear in shell subtree size, entirely `RecalcStyleDuration`, `RecalcStyleCount` unchanged. **Zero at interaction time**, since all state is data-attributes (a class toggle measures +0.5 %). The second arm is media-gated to ≤48 rem so only one is live on desktop.
*Fix:* bound the inner `:has()` to a child search (recovered ~60 % in isolation).

**11. Shell's dev safe-area effect has no dependency array.**
`shell.tsx:507` opens `React.useEffect(() => {` and `:578` closes `});`. Every Shell render tears down and rebuilds a `ResizeObserver` and schedules a measuring rAF; `let warned = false` (`:509`) resets with it, so a genuinely stale shell re-warns on every render instead of once. The sibling with the same shape is dep-bounded and frame-deduped (`clip.tsx:70-84`), and the containment effect one function above argues its own missing array in writing (`shell.tsx:439-448`) where this one does not. Cost: ~2 `check()` per painted frame in which Shell renders, ≤7 rects + 6 gCS, tens of microseconds — plus a `console.warn` per keystroke in `next dev` on a stale shell. Zero in a build where DEV folds (see 3).
*Fix:* a dep array, plus `warned` in a ref.

**12. Tree re-renders and re-reconciles the whole visible list on every row focus.**
`tree.tsx:425` `onFocus={() => setFocusId(node.id)}` against real state at `:232`; `flatten` at `:230`, a fresh `Set` at `:215`, a linear `find` at `:234`, and a new ref identity per row at `:421-423` — zero `useMemo`/`useCallback` in the file. Measured 0.90 / 2.50 / 6.00 / 12.40 ms per arrow key at 55 / 209 / 506 / 1001 rows. The cost is **not** where the code reads worst: flatten+Set is 0.005 ms at 506 rows (0.08 %); ~90 % is the unmemoised N-row reconcile, ~10 % the ref churn. The state update itself is required by the roving tab stop (`tabIndex` at `:419`). NavTree is exempt (no focus state, no per-row ref), which is what the docs sidebar uses. `DECISIONS §33` names "a layers panel, a file browser" as this component's instruments — the 200–1000 row cases.
*Fix:* memoise the row and stabilise its callbacks.

**13. Doc-accuracy items where a stated bound no longer holds.** Each is zero runtime cost; each is a sentence a reader would trust.
- `refraction.tsx:29` — "a full-page pane costs the same as a small one." True of generation (MAP_CAP 320 verified unescapable, `:264,1052-1055`), false of paint; repeated in four homes (`refraction.tsx:29,1049`, `card.browser.test.tsx:1096`, `LOG.md:2272`).
- `refraction.tsx:1152-1157` — the flight guard's comment claims it saves "a getComputedStyle … sixty times over"; `target()` runs at `:1163` *before* the key comparison, so 1 rect + 2 gCS + 2 `closest` still run per delivery (~31/flight). **Two lenses contradict on magnitude:** one counted them as 31 forced synchronous layouts; a controlled re-measure with CDP `Performance.getMetrics` found `LayoutCount`/`RecalcStyleCount` identical with the reads on and off (RO callbacks are delivered after layout, and nothing writes during a flight). Take the second: ~1.2–2.2 ms of script across a 510 ms flight, ~0.2 % of budget. The comment is wrong; the cost is not.
- `floating.tsx:663-670` — the four-frame page-hold is "MEASURED INERT" for the browser's *reveal* scroll and does not discriminate a **user** scroll. Window is 5 frames, not 4 (`frames++ < 4` inside a chain whose first callback is already a frame), contradicting the code's own "four frames" at `:631` and `:659`. Menu and Select are scroll-locked by Base UI on non-touch opens so `hold` is unreachable there; **Popover and Tooltip are exposed** (both `modal: false`, neither exposes the prop), as is touch-opened Menu/Select. A trackpad flick inside the window is reverted for up to ~83 ms.
- `floating.tsx:275-278` and `LOG.md:1612` — "floating-ui's autoUpdate watches element resize and layout shift, never a transform." False: `observeMove` compares client rects, which include transforms, so the trigger's own press spring drives ~254 position solves per `defaultOpen` (78–86 on a real press). Proven by freezing the trigger's transitions: trigger `getComputedStyle` calls 254 → 14 with the flight running unchanged.
- `refraction.tsx:1174` — a `radius`-axis change reaches the hook by **no route**: the box does not change, so the RO never fires, and the pane keeps a map and glint mask built for a corner it no longer has (up to ~64.5 px of mismatch per corner at size 3). `corner-shape` is static per engine, so only `radius` is live; exposure is `/preview`, `/matrix`, the builder, and any app with a live theme switcher. Zero CPU, visual only.
- `recipes.test.ts:963` — the no-JS-at-interaction-time law cannot see React's `onKeyDown`/`onFocus`/`onScroll`/`onClick` props (only `onPointer*`/`onMouse*`/`onTouch*`), does not ban `setTimeout` while banning `setInterval`, and walks `.tsx` only (`:971-973`) — so all eight `.ts` files under `system/` are unread. `addEventListener("keydown"` is banned and needs an exemption; `onKeyDown=` is free. Findings 9 and 12 sit in its blind spots.
- `surfaces.css` retains two stand-down arms naming `.kui-row, .kui-separator` inside a floating panel (reduce-motion and `[data-instant]`) for a per-row hold deleted 2026-08-15; **210 raw / 18 gz bytes**, and `surfaces.test.ts:915-919` asserts `arms.length >= 3` with exactly three arms, so deleting the dead one fails CI.
- Per-pane retained bytes: the lens map is shared per distinct box in the module `<svg>`, the **glint is duplicated per element** in inline style (`refraction.tsx:1081`) — 1,278 to 4,838 chars each. `D × ~11.6 KB + N × ~9.5 KB`. Separately, `glints` (`:597`) is never released, unlike `filters`, so up to 65 strings (~325 KB) stay resident for the page's lifetime after all glass unmounts.

**14. The `box-shadow` blast layer is the largest single paint item on a plain solid screen, and it is headroom, not a felt cost.**
`surfaces.css:1210` on the bare `.kui-surface`; `--surface-chrome: var(--shadow-4)` = `0 1px 2px …, 0 24px 64px -12px …` (`tokens.css:942,953`), default `depth="elevated"`. Measured: 12 surfaces all repainting = 16.7 ms (vsync, zero dropped) at every configuration including glass; 60 = 25.0 ms; the same shadow with the blast at 16 px blur = 16.7 ms (free). ~80–90 % of the shadow's cost is that one large-radius layer; `corner-shape: squircle` costs nothing (25.0 vs 25.5). Flush shell panes stand the cast down (`shell.css:501`). Per-invalidation, not per-frame.
*Fix:* none needed — record the ~60-simultaneously-repainting-surface threshold and move on.

---

## 4. CLEAN

Each verified, not assumed.

- **Selectivity works end to end.** `theme.tsx:300` defaults `solid`; `refraction.tsx:955` returns before any observer for `solid`/`on-glass`; `useMaterial` returns `solid` unless `backdrop` or the ambient region is set. An unmarked in-flow control pays literally nothing.
- **"Glass does not stack" reaches the paint.** A glass Card holding a Button, a Card and a SegmentedControl: the button computed `backdrop-filter: none`, zero background-image layers, `box-shadow: none`, both pseudos `content: none`. Every filter rule keys on the three thickness values, never `on-glass`. One filtered region per stack.
- **No lens or filter leak.** 8 glass Cards through 12 unmount/remount cycles then 12 distinct sizes: filter count 8 → 8 → 8 → 0, one `<svg>` host, `JSEventListeners` flat at 156, Nodes 141 → 21. The 2026-08-22 unconditional-release repair holds.
- **MAP_CAP 320 has no escape.** Walked extreme aspect ratios (4000×20 → 320×8; 288×1200 → 77×320) and the flight substitution path. No input exceeds 320×320 / 409,600 B.
- **`transition: all` appears zero times.** All 41 transitions name every property; widest is 7. `transition-property` as a longhand: zero. The 5-property `.kui-control` rule matches every control on screen at 5 comparisons rather than ~340.
- **The two-clock press works.** `recipes.css` `.kui-control:active:not(…)` sets `--kui-ct-paint: 0s` at (0,3,0), tying with hover and winning on source order 109 lines later; `surfaces.css:817` does the same for the interactive surface.
- **`backdrop-filter` never animates.** It appears in no transition list; the glass hover step is a discrete brightness swap (`recipes.css:1672-1682`), documented at `DECISIONS.md:1035`, and the loud rung's hover value is byte-identical to its resting one.
- **The flight does not relayout panel content.** `.kui-floating-body` is pinned at its landed width and absolutely positioned out of flow (`surfaces.css:2084`, `:2373`), so animating `inline-size` does not re-break text or re-lay-out ten rows per frame. Verified: the ScrollArea viewport's block axis is a constant 8 px for all 57 flight deliveries.
- **The ScrollArea does not setState during a flight.** A probe component inside `MenuContent` rendered exactly once across 70 flight frames — `pickState` returns `prev` on shallow equality and nothing it computes moves.
- **Every rAF loop in the flight runner is counter-bounded and cannot spin.** Page-hold 5 frames (`floating.tsx:667`), `whenPlaced` 12 (`:1494`), `depart` 10 (`:1395`), the two-frame handoff (`:1457-1459`), `useNameWarning` 1 (`:1740`). All increment unconditionally or bail on disconnect.
- **`prefers-reduced-motion` coverage is complete.** 14 media blocks, one per declaring sheet; all 41 transitions and 4 animations cross-checked against a stand-down on the same selector at the same specificity later in the same file. `popover.css`/`tooltip.css`/`menu.css` declare no transitions of their own and inherit the shared stand-down by construction. Total apparatus: 2,371 raw / 277 gz.
- **`prefers-reduced-transparency` stops the JavaScript, not just the CSS.** The `sealed` gate reads the cascade (`refraction.tsx:995`) and both the glint skip and the lens skip-with-release fire.
- **No pointer, scroll, wheel or move listener anywhere in component sources.** One `addEventListener("scroll"` in the whole package (`floating.tsx:664`), documented. Zero `setInterval`. Every observer disconnected on cleanup.
- **Zero runtime JS in Tabs.** The "third bounded exception" lives inside Base UI; this package's own exposure is nil. The segmented control's exception is as tight as documented: 2 rects + 1 gCS per selection change and per resize, three observers disconnected in one cleanup, `watched` WeakSet preventing re-observation, layout effect keyed on a stable ref.
- **No context-identity churn.** All 33 `.Provider value=` sites pass a primitive, `null`, or a memoised object; Theme's `resolved` memo depends on fourteen scalar fields, not the parent context identity. All three `useSyncExternalStore` snapshots return a primitive or a stable identity.
- **feTurbulence rim and the ScrollArea scroll-edge mask are both free** (measured identical with and without, at 200 cards and a 400-row list respectively).
- **`@property` costs nothing measurable.** 215 registrations, 897 gz; a data-density or data-appearance flip on a 4,505-element page is inside noise with all 215 blocks removed.
- **Spinner is what it claims.** Composited `transform: rotate()` on an HTML wrapper with `steps(8)`, so the value changes 8×/s and nothing re-rasters between steps.
- **Module evaluation is clean.** Two module-level regexes, `SPOKE_RECTS` hoisted, `sideEffects: ["*.css"]`, unbundled output, deep Base UI imports — a Button-only production bundle is 6,250 gz.
- **CSS parse+apply of the 314 KB artifact: 0.2 ms at 1×, 0.9–1.4 ms at 6× throttle.**

---

## 5. WHAT I COULD NOT MEASURE

- **Real phone GPU cost of the lens.** This is the single most important gap and it is exactly what finding 1 needs. CPU throttling does not touch rasterisation. A mid-range Android GPU is plausibly several times weaker than an M4 Pro at `backdrop-filter` + an SVG displacement chain, which would move the ~12-pane cliff down — the direction is certain, the number is not, and no figure is stated. `DECISIONS.md:1066` ("Blur radii are provisional until measured on a mid-tier device") is still open and this pass did not close it.
- **GPU memory actually resident.** Decoded map sizes are arithmetic (`w_capped × h_capped × 4`, two per pane) and inline-string bytes are measured, but backdrop snapshot textures and the ≥4 region-sized intermediate buffers the 10-primitive graph implies are unaccounted. Whether Chromium reuses filter buffers is unknown.
- **Whether Chromium keeps `feDisplacementMap` inside `backdrop-filter` on the GPU path, fuses primitives, or falls back to software for a reference filter.** Every "N pixel operations" figure in this report that is not a stopwatch reading is area × node count, which treats a dependent-texture gather and a `feColorMatrix` channel-keep as equal cost. Treat those as shape, not magnitude.
- **WebKit and Firefox.** The lens is Chromium-gated by a measured `CSS.supports` probe (`refraction.tsx:869-895`), so Firefox pays zero — but both engines still get the glint mask and both conic gradients, and neither was measured. Safari's behaviour with `url(#a)` inside `backdrop-filter` remains the file's own recorded open question: parse-but-paint-nothing would take the blur with it via the `var()` seam.
- **The docs app under real load.** Next was too slow to boot in this pass, so "how many lensed panes does `/preview`'s Materials section put on screen at once" — the fastest confirmation or refutation of finding 1's reachability — is unanswered. All pane-count figures come from synthetic pages.
- **Whether `process` is present in every Vite/Rollup/Parcel browser production bundle.** The fold failure is proven at the esbuild level and the runtime `true` is proven in a process-less realm; no actual Vite app was built to observe the global. Verify before acting on finding 3.
- **The re-raster half of findings 2, 7 and 8.** Swapping `url(#id)` forces a fresh `feImage` PNG decode and a full backdrop-filter re-raster of the pane, outside the JS budget entirely and plausibly the larger half on a phone. Not instrumented.
- **Absolute milliseconds for the flight's own forced flushes.** Counts are measured (8 attributable pre-paint, popup-subtree scoped); the per-flush duration is not, and the container renders in software, so a frame time from it would be a miscalibrated instrument.
- **Tree beyond 1000 rows, and Tree on a real phone.** Linear extrapolation past the measured range only.

*Note: the working tree is dirty (33 modified files) and `dist/styles.css` was rebuilt during this pass; all line numbers above were re-verified against the current tree, several having drifted ~25 lines from what the individual lenses reported. `budget.json` now reads `35419`, not the `34768` in the brief; the built artifact measures 35,394 gz — green.*
