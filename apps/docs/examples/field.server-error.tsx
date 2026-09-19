import { Field, FieldDescription, FieldError, FieldLabel, TextField } from "@kookie-ui/react";

// Set `invalid` on the Field when your server rejects a value. The
// description stays, because it says what to enter. The error adds what
// went wrong.
export default function Example() {
  return (
    <Field invalid style={{ maxWidth: "22rem" }}>
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" defaultValue="shruti@example.com" />
      <FieldDescription>We send receipts and security alerts here.</FieldDescription>
      <FieldError match={true}>An account with this email already exists.</FieldError>
    </Field>
  );
}
