# Table

Table shows data in rows and columns, and it scrolls sideways when the columns need more room than the page has.

Job: Browse. Scan a collection and find one item. A leaf: it does one thing.

```tsx
<Table aria-label="Invoices">
  <TableCaption>Invoices this month</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell align="end">£240.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Overview

Use a Table for data that people compare across rows and columns, such as invoices or members. It renders a real `table` element, so a screen reader can move by row and by column and read out the header for each cell.

The Table draws the lines between rows, the space inside each cell and a header row in a muted colour, and nothing else. Its rows don't react to hover or presses. For sorting, put a `Button` in a header cell and sort the rows in your own code.

When the columns need more room than the page has, the Table scrolls sideways inside its own box rather than widening the page. That box can take keyboard focus only while it scrolls. Name it with `aria-label` or `aria-labelledby` so a screen reader announces it as a named region, and add a `TableCaption` to name the table itself.

`size` sets the cell padding and the text size together, from 1 to 4, and the padding also follows the density setting. The first and last columns have no padding on their outer edge, so the text lines up with the content around the table.

Use `align` on `TableHead` and `TableCell` to set `start`, `center` or `end`, and set the same value for every cell in a column. Put words at the start and numbers at the end so the digits line up.

## Not supported

- A ScrollArea around it — The Table already scrolls sideways by itself and takes focus only when it overflows. A `ScrollArea` needs a fixed height, which a table rarely has.
- Hover, selection and a press on rows — A row that people can select or open needs keyboard support and an accessible name of its own. That will be a separate component, so this Table's rows stay static.
- `tone` and `emphasis` — A table as a whole has no meaning to colour. To show a status, put a tone on a `Text` or a `Chip` inside a cell.
- A sticky header — Components never decide their own position on the page. For a tall table with a pinned header, put it in a `ScrollArea` and pin the header there.
- Sorting and column controls — Sorting needs state and keyboard handling that belong to your app. Put a `Button` in the header cell, sort the data yourself, and the Table draws the rows in the order you give it.

## Examples

```tsx
import {
  Chip,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

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
```

### Sizes

`size` sets the cell padding and the text size together. Use size 2 for most tables, size 1 for dense data, and size 3 or 4 for a short table that has room to spare.

```tsx
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="6">
      {sizes.map((size) => (
        <Table key={size} size={size}>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Shruti Bhatia</TableCell>
              <TableCell>Owner</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Design team</TableCell>
              <TableCell>Editor</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ))}
    </Stack>
  );
}
```

### Alignment

Set `align` on the header cell and on every body cell in the same column. The price column sits at the end so its digits line up, and the short quantity is centred.

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kushagradhawan/kookie-ui-react";

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
```

### Wide columns

When the columns are wider than the space, the table scrolls sideways inside its own box and the page stays the same width. The `aria-label` names the scrolling box when it takes focus.

```tsx
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kushagradhawan/kookie-ui-react";

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
```

### Named by a heading

Set `aria-labelledby` to the `id` of a visible heading, and a screen reader uses the heading as the name of the table's region. Use `aria-label` when there is no visible heading.

```tsx
import {
  Heading,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kushagradhawan/kookie-ui-react";

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
```

### With actions

Put a `Button` in a cell for an action on that row. Give each icon-only button an `aria-label` that names the row, such as the file name, because the row itself doesn't respond to a press.

```tsx
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
} from "@kushagradhawan/kookie-ui-react";

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
```

### In a card

A table in a `Card` sits under a heading that names it. A `Chip` in a cell shows each member's status in a tone, and the table has no fill of its own, so the card's fill shows through.

```tsx
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
} from "@kushagradhawan/kookie-ui-react";

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
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Laying out the table

#### Table

Table shows data in rows and columns, and it scrolls sideways when the columns need more room than the page has.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name of the scroll region around the table. |
| `aria-labelledby?` | `string` | The id of an element that names the scroll region, usually a heading above the table. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the cell padding and the text size, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<table>`.

#### TableHeader

The header section of the table. Its cells are `TableHead`s, drawn in the muted text colour at medium weight so the column names sit back behind the data

It declares no props of its own. It takes every prop of a `<thead>`.

#### TableBody

The body section of the table. Its last row has no line under it, because the table ends there

It declares no props of its own. It takes every prop of a `<tbody>`.

### Rows and cells

#### TableRow

One row of the table. It doesn't respond to hover, selection or presses, so use a different component for rows that people pick

It declares no props of its own. It takes every prop of a `<tr>`.

#### TableHead

A header cell. It sets `scope="col"` unless you pass a different `scope`, and it takes `align` for its column

| Prop | Type | What it does |
| --- | --- | --- |
| `align?` | `"start" \| "center" \| "end"` | Sets the horizontal alignment of the cell content. |

It also takes every prop of a `<th>`.

#### TableCell

A body cell. Use `align` to put words at the start and numbers at the end

| Prop | Type | What it does |
| --- | --- | --- |
| `align?` | `"start" \| "center" \| "end"` | Sets the horizontal alignment of the cell content. |

It also takes every prop of a `<td>`.

### Naming it

#### TableCaption

Says what the table is. It sits under the table in the muted text colour and is also the table's accessible name

It declares no props of its own. It takes every prop of a `<caption>`.
