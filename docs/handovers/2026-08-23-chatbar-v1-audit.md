# Chatbar v1 audit — 2026-08-23

The v1 Chatbar has fifteen defects that reach a user. Five are critical.

Subject: `kookie-ui@0.3.22`, files `packages/kookie-ui/src/components/chatbar.tsx`
(1,274 lines), `chatbar.css` (529 lines), `tests/components/chatbar/behaviors.test.tsx`
(3 tests), `apps/docs/app/docs/chatbar/content.mdx`.

This document follows `apps/docs/content/AUTHORING.md`.

`2026-08-23-chatbar-family.md` reconciles the whole composer pattern with researched sources.
Read it with this document. It corrects question 1 below, and it adds three defects this
audit missed: there is no stop control, the composer is not a `<form>`, and CSS now does the
auto-resize that finding M7 describes.

## How this audit was made

I read the source. I did not run the component.

`node_modules` is not installed in this container. I did not mount the component, I did not
measure a computed value, and I did not falsify a law. Every finding below carries a mark:

- **[read]** — the source shows this without ambiguity. An attribute has no matching
  selector. A variant is absent from every focus rule. Two size blocks hold the same
  declarations.
- **[read, unverified]** — the finding depends on how a third-party package behaves. I
  could not run that package.

Fourteen findings are **[read]**. One is **[read, unverified]**. None are measured.

**Confirm C1 to C5 in a browser before you write v2 code.** Each check takes about five
minutes. This repository has a long record of readings that a measurement then corrected.

---

## Critical

### C1 — The Send button submits an empty message

The chatbar has two submit paths and they follow different rules.

`Textarea.handleKeyDown` (chatbar.tsx:900-910) checks the content first. With
`sendMode="never"` it does nothing. With `sendMode="whenDirty"` and no text and no
attachments, it does nothing.

`Send.handleClick` (chatbar.tsx:1223-1226) checks only the disabled state:

```js
const handleClick = (event) => {
  if (ctx.disabled || ctx.readOnly) return;
  ctx.onSubmit?.({ value: ctx.value, attachments: ctx.attachments });
```

The component computes `hasContent` four lines above this handler. It uses the value only
for `visible`, which sets the opacity.

A user can reach this button when the chatbar is empty. `sendMode="whenDirty"` renders the
button with `opacity: 0` and `pointer-events: none` (chatbar.tsx:1240-1244). The button is
not disabled. It is not `aria-hidden`. It stays in the tab order.

A keyboard user tabs to a button they cannot see, presses Enter, and the app receives
`onSubmit({ value: '', attachments: [] })`. A screen reader announces a Send button that
sighted users cannot see. **[read]**

### C2 — Chatbar revokes the object URLs in the onSubmit payload

`Send.handleClick` calls `onSubmit({ value, attachments })`. It then calls
`ctx.setAttachments([])`. A cleanup effect (chatbar.tsx:405-414) revokes every URL that
left the list:

```js
React.useEffect(() => {
  const currentUrls = new Set(attachments.map((a) => a.url).filter(Boolean));
  for (const url of Array.from(generatedUrlSetRef.current)) {
    if (!currentUrls.has(url)) { URL.revokeObjectURL(url); ... }
  }
}, [attachments]);
```

The order is: give the app the attachment objects, empty the list, revoke the URLs on those
objects. The `url` value in that payload no longer works.

An app that shows the image from the payload gets a broken image. The app can recover,
because each attachment also carries its `file`. The documentation and the types do not say
that the `url` is about to stop working. **[read]**

### C3 — The soft variant shows no focus indicator

`.rt-ChatbarInput` removes the browser outline (chatbar.css:34-35, 44-47). The box around
the input then shows focus with `:focus-within`. The file holds four such rules:

| Line | Variant | What changes on focus |
|---|---|---|
| 370 | outline, surface | the border colour |
| 381 | ghost | the background |
| 392 | surface | the background |
| 437 | classic | an outer 2px ring |

The `soft` variant is in none of them. It also sets `--text-area-border-width: 0px` and has
no border rule. Focus changes no outline, no border, no background and no ring.

This fails WCAG 2.4.7 Focus Visible, Level A. The documentation playground opens on `soft`
(`chatbar-playground.tsx`: `useState('soft')`). It is the first thing an evaluator sees.

The four variants also show focus in four different ways. A 1px border colour change from
`--accent-6` to `--accent-8` is a weak indicator even where it works. **[read]**

### C4 — readOnly does not stop file attachment

`appendFiles`, `appendFilesFromPaste`, `AttachTrigger` and the remove button check no state.
The dropzone receives `disabled: !dropzone || disabled` (chatbar.tsx:513), so `readOnly`
never reaches it.

