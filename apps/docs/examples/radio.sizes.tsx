import { Flex, Radio, RadioGroup, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <RadioGroup defaultValue="2" aria-label="Radio sizes">
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Flex key={size} gap="3" align="center">
          <Radio size={size} value={size} id={`radio-size-${size}`} />
          <Text size={size} render={<label htmlFor={`radio-size-${size}`} />}>
            Size {size}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
