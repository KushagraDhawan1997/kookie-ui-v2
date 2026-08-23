# Chatbar v1 audit — 2026-08-23

An audit of the v1 Chatbar (`kookie-ui@0.3.22`), read ahead of building a v2 Chatbar.
Subject: `packages/kookie-ui/src/components/chatbar.tsx` (1,274 lines),
`chatbar.css` (529 lines), `tests/components/chatbar/behaviors.test.tsx` (3 laws),
`apps/docs/app/docs/chatbar/content.mdx`.

**Method, stated plainly: this is a source read, not a browser measurement.** `node_modules`
is not installed in this container, so nothing was mounted, nothing was measured and no law
was falsified. This repo's own standing rule is that a claim about a computed value is worth
what the browser says it is — so every finding below is marked with what backs it. Findings
marked **[read]** follow unambiguously from the source (a stamped attribute with no matching
selector; a variant absent from every focus block; two size blocks with identical
declarations). Findings marked **[read, unverified]** depend on third-party runtime behaviour
I could not exercise. Nothing here is marked measured, because nothing here was.

Fifteen findings reach a user. Five are ranked critical.

---

## Critical

### C1 — The Send button submits an empty message; the Enter key refuses to

Two submit paths, two different contracts.

`Textarea.handleKeyDown` guards properly (chatbar.tsx:900-910): `sendMode === 'never'` bails,
`sendMode === 'whenDirty'` with no text and no attachments bails.

`Send.handleClick` (chatbar.tsx:1223-1226) guards on nothing but `disabled`/`readOnly`:

```js
const handleClick = (event) => {
  if (ctx.disabled || ctx.readOnly) return;
  ctx.onSubmit?.({ value: ctx.value, attachments: ctx.attachments });
```

There is no `hasContent` check and no `sendMode` check. `hasContent` *is* computed four lines
above — and spent only on `visible`, which drives opacity.

That would be a dormant inconsistency if the button were unreachable when empty. It is
reachable. Under `sendMode="whenDirty"` an empty bar renders the button at
`opacity: 0; pointer-events: none` (chatbar.tsx:1240-1244) — **not** `disabled`, **not**
`aria-hidden`, and still in the tab order. A keyboard user tabs to an invisible control,
presses Enter, and `onSubmit({ value: '', attachments: [] })` fires. A screen reader
announces a Send button that sighted users cannot see.

The visibility mechanism is the defect twice over: an invisible-but-focusable control is a
WCAG 2.4.7 problem on its own, independent of the empty submit.

### C2 — The object URLs handed to `onSubmit` are revoked before the consumer can use them

`Send.handleClick` calls `onSubmit({ value, attachments })` and then, when clearing, calls
`ctx.setAttachments([])`. The cleanup effect (chatbar.tsx:405-414) revokes every tracked URL
absent from the new list:

```js
React.useEffect(() => {
  const currentUrls = new Set(attachments.map((a) => a.url).filter(Boolean));
  for (const url of Array.from(generatedUrlSetRef.current)) {
    if (!currentUrls.has(url)) { URL.revokeObjectURL(url); ... }
  }
}, [attachments]);
```

So the sequence is: hand the consumer objects carrying `url`, empty the list, revoke every
one of those URLs. By the time the consumer renders the message they just sent, `url` is dead
and the image is broken.

This is the direct cost of the component owning a resource the consumer also holds. The escape
exists — `file` is on the attachment, so the consumer can mint their own URL — but nothing in
the docs or the types says the one they were given is about to be destroyed. The most obvious
thing to build on this API (an optimistic message bubble showing the image you just attached)
is the thing that breaks.

### C3 — `variant="soft"` has no focus indicator at all [read]

`.rt-ChatbarInput` removes the native outline unconditionally (chatbar.css:34-35, 44-47).
The box is then expected to indicate focus via `:focus-within`. Every `:focus-within` block in
the file:

| line | selector | what it does |
|---|---|---|
| 370 | `.rt-variant-outline, .rt-variant-surface` | border colour → `--v-border-focus` |
| 381 | `.rt-variant-ghost` | background → `--v-bg-focus` |
| 392 | `.rt-variant-surface` | background → `--v-bg-focus` |
| 437 | `.rt-variant-classic` | outer ring, `0 0 0 2px var(--focus-8)` |

