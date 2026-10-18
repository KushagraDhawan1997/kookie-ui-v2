# Number Field

NumberField is a field for entering a number, with buttons on each side that decrease and increase it.

Job: Enter. Supply a value by typing it. A leaf: it does one thing.

```tsx
<NumberField defaultValue={4} min={1} max={50} />
```

## Overview

Use a NumberField when the value is a number, such as a count of seats, an amount of money or a timeout. It shows the value between a decrease button and an increase button. Use a `Slider` when an approximate value in a range is enough, and a `TextField` when the value only looks like a number, such as a postcode.

It matches a `TextField` in height, border, focus ring and material, so the two line up in one form. Set `min` and `max` to keep the value in a range, and `step` to set how far each press or arrow key moves it. A button becomes disabled when the value reaches a limit, and both are disabled in a read-only field.

Pass `format` to show the value as a currency, a percentage or a unit. The field formats the number and reads typed text in the user's locale, so someone in Germany can type `1.234,5`, and `locale` sets a different one. Put a unit in `format` rather than beside the field, so screen readers announce it as part of the value.

The value is a number, or `null` when the field is empty, which is different from zero. Use `value` and `onValueChange` to keep it in your own state, or `defaultValue` to let the field keep it. Set `name`, and a hidden input sends the number with the form.

Put it in a `Field` to give it a label, a description and an error message. Inside a `Field` it uses that field's size, and a `size` set on the NumberField itself still wins.

The arrow keys change the value by `step`, Alt with an arrow key uses `smallStep`, and Shift with an arrow key uses `largeStep`. The two buttons aren't in the tab order, because the keyboard already changes the value from the field itself. Set `decrementLabel` and `incrementLabel` to name the buttons in your app's language.

## Not supported

- `leading` and `trailing` — The two buttons already fill both ends of the field. Put a unit or currency in `format` instead, so it is shown, announced and read back as part of the number.
- `emphasis` and `tone` — Loudness ranks actions, and no field in a form is more important than the one beside it. To show an unacceptable value, set `aria-invalid` or mark the `Field` around it as invalid.
- `render` — A NumberField is made of an outer box and the input inside it, and neither can be replaced without breaking the other, so there is no single element for `render` to swap.
- The browser's number input — The native number input can't format or read numbers in the user's language, and it draws its own spinner buttons, so NumberField uses a text input with its own buttons.
- Dragging or scrolling to change the value — Changing the value by dragging or by scrolling needs its own pointer design, which doesn't exist yet. Use the buttons or the arrow keys for now.

## Examples

```tsx
import { Field, FieldDescription, FieldLabel, NumberField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field>
      <FieldLabel>Seats</FieldLabel>
      <NumberField defaultValue={4} min={1} max={50} style={{ maxWidth: "12rem" }} />
      <FieldDescription>Each seat is billed monthly.</FieldDescription>
    </Field>
  );
}
```

### Sizes

`size` sets the height, the text and the width of the two buttons. Each size matches a `TextField` and a `Button` at the same size, so the field lines up with them in a row.

```tsx
import { NumberField, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "12rem" }}>
      <NumberField size="1" defaultValue={2} min={0} aria-label="Replicas at size 1" />
      <NumberField size="2" defaultValue={2} min={0} aria-label="Replicas at size 2" />
      <NumberField size="3" defaultValue={2} min={0} aria-label="Replicas at size 3" />
      <NumberField size="4" defaultValue={2} min={0} aria-label="Replicas at size 4" />
    </Stack>
  );
}
```

### Currency, percentages and units

Pass `Intl.NumberFormat` options to `format`. The field shows and reads the value in that format, and screen readers announce the unit with the number.

```tsx
import { Field, FieldDescription, FieldLabel, NumberField, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "16rem" }}>
      <Field>
        <FieldLabel>Monthly budget</FieldLabel>
        <NumberField
          defaultValue={250}
          min={0}
          step={10}
          format={{ style: "currency", currency: "EUR" }}
        />
        <FieldDescription>Spending stops when the project reaches this amount.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Discount</FieldLabel>
        <NumberField
          defaultValue={0.15}
          min={0}
          max={1}
          step={0.05}
          format={{ style: "percent" }}
        />
      </Field>
      <Field>
        <FieldLabel>Upload limit</FieldLabel>
        <NumberField
          defaultValue={50}
          min={1}
          format={{ style: "unit", unit: "megabyte" }}
        />
      </Field>
    </Stack>
  );
}
```

### Steps for fine and coarse changes

`step` sets the normal change. Alt with an arrow key uses `smallStep` and Shift with an arrow key uses `largeStep`, so people can make a small or a large change from the keyboard.

