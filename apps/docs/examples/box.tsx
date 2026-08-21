import { Box, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Box p="5" style={{ background: "var(--color-track)", borderRadius: "var(--radius-surface-2)" }}>
      <Text size="2">A Box with token padding.</Text>
    </Box>
  );
}
