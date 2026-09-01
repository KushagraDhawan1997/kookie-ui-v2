import { Heading, Stack } from "@kookie-ui/react";
import type { Tone, Weight } from "@kookie-ui/react";

export default function Example({
  weight = "semibold",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="2">
      <Heading size="7" weight={weight} tone={tone} render={<h3 />}>A section</Heading>
      <Heading size="4" weight={weight} tone={tone} render={<h4 />}>A subsection</Heading>
    </Stack>
  );
}
