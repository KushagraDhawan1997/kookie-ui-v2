import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Flex,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof TextBoldIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A vertical Separator stretches to the height of the row it sits in. It divides one
// group of controls from the next.
export default function Example() {
  return (
    <Flex gap="2" align="stretch">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Bold">
              {icon(TextBoldIcon)}
            </Button>
          }
        />
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Italic">
              {icon(TextItalicIcon)}
            </Button>
          }
        />
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Underline">
              {icon(TextUnderlineIcon)}
            </Button>
          }
        />
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>
      <Separator orientation="vertical" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Align left">
              {icon(TextAlignLeftIcon)}
            </Button>
          }
        />
        <TooltipContent>Align left</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Align centre">
              {icon(TextAlignCenterIcon)}
            </Button>
          }
        />
        <TooltipContent>Align centre</TooltipContent>
      </Tooltip>
    </Flex>
  );
}
