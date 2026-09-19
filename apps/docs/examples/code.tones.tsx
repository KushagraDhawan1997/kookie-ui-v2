import { Code, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3">
      <Text size="3">
        The request returned <Code tone="success">200 OK</Code>.
      </Text>
      <Text size="3">
        The deploy stopped with <Code tone="destructive">ERR_MODULE_NOT_FOUND</Code>.
      </Text>
      <Text size="3">
        The flag <Code tone="warning">--legacy-peer-deps</Code> is deprecated.
      </Text>
    </Stack>
  );
}
