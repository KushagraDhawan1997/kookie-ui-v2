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

**Right-click anything** for the same commands, from the system's own Menu — and for
*Insert here*, a submenu of what this particular node can legally hold, parts first.

**Rearrange in the Layers tree** with the file-browser thirds: the top quarter of a row means
*before* it, the bottom quarter *after* it, the middle *into* it. The canvas has its own
insertion line; the tree now has the same precision.

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

**Compare tiers.** One toggle renders the same document in four rooms at once — initial, sm,
md, lg. This is a comparison a viewport-keyed system cannot honestly show; here the tiers are
container queries, so four boxes on one screen resolve four different answers for real.

**Give a document its own appearance.** A dark screen inside a light app is a composition;
the document says so, the canvas shows it, and the export states it.

**Edit several things at once.** Select five buttons and set their size in one gesture. This
is what the closed unions pay for: "make these the same size" is a guess where size is a
number, and here it is a pick from a list every one of them already answers. Only knobs that
mean the same thing on every selected type are offered — a Button's `size` is the control
ladder and a Text's is the type ladder, so that pair gets no size knob at all.

**Zoom the canvas**, 50% to 200%, from the bar or with the usual chords. It is a magnifying
glass and not a resize: at 67% the canvas still measures 880px and still answers the `md`
tier, so nothing you see is a different room from the one you are designing.

**Filter the Layers tree** (⌘F). It hides rather than dims, and keeps the path to every match.

**See what an index comes to.** Select anything and the inspector says its box, gap, padding,
corner and type in real pixels, with the stated index beside each. This is the readout only a
token system can give honestly, and every number is measured off the rendered element rather
than restated from the config.

**Open a saved block and edit it.** It opens as its own document; save it under the same name
and the block is updated. Blocks used to be write-only, so a typo meant rebuilding the card.

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

## 3. The night's second half: two audits, and what they found

Two adversarial audits ran over the builder — one over the editor's code, one over the review
engine against the brief it claims to enforce. Every finding was re-measured against the
shipped code before anything was changed, and each fix was falsified against the defect. The
five worth knowing about:

**A component dragged out of a slot became a ghost.** `slot` rides on the node, so moving a
Spinner out of a Button's `leading` seat handed the Stack a child still claiming a seat the
Stack does not offer — and the filter that hides slotted children from the flow is the one
BOTH the canvas and the exporter use. The node stayed in the tree, in Layers and in storage,
and was drawn and exported nowhere. Worse, the export still IMPORTED it: code the dialog
called ready to paste, failing lint on arrival. Fixed at the store's edit path, which is the
one door every edit passes through, rather than in the four operations that can cause it.

**The reviewer could write a value the system refuses.** `gap: index + 2` with no bound wrote
`gap="13"` onto a palette that stops at 12 — it left the package as unitless raw CSS, so the
fix that promised to open a gap deleted it. That is the builder's founding premise broken from
inside the one feature meant to enforce it. There is a law now that walks every repair every
rule offers and checks every value it writes against the axis it writes to.

**Preview left every destructive chord armed.** Preview draws no selection ring, but the
selection is still live — so with a canvas checkbox focused (Base UI draws one as a
`<button>`, which the typing guard does not see) Backspace deleted the selected node with
nothing on screen to say so.

**Typing was one undo entry per character.** Two lines of description cost 120 presses to take
back, and about 200 characters silently threw away every earlier snapshot, including the card
you built before you started typing.

**A drop between two grid cells was impossible.** The scan asked the container's `display` and
measured everything that was not a flex row on Y alone — so the two cells of a grid row shared
a midpoint, the scan stepped over both at once, and the position between them did not exist.
The indicator drew a full-width bar claiming to be somewhere the pointer was not.

The pattern across all five: each was a mechanism written correctly for the case its author
had in mind, applied to a case they did not. That is the same finding this repo's package
audits keep making, and the same answer works — put the rule in one place the whole system
passes through, then write a law that reads the result rather than the intention.

**Then I audited the night's own work, and it found three defects I had shipped hours
earlier.** Worth reading in that order, because it is the more useful half:

- **The commit that fixed the drop indicator introduced a new way for it to lie.** Deriving
  the gutter from the pointer's row looks equivalent to reading the two items that straddle
  the index, and is not: inside a row holding one item — every row of a Stack — they are the
  same row, so the line drew through the middle of the item under the pointer. Its five new
  laws asserted orientation, width and height and never a POSITION, which is how a positional
  regression got past the laws written in the same commit.
- **⌘X and ⌘V still edited the document in preview.** The key handler refuses every editing
  chord there; the clipboard rides the browser's own events through a separate listener that
  had no guard. And the law that says preview is safe walks the command table, while the
  sibling law certifies that these commands are not in it — two laws together attesting
  something false.
- **⌘B destroyed a saved block.** Making a block save replace by name is what closes the
  open-edit-save loop, and it made the AUTO-named path destructive: every unnamed Card
  derives "Card", so a second ⌘B replaced the first block silently, with no history to undo
  it. A derived name now takes the next free one; a typed name still replaces and says so.

