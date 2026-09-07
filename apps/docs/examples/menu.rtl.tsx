import {
  Box,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@kookie-ui/react";

// A menu reads direction off its trigger — the one in-flow node
// it owns — so the panel anchors from the other edge and the
// submenu opens to the left, its chevron turned to match.
export default function Example() {
  return (
    <Box dir="rtl">
      <Menu>
        <MenuTrigger render={<Button>Actions</Button>} />
        <MenuContent>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem>Rename</MenuItem>
          <MenuSub>
            <MenuSubTrigger>Export as</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>PNG</MenuItem>
              <MenuItem>SVG</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </MenuContent>
      </Menu>
    </Box>
  );
}
