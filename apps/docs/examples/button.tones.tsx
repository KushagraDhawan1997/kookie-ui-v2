import { Button, Flex, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="4">
      <Flex gap="3" wrap="wrap">
        <Button tone="accent" emphasis="loud">
          Upgrade plan
        </Button>
        <Button tone="accent">Compare plans</Button>
        <Button tone="accent" emphasis="quiet">
          View pricing
        </Button>
      </Flex>
      <Flex gap="3" wrap="wrap">
        <Button tone="destructive">Delete project</Button>
        <Button tone="destructive" emphasis="quiet">
          Remove member
        </Button>
        <Button tone="success">Approve invoice</Button>
      </Flex>
    </Stack>
  );
}
