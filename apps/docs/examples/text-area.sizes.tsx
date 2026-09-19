import { Stack, TextArea } from "@kookie-ui/react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      {sizes.map((size) => (
        <TextArea key={size} size={size} rows={2} aria-label={`Notes, size ${size}`} placeholder={`Size ${size}`} />
      ))}
    </Stack>
  );
}
