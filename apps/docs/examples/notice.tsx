"use client";

import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";
import type { Size, Tone } from "@kushagradhawan/kookie-ui-react";

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
        action={<Button>Get more usage</Button>}
        onDismiss={() => {}}
      >
        Approaching weekly usage limit
      </Notice>
      <Notice size={size} tone="warning" backdrop={backdrop} action={<Button>Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
    </Stack>
  );
}
