import { Stack, Surface, Text } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "3" }: { size?: Size }) {
  return (
    <Surface size={size} style={{ minWidth: "18rem" }}>
      <Stack gap="2">
        <Text size="3" weight="medium">
          A ground
        </Text>
        <Text size="2" emphasis="medium">
          What an object sits on. A recessed region, one step under the page, bounded by its own
          hairline.
        </Text>
      </Stack>
    </Surface>
  );
}
