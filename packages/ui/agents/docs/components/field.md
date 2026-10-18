# Field

Field gives one form control a label, a description and an error message, and connects all three to it.

Job: Enter. Supply a value by typing it. A pattern: it owns the decisions this job needs.

```tsx
<Field>
  <FieldLabel>Email</FieldLabel>
  <TextField type="email" />
  <FieldDescription>We use this for receipts.</FieldDescription>
  <FieldError match={true}>That address is short.</FieldError>
</Field>
```

## Overview

Put each form control in a Field: a `TextField`, a `TextArea`, a `Select`, a `Combobox`, a `NumberField`, or a group of checkboxes or radios. The Field connects the label, the description and the error to the control, so a screen reader announces them together.

The parts always appear in the same order: label, control, description, error. The label sits directly above the control it names. The description says what to enter, and it stays visible when an error appears. The error says what went wrong.

Every Kookie control connects to the Field around it, so you add no ids or extra props. `FieldLabel` renders a real `<label>`, so clicking it moves focus to the control. `FieldError` shows only while the field is invalid, and a screen reader announces it when it appears.

You can show an error in three ways. For a browser check, set `required` or another constraint on the control and give `FieldError` a `match` such as `valueMissing`. For your own rules, pass a `validate` function to the Field, which returns a message or `null`. When your server rejects a value, set `invalid` on the Field and give `FieldError` the prop `match={true}`.

`size` on the Field sets the size of the label, the description, the error and the control together, although a control with its own `size` keeps it. `disabled` on the Field disables the control inside it.

In a group of checkboxes or radios, wrap each option in a `FieldItem`, which gives that option its own label and description. Leave at least 12 pixels between options so that each one is easy to tap; `gap="5"` on a `Stack` keeps that distance at every density.

The behaviour comes from Base UI's Field.

## Not supported

- `FieldControl` — Every Kookie control already connects to the Field around it. Put the control directly inside the Field, and it gets its id, label and description automatically.
- `orientation` — A field with its label beside the control needs its own layout, because the error must line up under the control rather than under the label. To build one, pass your own grid to the Field's `render` prop.
- A choice about where the error goes — The error always follows the description, below the control. Keeping one order means every field on a screen reads the same way.
- An error that replaces the description — Both are shown, because they say different things. The description says what to enter, and the error says what went wrong.
- `Form` — A `Form` component that assigns server errors to fields by name is not available yet. For now, set `invalid` on each Field that your server rejects.

## Examples

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="5" style={{ minWidth: "20rem" }}>
      <Field size={size}>
        <FieldLabel>Email</FieldLabel>
        <TextField type="email" placeholder="mira@kookie.dev" />
        <FieldDescription>We use this for receipts.</FieldDescription>
      </Field>
      <Field size={size}>
        <FieldLabel>Account number</FieldLabel>
        <TextField defaultValue="4471" aria-invalid />
        <FieldDescription>Eight digits, no spaces.</FieldDescription>
        <FieldError match={true}>That is four digits short.</FieldError>
      </Field>
      <Field size={size}>
        <FieldLabel>Delivery speed</FieldLabel>
        <RadioGroup defaultValue="standard">
          <Stack gap="4">
            <FieldItem>
              <Radio value="standard" />
              <FieldLabel>Standard</FieldLabel>
              <FieldDescription>Three to five business days.</FieldDescription>
            </FieldItem>
            <FieldItem>
              <Radio value="express" />
              <FieldLabel>Express</FieldLabel>
              <FieldDescription>Next business day before noon.</FieldDescription>
            </FieldItem>
          </Stack>
        </RadioGroup>
      </Field>
    </Stack>
  );
}
```

### Required field

`required` on the control, with a `FieldError` that uses `match="valueMissing"`. The message appears when a person submits the form without a value.

```tsx
"use client";

import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

// Put `required` on the control. FieldError with `match="valueMissing"`
// shows its message only when the browser reports that the value is missing.
export default function Example() {
  return (
    <Stack
      gap="5"
      style={{ maxWidth: "22rem" }}
      render={<form onSubmit={(event) => event.preventDefault()} />}
    >
      <Field>
        <FieldLabel>Workspace name</FieldLabel>
        <TextField required placeholder="Acme Inc." />
        <FieldError match="valueMissing">Enter a name for your workspace.</FieldError>
      </Field>
      <Button type="submit" emphasis="loud">
        Create workspace
      </Button>
    </Stack>
  );
}
```

### Custom validation

A `validate` function on the Field that checks the value when the control loses focus. It returns a message or `null`, and a `FieldError` with no children shows that message.

```tsx
"use client";

