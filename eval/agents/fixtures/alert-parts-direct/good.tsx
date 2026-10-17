import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, Button } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button tone="destructive" emphasis="quiet">Delete project</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>Its files go with it. This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction tone="destructive">Delete project</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
