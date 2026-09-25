import { Flex, Toggle } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="2" wrap="wrap">
      <Toggle defaultPressed>Neutral</Toggle>
      <Toggle tone="accent" defaultPressed>
        Follow project
      </Toggle>
      <Toggle tone="destructive" defaultPressed>
        Block sign-ins
      </Toggle>
      <Toggle tone="destructive">Block sign-ins</Toggle>
    </Flex>
  );
}
