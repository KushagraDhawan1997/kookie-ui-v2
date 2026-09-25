import { Flex, Kbd, Text } from "@kushagradhawan/kookie-ui-react";

// Give each key its own Kbd when a shortcut needs keys pressed together.
// Put the words that join them in the text, not in the key.
export default function Example() {
  return (
    <Flex gap="4" wrap="wrap">
      <Text size="3">
        <Kbd>⌘</Kbd> <Kbd>⇧</Kbd> <Kbd>P</Kbd> opens the command list.
      </Text>
      <Text size="3">
        <Kbd>Ctrl</Kbd> then <Kbd>Enter</Kbd> sends the message.
      </Text>
    </Flex>
  );
}
