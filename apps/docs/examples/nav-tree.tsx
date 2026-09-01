import { Box, NavTree, type TreeNode } from "@kookie-ui/react";

const chapters: readonly TreeNode[] = [
  {
    id: "start",
    label: "Getting started",
    children: [
      { id: "/start/installation", label: "Installation", href: "#" },
      { id: "/start/theming", label: "Theming", href: "#" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    children: [
      { id: "/patterns/composition", label: "Composition", href: "#" },
      { id: "/patterns/forms", label: "Forms", href: "#" },
    ],
  },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <NavTree
        items={chapters}
        defaultExpandedIds={["start"]}
        currentId="/start/installation"
      />
    </Box>
  );
}
