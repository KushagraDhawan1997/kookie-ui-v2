import {
  Card,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
} from "@kookie-ui/react";

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
