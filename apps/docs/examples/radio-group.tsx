import { Flex, Radio, RadioGroup, Text } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <RadioGroup defaultValue="y">
      <Flex gap="4">
        <Flex gap="2" align="center">
          <Radio size={size} value="y" id="g-y" />
          <Text size="2" render={<label htmlFor="g-y" />}>Yes</Text>
        </Flex>
        <Flex gap="2" align="center">
          <Radio size={size} value="n" id="g-n" />
          <Text size="2" render={<label htmlFor="g-n" />}>No</Text>
        </Flex>
      </Flex>
    </RadioGroup>
  );
}
