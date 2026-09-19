import { HugeiconsIcon } from "@hugeicons/react";
import { Redo02Icon, Undo02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconStroke,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <TooltipProvider>
      <Flex gap="2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button iconOnly aria-label="Undo" aria-keyshortcuts="Meta+Z">
                <HugeiconsIcon icon={Undo02Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Undo ⌘Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button iconOnly aria-label="Redo" aria-keyshortcuts="Meta+Shift+Z">
                <HugeiconsIcon icon={Redo02Icon} strokeWidth={iconStroke} aria-hidden />
              </Button>
            }
          />
          <TooltipContent>Redo ⇧⌘Z</TooltipContent>
        </Tooltip>
      </Flex>
    </TooltipProvider>
  );
}
