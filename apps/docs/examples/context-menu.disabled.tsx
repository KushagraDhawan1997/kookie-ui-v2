import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  Surface,
  Text,
} from "@kookie-ui/react";

// A disabled row stays in the menu and a screen reader still announces
// it. It shows an action exists but is not available right now.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the shared document
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem>Open</MenuItem>
        <MenuItem>Copy link</MenuItem>
        <MenuItem disabled>Rename</MenuItem>
        <MenuItem disabled tone="destructive">
          Delete
        </MenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
