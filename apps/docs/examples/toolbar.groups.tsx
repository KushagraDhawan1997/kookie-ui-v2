import { HugeiconsIcon } from "@hugeicons/react";
import {
  Redo02Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import {
  Flex,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Undo02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="Editor tools" style={{ minWidth: "30rem" }}>
      <ToolbarTitle>Release notes</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton iconOnly aria-label="Undo">
          {icon(Undo02Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Redo">
          {icon(Redo02Icon)}
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarButton iconOnly aria-label="Bold">
            {icon(TextBoldIcon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Italic">
            {icon(TextItalicIcon)}
          </ToolbarButton>
          <ToolbarButton iconOnly aria-label="Underline">
            {icon(TextUnderlineIcon)}
          </ToolbarButton>
        </ToolbarGroup>
      </Flex>
    </Toolbar>
  );
}
