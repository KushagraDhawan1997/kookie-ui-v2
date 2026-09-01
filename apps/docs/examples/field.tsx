import {
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
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="5" style={{ minWidth: "20rem" }}>
      <Field size={size}>
        <FieldLabel>Email</FieldLabel>
        <TextField type="email" placeholder="mira@kookie.dev" />
        <FieldDescription>We use this for receipts.</FieldDescription>
      </Field>
      <Field size={size}>
        <FieldLabel>Account number</FieldLabel>
        <TextField defaultValue="4471" aria-invalid />
        <FieldDescription>Eight digits, no spaces.</FieldDescription>
        <FieldError match={true}>That is four digits short.</FieldError>
      </Field>
      <Field size={size}>
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
  );
}
