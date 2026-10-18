import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogAction tone="destructive">Delete project</AlertDialogAction>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
      </AlertDialogContent>
    </AlertDialog>
  );
}
