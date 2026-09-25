import { Button, Card, Code, Flex, Heading, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        <Stack gap="1">
          <Heading size="6">API key</Heading>
          <Text size="2" emphasis="medium">
            Use this key to call the API from your server.
          </Text>
        </Stack>
        <Surface size="1">
          <Code>sk_live_4f9a…c21e</Code>
        </Surface>
        <Flex justify="flex-end" gap="2">
          <Button>Revoke</Button>
          <Button emphasis="loud">Copy key</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
