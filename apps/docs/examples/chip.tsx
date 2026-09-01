import { Chip, Flex } from "@kookie-ui/react";
import type { Emphasis, TypeSize, Weight } from "@kookie-ui/react";

export default function Example({
  size = "2",
  weight = "regular",
  emphasis = "loud",
}: {
  size?: TypeSize;
  weight?: Weight;
  emphasis?: Emphasis;
}) {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Chip size={size} weight={weight} emphasis={emphasis}>Queued</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} tone="success">Live</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} tone="warning">Cancelled</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} tone="destructive">Failed</Chip>
      <Chip size={size} weight={weight} emphasis={emphasis} tone="info">Preview</Chip>
    </Flex>
  );
}
