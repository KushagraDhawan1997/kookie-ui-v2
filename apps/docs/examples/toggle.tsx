import { Flex, Toggle, ToggleGroup } from "@kookie-ui/react";
import type { Size, Tone } from "@kookie-ui/react";

export default function Example({
  size = "2",
  tone = "neutral",
  bordered = false,
}: {
  size?: Size;
  tone?: Tone;
  bordered?: boolean;
}) {
  return (
    <ToggleGroup aria-label="Format" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Toggle size={size} tone={tone} bordered={bordered} value="bold">
        Bold
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} value="italic">
        Italic
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} value="underline">
        Underline
      </Toggle>
    </ToggleGroup>
  );
}
