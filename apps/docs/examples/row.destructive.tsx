"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CopyPlusIcon, Delete02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { Row, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof CopyPlusIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    /* Space, not a line, sets the destructive row apart: these rows light on hover, and a list
       that lights its rows draws no lines between them (RULES.md 28). */
    <Stack gap="4" style={{ minWidth: "18rem" }}>
      <Stack gap="1">
        <Row leading={icon(Share08Icon)} onClick={() => {}}>
          Share project
        </Row>
        <Row leading={icon(CopyPlusIcon)} onClick={() => {}}>
          Duplicate project
        </Row>
      </Stack>
      <Row leading={icon(Delete02Icon)} tone="destructive" onClick={() => {}}>
        Delete project
      </Row>
    </Stack>
  );
}
