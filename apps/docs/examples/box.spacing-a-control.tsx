import { Box, Button, Stack, Text } from "@kookie-ui/react";

// A control never sets the space around itself. When one child needs more room than the gap
// gives it, wrap that child in a Box with a margin prop.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "24rem" }}>
      <Text weight="medium">Export your data</Text>
      <Text emphasis="medium">
        We email a download link when the archive is ready. Large workspaces take up to an hour.
      </Text>
      <Box mt="4">
        <Button emphasis="medium">Request export</Button>
      </Box>
    </Stack>
  );
}
