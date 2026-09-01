import { SegmentedControl, SegmentedItem } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <SegmentedControl size={size} backdrop={backdrop} defaultValue="grid" aria-label="View">
      <SegmentedItem value="list">List</SegmentedItem>
      <SegmentedItem value="grid">Grid</SegmentedItem>
    </SegmentedControl>
  );
}
