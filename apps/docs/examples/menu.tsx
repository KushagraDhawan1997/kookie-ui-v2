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
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Menu size={size}>
      <MenuTrigger render={<Button emphasis="medium">Actions</Button>} />
      <MenuContent>
        <MenuGroup>
          <MenuLabel>File</MenuLabel>
          <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
          <MenuItem>Rename</MenuItem>
        </MenuGroup>
        <Separator />
        <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
        <MenuRadioGroup defaultValue="name">
          <MenuRadioItem value="name">Sort by name</MenuRadioItem>
          <MenuRadioItem value="date">Sort by date</MenuRadioItem>
        </MenuRadioGroup>
        <Separator />
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem tone="destructive">Delete…</MenuItem>
      </MenuContent>
    </Menu>
  );
}
