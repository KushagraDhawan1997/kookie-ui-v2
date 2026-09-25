import { Flex, Surface, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap" align="flex-start">
      {sizes.map((size) => (
        <Surface key={size} size={size}>
          <Text size="2">Size {size}</Text>
        </Surface>
      ))}
    </Flex>
  );
}
