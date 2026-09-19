import {
  Card,
  Chip,
  Heading,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kookie-ui/react";

const members = [
  ["Shruti Bhatia", "Owner", "Active"],
  ["Design team", "Editor", "Invited"],
] as const;

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "32rem" }}>
      <Stack gap="4">
        <Heading size="6" id="members-heading">
          Members
        </Heading>
        <Table aria-labelledby="members-heading">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(([name, role, status]) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{role}</TableCell>
                <TableCell>
                  <Chip tone={status === "Active" ? "success" : "neutral"}>{status}</Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Card>
  );
}
