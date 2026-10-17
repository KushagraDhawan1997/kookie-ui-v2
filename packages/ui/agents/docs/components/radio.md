# Radio

Radio lets a person pick exactly one option from a short list.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Radio value="a" id="a" />
```

## Overview

Use a Radio when a person must pick exactly one option from a short list, such as a plan or a backup schedule. Every Radio belongs to a `RadioGroup`, which holds the chosen value, and a Radio is checked when its `value` matches the group's.

For neighbouring cases, use a Checkbox when a person can pick several options or turn one option on and off, and a Switch for a setting that takes effect at once. A Select suits a long list, and a segmented control suits two to five short labels that change a view in place.

A Radio is always a circle, whatever corner setting your theme uses, because a square radio would look like a checkbox. It is neutral when off and uses your app's accent colour when on.

At each `size`, a Radio is exactly one line of text tall and matches a Checkbox, while its pressable area extends to the height of a Button at the same size. Inside a Field it uses the Field's size, although a `size` set on the Radio still wins.

The label is a separate element beside the Radio. The simplest way to connect them is a `FieldItem`, which needs no `id`. You can also wrap the Radio and its words in a `<label>`, or give the Radio an `id` and point a label at it with `htmlFor`. In every case, pressing the label checks the Radio.

## Not supported

- `tone` and `emphasis` — Like a Checkbox, a Radio is always neutral when off and accent-coloured when on, so a checked option reads the same everywhere in your app.
- `readOnly` — HTML has no read-only radio button, so there is no standard behaviour to follow. To show a value that cannot change, disable the radio and explain why in a description.

## Examples

```tsx
import { Flex, Radio, RadioGroup, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <RadioGroup defaultValue="b">
      <Stack gap="5">
        {["a", "b", "c"].map((v) => (
          <Flex key={v} gap="3" align="center">
            <Radio size={size} value={v} id={`r-${v}`} />
            <Text size="2" render={<label htmlFor={`r-${v}`} />}>Option {v.toUpperCase()}</Text>
          </Flex>
        ))}
      </Stack>
    </RadioGroup>
  );
}
```

### Sizes

Each Radio sits next to a label at the same `size`. The circle is one line of that text tall, so the two always line up.

```tsx
import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <RadioGroup defaultValue="2" aria-label="Radio sizes">
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Flex key={size} gap="3" align="center">
          <Radio size={size} value={size} id={`radio-size-${size}`} />
          <Text size={size} render={<label htmlFor={`radio-size-${size}`} />}>
            Size {size}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
```

### With a description for each option

Each Radio sits in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The description lines up under the label, and screen readers read it with the option.

```tsx
import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Backups</FieldLabel>
      <RadioGroup defaultValue="daily">
        <FieldItem>
          <Radio value="hourly" />
          <FieldLabel>Hourly</FieldLabel>
          <FieldDescription>Keeps 48 snapshots. Uses the most storage.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Radio value="daily" />
          <FieldLabel>Daily</FieldLabel>
          <FieldDescription>Keeps 30 snapshots, taken at midnight UTC.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Radio value="weekly" />
          <FieldLabel>Weekly</FieldLabel>
          <FieldDescription>Keeps 12 snapshots, taken on Sunday.</FieldDescription>
        </FieldItem>
      </RadioGroup>
    </Field>
  );
}
```

### Disabled

One option is disabled and stays in the list, with a description that says how to get it. Use this when a person should know an option exists.

```tsx
import { Field, FieldDescription, FieldItem, FieldLabel, Radio, RadioGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Region</FieldLabel>
      <RadioGroup defaultValue="eu-west">
        <FieldItem>
          <Radio value="eu-west" />
          <FieldLabel>Europe (Ireland)</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="us-east" />
          <FieldLabel>United States (Virginia)</FieldLabel>
        </FieldItem>
        <FieldItem>
          <Radio value="ap-south" disabled />
          <FieldLabel>Asia Pacific (Mumbai)</FieldLabel>
          <FieldDescription>Available on the enterprise plan.</FieldDescription>
        </FieldItem>
      </RadioGroup>
    </Field>
  );
}
```

### A label that wraps the radio

Each Radio and its words sit inside one `<label>` element, so they connect without an `id`. Pressing anywhere on the label checks the Radio.

```tsx
import { Flex, Radio, RadioGroup, Text } from "@kushagradhawan/kookie-ui-react";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match the system" },
];

// A label that wraps the radio needs no `id` and no `htmlFor`.
export default function Example() {
  return (
    <RadioGroup defaultValue="system" aria-label="Appearance">
      {OPTIONS.map((option) => (
        <Flex key={option.value} gap="3" align="center" render={<label />}>
          <Radio value={option.value} />
          <Text size="2" render={<span />}>
            {option.label}
          </Text>
        </Flex>
      ))}
    </RadioGroup>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the radio, from `1` to `4`. |
