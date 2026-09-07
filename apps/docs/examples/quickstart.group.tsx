import { Checkbox, Flex, Stack, Text } from "@kookie-ui/react";

export default function Options() {
  return (
    <Stack gap="5">
      <Flex align="center" gap="3">
        <Checkbox id="tests" defaultChecked />
        <Text render={<label htmlFor="tests" />}>
          Run tests before publishing
        </Text>
      </Flex>
      <Flex align="center" gap="3">
        <Checkbox id="notify" />
        <Text render={<label htmlFor="notify" />}>
          Notify the team in Slack
        </Text>
      </Flex>
    </Stack>
  );
}
