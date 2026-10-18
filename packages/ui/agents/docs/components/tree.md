# Tree

Tree shows nested items that you can open, close and select, such as a file browser or a layers panel.

Job: Browse. Scan a collection and find one item. A leaf: it does one thing.

```tsx
<Tree items={files} multiselectable defaultExpandedIds={["src"]} aria-label="Project files" />
```

## Overview

Use a `Tree` for nested content that people open, close and select, such as a file browser, a layers panel or folders with sub-folders. By default a click selects one row, and `multiselectable` lets people select several.

For navigation, where pressing a row opens a page, use a `NavTree` instead. For a short flat list of choices, use a `Menu` or a `Select`.

You pass the content as data through `items`. Each `TreeNode` has an `id` and a `label`, and a node with `children` shows a disclosure arrow. Add `leading` for an icon, and set `textValue` whenever the `label` is not plain text, so that typing a letter can still find the row.

`size` sets the row height, the text and the indent, and one level of indent is the width of one icon at that size. Selected rows get a soft fill.

Screen readers announce the tree with the level, position, open state and selected state of each row. The tree is a single tab stop. Up and Down move between visible rows, Right opens a row or moves to its first child, and Left closes a row or moves to its parent. Home and End go to the first and last rows, Enter or Space selects, and typing a letter jumps to the next matching row.

With `multiselectable`, Shift with an arrow key or a click selects a range, and Command or Control with a click adds or removes a single row.

## Not supported

- Drag to reorder — The rules for where an item may be dropped are different in every app, so reordering is left to your code.
- Selecting a folder's children with it — Whether selecting a folder also selects its contents is a product decision. The tree selects exactly the rows that the person picks.
- Loading children on demand — The tree does not yet load branches over the network or show a loading state, so pass the full data you want to show.
- Renaming in place — Your app decides what counts as a valid name and when a rename is saved, so build the rename field in your own code.
- JSX children — The tree renders its rows as one flat list with ARIA levels, so it needs the hierarchy as data. Pass it through `items`.
- An `indent` prop — One level of indent is always one icon wide at the current size, so the indent grows and shrinks with `size`.

## Examples

```tsx
import { Box, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const files: readonly TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button", label: "button.tsx" },
          { id: "tree", label: "tree.tsx" },
        ],
      },
      { id: "index", label: "index.ts" },
    ],
  },
  { id: "docs", label: "docs", children: [{ id: "readme", label: "README.md" }] },
  { id: "license", label: "LICENSE" },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree
        items={files}
        multiselectable
        defaultExpandedIds={["src"]}
        defaultSelectedIds={["index"]}
        aria-label="Project files"
      />
    </Box>
  );
}
```

### With icons

Each node has an icon in `leading`, which the tree sizes to match the row. Use icons that show the kind of item, such as a folder or a document.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Folder01Icon, Image01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import { Box, Tree, iconStroke, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Folder01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const files: readonly TreeNode[] = [
  {
    id: "brand",
    label: "Brand",
    leading: icon(Folder01Icon),
    children: [
      { id: "logo", label: "logo.png", leading: icon(Image01Icon) },
      { id: "guide", label: "brand-guide.pdf", leading: icon(Pdf01Icon) },
    ],
  },
  {
    id: "contracts",
    label: "Contracts",
    leading: icon(Folder01Icon),
    children: [{ id: "msa", label: "msa-2026.pdf", leading: icon(Pdf01Icon) }],
  },
  { id: "notes", label: "meeting-notes.md", leading: icon(File01Icon) },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree items={files} defaultExpandedIds={["brand"]} aria-label="Shared files" />
    </Box>
  );
}
```

### Single selection

Without `multiselectable`, a click selects one row and clears the others. This tree starts with one folder open through `defaultExpandedIds` and one row selected through `defaultSelectedIds`.

```tsx
import { Box, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const layers: readonly TreeNode[] = [
  {
    id: "header",
    label: "Header",
    children: [
      { id: "logo", label: "Logo" },
      { id: "nav", label: "Navigation" },
    ],
  },
  {
    id: "hero",
    label: "Hero",
    children: [
      { id: "headline", label: "Headline" },
      { id: "cta", label: "Call to action" },
    ],
  },
  { id: "footer", label: "Footer" },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree
        items={layers}
        defaultExpandedIds={["hero"]}
        defaultSelectedIds={["headline"]}
        aria-label="Layers"
      />
    </Box>
  );
}
```

### Controlled

The open folders and the selected rows live in the example's own state, through `expandedIds` and `selectedIds` with their change handlers. That lets the Expand all and Collapse all buttons change the tree.

```tsx
"use client";

