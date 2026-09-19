import { Button, Flex } from "@kookie-ui/react";

// Inside a control, the Spinner takes the icon size for that control's size. Swap an icon
// for a Spinner and nothing moves.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button size="1" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="2" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="3" emphasis="medium" loading>
        Syncing
      </Button>
      <Button size="4" emphasis="medium" loading>
        Syncing
      </Button>
    </Flex>
  );
}
