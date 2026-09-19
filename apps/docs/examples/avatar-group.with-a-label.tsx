import { Avatar, AvatarGroup, Button, Flex, Text } from "@kookie-ui/react";

// A group usually sits beside words that say what it shows. At sizes 1 to 4 the faces line up
// with a Button at the same size.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <AvatarGroup>
        <Avatar src="/backdrop.jpg" fallback="SB" />
        <Avatar fallback="KD" />
        <Avatar fallback="AR" />
      </AvatarGroup>
      <Text emphasis="medium">Shruti Bhatia and 2 others can edit</Text>
      <Button emphasis="medium">Share</Button>
    </Flex>
  );
}
