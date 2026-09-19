"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Button, Field, FieldLabel, TextField, iconStroke } from "@kookie-ui/react";

export default function Example() {
  const [visible, setVisible] = React.useState(false);

  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Password</FieldLabel>
      <TextField
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        defaultValue="correct-horse-battery"
        trailing={
          <Button
            iconOnly
            emphasis="quiet"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            <HugeiconsIcon
              icon={visible ? ViewOffSlashIcon : ViewIcon}
              strokeWidth={iconStroke}
              aria-hidden
            />
          </Button>
        }
      />
    </Field>
  );
}
