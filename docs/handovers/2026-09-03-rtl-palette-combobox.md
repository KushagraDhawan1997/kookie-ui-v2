# Two owed items, then Combobox

**Branch:** `claude/next-component-8ustp8` · **Session:** unattended, 2026-09-03

You asked "what's the next component", picked the answer, and said: do the two items the
2026-09-01 handover put ahead of it, then Combobox. All three are done and committed. This
file is the plain-English walk-through; `DECISIONS.md` §26, §44 and §45 and the three new
`LOG.md` entries are the real record, and where this file and those disagree, they are right
and this is stale.

---

## 1. RTL on Tabs and SegmentedControl (commit `454a66d`)

**What was wrong.** Base UI's composite reads text direction from its own React context and
never from the DOM's `dir`. Its only setter is `DirectionProvider`, which seven files in the
package rendered and these two did not. So under `dir="rtl"` the bar and the track laid out
right-to-left while ArrowRight walked to the DOM-next element — the one on the LEFT — and on
the segmented control chose it. Measured before fixing: focus landed at x=1095 against the
focused tab's 1165.

**The fix.** Slider's, verbatim: `TabsList` and `SegmentedControl` each measure their own
computed direction through `useAmbientDirection` and render the provider. Per component, not in
`Theme`, because a Theme is optional and a flipped subtree inside an ltr app needs the element's
own answer. Two laws, one per component, geometry first (the element that takes focus, or the
choice, lies to the RIGHT of the one that had it) and DOM identity second; both fail against
the committed components with the exact defect.

## 2. The builder's ⌘K is `Command` (commit `5dbe8dd`)

`apps/docs/app/builder/command-palette.tsx` composed a palette by hand — Dialog, TextField,
ScrollArea, Row, its own arrow keys, Enter, active index and `scrollIntoView`. It composes
`Command` now and keeps only the app's half: the rows (table commands through `armed`,
templates, inserts, blocks, documents, grouped in arrival order), what each runs, and the
matcher handed through `filter` so "every word, in any order" survives. No `size` prop: the
default prices the whole palette (440px wide where it was a size-3 box around size-2 rows).

I drove it in a real browser before committing: the chord opens it, the first row is lit,
typing narrows 66 rows, `zzz` shows the empty sentence, Escape closes, `preview` + Enter enters
preview. A docs law pins the shape and fails against the hand-rolled file.

**Environmental, worth knowing:** `pnpm dev` panics under Turbopack ("Missing content when
trying to generate the content hash for static asset") when ANY of the FIVE gitignored font
files the layout names is absent. The previous handover said three. I stubbed all five locally
with a placeholder woff2 (gitignored, never committed).

## 3. Combobox (§45)

Nine exports: `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`,
`ComboboxGroup`, `ComboboxGroupLabel`, `ComboboxCollection`, `ComboboxEmpty`. Single-select,
`{ value, label }` or string items, grouped items, a hidden input for forms, Base UI's own
matcher with `filter` and `onInputValueChange` for a list that lives on a server.

**Almost all of it is membership.** The field is TextField's wrapper worn whole around Base
UI's bare input — a law reads its ten facts against a mounted TextField at all four indexes in
both appearances. The rows are the row family's, law-equal to a Select's unchosen row. The panel
is the anchored pane Menu and Select share.

**Two load-bearing facts.**
- The wrapper is Base UI's `InputGroup`. Base UI anchors the panel to the group when one exists
  and to the bare input otherwise; a plain span left the panel narrower than the field by both
  slots. Falsified by swapping it back.
- The clear ✕ (only while a value is chosen) and the chevron are the system's own quiet
  icon-only Buttons at the slot's derived size, neither a tab stop.

**The promotion.** menu.css's own comment said the third floating member that wants a width
floor moves it to the shared layer. Padding floor, `--kui-sf-p` re-point, concentric hook, base
floor and anchor-width floor now live in `surfaces.css`; `kui-floating-anchored` replaces
`kui-menu-anchored`. 176 menu/select laws ran green unedited on both sides.

**One sabotage survived and earned a law its absolute half.** Deleting the promoted block left
all three panes falling back to the surface band together, still agreeing, and clearing the
ring's reach by themselves at compact size 2. The padding law now also reads the pane's pad
against the floor's own expression through a probe; the sabotage fails at `12px` vs `4px`.

**Deferred and refused, recorded in the registry:** `multiple` (a chip strip inside a field is
undrawn geometry — deferred, additive), free text (Autocomplete), `readOnly` (Select's), modal /
backdrop / arrow, a Value part, a Separator in the listbox, `render`/`children` on the input.

**Numbers.** +44 gzipped bytes (37,113 → 37,157). 33 mounted laws. Docs: registry entry,
example, playground section beside a TextField and a Select at one index, builder exclusions
with reasons, README count 52 → 53, API tables regenerated.

## What I would do next

1. **Look at Combobox in `/preview`.** Every value is inherited, so what wants your eye is the
   composition: the two hosted buttons touching in the trailing slot, and whether the chevron
   should be a button at all (I kept it one — a pointer that would rather browse than type).
2. **A per-component preview page for Combobox** (the seven-section structure); it has a
   playground section only.
3. **`multiple`** when a real screen wants it: chips at hosted scale need drawing first.
4. **Calendar / DatePicker**, the other input hole the last handover named.
5. The Composer's `--kui-cp-font` hydration mismatch warning in `/preview` is pre-existing
   (seen in the console while driving the combobox); not touched.
