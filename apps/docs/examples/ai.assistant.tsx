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
