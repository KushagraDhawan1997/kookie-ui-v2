import { Box, Tree, type TreeNode } from "@kookie-ui/react";

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
