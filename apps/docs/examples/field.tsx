import {
  Card,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Stack,
  TextField,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="4">
        <Field>
          <FieldLabel>Email</FieldLabel>
          <FieldDescription>We use this for receipts.</FieldDescription>
          <TextField type="email" placeholder="mira@kookie.dev" />
        </Field>
        <Field>
          <FieldLabel>Account number</FieldLabel>
          <FieldDescription>Eight digits, no spaces.</FieldDescription>
          <TextField defaultValue="4471" aria-invalid />
          <FieldError match={true}>That is four digits short.</FieldError>
        </Field>
      </Stack>
    </Card>
  );
}
