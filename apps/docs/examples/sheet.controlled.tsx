"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
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
          <Toolbar>
            <ToolbarTitle render={<SheetTitle />}>Compare plans</ToolbarTitle>
            <SheetClose
              render={
                <ToolbarButton iconOnly aria-label="Close">
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                </ToolbarButton>
              }
            />
          </Toolbar>
          <Stack gap="6">
            <SheetDescription>Team adds shared projects and an audit log.</SheetDescription>
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
