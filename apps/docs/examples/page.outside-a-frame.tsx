import { Box, Page, Stack, Text } from "@kookie-ui/react";

// Outside a Shell there is no band to clear, so the title draws in place and does not collapse.
// The box around the page sets the reading width.
export default function Example() {
  return (
    <Box style={{ maxWidth: "36rem" }}>
      <Page title="Release notes" description="What changed in each version of the desktop app.">
        <Stack gap="3">
          <Text size="3">
            Version 4.2 adds offline editing. Changes you make without a connection sync when you
            reconnect.
          </Text>
          <Text size="3">
            Version 4.1 moves billing settings into the workspace menu, next to members.
          </Text>
        </Stack>
      </Page>
    </Box>
  );
}
