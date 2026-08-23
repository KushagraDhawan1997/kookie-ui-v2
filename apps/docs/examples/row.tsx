import { Card, Kbd, Row, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="1">
        <Row current>Overview</Row>
        <Row trailing={<Kbd>⌘1</Kbd>}>Deployments</Row>
        <Row trailing={<Text size="2" emphasis="quiet">12</Text>}>Environments</Row>
        <Row disabled>Billing</Row>
        <Row tone="destructive">Delete project</Row>
      </Stack>
    </Card>
  );
}
