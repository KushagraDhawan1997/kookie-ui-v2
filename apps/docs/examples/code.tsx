import { Code, Stack, Text } from "@kookie-ui/react";
import type { Tone, Weight } from "@kookie-ui/react";

export default function Example({
  weight = "regular",
  tone = "neutral",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Stack gap="3">
      <Text size="3">
        Run <Code weight={weight} tone={tone}>pnpm run ci</Code> before claiming a task done.
      </Text>
      <Text size="1">
        The flag is <Code weight={weight} tone={tone}>--experimental-strip-types</Code>.
      </Text>
    </Stack>
  );
}
