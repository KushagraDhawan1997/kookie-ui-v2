import { Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";

// `side` sets the edge of the trigger the panel opens from, and `align` sets
// where it lines up on that edge. The panel moves if there is no room.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      <Menu>
        <MenuTrigger render={<Button>Below, start</Button>} />
        <MenuContent side="bottom" align="start">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button>Below, end</Button>} />
        <MenuContent side="bottom" align="end">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button>Above</Button>} />
        <MenuContent side="top">
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
    </Flex>
  );
}
