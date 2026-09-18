import {
  Card,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
} from "@kookie-ui/react";

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
