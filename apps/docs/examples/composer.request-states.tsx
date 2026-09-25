"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, ReloadIcon, StopIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  iconStroke,
  type ComposerStatus,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `status` from your request. `submitted` shows a spinner, `streaming`
// turns the button into Stop, and `error` turns it into Retry. Enter does
// not send again while a request is running.
export default function Example() {
  const [status, setStatus] = React.useState<ComposerStatus>("ready");
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Composer
      onSubmit={() => {
        setStatus("submitted");
        timer.current = window.setTimeout(() => {
          setStatus("streaming");
          timer.current = window.setTimeout(() => setStatus("error"), 2500);
        }, 1000);
      }}
    >
      <ComposerInput aria-label="Message" placeholder="Summarise last week’s support tickets…" />
      <ComposerRow>
        <Button onClick={() => setStatus("ready")}>Reset</Button>
        <ComposerSend
          status={status}
          onStop={() => {
            window.clearTimeout(timer.current);
            setStatus("ready");
          }}
          icons={{ ready: icon(ArrowUp02Icon), streaming: icon(StopIcon), error: icon(ReloadIcon) }}
        />
      </ComposerRow>
    </Composer>
  );
}
