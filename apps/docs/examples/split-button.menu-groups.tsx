import { MenuGroup, MenuItem, MenuLabel, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SplitButton
      emphasis="medium"
      menuLabel="More share options"
      menu={
        <>
          <MenuGroup>
            <MenuLabel>Share with</MenuLabel>
            <MenuItem>Everyone in the workspace</MenuItem>
            <MenuItem>Specific people</MenuItem>
          </MenuGroup>
          <MenuGroup>
            <MenuLabel>Link</MenuLabel>
            <MenuItem>Copy view-only link</MenuItem>
            <MenuItem tone="destructive">Turn off link sharing</MenuItem>
          </MenuGroup>
        </>
      }
    >
      Share
    </SplitButton>
  );
}
