"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// A dialog does not need a DialogTrigger. Open it from your own state,
// for example after a request finishes or from a keyboard shortcut.
export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Stack gap="3" align="flex-start">
      <Text size="2" emphasis="medium">
        Your export finishes in a few seconds.
      </Text>
      <Button emphasis="medium" onClick={() => window.setTimeout(() => setOpen(true), 800)}>
        Export project data
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Toolbar>
            <ToolbarTitle render={<DialogTitle />}>Export ready</ToolbarTitle>
            <DialogClose
              render={
                <ToolbarButton iconOnly aria-label="Close">
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                </ToolbarButton>
              }
            />
          </Toolbar>
          <Stack gap="6">
            <DialogDescription>
              Your data is ready as a 4.2 MB ZIP file. The link works for 24 hours.
            </DialogDescription>
            <Flex gap="3" justify="flex-end">
              <DialogClose render={<Button emphasis="quiet" bordered>Later</Button>} />
              <DialogClose render={<Button emphasis="loud">Download</Button>} />
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
