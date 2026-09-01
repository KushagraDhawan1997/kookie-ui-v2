import { Blockquote, Stack, Text } from "@kookie-ui/react";
import type { Emphasis, Tone, TypeSize } from "@kookie-ui/react";

export default function Example({
  size = "3",
  emphasis = "loud",
  tone = "neutral",
}: {
  size?: TypeSize;
  emphasis?: Emphasis;
  tone?: Tone;
}) {
  return (
    <Stack gap="3">
      <Blockquote size={size} emphasis={emphasis} tone={tone}>
        Taste is the last layer. If the infrastructure is right, taste can be added later.
      </Blockquote>
      <Text size="1" emphasis="medium">— the standing rule</Text>
    </Stack>
  );
}
