import { Flex, Stack, Text } from "@kookie-ui/react";

const steps = ["2", "4", "6"] as const;

export default function Example() {
  return (
    <Flex gap="7" wrap="wrap">
      {steps.map((gap) => (
        <Stack key={gap} gap={gap}>
          <Text size="2" weight="medium">
            Gap {gap}
          </Text>
          <Text size="2">Invoices</Text>
          <Text size="2">Payment methods</Text>
          <Text size="2">Tax details</Text>
        </Stack>
      ))}
    </Flex>
  );
}
