import { Progress, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    /* A bar takes its container's width — the slider's sentence one component over. `flexGrow`
       says so for a flex ROW and is inert in normal flow, so a reader copying this into a page
       gets exactly what they see here. */
    <Stack gap="4" style={{ flexGrow: 1 }}>
      <Progress value={35} aria-label="Thirty-five percent" />
      <Progress value={85} aria-label="Eighty-five percent" />
      <Progress value={null} aria-label="Loading" />
    </Stack>
  );
}
