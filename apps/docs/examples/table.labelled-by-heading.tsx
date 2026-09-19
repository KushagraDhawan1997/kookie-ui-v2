import {
  Heading,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="5" id="usage-heading">
        API usage this week
      </Heading>
      <Table aria-labelledby="usage-heading">
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead align="end">Requests</TableHead>
            <TableHead align="end">Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Monday</TableCell>
            <TableCell align="end">48,210</TableCell>
            <TableCell align="end">12</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tuesday</TableCell>
            <TableCell align="end">51,904</TableCell>
            <TableCell align="end">4</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  );
}
