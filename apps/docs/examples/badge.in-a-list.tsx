import { Badge, Row, Stack } from "@kushagradhawan/kookie-ui-react";

// In a navigation list, put the badge in the row's `trailing` slot so every count lines up at
// the end.
export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "16rem" }}>
      <Row current trailing={<Badge>6</Badge>}>
        Inbox
      </Row>
      <Row trailing={<Badge tone="neutral">2</Badge>}>Drafts</Row>
      <Row>Sent</Row>
      <Row trailing={<Badge tone="destructive" aria-label="Delivery failed" />}>Outbox</Row>
    </Stack>
  );
}
