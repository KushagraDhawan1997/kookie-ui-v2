"use client";

import * as React from "react";
import { Field, FieldItem, FieldLabel, Radio, RadioGroup, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PLANS = { starter: "$0", team: "$24", business: "$96" } as const;
type Plan = keyof typeof PLANS;

export default function Example() {
  const [plan, setPlan] = React.useState<Plan>("team");

  return (
    <Stack gap="4" style={{ maxWidth: "20rem" }}>
      <Field>
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup value={plan} onValueChange={(value) => setPlan(value as Plan)}>
          <FieldItem>
            <Radio value="starter" />
            <FieldLabel>Starter</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Radio value="team" />
            <FieldLabel>Team</FieldLabel>
          </FieldItem>
          <FieldItem>
            <Radio value="business" />
            <FieldLabel>Business</FieldLabel>
          </FieldItem>
        </RadioGroup>
      </Field>
      <Text size="2" emphasis="medium">
        {PLANS[plan]} per seat each month
      </Text>
    </Stack>
  );
}
