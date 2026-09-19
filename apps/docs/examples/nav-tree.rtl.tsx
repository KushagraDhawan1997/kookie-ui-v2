import { Box, NavTree, type TreeNode } from "@kookie-ui/react";

const pages: readonly TreeNode[] = [
  {
    id: "settings",
    label: "الإعدادات",
    children: [
      { id: "/settings/general", label: "عام", href: "#" },
      { id: "/settings/members", label: "الأعضاء", href: "#" },
    ],
  },
  { id: "/help", label: "المساعدة", href: "#" },
];

// Set `dir="rtl"` on the NavTree or on any ancestor. The indent moves to the
// right edge, and the disclosure arrow turns to point the other way.
export default function Example() {
  return (
    <Box dir="rtl" render={<nav aria-label="الإعدادات" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["settings"]} currentId="/settings/members" />
    </Box>
  );
}
