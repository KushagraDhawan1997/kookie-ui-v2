import { Box, Separator, Stack, Surface, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Surface size="2" style={{ maxWidth: "24rem" }}>
      <Stack gap="3">
        <Text size="3" weight="medium">
          Release notes
        </Text>
        <Box mx="bleed">
          <Separator />
        </Box>
        <Text size="2" emphasis="medium">
          Version 4.2 adds shared folders and faster search.
        </Text>
      </Stack>
    </Surface>
  );
}
