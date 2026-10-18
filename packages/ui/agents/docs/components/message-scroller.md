# Message Scroller

MessageScroller keeps a conversation at its newest message while a reply arrives, and leaves your place alone when you scroll up.

Job: Converse. Talk back and forth. A pattern: it owns the decisions this job needs.

```tsx
<MessageScroller>
  <ScrollArea fade aria-label="Transcript">
    <MessageScrollerContent>
      <MessageScrollerItem messageId="m1" scrollAnchor>
        …
      </MessageScrollerItem>
    </MessageScrollerContent>
    <MessageScrollerButton aria-label="Jump to the latest">
      …
    </MessageScrollerButton>
  </ScrollArea>
</MessageScroller>
```

## Overview

Use a MessageScroller for a transcript that grows while people read it, such as a chat, a support thread or a live log. While people are at the end, it follows new content as it arrives. When they scroll up, it keeps their place until they scroll back to the end. For a list that does not grow, use a ScrollArea on its own.

A MessageScroller does not add a scroll box. It uses the `ScrollArea` or `ShellScroll` inside it as its viewport, so the pane keeps its fade, its scrollbars and its floating header. You draw the rows, the words and the counts yourself, and the Conversation block shows one way to lay out a turn.

Put each row in a `MessageScrollerItem` inside `MessageScrollerContent`. When a new row has `scrollAnchor`, it moves near the top of the view, so people start a long reply from its beginning. Older history can load above the view without moving what people are looking at.

`defaultScrollPosition` sets where the transcript opens: at the end, which is the default, at the start, or at the last row marked with `scrollAnchor`. Set `autoScroll={false}` to stop following new content.

`MessageScrollerButton` returns people to the latest message. It appears only while there is more content below, and it uses the theme's material because the transcript passes behind it. Give it an `aria-label` in your own words.

`MessageScrollerContent` is a live region, so screen readers announce new rows. Name the transcript with `aria-label` on the ScrollArea. To build your own controls, call `useMessageScroller`, `useMessageScrollerScrollable` or `useMessageScrollerVisibility` inside the MessageScroller. They move the transcript, tell you whether there is more to scroll at each end, and tell you which rows are on screen.

The behaviour comes from shadcn/ui's Message Scroller (MIT), through the `@shadcn/react` package. Kookie adds the styling and lets your own `ScrollArea` act as the scroller.

## Not supported

- `size` — The only thing a MessageScroller draws is its jump button. The rows are your own components, so set their sizes on them.
- A viewport of its own — Two scroll boxes in one pane fight over the scroll position, so the MessageScroller uses the `ScrollArea` that is already in the pane.
- A default label for the jump button — Any built-in label would be in English, so the button requires an `aria-label` that you write in your app's language.

## Examples

```tsx
import {
  Card,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3" style={{ height: "18rem" }}>
      <MessageScroller>
        <ScrollArea fade aria-label="Transcript">
          <MessageScrollerContent>
            {Array.from({ length: 12 }, (_, i) => (
              <MessageScrollerItem key={i} messageId={`m${i}`} scrollAnchor={i % 2 === 0}>
                <Stack gap="2">
                  <Text size="3" weight="medium">{i % 2 === 0 ? "Asked" : "Answered"}</Text>
                  <Text size="3" emphasis="medium">
                    A turn of a conversation, long enough that a dozen of them do not fit in the box.
                  </Text>
                </Stack>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
          <MessageScrollerButton aria-label="Jump to the latest">
            <span aria-hidden>↓</span>
          </MessageScrollerButton>
        </ScrollArea>
      </MessageScroller>
    </Card>
  );
}
```

### A streaming reply

Send a question and the reply arrives one word at a time. While you stay at the end, the view follows the words, and if you scroll up it stays where you left it.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Card,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

type Turn = { id: string; role: "question" | "answer"; text: string };

const reply =
  "Your storage is at 42 of 100 gigabytes. Most of it is build caches from the billing service. " +
  "You can clear old caches in the project settings, or move to the Team plan for more room. " +
  "Caches older than 30 days are not used by any current deploy, so clearing them is safe.";

