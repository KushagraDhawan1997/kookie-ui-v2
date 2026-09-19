import { Field, FieldDescription, FieldLabel, TextArea } from "@kookie-ui/react";

// A TextArea works in a Field the same way a TextField does. The control
// fills the width of the Field.
export default function Example() {
  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Release notes</FieldLabel>
      <TextArea rows={4} placeholder="What changed in this version?" />
      <FieldDescription>Shown to customers on the changelog page.</FieldDescription>
    </Field>
  );
}
