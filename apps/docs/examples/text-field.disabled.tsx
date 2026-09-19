import { Field, FieldDescription, FieldLabel, Stack, TextField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field disabled>
        <FieldLabel>Team name</FieldLabel>
        <TextField defaultValue="Design" />
        <FieldDescription>Only an owner can rename the team.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Workspace ID</FieldLabel>
        <TextField defaultValue="ws_8f3k2a91" readOnly />
        <FieldDescription>You can select and copy this value.</FieldDescription>
      </Field>
    </Stack>
  );
}
