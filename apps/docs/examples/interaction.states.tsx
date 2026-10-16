import { Button, Flex, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// Point at and press each button to see hover and press at three levels of loudness. Press Tab
// to move the focus ring, and click in the field to see its ring while you type.
export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "18rem" }}>
      <Flex gap="3" align="center" wrap="wrap">
        <Button emphasis="loud">Save</Button>
        <Button emphasis="medium">Preview</Button>
        <Button emphasis="quiet">Cancel</Button>
        <Button emphasis="loud" disabled>
          Publish
        </Button>
      </Flex>
      <TextField placeholder="Project name" aria-label="Project name" />
    </Stack>
  );
}
