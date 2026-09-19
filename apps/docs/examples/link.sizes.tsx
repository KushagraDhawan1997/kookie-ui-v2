import { Link, Stack, Text } from "@kookie-ui/react";

// Inside a sentence, leave `size` unset: the link matches the text around it.
// Set `size` only when the link stands on its own line.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2" render={<p />}>
        Read the <Link href="#terms">terms of service</Link> before you invite guests.
      </Text>
      <Text size="4" render={<p />}>
        Read the <Link href="#terms">terms of service</Link> before you invite guests.
      </Text>
      <Link href="#help" size="3">
        Contact support
      </Link>
    </Stack>
  );
}
