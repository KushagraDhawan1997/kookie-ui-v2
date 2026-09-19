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
} from "@kookie-ui/react";

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
      <Button onClick={() => scrollToStart({ behavior: "smooth" })}>First message</Button>
      <Button onClick={() => scrollToMessage("m6", { behavior: "smooth", align: "start" })}>
        Question 4
      </Button>
      <Button onClick={() => scrollToEnd({ behavior: "smooth" })}>Latest</Button>
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
