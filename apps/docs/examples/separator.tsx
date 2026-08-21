import { Card, Separator, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="4">
        <Text size="2" weight="medium">Above</Text>
        <Separator />
        <Text size="2" emphasis="medium">Below</Text>
      </Stack>
    </Card>
  );
}
