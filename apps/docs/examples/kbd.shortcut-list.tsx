import { Flex, Kbd, Stack, Text } from "@kookie-ui/react";

const shortcuts = [
  { action: "Search the workspace", keys: "⌘K" },
  { action: "New project", keys: "⌘N" },
  { action: "Close the panel", keys: "Esc" },
];

// A list of shortcuts puts the action first and the key at the end of the row.
export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      {shortcuts.map((shortcut) => (
        <Flex key={shortcut.action} gap="4" justify="space-between" align="center">
          <Text size="3">{shortcut.action}</Text>
          <Kbd>{shortcut.keys}</Kbd>
        </Flex>
      ))}
    </Stack>
  );
}
