import { MenuItem, SplitButton } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <SplitButton
      emphasis="loud"
      menuLabel="More merge options"
      menu={
        <>
          <MenuItem>Squash and merge</MenuItem>
          <MenuItem>Rebase and merge</MenuItem>
        </>
      }
    >
      Merge
    </SplitButton>
  );
}
