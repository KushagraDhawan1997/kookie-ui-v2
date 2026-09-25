import { Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" render={<section aria-labelledby="billing-heading" />} style={{ maxWidth: "28rem" }}>
      <Heading size="5" id="billing-heading">
        Billing
      </Heading>
      <Text size="3" render={<p />}>
        Your workspace is on the Team plan with 12 of 15 seats in use.
      </Text>
      <Text size="3" emphasis="medium" render={<p />}>
        The next invoice is due on 1 October.
      </Text>
    </Stack>
  );
}
