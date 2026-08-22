# Floating & overlay motion audit — 2026-08-22

An ultracode audit of Menu, Select, Dialog, AlertDialog and the shared flight runner, run
across sixteen lenses with one adversarial verifier per lens (33 agents, ~7.9M tokens,
1,419 tool calls, 3h45m). 102 findings raised, 96 survived refutation, 6 refuted.
Severity as filed: 13 critical, 48 major, 32 minor, 9 nit; 87 of 102 carry a browser
measurement rather than a reading.

**The suite was green throughout.** All four component suites plus the portal and motion
suites: 199 of 200. The one failure is `outline-offset` resolving to 5.96875 instead of 6
in `system/motion.browser.test.tsx`, on a box running Chromium 1194 aliased into the path
Playwright 1.62 expects — `cdn.playwright.dev` is blocked here, so the pinned build could
not be fetched. Treat that one as environmental until it is seen on real CI.

## Status: the findings below are FIXED (2026-08-22)

Every ranked finding in this report has been repaired, each with a law that fails against the
pre-fix code. The commits are on `claude/component-motion-audit-ad7baq`; `docs/LOG.md` carries
the decision record and `docs/DECISIONS.md` §22/§23 and the lens section were amended where the
spec had gone false.

| | what it was | measured after |
|---|---|---|
| C1 | a 30-row Select settled 188×910 in an 800px window, `clientHeight === scrollHeight`, chosen row 163px off its trigger | 188×749, scrollable, row **2px** from its trigger |
| C2 | a 400px trigger's panel painted 400 through the flight and snapped to 390 at release | 400 through the flight and 400 at release |
| C3 | the flying box computed `hidden auto` on a Select, `scrollTop` 165 → 0 across the entry | the runner writes `clip` inline for the flight and hands the offset back |
| C4 | Reduce Motion moved a closing dialog `360,351 560×98` → `24,24 560×752` for ~130ms | stays centred, transitions 0s, gone in one frame |
| M5 | 27 displacement maps per glass menu open, one leaked filter per pane | 2 maps, zero orphans |
| M6 | Escape removed a menu in one frame; every pointer dismissal dissolved over ~220ms | both routes carry the same clocks |
| M7 | a dismissed alert's scrim answered the hit test over an ordinary page corner | the page's own control answers it |
| M8 | a mirrored submenu's seed sat 112px clear of the seam and grew towards it | its trailing edge lands **on** the seam |
| M9a | a controlled Menu lost its entry after the first Escape | it flies on every state-driven open |
| M9b | `<MenuContent side="right">` on a 900px trigger painted 951px at x=967 in a 1280 window | capped by the room, select's spelling promoted |

Two repairs were **built, measured as no-ops and reverted** rather than left in looking
plausible: shortening the overlay exit's restated geometry to the exit's own clock (no value
changes on those channels at the exit, so an unretargeted transition keeps its duration), and
any z-index for the un-rooted portal's missing stacking frame — that one is real (a fixed
`z-index: 50` cover paints over an open menu with no root `<Theme>` and under it with one) but
every repair from inside the portal is the ladder §20 rejected on the record, so it gets a dev
warning naming the remedy and nothing else.

One finding is **withdrawn**: M7's menu half ("a dismissed menu still runs the command") did not
reproduce with the browser's own hit test — the hit landed outside the popup and the node
unmounted 21ms after going invisible. The alert half is confirmed and fixed.

Full CI is green apart from the pre-existing `outline-offset` subpixel law in
`system/motion.browser.test.tsx`, which fails with the identical value (5.96875 against 6) that
it did at baseline before any change, on this box's Chromium 1194.

---

## What was re-measured by hand before being written down

The audit's own claims were re-run independently, in a mounted browser, before this
document repeated them. That pass changed three things.

| | claim | status |
|---|---|---|
| C1 | a long Select's panel loses Base UI's positioner height at release | **confirmed** — 188×910 in an 800px window, `clientHeight === scrollHeight === 908` (not scrollable), chosen row 163px off its trigger; with Reduce Motion the same select is 188×743, scrollable, row −4px from the trigger |
| C2 | the panel steps ~2.5% narrower at release | **confirmed** — 400px trigger, pressed rect 390, entry publishes `--kui-anchor-w: 400px`, panel paints 400 for the whole flight and 390 at release |
| C3 | the flight's `overflow: clip` / `position: absolute` never apply to a Select | **confirmed** — computed `hidden auto` / `relative` / `max-height: 100%` from Base UI's inline `LIST_FUNCTIONAL_STYLES`; Menu computes `clip` / `absolute`. `scrollTop` 165 during the flight, 0 once settled |
| C4 | Reduce Motion makes a closing dialog jump to the corner | **confirmed** — open box 360,351 560×98; on the ending stamp 24,24 560×752 at opacity 1, held eight sampled frames (~130ms), `margin-left` 336px → 0 |
| M6 | Escape deletes the Menu's exit | **confirmed** — found independently before the audit returned. `data-instant="dismiss"`, `transition-property: none`, opacity 1→0 in one frame, gone in 29ms; outside-press and item-press both dissolve over ~220ms; Select, Dialog and AlertDialog all dissolve on Escape |
| M7 | a dismissed panel stays invisible-but-live | **half confirmed.** The alert reproduces: `elementFromPoint` over an ordinary page button returns `kui-alert-backdrop` 149ms after the scrim's opacity reached 0, popup still mounted. **The menu half did not reproduce** — dismissed mid-flight, the hit at the row's centre landed *outside* the popup and the node unmounted 21ms after going invisible. The "a dismissed menu still runs the command" result came from a synthetic `element.click()`, which bypasses hit-testing; a real pointer click was refused by the browser-driver's actionability gate. Treat the menu half as open. |

Two hypotheses raised during the pass were **falsified and are not findings**:

