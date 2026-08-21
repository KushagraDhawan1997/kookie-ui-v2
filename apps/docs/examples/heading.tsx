import { Heading, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="2">
      <Heading size="7" render={<h3 />}>A section</Heading>
      <Heading size="4" render={<h4 />}>A subsection</Heading>
    </Stack>
  );
}
