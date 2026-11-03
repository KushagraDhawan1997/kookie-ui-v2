import { HugeiconsIcon } from "@hugeicons/react";
import { CopyPlusIcon, Delete02Icon, Download01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const ACTIONS = [
  { label: "Share", side: "top", glyph: Share08Icon },
  { label: "Download", side: "right", glyph: Download01Icon },
  { label: "Duplicate", side: "bottom", glyph: CopyPlusIcon },
  { label: "Delete", side: "left", glyph: Delete02Icon },
] as const;

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="4">
        {ACTIONS.map(({ label, side, glyph }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Button iconOnly aria-label={label}>
                  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
                </Button>
              }
            />
            <TooltipContent side={side}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </Flex>
    </TooltipProvider>
  );
}
