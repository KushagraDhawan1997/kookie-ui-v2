"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Card, Flex, Stack, Text, iconStroke } from "@kookie-ui/react";

export default function Example() {
  const [count, setCount] = React.useState(0);

  return (
    <Card render={<button type="button" onClick={() => setCount((n) => n + 1)} />} style={{ maxWidth: "24rem" }}>
      <Flex gap="3" align="center">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={iconStroke} aria-hidden />
        <Stack gap="1">
          <Text size="3" weight="medium">
            New blank project
          </Text>
          <Text size="2" emphasis="medium">
            {count === 0 ? "Start from an empty canvas." : `${count} created this session.`}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}
