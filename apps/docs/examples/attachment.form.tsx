"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Csv01Icon, FileVideoIcon, Pdf01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Stack,
  iconStroke,
  type Size,
} from "@kookie-ui/react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// In a form: the files a field has taken so far, one under the other. A failed one says why
// in `meta`, because the red alone is not a message.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  return (
    <Field size={size} style={{ minWidth: "22rem" }}>
      <FieldLabel>Supporting documents</FieldLabel>
      <Stack gap="2">
        <Attachment size={size} backdrop={backdrop} icon={icon(Pdf01Icon)} meta="1.2 MB" onRemove={() => {}}>
          invoice-0421.pdf
        </Attachment>
        <Attachment
          size={size}
          backdrop={backdrop}
          state="uploading"
          progress={0.35}
          icon={icon(FileVideoIcon)}
          meta="35% of 18 MB"
          onRemove={() => {}}
        >
          site-visit.mp4
        </Attachment>
        <Attachment
          size={size}
          backdrop={backdrop}
          state="error"
          icon={icon(Csv01Icon)}
          meta="Larger than 25 MB"
          onRemove={() => {}}
        >
          ledger-export.csv
        </Attachment>
      </Stack>
      <Button>Choose files</Button>
      <FieldDescription>PDF, images or video, up to 25 MB each.</FieldDescription>
    </Field>
  );
}
