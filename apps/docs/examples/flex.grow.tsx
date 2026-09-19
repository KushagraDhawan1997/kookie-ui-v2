import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Box, Button, Flex, TextField, iconStroke } from "@kookie-ui/react";

// Wrap the child that should take the free space in a Box with
// `flexGrow="1"`. The other children keep their own width.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Box flexGrow="1">
        <TextField
          aria-label="Search projects"
          placeholder="Search projects"
          leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        />
      </Box>
      <Button emphasis="medium">Filters</Button>
      <Button emphasis="loud">New project</Button>
    </Flex>
  );
}
