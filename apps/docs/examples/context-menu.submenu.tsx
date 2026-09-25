import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  Surface,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// A MenuSub opens a second panel beside its row. Hover the row or press
// the right arrow key to open it.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the design file
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuItem>Open</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Move to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Marketing site</MenuItem>
            <MenuItem>Mobile app</MenuItem>
            <MenuItem>Brand assets</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSub>
          <MenuSubTrigger>Export as</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>PNG</MenuItem>
            <MenuItem>SVG</MenuItem>
            <MenuItem>PDF</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
