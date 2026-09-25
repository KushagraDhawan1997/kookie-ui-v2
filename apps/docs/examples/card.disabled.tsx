import { Card, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap">
      <Card render={<button type="button" />}>
        <Stack gap="1">
          <Text size="3" weight="medium">
            Import from CSV
          </Text>
          <Text size="2" emphasis="medium">
            Upload a spreadsheet of contacts.
          </Text>
        </Stack>
      </Card>
      <Card render={<button type="button" disabled />}>
        <Stack gap="1">
          <Text size="3" weight="medium">
            Import from Salesforce
          </Text>
          <Text size="2" emphasis="medium">
            Available on the Team plan.
          </Text>
        </Stack>
      </Card>
    </Flex>
  );
}