| Path | disabled | readOnly |
|---|---|---|
| Drag and drop | blocked | **accepted** |
| Paste | blocked | **accepted** |
| File picker button | **accepted** | **accepted** |
| Remove an attachment | **accepted** | **accepted** |

A read-only chatbar accepts files through all three routes. It also lets a user delete the
attachments that are already there.

A disabled chatbar blocks drag and drop and paste. It still opens a file picker and still
deletes attachments. `AttachTrigger` renders a `<button>` with no `disabled` attribute. The
button works inside a component that does not. **[read]**

### C5 — expandOn="none" still collapses the chatbar

`handleBlurCapture` (chatbar.tsx:455-472) collapses the chatbar when focus leaves it and the
value and the attachments are empty. It reads `isOpenControlled`, `value` and `attachments`.
It does not read `expandOn`.

The documentation says this about `none`: *"Never auto-expand; control manually via `open`
prop."*

The uncontrolled chatbar therefore collapses on its own but never expands on its own. Set
`expandOn="none"` and `defaultOpen`, and the chatbar closes the first time focus leaves it.
No user action opens it again, because focus expansion checks `expandOn` first.

`expandOn` governs this policy. The collapse ignores the prop. **[read]**

---

## Major

### M1 — Three data attributes match no CSS rule

The Root element writes `data-drop-active`, `data-disabled` and `data-readonly`
(chatbar.tsx:610-612). No selector in the package reads them:

```
$ grep -rn "drop-active\|data-disabled\|data-readonly" src/components/chatbar.css
(no matches)
```

The JSDoc describes the first one: *"Visual feedback via `data-drop-active` attribute during
drag operations"* (chatbar.tsx:212). The drag feedback comes from a separate element,
`.rt-ChatbarDropOverlay`. The documentation describes a mechanism that does nothing, and does
not describe the mechanism that works.

The other two attributes have no replacement. **The stylesheet holds no disabled treatment
and no read-only treatment.** A disabled chatbar looks the same as an enabled one, except for the
text colour the browser applies to the textarea. **[read]**

### M2 — Size 3 and size 2 are the same size

chatbar.css:194-219 gives the open state these values:

| Size | border-radius | padding |
|---|---|---|
| 1 | `min(--radius-6, --radius-2 + --space-2)` | `--space-3` |
| 2 | `min(--radius-7, --radius-3 + --space-3)` | `--space-4` |
| 3 | `min(--radius-7, --radius-3 + --space-3)` | `--space-4` |

Sizes 2 and 3 hold the same two values. A comment above size 3 reads *"Custom Chatbar size 3,
different to Card size 4"* (chatbar.css:210). The closed-state radii match as well
(chatbar.css:241-246).

Two things separate size 3 from size 2. The first is `font-size` and `line-height`. The
second is a `min-height` of `80px`, a raw pixel value where sizes 1 and 2 use `--space-8` and
`--space-9`.

The size prop offers three values. The geometry offers two. **[read]**

### M3 — Six declarations in the size blocks do nothing

Three size blocks set `--text-area-padding-y` and `--text-area-padding-x` on
`.rt-ChatbarInput` (chatbar.css:191-192, 203-204, 215-216). The values walk `--space-3`,
`--space-4`, `--space-5` across the index.

Only `.rt-TextAreaInput` reads those two properties (text-area.css:143-145).
`.rt-ChatbarInput` is a different element and sets `padding: 0` (chatbar.css:37).

These six declarations are why M2 is hard to find. A reviewer reads the size blocks, sees a
third value for size 3, and concludes that size 3 has its own padding. It does not. **[read]**

### M4 — Chatbar validates each file twice

The drop path runs two validators. react-dropzone applies its own `accept` record and
`maxSize` (chatbar.tsx:487-514). `onDrop` then passes the accepted files to `appendFiles`,
which applies `matchesAccept`, `maxFileSize` and the count limit again.

The paste path does the same. `appendFilesFromPaste` filters with `pasteAccepts`, then calls
`appendFiles`, which filters with `accepts`.

**`pasteAccept` can therefore only narrow `accept`. It can never widen it.** A file that
passes the paste filter and fails the accept filter reaches `onAttachmentReject` from the
second pass. The rejection names a rule the app believed it had overridden.

The code builds the dropzone `accept` record with `acc[pattern] = []` for MIME patterns and
for bare extensions (chatbar.tsx:489-503). react-dropzone documents the shape
`{ [mimeType]: extension[] }`. A key such as `.pdf` is not that shape. I could not run
react-dropzone to see what it does with one. **[read, unverified]**

### M5 — An unknown accept pattern rejects every file

chatbar.tsx:302-314:

