"use client";

import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

// Put `required` on the control. FieldError with `match="valueMissing"`
// shows its message only when the browser reports that the value is missing.
export default function Example() {
  return (
    <Stack
      gap="5"
      style={{ maxWidth: "22rem" }}
      render={<form onSubmit={(event) => event.preventDefault()} />}
    >
      <Field>
        <FieldLabel>Workspace name</FieldLabel>
        <TextField required placeholder="Acme Inc." />
        <FieldError match="valueMissing">Enter a name for your workspace.</FieldError>
      </Field>
      <Button type="submit" emphasis="loud">
        Create workspace
      </Button>
    </Stack>
  );
}
