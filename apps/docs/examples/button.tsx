import { Button, Flex } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap" align="center">
      <Button tone="accent" emphasis="loud">Save</Button>
      <Button emphasis="medium">Cancel</Button>
      <Button emphasis="quiet" bordered>More</Button>
      <Button tone="destructive" emphasis="quiet">Delete</Button>
    </Flex>
  );
}
