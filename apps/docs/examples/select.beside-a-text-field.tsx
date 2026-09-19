import {
  Flex,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  TextField,
} from "@kookie-ui/react";

const UNITS = { gb: "GB", tb: "TB" };

// A SelectTrigger has the same fill, border and height as a TextField. The two sit in one
// row as a single input.
export default function Example() {
  return (
    <Flex gap="2">
      <TextField aria-label="Storage amount" defaultValue="500" inputMode="numeric" />
      <Select defaultValue="gb" items={UNITS}>
        <SelectTrigger aria-label="Storage unit" />
        <SelectContent>
          <SelectItem value="gb">GB</SelectItem>
          <SelectItem value="tb">TB</SelectItem>
        </SelectContent>
      </Select>
    </Flex>
  );
}
