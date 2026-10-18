import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, TextField } from "@kushagradhawan/kookie-ui-react";

// A field inside an alert: an alert holds a question, not work.
export default function App() {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogTitle>Invite a teammate</AlertDialogTitle>
        <AlertDialogDescription>Type their email.</AlertDialogDescription>
        <TextField aria-label="Email address" />
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Send invite</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
