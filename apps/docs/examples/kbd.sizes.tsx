import { Kbd, Stack, Text } from "@kookie-ui/react";

// Without `size`, a key takes the size of the text around it.
// Set `size` only when the key stands on its own.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
      <Text size="3">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
      <Text size="5">
        Press <Kbd>⌘K</Kbd> to search.
      </Text>
    </Stack>
  );
}
