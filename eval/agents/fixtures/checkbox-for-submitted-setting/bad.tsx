import { Button, Field, FieldItem, FieldLabel, Stack, Switch } from "@kushagradhawan/kookie-ui-react";

// A Switch that only takes effect when the form is saved.
export default function App() {
  return (
    <Stack gap="5">
      <Field>
        <FieldItem>
          <Switch />
          <FieldLabel>Email notifications</FieldLabel>
        </FieldItem>
      </Field>
      <Button tone="accent" emphasis="loud">Save changes</Button>
    </Stack>
  );
}
