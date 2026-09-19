import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import { Button, ButtonGroup, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <ButtonGroup aria-label="Text style">
      <Button iconOnly aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </ButtonGroup>
  );
}