`soft` appears in none of them. It also sets `--text-area-border-width: 0px` and has no border
block. Focus changes nothing: no outline, no border, no background, no ring.

WCAG 2.4.7 Focus Visible, Level A. And `soft` is the variant the documentation playground
opens on (`chatbar-playground.tsx`: `useState('soft')`), so it is the default experience of
anyone evaluating the component.

Worth noting alongside it: the *shape* of the focus indicator differs per variant — an outer
2px ring on classic, a 1px border colour shift from `--accent-6` to `--accent-8` on
surface/outline, a background change on ghost, nothing on soft. Four spellings of one
guarantee, and a 1px hue shift is a weak indicator even where it exists.

### C4 — `readOnly` does not prevent attachment, and `disabled` only stops the drop path

No state guard exists in `appendFiles`, `appendFilesFromPaste`, `AttachTrigger`, or the remove
button on `Attachment`. The dropzone receives `disabled: !dropzone || disabled`
(chatbar.tsx:513) — `readOnly` never reaches it.

| path | `disabled` | `readOnly` |
|---|---|---|
| drag-and-drop | blocked | **accepted** |
| paste | blocked (a disabled textarea fires no paste) | **accepted** |
| `AttachTrigger` → file picker | **accepted** | **accepted** |
| remove an attachment | **accepted** | **accepted** |

So a read-only chatbar accepts files by all three routes and lets you delete the ones already
there, and a disabled chatbar still opens a file picker and still deletes attachments.
`AttachTrigger` renders a bare `<button>` with no `disabled` attribute — it is a live control
inside a dead component.

### C5 — `expandOn="none"` still auto-collapses, and can strand the bar closed

`handleBlurCapture` (chatbar.tsx:455-472) collapses on blur whenever the value and attachments
are empty. It reads `isOpenControlled`, `value` and `attachments`. It does not read `expandOn`.

The documentation says of `none`: *"Never auto-expand; control manually via `open` prop."*
The uncontrolled path therefore auto-collapses without auto-expanding. `expandOn="none"` with
`defaultOpen` gives a bar that closes itself the first time focus leaves it and cannot be
reopened by any user gesture — focus expansion is gated on `expandOn`, so nothing reopens it.

Auto-collapse is a policy and it is hard-wired past the prop that exists to govern policy.

---

## Major

### M1 — Three stamped data attributes resolve no rule anywhere in the package [read]

`data-drop-active`, `data-disabled` and `data-readonly` are written on the Root
(chatbar.tsx:610-612) and matched by nothing:

```
$ grep -rn "drop-active\|data-disabled\|data-readonly" src/components/chatbar.css
(no matches)
```

The JSDoc promises the first one explicitly — *"Visual feedback via `data-drop-active`
attribute during drag operations"* (chatbar.tsx:212). The drag feedback that does exist comes
from a separate `.rt-ChatbarDropOverlay` element, an undocumented second mechanism. So the
documented one is dead and the working one is unwritten.

The other two are worse, because nothing else covers for them: **there is no disabled or
read-only visual treatment in the stylesheet at all.** A disabled chatbar is pixel-identical
to a live one apart from whatever the browser does to the textarea's own text colour.

This is the class of defect v2's own history keeps recording — `inset` and `overflow` shipping
as no-ops, the `contrast="high"` block that resolved no rule in light. Same shape: an
attribute is stamped, a doc describes what it does, and no selector ever reads it.

### M2 — Size 3 and size 2 are the same size [read]

chatbar.css:194-219, open state:

| size | `border-radius` | `padding` |
|---|---|---|
| 1 | `min(--radius-6, --radius-2 + --space-2)` | `--space-3` |
| 2 | `min(--radius-7, --radius-3 + --space-3)` | `--space-4` |
| 3 | `min(--radius-7, --radius-3 + --space-3)` | `--space-4` |