import { Field, FieldDescription, FieldError, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// Pass a `validate` function to the Field. It returns an error message, or
// `null` when the value is valid. A FieldError with no `match` shows that
// message, and a screen reader announces it.
export default function Example() {
  return (
    <Field
      validationMode="onBlur"
      validate={(value) =>
        typeof value === "string" && /^[a-z0-9-]{3,}$/.test(value)
          ? null
          : "Use at least three lowercase letters, numbers or hyphens."
      }
      style={{ maxWidth: "22rem" }}
    >
      <FieldLabel>Workspace URL</FieldLabel>
      <TextField defaultValue="My Workspace" />
      <FieldDescription>This becomes your address, such as acme.example.com.</FieldDescription>
      <FieldError />
    </Field>
  );
}
```

### Error from your server

`invalid` on the Field with an error message below it. The description stays in place, because it still tells the person what to enter.

```tsx
import { Field, FieldDescription, FieldError, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// Set `invalid` on the Field when your server rejects a value. The
// description stays, because it says what to enter. The error adds what
// went wrong.
export default function Example() {
  return (
    <Field invalid style={{ maxWidth: "22rem" }}>
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" defaultValue="shruti@example.com" />
      <FieldDescription>We send receipts and security alerts here.</FieldDescription>
      <FieldError match={true}>An account with this email already exists.</FieldError>
    </Field>
  );
}
```

### Disabled

A disabled Field beside an enabled one. Setting `disabled` on the Field also disables the control inside it, so you set it only once.

```tsx
import { Field, FieldDescription, FieldLabel, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// `disabled` on the Field reaches the control inside it. You do not need
// to set it twice.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field disabled>
        <FieldLabel>Organisation ID</FieldLabel>
        <TextField defaultValue="org_7Q2k9Xw" />
        <FieldDescription>Only support can change this.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Display name</FieldLabel>
        <TextField defaultValue="Acme Inc." />
      </Field>
    </Stack>
  );
}
```

### A group of checkboxes

A `FieldItem` for each checkbox, each with its own label and description. The Field's label names the whole group, and the last option is disabled.

```tsx
import {
  Checkbox,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

// Use a FieldItem for each option. The item gives the checkbox its own
// label and its own description, and clicking the label toggles it.
export default function Example() {
  return (
    <Field style={{ maxWidth: "26rem" }}>
      <FieldLabel>Email me about</FieldLabel>
      <FieldDescription>We never send more than one email a day.</FieldDescription>
      <Stack gap="5">
        <FieldItem>
          <Checkbox defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to you or mentions you.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Checkbox defaultChecked />
          <FieldLabel>Deploys</FieldLabel>
          <FieldDescription>When a production deploy fails.</FieldDescription>
        </FieldItem>
        <FieldItem disabled>
          <Checkbox />
          <FieldLabel>Billing</FieldLabel>
          <FieldDescription>Only workspace owners receive billing email.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
```

### With a Select

A `Select` inside a Field. The label names the select, and a screen reader reads the description with it, with no extra props.

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

const ROLES = { viewer: "Viewer", editor: "Editor", admin: "Admin" };

// Any Kookie control connects to the Field around it. The label names the
// Select trigger, and the description is read with it.
export default function Example() {
  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Role</FieldLabel>
      <Select defaultValue="editor" items={ROLES}>
        <SelectTrigger />
        <SelectContent>
          {Object.entries(ROLES).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>Editors can change projects but not billing.</FieldDescription>
    </Field>
  );
}
```

### With a text area

A `TextArea` inside a Field. It works the same way as a `TextField` and fills the width of the Field.

```tsx
import { Field, FieldDescription, FieldLabel, TextArea } from "@kushagradhawan/kookie-ui-react";

// A TextArea works in a Field the same way a TextField does. The control
// fills the width of the Field.
export default function Example() {
  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Release notes</FieldLabel>
      <TextArea rows={4} placeholder="What changed in this version?" />
      <FieldDescription>Shown to customers on the changelog page.</FieldDescription>
    </Field>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Naming one control

#### Field

Field gives one form control a label, a description and an error message, and connects all three to it.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step for the whole field, from `1` to `4`. |

#### FieldLabel

The name of the field, in medium weight. It renders a real `<label>`, so clicking it moves focus to the control

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

### Adding a description and an error

#### FieldDescription

Text that says what to enter, in the muted text colour. A screen reader announces it together with the control

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

#### FieldError

Text that says what went wrong, in the destructive colour. It shows only while the field is invalid, and a screen reader announces it when it appears

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

### Naming one option in a group

#### FieldItem

One option in a group of checkboxes or radios. It holds the control, its own label and its own description, and it puts the words beside the control

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
