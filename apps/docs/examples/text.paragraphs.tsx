import { Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Text size="3" render={<p />}>
        Shared folders let everyone in your workspace see the same files. Changes appear for other
        members as soon as you save.
      </Text>
      <Text size="3" render={<p />}>
        You can move a file out of a shared folder at any time. It becomes private to you again.
      </Text>
    </Stack>
  );
}
