import { HugeiconsIcon } from "@hugeicons/react";
import {
  Comment01Icon,
  Image01Icon,
  Link01Icon,
  TextBoldIcon,
} from "@hugeicons/core-free-icons";
import { Toolbar, ToolbarButton, ToolbarSeparator, iconStroke } from "@kookie-ui/react";

const icon = (glyph: typeof Image01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar orientation="vertical" aria-label="Insert">
      <ToolbarButton iconOnly aria-label="Format text">
        {icon(TextBoldIcon)}
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Insert image">
        {icon(Image01Icon)}
      </ToolbarButton>
      <ToolbarButton iconOnly aria-label="Insert link">
        {icon(Link01Icon)}
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton iconOnly aria-label="Add comment">
        {icon(Comment01Icon)}
      </ToolbarButton>
    </Toolbar>
  );
}
