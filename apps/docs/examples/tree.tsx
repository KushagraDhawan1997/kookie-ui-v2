import { Card, Tree, type TreeNode } from "@kookie-ui/react";

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
    <Card size="2" style={{ maxWidth: "20rem" }}>
      <Tree
        items={files}
        multiselectable
        defaultExpandedIds={["src"]}
        defaultSelectedIds={["index"]}
        aria-label="Project files"
      />
    </Card>
  );
}
