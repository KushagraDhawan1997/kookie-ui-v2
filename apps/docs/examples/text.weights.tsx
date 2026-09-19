import { Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="2">
      <Text size="4" weight="regular">
        Regular: your storage is almost full
      </Text>
      <Text size="4" weight="medium">
        Medium: your storage is almost full
      </Text>
      <Text size="4" weight="semibold">
        Semibold: your storage is almost full
      </Text>
    </Stack>
  );
}
