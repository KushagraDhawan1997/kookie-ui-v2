import { SegmentedControl, SegmentedItem } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SegmentedControl defaultValue="grid" aria-label="Layout">
      <SegmentedItem value="grid">Grid</SegmentedItem>
      <SegmentedItem value="list">List</SegmentedItem>
    </SegmentedControl>
  );
}
