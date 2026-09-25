import { Flex, Toggle, ToggleGroup } from "@kushagradhawan/kookie-ui-react";
import type { Size, Tone } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  tone = "neutral",
  bordered = false,
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  bordered?: boolean;
  backdrop?: boolean;
}) {
  return (
    <ToggleGroup aria-label="Format" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="bold">
        Bold
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="italic">
        Italic
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="underline">
        Underline
      </Toggle>
    </ToggleGroup>
  );
}
