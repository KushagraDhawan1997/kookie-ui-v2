import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Flex,
} from "@kookie-ui/react";

const sizes = ["1", "2", "3", "4"] as const;

// `size` sets the whole alert: its width, its padding, the title, the description and both
// buttons. Open each one to compare.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {sizes.map((size) => (
        <AlertDialog key={size} size={size}>
          <AlertDialogTrigger render={<Button emphasis="medium">Size {size}</Button>} />
          <AlertDialogContent>
            <AlertDialogTitle>Leave this project?</AlertDialogTitle>
            <AlertDialogDescription>
              You lose access until an owner invites you again.
            </AlertDialogDescription>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Leave</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </Flex>
  );
}
