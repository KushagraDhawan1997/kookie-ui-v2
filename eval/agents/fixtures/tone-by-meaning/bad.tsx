import { Notice, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Colours chosen for how they look, not what they mean.
export default function App() {
  const ok = true;
  return (
    <Stack gap="3">
      <Notice tone="orange">The projects could not be loaded.</Notice>
      <Text tone={ok ? "green" : "destructive"}>Saved</Text>
    </Stack>
  );
}
