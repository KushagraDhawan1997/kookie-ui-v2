import { Card, ScrollArea, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <ScrollArea style={{ height: "160px" }}>
        <Stack gap="4">
          {Array.from({ length: 12 }, (_, i) => (
            <Text key={i} size="2" emphasis="medium">Row {i + 1} of a list taller than its box.</Text>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
