import { Code, Kbd, Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Text size="3" render={<p />}>
        Set <Code>DATABASE_URL</Code> in your environment before you run the migration.
      </Text>
      <Text size="3" render={<p />}>
        Press <Kbd>⌘K</Kbd> to search files, people and settings.
      </Text>
      <Text size="3" render={<p />}>
        Read the <Link href="#limits">rate limits</Link> before you move to production.
      </Text>
    </Stack>
  );
}
