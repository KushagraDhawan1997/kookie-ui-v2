import { Button, Flex } from "@kookie-ui/react";

export default function Actions() {
  return (
    <Flex gap="3" justify="flex-end">
      <Button emphasis="quiet" bordered>
        Cancel
      </Button>
      <Button tone="accent" emphasis="loud">
        Publish
      </Button>
    </Flex>
  );
}
