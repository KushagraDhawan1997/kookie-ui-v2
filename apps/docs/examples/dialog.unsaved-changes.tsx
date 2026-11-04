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
  TextArea,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

// `onOpenChange` tells you why the dialog is closing. Call `cancel()` to
// keep it open, for example when Escape or an outside press would lose
// text the person typed.
export default function Example() {
  const [draft, setDraft] = React.useState("");

  return (
    <Dialog
      onOpenChange={(open, details) => {
        const dismissed = details.reason === "escape-key" || details.reason === "outside-press";
        if (!open && dismissed && draft.trim() !== "") details.cancel();
      }}
    >
      <DialogTrigger render={<Button emphasis="medium">Leave feedback</Button>} />
      <DialogContent>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>Leave feedback</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <DialogDescription>Escape does not close this dialog while it holds a draft.</DialogDescription>
          <Field>
            <FieldLabel>Your feedback</FieldLabel>
            <TextArea rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
            <FieldDescription>Shruti Bhatia on the product team reads every message.</FieldDescription>
          </Field>
          <Flex gap="3" justify="flex-end">
            <DialogClose
              render={
                <Button emphasis="quiet" bordered onClick={() => setDraft("")}>
                  Discard
                </Button>
              }
            />
            <DialogClose
              render={
                <Button emphasis="loud" onClick={() => setDraft("")}>
                  Send
                </Button>
              }
            />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
