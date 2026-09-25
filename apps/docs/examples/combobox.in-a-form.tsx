"use client";

import {
  Button,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const COUNTRIES = ["Australia", "Canada", "Germany", "India", "Japan", "United Kingdom", "United States"];

// Inside a Field, the label names the input and the description is read
// with it. `required` and `name` go on the Combobox, not on the input.
export default function Example() {
  return (
    <Stack
      gap="5"
      style={{ maxWidth: "22rem" }}
      render={<form onSubmit={(event) => event.preventDefault()} />}
    >
      <Field>
        <FieldLabel>Billing country</FieldLabel>
        <Combobox items={COUNTRIES} name="country" required>
          <ComboboxInput placeholder="Search countries" />
          <ComboboxContent>
            <ComboboxEmpty>
              <Text size="2">No country matches.</Text>
            </ComboboxEmpty>
            <ComboboxList>
              {(country: string) => (
                <ComboboxItem key={country} value={country}>
                  {country}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>We use this to calculate tax on your invoices.</FieldDescription>
        <FieldError match="valueMissing">Choose a country to continue.</FieldError>
      </Field>
      <Button type="submit" emphasis="loud">
        Save billing details
      </Button>
    </Stack>
  );
}
