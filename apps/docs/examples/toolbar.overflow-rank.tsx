import { HugeiconsIcon } from "@hugeicons/react";
import {
  CopyPlusIcon,
  Delete02Icon,
  Download01Icon,
  LockIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Toolbar,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarOverflowItem,
  ToolbarTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof LockIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Publish is what this band exists for, so it has a rank and leaves the row last. The other
// controls have no rank and leave from the end of the cluster.
export default function Example() {
  return (
    <Box width="26rem">
      <Toolbar aria-label="Draft tools">
        <ToolbarTitle>Spring launch</ToolbarTitle>
        <ToolbarOverflow label="More draft actions">
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Share">
                  {icon(Share08Icon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
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
                <ToolbarButton iconOnly aria-label="Lock">
                  {icon(LockIcon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Lock</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly tone="destructive" aria-label="Delete">
                  {icon(Delete02Icon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
          <ToolbarOverflowItem rank={1}>
            <ToolbarButton emphasis="loud">Publish</ToolbarButton>
          </ToolbarOverflowItem>
        </ToolbarOverflow>
      </Toolbar>
    </Box>
  );
}
