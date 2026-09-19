import { Heading, Stack, Text } from "@kookie-ui/react";

// `render` sets the outline level and `size` sets the look. Here an `h1`
// sits at step 7, and an `h2` below it sits at step 4.
export default function Example() {
  return (
    <Stack gap="4">
      <Heading size="7" render={<h1 />}>
        Project settings
      </Heading>
      <Stack gap="1">
        <Heading size="4" render={<h2 />}>
          Deploy branch
        </Heading>
        <Text size="3" emphasis="medium">
          Pushes to this branch go to production.
        </Text>
      </Stack>
    </Stack>
  );
}
