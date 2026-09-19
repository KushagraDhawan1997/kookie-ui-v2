import { Stack, TextField } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <TextField size="1" placeholder="Search files" aria-label="Search files, size 1" />
      <TextField size="2" placeholder="Search files" aria-label="Search files, size 2" />
      <TextField size="3" placeholder="Search files" aria-label="Search files, size 3" />
      <TextField size="4" placeholder="Search files" aria-label="Search files, size 4" />
    </Stack>
  );
}
