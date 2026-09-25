import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field>
        <FieldLabel>VAT number</FieldLabel>
        <TextField defaultValue="GB1234" aria-invalid />
        <FieldDescription>Nine digits after the country code.</FieldDescription>
        <FieldError match={true}>This number is five digits too short.</FieldError>
      </Field>
      <TextField defaultValue="shruti@" type="email" aria-label="Invite email" aria-invalid />
    </Stack>
  );
}
