"use client";

import * as React from "react";
import { Heading, SegmentedControl, SegmentedItem, Stack, Text } from "@kookie-ui/react";

const PRICES = { monthly: "$12 per month", yearly: "$120 per year" } as const;
type Period = keyof typeof PRICES;

// Hold the value in your own state when the choice changes something else on the screen.
export default function Example() {
  const [period, setPeriod] = React.useState<Period>("monthly");
  return (
    <Stack gap="4">
      <SegmentedControl
        aria-label="Billing period"
        value={period}
        onValueChange={(value) => setPeriod(value as Period)}
      >
        <SegmentedItem value="monthly">Monthly</SegmentedItem>
        <SegmentedItem value="yearly">Yearly</SegmentedItem>
      </SegmentedControl>
      <Stack gap="1">
        <Heading size="6">{PRICES[period]}</Heading>
        <Text size="2" emphasis="medium">
          Team plan, for up to 10 people.
        </Text>
      </Stack>
    </Stack>
  );
}
