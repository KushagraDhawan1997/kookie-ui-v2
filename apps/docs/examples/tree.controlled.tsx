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
