# The composer family — 2026-08-23

A chat composer is not one component. This document reconciles the whole pattern before
anyone builds a v2 Chatbar. It follows the method of the message family reconciliation
(LOG 2026-08-21, §28 and §29): ask what the pattern is, ask what Apple does, then decide
what the system owns.

It also corrects the audit in `2026-08-23-chatbar-v1-audit.md`. One of that document's four
questions rested on a claim I made from memory and never checked. The research refutes it.

## Sources

I read these. I did not work from memory.

| Source | What it is | How I read it |
|---|---|---|
| `vercel/ai-elements` | The AI SDK component library, built on shadcn/ui | Cloned. 49 components. |
| `assistant-ui/assistant-ui` | Headless React chat primitives | Cloned. 14 primitive families. |
| Apple HIG | The Generative AI page and the full component set | Apple's own JSON API |
| IBM Carbon | The chatbot guidance | Search result, page blocked |
| `field-sizing` support | Baseline status | Web search |

Two of the five are complete source trees, so the component lists and the behaviour below
are read from code, not from documentation about code.

## Apple ships no composer

Apple's component set holds ten categories. None of them contains a chat component. The two
input categories hold this:

- **Selection and input**: colour wells, combo boxes, digit entry views, image wells,
  pickers, segmented controls, sliders, steppers, text fields, toggles, virtual keyboards.
- **Content**: charts, image views, text views, web views.

There is no composer, no message, no conversation and no thread. The nearest components are
a text field and a text view.

Apple's Generative AI page gives guidance, not components. Three sentences on that page name
a concrete control:

- *"Give them the ability to dismiss new content they don't want, and revert or retry
  content transformations or other actions they don't agree with."*
- *"For open-ended features like a search bar or generation prompt, consider offering
  curated suggestions that make it easy to get started."*
- *"Clearly identify when and where you use AI."*

So Apple asks for a retry control, for suggestions, and for attribution. Apple does not give
you a chat UI.

**IBM Carbon files its chatbot guidance under community patterns, not under components.**

This repeats the 2026-08-21 result exactly. Apple had no callout, no banner and no toast, and
the pattern was still real. The same holds here.

## The complete pattern

Both reference libraries converge on the same shape. The table lists what each one ships.

### Group 1 — the composer

| Part | AI Elements | assistant-ui |
|---|---|---|
| Root, a `<form>` | `PromptInput` | `ComposerPrimitive.Root` |
| Text input that grows | `PromptInputTextarea` | `ComposerPrimitive.Input` |
| Send and stop | `PromptInputSubmit` | `Composer.Send` + `Composer.Cancel` |
| Attachment tray | `PromptInputAttachments` | `Composer.Attachments` |
| Add an attachment | `PromptInputActionAddAttachments` | `Composer.AddAttachment` |
| Drop target | in the body | `Composer.AttachmentDropzone` |
| Tool row | `PromptInputTools` | consumer builds it |
| Action menu | `PromptInputActionMenu*` | consumer builds it |
| Model picker | `PromptInputSelect*`, `model-selector` | consumer builds it |
| Slash commands | `PromptInputCommand*` | input plugins |
| Suggestions | `Suggestion`, `Suggestions` | `SuggestionPrimitive` |
| Voice input | `speech-input`, `transcription` | `Composer.Dictate` |
| Queue while streaming | `Queue`, `QueueItem*` | `Composer.Queue`, `queueItem` |
| Quote a selection | — | `Composer.Quote` |

### Group 2 — the thread

| Part | AI Elements | assistant-ui |
|---|---|---|
| Scroll viewport that sticks to the bottom | `Conversation` | `Thread.Viewport` |
| Scroll-to-bottom button | `ConversationScrollButton` | `Thread.ScrollToBottom` |
| Empty state | `ConversationEmptyState` | `Thread.Empty` |
| Message | `Message`, `MessageContent` | `Message.Root`, `Message.Parts` |
| Attachments on a sent message | in `Message` | `Message.Attachments` |
| Per-message actions | `MessageActions`, `MessageAction` | `ActionBar.*` |
| Copy, edit, reload, feedback, speak | `MessageAction` | nine named parts |
| Branches after an edit | `MessageBranch*` | `BranchPicker.*` |
| Sources and citations | `Sources`, `InlineCitation` | message parts |
| Reasoning, collapsible | `Reasoning` | `reasoning` |
| Tool and task calls | `Tool`, `Task`, `Plan` | `messagePart` |
| Error | in `Message` | `ErrorPrimitive` |

### Group 3 — the state that joins them

One value drives both groups: the request status. In AI Elements it is
`submitted | streaming | error | ready`. The composer reads it and the thread reads it.

**The same attachment part appears in both groups.** assistant-ui renders
`AttachmentPrimitive` inside `Composer.Attachments` and inside `Message.Attachments`. A file
you are about to send and a file you already sent are the same tile.

## What KookieUI owns

Apply the §10 anatomy rule at pattern scale: the system owns a part only when something
non-visual forces it.

**KookieUI owns group 1, and only the controls in it.** A composer is a surface that holds a
textarea, a row of buttons and a tray of chips. The system already has every rule these need:
the field family, the control size join, the surface layer, the focus ring, `Flex`.

