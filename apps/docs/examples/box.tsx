import { Box, Text } from "@kookie-ui/react";

export default function Example({ p = "5" }: { p?: string }) {
  return (
    <Box p={p} style={{ background: "var(--color-track)", borderRadius: "var(--radius-surface-2)" }}>
      <Text size="2">A Box with token padding.</Text>
    </Box>
  );
}
