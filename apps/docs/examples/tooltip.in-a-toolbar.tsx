import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kookie-ui/react";

const TOOLS = [
  { label: "Bold", shortcut: "⌘B", glyph: TextBoldIcon },
  { label: "Italic", shortcut: "⌘I", glyph: TextItalicIcon },
  { label: "Underline", shortcut: "⌘U", glyph: TextUnderlineIcon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Toolbar aria-label="Text style">
        <ToolbarGroup>
          {TOOLS.map(({ label, shortcut, glyph }) => (
            <Tooltip key={label}>
              <TooltipTrigger
                render={
                  <ToolbarButton iconOnly aria-label={label}>
                    <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                  </ToolbarButton>
                }
              />
              <TooltipContent>{`${label} ${shortcut}`}</TooltipContent>
            </Tooltip>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
