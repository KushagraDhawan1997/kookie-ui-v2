import { Button, Kbd, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";

// Put the shortcut in the row's `trailing` slot. The key takes the row's size,
// and the words stay the part that a person reads first.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Edit</Button>} />
      <MenuContent>
        <MenuItem trailing={<Kbd>⌘Z</Kbd>}>Undo</MenuItem>
        <MenuItem trailing={<Kbd>⇧⌘Z</Kbd>}>Redo</MenuItem>
        <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
      </MenuContent>
    </Menu>
  );
}
