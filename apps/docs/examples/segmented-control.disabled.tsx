import { SegmentedControl, SegmentedItem, Stack } from "@kushagradhawan/kookie-ui-react";

// Set `disabled` on one SegmentedItem to block that option. Set it on the SegmentedControl
// to block the whole control.
export default function Example() {
  return (
    <Stack gap="4" align="start">
      <SegmentedControl defaultValue="week" aria-label="Report range">
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="year" disabled>
          Year
        </SegmentedItem>
      </SegmentedControl>
      <SegmentedControl defaultValue="week" aria-label="Report range, locked" disabled>
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="year">Year</SegmentedItem>
      </SegmentedControl>
    </Stack>
  );
}
