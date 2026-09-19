import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuGroup,
  MenuItem,
  MenuLabel,
  Surface,
  Text,
} from "@kookie-ui/react";

// Put related rows in a MenuGroup with a MenuLabel. The label names the
// group for a screen reader, and the keyboard skips it.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the project card
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuGroup>
          <MenuLabel>Project</MenuLabel>
          <MenuItem>Open</MenuItem>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuLabel>Share</MenuLabel>
          <MenuItem>Copy link</MenuItem>
          <MenuItem>Invite people</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem tone="destructive">Delete project</MenuItem>
        </MenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
