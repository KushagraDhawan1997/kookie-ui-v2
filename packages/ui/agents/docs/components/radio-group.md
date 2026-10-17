# Radio Group

RadioGroup holds the one value chosen from a set of radios.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<RadioGroup defaultValue="yes">
  <Radio value="yes" />
  <Radio value="no" />
</RadioGroup>
```

## Overview

Use a RadioGroup around every Radio that answers the same question. The group gives the radios a shared name and holds the one chosen value, which it also sends with a form.

By default the group stacks its radios in a column, with enough space that the pressable area of one never covers the next. To lay them out differently, pass a layout to `render`, such as `render={<Flex gap="5" />}` for a row, and your layout replaces the column.

Use `defaultValue` to let the group keep track of the value, or `value` and `onValueChange` to hold it in your own state. Set `name` to send the value with a form, and `required` to stop the form from submitting until someone picks an option. `disabled` disables every Radio in the group.

Screen readers announce the group as a radio group. Give it a name by putting it in a Field with a `FieldLabel`, or by setting `aria-label`. The whole group is one tab stop, and the arrow keys move between the radios and check each one they reach.

## Use instead

- `Select` when there are many options, or there is no room to show them.

## Not supported

- Visual props — The group draws nothing of its own. It holds the value and stacks the radios, and you can pass any layout to `render` when you need a different arrangement.
- `readOnly` — HTML has no read-only radio group. To show a value that cannot change, set `disabled` and add a description that says why.

## Examples

```tsx
import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <RadioGroup defaultValue="y">
      <Flex gap="4">
        <Flex gap="2" align="center">
          <Radio size={size} value="y" id="g-y" />
          <Text size="2" render={<label htmlFor="g-y" />}>Yes</Text>
        </Flex>
        <Flex gap="2" align="center">
          <Radio size={size} value="n" id="g-n" />
          <Text size="2" render={<label htmlFor="g-n" />}>No</Text>
        </Flex>
      </Flex>
    </RadioGroup>
  );
}
```

### Radios in a row

A Flex passed to `render` lays the radios side by side. Keep the gap wide enough that the pressable area of one Radio does not reach the next.

```tsx
import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";

const PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Example() {
  return (
    <RadioGroup defaultValue="yearly" aria-label="Billing period" render={<Flex gap="5" />}>
      {PERIODS.map((period) => (
        <Flex key={period.value} gap="3" align="center" render={<label />}>
          <Radio value={period.value} />
          <Text size="2" render={<span />}>
            {period.label}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
```

### Controlled

The group uses `value` and `onValueChange`, so the price below it can change with the chosen plan. Use this when other parts of the screen depend on the choice.

```tsx
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
```

### In a form

With `name` set on the group, the chosen value is sent when the form submits. `required` stops the form from submitting until someone picks an option.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <Card style={{ maxWidth: "24rem" }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(String(new FormData(event.currentTarget).get("frequency")));
        }}
      >
        <Stack gap="5">
          <Heading size="6">Email digest</Heading>
          <Field>
            <FieldLabel>How often</FieldLabel>
            <RadioGroup name="frequency" required>
              <FieldItem>
                <Radio value="daily" />
                <FieldLabel>Every day</FieldLabel>
              </FieldItem>
              <FieldItem>
                <Radio value="weekly" />
                <FieldLabel>Every Monday</FieldLabel>
              </FieldItem>
              <FieldItem>
                <Radio value="never" />
                <FieldLabel>Never</FieldLabel>
              </FieldItem>
            </RadioGroup>
            <FieldDescription>The digest lists new comments and failed deployments.</FieldDescription>
          </Field>
          <Flex gap="3" align="center" justify="space-between">
            <Text size="2" emphasis="quiet">{sent ? `Saved: ${sent}` : "Nothing saved yet."}</Text>
            <Button type="submit" emphasis="loud">
              Save
            </Button>
          </Flex>
        </Stack>
      </form>
    </Card>
  );
}
```

### Disabled

`disabled` on the group disables every Radio at once. A description explains why, because a disabled control cannot explain itself.

```tsx
import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Data residency</FieldLabel>
      <RadioGroup defaultValue="eu" disabled>
        <FieldItem>
          <Radio value="eu" />
          <FieldLabel>European Union</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="us" />
          <FieldLabel>United States</FieldLabel>
        </FieldItem>
      </RadioGroup>
      <FieldDescription>You set this when the workspace was created.</FieldDescription>
    </Field>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.
