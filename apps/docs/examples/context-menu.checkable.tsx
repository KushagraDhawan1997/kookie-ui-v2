import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuCheckboxItem,
  MenuGroup,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  Surface,
  Text,
} from "@kookie-ui/react";

// A checkbox row turns one option on or off. A radio group picks one
// option from several. Both keep the menu open, so a person can change
// several settings in one visit.
export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Surface size="3" style={{ minBlockSize: "160px", display: "grid", placeItems: "center" }}>
          <Text size="2" emphasis="medium">
            Right-click the file list
          </Text>
        </Surface>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <MenuGroup>
          <MenuLabel>Show</MenuLabel>
          <MenuCheckboxItem defaultChecked>File extensions</MenuCheckboxItem>
          <MenuCheckboxItem>Hidden files</MenuCheckboxItem>
        </MenuGroup>
        <MenuRadioGroup defaultValue="name">
          <MenuLabel>Sort by</MenuLabel>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="modified">Date modified</MenuRadioItem>
          <MenuRadioItem value="size">Size</MenuRadioItem>
        </MenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
