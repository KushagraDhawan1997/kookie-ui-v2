"use client";

import * as React from "react";
import {
  Button,
  Flex,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Hold `open` in your own state to open the sheet from anywhere, with no SheetTrigger.
// `onOpenChange` tells you when a person closes it with Escape, a swipe or a press outside.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <Stack gap="3" align="start">
      <Text size="2" emphasis="medium">
        Your trial ends in 3 days.
      </Text>
      <Button emphasis="medium" onClick={() => setOpen(true)}>
        Compare plans
      </Button>
      <Sheet side="inline-end" open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Stack gap="6">
            <Stack gap="2">
              <SheetTitle>Compare plans</SheetTitle>
              <SheetDescription>Team adds shared projects and an audit log.</SheetDescription>
            </Stack>
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered onClick={() => setOpen(false)}>
                Not now
              </Button>
              <Button emphasis="loud" onClick={() => setOpen(false)}>
                Upgrade to Team
              </Button>
            </Flex>
          </Stack>
        </SheetContent>
      </Sheet>
    </Stack>
  );
}
