import { Chip, Flex } from "@kookie-ui/react";
import type { Emphasis, TypeSize, Weight } from "@kookie-ui/react";

export default function Example({
  size = "2",
  weight = "regular",
  emphasis = "loud",
  backdrop = false,
}: {
  size?: TypeSize;
  weight?: Weight;
  emphasis?: Emphasis;
  backdrop?: boolean;
}) {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop}>Queued</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="success">Live</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="warning">Cancelled</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="destructive">Failed</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} backdrop={backdrop} tone="info">Preview</Chip>
    </Flex>
  );
}
