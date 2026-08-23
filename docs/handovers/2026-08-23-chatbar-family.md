# The composer family — 2026-08-23

A chat composer is not one component. This document reconciles the whole pattern before
anyone builds a v2 Chatbar. It follows the method of the message family reconciliation
(LOG 2026-08-21, §28 and §29): ask what the pattern is, ask what other people do, then decide
what the system owns.

It corrects two earlier documents. It corrects a claim in
`2026-08-23-chatbar-v1-audit.md`, and it corrects the boundary this document proposed in its
own first draft. Both corrections are recorded below, because both were made from memory and
the sources refute them.

## Sources

I read these. I did not work from memory.

| Source | What it is | How I read it |
|---|---|---|
| `shadcn-ui/ui` | The June 2026 chat components and `@shadcn/react` | Cloned. Registry, package, changelog. |
| `vercel/ai-elements` | The AI SDK component library | Cloned. 49 components. |
| `assistant-ui/assistant-ui` | Headless React chat primitives | Cloned. 14 primitive families. |
| Apple HIG | The Generative AI page and the full component set | Apple's own JSON API |
| IBM Carbon | The chatbot guidance | Search result; the site blocks this container |
| `field-sizing` | Baseline status | Web search |

Three of the six are complete source trees. The component lists and the behaviour below come
from code, not from documentation about code.

## The first reframe: this is a conversation pattern

shadcn released five chat components on 2026-06-26. Their own sentence about scope:

> Compose them together for AI chats, support inboxes, team threads, group chats, and
> product-specific conversations.

The pattern is **conversation**, not AI chat. A support inbox, a team thread and a group chat
are the same shape. v1's Chatbar names AI chat as its purpose in the documentation, and that
framing made the component narrower than the pattern.

## What shadcn shipped, and what they did not

They shipped `MessageScroller`, `Message`, `Bubble`, `Attachment` and `Marker`.

**They shipped no composer.** There is no composer, no prompt input and no chat bar in the
registry. I checked the directory rather than the documentation.

This is not a refusal. Their words:

> This is the first phase of the chat components work. We're taking it one piece at a time,
> reimagining the abstraction behind each part.
>
> We are starting with the conversation layer: scrolling, message rows, bubbles, attachments,
> and markers.

So the most relevant reference in this space shipped the **thread first** and left the
composer for a later phase.

## The criterion, in their words

This sentence is the whole decision, and it is better than the one I wrote:

> `MessageScroller` owns that behavior without owning your messages, AI state, transport,
> persistence, or model state. You bring the content renderer.

**Own the behaviour. Do not own the data.**

That is §10's anatomy rule stated for a pattern. It is not "controls yes, thread no", which is
what this document said in its first draft.

## The evidence that the criterion works

**`Message` is 92 lines and holds no data model.** It is `MessageGroup`, `Message`,
`MessageAvatar`, `MessageContent`, `MessageHeader`, `MessageFooter`. Every one is a `div` with
a class. The only prop on `Message` is `align="start" | "end"`. It does not know what a message
is, who sent it, or whether it is streaming.

**`Attachment` takes the state as a prop and draws it.** The prop is
`idle | uploading | processing | error | done`. The caller sets it. The component renders it
through `data-state`, in CSS:

```
data-[state=error]:border-destructive/30
data-[state=idle]:border-dashed
group-data-[state=processing]/attachment:shimmer
```

No `File` object. No object URL. No validation. No upload. The app owns all of that.

**The behaviour that is real lives in a package.** `MessageScroller` handles anchored turns,
streamed replies, saved thread restore, prepended history, jump-to-message, scroll controls and
visibility tracking.

| | Lines |
|---|---|
| `@shadcn/react/message-scroller` (behaviour, headless) | 6,274 |
| the registry component (styling) | 139 |

Their reason:

> This lets us ship behavior without locking it to a visual style. You still get
> copy-and-paste components that match your project, and the hard interaction logic stays
> tested in one place.

**The hard part of a conversation is scroll, and it is six thousand lines.**

These components are built on Base UI, with `useRender` and `mergeProps`. That is the same
primitive layer KookieUI v2 uses, and the same mechanism behind the `render` escape. The
comparison is direct.

## The complete pattern

