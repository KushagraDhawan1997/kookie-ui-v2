import { Field, FieldDescription, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Work email</FieldLabel>
      <TextField type="email" />
      <FieldDescription>Receipts and billing notices go here.</FieldDescription>
    </Field>
  );
}
