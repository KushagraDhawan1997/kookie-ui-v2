import { Badge, Card, Flex, Heading, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="4">
        <Flex align="center" gap="3">
          <Heading size="6">api-gateway</Heading>
          <Badge tone="success">Live</Badge>
        </Flex>
        <Stack gap="2">
          <Flex align="center" gap="2">
            <Text size="2">Build 4821</Text>
            <Badge tone="destructive">Failed</Badge>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2">Build 4820</Text>
            <Badge tone="warning">Cancelled</Badge>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2">Build 4819</Text>
            <Badge>Queued</Badge>
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}
