import { Notice, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  return (
    <Stack gap="3">
      <Notice tone="destructive">The projects could not be loaded. Try again in a minute.</Notice>
      <Text tone="success">Saved</Text>
    </Stack>
  );
}