import * as React from "react";
import { Button, Flex, Stack, Text, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const teams: readonly TreeNode[] = [
  {
    id: "design",
    label: "Design",
    children: [
      { id: "brand", label: "Brand" },
      { id: "product-design", label: "Product design" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    children: [
      { id: "platform", label: "Platform" },
      { id: "mobile", label: "Mobile" },
    ],
  },
];

const FOLDERS = ["design", "engineering"];

export default function Example() {
  const [expanded, setExpanded] = React.useState<string[]>(["design"]);
  const [selected, setSelected] = React.useState<string[]>(["brand"]);

  return (
    <Stack gap="4" style={{ minWidth: "20rem" }}>
      <Flex gap="2">
        <Button onClick={() => setExpanded(FOLDERS)}>Expand all</Button>
        <Button onClick={() => setExpanded([])}>Collapse all</Button>
      </Flex>
      <Tree
        items={teams}
        multiselectable
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        selectedIds={selected}
        onSelectionChange={setSelected}
        aria-label="Teams"
      />
      <Text size="2" emphasis="medium">
        {selected.length} {selected.length === 1 ? "team" : "teams"} selected
      </Text>
    </Stack>
  );
}
```

### Sizes

The same tree at sizes 1 to 4. `size` changes the row height, the text and the indent, and one level of indent is always one icon wide.

```tsx
import { Grid, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const items: readonly TreeNode[] = [
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "profile", label: "Profile" },
      { id: "billing", label: "Billing" },
    ],
  },
];

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="5" style={{ minWidth: "28rem" }}>
      {SIZES.map((size) => (
        <Tree
          key={size}
          size={size}
          items={items}
          defaultExpandedIds={["settings"]}
          aria-label={`Settings, size ${size}`}
        />
      ))}
    </Grid>
  );
}
```

### Rich labels

Each `label` holds a name and a count in a `Badge`. Those nodes also set `textValue`, so typing a letter still finds the right row.

```tsx
import { Badge, Box, Flex, Text, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const label = (name: string, count: number) => (
  <Flex gap="2" align="center" justify="space-between" style={{ width: "100%" }}>
    <Text>{name}</Text>
    <Badge>{count}</Badge>
  </Flex>
);

const inbox: readonly TreeNode[] = [
  {
    id: "inbox",
    label: label("Inbox", 12),
    textValue: "Inbox",
    children: [
      { id: "billing", label: label("Billing", 3), textValue: "Billing" },
      { id: "support", label: label("Support", 9), textValue: "Support" },
    ],
  },
  { id: "archive", label: label("Archive", 240), textValue: "Archive" },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree items={inbox} defaultExpandedIds={["inbox"]} aria-label="Mailboxes" />
    </Box>
  );
}
```

### Right to left

Inside `dir="rtl"`, the indent moves to the right and the disclosure arrow points in the reading direction.

```tsx
import { Box, Tree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const items: readonly TreeNode[] = [
  {
    id: "reports",
    label: "التقارير",
    children: [
      { id: "q1", label: "الربع الأول" },
      { id: "q2", label: "الربع الثاني" },
    ],
  },
  { id: "archive", label: "الأرشيف" },
];

export default function Example() {
  return (
    <Box dir="rtl" style={{ minWidth: "20rem" }}>
      <Tree items={items} defaultExpandedIds={["reports"]} aria-label="التقارير" />
    </Box>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `defaultExpandedIds?` | `readonly string[]` | Uncontrolled starting expansion. |
| `defaultSelectedIds?` | `readonly string[]` | Uncontrolled starting selection. |
| `expandedIds?` | `readonly string[]` | Controlled expansion, paired with `onExpandedChange`. |
| `items` | `readonly TreeNode[]` | The hierarchy, as data. |
| `multiselectable?` | `boolean` | Lets the user select more than one row. |
| `onExpandedChange?` | `(ids: string[]) => void` | Fires when a node opens or closes, with the whole expanded set. |
| `onSelectionChange?` | `(ids: string[]) => void` | Fires when the selection changes, with the whole selected set. |
| `selectedIds?` | `readonly string[]` | Controlled selection, paired with `onSelectionChange`. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the rows. |

It also takes every prop of a `<div>`.
