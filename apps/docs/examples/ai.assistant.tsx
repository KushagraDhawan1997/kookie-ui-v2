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
