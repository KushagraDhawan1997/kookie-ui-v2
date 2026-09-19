import { Heading, Stack } from "@kookie-ui/react";

// `tone` gives the words a meaning, and the theme picks the colour.
// Use it sparingly: most headings stay neutral.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="5" render={<h3 />}>
        Storage
      </Heading>
      <Heading size="5" tone="warning" render={<h3 />}>
        Storage almost full
      </Heading>
      <Heading size="5" tone="destructive" render={<h3 />}>
        Delete this workspace
      </Heading>
    </Stack>
  );
}
