import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button tone="destructive" emphasis="quiet">Delete</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>
          Its documents and their history go with it. This cannot be undone.
        </AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction tone="destructive">Delete project</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
