import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Download01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kookie-ui/react";

const ACTIONS = [
  { label: "Share", glyph: Share08Icon },
  { label: "Download", glyph: Download01Icon },
  { label: "Delete", glyph: Delete02Icon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        {ACTIONS.map(({ label, glyph }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button iconOnly emphasis="quiet" aria-label={label}>
                  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                </Button>
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
