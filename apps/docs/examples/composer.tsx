"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Attachment01Icon,
  Mic01Icon,
  ReloadIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  type ComposerStatus,
} from "@kookie-ui/react";

// The package ships no icon set, so the glyphs are yours. These are Hugeicons at stroke 1.5,
// with no size: the control sizes the slot's svg for you.
const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={1.5} aria-hidden />
);

export default function Example() {
  const [status, setStatus] = React.useState<ComposerStatus>("ready");
  const [value, setValue] = React.useState("");

  return (
    <Composer
      onSubmit={() => {
        // The app decides what sending means. The composer only says a person asked for it.
        setStatus("streaming");
        setValue("");
      }}
      onFiles={() => {}}
    >
      <ComposerInput
        aria-label="Message"
        placeholder="Reply to the thread…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <ComposerRow>
        <Flex gap="2">
          {/* The attach button is yours, because the files are. Drops and pastes still reach
              the composer's own onFiles. */}
          <Button iconOnly aria-label="Add attachment">
            {icon(Attachment01Icon)}
          </Button>
          <Button>Opus 5</Button>
        </Flex>
        <Flex gap="2">
          <Button iconOnly aria-label="Dictate">{icon(Mic01Icon)}</Button>
          <ComposerSend
            status={status}
            onStop={() => setStatus("ready")}
            // One button, four meanings — so the drawing follows the meaning. `submitted`
            // states none: the button's own spinner is what in-flight looks like.
            icons={{
              ready: icon(ArrowUp02Icon),
              streaming: icon(StopIcon),
              error: icon(ReloadIcon),
            }}
          />
        </Flex>
      </ComposerRow>
    </Composer>
  );
}
