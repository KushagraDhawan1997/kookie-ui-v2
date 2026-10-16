"use client";

import * as React from "react";
import { Button, Notice } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  // The dismissal is your state. Store it wherever it must survive.
  const [trialNoticeSeen, setTrialNoticeSeen] = React.useState(false);

  if (trialNoticeSeen) {
    return (
      <Button emphasis="quiet" bordered onClick={() => setTrialNoticeSeen(false)}>
        Show the notice again
      </Button>
    );
  }

  return (
    <Notice
      tone="warning"
      action={<Button>Add a card</Button>}
      onDismiss={() => setTrialNoticeSeen(true)}
    >
      Your trial ends in three days.
    </Notice>
  );
}
