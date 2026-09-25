import { Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

const sizes: Size[] = ["1", "2", "3", "4"];

// Set `size` on the Menu. The rows, the icons and the text inside the panel
// all take that size. Give the trigger button the same size.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap" align="center">
      {sizes.map((size) => (
        <Menu key={size} size={size}>
          <MenuTrigger render={<Button size={size}>Size {size}</Button>} />
          <MenuContent>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </Flex>
  );
}
