"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Attachment01Icon,
  FileImageIcon,
  FileVideoIcon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";
import {
  Attachment,
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  iconStroke,
  type Size,
} from "@kookie-ui/react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Before sending: the tiles sit in a strip above the text, each with a remove. The list is
// the app's, so removing one is filtering your own array.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  const [files, setFiles] = React.useState([
    { name: "brief.pdf", meta: "1.2 MB", glyph: Pdf01Icon },
    { name: "hero-final.png", meta: "3.8 MB", glyph: FileImageIcon },
    { name: "walkthrough.mp4", meta: "42% of 18 MB", glyph: FileVideoIcon, progress: 0.42 },
  ]);

  return (
    <Composer size={size} backdrop={backdrop} onSubmit={() => setFiles([])} onFiles={() => {}}>
      <Flex gap="2" wrap="wrap">
        {files.map((file) => (
          <Attachment
            key={file.name}
            size={size}
            state={file.progress === undefined ? "idle" : "uploading"}
            {...(file.progress === undefined ? {} : { progress: file.progress })}
            icon={icon(file.glyph)}
            meta={file.meta}
            onRemove={() => setFiles((rest) => rest.filter((f) => f !== file))}
          >
            {file.name}
          </Attachment>
        ))}
      </Flex>
      <ComposerInput aria-label="Message" placeholder="Add a note for the reviewer…" />
      <ComposerRow>
        <Button iconOnly aria-label="Add attachment">
          {icon(Attachment01Icon)}
        </Button>
        <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
