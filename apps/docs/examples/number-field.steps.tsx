import { Field, FieldDescription, FieldLabel, NumberField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "16rem" }}>
      <FieldLabel>Request timeout</FieldLabel>
      <NumberField
        defaultValue={30}
        min={5}
        max={300}
        step={5}
        smallStep={1}
        largeStep={60}
        format={{ style: "unit", unit: "second" }}
      />
      <FieldDescription>
        Arrow keys move by 5. Hold Alt to move by 1, or Shift to move by 60.
      </FieldDescription>
    </Field>
  );
}
