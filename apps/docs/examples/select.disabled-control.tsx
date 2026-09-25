import {
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const PLANS = { free: "Free", team: "Team", enterprise: "Enterprise" };

// Set `disabled` on the Select to turn off the whole control. The panel cannot open, and
// the value is not sent with the form.
export default function Example() {
  return (
    <Field style={{ minWidth: "18rem" }}>
      <FieldLabel>Plan</FieldLabel>
      <Select defaultValue="team" items={PLANS} disabled>
        <SelectTrigger />
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Only the workspace owner can change the plan.</FieldDescription>
    </Field>
  );
}