- *The entry paints one frame in the wrong place.* A frame sampler showed a menu's seed
  200px right and 236px below its trigger. Instrumenting every `--kui-from-x` write with
  the frame it happened in shows the provisional aim and the corrected aim landing in
  frames that both paint the seed on the trigger. The sampler was reading between the two.
  This is the wrong-order trap already recorded in LOG for the 2151px claim.
- *Reduced motion leaks.* A menu opened under an emulated `prefers-reduced-motion: reduce`
  runs zero animations, stamps no seed, writes no `--kui-fly-*`, and does not move. The
  suppression is clean. (C4 is a different mechanism: the guard's own `margin: 0`.)

## One thing the audit did not file, because it is taste rather than a defect

The floating family's entry is long and springy. Measured on a real pointer press, menu:
width 139 → peaks 242.5 → settles 234.7; height 32 → peaks 105.6 → settles 100. That is
**8.2% overshoot on both axes and ~680ms before the box stops moving**; AlertDialog takes
~950ms, Dialog ~675ms. The physics is implemented faithfully — the emitted curves were
re-derived and Dialog's `poised` overshoot lands at 1.00045 exactly as specified — so
nothing here is broken. But the family rides `--motion-spring-elastic` (ζ 0.62), whose own
docstring in `config.ts` describes it as *"the alert's materialization… a box arriving with
a whole card's momentum"*, and platform dropdowns settle in 150–250ms. If the motion feels
wrong after C1–C4 are fixed, this is the line to move.

---

# Floating & overlay family — motion audit synthesis

**Scope:** Menu, Select, Dialog, AlertDialog and the shared flight runner.
**Verification:** I re-read every load-bearing line before repeating it. Base UI 1.7's source was checked directly for four premises the findings rest on (`LIST_FUNCTIONAL_STYLES`, `positionerElement.style.height`, `--anchor-width`'s source, `instantType`). All four hold; one shipped comment in this repo is refuted by them. Notes below mark where I corrected a lens.

---

## 0. The short answer to "I have troubles"

Three defects explain almost every motion complaint you can have with this family, and **all three trace to one event: the 2026-08-17 `alignItemWithTrigger` reversal**, which put a Base UI *inline style object* onto the select popup and an inline *height* onto its positioner. The flight runner borrows exactly one of those five properties. It destroys another. It is outranked on three more.

The suite cannot see any of it because **every Select law that opens a real panel uses the same eight-option fixture** — a list short enough that the broken mechanism and the working one give identical answers.

---

## 1. Ranked findings

### 🔴 C1 — A long Select's panel explodes off-screen on the frame the entry ends
**`system/floating.tsx:607-610`** · converged from **four independent lenses** (select-placement, focus-keyboard, family-entropy, doc-code-drift)

`release()` calls `positioner.style.removeProperty("height")`, guarded on `positioner.hasAttribute("data-side")`. For an item-aligned Select `data-side` is `"none"` — present — so the arm fires, and **the height it removes is Base UI's, not the runner's.**

Verified in Base UI 1.7:
- `select/popup/SelectPopup.js:123` and `:273` — `positionerElement.style.height = \`${height}px\``
- `:279` — `popupElement.style.height = '100%'`
- `:306` — `scroller.scrollTop = scrollTop`
- `clearStyles` (`:202`, `:293`) only runs on close or on leaving align mode, and restores the *pre-Base-UI* originals. **Nothing puts it back.**

So `height: 100%` resolves against an auto-height parent and the panel becomes its full content height. Measured by three lenses independently, consistent to the pixel:

| | motion on | reduced motion (runner bails, `floating.tsx:311`) |
|---|---|---|
| positioner inline height | `""` | `780px` |
| panel | 1210px @ top −420 | 780px @ top 10 |
| `clientHeight` vs `scrollHeight` | 1208 == 1208 — **not scrollable** | 778 < 1208 — scrollable |
| chosen row vs trigger | 117–243px off | 6–8px |

Setting `positioner.style.height = "780px"` by hand after release restores it exactly. One property.

**What a person sees:** open a country / timezone / font picker. The unfurl runs correctly, then on one frame the panel becomes as tall as its whole list. A third of it is off the top (or bottom) of the window; the positioner is `position: fixed` and the page scroll is locked, so those options **cannot be reached by wheel, trackpad or keyboard**. The selected option is nowhere near the trigger. Reopening does not clear it. Users with Reduce Motion on get the correct panel.

**Minimal fix:** treat the positioner like the popup's own borrowed height, twelve lines away (`floating.tsx:471`/`:603`):
```js
const heldW = positioner.style.width, heldH = positioner.style.height;   // before :572
// in release():
positioner.style.width = heldW; positioner.style.height = heldH;          // "" === removeProperty
```

**The law that must change:** `select.browser.test.tsx:1127` — *"the flight BORROWS Base UI's inline height and gives it back"*. It states the exact principle in its own docblock ("not restoring it means a settled panel that has lost the layout its own scrolling depends on") and reads only `popup.style.height`. **A law about one property of a two-property mechanism.** Add the positioner's, and widen `openItemAligned()` (`select.browser.test.tsx:942`) past eight options.

---

### 🔴 C2 — Every wide-trigger Menu and Select panel snaps ~2.5% narrower after it has visibly stopped
**`system/floating.tsx:190-193`** · converged from **three lenses** (reopen-interrupt, laws-that-cannot-fail, geometry-edges)

`restingAnchorWidth()` divides the trigger's held press scale out of the measured rect, on the premise stated at `floating.tsx:177-183` that *"Base UI 1.6… reads `getScale(trigger)` and normalises the rect by it before positioning."*

**I checked. It does not.** `internals/useAnchorPositioning.js:230-240` takes `rects.reference`, snaps it to device pixels, and writes it verbatim — `grep -c getScale` in that file returns **0**. floating-ui's `getBoundingClientRect(element, true, …)` divides by the *offset parent's* scale, never the reference's. So `--anchor-width` is the **rendered (pressed) rect**, and the entry publishes the **resting** one. The two floors differ by exactly `1 − --press-scale` on every open with a held press.

