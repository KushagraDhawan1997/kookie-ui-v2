import { Code, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kookie-ui/react";

const VARIABLES = [
  { name: "DATABASE_URL", purpose: "Connection string for the main database" },
  { name: "STRIPE_KEY", purpose: "Secret key for billing" },
  { name: "SENTRY_DSN", purpose: "Address for error reports" },
];

export default function Example() {
  return (
    <Table aria-label="Environment variables">
      <TableHeader>
        <TableRow>
          <TableHead>Variable</TableHead>
          <TableHead>Purpose</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {VARIABLES.map((variable) => (
          <TableRow key={variable.name}>
            <TableCell>
              <Code>{variable.name}</Code>
            </TableCell>
            <TableCell>{variable.purpose}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
