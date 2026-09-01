"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  Surface,
  Text,
  iconStroke,
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the system
// draws its own chevrons at, so your set matches them. No size: the row sizes the slot's svg.
const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <ContextMenu size={size}>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click anywhere in here
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {/* The glyph is the `leading` slot's, never part of the label — the row reserves one
            gutter and every set of words starts on the same line. */}
        <MenuItem leading={icon(Copy01Icon)}>Duplicate</MenuItem>
        <MenuItem leading={icon(PencilEdit02Icon)}>Rename</MenuItem>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete
        </MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