```js
for (const patRaw of patterns) {
  const pat = patRaw.toLowerCase();
  if (pat.includes('/')) { ...MIME... }
  else if (pat.startsWith('.')) { ...extension... }
}
return false;
```

The loop has two branches and no fallback. `accept="pdf"` and `accept="image"` match nothing.
The component rejects every file with the reason `'type'`. It prints no warning, in
development or in production.

A developer sees a rejection that names the file type. The cause is the configuration.
**[read]**

### M6 — aria-expanded is on a div with no role

The Root sets `aria-expanded={open}` on a `div` (chatbar.tsx:617). A `div` has the role
`generic`, and `generic` does not support `aria-expanded`. An axe scan reports this.

The attribute also names the wrong element. The textarea opens the chatbar, not the box
around it. **[read]**

### M7 — The layout animation runs JavaScript on every keystroke

The component holds five Motion layout wrappers: the box (chatbar.tsx:625), the grid (636),
and `Textarea` (925), `AttachmentsRow` (1017) and `Row` (1174). Every height change from
typing makes Motion measure and project the layout on the main thread.

`.rt-ChatbarInput` also sets `transition: height 150ms ease-out` (chatbar.css:43). Two
animation systems therefore animate the same height at the same time.

v2 lists "no JS at interaction time" as a non-negotiable rule. This is the finding with the
most weight for a v2 build. **[read]**

### M8 — LazyMotion uses a static import

chatbar.tsx:3 imports `domAnimation` at the top of the file. chatbar.tsx:599 passes it to
`LazyMotion`.

`LazyMotion` exists to load the feature bundle later, through
`features={() => import('...')}`. A static import puts the bundle in the graph anyway. What
remains is a provider component that mounts once for each Chatbar. **[read]**

### M9 — Chatbar renders two file inputs

The Root renders the react-dropzone input. Each `AttachTrigger` renders a second hidden
input and clicks it directly.

`apiRef.openFilePicker()` opens the first input. The trigger button opens the second. Two
pieces of code build the filter for those inputs: a record for the dropzone, and a joined
string for the trigger (chatbar.tsx:1110-1112).

The file dialog a user sees depends on which control they used. **[read]**

### M10 — The context memo does not prevent re-renders

The `useMemo` at chatbar.tsx:551-596 lists about 28 dependencies. Three of them are `accept`,
`onSubmit` and `onAttachmentReject`. An app usually writes these as inline literals, and each
literal is a new value on each render.

`value` is also in the list. Every keystroke therefore creates a new context value.

Every part of the chatbar re-renders on every keystroke. The design may make this
unavoidable, because the value lives in the context. The memo does not avoid it, and its
size suggests that it does. **[read]**

---

## Minor and hygiene

1. **A comment contradicts the line below it.** `InlineEnd` reads *"Use CSS to hide when open
   instead of unmounting to avoid layout animation scale"* (chatbar.tsx:986). The next
   statement is `if (ctx.open) return null;`.
2. **Two mechanisms hide the Row.** The component returns `null` when the chatbar is closed.
   The CSS also hides it (chatbar.css:79-85). The CSS never applies.
3. **Unmounting a slot moves focus to `<body>`.** If focus is on a control inside `Row` or
   `InlineEnd` when the state changes, React removes the focused element.
4. **`.rt-ChatbarDropIcon` (chatbar.css:471) has no consumer.**
5. **The source ships commented-out code:** the `<Card>` wrapper (chatbar.tsx:1084, 1104),
   `size={ctx.size}` (1097), and four declarations in the stylesheet (chatbar.css:146, 505,
   510, 515).
6. **The stylesheet holds three raw pixel values:** `max-width: 200px` (139),
   `min-height: 80px` (232), `z-index: 10` (459).
7. **The component hardcodes English:** `'Attachments'`, `'Send'`, `'Add attachments'`,
   `'Drop files here to attach'`, `` `Remove ${name}` `` and `'KB'`.
8. **The component shows every file size in KB.** `Math.ceil(size / 1024)` shows a 5 MB file
   as "5120 KB".
9. **`onOpenChange(true)` fires each time files arrive**, including when the chatbar is
   already open.
10. **`clearOnSubmit` behaves in three ways.** On a click, `clearOnSend` clears the value and
    `clearOnSubmit` clears the attachments. On Enter, `clearOnSubmit` clears both. Neither
    path clears a controlled `value`. The documentation does not say so.
11. **Attachment ids use `Date.now()` and `Math.random()`.**
12. **`submitOnEnter` defaults to `false`.** Most chat inputs send on Enter. Here a developer
    must opt in, and the prop sits on the part rather than on the root.