Measured across three lenses and multiple widths: 420 → 410, 360 → 351, 336.42 → 328, 400 → 390. The step lands in **one frame, ~300ms after the box has stopped moving** (the release deadline is the longest *declared* clock, 730ms — see M8), so it reads as a spontaneous glitch, not as the tail of an entry. With a submenu open, the submenu slides ~8px sideways under the pointer on the same frame.

Note the direction: `select.css:157`'s comment is **correct** and `floating.tsx:177-183` is **wrong** — one fact, two homes, opposite claims. This is verbatim the complaint the 2026-08-17 change was written to cure (*"it jumps a bit in width at the end"*), reintroduced by applying the correction the wrong way.

**Minimal fix:** publish `box.width` (the visual rect) — delete the division. Then correct `floating.tsx:177-183`, which is currently the only evidence for it.

**The law that must change:** `select.browser.test.tsx:1084` — *"the panel's floor is the trigger's RESTING width, so it does not step at release"*. **Degenerate twice over:**
1. `openItemAligned()` forces `data-side="none"`, and item-aligned is the one placement where floating-ui *freezes* the anchor measurement — measured `--anchor-width` held at 360px for the panel's whole life while the trigger scaled to 0.975. Published and settled agree **by construction**.
2. Its trigger is 57px wide, so `max(--floating-min-w, anchor)` discards both numbers and the assertion compares `112.000` with `112.000`.

Delete the mechanism entirely and both halves still pass. Re-key it onto the ordinary anchored placement with a trigger comfortably over 112px, assert flying width == width one frame after `data-unfurling` leaves, and add the calibration `flyingWidth > --floating-min-w`. **Menu has no such law at all** — every menu law that touches the floor injects `--anchor-width` by hand (`menu.browser.test.tsx:415, 813, 831`).

---

### 🔴 C3 — `overflow: clip` and `position: absolute` on the flight are dead on a Select; the comment says they are load-bearing *for Select*
**`system/surfaces.css:1537`, `:1624`** · converged from **four lenses**

Verified in Base UI 1.7: `select/popup/SelectPopup.js:354-358` spreads `LIST_FUNCTIONAL_STYLES` = `{position:'relative', maxHeight:'100%', overflowX:'hidden', overflowY:'auto'}` as the popup's **React `style` prop** whenever `alignItemWithTriggerActive && !listElement`. `select.tsx` renders no `BaseSelect.List` (confirmed: only `Popup` at :301 and `Positioner` at :323), so `listElement` is null and this is the shipped path.

An inline declaration beats every stylesheet rule. So on a Select:
- `overflow: clip` (surfaces.css:1537) → computes `hidden auto`. The flying box **is** a scroll container for the whole entry.
- `position: absolute` (surfaces.css:1624) and all its per-align inset arms → computed `relative`, insets inert.
- `max-height: var(--available-height)` (select.css:168) → outranked by inline `max-height: 100%`, so the viewport cap is delegated entirely to the positioner height C1 deletes. **The two compound: after the entry there is no cap at all.**

Menu is the negative control and proves the cascade is fine: same rules, computed `clip` / `absolute`.

The comment above 1537 states the opposite as a finished measurement — *"`clip` is not a scroll container at all… measured 0 in every frame of the entry"* and *"Deleting this line was tried and put the jump straight back."* That measurement was taken before the placement reversal.

**Measured consequence (regime-dependent, and the lenses disagreed — worth stating honestly):**
- *Item-aligned* (trigger mid-page): the offset is **held**, and the browser clamps it as the box grows. One lens measured 875→859 (16px), another 565→491→499 (74px), a third 432→421 (11px). It varies because the maximum offset shrinks as the box grows — worst when the chosen row is near the end of the list.
- *Fallback placement* (trigger near the top or bottom of the window, where Base UI drops the overlap): `clip` **does** apply, and it destroys the offset outright. Measured 477 → 0 for every flight frame → 477 at release. Top visible row `Row 0` throughout the entry, `Row 15` once settled. **A 477px content jump on the release frame.**

**Minimal fix:** borrow the whole inline object, not one property of it. `floating.tsx:471` already has the shape — extend it to `overflow`/`overflowX`/`overflowY`/`position`/`maxHeight` and restore in `release()`. **But decide first:** Base UI's item alignment *works* by driving that scroll offset, so forcing `clip` would pin `scrollTop` to 0 for the flight and hand back the aligned offset at release. The honest repair is probably to save and restore `scrollTop` rather than to make the clip win.

**The law that must change:** `select.browser.test.tsx:1478` — *"the entry moves neither the page nor the panel's own contents"*. It asserts `Math.max(|popup.scrollTop|) <= 1` **on every frame**. That is false of a correct implementation: an item-aligned select whose list scrolls *requires* a non-zero offset. **The law codifies the defect as a requirement.** It passes only because eight options never scroll (measured `scrollHeight === clientHeight === 248`). Split it: page drift stays `<= 1`; the panel's own offset becomes "equals what the placement wrote", on a list that genuinely overflows, with `expect(scrollHeight).toBeGreaterThan(clientHeight)` as the calibration.

---

### 🔴 C4 — Reduce Motion is the only setting that makes a dialog jump
**`system/surfaces.css:1981`** · dialog-alert-entry + reduced-motion

Inside `@media (prefers-reduced-motion: reduce)`, the pose stand-down declares `margin: 0` on `.kui-surface.kui-overlay.kui-dialog-popup[data-starting-style]` (0,4,0), `[data-ending-style]` (0,4,0) and `.kui-surface.kui-alert-popup[data-ending-style]` (0,3,0).

Those panels are **centred by auto margins**: `dialog.css:92` and `alert-dialog.css:54`, both `margin: auto` at (0,1,0). The guard wins by three specificity steps, and losing a cross-axis auto margin also releases `align-items: stretch`, so the panel un-centres **and** stretches to full viewport height in the same frame.

