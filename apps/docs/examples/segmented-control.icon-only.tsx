import { HugeiconsIcon } from "@hugeicons/react";
import { GridViewIcon, ListViewIcon } from "@hugeicons/core-free-icons";
import { SegmentedControl, SegmentedItem, iconStroke } from "@kushagradhawan/kookie-ui-react";

// A segment with only an icon needs `aria-label`, so a screen reader can name the option.
export default function Example() {
  return (
    <SegmentedControl defaultValue="grid" aria-label="Layout">
      <SegmentedItem value="list" aria-label="List">
        <HugeiconsIcon icon={ListViewIcon} strokeWidth={iconStroke} aria-hidden />
      </SegmentedItem>
      <SegmentedItem value="grid" aria-label="Grid">
        <HugeiconsIcon icon={GridViewIcon} strokeWidth={iconStroke} aria-hidden />
      </SegmentedItem>
    </SegmentedControl>
  );
}
