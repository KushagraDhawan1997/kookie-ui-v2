import { HugeiconsIcon } from "@hugeicons/react";
import {
  Redo02Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import {
  Flex,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
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
    <Toolbar aria-label="Editor tools" style={{ minWidth: "30rem" }}>
      <ToolbarTitle>Release notes</ToolbarTitle>
      <Flex align="center" gap="2">
        <Tooltip>
          <TooltipTrigger
            render={
              <ToolbarButton iconOnly aria-label="Undo">
                {icon(Undo02Icon)}
              </ToolbarButton>
            }
          />
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <ToolbarButton iconOnly aria-label="Redo">
                {icon(Redo02Icon)}
              </ToolbarButton>
            }
          />
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>
        <ToolbarSeparator />
        <ToolbarGroup>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Bold">
                  {icon(TextBoldIcon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Italic">
                  {icon(TextItalicIcon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <ToolbarButton iconOnly aria-label="Underline">
                  {icon(TextUnderlineIcon)}
                </ToolbarButton>
              }
            />
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
