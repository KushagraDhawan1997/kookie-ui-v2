import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { SegmentedControl, SegmentedItem, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Sun03Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A segment can hold an icon beside its label. The icon takes the size set for the
// control, so every segment keeps the same height.
export default function Example() {
  return (
    <SegmentedControl defaultValue="system" aria-label="Appearance">
      <SegmentedItem value="light">
        {icon(Sun03Icon)}
        Light
      </SegmentedItem>
      <SegmentedItem value="dark">
        {icon(Moon02Icon)}
        Dark
      </SegmentedItem>
      <SegmentedItem value="system">
        {icon(ComputerIcon)}
        System
      </SegmentedItem>
    </SegmentedControl>
  );
}