// Send a question to watch the reply arrive. While you are at the end, the
// transcript follows the new words. Scroll up and it stops, until you come back.
export default function Example() {
  const [turns, setTurns] = React.useState<Turn[]>([
    { id: "q0", role: "question", text: "Which project uses the most build minutes?" },
    {
      id: "a0",
      role: "answer",
      text: "The billing service used 61% of this month's build minutes.",
    },
  ]);
  const [streaming, setStreaming] = React.useState(false);

  const send = () => {
    const n = turns.length;
    const answerId = `a${n}`;
    setTurns((all) => [
      ...all,
      { id: `q${n}`, role: "question", text: "Why is my storage almost full?" },
      { id: answerId, role: "answer", text: "" },
    ]);
    setStreaming(true);
    const words = reply.split(" ");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTurns((all) =>
        all.map((turn) =>
          turn.id === answerId ? { ...turn, text: words.slice(0, i).join(" ") } : turn,
        ),
      );
      if (i >= words.length) {
        window.clearInterval(timer);
        setStreaming(false);
      }
    }, 60);
  };

  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Card size="3" style={{ height: "18rem" }}>
        <MessageScroller>
          <ScrollArea fade aria-label="Conversation with the assistant">
            <MessageScrollerContent>
              {turns.map((turn) => (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor={turn.role === "question"}
                >
                  <Stack gap="1">
                    <Text size="2" emphasis="medium">
                      {turn.role === "question" ? "Shruti Bhatia" : "Assistant"}
                    </Text>
                    <Text size="3">{turn.text}</Text>
                  </Stack>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
            <MessageScrollerButton aria-label="Jump to the latest message">
              <HugeiconsIcon icon={ArrowDown02Icon} strokeWidth={iconStroke} aria-hidden />
            </MessageScrollerButton>
          </ScrollArea>
        </MessageScroller>
      </Card>
      <Button emphasis="loud" onClick={send} disabled={streaming}>
        Ask about storage
      </Button>
    </Stack>
  );
}
```

### Open at the start

This log uses `defaultScrollPosition="start"` so people read it from the top, and `autoScroll={false}` so new rows do not move the view.

```tsx
import {
  Card,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const entries = [
  "Shruti Bhatia created the project.",
  "Shruti Bhatia connected the repository.",
  "The first build passed.",
  "Shruti Bhatia added the domain billing.example.com.",
  "The certificate for the domain was issued.",
  "Shruti Bhatia invited two members.",
  "A preview build failed on the branch redesign.",
  "The preview build passed after a fix.",
  "The branch redesign merged into main.",
  "Production deployed.",
];

// A saved thread opens at its end. Set `defaultScrollPosition="start"` for a log
// that people read from the top. Use `"last-anchor"` to open at the last marked row.
export default function Example() {
  return (
    <Card size="3" style={{ height: "16rem", maxWidth: "32rem" }}>
      <MessageScroller defaultScrollPosition="start" autoScroll={false}>
        <ScrollArea fade aria-label="Project history">
          <MessageScrollerContent>
            {entries.map((entry, i) => (
              <MessageScrollerItem key={entry} messageId={`e${i}`}>
                <Stack gap="1">
                  <Text size="2" emphasis="medium">
                    Event {i + 1}
                  </Text>
                  <Text size="3">{entry}</Text>
                </Stack>
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </ScrollArea>
      </MessageScroller>
    </Card>
  );
}
```

### Jump to a message

Buttons outside the transcript call `useMessageScroller` to scroll to the first message, to one row by its `messageId`, or to the latest message.

```tsx
"use client";

import {
  Button,
  Card,
  Flex,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
  useMessageScroller,
} from "@kushagradhawan/kookie-ui-react";

const turns = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  author: i % 2 === 0 ? "Shruti Bhatia" : "Assistant",
  text:
    i % 2 === 0
      ? `Question ${i / 2 + 1} about the billing export.`
      : "An answer long enough that a dozen turns do not fit in the box at once.",
}));

// Call `useMessageScroller` inside the MessageScroller to move the transcript
// from your own controls: to the start, to the end, or to one row by its id.
function Controls() {
  const { scrollToStart, scrollToEnd, scrollToMessage } = useMessageScroller();
  return (
    <Flex gap="2" wrap="wrap">
      <Button onClick={() => scrollToStart()}>First message</Button>
      <Button onClick={() => scrollToMessage("m6", { align: "start" })}>
        Question 4
      </Button>
      <Button onClick={() => scrollToEnd()}>Latest</Button>
    </Flex>
  );
}

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <MessageScroller>
        <Controls />
        <Card size="3" style={{ height: "16rem" }}>
          <ScrollArea fade aria-label="Transcript">
            <MessageScrollerContent>
              {turns.map((turn) => (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor={turn.author !== "Assistant"}
                >
                  <Stack gap="1">
                    <Text size="2" emphasis="medium">
                      {turn.author}
                    </Text>
                    <Text size="3">{turn.text}</Text>
                  </Stack>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </ScrollArea>
        </Card>
      </MessageScroller>
    </Stack>
  );
}
```

### Your own jump control

A button built with `useMessageScrollerScrollable`, which reports whether there is more to scroll at each end. The button is disabled when you are already at the end.

```tsx
"use client";

import {
  Button,
  Card,
  Flex,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
  useMessageScroller,
  useMessageScrollerScrollable,
} from "@kushagradhawan/kookie-ui-react";

// Use `useMessageScrollerScrollable` to build your own control. It tells you
// whether there is more to scroll to at each end. Here the button is off at the end.
function NewMessages() {
  const scrollable = useMessageScrollerScrollable();
  const { scrollToEnd } = useMessageScroller();
  return (
    <Flex justify="flex-end">
      <Button disabled={!scrollable.end} onClick={() => scrollToEnd()}>
        Show new messages
      </Button>
    </Flex>
  );
}

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <MessageScroller defaultScrollPosition="start">
        <Card size="3" style={{ height: "14rem" }}>
          <ScrollArea fade aria-label="Support thread">
            <MessageScrollerContent>
              {Array.from({ length: 10 }, (_, i) => (
                <MessageScrollerItem key={i} messageId={`s${i}`}>
                  <Text size="3">
                    {i % 2 === 0
                      ? "Shruti Bhatia: The invoice for March shows the wrong seat count."
                      : "Support: Thanks, we are checking the seat history for March."}
                  </Text>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </ScrollArea>
        </Card>
        <NewMessages />
      </MessageScroller>
    </Stack>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Following new content

#### MessageScroller

MessageScroller keeps a conversation at its newest message while a reply arrives, and leaves your place alone when you scroll up.

| Prop | Type | What it does |
| --- | --- | --- |
| `autoScroll?` | `boolean` | Keeps the newest content in view while the user is at the end. |
| `children?` | `React.ReactNode` | A `ScrollArea` or a `ShellScroll` that holds the transcript and the jump button. |
| `defaultScrollPosition?` | `"start" \| "end" \| "last-anchor"` | Where the transcript opens: at the end, at the start, or at the last anchored message. |

#### MessageScrollerContent

The transcript. It is a live region, and each of its direct children must be a `MessageScrollerItem`

It declares no props of its own. It takes every prop of a `<div>`.

### Rows, anchors and the jump button

#### MessageScrollerItem

One row of the transcript. Give it a `messageId` to scroll to it, and set `scrollAnchor` on the row that starts a new turn

| Prop | Type | What it does |
| --- | --- | --- |
| `messageId?` | `string` | A stable id for the message. |
| `scrollAnchor?` | `boolean` | Scrolls this message near the top when it arrives, so the user sees the reply from its start. |

It also takes every prop of a `<div>`.

#### MessageScrollerButton

A button that returns to the latest message. It appears only while there is more content below and sits at the bottom of the view

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label` | `string` | The accessible name of the button, such as "Jump to latest". |
| `backdrop?` | `boolean` | Whether content passes behind the button. |
| `children` | `React.ReactNode` | The icon of the button. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
