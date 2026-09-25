import { Flex, Switch, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Flex key={size} gap="3" align="center">
          <Switch size={size} defaultChecked id={`switch-size-${size}`} />
          <Text size="2" render={<label htmlFor={`switch-size-${size}`} />}>
            Size {size}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
