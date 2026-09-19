import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

const rows = [
  ["Team plan", "12", "£20.00", "£240.00"],
  ["Extra storage", "2", "£5.00", "£10.00"],
  ["Priority support", "1", "£49.00", "£49.00"],
] as const;

export default function Example() {
  return (
    <Table>
      <TableCaption>Charges on invoice INV-0042</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead align="center">Quantity</TableHead>
          <TableHead align="end">Unit price</TableHead>
          <TableHead align="end">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([item, quantity, unit, total]) => (
          <TableRow key={item}>
            <TableCell>{item}</TableCell>
            <TableCell align="center">{quantity}</TableCell>
            <TableCell align="end">{unit}</TableCell>
            <TableCell align="end">{total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
