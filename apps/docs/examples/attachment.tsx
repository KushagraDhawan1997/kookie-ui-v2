"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  iconStroke,
  type AttachmentState,
  type Size,
} from "@kookie-ui/react";

// The state is yours to set from what your upload already knows. `progress` is read only
// while uploading; the other states ignore it, so it can stay written.
export default function Example({
  size = "2",
  state = "idle",
  backdrop = false,
}: {
  size?: Size;
  state?: AttachmentState;
  backdrop?: boolean;
}) {
  return (
    <Attachment
      size={size}
      state={state}
      backdrop={backdrop}
      progress={0.62}
      icon={<HugeiconsIcon icon={File01Icon} strokeWidth={iconStroke} />}
      meta="2.4 MB"
      onRemove={() => {}}
    >
      quarterly-report.pdf
    </Attachment>
  );
}
