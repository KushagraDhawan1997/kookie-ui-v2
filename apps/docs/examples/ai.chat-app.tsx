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
