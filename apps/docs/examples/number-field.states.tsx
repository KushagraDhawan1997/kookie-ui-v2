import { Field, FieldDescription, FieldError, FieldLabel, NumberField, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "16rem" }}>
      <Field>
        <FieldLabel>Included seats</FieldLabel>
        <NumberField defaultValue={10} readOnly />
        <FieldDescription>Set by your plan. You can select and copy it.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Extra seats</FieldLabel>
        <NumberField defaultValue={0} />
        <FieldDescription>Available on the team plan.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Retention days</FieldLabel>
        <NumberField defaultValue={400} max={365} allowOutOfRange />
        <FieldError match={true}>Keep logs for 365 days or fewer.</FieldError>
      </Field>
    </Stack>
  );
}
