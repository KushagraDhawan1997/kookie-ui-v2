import { Avatar, Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger, Separator } from "@kookie-ui/react";

// An avatar does not respond to a press. For an account menu, put the avatar in an icon-only
// Button. The avatar fills the button, and the button carries the accessible name.
export default function Example() {
  return (
    <Flex>
      <Menu>
        <MenuTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Account menu for Shruti Bhatia">
              <Avatar src="/backdrop.jpg" fallback="SB" />
            </Button>
          }
        />
        <MenuContent>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
          <Separator />
          <MenuItem>Sign out</MenuItem>
        </MenuContent>
      </Menu>
    </Flex>
  );
}
