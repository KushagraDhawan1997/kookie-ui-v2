import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import { Flex, Toggle, ToggleGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ToggleGroup aria-label="Text style" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Toggle value="bold" iconOnly aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
      <Toggle value="italic" iconOnly aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
      <Toggle value="underline" iconOnly aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
