"use client";

import { Button, Notice, Stack, Text } from "@kookie-ui/react";
import type { Size, Tone } from "@kookie-ui/react";

export default function Example({
  size = "2",
  tone = "neutral",
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  backdrop?: boolean;
}) {
  return (
    <Stack gap="3">
      <Notice
        size={size}
        tone={tone}
        backdrop={backdrop}
        action={<Button size="2">Get more usage</Button>}
        onDismiss={() => {}}
      >
        <Text size="2">Approaching weekly usage limit</Text>
      </Notice>
      <Notice size={size} tone="warning" action={<Button size="2">Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
    </Stack>
  );
}
