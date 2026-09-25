import { Field, FieldLabel, Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Internal notes</FieldLabel>
        <TextArea rows={2} disabled defaultValue="Only admins can edit notes on this plan." />
      </Field>
      <Field>
        <FieldLabel>Original request</FieldLabel>
        <TextArea rows={2} readOnly defaultValue="Please move our workspace to the Team plan." />
      </Field>
    </Stack>
  );
}
