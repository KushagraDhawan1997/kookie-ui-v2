"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldDescription,
  FieldLabel,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

const PLANS = ["Hobby", "Pro", "Team", "Enterprise"];
const OWNERS = ["Shruti Bhatia", "Billing team", "Platform team"];

// `disabled` turns the whole control off. `readOnly` keeps the value
// visible and submitted, but the list does not open. A single option can
// also be disabled.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field>
        <FieldLabel>Plan</FieldLabel>
        <Combobox items={PLANS} defaultValue="Team" disabled>
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              {(plan: string) => (
                <ComboboxItem key={plan} value={plan}>
                  {plan}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>Only an owner can change the plan.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Account owner</FieldLabel>
        <Combobox items={OWNERS} defaultValue="Shruti Bhatia" readOnly>
          <ComboboxInput />
          <ComboboxContent>
            <ComboboxList>
              {(owner: string) => (
                <ComboboxItem key={owner} value={owner}>
                  {owner}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel>Upgrade to</FieldLabel>
        <Combobox items={PLANS}>
          <ComboboxInput placeholder="Search plans" />
          <ComboboxContent>
            <ComboboxList>
              {(plan: string) => (
                <ComboboxItem key={plan} value={plan} disabled={plan === "Enterprise"}>
                  {plan}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </Stack>
  );
}
