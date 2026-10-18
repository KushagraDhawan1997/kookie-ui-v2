import { Field, FieldLabel, Heading, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// composition.md:136: a section at gap 6 can hold groups at gap 5; each Field is a group.
export default function App() {
  return (
    <Stack gap="6">
      <Heading size="6">General</Heading>
      <Stack gap="5">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <TextField />
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <TextField />
        </Field>
      </Stack>
    </Stack>
  );
}