```tsx
import { Field, FieldDescription, FieldLabel, NumberField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "16rem" }}>
      <FieldLabel>Request timeout</FieldLabel>
      <NumberField
        defaultValue={30}
        min={5}
        max={300}
        step={5}
        smallStep={1}
        largeStep={60}
        format={{ style: "unit", unit: "second" }}
      />
      <FieldDescription>
        Arrow keys move by 5. Hold Alt to move by 1, or Shift to move by 60.
      </FieldDescription>
    </Field>
  );
}
```

### Controlled

Pass `value` and `onValueChange` when other parts of the screen depend on the number, here a monthly price. The value is `null` when the field is empty, so check for it.

```tsx
"use client";

import * as React from "react";
import { Field, FieldLabel, NumberField, Stack, Text } from "@kushagradhawan/kookie-ui-react";

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
```

### Read-only, disabled and invalid

A read-only value can still be selected and is still sent with the form. A disabled field takes no input. An invalid field shows the error from the `Field` around it.

```tsx
import { Field, FieldDescription, FieldError, FieldLabel, NumberField, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "16rem" }}>
      <Field>
        <FieldLabel>Included seats</FieldLabel>
        <NumberField defaultValue={10} readOnly />
        <FieldDescription>Set by your plan. You can select and copy it.</FieldDescription>
      </Field>
      <Field disabled>
        <FieldLabel>Extra seats</FieldLabel>
        <NumberField defaultValue={0} />
        <FieldDescription>Available on the team plan.</FieldDescription>
      </Field>
      <Field invalid>
        <FieldLabel>Retention days</FieldLabel>
        <NumberField defaultValue={400} max={365} allowOutOfRange />
        <FieldError match={true}>Keep logs for 365 days or fewer.</FieldError>
      </Field>
    </Stack>
  );
}
```

### In a form

Set `name`, and a hidden input sends the number when the form submits. `required` stops the form from submitting while the field is empty.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Card,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Heading,
  NumberField,
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
          const data = new FormData(event.currentTarget);
          setSent(`${data.get("nodes")} nodes, ${data.get("memory")} GB each`);
        }}
      >
        <Stack gap="5">
          <Heading size="6">Scale the cluster</Heading>
          <Field>
            <FieldLabel>Nodes</FieldLabel>
            <NumberField name="nodes" defaultValue={3} min={1} max={32} required />
          </Field>
          <Field>
            <FieldLabel>Memory per node</FieldLabel>
            <NumberField name="memory" defaultValue={8} min={2} max={64} step={2} required />
            <FieldDescription>In gigabytes, in steps of 2.</FieldDescription>
          </Field>
          <Flex gap="3" align="center" justify="space-between">
            <Text size="2" emphasis="quiet">
              {sent ?? "Nothing applied yet."}
            </Text>
            <Button type="submit" emphasis="loud">
              Apply
            </Button>
          </Flex>
        </Stack>
      </form>
    </Card>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `allowOutOfRange?` | `boolean \| undefined` | Lets a typed value go outside `min` and `max`. |
| `backdrop?` | `boolean` | Set `backdrop` when the field sits over other content, such as an image. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `decrementLabel?` | `string` | The accessible name of the decrease button. |
| `defaultValue?` | `number \| undefined` | The start value of an uncontrolled field. |
| `disabled?` | `boolean \| undefined` | Disables the field. |
| `form?` | `string \| undefined` | The `id` of the form that the field belongs to. |
| `format?` | `Intl.NumberFormatOptions \| undefined` | The `Intl.NumberFormat` options that format the value. |
| `id?` | `string \| undefined` | The `id` of the input. |
| `incrementLabel?` | `string` | The accessible name of the increase button. |
| `largeStep?` | `number \| undefined` | The amount that Shift + an arrow key adds or removes. |
| `locale?` | `Intl.LocalesArgument \| undefined` | The locale that formats and parses the value. |
| `max?` | `number \| undefined` | The highest permitted value. |
| `min?` | `number \| undefined` | The lowest permitted value. |
| `name?` | `string \| undefined` | The name of the value in the submitted form. |
| `onValueChange?` | `\| ((value: number \| null, eventDetails: BaseNumberField.Root.ChangeEventDetails) => void) \| undefined` | Called on every change of the value. |
| `onValueCommitted?` | `\| ((value: number \| null, eventDetails: BaseNumberField.Root.CommitEventDetails) => void) \| undefined` | Called when the value is final: on blur after typing, or when a press is released. |
| `readOnly?` | `boolean \| undefined` | Prevents changes to the value. |
| `required?` | `boolean \| undefined` | Prevents form submission while the field is empty. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the field, from `"1"` to `"4"`. |
| `smallStep?` | `number \| undefined` | The amount that Alt + an arrow key adds or removes. |
| `snapOnStep?` | `boolean \| undefined` | Rounds the value to a multiple of `step` when it steps. |
| `step?` | `number \| "any" \| undefined` | The amount that one button press or one arrow key adds or removes. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `value?` | `number \| null \| undefined` | The value of a controlled field. |

It also takes every prop of a `<input>`.