Three groups. The table names what each reference ships.

### Group 1 — the composer

| Part | shadcn | AI Elements | assistant-ui |
|---|---|---|---|
| Root, a `<form>` | — | `PromptInput` | `Composer.Root` |
| Text input that grows | — | `PromptInputTextarea` | `Composer.Input` |
| Send and stop | — | `PromptInputSubmit` | `Composer.Send` + `Composer.Cancel` |
| Attachment tray | — | `PromptInputAttachments` | `Composer.Attachments` |
| Add an attachment | — | `PromptInputActionAddAttachments` | `Composer.AddAttachment` |
| Drop target | — | in the body | `Composer.AttachmentDropzone` |
| Tool row and action menu | — | `PromptInputTools`, `PromptInputActionMenu*` | consumer builds it |
| Model picker | — | `PromptInputSelect*` | consumer builds it |
| Slash commands | — | `PromptInputCommand*` | input plugins |
| Suggestions | — | `Suggestion` | `SuggestionPrimitive` |
| Voice input | — | `speech-input` | `Composer.Dictate` |
| Queue while streaming | — | `Queue`, `QueueItem*` | `Composer.Queue` |
| Quote a selection | — | — | `Composer.Quote` |

### Group 2 — the conversation

| Part | shadcn | AI Elements | assistant-ui |
|---|---|---|---|
| Scroll container | `MessageScroller` | `Conversation` | `Thread.Viewport` |
| Scroll-to-bottom | `MessageScroller.Button` | `ConversationScrollButton` | `Thread.ScrollToBottom` |
| Empty state | — | `ConversationEmptyState` | `Thread.Empty` |
| Message row | `Message`, `MessageGroup` | `Message` | `Message.Root` |
| Message surface | `Bubble`, `BubbleGroup` | `MessageContent` | `Message.Parts` |
| Attachment tile | `Attachment` | `Attachment` | `AttachmentPrimitive` |
| Status and separators | `Marker` | — | — |
| Per-message actions | `BubbleReactions` | `MessageActions` | `ActionBar.*` |
| Branches after an edit | — | `MessageBranch*` | `BranchPicker.*` |
| Sources and citations | — | `Sources`, `InlineCitation` | message parts |
| Reasoning, tools, tasks | — | `Reasoning`, `Tool`, `Task` | `messagePart` |

### Group 3 — the join

One value drives both groups: the request status. AI Elements calls it
`submitted | streaming | error | ready`.

**The attachment tile belongs to both groups.** shadcn ships one `Attachment` for a file being
sent and a file already sent. assistant-ui renders the same primitive in
`Composer.Attachments` and in `Message.Attachments`. v1 renders attachments only in the
composer.

Two CSS utilities ship with the shadcn set, and both matter here:

- `shimmer` — a text shimmer for live status: "Thinking…", running tools, streaming.
- `scroll-fade` — scroll-aware edge fades, *"without adding overlays or scroll listeners"*.

**Apple's HIG names a shimmer for active AI processing as well.** Two independent sources
arrive at the same signal. It is CSS in both.

## What KookieUI owns

Apply their criterion, not mine. **Own the behaviour. Do not own the data.**

**KookieUI can own the composer shell.** A form holding a textarea, a row of buttons and a
tray of chips. Every rule it needs exists: the field family, the control size join, the surface
layer, the focus ring, `Flex`.

**KookieUI can own the conversation layout**, and my first draft was wrong to refuse it.
shadcn proved the layout carries no data model: 92 lines for `Message`, one `align` prop. A
`Bubble` is a `Card` with an alignment. A `Marker` is a `Separator` with a label. KookieUI has
the parts.

**KookieUI cannot own the scroller.** Six thousand lines of anchoring, auto-follow, prepend
preservation and visibility tracking is a package, not a component, and shadcn shipped it as
one. An app brings `@shadcn/react/message-scroller`, assistant-ui or the AI SDK.

**KookieUI must not own the message data.** No `UIMessage`, no parts, no branches, no
transport, no persistence. This is where AI Elements and assistant-ui both bind to a runtime,
and it is the line KookieUI cannot cross without becoming one.

