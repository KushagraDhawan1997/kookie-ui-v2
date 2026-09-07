import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kookie-ui/react";

const LABELS = { apple: "Apple", banana: "Banana", leek: "Leek" };

// An option you cannot pick stays in the list, so the set a reader
// sees is the whole set. `disabled` on the Select itself closes the
// control instead, which is a different statement.
export default function Example() {
  return (
    <Select defaultValue="banana" items={LABELS}>
      <SelectTrigger placeholder="Pick one" />
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="leek" disabled>
          Leek
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
