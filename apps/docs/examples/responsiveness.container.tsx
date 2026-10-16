import { Box, Button, Flex, Surface, TextField } from "@kushagradhawan/kookie-ui-react";

// Drag the corner of the box. The row inside follows the box's width, not the window's:
// below `sm` (30rem) the field and the button stack, from `sm` up they sit in one row.
export default function Example() {
  return (
    <Box
      container
      width="36rem"
      minWidth="14rem"
      maxWidth="100%"
      style={{ resize: "horizontal", overflow: "hidden" }}
    >
      <Surface>
        <Flex direction={{ initial: "column", sm: "row" }} gap="3">
          <Box flexGrow="1">
            <TextField placeholder="Search projects" aria-label="Search projects" />
          </Box>
          <Button>Filter</Button>
        </Flex>
      </Surface>
    </Box>
  );
}
