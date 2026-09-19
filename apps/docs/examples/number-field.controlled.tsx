"use client";

import * as React from "react";
import { Field, FieldLabel, NumberField, Stack, Text } from "@kookie-ui/react";

const PRICE_PER_SEAT = 12;

export default function Example() {
  const [seats, setSeats] = React.useState<number | null>(5);
  const total = (seats ?? 0) * PRICE_PER_SEAT;

  return (
    <Stack gap="3" style={{ maxWidth: "16rem" }}>
      <Field>
        <FieldLabel>Seats</FieldLabel>
        <NumberField value={seats} onValueChange={(value) => setSeats(value)} min={1} max={200} />
      </Field>
      <Text size="2" emphasis="medium">
        {seats === null ? "Enter a number of seats." : `$${total} per month`}
      </Text>
    </Stack>
  );
}
