"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Text,
  TextField,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const formId = React.useId();
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
          <Toolbar>
            <ToolbarTitle render={<PopoverTitle />}>Edit label</ToolbarTitle>
            <PopoverClose
              render={
                <ToolbarButton iconOnly aria-label="Close">
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
                </ToolbarButton>
              }
            />
          </Toolbar>
          <form
            id={formId}
            onSubmit={(event) => {
              event.preventDefault();
              setLabel(draft);
              setOpen(false);
            }}
          >
            <Field>
              <FieldLabel>Label</FieldLabel>
              <TextField value={draft} onChange={(event) => setDraft(event.target.value)} />
            </Field>
          </form>
          <Toolbar aria-label="Actions">
            <Flex flexGrow="1" justify="flex-end" gap="3">
              <ToolbarButton type="submit" form={formId} emphasis="loud">
                Save
              </ToolbarButton>
            </Flex>
          </Toolbar>
        </PopoverContent>
      </Popover>
    </Stack>
  );
}
