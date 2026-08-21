import { Slider, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5">
      <Slider defaultValue={40} aria-label="Value" />
      <Slider defaultValue={[20, 65]} aria-label="Range" />
    </Stack>
  );
}
