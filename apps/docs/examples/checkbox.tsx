import { Checkbox, Flex, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox defaultChecked id="c1" />
        <Text size="2" render={<label htmlFor="c1" />}>Ship it</Text>
      </Flex>
      <Flex gap="3" align="center">
        <Checkbox id="c2" />
        <Text size="2" render={<label htmlFor="c2" />}>Hold for review</Text>
      </Flex>
    </Stack>
  );
}
