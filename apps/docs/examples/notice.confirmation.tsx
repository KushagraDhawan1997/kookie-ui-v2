"use client";

import * as React from "react";
import { Button, Confirmation, Stack, Text } from "@kookie-ui/react";

type Step = "asking" | "busy" | "done";

export default function Example() {
  const [step, setStep] = React.useState<Step>("asking");

  const run = () => {
    setStep("busy");
    window.setTimeout(() => setStep("done"), 1200);
  };

  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      {step === "done" ? (
        <Stack gap="3" align="start">
          <Text size="2" emphasis="medium">The backfill is running on 4 nodes.</Text>
          <Button emphasis="quiet" bordered onClick={() => setStep("asking")}>
            Start over
          </Button>
        </Stack>
      ) : (
        <Confirmation
          confirmLabel="Run"
          cancelLabel="Not now"
          busy={step === "busy"}
          onConfirm={run}
          onCancel={() => setStep("done")}
        >
          Run the backfill on 4 nodes for $0.32?
        </Confirmation>
      )}
    </Stack>
  );
}
