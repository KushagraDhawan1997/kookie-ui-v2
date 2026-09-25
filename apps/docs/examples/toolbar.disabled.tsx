import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, Download01Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import { Flex, Toolbar, ToolbarButton, ToolbarGroup, ToolbarTitle, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Undo02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="Selection tools" style={{ minWidth: "26rem" }}>
      <ToolbarTitle>No files selected</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly disabled aria-label="Undo">
          {icon(Undo02Icon)}
        </ToolbarButton>
        <ToolbarGroup disabled>
          <ToolbarButton iconOnly aria-label="Download">
            {icon(Download01Icon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Duplicate">
            {icon(Copy01Icon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Delete">
            {icon(Delete02Icon)}
          </ToolbarButton>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
