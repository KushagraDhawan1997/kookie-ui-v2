import { Card, Link, Stack, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="2">
        <Text size="2" weight="medium">Storage</Text>
        <Text size="3" emphasis="medium" render={<p />}>
          You are using 42 of 100 gigabytes. See{" "}
          <Link href="#plans">the plans on this workspace</Link> before the renewal.
        </Text>
      </Stack>
    </Card>
  );
}
