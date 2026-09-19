import { Card, Flex, Separator, Stack, Text } from "@kookie-ui/react";

const ROWS = [
  { label: "Plan", value: "Team" },
  { label: "Seats", value: "8 of 10" },
  { label: "Next invoice", value: "1 October" },
];

// Separators between rows in a card. Each line takes the full width of the Stack it
// sits in, so you never give it a length.
export default function Example() {
  return (
    <Card style={{ minWidth: "20rem" }}>
      <Stack gap="3">
        {ROWS.map((row, i) => (
          <Stack key={row.label} gap="3">
            {i > 0 && <Separator />}
            <Flex justify="space-between">
              <Text size="2" emphasis="medium">
                {row.label}
              </Text>
              <Text size="2">{row.value}</Text>
            </Flex>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
