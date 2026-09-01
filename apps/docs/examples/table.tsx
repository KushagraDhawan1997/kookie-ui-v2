import {
  Chip,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

const ROWS = [
  ["INV-0041", "Acme Studio", "Paid", "$1,250.00"],
  ["INV-0042", "Northwind", "Pending", "$640.00"],
  ["INV-0043", "Globex", "Overdue", "$2,100.00"],
] as const;

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Table size={size}>
      <TableCaption>Invoices this month</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map(([id, customer, status, amount]) => (
          <TableRow key={id}>
            <TableCell>{id}</TableCell>
            <TableCell>{customer}</TableCell>
            <TableCell>
              <Chip tone={status === "Paid" ? "success" : status === "Overdue" ? "destructive" : "neutral"}>
                {status}
              </Chip>
            </TableCell>
            <TableCell align="end">{amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
