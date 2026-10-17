import { SegmentedControl, SegmentedItem } from "@kushagradhawan/kookie-ui-react";

// Nothing names the setting the control changes.
export default function App() {
  return (
    <SegmentedControl defaultValue="list">
      <SegmentedItem value="list">List</SegmentedItem>
      <SegmentedItem value="grid">Grid</SegmentedItem>
    </SegmentedControl>
  );
}
