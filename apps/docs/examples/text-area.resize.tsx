import { Field, FieldLabel, Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Release notes</FieldLabel>
        <TextArea rows={3} placeholder="Drag the corner to make this taller." />
      </Field>
      <Field>
        <FieldLabel>Commit message</FieldLabel>
        <TextArea rows={3} style={{ resize: "none" }} placeholder="This one keeps its height." />
      </Field>
    </Stack>
  );
}
