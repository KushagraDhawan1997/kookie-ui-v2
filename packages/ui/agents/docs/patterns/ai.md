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
  const [open, setOpen] = React.useState(true);
  return (
    <Box m="bleed" flexGrow="1" height="34rem">
      <Shell contained style={{ "--shell-inspector-w": "20rem" } as React.CSSProperties}>
        <ShellContent>
          <MessageScroller>
            <ShellScroll aria-label="Conversation">
              <MessageScrollerContent>
                {TURNS.map((turn) => (
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
            <Composer onSubmit={() => {}}>
              <ComposerInput aria-label="Message" placeholder="Message" />
              <ComposerRow>
                <span />
                <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
              </ComposerRow>
            </Composer>
        </ShellContent>
        <ShellInspector aria-label="Onboarding week" open={open} onOpenChange={setOpen}>
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
- **When space runs out,** the inspector gives way first. The conversation never does.

## The assistant

Your work lives in the content: a canvas, a document or a list. The AI is a helper in the
inspector.
```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  Page,
  Shell,
  ShellContent,
  ShellInspector,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Tabs,
  TabsList,
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
const CHATS: Chat[] = [
  {
    id: "tighten",
    title: "Tighten",
    turns: [
      { id: "t1", from: "you", text: "Make the second paragraph shorter." },
      {
        id: "t2",
        from: "assistant",
        text: "I cut it from 58 words to 31 and kept the date and the price.",
      },
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
// inspector. The inspector holds several chats as tabs in its band, the transcript in its
// scroller, and the composer pinned to its foot. When space runs out the chat gives way first;
// the work never does.
export default function Example() {
  const [chatId, setChatId] = React.useState(CHATS[0]!.id);
  const chat = CHATS.find((c) => c.id === chatId)!;
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
        <ShellInspector aria-label="Assistant" defaultOpen>
          <ShellPaneHeader>
            <Toolbar aria-label="Chats">
              <Tabs value={chatId} onValueChange={(value) => setChatId(value as string)}>
                <TabsList aria-label="Chats">
                  {CHATS.map((c) => (
                    <TabsTab key={c.id} value={c.id}>
                      {c.title}
                    </TabsTab>
                  ))}
                </TabsList>
              </Tabs>
              <ToolbarButton iconOnly aria-label="New chat">
                {icon(Add01Icon)}
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <MessageScroller>
            <ShellScroll aria-label={`${chat.title} chat`}>
              <MessageScrollerContent>
                {chat.turns.map((turn) => (
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
            </ShellScroll>
          </MessageScroller>
            <Composer onSubmit={() => {}}>
              <ComposerInput aria-label="Message" placeholder="Message" />
              <ComposerRow>
                <span />
                <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
              </ComposerRow>
            </Composer>
        </ShellInspector>
      </Shell>
    </Box>
  );
}
```
- **Several chats** are tabs in the inspector's band.
- **The transcript** fills the inspector's scroller, and the composer is pinned to its foot.
- **When space runs out,** the chat gives way first. The work never does.

## Rules for both

- **Label the AI.** Every reply says it came from the assistant, so no one mistakes it for a
  person.
- **What the AI makes stays beside the conversation.** It opens in its own pane, never on top of
  the chat.
