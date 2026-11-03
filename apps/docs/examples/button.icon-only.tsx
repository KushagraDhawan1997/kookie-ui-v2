import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon, Settings02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="2" align="center">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Edit file">
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Edit file</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Share file">
              <HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Share file</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="File settings">
              <HugeiconsIcon icon={Settings02Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>File settings</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly tone="destructive" aria-label="Delete file">
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Delete file</TooltipContent>
      </Tooltip>
    </Flex>
  );
}
