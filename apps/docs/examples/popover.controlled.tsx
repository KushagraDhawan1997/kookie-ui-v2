"use client";

import * as React from "react";
import {
  Button,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("Quarterly report");
  const [draft, setDraft] = React.useState(label);

  return (
    <Stack gap="3" align="start">
      <Text size="2" emphasis="medium">Current label: {label}</Text>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(label);
        }}
      >
        <PopoverTrigger render={<Button emphasis="quiet" bordered>Edit label</Button>} />
        <PopoverContent align="start">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLabel(draft);
              setOpen(false);
            }}
          >
            <Stack gap="4">
              <PopoverTitle>Edit label</PopoverTitle>
              <Field>
                <FieldLabel>Label</FieldLabel>
                <TextField value={draft} onChange={(event) => setDraft(event.target.value)} />
              </Field>
              <Flex justify="flex-end">
                <Button type="submit" emphasis="loud">
                  Save
                </Button>
              </Flex>
            </Stack>
          </form>
        </PopoverContent>
      </Popover>
    </Stack>
  );
}
