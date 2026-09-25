"use client";

import * as React from "react";
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
          <Stack gap="6">
            <Stack gap="2">
              <DialogTitle>Export ready</DialogTitle>
              <DialogDescription>
                Your data is ready as a 4.2 MB ZIP file. The link works for 24 hours.
              </DialogDescription>
            </Stack>
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
