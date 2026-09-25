import { Badge, Flex, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["2", "3", "5", "7"] as const;

// A badge without a `size` takes a share of the line it sits in, so it grows with the text
// around it. Set `size` only when the badge stands alone.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Text key={size} size={size}>
          Inbox <Badge>3</Badge>
        </Text>
      ))}
    </Flex>
  );
}
