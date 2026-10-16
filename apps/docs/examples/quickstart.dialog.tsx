import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join.</DialogDescription>
          </Stack>
          {/* the fields go here */}
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet">Cancel</Button>} />
            <Button emphasis="loud">Send invite</Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
