import { Field, FieldDescription, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Email() {
  return (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" placeholder="mira@kookie.dev" />
      <FieldDescription>Use their work address.</FieldDescription>
    </Field>
  );
}
