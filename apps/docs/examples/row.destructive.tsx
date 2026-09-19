"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { Row, Separator, Stack, iconStroke } from "@kookie-ui/react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "18rem" }}>
      <Row leading={icon(Share08Icon)} onClick={() => {}}>
        Share project
      </Row>
      <Row leading={icon(Copy01Icon)} onClick={() => {}}>
        Duplicate project
      </Row>
      <Separator />
      <Row leading={icon(Delete02Icon)} tone="destructive" onClick={() => {}}>
        Delete project
      </Row>
    </Stack>
  );
}
