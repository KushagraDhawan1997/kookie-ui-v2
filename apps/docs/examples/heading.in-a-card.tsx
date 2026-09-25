import { Button, Card, Flex, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A card title uses step 6, with a short description under it at step 3.
// The action sits at the end of the same row.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "32rem" }}>
      <Flex gap="4" justify="space-between" align="flex-start">
        <Stack gap="1">
          <Heading size="6" render={<h3 />}>
            Two-step sign-in
          </Heading>
          <Text size="3" emphasis="medium">
            Ask for a code from your phone each time you sign in.
          </Text>
        </Stack>
        <Button emphasis="loud">Turn on</Button>
      </Flex>
    </Card>
  );
}
