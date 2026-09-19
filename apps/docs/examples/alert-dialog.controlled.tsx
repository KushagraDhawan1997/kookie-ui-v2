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
  Stack,
  Text,
} from "@kookie-ui/react";

// An alert raised by app state has no trigger. Pass `open` and `onOpenChange`, and set `open`
// from your own logic. Here a button stands in for a session timer.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState("Signed in as Shruti Bhatia.");
  return (
    <Stack gap="3" align="start">
      <Text emphasis="medium">{status}</Text>
      <Button emphasis="medium" onClick={() => setOpen(true)}>
        Expire session
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Stay signed in?</AlertDialogTitle>
          <AlertDialogDescription>
            Your session ends in two minutes. Unsaved changes are lost if it ends.
          </AlertDialogDescription>
          <AlertDialogCancel onClick={() => setStatus("Signed out.")}>Sign out</AlertDialogCancel>
          <AlertDialogAction onClick={() => setStatus("Session extended by one hour.")}>
            Stay
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Stack>
  );
}
