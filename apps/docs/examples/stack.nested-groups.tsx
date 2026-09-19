import { Button, Field, FieldLabel, Heading, Stack, TextField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="6" style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="5">Profile</Heading>
        <Field>
          <FieldLabel>Display name</FieldLabel>
          <TextField defaultValue="Shruti Bhatia" />
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <TextField type="email" defaultValue="shruti@example.com" />
        </Field>
      </Stack>
      <Stack gap="4">
        <Heading size="5">Workspace</Heading>
        <Field>
          <FieldLabel>Workspace name</FieldLabel>
          <TextField defaultValue="Northwind Studio" />
        </Field>
      </Stack>
      <Stack align="flex-end">
        <Button emphasis="loud">Save changes</Button>
      </Stack>
    </Stack>
  );
}
