# Handover — the builder becomes an application, 2026-08-20 (overnight)

Written for the person who was not in the room. Plain English. Where this file and a
governance doc disagree, the governance doc is right.

The job was: finish the builder. Everything below is in `/builder` in the docs app, all of it
verified in a real browser, all of it law-covered, `pnpm run ci` green.

---

## 1. What you can do now that you could not yesterday

**Work in several documents.** Named, switchable from the toolbar, each with its own undo
history. New, rename, duplicate, delete. They persist; the old single-document storage is
migrated on first load.

**Drive the whole editor from the keyboard.** ⌘K opens a palette over every command, every
component you can insert *here* (the grammar decides), every template and every document.
⌘/ shows the whole keymap. Arrows walk the tree, ⌘D duplicates, ⌫ deletes, ⌘⌥↑↓ reorders,
⌘⌥←→ moves in and out of containers, ⌘⇧G wraps in a Stack, ⌘⇧U unwraps, ⏎ jumps to the text
field, Esc selects the parent.

**Copy and paste subtrees anywhere** — including into another document or another browser
tab. A copied subtree is JSON on the real clipboard.

**Select several things** (⇧-click on canvas or in Layers) and wrap them in one Stack, Flex,
Box, Card or Grid. This is the gesture the multi-selection exists for.

**Right-click anything** for the same commands, from the system's own Menu.

**Preview.** One toggle and the editor's chrome goes away: menus open, dialogs trap focus,
fields type. It is the screen you built, actually usable.

**Review.** The panel on the right runs the house style over your document and tells you what
it finds — with the system's own sentence for why, a click to select the offending node, and
a Fix button where the repair is unambiguous. More on this below; it is the part I would
show someone first.

**Start from a screen.** An empty document opens on six templates (confirm card, sign in,
settings, page header, form, blank). Every one is held by a law to zero review findings.

**Seat things in slots.** A Button or field's `leading`/`trailing` seats take a Spinner, a
Kbd, a hosted Button, small type — chosen in the inspector, exported as the prop it is.

**Save a block, export it as a component.** A saved subtree exports with its *content* as
props (named `title`, `body`, `action` from the role each text plays, with your words as
defaults) and every axis frozen.

**Give a document its own appearance.** A dark screen inside a light app is a composition;
the document says so, the canvas shows it, and the export states it.

## 2. The two things worth understanding

**Every action is one row in one table.** `commands.ts` — id, title, chord, enabled, run. The
keyboard, the palette and the context menus are renderers over it. Before this, "duplicate"
lived in a button's onClick, so a shortcut for it meant writing the logic twice. If you add a
command, all three surfaces get it for free, and the shortcut sheet documents it without
being edited.

**Review works because the vocabulary is closed.** "One loud action per surface" cannot be
linted against arbitrary CSS — there is no such thing as loud. Here `emphasis="loud"` is a
rung the system defined, a Card is a surface it named, and the brief that says one focal
point per pane is written down in DECISIONS §15. So the check is a walk over a tree the
system already understands. That is why this is a design-system feature rather than a
builder feature, and why no general-purpose builder can copy it.

## 3. What writing it taught (the part I would read if I were you)

**The templates corrected the reviewer, twice.** I wrote a law saying every template must
raise zero findings. It failed, and twice the RULE was wrong rather than the template:

- Rhythm was comparing gaps across different axes — a row's internal gap against the column
  rhythm around it. No eye measures those against each other. Now it only compares same-axis
  nesting.
- "A layout around one thing is not a layout" was flagging a Flex that right-aligns a lone
  Save button. That flex is doing real work. Now only a layout whose *only* word is `gap`
  counts as inert.

Two other findings were genuine and I fixed the templates: a group at gap 3 inside a group at
gap 3, and gap 4 around gap 3. The starter document had the same fault and it is fixed too —
it now passes its own review.

**A regression the law caught immediately:** giving documents an appearance, I defaulted it
to `themeDefaults.appearance`, which is `light` — that would have pinned the canvas light and
stopped it following the site's dark toggle. A new document inherits; the law fails if that
changes.

**The wrong-element instrument mistake, three more times.** My browser probes measured the
document switcher instead of the theme panel, the outer Stack instead of the Flex, and a
field's wrapper instead of its input. Every time, a second source (the stored model, the
computed style) disagreed and that is what surfaced it. The round-trip law caught its own
harness too: React's raw `useId` salts needed the same order-preserving normalization Base
UI's ids already had.

## 4. Laws

`editor.test.ts` (36) covers the store, the commands, the grammar and review;
`builder.test.tsx` (98) still covers the document's translation into code. Falsified against
sabotaged code: a fix that does not fix, a snapshot that forgets its selection, a grammar
that says yes to everything, a seat that serializes as a child, an appearance default that
pins the canvas. 295 docs tests in total.

## 5. Open, on purpose

- **JSX import** stays refused. The document is truth; code is a build artifact.
- **Icons in slots** stay refused, with the reason written in the inspector where it bites.
- **Freeform positioning** stays impossible — the outer-spacing rule holds inside the tool.
- **Tree drag** still uses into/after semantics rather than an insertion line (the canvas has
  the line). Next obvious thing.
- **"Fix all"** is not offered: fixes can interact, and a panel that silently rewrites eight
  things is a panel nobody trusts. One at a time, each undoable.

## 6. Where things are

`apps/docs/app/builder/`: `store.ts` (state), `commands.ts` (actions), `placement.ts`
(grammar questions), `model.ts` (tree surgery), `catalog.ts` (the one data table),
`review.ts` + `review-panel.tsx`, `templates.ts`, `chrome.tsx` (document bar, jump bar,
context menu, shortcut sheet, empty state), `command-palette.tsx`, `inspector.tsx`,
`render.tsx`, `serialize.ts`, `builder-app.tsx` (the shell and the canvas).
