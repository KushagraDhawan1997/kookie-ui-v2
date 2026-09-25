import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type Tone,
} from "@kushagradhawan/kookie-ui-react";

const JOBS: { name: string; status: string; tone: Tone }[] = [
  { name: "Build web app", status: "Deployed", tone: "success" },
  { name: "Run migrations", status: "Running", tone: "info" },
  { name: "Send invoices", status: "Failed", tone: "destructive" },
  { name: "Nightly backup", status: "Queued", tone: "neutral" },
];

export default function Example() {
  return (
    <Table aria-label="Jobs">
      <TableHeader>
        <TableRow>
          <TableHead>Job</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {JOBS.map((job) => (
          <TableRow key={job.name}>
            <TableCell>{job.name}</TableCell>
            <TableCell>
              <Chip tone={job.tone}>{job.status}</Chip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