**KookieUI does not own group 2.** A message, a branch, a reasoning block and a tool call
each encode a data model. AI Elements binds to the AI SDK `UIMessage` type. assistant-ui
binds to its own runtime and store. Neither library is a design system. Both are chat
runtimes with a user interface attached.

KookieUI has no runtime and should not grow one. `Form` is already deferred for the same
reason (LOG 2026-08-21). Toast is refused for a related one.

**The boundary sentence: KookieUI ships the composer. It does not ship the conversation.**

An app that wants a thread composes it from `ScrollArea`, `Card`, `Text` and `Button`, which
all exist. An app that wants message parts, branches and streaming brings a runtime.

## Corrections to the audit

### Q1 was wrong, and the correction is more useful than the claim

The audit said: *"No shipping AI chat input has a compact mode with a different set of
controls."* I did not check this. **assistant-ui ships a compact composer.**

`ComposerRoot.tsx` takes a `compact` prop. The correction matters because the two
implementations differ in mechanism, not in whether the axis exists:

| | assistant-ui | v1 Chatbar |
|---|---|---|
| Default | off, opt-in | on (`expandOn="both"`) |
| What expands it | content | focus |
| Condition | no attachments, no quote, no queue, no dictation, no newline | focus, or content taller than one line |
| What collapses it | the text becomes empty | focus leaves and the value is empty |
| Blur handler | none | `handleBlurCapture` |
| What it emits | one `data-compact` attribute | a React branch |
| Parts when it changes | nothing unmounts | two sets of slots mount and unmount |

The condition in `ComposerRoot.tsx` reads:

```js
const stateAllowsCompact = useAuiState((s) =>
  compact
    ? s.composer.attachments.length === 0 &&
      s.composer.quote == null &&
      s.composer.queue.length === 0 &&
      s.composer.dictation == null &&
      !s.composer.text.includes("\n")
    : false,
);
const isCompact = stateAllowsCompact && !multiline;
```

`setMultiline(true)` latches until the text is empty again. Nothing watches blur.

**So the axis is real and my recommendation to delete it was wrong.** The correct
recommendation: keep the axis, drive it from content instead of focus, and emit an attribute
instead of branching the tree.

That single change removes C5, removes the two slot vocabularies, removes the focus loss when
a slot unmounts, and removes the reason the layout animation exists.

### What the audit missed entirely

**1. There is no stop control.** Both references treat the primary button as a status
machine. AI Elements:

```js
const isGenerating = status === "submitted" || status === "streaming";
let Icon = <CornerDownLeftIcon />;
if (status === "submitted")      Icon = <Spinner />;
else if (status === "streaming") Icon = <SquareIcon />;   // stop
else if (status === "error")     Icon = <XIcon />;        // retry
```

assistant-ui splits the same idea into `Composer.Send` and `Composer.Cancel`.

v1 has `sendMode`, which decides whether the button is **visible**. It never decides what the
button **means**. A user cannot stop a running generation. For a component whose documented
purpose is *"AI chat interfaces"*, this is a larger defect than anything in the audit.

**2. The composer is a `<form>` in both references.** v1 is a `div` and removes `onSubmit`
from its props. A form gives Enter-to-submit, `requestSubmit()`, native validation and reset.
Both references send on Enter by default and treat Shift+Enter as the newline. v1 defaults
`submitOnEnter` to `false` and puts the prop on the part. **That default is downstream of not
being a form.**

**3. Auto-resize is now one CSS declaration.** AI Elements sizes its textarea with
`field-sizing-content max-h-48 min-h-16` and no JavaScript. `field-sizing: content` reached
Baseline newly available on 2026-06-16, when Firefox 152 shipped it.

v1 measures with `getComputedStyle`, `scrollHeight`, `requestAnimationFrame` and a
`ResizeObserver` on every keystroke. The audit reported this as finding M7. The research adds
the repair: **the mechanism v1 needed did not exist when it was written, and now it does.**
Safari is the one gap, so the fallback is `rows` plus `max-height`.

**4. An attachment tile belongs to both the composer and the message.** assistant-ui renders
the same primitive in both. v1 renders attachments only in the composer, which is part of why
C2 hurts: an app must rebuild the tile itself for a sent message, using a `url` that v1 has
already revoked.

## What to build

Build one component and refuse the rest. Order:

1. **The composer shell.** A `<form>` that is a surface holding a textarea. The textarea uses
   `field-sizing: content` with a `rows` fallback.
2. **The status button.** One control: send, stop, retry. It replaces `sendMode`.
3. **The attachment tile.** Usable in the composer and outside it. The app owns the files.
4. **Compact as an attribute.** Derived from content, never from focus. No unmounting.

Refuse in writing, with reasons: the thread, the message, branches, reasoning, tool calls,
sources, the queue, and the model picker. Each needs a data model the system does not have.
A model picker is a `Select`. Suggestions are `Button`s.

Open, and not settled here: whether the composer owns the files at all. The audit's question 2
still stands, and the research strengthens it — both references bind attachments to a runtime,
and KookieUI has none.

Sources: [vercel/ai-elements](https://github.com/vercel/ai-elements) ·
[assistant-ui](https://github.com/assistant-ui/assistant-ui) ·
[Apple HIG Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai) ·
[Carbon chatbot pattern](https://carbondesignsystem.com/community/patterns/chatbot/usage/) ·
[field-sizing baseline](https://polypane.app/blog/field-sizing-just-works/)
