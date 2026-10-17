import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, Flex } from "@kushagradhawan/kookie-ui-react";

// The buttons are wrapped in a Flex, so the alert can no longer lay them out.
export default function App() {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <Flex gap="3">
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete project</AlertDialogAction>
        </Flex>
      </AlertDialogContent>
    </AlertDialog>
  );
}
