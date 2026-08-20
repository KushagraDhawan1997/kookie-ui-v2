import { Card, Stack, Surface, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Surface size="3">
      <Stack gap="3">
        <Card size="2"><Text size="2">A card on a ground</Text></Card>
        <Card size="2"><Text size="2">And another</Text></Card>
      </Stack>
    </Surface>
  );
}
