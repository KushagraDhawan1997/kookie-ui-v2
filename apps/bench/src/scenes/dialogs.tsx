import * as React from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@kushagradhawan/kookie-ui-react";
import { useScene, useVersion } from "../harness";

/** Overlays opened and closed many times: a dialog with a form, a popover and a tooltip. */
export function DialogsScene() {
  const [version, rerender] = useVersion();
  const api = React.useMemo(() => ({ rerender }), [rerender]);
  useScene(api);

  return (
    <TooltipProvider>
      <Flex p="5" gap="3">
        <Dialog>
          <DialogTrigger render={<Button data-bench="dialog">Edit profile</Button>} />
          <DialogContent>
            <Stack gap="4">
              <DialogTitle>Edit profile {version}</DialogTitle>
              <DialogDescription>Change your name and email.</DialogDescription>
              <Field>
                <FieldLabel>Name</FieldLabel>
                <TextField defaultValue="Ada" />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <TextField defaultValue="ada@example.com" />
              </Field>
              <Flex gap="2" justify="flex-end">
                <DialogClose render={<Button emphasis="quiet">Cancel</Button>} />
                <DialogClose render={<Button data-bench="dialog-close">Save</Button>} />
              </Flex>
            </Stack>
          </DialogContent>
        </Dialog>
        <Popover>
          <PopoverTrigger render={<Button data-bench="popover" emphasis="medium">Share</Button>} />
          <PopoverContent aria-label="Share">
            <Text>Anyone with the link can view.</Text>
          </PopoverContent>
        </Popover>
        <Tooltip>
          <TooltipTrigger render={<Button emphasis="quiet">Status</Button>} />
          <TooltipContent>Saved two minutes ago</TooltipContent>
        </Tooltip>
      </Flex>
    </TooltipProvider>
  );
}
