import {
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field>
      <FieldLabel>Delivery speed</FieldLabel>
      <RadioGroup defaultValue="standard">
        <Stack gap="4">
          <FieldItem>
            <Radio value="standard" />
            <FieldLabel>Standard</FieldLabel>
            <FieldDescription>Three to five business days.</FieldDescription>
          </FieldItem>
          <FieldItem>
            <Radio value="express" />
            <FieldLabel>Express</FieldLabel>
            <FieldDescription>Next business day before noon.</FieldDescription>
          </FieldItem>
        </Stack>
      </RadioGroup>
    </Field>
  );
}
