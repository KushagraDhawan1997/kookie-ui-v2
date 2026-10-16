"use client";

import * as React from "react";
import { Field, FieldError, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// Your code decides the field is invalid, here when it loses focus.
export default function Example() {
  const [emailError, setEmailError] = React.useState<string | null>(null);

  return (
    <Field invalid={Boolean(emailError)} style={{ maxWidth: "22rem" }}>
      <FieldLabel>Work email</FieldLabel>
      <TextField
        type="email"
        defaultValue="mira@kookie"
        onBlur={(event) =>
          setEmailError(
            /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(event.currentTarget.value)
              ? null
              : "Add the part after the dot, such as .dev.",
          )
        }
      />
      <FieldError match={Boolean(emailError)}>{emailError}</FieldError>
    </Field>
  );
}