Identical, under a comment reading *"Custom Chatbar size 3, different to Card size 4"*
(chatbar.css:210). The closed-state radii are identical too (chatbar.css:241-246: sizes 2
and 3 both take `min(--radius-6, --radius-2 + --space-2)`).

What actually separates size 3 from size 2 is `font-size`/`line-height` and a `min-height` of
`80px` — a raw pixel value where 1 and 2 use `--space-8`/`--space-9`. So the geometry ladder
has two rungs and the type ladder has three, and the third rung of the one ladder that does
move is spelled outside the token system.

### M3 — Six dead declarations, dressed as the size system, are why M2 is easy to miss [read]

chatbar.css:191-192, 203-204, 215-216 set `--text-area-padding-y` / `--text-area-padding-x` on
`.rt-ChatbarInput`, walking `--space-3` → `--space-4` → `--space-5` across the index. It reads
exactly like the size-to-padding mapping.

The only consumer of those custom properties in the package is `.rt-TextAreaInput`
(text-area.css:143-145). `.rt-ChatbarInput` is a different element and declares `padding: 0`
(chatbar.css:37).

So the third rung of the padding ladder is authored, visible in review, and inert — which is
precisely what makes M2 survive a reading of the file. Size 3 *looks* like it has its own
padding.

### M4 — Two validation systems that can disagree, and `pasteAccept` can only narrow

The drop path validates twice: react-dropzone applies its own `accept` record and `maxSize`
(chatbar.tsx:487-514), then `onDrop` hands the survivors to `appendFiles`, which re-validates
with `matchesAccept`, `maxFileSize` and the count budget.

The paste path does the same to itself. `appendFilesFromPaste` filters against `pasteAccepts`
and then calls `appendFiles`, which filters again against `accepts`. The consequence is a
documented prop that cannot do what it implies: **`pasteAccept` can only ever narrow `accept`,
never widen it.** A file that clears the paste filter and fails the accept filter is reported
to `onAttachmentReject` by the second pass, so the rejection reason describes a rule the
consumer thought they had overridden.

**[read, unverified]** The dropzone `accept` record is built by assigning `acc[pattern] = []`
for MIME patterns and bare extensions alike (chatbar.tsx:489-503). react-dropzone's documented
contract is `{ [mimeType]: extension[] }` — a key like `.pdf` is not a shape it describes. I
could not run it to see what it does with one.

### M5 — `matchesAccept` silently rejects every file when given a pattern it does not recognise

chatbar.tsx:302-314:

```js
for (const patRaw of patterns) {
  const pat = patRaw.toLowerCase();
  if (pat.includes('/')) { ...MIME... }
  else if (pat.startsWith('.')) { ...extension... }
}
return false;
```

Two arms, no else. `accept="pdf"` or `accept="image"` — a plausible mistake, and the sort of
thing a consumer writes once — matches nothing, and every file is rejected with reason
`'type'`. No warning, in dev or otherwise. The failure looks like the file being wrong rather
than the configuration.

### M6 — `aria-expanded` on a bare `<div>`

chatbar.tsx:617 puts `aria-expanded={open}` on the Root, which is a `div` with no role.
`aria-expanded` is only valid on roles that support it; a bare `div` maps to `generic`, which
does not. It will be reported by axe, and it names the wrong element besides — the control
that performs the disclosure is the textarea, not the box around it.

### M7 — Layout animation is JS at interaction time, running on every keystroke

Five Motion layout wrappers: the box (`layout`, chatbar.tsx:625), the grid
(`layout="position"`, 636), and then `Textarea` (925), `AttachmentsRow` (1017) and `Row` (1174)
each wrap themselves in another. Every height change from typing puts Motion through
measure-and-project work on the main thread.

Directly underneath it, `.rt-ChatbarInput` carries `transition: height 150ms ease-out`
(chatbar.css:43) — a second, independent clock animating the same visual quantity as the
spring above it. Two animation systems on one number.

This is the finding with the most weight for v2, because "no JS at interaction time" is a
stated non-negotiable there, not a preference.

### M8 — `LazyMotion` with a static import buys nothing

