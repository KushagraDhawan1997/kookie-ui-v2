"use client";

import { Field, FieldDescription, FieldError, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// Pass a `validate` function to the Field. It returns an error message, or
// `null` when the value is valid. A FieldError with no `match` shows that
// message, and a screen reader announces it.
export default function Example() {
  return (
    <Field
      validationMode="onBlur"
      validate={(value) =>
        typeof value === "string" && /^[a-z0-9-]{3,}$/.test(value)
          ? null
          : "Use at least three lowercase letters, numbers or hyphens."
      }
      style={{ maxWidth: "22rem" }}
    >
      <FieldLabel>Workspace URL</FieldLabel>
      <TextField defaultValue="My Workspace" />
      <FieldDescription>This becomes your address, such as acme.example.com.</FieldDescription>
      <FieldError />
    </Field>
  );
}
