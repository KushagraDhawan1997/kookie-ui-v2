import { Box, Card, Grid, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A child spans more than one track with `gridArea`. Write `auto / span 2`:
// a bare `span 2` sets the row span, not the column span.
export default function Example() {
  return (
    <Grid gap="4" columns="repeat(3, minmax(0, 1fr))">
      <Box gridArea="auto / span 2">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              Monthly revenue
            </Heading>
            <Text size="3" emphasis="medium">
              Up 12% on last month.
            </Text>
          </Stack>
        </Card>
      </Box>
      <Card>
        <Stack gap="1">
          <Heading size="4" render={<h3 />}>
            Seats
          </Heading>
          <Text size="3" emphasis="medium">
            18 of 25 in use.
          </Text>
        </Stack>
      </Card>
      <Card>
        <Stack gap="1">
          <Heading size="4" render={<h3 />}>
            Invoices
          </Heading>
          <Text size="3" emphasis="medium">
            2 unpaid.
          </Text>
        </Stack>
      </Card>
      <Box gridArea="auto / span 2">
        <Card>
          <Stack gap="1">
            <Heading size="4" render={<h3 />}>
              Storage
            </Heading>
            <Text size="3" emphasis="medium">
              42 of 100 gigabytes used.
            </Text>
          </Stack>
        </Card>
      </Box>
    </Grid>
  );
}