chatbar.tsx:3 imports `domAnimation` eagerly; chatbar.tsx:599 passes it to `LazyMotion`.
The entire purpose of `LazyMotion` is deferring the feature bundle behind
`features={() => import('...')}`. With a static import the bundle is in the graph regardless,
and what remains is a provider component mounted once per Chatbar instance.

### M9 — Two file inputs, two accept spellings, two ways to open the same dialog

Root renders react-dropzone's input (`{dropzone && <input {...getInputProps()} />}`).
Every `AttachTrigger` renders a second hidden input of its own and clicks it directly.
`apiRef.openFilePicker()` opens the first; the trigger opens the second.

They are filtered by different values built by different code — dropzone's `accept` record
versus `AttachTrigger`'s joined string (chatbar.tsx:1110-1112). The dialog a user sees depends
on which affordance they used.

### M10 — The context memo is decoration

The `useMemo` at chatbar.tsx:551-596 carries ~28 dependencies, among them `accept`, `onSubmit`
and `onAttachmentReject` — the props most likely to be inline literals at the call site, each
a fresh identity per render. `value` is in there too, so every keystroke invalidates it
regardless of what the consumer does.

Every part re-renders on every keystroke. Given the value lives in context this may be
unavoidable in this design; the point is that the memo does not avoid it and its size suggests
otherwise.

---

## Minor and hygiene

1. **A comment contradicts the line under it.** `InlineEnd`: *"Use CSS to hide when open
   instead of unmounting to avoid layout animation scale"* (chatbar.tsx:986) — the next
   statement is `if (ctx.open) return null;`.
2. **Both hiding mechanisms shipped.** `Row` returns `null` when closed *and* the CSS hides it
   (chatbar.css:79-85). The CSS half is unreachable.
3. **Unmounting slots on state change drops focus to `<body>`.** If focus is on a control
   inside `Row` or `InlineEnd` when the state flips, the focused node is removed and the
   keyboard user loses their place.
4. **Dead CSS:** `.rt-ChatbarDropIcon` (chatbar.css:471) has no consumer.
5. **Commented-out code shipped:** the `<Card>` wrapper around the attachment tile
   (chatbar.tsx:1084, 1104), `size={ctx.size}` (1097), and four commented declarations in the
   stylesheet (chatbar.css:146, 505, 510, 515).
6. **Raw px in component CSS:** `max-width: 200px` (139), `min-height: 80px` (232),
   `z-index: 10` (459).
7. **Hardcoded English, no i18n path:** `'Attachments'`, `'Send'`, `'Add attachments'`,
   `'Drop files here to attach'`, `` `Remove ${name}` ``, `'KB'`.
8. **File sizes are always KB:** `Math.ceil(size / 1024)` renders a 5 MB file as "5120 KB".
9. **`onOpenChange(true)` fires on every file append**, including when already open.
10. **`clearOnSubmit` means three different things.** On click, `clearOnSend` (a Send prop)
    gates the value and `clearOnSubmit` (a Root prop) gates the attachments; on Enter,
    `clearOnSubmit` gates both. And a controlled `value` is never cleared by either path —
    reasonable, undocumented.
11. **Attachment ids are `Date.now()` + `Math.random()`.**
12. **`submitOnEnter` defaults to `false`.** Enter-to-send is the near-universal expectation
    for a chat input; here it is opt-in, on the part rather than the root.
13. **`--text-area-border-width` is honoured in one place and hardcoded in two.** The focus
    box-shadow reads the variable (chatbar.css:371); rest and hover hardcode `1px` (352, 361).
    They agree only because every bordered variant happens to set it to `1px`.
14. **Test coverage is three behaviours.** Expand/collapse on focus, paste-to-attach, and the
    file-dialog blur guard. Nothing covers submit, validation, sizes, variants,
    disabled/readOnly, the send button, or any of C1-C5.

---

## What this means for a v2 Chatbar

### The non-negotiables v1 breaks

