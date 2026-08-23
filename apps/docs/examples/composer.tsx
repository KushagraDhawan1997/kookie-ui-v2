"use client";

import * as React from "react";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  type ComposerStatus,
} from "@kookie-ui/react";

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
          <Button iconOnly aria-label="Add attachment">
            +
          </Button>
          <Button>Opus 5</Button>
        </Flex>
        <ComposerSend
          status={status}
          onStop={() => setStatus("ready")}
          icons={{ ready: "↑", streaming: "■", error: "✕" }}
        />
      </ComposerRow>
    </Composer>
  );
}
