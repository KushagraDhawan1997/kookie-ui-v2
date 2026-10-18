import { Card, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A row's gap inside a column runs the other way, so it does not compete with the column's gap.
export default function App() {
  return (
    <Card>
      <Stack gap="4">
        <Text>Project title</Text>
        <Flex gap="3">
          <Text>Owner</Text>
          <Text>Updated 2d</Text>
        </Flex>
        <Text>Status</Text>
      </Stack>
    </Card>
  );
}
