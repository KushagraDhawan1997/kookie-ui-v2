"use client";

import { Button, Notice, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3">
      <Notice action={<Button size="2">Get more usage</Button>} onDismiss={() => {}}>
        <Text size="2">Approaching weekly usage limit</Text>
      </Notice>
      <Notice tone="warning" action={<Button size="2">Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
    </Stack>
  );
}
