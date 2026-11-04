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
  DialogTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Stack,
  TextField,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// Control `open` so the dialog closes only after the form is saved. The
// form element wraps the fields and the actions, so Enter submits it.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("Marketing site");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button emphasis="medium">Project settings</Button>} />
      <DialogContent>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>Project settings</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack
          gap="6"
          render={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            />
          }
        >
          <DialogDescription>Changes apply to everyone in the workspace.</DialogDescription>
          <Stack gap="5">
            <Field>
              <FieldLabel>Project name</FieldLabel>
              <TextField value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Custom domain</FieldLabel>
              <TextField placeholder="www.example.com" />
              <FieldDescription>Point a CNAME record at our servers first.</FieldDescription>
            </Field>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <Button type="submit" emphasis="loud">
              Save changes
            </Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
