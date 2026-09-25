import { Box, Button, Flex, Separator, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A divider with a word in it is two Separators and a Text in a row. Each Separator sits
// in a Box that grows, so the two lines share the space left over.
export default function Example() {
  return (
    <Stack gap="4" maxWidth="22rem">
      <Button emphasis="medium">Continue with Google</Button>
      <Flex gap="3" align="center">
        <Box flexGrow="1">
          <Separator />
        </Box>
        <Text size="2" emphasis="medium">
          or
        </Text>
        <Box flexGrow="1">
          <Separator />
        </Box>
      </Flex>
      <Button emphasis="loud">Continue with email</Button>
    </Stack>
  );
}
