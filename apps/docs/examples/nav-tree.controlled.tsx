"use client";

import * as React from "react";
import { Box, Button, Flex, NavTree, Stack, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "/projects/billing", label: "Billing service", href: "#" },
      { id: "/projects/docs", label: "Docs", href: "#" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "/settings/general", label: "General", href: "#" },
      { id: "/settings/members", label: "Members", href: "#" },
    ],
  },
];

const sections = ["projects", "settings"];

// Pass `expandedIds` and `onExpandedChange` to keep the open sections in your
// own state. Here two buttons open or close every section at once.
export default function Example() {
  const [expanded, setExpanded] = React.useState<string[]>(["projects"]);

  return (
    <Stack gap="4" style={{ width: "18rem" }}>
      <Flex gap="2">
        <Button onClick={() => setExpanded(sections)}>Expand all</Button>
        <Button onClick={() => setExpanded([])}>Collapse all</Button>
      </Flex>
      <Box render={<nav aria-label="Workspace" />}>
        <NavTree
          items={pages}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          currentId="/projects/billing"
        />
      </Box>
    </Stack>
  );
}
