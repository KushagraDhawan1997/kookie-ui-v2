import { Avatar, Button, Flex, TextField } from "@kushagradhawan/kookie-ui-react";

// At sizes 1 to 4 an avatar is as tall as a control at the same size, so it lines up in a
// row of buttons and fields.
export default function Example() {
  return (
    <Flex gap="2" align="center" style={{ minWidth: "24rem" }}>
      <Avatar fallback="SB" />
      <TextField aria-label="Comment" placeholder="Add a comment…" />
      <Button emphasis="medium">Post</Button>
    </Flex>
  );
}