**And it stands down nothing.** I checked every `margin` declaration in the poses: `surfaces.css:1706` and `:1830`, both `margin-inline: auto` on the *body* (`.kui-floating-body` / `.kui-overlay-body`), which none of these popup selectors reach. The declaration exists only to break other rules' centring.

Measured, 1280×800, CDP-emulated:
- Dialog **open**: one frame at `24,24 560×752 opacity 1`, then `360,339 560×122`.
- Dialog **close**: `24,24 560×752 opacity 1` for **all ten sampled frames (~165ms)** — Base UI has no transition to wait out, so the slab just sits there.
- Alert **close**: `480,325 320×150` → `24,24 320×752` for 5+ frames.
- Normal motion control: `margin-left: 336px` throughout, panel stays centred.

**What a person sees:** with Reduce Motion on, closing any Dialog or AlertDialog teleports the panel to the top-left corner of the window at full viewport height and full opacity for about a sixth of a second, then it vanishes. On a phone-width window the sheet arm (`dialog.css:159`, also (0,1,0)) loses the same way, so the sheet flashes at the *top* of the screen instead of rising from the bottom. **The setting that exists to remove motion produces the largest movement in the family.**

**Minimal fix:** delete `margin: 0` from line 1981. One declaration.

**Compounding (reduced-motion lens):** the same guard also fails to reach `[data-ending-style]` for `transition` at all — the exit recipes re-declare it one attribute heavier (`:1735`, `:1878`, `:1933`) — so under Reduce Motion the full seven-channel clock list survives. Measured: `block-size 0.46s, translate 0.46s, inline-size 0.68s, border-radius 0.56s, box-shadow 0.26s, opacity 0.14s, scale 0.16s`. That surviving `scale` clock is what **holds the mis-placed slab on screen for 165ms** instead of one frame. The two halves compound; fix both. Add the three `[data-ending-style]` selectors to the `transition: none` list (the block already spells them ten lines lower).

**Why the laws missed it:** `dialog.browser.test.tsx:622` hand-stamps `data-starting-style` — the exact broken state — and then asserts only `opacity`, `scale` and the body's `filter`. `alert-dialog.browser.test.tsx:614` never stamps `data-ending-style` at all. The guard writes five properties; the laws read three. **The two unread ones are the two that are wrong.** The guard's own comment (`surfaces.css:1970`) says *"What the guard owes is that nothing MOVES… both are asserted by mounted law"* — the guard is the thing that moves the panel.

---

### 🟠 M5 — Glass makes the entry stutter: the refraction lens rebuilds a displacement map on every frame of a flight
**`system/refraction.tsx:322`** · converged from **three lenses**

`useLens` attaches a bare `ResizeObserver(measure)` to the pane (`refraction.tsx:321-323`). `measure()` re-reads `getBoundingClientRect()` **and** the animating `borderTopLeftRadius`, and keys `acquire()` on `(w, h, r)`. That node is the popup (`menu.tsx:346`, `select.tsx:299`, `alert-dialog.tsx:240`), and the flight animates `inline-size`/`block-size` on it (`surfaces.css:1366-1367`). **Every frame is a distinct cache key.**

Each miss runs `physicalMap` — a per-pixel Snell's-law solve (atan/asin/tan/hypot) over up to 320×320 — plus `putImageData`, `canvas.toDataURL()` (a PNG encode of ~100k pixels), an 11-node `<filter>` grafted into the shared `<svg>`, the previous one torn down, and a fresh `--kui-lens` written onto the popup (re-creating its `backdrop-filter` chain). Synchronous ResizeObserver work: it lands inside the frame, after layout, before paint.

Measured on three machines/fixtures, consistently:

| | maps minted | frames dropped |
|---|---|---|
| menu, `material="solid"` | 0 | 1/57 |
| menu, `material="thin"` | 18–22 | 19–20 of ~40 |
| alert, glass | 19–23 | 20/62 |
| **dialog, glass (control)** | **1** | **1/45** |

The Dialog control is what proves the cause: its entry is `scale` + `opacity` only (`surfaces.css:1868-1876`), which does not change the border box, so no ResizeObserver record fires.

Canvas sizes trace the growth curve exactly: `56×56, 302×32, 305×56, 312×107, 320×169, 320×224, …`.

**Riding with it, and visible on its own:** each map is generated for frame N's box and applied on frame N+1's, so the bezel never matches the panel it is bending — the lensed edge crawls and shimmers for the whole entry.

This breaks the mechanism's own bound. `refraction.tsx:21` and CLAUDE.md §10 both say *"built on mount and resize, never on hover, press, focus or scroll — the seam the floating layer already uses."* Opening a menu **is** interaction time, and the seam the floating layer measures on is **one** measurement, not one per frame. The sentence is true about hover and press and blind to the one gesture that resizes continuously.

**Minimal fix:** in `measure()`, bail while the node carries a flight stamp, and take one measurement when it is released:
```js
if (node.closest("[data-unfurling]")) return;
```
`release()` (`floating.tsx:596`) already runs on exactly the right frame and can flag it. Cheap secondary: quantise the `acquire` key to 8px so near-identical boxes reuse a filter.

**Why no law could fail:** every lens law reads a **declared string on a settled panel** — `card.browser.test.tsx:991` (`toBeTruthy`), `dialog.browser.test.tsx:376`, `select.browser.test.tsx:414` (`toMatch(/^url\(/)`). And those panels are landed by `settle()` (`test/browser.tsx:443`), which strips `data-unfurling` — **no law has ever observed a lens-bearing panel while its box was moving.** Nothing in the repo measures frame cost at all.

**Adjacent, same file:** every lensed pane leaks one filter refcount at birth. `measure()` runs directly (`:321`) and the `ResizeObserver` then delivers its initial record for the same box, so `acquire` takes the cache-hit branch and increments `users` to 2 — but the release guard is `if (s.id && s.id !== next) release(s.id)` and the id is unchanged. Measured: mount + unmount one glass `<Card>` leaves 1 orphan `<filter>`; a full glass alert entry leaves 4. Bounded by distinct box sizes, not by mounts. Fix: release unconditionally on re-acquire.

