# AI in the product

Kookie decides where AI lives in your app, not what it says. There are two layouts. Pick by
what the person came to do.

## The chat app

The conversation is the work, so it lives in the content. What the AI makes, such as a plan, a
document or code, opens in the inspector beside it.
```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, Cancel01Icon, File01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Card,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Heading,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  Shell,
  ShellContent,
  ShellInspector,
  ShellPaneHeader,
  ShellScroll,
  ShellTrigger,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof File01Icon) => <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />;

/* A placeholder conversation. Not a real assistant. */
const TURNS = [
  { id: "q1", from: "You", text: "Plan the first week of onboarding for a new designer." },
  {
    id: "a1",
    from: "Assistant",
    text: "Here's a five-day plan. Day one is accounts and the design system, and the week ends with a first small ship.",
  },
];

const PLAN = [
  { day: "Monday", what: "Accounts, the design system, and a walk through the product." },
  { day: "Tuesday", what: "Shadow two design reviews." },
  { day: "Wednesday", what: "Pair on a small fix with an engineer." },
  { day: "Thursday", what: "Own one small fix end to end." },
  { day: "Friday", what: "Ship it, then a retro with their lead." },
];

// The chat app layout: the conversation is the work, so it lives in the content. What the AI
// makes opens in the inspector beside it, and gives way first when space runs out. A card in
// the transcript opens it again after you close it.
export default function Example() {
  const [turns, setTurns] = React.useState(TURNS);
  const [draft, setDraft] = React.useState("");
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setTurns((all) => [...all, { id: `q${all.length}`, from: "You", text }]);
    setDraft("");
  };
  return (
    <Box m="bleed" flexGrow="1" height="34rem">
      <Shell contained style={{ "--shell-inspector-w": "20rem" } as React.CSSProperties}>
        <ShellContent>
          <MessageScroller>
            <ShellScroll aria-label="Conversation">
              <MessageScrollerContent>
                {turns.map((turn) => (
                  <MessageScrollerItem key={turn.id} messageId={turn.id} scrollAnchor={turn.from === "You"}>
                    <Stack gap="1">
                      <Text size="2" emphasis="medium">
                        {turn.from}
                      </Text>
                      <Text size="3">{turn.text}</Text>
                    </Stack>
                  </MessageScrollerItem>
                ))}
                <MessageScrollerItem messageId="artifact">
                  <ShellTrigger target="inspector" action="open" render={<Card render={<button type="button" />} />}>
                    <Flex gap="3" align="center">
                      {icon(File01Icon)}
                      <Text weight="medium">Onboarding week</Text>
                    </Flex>
                  </ShellTrigger>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </ShellScroll>
          </MessageScroller>
          <Composer onSubmit={send}>
            <ComposerInput aria-label="Message" placeholder="Message" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <ComposerRow>
              <Flex flexGrow="1" justify="end">
                <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
              </Flex>
            </ComposerRow>
          </Composer>
        </ShellContent>
        <ShellInspector aria-label="Onboarding week" defaultOpen>
          <ShellPaneHeader>
            <Toolbar>
              <ToolbarTitle>Onboarding week</ToolbarTitle>
              <ShellTrigger target="inspector" action="close" render={<ToolbarButton iconOnly aria-label="Close" />}>
                {icon(Cancel01Icon)}
              </ShellTrigger>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <Stack gap="5">
              {PLAN.map((item) => (
                <Stack key={item.day} gap="1">
                  <Heading size="5" render={<h3 />}>
                    {item.day}
                  </Heading>
                  <Text size="3" emphasis="medium">
                    {item.what}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </ShellScroll>
        </ShellInspector>
      </Shell>
    </Box>
  );
}
```
- **The transcript and the composer** sit in `ShellContent`. The transcript is the pane's
  `ShellScroll`, and the composer stays pinned below it.
- **What the AI makes** opens in a `ShellInspector`. A card in the transcript opens it again
  after it's closed.
- **When space runs out,** the inspector gives way first: on a narrow window it opens over the
  conversation and closes to give it back.

## The assistant

