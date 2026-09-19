"use client";

import * as React from "react";
import { Field, FieldDescription, FieldLabel, TextArea } from "@kookie-ui/react";

const LIMIT = 160;

export default function Example() {
  const [bio, setBio] = React.useState("Product designer at Northwind Studio.");

  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Bio</FieldLabel>
      <TextArea
        rows={3}
        value={bio}
        maxLength={LIMIT}
        onChange={(event) => setBio(event.target.value)}
      />
      <FieldDescription>
        {LIMIT - bio.length} of {LIMIT} characters left.
      </FieldDescription>
    </Field>
  );
}
