import { Chip, Flex } from "@kookie-ui/react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {SIZES.map((size) => (
        <Chip key={size} size={size} tone="success">
          Deployed
        </Chip>
      ))}
    </Flex>
  );
}
