import { HugeiconsIcon } from "@hugeicons/react";
import { CopyPlusIcon, Delete02Icon, Download01Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import {
  Flex,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Undo02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="Selection tools" style={{ minWidth: "26rem" }}>
      <ToolbarTitle>No files selected</ToolbarTitle>
      <Flex align="center" gap="2">
        <Tooltip>
          <TooltipTrigger
            render={
              <ToolbarButton iconOnly disabled aria-label="Undo">
                {icon(Undo02Icon)}
              </ToolbarButton>
            }
          />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <ToolbarGroup disabled>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Download">
                  {icon(Download01Icon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Download</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Duplicate">
                  {icon(CopyPlusIcon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Delete">
                  {icon(Delete02Icon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
