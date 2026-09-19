import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon } from "@hugeicons/core-free-icons";
import { Button, Flex, SegmentedControl, SegmentedItem, TextField, iconStroke } from "@kookie-ui/react";

// At the same size, a SegmentedControl is as tall as the Button and TextField beside it.
// A row of mixed controls lines up with no extra work.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <TextField aria-label="Search files" placeholder="Search files" />
      <SegmentedControl defaultValue="all" aria-label="Owner">
        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="mine">Mine</SegmentedItem>
        <SegmentedItem value="shared">Shared</SegmentedItem>
      </SegmentedControl>
      <Button
        emphasis="medium"
        leading={<HugeiconsIcon icon={FilterIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Filters
      </Button>
    </Flex>
  );
}
