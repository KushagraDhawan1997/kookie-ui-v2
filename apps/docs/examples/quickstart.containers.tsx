import { Card, Heading, Stack, Text } from "@kookie-ui/react";

export default function Publish() {
  return (
    <Card size="4">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6">Publish site</Heading>
          <Text emphasis="medium">
            Your site goes live at kookie.dev when the build
            finishes.
          </Text>
        </Stack>
        {/* the options go here */}
      </Stack>
    </Card>
  );
}
