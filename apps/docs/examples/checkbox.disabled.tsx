import { Checkbox, Flex, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Checkbox id="sso" defaultChecked disabled />
        <Text size="2" render={<label htmlFor="sso" />}>
          Require single sign-on
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Checkbox id="audit" disabled />
        <Text size="2" render={<label htmlFor="audit" />}>
          Keep an audit log for 2 years
        </Text>
      </Flex>
    </Stack>
  );
}