---

### 🟠 M6 — Escape deletes the Menu's exit; every other dismissal of the same menu dissolves
**`system/surfaces.css:1763`** · converged from **three lenses**

`.kui-surface.kui-floating[data-instant]:not([data-instant="click"])` is **(0,4,0)** (`:not()` takes its argument's weight) against the exit recipe at `:1735`, **(0,3,0)**. `transition: none` wins outright.

Verified in Base UI 1.7, `menu/root/MenuRoot.js:228`:
```js
const isDismissClose = !nextOpen && (reason === REASONS.escapeKey || reason == null);
… store.set('instantType', isKeyboardClick ? 'click' : 'dismiss');   // :238-239
```
So `dismiss` means **a keyboard dismissal**, or any imperative close. Measured on the same menu, computed at the `data-ending-style` stamp:

| gesture | `data-instant` | `transition-property` | frames to gone |
|---|---|---|---|
| Escape | `dismiss` | `none` | **0 (~24ms)** |
| item press | `null` | all seven channels | 10 (~220ms) |
| outside press | `null` | all seven | 10 (~217ms) |
| Select + Escape | `null` | all seven | dissolves |

The rule's own comment describes `dismiss` as *"a dismissal the pointer already committed to"* — that is **Popover's** store definition, not Menu's. The pointer dismissal is the one that keeps its 220ms dissolve; the keyboard one is the one erased. This is the precise inverse of the 2026-08-19 `click` exemption (*"An open is an open… stillness belongs to reduced-motion, not to the keyboard"*), which was applied to opens and never checked for closes.

**Reach:** Menu and MenuSub only. `grep` of Base UI 1.7 shows `instantType` exists only in menu/popover/tooltip/preview-card stores — Select, Dialog and AlertDialog never carry `data-instant`, and I confirmed an alert wearing it by hand keeps its full exit (the rule is keyed on `.kui-floating`).

**Minimal fix:** exempt `dismiss` beside `click`, or narrow the arm to the values that really mean "no reveal" (`group`, `focus`). Then correct the comment.

**Why no law could fail:** every exit law uses `ending(popup)` (`menu.browser.test.tsx:~1602`), which hand-stamps `data-ending-style` and never `data-instant` — the rule is not in the cascade the law reads, and with it deleted the fixture computes identically. The one law that drives a real Escape (`:936`) asserts only that the popup eventually unmounts — **satisfied faster by the defect than by correct behaviour.** Its own comment at `:949` records having *seen* `data-instant="dismiss"` and reasons past it.

---

### 🟠 M7 — A dismissed panel is invisible for half a second and still takes clicks — and acts on them
**`system/surfaces.css:1749`, `:1890`** · css-channel-parity + spring-math

The exit restates the entry's geometry channels **at the entry's own durations with unchanged targets**, so those transitions are neither retargeted nor cancelled — they run to their original end (680ms floating / 800ms overlay) while the dissolve is 140ms. Base UI unmounts only when `Promise.all(element.getAnimations().map(a => a.finished))` settles (`internals/useAnimationsFinished.js:44`), and `getAnimations()` counts the keep-alives. **The mechanism added to stop a mid-flight snap became the unmount gate.**

Measured, dismissal ~50-120ms into the entry:

| | invisible at | unmounted at | dead window |
|---|---|---|---|
| Menu | 198ms | 451ms | **253ms** |
| Select | 162ms | 585ms | **423ms** |
| AlertDialog (Escape) | 133ms | 685ms | **527ms** |
| Dialog (control) | 98ms | 160ms | 62ms |

Dialog is clean because its ending rule (`surfaces.css:1933-1938`) declares `scale` with a **new** duration and no geometry, so its running transition is replaced.

Two distinct harms, both measured:
- **AlertDialog freezes the page.** `elementFromPoint(8,8)` — an ordinary page corner — returned `DIV.kui-alert-backdrop` for 31 consecutive frames after the scrim's own opacity reached 0.000 and its animations finished. A real click on a page button at +184ms did **not** fire; the identical click after unmount did. Since AlertDialog refuses outside-press, there is not even a dismissal to show for it. *"I dismissed the alert and the app was frozen for half a second."*
- **A dismissed menu still runs the command.** This is the escalation one lens measured that the others did not: dismiss a menu by pressing its trigger, then click at a row's coordinates at +199ms (panel fully invisible since +148ms) — **`MenuItem onClick` fired, counter 0→1.** On a menu whose first row is Delete, that is a destructive action executed after the user cancelled it.

*(Correction to one lens: Base UI removes its internal inert backdrop as soon as a menu close begins, so a menu's dead window only eats clicks inside the dead panel's own rectangle — which is exactly where the row was. The alert's own scrim is what blocks the whole viewport.)*

**Minimal fix:** restate the geometry channels on `[data-ending-style]` at the **exit's** clock (`var(--floating-dissolve)` / `var(--overlay-dissolve)`) — the restatement is what stops the snap, the duration is what pins the lifetime. Belt and braces: `pointer-events: none` from the frame `data-ending-style` lands (there is currently no such stand-down anywhere; the only two `pointer-events` rules, `surfaces.css:1620`/`:1634`, are keyed on the flight attribute and gone by then).

**The law that must change:** `surfaces.test.ts:544` asserts only channel *membership* ("the two clocks are free to differ, that is the point of an exit") — a keep-alive running 5.7× the dissolve is exactly what it licenses. The menu's "the exit is faster than the entry" law deliberately **excludes** the restated channels ("those are keep-alives, and on a settled exit they start nothing") — true on a settled exit, and the whole finding is that on a mid-flight exit they start everything. **Nothing anywhere measures the interval between opacity 0 and the node leaving the document.** Add that law, with the settled exit as the negative control.

---

### 🟠 M8 — Submenus fly out of the wrong edge: the pin knows `left` and never `inline-start`, and reads `align` on the wrong axis
**`system/surfaces.css:1638-1641`, `:1699-1702`** · converged from **three lenses**

Two faults in one block, both verified by reading it beside the transform-origin block 230 lines above:

1. **`[data-side="inline-start"]` is absent.** Base UI's `getLogicalSide` (`internals/useAnchorPositioning.js:24-34`) returns the logical pair whenever the side param is logical, and `MenuPositioner.js:92` defaults a submenu to `inline-end` — so a flipped submenu is `inline-start`, a spelling the pin block does not contain. The origin block **does** carry it (`surfaces.css:1406-1407`: `[data-side="inline-start"] { --kui-origin-x: right }`). **Within one file, the origin says "grow from the right edge" and the pin holds the left.**
2. **`[data-align="end"]` fires bare, with no side question.** On a bottom/top panel `align` is the inline axis and the rule is right. On a side placement `align` is the **block** axis, so the rule moves an axis the alignment says nothing about and leaves the one it governs unpinned. The origin block gets this right too (`:1414-1418`: `[data-side="inline-end"][data-align="end"] { --kui-origin-y: bottom }`).

Measured, flipped submenu (menu trigger in the right half of the window):
- `data-side=inline-start`, computed `inset-inline-start: 0px` / `inset-inline-end: 103px`
- seed `l=719 r=775` → settled `l=719 r=878`, with the parent panel's edge (the seam) at **878**
- LTR control (`inline-end`): seed `l=402`, settled `l=402 r=561` — **seed exactly on the seam, correct**

And `side=inline-end, align=end` (a menu low in the window with a tall submenu): seed `l=514 r=570` → settled `l=402 r=570`, growing **leftward into the parent**, with the body travelling ~343px upward through the box.

*(Correction: two of the four side×align cells are wrong, not three — for `inline-start` + `end` the two faults cancel and the seed lands on the seam. The broken pair is `inline-start`+`start` and `inline-end`+`end`. And the panel's block position is carried by `--kui-from-y` and is correct; what travels on the block axis is the **body**.)*

**What a person sees:** a `⋯` menu anywhere in the right half of the window. Hover a submenu row and the child panel appears displaced from the parent and grows sideways **back into** the menu it came out of, rows sliding out of the clipped box. This is the same "unfurl running backwards" the 2026-08-17 BESIDE change removed, still live for the mirrored placement.

**Minimal fix:** make the pin block mirror the origin block's case analysis — add `[data-side="inline-start"]` beside `[data-side="left"]` in both rules, qualify the `[data-align="end"]` inline pin with `[data-side="bottom"], [data-side="top"]`, and add block-end arms for the four side placements.

**The law that must change:** `menu.browser.test.tsx:1761` — *"a panel that lands BESIDE its trigger grows out of the SEAM, not out of the row"*. Its fixture (`:1784-1799`) mounts `<Menu defaultOpen>` with no wrapper, so the trigger sits at the host's top-left and the submenu can resolve **only** `inline-end` + `start` — the one correct cell. Its placement assertion (`:1839`) matches `/^(inline-start|inline-end|left|right)$/`, four spellings the fixture cannot produce, which reads as coverage it does not have. Its geometric claim (`:1847`) is `|seed.left − rowBox.left| > 100` — measured against the **row**, not the seam — and evaluates to 164 and 500 in the two broken cells, **passing both**. It is also `watchesFrames`, so CI never runs it. Drive all four side×align cells by positioning the trigger near each window edge, and assert against the **seam**.

---

### 🟠 M9 — Two more that will bite

**A controlled Menu loses its entry after the first Escape** (`floating.tsx:321`, reduced-motion lens). `begin()` bails on any `data-instant` other than `"click"`, but Base UI only recomputes `instantType` inside its own `setOpen` (`MenuRoot.js:222-236`). A **controlled** `<Menu open>` re-opened by app state never calls `setOpen`, so the `'dismiss'` written by the previous Escape is still in the store and still rendered on the popup at mount. Both halves of the exemption read it as instant: the runner returns before posing, and `surfaces.css:1763` zeroes every clock. Measured: `[state open fresh → flew, w=67] [Escape, state open → instant="dismiss", NOT flew, w=112] [trigger press → flew again]`. A command palette or row-actions menu driven from a store loses its animation after the first Escape and looks like it "randomly stopped working", recovering only on a real trigger press. **Fix:** treat `data-instant` as instant only when it arrives *with* the open — clear it at the start of `begin()` when the previous state was closed.

**Menu's viewport bound is unreachable** (`menu.css:77`, family-entropy + geometry-edges). `min-width: max(--floating-min-w, --anchor-width)` beside `max-width: var(--available-width)` — in CSS a minimum always beats a maximum. `select.css:162` carries the repair for this exact defect (`min(max(floor, anchor), max(floor, available))`) **with its own measurement written above it**; the 2026-08-09 audit landed it in one sibling only, and `menu.css:29-33` still claims "the popup keeps the positioner's bounds as the hard stop". Measured with `<MenuContent side="right">` on a 900px trigger: painted 951px starting at x=967 in a 1280 window — **638px off screen and a horizontal page scrollbar.** Narrow call site (needs an explicit side), but when hit the items are unreachable. Copy select's spelling; the sentence now exists in two files and should promote.

---

### 🟡 Minor, real, worth a line each

| | where | what |
|---|---|---|
| **A tall alert opens scrolled past its own question** | `alert-dialog.css:46` | Base UI focuses the first tabbable, which the component itself places *after* the description; `.kui-alert-viewport` is a scroll container, so the browser scrolls it to reveal the button. Measured: `vp.scrollTop=678`, title at **y = −629**, focused = "Keep it". A no-tabbable control gives `scrollTop=0` (Base UI passes `preventScroll` only when it falls back to the popup). `initialFocus` is a recorded refusal, so no call site can escape it. Needs a panel taller than the window. |
| **The alert's circle is never a circle** | `surfaces.css:1848` | `corner-shape: round` is declared only under `[data-seed]`, and `corner-shape` is in neither transition list — so it flips to the base layer's `squircle` on the exact frame `data-seed` comes off, which is the frame opacity leaves 0. Measured: the only `round` frame has opacity 0; every visible frame is `squircle` at 50% radius. Three lenses. *(One lens built this on an `--overlay-grow` hold; both `--overlay-hold` and `--overlay-grow` emit **0ms** — there is no hold.)* |
| **The seed wears a squircle over a round trigger** | `surfaces.css:1478` | The runner copies the trigger's radius (`floating.tsx:531`) and not its `corner-shape`; controls take `round`, the popup keeps `squircle`. Measured: at 1px from the edge a round corner insets 10.4px and the superellipse 4.95px — ~5px of overhang at four corners, for ~2 frames. Same repair as the row above. |
| **Menu's scrolling ScrollArea inserts a `generic` between `role=menu` and its items** | `menu.tsx:363` | Measured AX: `menu > generic > menuitem` when the list overflows, `menu > menuitem` when it does not. Mutating the viewport through `tabindex` −1/0/absent and `role="none"` keeps the generic every time — so `focusable={false}` is **not** the mechanism `scroll-area.tsx:53` says it is. Select, deliberately given no ScrollArea, is clean. |
| **The release deadline is the longest *declared* clock, not the flight's** | `floating.tsx:721` | `Math.max(...spans)` picks `inline-size` at 0.68s — the channel that most often does not move — so the flight arrangement is held 730ms while the box has been still for ~285ms. Measured consequence: a menu that fills itself after opening is clipped to its open-time box (6 of 8 rows invisible for ~220ms, then a 112×70 → 341×250 snap). Also the window C2's width step lands in, which is why that step reads as spontaneous. |
| **`--kui-floating-gap` is written by two components and read by nobody** | `menu.tsx:44`, `select.tsx:36` | Four references in the whole tree: two writers and the dangling-var law's own allowlist, whose comment vouches for a read that does not exist. Both source comments say *"the entry reads it as a var (§22)"*; the lean became a measured translate on 2026-08-15. |
| **AlertDialog warns about clipping on every ordinary open** | `alert-dialog.tsx:243` | Calls `useClipWarning("<AlertDialog>")` while `clip.tsx:24-25` states as fact *"Menu, Select and AlertDialog own what is inside them, so there is nobody to warn."* Worse: the effect runs at mount, which is when the popup is held at the 64px seed — measured, a plain "Delete file?" alert warns *"208px wider than it is… not reachable"* while its settled `scrollWidth === clientWidth`. A false positive on every open, in a dev build, disarming the warning where it is true. |
| **No stacking frame when the app renders no `<Theme>`** | `floating.tsx:148` | `PortalScope` renders the bare Theme only when `useThemeRooted()`; the un-rooted path (axes on `<html>`, supported and law-tested at `menu.browser.test.tsx:448`) gives a plain `.kui-portal` with `isolation: auto`, and any `z-index: 50` header covers every popup. `warnOnFramedAncestor` cannot fire either — it is Theme's own ref callback. Measured: rooted → hit = menu item; un-rooted → hit = the cover, 0 warnings. Secondary path (the installation page renders a root Theme), and the fix is one selector: `.kui-theme:not(.kui-theme *), .kui-portal`. |
| **The harness installs stylesheets in a different order from `styles/index.css`** | `test/browser.tsx:69` | `scroll-area.css` and `segmented-control.css` ship *before* select/progress/radio and are installed *after* them, under a comment saying "Keep this list and that file in step." No rule ties across that boundary today; the one component whose planned work crosses it is Select. |

---

## 2. The patterns — one mistake, several faces

### Pattern A: **The 2026-08-17 placement reversal brought a whole inline style object, and one property of it was borrowed**
C1, C3 and the dead `max-height` are one defect. Base UI's item-aligned Select writes **five** properties imperatively: `position`, `maxHeight`, `overflowX`, `overflowY` on the popup, plus `height` on the positioner. The runner borrows-and-restores exactly one (`popup.style.height`, `floating.tsx:471/603`) — with a paragraph explaining why an inline declaration beats every rule — and then, twelve lines later, **deletes** one of the others outright.

The generalisation for the fix: *the flight does not own this element's style; it must take a snapshot and put it back, not enumerate what it thinks is there.*

### Pattern B: **A rule written for a Menu, applied to a Select. A rule written for a bottom-placed panel, applied to a side-placed one.**
The repo's own signature shape, three more times.
- `floating.tsx:560-570`: *"It shrink-wraps the popup"* — true of a menu's positioner, false of a select's, and that comment is the whole justification for the `removeProperty` in C1.
- `surfaces.css:1638`: `[data-align="end"]` written for `bottom|top`, where align is inline, applied to side placements where it is block (M8).
- `menu.css:77` vs `select.css:162`: the same width-floor sentence, repaired in one family and not the other (M9).

### Pattern C: **The eight-option fixture — a single degenerate input that blinds three laws at once**
`select.browser.test.tsx:942` and `:1421` both declare `const OPTIONS = ["a".."h"]`. Eight rows fit the available height, so:
- Base UI writes no constraining positioner height → C1 invisible
- `popup.scrollTop` is 0 on every frame → C3 invisible (and the law that would catch it *asserts* 0)
- the 57px trigger is discarded by `max(…, 112px)` → C2 invisible

**Ask the repo's own question** — "what would this fixture look like if the mechanism were absent?" — and the answer is *the same*, three times, from one line of test data. This is the single largest reason 200 laws are green.

### Pattern D: **The CI-exclusion registry became an amnesty**
`test/frames.test.ts` records six laws and their reasons, and **every recorded reason is about *when* the law looks.** Four of the six are also unable to fail on the mechanism they name — verified individually:
- *"the panel's floor is the trigger's RESTING width"* — item-aligned freezes the anchor measurement; 112 === 112
- *"the FIRST open flies to the settled width"* — `defaultOpen`, so the trigger is never pressed and the scale correction is arithmetically absent, plus a `triggerW * 0.97` bound that swallows a 2.5% press
- *"the entry moves neither the page nor the panel's own contents"* — zero scroll events on the page half; an eight-row list on the contents half
- *"a dismissal taken back MID-FLIGHT"* — **zero `transitioncancel` events fire in the whole gesture**, so both of `onCancel`'s guards can be deleted with no assertion changing

The registry's anti-rot clauses check only that a reason is >40 chars and not the title. Excluding a law from CI **raises** the cost of it being vacuous — it becomes the only thing between the mechanism and a release. **Add a third required field: the source edit that makes this law red.** For four of the six it cannot currently be written, which is the finding.

### Pattern E: **A comment is not a law, and these comments were measured before their dependency changed**
Every one of these ships false today, and each is the only evidence for the code beside it:
- `floating.tsx:177-183` — "Base UI reads `getScale(trigger)` and normalises". `grep -c getScale` in that file: **0**.
- `surfaces.css:1537` — "`clip` is not a scroll container… measured 0 in every frame". Outranked by an inline style; the 0 was a destroyed offset.
- `refraction.tsx:21` — "never on hover, press, focus or scroll". Silent about the gesture that resizes every frame.
- `clip.tsx:24-25` — "Menu, Select and AlertDialog… there is nobody to warn". `alert-dialog.tsx:243` calls it.
- `surfaces.css:1757-1763` — "a dismissal the pointer already committed to". That is Popover's store; Menu's is the keyboard.
- `surfaces.css:1783-1791` — a hold and a staggered growth that emit `0ms`.
- `surfaces.css:1970` — "nothing MOVES… asserted by mounted law". The guard is what moves it.
- `config.ts:713` — the entry's duration ordering, stated backwards 120 lines above its own reversal record.
- `DECISIONS.md:1612` — the mid-flight re-anchor recorded **open** with a clip-path candidate fix; `floating.tsx:571-573` closed it with the positioner pin, and I confirmed by measurement that the described symptom no longer reproduces (`data-align` reads `end` in all 40 frames).

---

## 3. Motion complaints → cause

| If you are seeing… | It is |
|---|---|
| "the long select opens off the screen / won't scroll / the selected row isn't on the trigger" | **C1** — `floating.tsx:609` deletes Base UI's positioner height. Reduce Motion fixes it, which is the tell. |
| "the panel jumps a bit in width at the end" (again) | **C2** — `restingAnchorWidth` divides the press out; Base UI publishes the scaled rect. ~10px, one frame, ~300ms after the box stopped. |
| "the select's contents slide / it opens showing the wrong part of the list and then snaps" | **C3** — the flight's `overflow: clip` never applies to a select. 11–74px in the item-aligned regime; **477px in the fallback placement**. |
| "the dialog jumps to the corner when I close it" (Reduce Motion on) | **C4** — `margin: 0` at `surfaces.css:1981`, held on screen for ~165ms by the un-suppressed exit clock. |
| "the glass menus stutter / the motion feels wrong on glass" | **M5** — 18–22 displacement maps and ~150ms of blocking JS per open; the bezel shimmers because each map is a frame late. `solid` is clean; Dialog is clean. |
| "Escape snaps the menu shut but clicking away fades it" | **M6** — `[data-instant]:not([data-instant="click"])` at (0,4,0) beats the exit at (0,3,0). |
| "I closed the menu, clicked underneath, and nothing happened" — or worse, **"it ran the command anyway"** | **M7** — the exit's keep-alives gate Base UI's unmount; 253ms (menu) to 527ms (alert) of invisible, hit-testing, *live* panel. |
| "the submenu comes in from the wrong side" | **M8** — `inline-start` missing from the flight pin; `align` read on the wrong axis. |
| "the animation randomly stopped working, then came back when I clicked the button" | **M9** — stale `data-instant="dismiss"` on a controlled Menu. |
| "the menu opens behind the cookie banner" | **portal frame** — no `<Theme>` means no `isolation: isolate`; or a body-level sibling with `z-index ≥ 1`, which `warnOnFramedAncestor` walks past. |
| "the alert stutters as it comes up" (no glass) | **scrim + animating box** — a full-viewport `backdrop-filter` under any sizable animating box costs ~25ms/frame. Flipping the scrim's blur off flips 26 dropped frames to 0, on **both** overlay members. *(One lens reported Dialog as a clean control; a second measured it at 24–26/35 dropped, which inverts the diagnosis from "the alert's four layout channels" to "the scrim, and both members pay it". Headless with software rasterisation — the relative signal is architectural, the absolute numbers are pessimistic. Worth one measurement on real hardware before acting.)* |

---

## 4. Suggested order of work

1. **C1** — one line, restores a broken component. Then widen `openItemAligned()` past eight options and watch C2 and C3's laws go red on their own.
2. **C4** — one declaration deleted, plus three selectors added to the reduced-motion `transition: none` list.
3. **C2** — delete the division, correct the comment, move the law off `openItemAligned()`, add the missing Menu twin.
4. **M5** — one `closest("[data-unfurling]")` guard, plus the unconditional release in `acquire`.
5. **M7** — restate the exit's geometry at the exit's clock; add the "how long after opacity 0 does it unmount" law, which does not exist in any form.
6. **M6, M8, M9** — decisions plus small selector work.
7. **Pattern D** — add the "what sabotage makes this red" field to `frames.test.ts`. For four of six it cannot be written today; that is the work.

The one structural change worth more than any individual fix: **`floating.tsx` should snapshot and restore the popup's and positioner's inline style rather than enumerating properties.** C1 and C3 both disappear, and the next Base UI release cannot re-open them.