**`shimmer` is a token-level thing worth taking.** It is a CSS animation for a live status, two
sources agree on it, and §8's rule already covers it: it is motion that IS the content, which
is the Spinner's category.

## Corrections

### Correction 1 — the audit's question 1 was argued from a false claim

The audit said: *"No shipping AI chat input has a compact mode with a different set of
controls."* I wrote that from memory. **assistant-ui ships a compact composer.**

`ComposerRoot.tsx` takes a `compact` prop. The two differ in mechanism, not in whether the
axis exists:

| | assistant-ui | v1 Chatbar |
|---|---|---|
| Default | off, opt-in | on (`expandOn="both"`) |
| What expands it | content | focus |
| Condition | no attachments, no quote, no queue, no dictation, no newline | focus, or content past one line |
| What collapses it | the text becomes empty | focus leaves and the value is empty |
| Blur handler | none | `handleBlurCapture` |
| What it emits | one `data-compact` attribute | a React branch |
| Parts when it changes | nothing unmounts | two sets of slots mount and unmount |

Keep the axis. Drive it from content. Emit an attribute instead of branching the tree. That
removes C5, both sets of slots, the focus loss when a slot unmounts, and the reason the layout
animation exists.

### Correction 2 — this document's own boundary was backwards

The first draft said: *"KookieUI ships the composer. It does not ship the conversation."*

shadcn did the opposite, and their criterion is better. The line is not composer against
thread. The line is **behaviour and layout against data and transport**. A conversation layout
carries no data model, and shadcn shipped it in 92 lines to prove it.

I reached the wrong boundary because I read two libraries that both bind to a runtime, and
concluded the thread requires one. shadcn shows it does not.

### What the audit missed entirely

**1. There is no stop control.** Both composer references make the primary button a status
machine. AI Elements:

```js
if (status === "submitted")      Icon = <Spinner />;
else if (status === "streaming") Icon = <SquareIcon />;   // stop
else if (status === "error")     Icon = <XIcon />;        // retry
```

v1 has `sendMode`, which decides whether the button is **visible**, never what it **means**.
A user cannot stop a running generation.

**2. The composer is a `<form>` in both references.** v1 is a `div` and removes `onSubmit`
from its props. A form gives Enter-to-submit, `requestSubmit()`, validation and reset. Both
references send on Enter by default. v1 defaults `submitOnEnter` to `false` and puts it on the
part. That default follows from not being a form.

**3. Auto-resize is now one CSS declaration.** AI Elements sizes its textarea with
`field-sizing-content max-h-48 min-h-16` and no JavaScript. `field-sizing: content` reached
Baseline newly available on 2026-06-16, when Firefox 152 shipped it. Safari is the gap, so the
fallback is `rows` plus `max-height`. Finding M7 now has a repair that did not exist when v1
was written.

**4. The attachment tile is shared, and it takes its state as a prop.** shadcn's five-value
`state` prop is the answer to the audit's question 2: the system draws the state and the app
owns the file. v1 owns `File` objects and object URLs, and that ownership is what causes C2.

## What to build

Two components, then stop.

1. **The composer shell.** A `<form>` that is a surface holding a textarea. Size the textarea
   with `field-sizing: content` and a `rows` fallback.
2. **The status button.** One control: send, stop, retry. It replaces `sendMode`.
3. **The attachment tile.** A `state` prop the caller sets. Usable inside the composer and
   inside a sent message. The app owns the files.
4. **Compact as an attribute.** Derived from content, never from focus. Nothing unmounts.

Then judge whether the conversation layout is worth its own components, or whether `Card`,
`Flex` and `Separator` already compose it. shadcn needed `Bubble` because shadcn has no
`Card` with an alignment. KookieUI might not.

Refuse in writing, with reasons: the scroller, message parts, branches, reasoning, tool calls,
sources and transport. A model picker is a `Select`. Suggestions are `Button`s.

Sources: [shadcn/ui chat components](https://ui.shadcn.com/docs/changelog/2026-06-chat-components) ·
[vercel/ai-elements](https://github.com/vercel/ai-elements) ·
[assistant-ui](https://github.com/assistant-ui/assistant-ui) ·
[Apple HIG Generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai) ·
[field-sizing baseline](https://polypane.app/blog/field-sizing-just-works/)
