import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  ButtonGroup,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ButtonGroup aria-label="Text style">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="Bold">
              <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="Italic">
              <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly aria-label="Underline">
              <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          }
        />
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
}
