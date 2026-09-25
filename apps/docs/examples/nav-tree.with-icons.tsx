import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book02Icon,
  CodeIcon,
  Home01Icon,
  PaintBrush01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { Box, NavTree, iconStroke, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const pages: readonly TreeNode[] = [
  { id: "/", label: "Home", href: "#", leading: icon(Home01Icon) },
  {
    id: "docs",
    label: "Documentation",
    leading: icon(Book02Icon),
    children: [
      { id: "/docs/start", label: "Getting started", href: "#", leading: icon(Rocket01Icon) },
      { id: "/docs/theming", label: "Theming", href: "#", leading: icon(PaintBrush01Icon) },
      { id: "/docs/api", label: "API reference", href: "#", leading: icon(CodeIcon) },
    ],
  },
];

// Set `leading` on a node to show an icon after the disclosure arrow.
// The icon takes the row's size, so you set no size on it.
export default function Example() {
  return (
    <Box render={<nav aria-label="Documentation" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["docs"]} currentId="/docs/theming" />
    </Box>
  );
}
