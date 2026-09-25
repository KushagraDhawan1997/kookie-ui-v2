import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@kushagradhawan/kookie-ui-react";

// Use a submenu for a related set of choices that would make the main list long.
// The submenu opens on hover, on a press, or with the arrow key.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>File</Button>} />
      <MenuContent>
        <MenuItem>New file</MenuItem>
        <MenuItem>Open…</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PDF</MenuItem>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Share with</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Shruti Bhatia</MenuItem>
            <MenuItem>Everyone in the workspace</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
}
