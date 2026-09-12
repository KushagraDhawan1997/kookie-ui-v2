import { Field, FieldDescription, FieldLabel, NumberField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Field>
      <FieldLabel>Seats</FieldLabel>
      <NumberField defaultValue={4} min={1} max={50} style={{ maxWidth: "12rem" }} />
      <FieldDescription>Each seat is billed monthly.</FieldDescription>
    </Field>
  );
}
