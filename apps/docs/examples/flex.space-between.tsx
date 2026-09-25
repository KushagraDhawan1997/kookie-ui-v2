import { Button, Flex, Heading, Text, Stack } from "@kushagradhawan/kookie-ui-react";

// `justify="space-between"` puts the title at one edge and the actions at
// the other. A nested Flex groups the actions with their own gap.
export default function Example() {
  return (
    <Flex justify="space-between" align="center" gap="4">
      <Stack gap="1">
        <Heading size="6">Invoices</Heading>
        <Text size="2" emphasis="medium">
          12 invoices this year
        </Text>
      </Stack>
      <Flex gap="3">
        <Button emphasis="quiet" bordered>
          Export
        </Button>
        <Button emphasis="loud">New invoice</Button>
      </Flex>
    </Flex>
  );
}
