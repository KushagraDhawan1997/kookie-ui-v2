# Composer

Composer is the box where people type a message and send it, as in a chat or a comment thread.

Job: Converse. Talk back and forth. A pattern: it owns the decisions this job needs.

```tsx
<Composer onSubmit={send}>
  <ComposerInput aria-label="Message" placeholder="Ask anything" />
  <ComposerRow>
    <Button iconOnly aria-label="Add attachment">{icon}</Button>
    <ComposerSend status={status} icons={{ ready: sendIcon }} />
  </ComposerRow>
</Composer>
```

## Overview

A Composer is the box people type a message into. It holds a text area that grows as you type, a row of controls under it, and a send button. Use it for an AI chat, a support inbox, a team thread or a comment field, which all share this shape. For one line of text in a form, use a `TextField`, and for a longer answer in a form, use a `TextArea`.

The Composer is a real `<form>`, and `onSubmit` runs when someone sends. Enter sends and Shift+Enter starts a new line, as in most chat apps. Enter doesn't send while someone is still composing Japanese, Chinese or Korean characters, and it doesn't send again while a request is running.

It looks like a `Card`, with the same fill, corner and shadow, because it holds full-size buttons rather than the small controls inside a text field. One `size` sets the padding, the corner, the text and every control in the row. A control that sets its own `size` keeps it.

`ComposerSend` changes meaning with `status`. `ready` sends, `submitted` shows a spinner, `streaming` turns it into a Stop button that calls `onStop`, and `error` turns it into Retry. It is the loud button by default. The package ships no icons, so pass your own with `icons`, and set `labels` to give each state an accessible name in your app's language.

The Composer doesn't show the conversation and doesn't keep files. Add your own attach button, and handle files that people drop or paste with `onFiles`. Use `notices` to show a `Notice` or a `Confirmation` above the box, and `context` for quiet facts below it, such as the model or how much context is left.

Set `backdrop` when content scrolls behind the Composer, so it uses the theme's material. `ComposerInput` needs an `aria-label` or `aria-labelledby`, because a placeholder isn't a name. The focus ring goes around the whole box while the text area has focus, but not when a button in the row has focus.

## Not supported

- The conversation — Messages, tool calls and reasoning each need a data model that belongs to your app. Build the conversation from `ScrollArea`, `Card` and `Text`, and keep the Composer for the input.
- Keeping the conversation scrolled to the bottom — Keeping a chat pinned to the newest message while a reply streams in is a hard problem of its own. Use a dedicated library or your chat runtime for it.
- An attach button — Your app decides which files it accepts and how it uploads them, so add your own `Button` with your own icon. Files that people drop or paste still reach `onFiles`.
- Holding the files — The Composer never stores files, previews or uploads, because your app owns them. Show each file with an `Attachment` tile, and set its `state` from your own upload code.
- Named slots for the start and end of the row — Which controls go on the left and which go on the right depends on what they mean in your app. Put each group of controls in a `Flex` inside `ComposerRow`.
- A compact or collapsed mode — The Composer has no compact mode yet, because nothing in it can fold away. It may arrive when the Composer holds something that can.
- `submitOnEnter` — Enter always sends and Shift+Enter always adds a line, as in most chat apps, so there is nothing to switch. Enter never sends while someone is composing Japanese, Chinese or Korean characters.

