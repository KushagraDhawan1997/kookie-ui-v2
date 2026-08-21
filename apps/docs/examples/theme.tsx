import { Button, Flex, Theme } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap" align="center">
      <Theme radius="full">
        <Button tone="accent" emphasis="loud">radius full</Button>
      </Theme>
      <Theme radius="none">
        <Button tone="accent" emphasis="loud">radius none</Button>
      </Theme>
      <Theme density="compact">
        <Button emphasis="medium">compact</Button>
      </Theme>
      <Theme density="comfortable">
        <Button emphasis="medium">comfortable</Button>
      </Theme>
    </Flex>
  );
}
