import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
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
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Dialog size={size}>
      <DialogTrigger render={<Button emphasis="medium">Rename project</Button>} />
      <DialogContent>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>Rename project</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <DialogDescription>Everyone with access will see the new name.</DialogDescription>
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <DialogClose render={<Button emphasis="loud">Save</Button>} />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
