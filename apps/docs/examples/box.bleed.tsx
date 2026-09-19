import { Box, Card, Stack, Text } from "@kookie-ui/react";

// The value `bleed` on a margin prop cancels the padding of the surrounding Card. Here the
// picture reaches the top and side edges, and the Card clips it to its corners.
export default function Example() {
  return (
    <Card style={{ maxWidth: "20rem" }}>
      <Stack gap="4">
        <Box mt="bleed" mx="bleed" height="10rem" render={<img src="/backdrop.jpg" alt="" />} style={{ objectFit: "cover" }} />
        <Stack gap="1">
          <Text weight="medium">Office move</Text>
          <Text size="2" emphasis="medium">
            Floor plans and seating for the new studio.
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
