import { Flex, Stack, Surface, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Surface size="2" render={<Stack gap="3" />}>
      <Text size="3" weight="medium">
        Storage
      </Text>
      <Flex justify="space-between" gap="4">
        <Text size="2" emphasis="medium">
          Files
        </Text>
        <Text size="2">18.4 GB</Text>
      </Flex>
      <Flex justify="space-between" gap="4">
        <Text size="2" emphasis="medium">
          Backups
        </Text>
        <Text size="2">6.1 GB</Text>
      </Flex>
    </Surface>
  );
}
