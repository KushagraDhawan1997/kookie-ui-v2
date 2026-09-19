import {
  Checkbox,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Stack,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Notifications</FieldLabel>
      <Stack gap="5">
        <FieldItem>
          <Checkbox name="comments" defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to your comment.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox name="mentions" defaultChecked />
          <FieldLabel>Mentions</FieldLabel>
          <FieldDescription>When someone mentions you in a project.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox name="invoices" />
          <FieldLabel>Invoices</FieldLabel>
          <FieldDescription>When a new invoice is ready to download.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
