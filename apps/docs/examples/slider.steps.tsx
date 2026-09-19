import { Slider, Stack, Text } from "@kookie-ui/react";

// `min`, `max` and `step` set the values a handle can land on. `largeStep` is how far
// Page Up, Page Down and Shift with an arrow key move it.
export default function Example() {
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Text size="2" weight="medium">
        Session timeout, in minutes
      </Text>
      <Slider
        aria-label="Session timeout, in minutes"
        defaultValue={30}
        min={5}
        max={120}
        step={5}
        largeStep={30}
      />
    </Stack>
  );
}
