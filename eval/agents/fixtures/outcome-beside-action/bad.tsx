import { useState } from "react";
import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";

// The result is a Notice at the top of the page, far from the button that caused it.
export default function App() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Stack gap="6">
      {saved && <Notice tone="success">Your description was saved.</Notice>}
      <Stack gap="5">
        <Stack gap="2">
          <Button loading={saving} onClick={() => { setSaving(true); setSaved(true); }}>Save description</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
