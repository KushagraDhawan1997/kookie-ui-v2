import { Stack, Text } from "@kookie-ui/react";
import type { Tone, TypeSize, Weight } from "@kookie-ui/react";

export default function Example({
  size = "3",
  weight = "regular",
  tone = "neutral",
}: {
  size?: TypeSize;
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="2">
      <Text size={size} weight={weight} tone={tone}>Loud rests at full contrast.</Text>
      <Text size={size} weight={weight} tone={tone} emphasis="medium">Medium is the muted role.</Text>
      <Text size={size} weight={weight} tone={tone} emphasis="quiet">Quiet is below body-copy contrast by design.</Text>
    </Stack>
  );
}
