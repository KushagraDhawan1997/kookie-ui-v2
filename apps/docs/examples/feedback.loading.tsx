"use client";

import * as React from "react";
import { Button } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [saving, setSaving] = React.useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Button emphasis="loud" loading={saving} onClick={save}>
      Save changes
    </Button>
  );
}
