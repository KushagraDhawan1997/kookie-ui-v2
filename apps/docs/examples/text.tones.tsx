import { Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="2">
      <Text size="3" tone="success">
        Payment received. Your invoice is paid.
      </Text>
      <Text size="3" tone="warning">
        Your card expires at the end of this month.
      </Text>
      <Text size="3" tone="destructive">
        The last deployment failed. Check the build log.
      </Text>
      <Text size="3" tone="destructive" emphasis="medium">
        Retried twice, 4 minutes ago.
      </Text>
    </Stack>
  );
}
