import { Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A column of links that are not inside a sentence. Give them a size, and
// a label above them in the muted ink colour.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2" emphasis="medium">
        Resources
      </Text>
      <Stack gap="2" align="flex-start">
        <Link href="#docs" size="3">
          Documentation
        </Link>
        <Link href="#status" size="3">
          System status
        </Link>
        <Link href="#support" size="3">
          Contact support
        </Link>
      </Stack>
    </Stack>
  );
}
