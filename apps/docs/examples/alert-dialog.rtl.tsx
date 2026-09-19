import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Box,
  Button,
} from "@kookie-ui/react";

// The alert follows the direction around its trigger. In a right-to-left region, Cancel sits
// on the right and the text aligns to the right edge. No prop is needed.
export default function Example() {
  return (
    <Box dir="rtl">
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium">Remove member…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Remove Shruti Bhatia?</AlertDialogTitle>
          <AlertDialogDescription>
            She loses access to every project in this workspace.
          </AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Remove</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
