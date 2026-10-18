import { Card, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A column at gap 3 inside a column at gap 4: same axis, one step apart, so it still fails.
export default function App() {
  return (
    <Card>
      <Stack gap="4">
        <Text>Project title</Text>
        <Stack gap="3">
          <Text>Owner</Text>
          <Text>Updated 2d</Text>
        </Stack>
        <Text>Status</Text>
      </Stack>
    </Card>
  );
}
