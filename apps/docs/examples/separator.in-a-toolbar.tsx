import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons";
import { Button, Flex, Separator, iconStroke } from "@kookie-ui/react";

const icon = (glyph: typeof TextBoldIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// A vertical Separator stretches to the height of the row it sits in. It divides one
// group of controls from the next.
export default function Example() {
  return (
    <Flex gap="2" align="stretch">
      <Button iconOnly emphasis="quiet" aria-label="Bold">
        {icon(TextBoldIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Italic">
        {icon(TextItalicIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Underline">
        {icon(TextUnderlineIcon)}
      </Button>
      <Separator orientation="vertical" />
      <Button iconOnly emphasis="quiet" aria-label="Align left">
        {icon(TextAlignLeftIcon)}
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Align centre">
        {icon(TextAlignCenterIcon)}
      </Button>
    </Flex>
  );
}
