import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kookie-ui/react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Region</FieldLabel>
      <RadioGroup defaultValue="eu-west">
        <FieldItem>
          <Radio value="eu-west" />
          <FieldLabel>Europe (Ireland)</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="us-east" />
          <FieldLabel>United States (Virginia)</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="ap-south" disabled />
          <FieldLabel>Asia Pacific (Mumbai)</FieldLabel>
          <FieldDescription>Available on the enterprise plan.</FieldDescription>
        </FieldItem>
      </RadioGroup>
    </Field>
  );
}
