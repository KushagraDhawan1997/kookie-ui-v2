"use client";

import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "40rem" }}>
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Notice
          key={size}
          size={size}
          tone="warning"
          action={<Button>Update card</Button>}
          onDismiss={() => {}}
        >
          The card on file expires this month.
        </Notice>
      ))}
    </Stack>
  );
}
