import { Field, FieldDescription, FieldLabel, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// `disabled` on the Field reaches the control inside it. You do not need
// to set it twice.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field disabled>
        <FieldLabel>Organisation ID</FieldLabel>
        <TextField defaultValue="org_7Q2k9Xw" />
        <FieldDescription>Only support can change this.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Display name</FieldLabel>
        <TextField defaultValue="Acme Inc." />
      </Field>
    </Stack>
  );
}
