import { Box, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A frame hand-built from boxes.
export default function App() {
  return (
    <Flex>
      <Box width="240px"><Text>Overview</Text></Box>
      <Stack gap="4"><Heading size="8">Overview</Heading></Stack>
    </Flex>
  );
}
