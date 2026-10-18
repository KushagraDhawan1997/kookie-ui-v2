# Select

Select is a form control that lets someone choose one option from a list.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Select defaultValue="banana" items={labels}>
  <SelectTrigger placeholder="Pick one" />
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruit</SelectLabel>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## Overview

Select lets someone pick one option from a list. The closed trigger shows the current choice, and pressing it opens a panel of options. Use it when there are too many options to show on the screen at once. When there are only a few, use a `SegmentedControl` or a `RadioGroup`, so people can see every option without opening anything. Use a `Combobox` when people need to type to filter a long list, and a `Menu` when the options are actions rather than a value.

The trigger is a button drawn like a field, with the same fill, border and height as a `TextField`, so the two sit side by side as the same kind of input. The panel is never narrower than the trigger, and when it opens, the chosen option sits over the trigger with the rest of the list above and below it.

Pass `items`, an object that maps each value to its label. The closed trigger uses it to show the chosen option's label, because the options themselves aren't rendered while the panel is closed. Without `items`, the trigger shows the raw value.

Select renders a hidden input, so `name` and `required` work in a form just as they do on a native select. Inside a `Field`, the `FieldLabel` names the trigger. Screen readers announce the trigger as a combobox and the panel as a listbox. The arrow keys move through the options, and typing a letter jumps to an option that starts with it.

The part names follow shadcn/ui's select (MIT).

## Use instead

- `Menu` when each item runs an action, and nothing stays chosen.
- `Combobox` when the list is long enough that people need to type to narrow it.
- `RadioGroup` when there are only a few options and showing them all helps people compare.

## Not supported

- `readOnly` — HTML doesn't support a read-only select, so there is no standard behaviour to follow. To show a value that can't change, display it as `Text`, and add your own hidden input if the form still needs to send it.
- A Separator inside the panel — The panel is a listbox, and a listbox may only contain options and groups, so a separator fails accessibility checks. Use `SelectGroup` to divide the options instead.
- `emphasis` and `tone` on the trigger — Loudness ranks actions, and no field in a form is more important than the one beside it. To show that a value is wrong, mark the field as invalid through `Field`.
- A `SelectValue` part — The trigger shows the chosen value itself and accepts a `placeholder` for when nothing is chosen, so a separate part would have nothing to do.
- `render` and `children` on the trigger — The trigger's content is always the chosen value, and it must stay a real button so screen readers announce it as a combobox. Style the options and use `items` to control what the trigger shows.
- Scroll arrows — The panel already scrolls with a wheel, a trackpad or the keyboard. Arrow buttons at the ends would only help a mouse user, so they aren't included.
- `multiple` — Choosing several values changes how the trigger shows the value, how each option shows its state and what the form sends, so it is a different control. Use checkboxes in a `Field` for a short list.

## Examples

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Select size={size} defaultValue="banana" items={{ apple: "Apple", banana: "Banana", carrot: "Carrot", leek: "Leek" }}>
      <SelectTrigger placeholder="Pick one" />
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruit</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

### A disabled option

Set `disabled` on a `SelectItem` to stop people choosing it. The option stays in the list, so people still see the whole set of choices.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const LABELS = { apple: "Apple", banana: "Banana", leek: "Leek" };

