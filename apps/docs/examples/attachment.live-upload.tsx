"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileZipIcon } from "@hugeicons/core-free-icons";
import { Attachment, Button, Stack, iconStroke, type AttachmentState } from "@kushagradhawan/kookie-ui-react";

// The tile keeps no timer and holds no file. Your upload code updates `state` and `progress`,
// and the tile draws what you give it. A timer stands in for the upload here.
export default function Example() {
  const [state, setState] = React.useState<AttachmentState>("idle");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (state === "uploading") {
      if (progress >= 1) {
        setState("processing");
        return;
      }
      const id = setTimeout(() => setProgress((p) => Math.min(1, p + 0.1)), 250);
      return () => clearTimeout(id);
    }
    if (state === "processing") {
      const id = setTimeout(() => setState("idle"), 1500);
      return () => clearTimeout(id);
    }
  }, [state, progress]);

  const meta =
    state === "uploading"
      ? `${Math.round(progress * 100)}% of 18 MB`
      : state === "processing"
        ? "Checking the archive"
        : "18 MB";

  return (
    <Stack gap="3" align="start" style={{ minWidth: "20rem" }}>
      <Attachment
        state={state}
        progress={progress}
        icon={<HugeiconsIcon icon={FileZipIcon} strokeWidth={iconStroke} aria-hidden />}
        meta={meta}
      >
        design-assets.zip
      </Attachment>
      <Button
        emphasis="medium"
        disabled={state !== "idle"}
        onClick={() => {
          setProgress(0);
          setState("uploading");
        }}
      >
        Upload again
      </Button>
    </Stack>
  );
}
