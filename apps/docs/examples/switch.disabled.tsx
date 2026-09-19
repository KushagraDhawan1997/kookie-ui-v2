import { Flex, Stack, Switch, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Switch id="sso-off" disabled />
        <Text size="2" render={<label htmlFor="sso-off" />}>
          Require single sign-on
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Switch id="audit-on" disabled defaultChecked />
        <Text size="2" render={<label htmlFor="audit-on" />}>
          Keep an audit log
        </Text>
      </Flex>
    </Stack>
  );
}
