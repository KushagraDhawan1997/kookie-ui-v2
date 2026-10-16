import { Box, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const chapters: readonly TreeNode[] = [
  {
    id: "start",
    label: "Getting started",
    children: [
      { id: "/start/installation", label: "Installation", href: "#" },
      { id: "/foundations/appearance", label: "Appearance", href: "#" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    children: [
      { id: "/start/composition", label: "Composition", href: "#" },
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
