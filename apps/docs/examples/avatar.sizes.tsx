import { Avatar, Flex } from "@kookie-ui/react";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

// Sizes 1 to 4 match the control heights. Sizes 5 to 9 are larger, for a face that stands
// alone, such as on a profile page.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Avatar key={size} size={size} fallback="SB" />
      ))}
    </Flex>
  );
}
