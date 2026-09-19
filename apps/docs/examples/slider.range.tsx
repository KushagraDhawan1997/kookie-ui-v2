import { Field, FieldDescription, FieldLabel, Slider } from "@kookie-ui/react";

// Pass an array and the Slider draws a handle for each value. `minStepsBetweenValues`
// keeps the two handles at least that many steps apart.
export default function Example() {
  return (
    <Field style={{ flexGrow: 1, maxWidth: "24rem" }}>
      <FieldLabel>Price range</FieldLabel>
      <Slider
        defaultValue={[40, 160]}
        min={0}
        max={200}
        step={10}
        minStepsBetweenValues={2}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
      <FieldDescription>Shows plans between the two prices.</FieldDescription>
    </Field>
  );
}
