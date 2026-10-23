import * as React from "react";
import { Button, Flex, Kbd, Menu, MenuContent, MenuGroup, MenuItem, MenuLabel, MenuTrigger, Separator } from "@kushagradhawan/kookie-ui-react";
import { useScene, useVersion } from "../harness";

/** A menu of 300 items in 10 groups, opened and walked with the keyboard. */
export function MenuScene() {
  const [version, rerender] = useVersion();
  const api = React.useMemo(() => ({ rerender }), [rerender]);
  useScene(api);

  return (
    <Flex p="5">
      <Menu>
        <MenuTrigger render={<Button data-bench="open">Open menu {version}</Button>} />
        <MenuContent>
          {Array.from({ length: 10 }, (_, g) => (
            <React.Fragment key={g}>
              <MenuGroup>
                <MenuLabel>Group {g}</MenuLabel>
                {Array.from({ length: 30 }, (_, i) => (
                  <MenuItem key={i} trailing={i < 9 ? <Kbd>⌘{i + 1}</Kbd> : undefined}>
                    Item {g * 30 + i + version}
                  </MenuItem>
                ))}
              </MenuGroup>
              <Separator />
            </React.Fragment>
          ))}
        </MenuContent>
      </Menu>
    </Flex>
  );
}
