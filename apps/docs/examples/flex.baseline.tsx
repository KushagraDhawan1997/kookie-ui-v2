import { Flex, Heading, Text } from "@kookie-ui/react";

// `align="baseline"` lines up the first line of text in each item, even
// when the items use different type sizes.
export default function Example() {
  return (
    <Flex align="baseline" gap="3">
      <Heading size="7">$1,284</Heading>
      <Text emphasis="medium">revenue this week</Text>
      <Text size="2" tone="success">
        +12%
      </Text>
    </Flex>
  );
}
