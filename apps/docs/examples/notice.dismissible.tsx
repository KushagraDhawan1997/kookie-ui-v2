"use client";

import * as React from "react";
import { Button, Notice, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  // The dismissal is your state. Store it wherever it must survive: here, for the session.
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      {dismissed ? (
        <Button emphasis="quiet" bordered onClick={() => setDismissed(false)}>
          Show the notice again
        </Button>
      ) : (
        <Notice
          tone="info"
          action={<Button>Review changes</Button>}
          onDismiss={() => setDismissed(true)}
          dismissLabel="Hide this notice"
        >
          The team plan now includes audit logs.
        </Notice>
      )}
      <Text size="2" emphasis="medium">
        Audit logs keep 90 days of history for every project in the workspace.
      </Text>
    </Stack>
  );
}
