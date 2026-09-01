import { Flex, Separator, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "16rem" }}>
      <Text size="2" weight="medium">Above</Text>
      <Separator />
      <Text size="2" emphasis="medium">Below</Text>
      <Flex gap="4" align="center">
        <Text size="2" weight="medium">Left</Text>
        <Separator orientation="vertical" />
        <Text size="2" emphasis="medium">Right</Text>
      </Flex>
    </Stack>
  );
}
