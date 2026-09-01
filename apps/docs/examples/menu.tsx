import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  FileExportIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Kbd,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  Separator,
  iconStroke,
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the system
// draws its own chevrons at, so your set matches them. No size: the row sizes the slot's svg.
const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Menu size={size}>
      <MenuTrigger render={<Button emphasis="medium">Actions</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuLabel>File</MenuLabel>
          {/* A glyph goes in `leading`, never in the label: the checkbox and radio rows below
              put their indicator in that same slot, so every row's words start on one line
              whether it is a tick, an icon or nothing at all. */}
          <MenuItem leading={icon(Copy01Icon)} trailing={<Kbd>⌘D</Kbd>}>
            Duplicate
          </MenuItem>
          <MenuItem leading={icon(PencilEdit02Icon)}>Rename</MenuItem>
        </MenuGroup>
        <Separator />
        <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
        <MenuRadioGroup defaultValue="name">
          <MenuRadioItem value="name">Sort by name</MenuRadioItem>
          <MenuRadioItem value="date">Sort by date</MenuRadioItem>
        </MenuRadioGroup>
        <Separator />
        <MenuSub>
          <MenuSubTrigger leading={icon(FileExportIcon)}>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem leading={icon(Delete02Icon)} tone="destructive">
          Delete…
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
