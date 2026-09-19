import { Slider, Stack, Text } from "@kookie-ui/react";

// A disabled Slider keeps its value in view but does not move. The filled part turns
// grey, so the setting reads as off.
export default function Example() {
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Text size="2" weight="medium">
        Storage limit
      </Text>
      <Slider aria-label="Storage limit" defaultValue={70} disabled />
      <Text size="2" emphasis="medium">
        Only the workspace owner can change this.
      </Text>
    </Stack>
  );
}
