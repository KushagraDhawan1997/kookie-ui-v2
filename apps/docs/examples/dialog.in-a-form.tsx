"use client";

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
  FieldDescription,
  FieldLabel,
  Flex,
  Stack,
  TextField,
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
          <Stack gap="2">
            <DialogTitle>Project settings</DialogTitle>
            <DialogDescription>Changes apply to everyone in the workspace.</DialogDescription>
          </Stack>
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
