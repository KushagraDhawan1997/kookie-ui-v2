import { Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="2">
      <Text size="3">Loud rests at full contrast.</Text>
      <Text size="3" emphasis="medium">Medium is the muted role.</Text>
      <Text size="3" emphasis="quiet">Quiet is below body-copy contrast by design.</Text>
    </Stack>
  );
}
