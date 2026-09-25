import { Code, Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="5">
        Configure <Code>kookie.config.ts</Code>
      </Heading>
      <Text size="3">
        Set <Code>appearance</Code> on the root Theme.
      </Text>
      <Text size="2" emphasis="medium">
        The default value is <Code>inherit</Code>.
      </Text>
    </Stack>
  );
}
