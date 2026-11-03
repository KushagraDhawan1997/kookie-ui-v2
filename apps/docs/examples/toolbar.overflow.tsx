import { HugeiconsIcon } from "@hugeicons/react";
import {
  CopyPlusIcon,
  Delete02Icon,
  Download01Icon,
  LockIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof LockIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="File tools" style={{ width: "18rem" }}>
      <ToolbarTitle>Annual report.pdf</ToolbarTitle>
      <ToolbarOverflow label="More file actions">
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
      </ToolbarOverflow>
    </Toolbar>
  );
}
