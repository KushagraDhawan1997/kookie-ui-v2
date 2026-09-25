import { Stack, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

export default function Example() {
  return (
    <Stack gap="3">
      {sizes.map((size) => (
        <Text key={size} size={size}>
          Size {size}: Invoices
        </Text>
      ))}
    </Stack>
  );
}
