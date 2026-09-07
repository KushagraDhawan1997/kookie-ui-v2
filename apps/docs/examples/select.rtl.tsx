import {
  Box,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kookie-ui/react";

const LABELS = { apple: "Apple", banana: "Banana", leek: "Leek" };

// The trigger's caret moves to the other end and the panel anchors
// from the other edge. Nothing here says which way: `dir` does.
export default function Example() {
  return (
    <Box dir="rtl">
      <Select defaultValue="banana" items={LABELS}>
        <SelectTrigger placeholder="Pick one" />
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectContent>
      </Select>
    </Box>
  );
}
