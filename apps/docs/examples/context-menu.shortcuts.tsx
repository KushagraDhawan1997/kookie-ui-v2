import { HugeiconsIcon } from "@hugeicons/react";
import { ClipboardIcon, Copy01Icon, Scissor01Icon } from "@hugeicons/core-free-icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Kbd,
  MenuItem,
  Surface,
  Text,
  iconStroke,
} from "@kookie-ui/react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// `leading` holds an icon and `trailing` holds the shortcut that also runs
// the row. Every label starts on the same line, with or without an icon.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the selected text
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem leading={icon(Scissor01Icon)} trailing={<Kbd>⌘X</Kbd>}>
          Cut
        </MenuItem>
        <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘C</Kbd>}>
          Copy
        </MenuItem>
        <MenuItem leading={icon(ClipboardIcon)} trailing={<Kbd>⌘V</Kbd>}>
          Paste
        </MenuItem>
        <MenuItem trailing={<Kbd>⌘A</Kbd>}>Select all</MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