Three more the audit found in older code: the rule deciding which loud action keeps the
figure budget sorted with `indexOf` over copies, so it did nothing and could flag the earlier
button; the width handle mixed painted pixels with CSS pixels under zoom; and the row grouping
existed twice again, because extracting it made a second copy rather than promoting the first.

## 4. What writing it taught (the part I would read if I were you)

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

**Performance was measured, and the first measurement was of the wrong thing.** At 280 nodes
a keystroke cost 71ms in the dev server. A CPU profile named the top frames: `jsxDEV`,
`createTask`, `logComponentRender` — React's development build, not this code. In production
the same document costs **12ms per keystroke**. Two real fixes came out of it anyway, because
the profile's shape (element creation dominating) pointed at them: the model's writes now
preserve identity where nothing changed, so an untouched subtree hands React the same object,
and the interpreter is memoized on that identity so it does not re-render at all. Storage
moved behind a 400ms idle timer (it was serializing the whole document per character) and
review yields to typing through a deferred value.

That change also introduced a bug the round-trip law caught immediately: Base UI's `render`
prop clones its own props onto the element it is given, and a memoized wrapper swallowed
them — the menu trigger had stopped announcing itself as a menu. The render path uses the raw
element now.

**A broken canvas used to take the editor with it.** The canvas renders real components, so a
document can reach a state one throws on — I measured it: an orphaned `MenuItem`, `SelectItem`
or `TabsPanel` each throw out of Base UI. That is the one failure an editor must not have,
because the work is still in memory and still undoable and the only thing between you and it
would be a blank page. There is a boundary now, and the interesting part is what it resets on.
I keyed it on the document id first. That is a dead end: the other way out of a broken canvas
is to delete the offending node in Layers — which draws from the model, so it keeps working —
and that leaves the id unchanged, so the boundary would have gone on showing a failure over a
tree that no longer contained it, with nothing left to press. It resets on the tree's identity
instead, which the model's structural sharing makes precise: an unrelated edit does not clear
it. If there is no history to step back to, the fallback says the Layers route rather than
offering a button that would do nothing.

**The wrong-element instrument mistake, three more times.** My browser probes measured the
document switcher instead of the theme panel, the outer Stack instead of the Flex, and a
field's wrapper instead of its input. Every time, a second source (the stored model, the
computed style) disagreed and that is what surfaced it. The round-trip law caught its own
harness too: React's raw `useId` salts needed the same order-preserving normalization Base
UI's ids already had.

## 5. Laws

`editor.test.ts` (82) covers the store, the commands, the grammar, the drop scan's
arithmetic, review and the canvas boundary; `builder.test.tsx` (98) still covers the
document's translation into code. 347 docs tests in total.

Every fix tonight was falsified against the defect it repairs before it was accepted — around
thirty sabotage runs. Three of those sabotages SURVIVED the first pass, and each one earned a
law that did not exist:

- A size repair that also rewrote an emphasis passed both "the finding went" and "the value is
  legal", because the value it wrote was a perfectly legal emphasis. Now a fix must be
  minimal: at most one prop, on at most one node.
- A row of controls measured against whichever one came first passed the round-trip law by
  silencing its own rule while making the row worse. Now the law re-reviews the whole
  document and refuses any finding the original did not have.
- The Layers filter threaded an ancestor list down its walk AND returned "something below
  matched" — deleting the first changed nothing, because the second already walks the chain
  up. Two mechanisms for one fact, one of them inert, found because its sabotage passed.

Three laws are new in kind and worth knowing about: every value a fix writes must be a member
of the axis it writes to; every rule must fire on a document the grammar allows (which is what
catches a dead exemption arm); and every global command must be unable to edit, which is what
makes preview safe by construction rather than by a list.

## 6. Open, on purpose

- **JSX import** stays refused. The document is truth; code is a build artifact.
- **Icons in slots** stay refused, with the reason written in the inspector where it bites.
- **Freeform positioning** stays impossible — the outer-spacing rule holds inside the tool.
- **"Fix all"** is not offered: fixes can interact, and a panel that silently rewrites eight
  things is a panel nobody trusts. One at a time, each undoable.
- **An unset `size` is invisible to the review rules that compare sizes.** The component's own
  default lives in the package, and reading it in the builder would be a second home for it —
  a wrong one the day a default moves. Stated where the rule is.
- **`heading-ladder` offers no fix.** Which step a heading wants depends on what it is
  titling, and the version that always wrote 6 turned a page title into a second card title
  one level up and then went quiet about it.

## 7. Where things are

`apps/docs/app/builder/`: `store.ts` (state), `commands.ts` (actions), `placement.ts`
(grammar questions), `model.ts` (tree surgery), `catalog.ts` (the one data table),
`review.ts` + `review-panel.tsx`, `templates.ts`, `geometry.ts` (the drop scan's rect
arithmetic, pure so it can be law-tested — the version it replaces could only be checked by
dragging, which is why it shipped wrong for two of four layouts), `chrome.tsx` (document bar,
jump bar, context menu, shortcut sheet, error boundary, empty state), `command-palette.tsx`,
`inspector.tsx`, `render.tsx`, `serialize.ts`, `builder-app.tsx` (the shell and the canvas).
