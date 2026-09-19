import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
} from "@kookie-ui/react";

const ROLES = { viewer: "Viewer", editor: "Editor", admin: "Admin" };

// Inside a Field, the FieldLabel names the trigger. Select renders a hidden input, so
// `name` and `required` work with a form the same way a native select does.
export default function Example() {
  return (
    <Stack render={<form />} gap="5" style={{ minWidth: "18rem" }}>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Select name="role" required items={ROLES}>
          <SelectTrigger placeholder="Choose a role" />
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Admins can invite people and change billing.</FieldDescription>
      </Field>
      <Button type="submit" emphasis="loud">
        Send invite
      </Button>
    </Stack>
  );
}
