import { Card, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="2">
        <Text size="3" weight="medium">A card is a shell</Text>
        <Text size="2" emphasis="medium">Everything inside it is composition.</Text>
      </Stack>
    </Card>
  );
}
