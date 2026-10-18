import { useState } from "react";
import { Button, Spinner } from "@kushagradhawan/kookie-ui-react";

// The label is swapped for "Saving..." and a second spinner is put inside the button.
export default function App() {
  const [saving, setSaving] = useState(false);
  return (
    <Button loading={saving} onClick={() => setSaving(true)}>
      {saving && <Spinner />}
      {saving ? "Saving..." : "Save description"}
    </Button>
  );
}
