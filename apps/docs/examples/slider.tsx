import { Slider, Stack } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="5">
      <Slider size={size} defaultValue={40} aria-label="Value" />
      <Slider size={size} defaultValue={[20, 65]} aria-label="Range" />
    </Stack>
  );
}
