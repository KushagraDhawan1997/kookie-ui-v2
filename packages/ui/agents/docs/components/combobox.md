# Combobox

Combobox lets people type to narrow a long list of options and then pick one.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Combobox items={regions}>
  <ComboboxInput placeholder="Search regions" />
  <ComboboxContent>
    <ComboboxEmpty>No region matches.</ComboboxEmpty>
    <ComboboxList>
      {(region) => (
        <ComboboxItem value={region}>{region}</ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

## Overview

Use a Combobox when the list of options is too long to scan, such as countries, time zones or team members. The person types a few letters, the list shrinks to the options that match, and they pick one. For a short list of about ten options or fewer, use `Select`. To run commands rather than choose a value, use `Command`.

The typed text only filters the list. It never becomes the value, so a form always receives one of your options. Matching compares the text against each option's label and keeps the options that contain it. For this reason `ComboboxList` accepts a function rather than children: you describe how to render one option, and the list renders only the options that match.

Pass every option in `items`. An option is either a string or an object with a `value` and a `label`, in which case people search and read the label and the form receives the value. Keep the `items` array stable by defining it outside your component or in a `useMemo`, because a new array on every render makes the filter run again.

Set `name`, `required`, `disabled`, `readOnly` and `form` on `Combobox`, because the chosen value belongs to the root. The field looks and behaves like a `TextField`, and the panel matches the panel of a `Select`. `size` sets both, and each size matches a `TextField` or a `Button` of the same size. Inside a `Field`, the field's size applies unless you set one.

The input has the `combobox` role and tells a screen reader whether the list is open. The arrow keys move through the options, Enter picks the highlighted one, and Escape closes the panel. After you type, the first match is highlighted, so a few letters and Enter are enough. The list takes its accessible name from the field, such as a `Field` label or the input's `aria-label`.

The part names follow shadcn/ui's combobox (MIT), and the behaviour comes from Base UI's Combobox.

## Use instead

- `Select` when the list is short enough to scan.

## Not supported

- Free text with suggestions — A Combobox always submits one of your options and never the typed text. For a command palette, use `Command`. A text field that accepts any text and offers suggestions is not available yet.
- `multiple` — Choosing several values would need removable chips inside the field, and that design does not exist yet. For now, use a group of checkboxes in a `Field`.
- A custom matcher, a result limit and inline completion — The typed text always filters the options by label. To match in a different way, filter the options yourself and pass the shorter list to `items`.
- `disabled`, `readOnly`, `name`, `required` and `form` on the input — Set these on `Combobox`. On the input they would act on the typed letters rather than the chosen option, so the form would submit the wrong value.
- A Separator inside the panel — A list of options may contain only options and groups, so a separator fails accessibility checks. Use `ComboboxGroup` to divide the options instead.
- `render` on the input — The field is two elements, a visible box and the input inside it, so a `render` prop could only replace one of them. Use `className` and `style` for the box and `ref` for the input.
- A clear button — The chevron fills the end of the field, and a clear button beside it has not been designed yet. A person can select the text and delete it to clear the choice.

## Examples

```tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// Hold the options steady. They reach the matcher by identity, so an array written
// inside the component runs the whole filter again on every render.
const REGIONS = ["Frankfurt", "London", "Mumbai", "São Paulo", "Singapore", "Sydney"];

export default function Example() {
  return (
    <Combobox items={REGIONS} defaultValue="Mumbai">
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(region: string) => (
            <ComboboxItem key={region} value={region}>
              {region}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

### Grouped options

Regions sorted into sections with `ComboboxGroup` and `ComboboxLabel`. When nothing in a section matches what you type, the section and its heading disappear together.

```tsx
"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Section = { value: string; items: string[] };

// Each group carries its own options. When nothing in a group matches,
// the group and its heading disappear together.
const REGIONS: Section[] = [
  { value: "Europe", items: ["Frankfurt", "London", "Paris", "Stockholm"] },
  { value: "Asia Pacific", items: ["Mumbai", "Singapore", "Sydney", "Tokyo"] },
  { value: "Americas", items: ["São Paulo", "Toronto", "Virginia"] },
];

export default function Example() {
  return (
    <Combobox items={REGIONS}>
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(section: Section) => (
            <ComboboxGroup key={section.value} items={section.items}>
              <ComboboxLabel>{section.value}</ComboboxLabel>
              <ComboboxCollection>
                {(region: string) => (
                  <ComboboxItem key={region} value={region}>
                    {region}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

### Values and labels

Options written as objects with a `value` and a `label`. People search and read the label, and the form receives the value, so London submits as `eu-west-2`.

```tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Region = { value: string; label: string };

// People search by the label. The form receives the value, so "London"
// submits as `eu-west-2`.
const REGIONS: Region[] = [
  { value: "eu-central-1", label: "Frankfurt" },
  { value: "eu-west-2", label: "London" },
  { value: "ap-south-1", label: "Mumbai" },
  { value: "ap-southeast-1", label: "Singapore" },
  { value: "us-east-1", label: "Virginia" },
];

export default function Example() {
  return (
    <Combobox items={REGIONS} name="region" defaultValue={REGIONS[1]!}>
      <ComboboxInput placeholder="Search regions" aria-label="Region" style={{ maxWidth: "22rem" }} />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">No region matches.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(region: Region) => (
            <ComboboxItem key={region.value} value={region}>
              {region.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

### Controlled

A time zone held in state with `value` and `onValueChange`, and shown in a sentence below the field. The callback runs when a person picks an option, and not while they type.

```tsx
"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const TIMEZONES = ["Asia/Kolkata", "Europe/Berlin", "Europe/London", "America/New_York", "Australia/Sydney"];

// `onValueChange` fires when a person picks an option or clears the field.
// It does not fire while they type.
export default function Example() {
  const [timezone, setTimezone] = React.useState<string | null>("Asia/Kolkata");

  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <Combobox items={TIMEZONES} value={timezone} onValueChange={setTimezone}>
        <ComboboxInput placeholder="Search time zones" aria-label="Time zone" />
        <ComboboxContent>
          <ComboboxEmpty>
            <Text size="2">No time zone matches.</Text>
          </ComboboxEmpty>
          <ComboboxList>
            {(zone: string) => (
              <ComboboxItem key={zone} value={zone}>
                {zone}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Text size="2" emphasis="medium">
        {timezone ? `Reports are sent at 09:00 in ${timezone}.` : "Pick a time zone for your reports."}
      </Text>
    </Stack>
  );
}
```

### In a form

A required Combobox inside a `Field` with a label, a description and an error. `name` and `required` go on the Combobox, and the error appears if the form is submitted with no choice.

```tsx
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
```

### Disabled

A disabled Combobox, a read-only Combobox and a list with one disabled option. A read-only Combobox shows and submits its value, but its list does not open.

```tsx
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
```

### Icon before the text

An icon in the `leading` slot. The chevron always sits at the end of the field, so an icon can only go before the text.

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const MEMBERS = ["Shruti Bhatia", "Design team", "Engineering team", "Finance team", "Support team"];

// `leading` puts an icon before the text. The chevron always sits at the
// trailing edge, so there is no `trailing` slot.
export default function Example() {
  return (
    <Combobox items={MEMBERS}>
      <ComboboxInput
        placeholder="Assign to"
        aria-label="Assignee"
        leading={<HugeiconsIcon icon={UserIcon} strokeWidth={iconStroke} aria-hidden />}
        style={{ maxWidth: "22rem" }}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">Nobody by that name.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(member: string) => (
            <ComboboxItem key={member} value={member}>
              {member}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
```

### Sizes

The four sizes, one above the other. The field, the panel, the rows and the text change together, and each size matches a `TextField` or a `Button` of the same size.

```tsx
"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

const LANGUAGES = ["English", "Deutsch", "Español", "Français", "हिन्दी", "日本語"];

// `size` sets the field, the panel, the rows and the text together. It
// matches a TextField or a Button at the same size.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "22rem" }}>
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Combobox key={size} size={size} items={LANGUAGES} defaultValue="English">
          <ComboboxInput aria-label={`Language, size ${size}`} />
          <ComboboxContent>
            <ComboboxList>
              {(language: string) => (
                <ComboboxItem key={language} value={language}>
                  {language}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </Stack>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Typing and picking

#### Combobox

Combobox lets people type to narrow a long list of options and then pick one.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<ComboboxInput>` and a `<ComboboxContent>`. |
| `defaultOpen?` | `boolean` | Whether the panel is open at the start, when the combobox controls it. |
| `defaultValue?` | `T \| null` | The option chosen at the start, when the combobox controls its own value. |
| `disabled?` | `boolean` | Turns off the whole control. |
| `form?` | `string` | The `id` of the form that the field belongs to. |
| `items` | `readonly (T \| ComboboxOptionGroup<T>)[]` | All the options, as a flat list or as groups (`{ value, items }`). |
| `name?` | `string` | The name of the field when a form is submitted. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the panel opens or closes. |
| `onValueChange?` | `(value: T \| null) => void` | Called when the chosen option changes. |
| `open?` | `boolean` | Whether the panel is open, when you control it. |
| `readOnly?` | `boolean` | Shows and submits the value, but you can't change it. |
| `required?` | `boolean` | Makes a chosen option necessary before the form can submit. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the field and the panel. |
| `value?` | `T \| null` | The chosen option, when you control it. |

#### ComboboxInput

The field that people type in. `className` and `style` apply to the visible box, and `ref` points to the input inside it. The chevron at the end opens the list with a pointer, and the keyboard opens it with the arrow keys

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the field sits over other content, such as an image. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `leading?` | `React.ReactNode` | Content before the text, such as an icon or a unit. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<input>`.

### Showing the panel

#### ComboboxContent

The panel that holds the list. It opens below the field, renders in a portal with your theme settings, and is never narrower than the field

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<ComboboxList>` and a `<ComboboxEmpty>`. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Listing the options

#### ComboboxList

The list of options. It accepts a function and calls it once for each option that matches, and it takes its accessible name from the field unless you give it one

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name of the list of options. |
| `aria-labelledby?` | `string` | The `id` of an element that names the list, where the words are already on screen. |
| `children` | `(item: T, index: number) => React.ReactNode` | A function that renders one option or group. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### ComboboxItem

One option. Space for the tick is always kept, so chosen and unchosen rows line up. Write the option's label as its text, because the field shows that label after a choice

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The text of the row. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns off the option, so you can't choose it. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `value` | `ComboboxOption` | The option that this row chooses. |

#### ComboboxEmpty

The message shown when no option matches. A screen reader announces it when it appears, and it takes up no space while it is empty

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The message that the panel shows when no option matches. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### Grouping options into sections

#### ComboboxGroup

A section with its own options. When no option in the section matches, the section and its heading are hidden

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `ComboboxLabel` that names the group, and a `ComboboxCollection` that renders its options. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `items` | `readonly ComboboxOption[]` | The options in this group. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### ComboboxLabel

A heading above a set of options. It works inside a group or on its own, and the keyboard skips over it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The name of the group. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### ComboboxCollection

Renders the matching options inside one `ComboboxGroup`, so each section can shrink or empty on its own while the others stay

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `(item: T, index: number) => React.ReactNode` | A function that renders one option. |
