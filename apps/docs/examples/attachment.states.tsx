"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FileZipIcon, Image01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import { Attachment, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `state` from what your upload already knows. `uploading` with a `progress` fills the
// ring. Without a `progress`, the ring sweeps. `processing` means the server is working on
// the file and reports no fraction. An `error` tile says why in `meta`.
export default function Example() {
  return (
    <Stack gap="2" style={{ minWidth: "20rem" }}>
      <Attachment icon={icon(Pdf01Icon)} meta="1.2 MB" onRemove={() => {}}>
        contract-signed.pdf
      </Attachment>
      <Attachment state="uploading" progress={0.62} icon={icon(Image01Icon)} meta="62% of 4.1 MB" onRemove={() => {}}>
        office-floorplan.png
      </Attachment>
      <Attachment state="uploading" icon={icon(Image01Icon)} meta="Uploading" onRemove={() => {}}>
        team-photo.jpg
      </Attachment>
      <Attachment state="processing" icon={icon(FileZipIcon)} meta="Scanning for viruses" onRemove={() => {}}>
        assets-export.zip
      </Attachment>
      <Attachment state="error" icon={icon(Pdf01Icon)} meta="Larger than 25 MB" onRemove={() => {}}>
        annual-report.pdf
      </Attachment>
    </Stack>
  );
}
