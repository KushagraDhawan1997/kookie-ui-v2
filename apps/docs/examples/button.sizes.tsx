import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {SIZES.map((size) => (
        <Button key={size} size={size}>
          Invite member
        </Button>
      ))}
    </Flex>
  );
}
