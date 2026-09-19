import { HugeiconsIcon } from "@hugeicons/react";
import { GitMergeIcon } from "@hugeicons/core-free-icons";
import { iconStroke, MenuItem, SplitButton } from "@kookie-ui/react";

export default function Example() {
  return (
    <SplitButton
      emphasis="loud"
      leading={<HugeiconsIcon icon={GitMergeIcon} strokeWidth={iconStroke} aria-hidden />}
      menuLabel="More merge options"
      menu={
        <>
          <MenuItem>Squash and merge</MenuItem>
          <MenuItem>Rebase and merge</MenuItem>
        </>
      }
    >
      Merge pull request
    </SplitButton>
  );
}
