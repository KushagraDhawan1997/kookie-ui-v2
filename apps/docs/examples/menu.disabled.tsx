import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "@kookie-ui/react";

// A disabled row stays in the list and stays announced: it is a
// thing you cannot do right now, which is not the same as a thing
// that is not there. It takes no highlight.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Actions</Button>} />
      <MenuContent>
        <MenuItem>Duplicate</MenuItem>
        <MenuItem disabled>Move to trash</MenuItem>
        <MenuItem tone="destructive">Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}
