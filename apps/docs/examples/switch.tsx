import { Flex, Stack, Switch, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Switch defaultChecked id="s1" />
        <Text size="2" render={<label htmlFor="s1" />}>Notifications</Text>
      </Flex>
      <Flex gap="3" align="center">
        <Switch id="s2" />
        <Text size="2" render={<label htmlFor="s2" />}>Beta features</Text>
      </Flex>
    </Stack>
  );
}
