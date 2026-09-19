import { Blockquote, Stack, Text } from "@kookie-ui/react";

// Blockquote has no attribution slot. Put the name in a sibling Text, and use `render` to make
// the stack a `<figure>` and the name a `<figcaption>`. Pass the source address as `cite`.
export default function Example() {
  return (
    <Stack gap="3" render={<figure />} style={{ maxWidth: "32rem" }}>
      <Blockquote cite="https://example.com/customers/northwind">
        Setup took an afternoon. Our designers and engineers now review the same screens.
      </Blockquote>
      <Text size="2" emphasis="medium" render={<figcaption />}>
        Shruti Bhatia, Head of Design at Northwind
      </Text>
    </Stack>
  );
}
