import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kookie-ui/react";

const SIZES = { s: "Small", m: "Medium", l: "Large" };

// With no `defaultValue`, the trigger shows the `placeholder` in a muted colour until
// someone picks an option.
export default function Example() {
  return (
    <Select items={SIZES}>
      <SelectTrigger aria-label="Instance size" placeholder="Choose an instance size" />
      <SelectContent>
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="m">Medium</SelectItem>
        <SelectItem value="l">Large</SelectItem>
      </SelectContent>
    </Select>
  );
}
