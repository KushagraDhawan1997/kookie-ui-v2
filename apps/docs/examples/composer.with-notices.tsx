"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Notice,
  iconStroke,
} from "@kookie-ui/react";

// `notices` holds messages that need attention before the next message.
// They sit in a column above the composer, outside the form, so their
// buttons never send the message.
export default function Example() {
  const [showLimit, setShowLimit] = React.useState(true);

  return (
    <Composer
      notices={
        showLimit ? (
          <Notice
            tone="warning"
            action={<Button>Upgrade plan</Button>}
            onDismiss={() => setShowLimit(false)}
          >
            You have used 90% of this month’s messages.
          </Notice>
        ) : null
      }
    >
      <ComposerInput aria-label="Message" placeholder="Reply to the thread…" />
      <ComposerRow>
        <Button>Opus 5</Button>
        <ComposerSend icons={{ ready: <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={iconStroke} aria-hidden /> }} />
      </ComposerRow>
    </Composer>
  );
}
