import { Box, Tree, type TreeNode } from "@kookie-ui/react";

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
