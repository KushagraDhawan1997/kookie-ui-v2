import { SegmentedControl, SegmentedItem } from "@kookie-ui/react";

export default function Example() {
  return (
    <SegmentedControl defaultValue="grid" aria-label="View">
      <SegmentedItem value="list">List</SegmentedItem>
      <SegmentedItem value="grid">Grid</SegmentedItem>
    </SegmentedControl>
  );
}
