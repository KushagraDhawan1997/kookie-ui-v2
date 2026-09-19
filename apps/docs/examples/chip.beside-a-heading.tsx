import { Chip, Flex, Heading, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="4">
      <Flex gap="3" align="center">
        <Heading size="6">Website redesign</Heading>
        <Chip tone="info">Running</Chip>
      </Flex>
      <Flex gap="2" align="center">
        <Text size="2" emphasis="medium">
          Last deploy
        </Text>
        <Chip tone="success">Deployed</Chip>
      </Flex>
    </Stack>
  );
}