Your work lives in the content: a canvas, a document or a list. The AI is a helper in the
inspector.
```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowUp02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  Page,
  Shell,
  ShellContent,
  ShellInspector,
  ShellPaneHeader,
  ShellScroll,
  ShellTrigger,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  Toolbar,
  ToolbarButton,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Add01Icon) => <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />;

type Turn = { id: string; from: "you" | "assistant"; text: string };
type Chat = { id: string; title: string; turns: Turn[] };

/* Placeholder chats about a draft. Not a real assistant. */
const START: Chat[] = [
  {
    id: "tighten",
    title: "Tighten",
    turns: [
      { id: "t1", from: "you", text: "Make the second paragraph shorter." },
      { id: "t2", from: "assistant", text: "I cut it from 58 words to 31 and kept the date and the price." },
    ],
  },
  {
    id: "tone",
    title: "Tone",
    turns: [
      { id: "o1", from: "you", text: "Does the opening sound too formal?" },
      { id: "o2", from: "assistant", text: "A little. \"We're launching\" reads warmer than \"We are pleased to announce\"." },
    ],
  },
];

// The assistant layout: your work lives in the content, and the AI is a helper in the
// inspector. The inspector IS the Tabs root, so each chat is a tab in its band and a panel in
// its scroller, with the composer pinned below. When space runs out the chat gives way first.
export default function Example() {
  const [chats, setChats] = React.useState(START);
  const [chatId, setChatId] = React.useState(START[0]!.id);
  const [draft, setDraft] = React.useState("");
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setChats((all) =>
      all.map((c) => (c.id === chatId ? { ...c, turns: [...c.turns, { id: `${c.id}-${c.turns.length}`, from: "you", text }] } : c)),
    );
    setDraft("");
  };
  const newChat = () => {
    const id = `chat-${chats.length + 1}`;
    setChats((all) => [...all, { id, title: "New chat", turns: [] }]);
    setChatId(id);
  };
  return (
    <Box m="bleed" flexGrow="1" height="34rem">
      <Shell contained style={{ "--shell-inspector-w": "20rem" } as React.CSSProperties}>
        <ShellContent>
          <ShellScroll>
            <Page title="Launch" description="Draft announcement">
              <Stack gap="3">
                <Text size="3">
                  We're launching Studio for teams on 14 April. Every plan gets shared libraries,
                  comments on any frame, and one bill for the whole team.
                </Text>
                <Text size="3">
                  Team pricing starts at $24 per editor each month, billed yearly. Existing Pro
                  customers move over at their current price.
                </Text>
              </Stack>
            </Page>
          </ShellScroll>
        </ShellContent>
        <Tabs
          value={chatId}
          onValueChange={(value) => setChatId(value as string)}
          render={<ShellInspector aria-label="Assistant" defaultOpen />}
        >
          <ShellPaneHeader>
            <Toolbar>
              <TabsList aria-label="Chats">
                {chats.map((c) => (
                  <TabsTab key={c.id} value={c.id}>
                    {c.title}
                  </TabsTab>
                ))}
              </TabsList>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="New chat" onClick={newChat}>
                  {icon(Add01Icon)}
                </ToolbarButton>
                <ShellTrigger target="inspector" action="close" render={<ToolbarButton iconOnly aria-label="Close" />}>
                  {icon(Cancel01Icon)}
                </ShellTrigger>
              </Flex>
            </Toolbar>
          </ShellPaneHeader>
          <MessageScroller>
            <ShellScroll>
              {chats.map((c) => (
                <TabsPanel key={c.id} value={c.id}>
                  <MessageScrollerContent>
                    {c.turns.map((turn) => (
                      <MessageScrollerItem key={turn.id} messageId={turn.id} scrollAnchor={turn.from === "you"}>
                        <Stack gap="1">
                          <Text size="2" emphasis="medium">
                            {turn.from === "you" ? "You" : "Assistant"}
                          </Text>
                          <Text size="3">{turn.text}</Text>
                        </Stack>
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </TabsPanel>
              ))}
            </ShellScroll>
          </MessageScroller>
          <Composer onSubmit={send}>
            <ComposerInput aria-label="Message" placeholder="Message" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <ComposerRow>
              <Flex flexGrow="1" justify="end">
                <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
              </Flex>
            </ComposerRow>
          </Composer>
        </Tabs>
      </Shell>
    </Box>
  );
}
```
- **Several chats** are tabs in the inspector's band. The inspector is the `Tabs` root, so each
  chat's transcript is its tab's panel.
- **The transcript** fills the inspector's scroller, and the composer is pinned to its foot.
- **When space runs out,** the chat gives way first: on a narrow window it opens over the work
  and closes to give it back.

## Rules for both

- **Label the AI.** Every reply says it came from the assistant, so no one mistakes it for a
  person.
- **What the AI makes has its own pane.** It opens beside the conversation, never inside the
  transcript.
