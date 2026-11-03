import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import {
  Flex,
  Toggle,
  ToggleGroup,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ToggleGroup aria-label="Text style" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle value="bold" iconOnly aria-label="Bold">
              <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
            </Toggle>
          }
        />
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle value="italic" iconOnly aria-label="Italic">
              <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
            </Toggle>
          }
        />
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle value="underline" iconOnly aria-label="Underline">
              <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
            </Toggle>
          }
        />
        <TooltipContent>Underline</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}