## Examples

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Attachment01Icon,
  Mic01Icon,
  ReloadIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  iconStroke,
  type ComposerStatus,
  type Size,
} from "@kushagradhawan/kookie-ui-react";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the
// system draws its own chevrons at, so your set matches them. No size: the control sizes the
// slot's svg for you.
const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  const [status, setStatus] = React.useState<ComposerStatus>("ready");
  const [value, setValue] = React.useState("");

  return (
    <Composer
      size={size}
      backdrop={backdrop}
      onSubmit={() => {
        // The app decides what sending means. The composer only says a person asked for it.
        setStatus("streaming");
        setValue("");
      }}
      onFiles={() => {}}
    >
      <ComposerInput
        aria-label="Message"
        placeholder="Reply to the thread…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <ComposerRow>
        <Flex gap="2">
          {/* The attach button is yours, because the files are. Drops and pastes still reach
              the composer's own onFiles. */}
          <Button iconOnly aria-label="Add attachment">
            {icon(Attachment01Icon)}
          </Button>
          <Button>Opus 5</Button>
        </Flex>
        <Flex gap="2">
          <Button iconOnly aria-label="Dictate">{icon(Mic01Icon)}</Button>
          <ComposerSend
            status={status}
            onStop={() => setStatus("ready")}
            // One button, four meanings — so the drawing follows the meaning. `submitted`
            // states none: the button's own spinner is what in-flight looks like.
            icons={{
              ready: icon(ArrowUp02Icon),
              streaming: icon(StopIcon),
              error: icon(ReloadIcon),
            }}
          />
        </Flex>
      </ComposerRow>
    </Composer>
  );
}
```

### Notices above the box

A warning `Notice` with a dismiss button sits in the `notices` slot. Notices appear in a column above the box, outside the form, so pressing their buttons never sends the message.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Notice,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `notices` holds messages that need attention before the next message.
// They sit in a column above the composer, outside the form, so their
// buttons never send the message.
export default function Example() {
  const [showLimit, setShowLimit] = React.useState(true);

  return (
    <Composer
      notices={
        showLimit ? (
          <Notice
            tone="warning"
            action={<Button>Upgrade plan</Button>}
            onDismiss={() => setShowLimit(false)}
          >
            You have used 90% of this month’s messages.
          </Notice>
        ) : null
      }
    >
      <ComposerInput aria-label="Message" placeholder="Reply to the thread…" />
      <ComposerRow>
        <Button>Opus 5</Button>
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
```

### A question before sending

