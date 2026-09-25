import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Data residency</FieldLabel>
      <RadioGroup defaultValue="eu" disabled>
        <FieldItem>
          <Radio value="eu" />
          <FieldLabel>European Union</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="us" />
          <FieldLabel>United States</FieldLabel>
        </FieldItem>
      </RadioGroup>
      <FieldDescription>You set this when the workspace was created.</FieldDescription>
    </Field>
  );
}
