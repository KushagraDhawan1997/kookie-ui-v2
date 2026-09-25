import { Code, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3">
      <Text size="3">
        Run <Code>pnpm install</Code> to add the package.
      </Text>
      <Text size="3">
        The key starts with <Code emphasis="medium">sk_live_</Code>.
      </Text>
      <Text size="3">
        The old endpoint <Code emphasis="quiet">/v1/projects</Code> is no longer in use.
      </Text>
    </Stack>
  );
}
