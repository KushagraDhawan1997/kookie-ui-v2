"use client";

import * as React from "react";
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
          <Stack gap="6">
            <Stack gap="2">
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Everyone with access will see the new name.</DialogDescription>
            </Stack>
            <Field>
              <FieldLabel>Project name</FieldLabel>
              <TextField defaultValue="Marketing site" />
            </Field>
            <Flex gap="3" justify="flex-end">
              <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
              <DialogClose render={<Button emphasis="loud">Rename</Button>} />
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
    </Flex>
  );
}
