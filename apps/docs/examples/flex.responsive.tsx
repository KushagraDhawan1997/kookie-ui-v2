import { Box, Button, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Every Flex prop takes a value per breakpoint. This row stacks in a
// narrow container and becomes a row from the `md` breakpoint. The
// breakpoints measure the nearest Box with `container`.
export default function Example() {
  return (
    <Box container>
      <Flex
        direction={{ initial: "column", md: "row" }}
        align={{ initial: "stretch", md: "center" }}
        justify="space-between"
        gap={{ initial: "4", md: "6" }}
      >
        <Stack gap="1">
          <Heading size="6">Upgrade to Team</Heading>
          <Text emphasis="medium">Shared projects, roles and single sign-on.</Text>
        </Stack>
        <Button emphasis="loud">Start free trial</Button>
      </Flex>
    </Box>
  );
}
