import { Slider, Stack } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    /* A slider takes its container's width — it has no width of its own, so it needs a
       container that has one. `flexGrow` says so for the case where this lands in a flex ROW
       (the docs' own figure is one) and is inert everywhere else, which is what a page is: a
       Stack in normal flow already fills the column it sits in. */
    <Stack gap="5" style={{ flexGrow: 1 }}>
      <Slider size={size} defaultValue={40} aria-label="Value" />
      <Slider size={size} defaultValue={[20, 65]} aria-label="Range" />
    </Stack>
  );
}
