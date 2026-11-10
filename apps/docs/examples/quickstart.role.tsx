import {
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Role() {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <RadioGroup defaultValue="editor">
        <Stack gap="4">
          <FieldItem>
            <Radio value="viewer" />
            <FieldLabel>Viewer</FieldLabel>
            <FieldDescription>Can read and comment.</FieldDescription>
          </FieldItem>
          <FieldItem>
            <Radio value="editor" />
            <FieldLabel>Editor</FieldLabel>
            <FieldDescription>Can change content.</FieldDescription>
          </FieldItem>
          <FieldItem>
            <Radio value="admin" />
            <FieldLabel>Admin</FieldLabel>
            <FieldDescription>Can manage people and billing.</FieldDescription>
          </FieldItem>
        </Stack>
      </RadioGroup>
    </Field>
  );
}
