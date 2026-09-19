import { Flex, Spinner, Text } from "@kookie-ui/react";

// A Spinner is hidden from screen readers, so the words beside it carry the state.
// `role="status"` makes a screen reader announce those words when they appear.
export default function Example() {
  return (
    <Flex role="status" gap="2" align="center">
      <Spinner />
      <Text size="2" emphasis="medium">
        Saving your changes…
      </Text>
    </Flex>
  );
}
