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

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>Invite a teammate</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <DialogDescription>They get an email with a link to join.</DialogDescription>
          {/* the fields go here */}
        </Stack>
        <Toolbar aria-label="Actions">
          <Flex flexGrow="1" justify="flex-end" gap="3">
            <ToolbarButton emphasis="loud">Send invite</ToolbarButton>
          </Flex>
        </Toolbar>
      </DialogContent>
    </Dialog>
  );
}
