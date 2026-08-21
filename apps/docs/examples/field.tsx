import {
  Card,
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="5">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <TextField type="email" placeholder="mira@kookie.dev" />
          <FieldDescription>We use this for receipts.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Account number</FieldLabel>
          <TextField defaultValue="4471" aria-invalid />
          <FieldDescription>Eight digits, no spaces.</FieldDescription>
          <FieldError match={true}>That is four digits short.</FieldError>
        </Field>
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
      </Stack>
    </Card>
  );
}
