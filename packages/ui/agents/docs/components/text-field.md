# Text Field

TextField lets people type a short value on a single line.

Job: Enter. Supply a value by typing it. A leaf: it does one thing.

```tsx
<TextField placeholder="Search" aria-label="Search" />
```

## Overview

A TextField is a single-line text input. Use it for a name, an email address, a search query or any other short value. Use a `TextArea` when the value can run over several lines, a `NumberField` for a number with stepper buttons, and a `Select` or `Combobox` when the value comes from a fixed list.

`leading` and `trailing` place an icon, a unit or a button inside the field, before or after the text. The visible box is a wrapper around a native `<input>`, so `className` and `style` apply to the wrapper and a `width` sizes the whole field. `ref` points to the input, so `.focus()` and `.select()` work as usual.

Put a TextField inside a `Field` to give it a label, a description and an error message. The `Field` connects them to the input for screen readers and sets one `size` for the whole group. `size` uses the same steps as `Button`, so a field and the button beside it are the same height.

Set `aria-invalid`, or place the field in an invalid `Field`, to show an error border. `disabled` stops input and dims the field, while `readOnly` keeps the value selectable and sent with the form.

The input is a real `<input>`, so the keyboard, autofill, form submission and screen readers all work as they do for any native field. On a touch screen the text is never smaller than 16 pixels, which stops the browser from zooming in when someone taps the field.

## Not supported

- `emphasis` and `tone` — Every field in a form should look equally important, so a TextField has no way to stand out from the fields around it.
- `render` — A TextField renders two elements, the visible box and the input inside it, so `render` couldn't say which one to replace.

## Examples

```tsx
import { TextField, type Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <TextField
      size={size}
      backdrop={backdrop}
      placeholder="Search"
      aria-label="Search"
      style={{ maxWidth: "22rem" }}
    />
  );
}
```

### Sizes

The four steps of `size`, each setting the height, the padding, the corner and the text size. Give a field the same `size` as the buttons in its row, so they line up.

```tsx
import { Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <TextField size="1" placeholder="Search files" aria-label="Search files, size 1" />
      <TextField size="2" placeholder="Search files" aria-label="Search files, size 2" />
      <TextField size="3" placeholder="Search files" aria-label="Search files, size 3" />
      <TextField size="4" placeholder="Search files" aria-label="Search files, size 4" />
    </Stack>
  );
}
```

### With icons

An icon, a unit or a short hint in `leading` or `trailing`. Clicking one puts the cursor in the input, and a field without them has no extra space.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Field, FieldLabel, Kbd, Stack, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <TextField
        type="search"
        placeholder="Search projects"
        aria-label="Search projects"
        leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        trailing={<Kbd>⌘K</Kbd>}
      />
      <Field>
        <FieldLabel>Billing email</FieldLabel>
        <TextField
          type="email"
          placeholder="shruti@example.com"
          leading={<HugeiconsIcon icon={Mail01Icon} strokeWidth={iconStroke} aria-hidden />}
        />
      </Field>
      <Field>
        <FieldLabel>Workspace address</FieldLabel>
        <TextField defaultValue="design-team" trailing=".kookie.app" />
      </Field>
    </Stack>
  );
}
```

### Password with a reveal button

A real `Button` in `trailing` keeps its own focus and click, and it is sized to fit inside the field. The button switches `type` between `password` and `text` to hide or show the value.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Button, Field, FieldLabel, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [visible, setVisible] = React.useState(false);

  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Password</FieldLabel>
      <TextField
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        defaultValue="correct-horse-battery"
        trailing={
          <Button
            iconOnly
            emphasis="quiet"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            <HugeiconsIcon
              icon={visible ? ViewOffSlashIcon : ViewIcon}
              strokeWidth={iconStroke}
              aria-hidden
            />
          </Button>
        }
      />
    </Field>
  );
}
```

### Controlled

`value` and `onChange` keep the text in your own state, as with a native input. Here the field filters a list as you type and shows a clear button only when it has text.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Button, Stack, Text, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

const FILES = ["Invoice March.pdf", "Invoice April.pdf", "Brand guide.pdf", "Roadmap.key"];

export default function Example() {
  const [query, setQuery] = React.useState("invoice");
  const matches = FILES.filter((file) => file.toLowerCase().includes(query.toLowerCase()));

  return (
    <Stack gap="3" style={{ maxWidth: "22rem" }}>
      <TextField
        type="search"
        aria-label="Filter files"
        placeholder="Filter files"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        trailing={
          query && (
            <Button iconOnly emphasis="quiet" aria-label="Clear filter" onClick={() => setQuery("")}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
            </Button>
          )
        }
      />
      <Text size="2" emphasis="medium">
        {matches.length} of {FILES.length} files match
      </Text>
    </Stack>
  );
}
```

### In a form

Each field sits in a `Field` with a `FieldLabel`, plus a `FieldDescription` where people need more information. Native props such as `name`, `type` and `required` go to the input, so the form submits as usual.

```tsx
"use client";

import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack
      gap="5"
      style={{ maxWidth: "24rem" }}
      render={<form onSubmit={(event) => event.preventDefault()} />}
    >
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <TextField name="name" defaultValue="Website redesign" required />
      </Field>
      <Field>
        <FieldLabel>Project URL</FieldLabel>
        <TextField name="url" type="url" placeholder="https://example.com" />
        <FieldDescription>We link to it from the project page.</FieldDescription>
      </Field>
      <Flex gap="2" justify="end">
        <Button type="reset">Reset</Button>
        <Button type="submit" emphasis="loud">
          Create project
        </Button>
      </Flex>
    </Stack>
  );
}
```

### Invalid

`aria-invalid` shows the error border, and a `FieldError` inside the `Field` says what is wrong. Screen readers announce the error text when it appears.

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field>
        <FieldLabel>VAT number</FieldLabel>
        <TextField defaultValue="GB1234" aria-invalid />
        <FieldDescription>Nine digits after the country code.</FieldDescription>
        <FieldError match={true}>This number is five digits too short.</FieldError>
      </Field>
      <TextField defaultValue="shruti@" type="email" aria-label="Invite email" aria-invalid />
    </Stack>
  );
}
```

### Disabled

`disabled`, on the `Field` or on the field itself, stops all input and dims the control. Use `readOnly` instead when the value must stay selectable and still be sent with the form.

```tsx
import { Field, FieldDescription, FieldLabel, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <Field disabled>
        <FieldLabel>Team name</FieldLabel>
        <TextField defaultValue="Design" />
        <FieldDescription>Only an owner can rename the team.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Workspace ID</FieldLabel>
        <TextField defaultValue="ws_8f3k2a91" readOnly />
        <FieldDescription>You can select and copy this value.</FieldDescription>
      </Field>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the field. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `leading?` | `React.ReactNode` | Content before the text, such as an icon, a unit or a currency symbol. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size of the field: the height, the padding, the corner and the text. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved.  |
| `trailing?` | `React.ReactNode` | Content after the text. |
| `type?` | `"text" \| "email" \| "password" \| "search" \| "tel" \| "url" \| "number"` | The input type. |

It also takes every prop of a `<input>`.
