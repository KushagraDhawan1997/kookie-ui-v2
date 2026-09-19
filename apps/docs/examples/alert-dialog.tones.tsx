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

// Give the action a `tone` only when it carries a meaning. A delete is `destructive`. A
// question with no risk, such as publishing, keeps the default.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium">Publish…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Publish this page?</AlertDialogTitle>
          <AlertDialogDescription>
            Everyone with the link can read it. You can unpublish it later.
          </AlertDialogDescription>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction>Publish</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium" tone="destructive">Delete file…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Delete invoice-0421.pdf?</AlertDialogTitle>
          <AlertDialogDescription>
            The file is removed for every member. This cannot be undone.
          </AlertDialogDescription>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
