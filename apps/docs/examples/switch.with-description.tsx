import { Field, FieldDescription, FieldItem, FieldLabel, Stack, Switch } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Email notifications</FieldLabel>
      <Stack gap="4">
        <FieldItem>
          <Switch defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to you or mentions you.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Switch />
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>A digest of project activity every Monday.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
