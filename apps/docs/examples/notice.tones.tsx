"use client";

import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      <Notice>Billing moves to the first of the month from next cycle.</Notice>
      <Notice tone="info">A new version of the API is available for this project.</Notice>
      <Notice tone="success">All 14 checks passed on the last deployment.</Notice>
      <Notice tone="warning" action={<Button>Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
      <Notice tone="destructive" action={<Button>Try again</Button>}>
        The last sync failed because the token was revoked.
      </Notice>
    </Stack>
  );
}
