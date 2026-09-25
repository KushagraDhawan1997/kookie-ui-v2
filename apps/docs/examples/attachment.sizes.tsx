"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon } from "@hugeicons/core-free-icons";
import { Attachment, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

// `size` sets the whole tile: its padding, its corner, the icon, the remove button and the
// file name. At size 2 the remove button is as tall as a size 2 Button.
export default function Example() {
  return (
    <Stack gap="3" align="start">
      {sizes.map((size) => (
        <Attachment
          key={size}
          size={size}
          icon={<HugeiconsIcon icon={Pdf01Icon} strokeWidth={iconStroke} aria-hidden />}
          meta="1.2 MB"
          onRemove={() => {}}
        >
          proposal-v3.pdf
        </Attachment>
      ))}
    </Stack>
  );
}