A `Confirmation` in the `notices` slot asks a question, with `busy` set while the work starts. Focus doesn't move to it, because the person may be in the middle of typing.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Confirmation,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// A Confirmation asks a question and waits for the answer. Focus does not
// move to it, because the person may be in the middle of a sentence.
export default function Example() {
  const [asking, setAsking] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  return (
    <Composer
      notices={
        asking ? (
          <Confirmation
            confirmLabel="Run"
            cancelLabel="Not now"
            busy={busy}
            onConfirm={() => {
              setBusy(true);
              window.setTimeout(() => {
                setBusy(false);
                setAsking(false);
              }, 1200);
            }}
            onCancel={() => setAsking(false)}
          >
            Run the migration on 4 databases?
          </Confirmation>
        ) : null
      }
    >
      <ComposerInput aria-label="Message" placeholder="Ask about the migration…" />
      <ComposerRow>
        <span />
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
```

### Context below the box

The `context` slot shows quiet facts about the conversation, such as how much context is left and what a reply costs. You write the words, and the Composer places them below the box.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `context` holds quiet facts about the conversation, such as how much
// context is left or what a reply costs. It sits below the composer.
export default function Example() {
  return (
    <Composer
      context={
        <Flex justify="space-between">
          <Text size="2" emphasis="medium">
            62% of context left
          </Text>
          <Text size="2" emphasis="medium">
            About $0.04 per reply
          </Text>
        </Flex>
      }
    >
      <ComposerInput aria-label="Message" placeholder="Ask a follow-up…" />
      <ComposerRow>
        <Button>Opus 5</Button>
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
```

### Request states

After a send, `status` moves from `submitted` to `streaming` to `error`. Press the button while it streams to stop the request, and press Reset to start again.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, ReloadIcon, StopIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  iconStroke,
  type ComposerStatus,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `status` from your request. `submitted` shows a spinner, `streaming`
// turns the button into Stop, and `error` turns it into Retry. Enter does
// not send again while a request is running.
export default function Example() {
  const [status, setStatus] = React.useState<ComposerStatus>("ready");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Composer
      onSubmit={() => {
        setStatus("submitted");
        timer.current = window.setTimeout(() => {
          setStatus("streaming");
          timer.current = window.setTimeout(() => setStatus("error"), 2500);
        }, 1000);
      }}
    >
      <ComposerInput aria-label="Message" placeholder="Summarise last week’s support tickets…" />
      <ComposerRow>
        <Button onClick={() => setStatus("ready")}>Reset</Button>
        <ComposerSend
          status={status}
          onStop={() => {
            window.clearTimeout(timer.current);
            setStatus("ready");
          }}
          icons={{ ready: icon(ArrowUp02Icon), streaming: icon(StopIcon), error: icon(ReloadIcon) }}
        />
      </ComposerRow>
    </Composer>
  );
}
```

### Disabled

The text area and every control are disabled. The text dims to the same colour as a disabled `TextArea`, and the box itself doesn't change.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Disable the input and each control. The text dims to the same colour a
// disabled TextArea uses. The box itself does not change.
export default function Example() {
  return (
    <Composer>
      <ComposerInput
        aria-label="Message"
        placeholder="This thread is archived"
        defaultValue="Thanks, that fixed the build."
        disabled
      />
      <ComposerRow>
        <Button iconOnly aria-label="Add attachment" disabled>
          {icon(Attachment01Icon)}
        </Button>
        <ComposerSend disabled icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
```

### Controls in the row

An attach button and a `Select` share the row in a Composer at size 3. The Composer's size reaches every control in the row, so the text and the controls change size together.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const MODELS = { opus: "Opus 5", sonnet: "Sonnet 5", haiku: "Haiku 5" };

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Any control fits in the row. The composer's `size` reaches every
// control in it, so the Select, the Buttons and the text move together.
export default function Example() {
  return (
    <Composer size="3">
      <ComposerInput aria-label="Message" placeholder="Draft a release note…" />
      <ComposerRow>
        <Flex gap="2">
          <Button iconOnly aria-label="Add attachment">
            {icon(Attachment01Icon)}
          </Button>
          <Select defaultValue="opus" items={MODELS}>
            <SelectTrigger aria-label="Model" />
            <SelectContent>
              {Object.entries(MODELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Flex>
        <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### The box a message is typed into

#### Composer

Composer is the box where people type a message and send it, as in a chat or a comment thread.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the composer, such as a scrolling conversation. |
| `context?` | `React.ReactNode` | Short information about the conversation, such as the model or the remaining context. |
| `notices?` | `React.ReactNode` | Messages that need attention before the next message, such as `Notice` and `Confirmation`. |
| `onFiles?` | `(files: File[]) => void` | Called with the files that the user drops on the composer or pastes into the text. |
| `onSubmit?` | `(event: React.FormEvent<HTMLFormElement>) => void` | Called when the user sends a message. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the whole composer, from `1` to `4`. |

It also takes every prop of a `<form>`.

#### ComposerInput

The text area where people type. It has no border of its own, because the Composer around it is already the box, and it needs an `aria-label` or `aria-labelledby`

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The name of the input for screen readers, such as `Message`. |
| `aria-labelledby?` | `string` | The id of an element on the page that names this input. |

It also takes every prop of a `<textarea>`.

### The controls under it

#### ComposerRow

The row of controls under the text. It sets their alignment and spacing, and a `Flex` inside it groups controls that belong together

It declares no props of its own. It takes every prop of a `<div>`.

#### ComposerSend

The send button. Its `status` makes it send, show a spinner, stop a running request or retry a failed one

| Prop | Type | What it does |
| --- | --- | --- |
| `icons?` | `Partial<Record<ComposerStatus, React.ReactNode>>` | The icon for each `status`. |
| `labels?` | `Partial<Record<ComposerStatus, string>>` | The accessible name for each `status`. |
| `onStop?` | `() => void` | Called when the user presses the button while `status` is `streaming`. |
| `status?` | `"ready" \| "submitted" \| "streaming" \| "error"` | Sets what the request is doing, which changes what the button does. |
