import { Flex, Toggle } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Toggle size="1" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="2" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="3" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="4" defaultPressed>
        Show hidden files
      </Toggle>
    </Flex>
  );
}
