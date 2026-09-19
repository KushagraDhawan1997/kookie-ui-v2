import { Spinner, Stack, Text } from "@kookie-ui/react";

// A Spinner draws in the colour of the text around it. Set a tone on the text, and the
// Spinner inside it follows.
export default function Example() {
  return (
    <Stack gap="4">
      <Text size="2">
        <Spinner /> Checking the build
      </Text>
      <Text size="2" tone="accent">
        <Spinner /> Deploying to production
      </Text>
      <Text size="2" tone="destructive">
        <Spinner /> Deleting 12 archived projects
      </Text>
    </Stack>
  );
}
