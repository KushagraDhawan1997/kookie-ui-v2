import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@kushagradhawan/kookie-ui-react";

// The tone is on the panel, and the delete action has none.
export default function App() {
  return (
    <AlertDialog>
      <AlertDialogContent tone="destructive">
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction>Delete project</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
