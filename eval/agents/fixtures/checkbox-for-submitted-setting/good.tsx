import { Button, Checkbox, Field, FieldItem, FieldLabel, Stack } from "@kushagradhawan/kookie-ui-react";

// The setting waits for the save button, so it is a Checkbox.
export default function App() {
  return (
    <Stack gap="5">
      <Field>
        <FieldItem>
          <Checkbox />
          <FieldLabel>Email notifications</FieldLabel>
        </FieldItem>
      </Field>
      <Button tone="accent" emphasis="loud">Save changes</Button>
    </Stack>
  );
}
