import { Code, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3">
      <Text size="3">
        Run <Code>pnpm run ci</Code> before claiming a task done.
      </Text>
      <Text size="1">
        The flag is <Code>--experimental-strip-types</Code>.
      </Text>
    </Stack>
  );
}
