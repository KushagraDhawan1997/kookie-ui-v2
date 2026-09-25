import { Flex, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Flex justify="space-between" gap="3">
        <Text size="2" id="export-label">Exporting invoices</Text>
        <Text size="2" emphasis="medium">64%</Text>
      </Flex>
      <Progress value={64} aria-labelledby="export-label" />
    </Stack>
  );
}
