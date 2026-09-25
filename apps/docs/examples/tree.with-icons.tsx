import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon, Folder01Icon, Image01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import { Box, Tree, iconStroke, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Folder01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const files: readonly TreeNode[] = [
  {
    id: "brand",
    label: "Brand",
    leading: icon(Folder01Icon),
    children: [
      { id: "logo", label: "logo.png", leading: icon(Image01Icon) },
      { id: "guide", label: "brand-guide.pdf", leading: icon(Pdf01Icon) },
    ],
  },
  {
    id: "contracts",
    label: "Contracts",
    leading: icon(Folder01Icon),
    children: [{ id: "msa", label: "msa-2026.pdf", leading: icon(Pdf01Icon) }],
  },
  { id: "notes", label: "meeting-notes.md", leading: icon(File01Icon) },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree items={files} defaultExpandedIds={["brand"]} aria-label="Shared files" />
    </Box>
  );
}
