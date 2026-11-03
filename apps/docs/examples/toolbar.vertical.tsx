import { HugeiconsIcon } from "@hugeicons/react";
import {
  Comment01Icon,
  Image01Icon,
  Link01Icon,
  TextFontIcon,
} from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Image01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar orientation="vertical" aria-label="Insert">
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton iconOnly aria-label="Format text">
              {icon(TextFontIcon)}
            </ToolbarButton>
          }
        />
        <TooltipContent>Format text</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton iconOnly aria-label="Insert image">
              {icon(Image01Icon)}
            </ToolbarButton>
          }
        />
        <TooltipContent>Insert image</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton iconOnly aria-label="Insert link">
              {icon(Link01Icon)}
            </ToolbarButton>
          }
        />
        <TooltipContent>Insert link</TooltipContent>
      </Tooltip>
      <ToolbarSeparator />
      <Tooltip>
        <TooltipTrigger
          render={
            <ToolbarButton iconOnly aria-label="Add comment">
              {icon(Comment01Icon)}
            </ToolbarButton>
          }
        />
        <TooltipContent>Add comment</TooltipContent>
      </Tooltip>
    </Toolbar>
  );
}
