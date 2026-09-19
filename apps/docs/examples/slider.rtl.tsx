import { Box, Slider } from "@kookie-ui/react";

// Under `dir="rtl"` the Slider fills from the right. The right arrow key lowers the value,
// because it moves the handle toward the start.
export default function Example() {
  return (
    <Box dir="rtl" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Slider aria-label="Brightness" defaultValue={35} />
    </Box>
  );
}
