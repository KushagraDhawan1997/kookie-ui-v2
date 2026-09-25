import { Box, Button, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Any Box prop takes an object with a value per container size: `initial`, `sm`, `md` and
// `lg`. Here the layout is a column on a narrow container and a row from `md` up.
export default function Example() {
  return (
    <Box
      display="flex"
      direction={{ initial: "column", md: "row" }}
      align={{ initial: "stretch", md: "center" }}
      justify="space-between"
      gap={{ initial: "3", md: "5" }}
      style={{ minWidth: "18rem" }}
    >
      <Stack gap="1">
        <Text weight="medium">Two-factor authentication</Text>
        <Text size="2" emphasis="medium">
          Ask for a code from your phone at every sign-in.
        </Text>
      </Stack>
      <Button emphasis="medium">Turn on</Button>
    </Box>
  );
}
