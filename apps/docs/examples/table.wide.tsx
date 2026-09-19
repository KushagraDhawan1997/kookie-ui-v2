import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

const columns = ["Project", "Owner", "Status", "Started", "Due", "Budget", "Spent", "Region"];
const rows = [
  ["Website redesign", "Shruti Bhatia", "In progress", "3 June", "30 September", "£18,000", "£11,420", "Europe"],
  ["Mobile onboarding", "Shruti Bhatia", "In review", "12 July", "15 October", "£9,500", "£8,900", "North America"],
];

export default function Example() {
  return (
    <Box style={{ maxWidth: "32rem" }}>
      <Table aria-label="Active projects">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[0]}>
              {row.map((cell, index) => (
                <TableCell key={columns[index]}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
