"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FieldLabel,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Stack,
  TextField,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// A menu row can open a dialog. Keep the dialog outside the menu and
// control it with state, because the menu closes when the row is chosen.
export default function Example() {
  const [renaming, setRenaming] = React.useState(false);

  return (
    <Flex>
      <Menu>
        <MenuTrigger render={<Button emphasis="medium">Project actions</Button>} />
        <MenuContent>
          <MenuItem onClick={() => setRenaming(true)}>Rename…</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem tone="destructive">Delete</MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={renaming} onOpenChange={setRenaming}>
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
            <Field>
              <FieldLabel>Project name</FieldLabel>
              <TextField defaultValue="Marketing site" />
            </Field>
          </Stack>
          <Toolbar aria-label="Actions">
            <Flex flexGrow="1" justify="flex-end" gap="3">
              <DialogClose render={<ToolbarButton emphasis="loud">Rename</ToolbarButton>} />
            </Flex>
          </Toolbar>
        </DialogContent>
      </Dialog>
    </Flex>
  );
}
