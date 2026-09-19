import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kookie-ui/react";

export default function Example() {
  return (
    <Toolbar aria-label="Project tools" style={{ minWidth: "26rem" }}>
      <ToolbarTitle>Website redesign</ToolbarTitle>
      <Flex align="center" gap="2">
        <ToolbarButton
          leading={<HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />}
          render={<a href="#share" />}
        >
          Share
        </ToolbarButton>
        <Menu>
          <MenuTrigger
            render={
              <ToolbarButton iconOnly aria-label="More project actions">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
          <MenuContent>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Move to folder</MenuItem>
            <MenuItem tone="destructive">Delete project</MenuItem>
          </MenuContent>
        </Menu>
      </Flex>
    </Toolbar>
  );
}
