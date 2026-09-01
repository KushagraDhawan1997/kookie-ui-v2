import { Button, Stack } from "@kookie-ui/react";

export default function Example({
  gap = "3",
  align = "stretch",
}: {
  gap?: string;
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
}) {
  return (
    <Stack gap={gap} align={align}>
      <Button size="2">First</Button>
      <Button size="2">Second</Button>
    </Stack>
  );
}
