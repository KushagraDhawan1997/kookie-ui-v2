import { Link, Text } from "@kookie-ui/react";
import type { Tone, Weight } from "@kookie-ui/react";

export default function Example({
  weight = "regular",
  tone = "accent",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Text size="3" render={<p />} style={{ maxWidth: "28rem" }}>
      You are using 42 of 100 gigabytes. See{" "}
      <Link href="#plans" weight={weight} tone={tone}>the plans on this workspace</Link> before
      the renewal.
    </Text>
  );
}