13. **`--text-area-border-width` applies in one rule and is hardcoded in two.** The focus
    box-shadow reads the variable (chatbar.css:371). The rest and hover box-shadows write
    `1px` (352, 361). They agree because every bordered variant sets the variable to `1px`.
14. **The tests cover three behaviours.** They cover expand and collapse on focus,
    paste-to-attach, and the file dialog blur guard. They do not cover submit, validation,
    sizes, variants, disabled, readOnly, the send button, or C1 to C5.

---

## Rules the v1 Chatbar breaks

| v2 rule | What the Chatbar does |
|---|---|
| No JS at interaction time | Motion measures the layout on every keystroke (M7) |
| Tokens only, no raw px | Three raw pixel values |
| No component exposes a shadow API | `variant="classic"` writes `--shadow-2` and `--shadow-3` |
| `size` is an index | Three values, two geometries (M2) |
| Components expose tone and emphasis, never raw fills | Five `variant` values, an axis v2 deleted |

The component also carries two runtime dependencies, `motion` and `react-dropzone`. The v2
budget allows tens of bytes for a whole new control.

---

## Four questions to answer before you build

### 1. Does a v2 Chatbar expand and collapse?

Expand and collapse is the most expensive idea in the component. It costs the `expandOn`
prop, the `open` and `defaultOpen` and `onOpenChange` trio, two sets of slots
(`InlineStart` and `InlineEnd` when closed, `Row` and `RowStart` and `RowEnd` when open), the
collapse-on-blur rule, the overflow measurement, and the layout animation that smooths the
change.

It also causes C5, three of the minor findings, and most of M7.

**This paragraph corrected itself on 2026-08-23. See
`2026-08-23-chatbar-family.md`.** The first draft said that no shipping AI chat input has a
compact mode. I wrote that from memory and did not check it. assistant-ui ships a compact
composer, so the axis is real.

The research changes the recommendation rather than removing it. assistant-ui derives compact
from the **content**: no attachments, no quote, no queue, no dictation, and no newline in the
text. It has no blur handler. It emits one `data-compact` attribute and unmounts nothing.

v1 derives the same axis from **focus**, and branches the React tree.

Keep the axis. Move it from focus to content, and emit an attribute instead of a branch. That
change removes C5, both sets of slots, the focus loss when a slot unmounts, and the reason the
layout animation exists.

### 2. Does the system own the file model?

v1 owns the `File` objects, the object URL lifecycle, the validation, the rejection reasons
and the status flags.

C2 is the cost of owning a resource that the app also holds. M4 and M5 are the cost of owning
the validation.

The other option: the Chatbar owns the controls — a picker button, a drop target, paste
interception — and gives the app a `File[]`. The app owns everything after that. This removes
C2, M4 and M5, and it removes the `react-dropzone` dependency.

### 3. Which parts survive the v2 anatomy rule?

§10 says the system owns an anatomy only when something non-visual forces it.

v1 has eleven parts. Labelling forces the textarea. Submission is a weaker case for the send
button. The attachments row is a weaker case again.

`InlineStart`, `InlineEnd`, `Row`, `RowStart` and `RowEnd` are layout. The v2 answer to
layout is `Flex`.

### 4. What shows focus?

v1 has four answers and one variant with none (C3).

v2 has one focus ring. The generator solves it for each mode and checks it against a floor.
A v2 Chatbar should join the `.kui-field` family and use that ring.

---

## The one part to keep

Keep the file dialog blur guard (`fileDialogOpenRef`, chatbar.tsx:1121-1131).

Opening a file picker removes focus from the document. Without the guard, the chatbar
collapses under the dialog the user is looking at. Safari fires `blur` before `click`, so the
code must set the guard on `pointerdown`.

This is a correct platform finding, and one of the three behaviours the tests cover.

The guard is only necessary if collapse-on-blur survives question 1.

---

## Finding summary

| ID | Finding | Backing |
|---|---|---|
| C1 | The Send button submits an empty message | read |
| C2 | Chatbar revokes the object URLs in the onSubmit payload | read |
| C3 | The soft variant shows no focus indicator | read |
| C4 | readOnly does not stop file attachment | read |
| C5 | expandOn="none" still collapses the chatbar | read |
| M1 | Three data attributes match no CSS rule | read |
| M2 | Size 3 and size 2 are the same size | read |
| M3 | Six declarations in the size blocks do nothing | read |
| M4 | Chatbar validates each file twice | read, unverified |
| M5 | An unknown accept pattern rejects every file | read |
| M6 | aria-expanded is on a div with no role | read |
| M7 | The layout animation runs JavaScript on every keystroke | read |
| M8 | LazyMotion uses a static import | read |
| M9 | Chatbar renders two file inputs | read |
| M10 | The context memo does not prevent re-renders | read |
