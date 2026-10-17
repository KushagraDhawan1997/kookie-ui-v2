import { useState } from "react";
import { Button } from "@kushagradhawan/kookie-ui-react";

// The button greys out while saving; nothing says the work has started.
export default function App() {
  const [saving, setSaving] = useState(false);
  return (
    <Button disabled={saving} onClick={() => setSaving(true)}>
      Save description
    </Button>
  );
}
