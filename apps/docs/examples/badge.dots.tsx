import { Badge, Flex, Text } from "@kookie-ui/react";

// A badge with no content is a dot. A dot is colour alone, so give it an `aria-label` that
// says what a sighted person understands from it.
export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      <Text>
        Changelog <Badge aria-label="New entries" />
      </Text>
      <Text>
        Billing <Badge tone="destructive" aria-label="Payment failed" />
      </Text>
    </Flex>
  );
}
