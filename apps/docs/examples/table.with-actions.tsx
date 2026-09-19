import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  iconStroke,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

const files = [
  ["Q3 budget.xlsx", "2.4 MB"],
  ["Brand guidelines.pdf", "18.1 MB"],
  ["Launch checklist.md", "12 KB"],
] as const;

export default function Example() {
  return (
    <Table aria-label="Shared files">
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead align="end">Size</TableHead>
          <TableHead align="end">Download</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map(([name, size]) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell align="end">{size}</TableCell>
            <TableCell align="end">
              <Button emphasis="quiet" iconOnly aria-label={`Download ${name}`}>
                <HugeiconsIcon icon={Download01Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
