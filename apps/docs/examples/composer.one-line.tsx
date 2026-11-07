"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, PlusSignIcon, ReloadIcon, StopIcon } from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Composer,
  ComposerInput,
  ComposerSend,
  iconStroke,
  type ComposerStatus,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof ArrowUp02Icon) => <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />;

// No `ComposerRow`, so the controls share the text's line: add, the text, send. A phone's width.
export default function Example() {
  const [status, setStatus] = React.useState<ComposerStatus>("ready");
  const [value, setValue] = React.useState("");
  return (
    <Box style={{ inlineSize: "24rem", maxInlineSize: "100%" }}>
      <Composer
        onSubmit={() => {
          setStatus("streaming");
          setValue("");
        }}
      >
        <Button iconOnly emphasis="medium" aria-label="Add attachment">
          {icon(PlusSignIcon)}
        </Button>
        <ComposerInput
          aria-label="Message"
          placeholder="Message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <ComposerSend
          status={status}
          onStop={() => setStatus("ready")}
          icons={{ ready: icon(ArrowUp02Icon), streaming: icon(StopIcon), error: icon(ReloadIcon) }}
        />
      </Composer>
    </Box>
  );
}
