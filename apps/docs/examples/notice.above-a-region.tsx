"use client";

import { Button, Card, Heading, Notice, Row, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card style={{ maxWidth: "36rem" }}>
      <Stack gap="4">
        <Heading size="6">Environments</Heading>
        <Notice tone="warning" action={<Button>Reconnect</Button>}>
          Staging lost its database connection 4 minutes ago.
        </Notice>
        <Stack gap="1">
          <Row trailing="Healthy">Production</Row>
          <Row trailing="Offline">Staging</Row>
          <Row trailing="Healthy">Preview</Row>
        </Stack>
      </Stack>
    </Card>
  );
}
