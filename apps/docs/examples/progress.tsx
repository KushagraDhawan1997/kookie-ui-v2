import { Progress, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="4">
      <Progress value={35} aria-label="Thirty-five percent" />
      <Progress value={85} aria-label="Eighty-five percent" />
      <Progress value={null} aria-label="Loading" />
    </Stack>
  );
}
