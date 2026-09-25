import { Box, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Use `render` to give a Box the element the document needs, such as a `<section>` or a
// `<nav>`. The Box props apply to that element, and no wrapper is added.
export default function Example() {
  return (
    <Box render={<section aria-labelledby="usage-title" />} p="2" style={{ maxWidth: "28rem" }}>
      <Stack gap="2">
        <Heading size="5" id="usage-title">
          Usage this month
        </Heading>
        <Text emphasis="medium">You have used 62% of the build minutes on your plan.</Text>
      </Stack>
    </Box>
  );
}
