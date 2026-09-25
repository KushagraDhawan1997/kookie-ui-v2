import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

// `tone` colours the words and leaves the rule neutral. When the coloured bar must carry the
// meaning, such as a warning, use a Notice instead.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Blockquote tone="accent">
        Invite your team before you set up billing, so every seat is counted once.
      </Blockquote>
      <Blockquote tone="destructive">
        Deleting a workspace also deletes its audit log.
      </Blockquote>
    </Stack>
  );
}
