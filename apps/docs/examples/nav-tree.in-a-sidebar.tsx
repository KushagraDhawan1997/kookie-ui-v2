import { Box, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  { id: "/overview", label: "Overview", href: "#" },
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "/projects/billing", label: "Billing service", href: "#" },
      { id: "/projects/marketing", label: "Marketing site", href: "#" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "/settings/general", label: "General", href: "#" },
      { id: "/settings/members", label: "Members", href: "#" },
      { id: "/settings/billing", label: "Billing", href: "#" },
    ],
  },
];

// NavTree renders a plain container. Put it in a `nav` element with a name,
// so a screen reader lists it with the other landmarks on the page.
export default function Example() {
  return (
    <Box render={<nav aria-label="Workspace" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["settings"]} currentId="/settings/members" />
    </Box>
  );
}
