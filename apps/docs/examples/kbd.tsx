import { Kbd, Text } from "@kookie-ui/react";
import type { Tone, Weight } from "@kookie-ui/react";

export default function Example({
  weight = "regular",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Text size="3">
      Press <Kbd weight={weight} tone={tone}>⌘K</Kbd> to search,{" "}
      <Kbd weight={weight} tone={tone}>Esc</Kbd> to dismiss.
    </Text>
  );
}