| v2 rule | v1 Chatbar |
|---|---|
| No JS at interaction time | Motion layout on every keystroke (M7) |
| Tokens only, no raw px | three sites (minor 6) |
| Elevation does not exist; no component exposes a shadow API | `variant="classic"` writes `--shadow-2` / `--shadow-3` directly |
| `size` is an index | three values, two geometries (M2) |
| Appearance is resolved output, never raw fills | five `variant` values, an axis v2 deleted (§9) |

Two runtime dependencies — `motion` and `react-dropzone` — carried for one component, against
a budget that currently prices a whole new control at tens of bytes.

### Four questions the audit surfaces and does not settle

**1. Is expand/collapse an axis at all, or a v1 artefact?** It is the single most expensive
idea in the component. It costs `expandOn` × `open`/`defaultOpen`/`onOpenChange`, two complete
slot vocabularies (`InlineStart`/`InlineEnd` for closed, `Row`/`RowStart`/`RowEnd` for open),
the blur-collapse policy, the overflow measurement, and the layout animation that exists to
smooth the transition between the two states. It produces C5, minor 1, minor 2 and minor 3,
and it is most of M7. No shipping AI chat input I can point to has a distinct compact mode
with a different set of controls — they grow with content, which is the auto-resize behaviour
alone. If the answer is "the bar grows and that is all", most of this component's surface area
goes away.

**2. Does the system own the file model?** v1 owns `File` objects, object URL lifecycle,
validation, rejection taxonomy and status flags. C2 is the direct cost of owning a resource
the consumer simultaneously holds, and M4/M5 are the cost of owning validation. The alternative
— the chatbar owns the *affordances* (a picker trigger, a drop target, paste interception) and
hands the consumer raw `File[]`, and the consumer owns everything after that — removes C2, M4
and M5 outright and drops `react-dropzone`.

**3. Which parts survive v2's anatomy criterion?** §10 says anatomy is system-owned only where
something non-visual forces it. Of eleven v1 parts: the textarea is forced (labelling), the
send button is arguable (submission), the attachments row is arguable. `InlineStart`,
`InlineEnd`, `Row`, `RowStart` and `RowEnd` are layout, and v2's answer to layout is `Flex`.

**4. What indicates focus?** v1 has four different answers and one variant with none (C3). v2
has one focus ring, solved per mode, floor-checked — so this question is already answered and
the v2 Chatbar should simply be a `.kui-field`-family member and inherit it.

### The one thing worth carrying over unchanged

The native-file-dialog blur guard (`fileDialogOpenRef`, chatbar.tsx:1121-1131). Opening a file
picker blurs the document, which would otherwise collapse the bar underneath the dialog the
user is standing in; Safari fires `blur` before `click`, so the guard has to be set on
`pointerdown`. That is a real platform finding, correctly diagnosed, and it is one of the three
things the test file covers. It survives any redesign that keeps a file picker — and it is
worth noting it is *only* needed if collapse-on-blur survives question 1.

---

## Appendix: severity summary

| | finding | backing |
|---|---|---|
| C1 | Send submits empty; Enter refuses; the button is invisible-but-focusable | read |
| C2 | `onSubmit` payload URLs are revoked before the consumer can use them | read |
| C3 | `variant="soft"` has no focus indicator | read |
| C4 | `readOnly` does not block attachment; `disabled` blocks only drops | read |
| C5 | `expandOn="none"` auto-collapses and can strand the bar closed | read |
| M1 | three stamped data attributes resolve no rule | read |
| M2 | size 3 ≡ size 2 in every geometric declaration | read |
| M3 | six dead padding declarations dressed as the size ladder | read |
| M4 | double validation; `pasteAccept` can only narrow | read (+1 unverified) |
| M5 | unrecognised `accept` pattern silently rejects everything | read |
| M6 | `aria-expanded` on a roleless `div` | read |
| M7 | Motion layout on every keystroke, plus a second clock on the same number | read |
| M8 | `LazyMotion` with a static import | read |
| M9 | two file inputs, two accept spellings, two open paths | read |
| M10 | the context memo is invalidated by its own dependency list | read |

**Next step before any v2 code: mount v1 and confirm C1-C5 in a browser.** Five minutes each,
and this repo's history says the difference between a reading and a measurement is where the
surprises live.
