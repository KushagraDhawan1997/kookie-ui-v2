import { Checkbox, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// A placeholder is not a label, and the checkbox has nothing connecting it to its words.
export default function App() {
  return (
    <Stack gap="5">
      <TextField placeholder="Name" />
      <Checkbox />
    </Stack>
  );
}
