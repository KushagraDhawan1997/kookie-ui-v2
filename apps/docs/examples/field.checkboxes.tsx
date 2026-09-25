import {
  Checkbox,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

// Use a FieldItem for each option. The item gives the checkbox its own
// label and its own description, and clicking the label toggles it.
export default function Example() {
  return (
    <Field style={{ maxWidth: "26rem" }}>
      <FieldLabel>Email me about</FieldLabel>
      <FieldDescription>We never send more than one email a day.</FieldDescription>
      <Stack gap="5">
        <FieldItem>
          <Checkbox defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to you or mentions you.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox defaultChecked />
          <FieldLabel>Deploys</FieldLabel>
          <FieldDescription>When a production deploy fails.</FieldDescription>
        </FieldItem>
        <FieldItem disabled>
          <Checkbox />
          <FieldLabel>Billing</FieldLabel>
          <FieldDescription>Only workspace owners receive billing email.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
