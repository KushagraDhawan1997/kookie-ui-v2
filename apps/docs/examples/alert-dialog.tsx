import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <AlertDialog size="2">
      <AlertDialogTrigger render={<Button tone="destructive" emphasis="medium">Delete workspace…</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
        <AlertDialogDescription>
          Every project, member and API key goes with it. This cannot be undone.
        </AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
