import { Field, FieldDescription, FieldError, FieldLabel, TextArea } from "@kookie-ui/react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Reason for refund</FieldLabel>
      <TextArea rows={3} defaultValue="Bad" aria-invalid />
      <FieldDescription>Tell us what went wrong with the order.</FieldDescription>
      <FieldError match={true}>Write at least 20 characters.</FieldError>
    </Field>
  );
}
