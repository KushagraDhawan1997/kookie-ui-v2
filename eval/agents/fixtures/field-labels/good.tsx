import type { ReactNode } from "react";
import { Checkbox, Field, FieldItem, FieldLabel, Stack, Switch, Text, TextField } from "@kushagradhawan/kookie-ui-react";

function LabelledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </Field>
  );
}

// A Field around each control, a FieldItem around the checkbox, and htmlFor outside a Field.
export default function App() {
  return (
    <Stack gap="5">
      <LabelledField label="Name"><TextField /></LabelledField>
      <Field>
        <FieldItem>
          <Checkbox />
          <FieldLabel>Email me about new comments</FieldLabel>
        </FieldItem>
      </Field>
      <Stack gap="2">
        <Switch id="dark" />
        <Text render={<label htmlFor="dark" />}>Dark mode</Text>
      </Stack>
    </Stack>
  );
}
