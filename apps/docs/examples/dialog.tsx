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
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Dialog size={size}>
      <DialogTrigger render={<Button emphasis="medium">Rename project</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Everyone with access will see the new name.</DialogDescription>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <DialogClose render={<Button emphasis="loud">Save</Button>} />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
