import { Box, Button, Grid, Stack, Text } from "@kookie-ui/react";

const actions = ["New project", "Invite members", "Connect a repository", "Open billing"];

// Responsive values follow the nearest Box marked `container`. This panel is
// narrow, so the grid stays at one column even on a wide window.
export default function Example() {
  return (
    <Box container width="18rem">
      <Stack gap="3">
        <Text size="2" emphasis="medium">
          Quick actions
        </Text>
        <Grid gap="2" columns={{ initial: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}>
          {actions.map((action) => (
            <Button key={action}>{action}</Button>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
