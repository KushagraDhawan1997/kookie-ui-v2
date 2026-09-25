import { Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const rows = [
  ["Plan", "Team"],
  ["Seats", "12 of 15"],
  ["Next invoice", "£240.00 on 1 October"],
] as const;

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "24rem" }}>
      {rows.map(([label, value], index) => (
        <Stack key={label} gap="3">
          {index > 0 && <Separator />}
          <Flex justify="space-between" gap="4">
            <Text size="2" emphasis="medium">
              {label}
            </Text>
            <Text size="2">{value}</Text>
          </Flex>
        </Stack>
      ))}
    </Stack>
  );
}
