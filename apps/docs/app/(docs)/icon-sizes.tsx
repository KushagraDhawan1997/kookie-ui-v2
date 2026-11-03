import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, iconSize } from "@kushagradhawan/kookie-ui-react";

/**
 * The Icons chapter's size table (2026-11-01), read from the package's own `iconSize` so the
 * page cannot drift from what the stylesheet ships. The markdown twin builds the same table
 * from the same rows.
 */
const SIZES = ["1", "2", "3", "4"] as const;
const ROWS = [
  { label: "Fine pointer", values: iconSize.fine },
  { label: "Touch", values: iconSize.coarse },
] as const;

export function iconSizesMarkdown(): string {
  return [
    `| Size | ${SIZES.join(" | ")} |`,
    `|---|${SIZES.map(() => "---").join("|")}|`,
    ...ROWS.map((row) => `| ${row.label} | ${row.values.join(" | ")} |`),
  ].join("\n");
}

export function IconSizes() {
  return (
    <Table size="2">
      <TableHeader>
        <TableRow>
          <TableHead>Size</TableHead>
          {SIZES.map((size) => (
            <TableHead key={size} align="end">
              {size}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.label}>
            <TableCell>{row.label}</TableCell>
            {row.values.map((value, index) => (
              <TableCell key={SIZES[index]} align="end">
                {value}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
