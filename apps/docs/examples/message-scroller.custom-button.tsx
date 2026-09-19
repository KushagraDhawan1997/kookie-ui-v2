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
} from "@kookie-ui/react";

// Use `useMessageScrollerScrollable` to build your own control. It tells you
// whether there is more to scroll to at each end. Here the button is off at the end.
function NewMessages() {
  const scrollable = useMessageScrollerScrollable();
  const { scrollToEnd } = useMessageScroller();
  return (
    <Flex justify="flex-end">
      <Button disabled={!scrollable.end} onClick={() => scrollToEnd({ behavior: "smooth" })}>
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
