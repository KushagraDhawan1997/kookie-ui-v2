import { Flex, Switch, Text, type Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Flex gap="3" align="center">
      <Switch size={size} defaultChecked id="s1" />
      <Text size="2" render={<label htmlFor="s1" />}>
        Notifications
      </Text>
    </Flex>
  );
}
