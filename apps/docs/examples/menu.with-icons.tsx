import { HugeiconsIcon } from "@hugeicons/react";
import {
  Archive01Icon,
  Copy01Icon,
  Delete02Icon,
  Link01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Put an icon in `leading` and a shortcut in `trailing`. A row without an icon
// still lines up, because the leading column is always kept.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Project</Button>} />
      <MenuContent>
        <MenuItem leading={icon(PencilEdit02Icon)} trailing={<Kbd>⌘R</Kbd>}>
          Rename
        </MenuItem>
        <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘D</Kbd>}>
          Duplicate
        </MenuItem>
        <MenuItem leading={icon(Link01Icon)}>Copy link</MenuItem>
        <MenuItem>Move to folder…</MenuItem>
        <Separator />
        <MenuItem leading={icon(Archive01Icon)}>Archive</MenuItem>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
