import { Field, FieldDescription, FieldLabel, NumberField, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "16rem" }}>
      <Field>
        <FieldLabel>Monthly budget</FieldLabel>
        <NumberField
          defaultValue={250}
          min={0}
          step={10}
          format={{ style: "currency", currency: "EUR" }}
        />
        <FieldDescription>Spending stops when the project reaches this amount.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Discount</FieldLabel>
        <NumberField
          defaultValue={0.15}
          min={0}
          max={1}
          step={0.05}
          format={{ style: "percent" }}
        />
      </Field>
      <Field>
        <FieldLabel>Upload limit</FieldLabel>
        <NumberField
          defaultValue={50}
          min={1}
          format={{ style: "unit", unit: "megabyte" }}
        />
      </Field>
    </Stack>
  );
}
