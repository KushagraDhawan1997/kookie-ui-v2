"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Confirmation,
  iconStroke,
} from "@kookie-ui/react";

// A Confirmation asks a question and waits for the answer. Focus does not
// move to it, because the person may be in the middle of a sentence.
export default function Example() {
  const [asking, setAsking] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  return (
    <Composer
      notices={
        asking ? (
          <Confirmation
            confirmLabel="Run"
            cancelLabel="Not now"
            busy={busy}
            onConfirm={() => {
              setBusy(true);
              window.setTimeout(() => {
                setBusy(false);
                setAsking(false);
              }, 1200);
            }}
            onCancel={() => setAsking(false)}
          >
            Run the migration on 4 databases?
          </Confirmation>
        ) : null
      }
    >
      <ComposerInput aria-label="Message" placeholder="Ask about the migration…" />
      <ComposerRow>
        <span />
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
