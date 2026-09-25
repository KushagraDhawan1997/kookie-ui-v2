"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
} from "@kushagradhawan/kookie-ui-react";

// A menu row cannot hold a trigger, so the row sets `open` instead. The menu closes, and the
// alert opens in its place.
export default function Example() {
  const [confirming, setConfirming] = React.useState(false);
  return (
    <Flex>
      <Menu>
        <MenuTrigger render={<Button emphasis="medium">Project actions</Button>} />
        <MenuContent>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <Separator />
          <MenuItem tone="destructive" onClick={() => setConfirming(true)}>
            Delete project…
          </MenuItem>
        </MenuContent>
      </Menu>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Marketing site?</AlertDialogTitle>
          <AlertDialogDescription>
            Its deployments, domains and environment variables are removed.
          </AlertDialogDescription>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