// An option you cannot pick stays in the list, so the set a reader
// sees is the whole set. `disabled` on the Select itself closes the
// control instead, which is a different statement.
export default function Example() {
  return (
    <Select defaultValue="banana" items={LABELS}>
      <SelectTrigger placeholder="Pick one" />
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="leek" disabled>
          Leek
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Right to left

Inside a right-to-left layout, the chevron moves to the other end of the trigger and the panel lines up with the other edge. You don't set anything on the Select itself.

```tsx
import {
  Box,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const LABELS = { apple: "Apple", banana: "Banana", leek: "Leek" };

// The trigger's caret moves to the other end and the panel anchors
// from the other edge. Nothing here says which way: `dir` does.
export default function Example() {
  return (
    <Box dir="rtl">
      <Select defaultValue="banana" items={LABELS}>
        <SelectTrigger placeholder="Pick one" />
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="leek">Leek</SelectItem>
        </SelectContent>
      </Select>
    </Box>
  );
}
```

### In a form

Inside a `Field`, the `FieldLabel` names the trigger. The hidden input makes `name` and `required` work with the form, just as they do on a native select.

```tsx
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

const ROLES = { viewer: "Viewer", editor: "Editor", admin: "Admin" };

// Inside a Field, the FieldLabel names the trigger. Select renders a hidden input, so
// `name` and `required` work with a form the same way a native select does.
export default function Example() {
  return (
    <Stack render={<form />} gap="5" style={{ minWidth: "18rem" }}>
      <Field>
        <FieldLabel>Role</FieldLabel>
        <Select name="role" required items={ROLES}>
          <SelectTrigger placeholder="Choose a role" />
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Admins can invite people and change billing.</FieldDescription>
      </Field>
      <Button type="submit" emphasis="loud">
        Send invite
      </Button>
    </Stack>
  );
}
```

### Controlled

Keep the value in your own state with `value` and `onValueChange`, here to update a sentence below the field. The callback can receive `null` when the chosen option leaves the list, so handle that case.

```tsx
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const REGIONS = { fra: "Frankfurt", iad: "Washington, D.C.", sin: "Singapore" };
type Region = keyof typeof REGIONS;

// Hold the value in your own state with `value` and `onValueChange`. The callback can
// receive `null` when the chosen option leaves the list, so handle that case.
export default function Example() {
  const [region, setRegion] = React.useState<Region>("fra");
  return (
    <Stack gap="3" style={{ minWidth: "18rem" }}>
      <Select
        value={region}
        onValueChange={(value) => setRegion((value ?? "fra") as Region)}
        items={REGIONS}
      >
        <SelectTrigger aria-label="Region" />
        <SelectContent>
          <SelectItem value="fra">Frankfurt</SelectItem>
          <SelectItem value="iad">Washington, D.C.</SelectItem>
          <SelectItem value="sin">Singapore</SelectItem>
        </SelectContent>
      </Select>
      <Text size="2" emphasis="medium">
        New projects deploy to {REGIONS[region]}.
      </Text>
    </Stack>
  );
}
```

### No choice yet

With no `defaultValue`, the trigger shows the `placeholder` in a muted colour until someone picks an option. Use it when no option is a safe default.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const SIZES = { s: "Small", m: "Medium", l: "Large" };

// With no `defaultValue`, the trigger shows the `placeholder` in a muted colour until
// someone picks an option.
export default function Example() {
  return (
    <Select items={SIZES}>
      <SelectTrigger aria-label="Instance size" placeholder="Choose an instance size" />
      <SelectContent>
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="m">Medium</SelectItem>
        <SelectItem value="l">Large</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### The whole control disabled

Set `disabled` on the `Select` to turn off the whole control. The panel can't open and the value isn't sent with the form, so explain why in a `FieldDescription`.

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const PLANS = { free: "Free", team: "Team", enterprise: "Enterprise" };

// Set `disabled` on the Select to turn off the whole control. The panel cannot open, and
// the value is not sent with the form.
export default function Example() {
  return (
    <Field style={{ minWidth: "18rem" }}>
      <FieldLabel>Plan</FieldLabel>
      <Select defaultValue="team" items={PLANS} disabled>
        <SelectTrigger />
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Only the workspace owner can change the plan.</FieldDescription>
    </Field>
  );
}
```

### A long list in groups

A long list scrolls inside the panel, and `SelectGroup` with `SelectLabel` divides it into sections. When the panel opens, the chosen option sits over the trigger, so it is the first thing people see.

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@kushagradhawan/kookie-ui-react";

const ZONES = {
  Europe: ["London", "Paris", "Berlin", "Madrid", "Rome", "Stockholm", "Warsaw", "Athens"],
  Asia: ["Dubai", "Mumbai", "Singapore", "Tokyo", "Seoul", "Jakarta", "Manila"],
  Americas: ["New York", "Chicago", "Denver", "Los Angeles", "Toronto", "São Paulo"],
};

const LABELS = Object.fromEntries(Object.values(ZONES).flat().map((city) => [city, city]));

// A long list scrolls inside the panel. On open, the panel places the chosen option over
// the trigger, so you see it first.
export default function Example() {
  return (
    <Select defaultValue="Singapore" items={LABELS}>
      <SelectTrigger aria-label="Time zone" />
      <SelectContent>
        {Object.entries(ZONES).map(([region, cities]) => (
          <SelectGroup key={region}>
            <SelectLabel>{region}</SelectLabel>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Beside a text field

A `SelectTrigger` has the same fill, border and height as a `TextField`, so the two can share one row, such as an amount and its unit.

```tsx
import {
  Flex,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

const UNITS = { gb: "GB", tb: "TB" };

// A SelectTrigger has the same fill, border and height as a TextField. The two sit in one
// row as a single input.
export default function Example() {
  return (
    <Flex gap="2">
      <TextField aria-label="Storage amount" defaultValue="500" inputMode="numeric" />
      <Select defaultValue="gb" items={UNITS}>
        <SelectTrigger aria-label="Storage unit" />
        <SelectContent>
          <SelectItem value="gb">GB</SelectItem>
          <SelectItem value="tb">TB</SelectItem>
        </SelectContent>
      </Select>
    </Flex>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Holding the choice

#### Select

Select is a form control that lets someone choose one option from a list.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | A `<SelectTrigger>` and a `<SelectContent>`. |
| `defaultOpen?` | `boolean` | Whether the panel is open at the start, when the select controls it. |
| `defaultValue?` | `string` | The value at the start, when the select controls its own value. |
| `disabled?` | `boolean` | Turns off the whole control. |
| `items?` | `Record<string, React.ReactNode>` | Maps each value to the label that the closed trigger shows. |
| `name?` | `string` | The name of the field when a form is submitted. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the panel opens or closes. |
| `onValueChange?` | `(value: string \| null) => void` | Called when the chosen value changes. |
| `open?` | `boolean` | Whether the panel is open, when you control it. |
| `required?` | `boolean` | Makes a value necessary before the form can submit, as on a native `<select>`. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the trigger and the panel. |
| `value?` | `string` | The chosen value, when you control it. |

#### SelectTrigger

The button that shows the current choice. It looks like a field, with the same fill, border and height, and a muted chevron at the end

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the trigger sits over other content, such as an image. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `placeholder?` | `string` | The text that the trigger shows, in a muted colour, while no value is chosen. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Presenting the panel

#### SelectContent

The floating panel of options. It opens above the rest of the page, with the same theme as the trigger, and it is never narrower than the trigger

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The options: `SelectItem` elements, in `SelectGroup` elements with a `SelectLabel` if you need groups. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Listing the options

#### SelectItem

One option. A tick in the accent colour marks the chosen option, and its space is kept on every row, so the text of all the options lines up

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The text of the option in the panel. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns off the option, so you can't choose it. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `value` | `string` | The value of this option. |

### Grouping into sections

#### SelectGroup

A set of related options. When a `SelectLabel` is inside it, screen readers use the label as the group's name

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The `SelectItem` options in the group, and one `SelectLabel` that names them. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### SelectLabel

A heading above a set of options. It starts at the edge of the rows, a little to the left of the option text, which leaves room for the tick, as in macOS

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The name of the options below it. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
