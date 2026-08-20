import { Stack, TextField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <TextField placeholder="Search" aria-label="Search" />
      <TextField placeholder="Invalid" aria-label="Invalid" aria-invalid="true" />
    </Stack>
  );
}
