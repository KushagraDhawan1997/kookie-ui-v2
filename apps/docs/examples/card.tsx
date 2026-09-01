import { Card, Stack, Text, type Size } from "@kookie-ui/react";

export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <Card size={size} backdrop={backdrop} style={{ maxWidth: "24rem" }}>
      <Stack gap="2">
        <Text size="3" weight="medium">
          Paper above the page
        </Text>
        <Text size="2" emphasis="medium">
          One fixed treatment: a sealed fill, a hairline and a corner. No tone, no emphasis, no
          anatomy — what a card holds is the caller&apos;s.
        </Text>
      </Stack>
    </Card>
  );
}
