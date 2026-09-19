import {
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kookie-ui/react";

const ROLES = { viewer: "Viewer", editor: "Editor", admin: "Admin" };

// Any Kookie control connects to the Field around it. The label names the
// Select trigger, and the description is read with it.
export default function Example() {
  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Role</FieldLabel>
      <Select defaultValue="editor" items={ROLES}>
        <SelectTrigger />
        <SelectContent>
          {Object.entries(ROLES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>Editors can change projects but not billing.</FieldDescription>
    </Field>
  );
}
