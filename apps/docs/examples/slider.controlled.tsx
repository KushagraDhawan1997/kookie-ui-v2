"use client";

import * as React from "react";
import { Flex, Slider, Stack, Text } from "@kookie-ui/react";

// Hold the value in your own state to show it or use it elsewhere. `onValueChange` fires
// while you drag. `onValueCommitted` fires once, when you let go.
export default function Example() {
  const [volume, setVolume] = React.useState(60);
  const [saved, setSaved] = React.useState(60);
  return (
    <Stack gap="3" style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <Flex justify="space-between">
        <Text size="2" weight="medium">
          Notification volume
        </Text>
        <Text size="2" emphasis="medium">
          {volume}%
        </Text>
      </Flex>
      <Slider
        aria-label="Notification volume"
        value={volume}
        onValueChange={(value) => setVolume(value as number)}
        onValueCommitted={(value) => setSaved(value as number)}
      />
      <Text size="2" emphasis="medium">
        Saved at {saved}%.
      </Text>
    </Stack>
  );
}
