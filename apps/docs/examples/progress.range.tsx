"use client";

import { Flex, Progress, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Flex justify="space-between" gap="3">
        <Text size="2" id="storage-label">Storage</Text>
        <Text size="2" emphasis="medium">7.2 of 10 GB</Text>
      </Flex>
      <Progress
        value={7.2}
        min={0}
        max={10}
        aria-labelledby="storage-label"
        getAriaValueText={(_, value) => `${value ?? 0} of 10 gigabytes used`}
      />
    </Stack>
  );
}
