import { Flex, MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <SplitButton
        tone="neutral"
        menuLabel="More archive options"
        menu={
          <>
            <MenuItem>Archive and notify members</MenuItem>
            <MenuItem>Archive quietly</MenuItem>
          </>
        }
      >
        Archive project
      </SplitButton>
      <SplitButton
        tone="destructive"
        menuLabel="More delete options"
        menu={
          <>
            <MenuItem tone="destructive">Delete all versions</MenuItem>
            <MenuItem tone="destructive">Delete and block sender</MenuItem>
          </>
        }
      >
        Delete file
      </SplitButton>
    </Flex>
  );
}
