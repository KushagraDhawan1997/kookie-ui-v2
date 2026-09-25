import { Box, Button, Card, Grid, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Name the regions once with `areas`, then place each child with `gridArea`.
// The source order stays the reading order, whatever the layout draws.
export default function Example() {
  return (
    <Grid gap="4" columns="12rem minmax(0, 1fr)" areas={`"header header" "nav main"`}>
      <Box gridArea="header">
        <Heading size="6" render={<h2 />}>
          Workspace settings
        </Heading>
      </Box>
      <Box gridArea="nav">
        <Stack gap="1" align="flex-start">
          <Button emphasis="quiet">General</Button>
          <Button emphasis="quiet">Members</Button>
          <Button emphasis="quiet">Billing</Button>
        </Stack>
      </Box>
      <Box gridArea="main">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              General
            </Heading>
            <Text size="3" emphasis="medium">
              The name and the address of this workspace.
            </Text>
          </Stack>
        </Card>
      </Box>
    </Grid>
  );
}
