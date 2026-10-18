# Text Area

TextArea lets people type text that runs over several lines.

Job: Enter. Supply a value by typing it. A leaf: it does one thing.

```tsx
<TextArea rows={3} aria-label="Notes" />
```

## Overview

A TextArea lets people type text that runs over several lines, such as a description, a note or a message. For a single line, such as a name or an email address, use a TextField.

`rows` sets the starting height in lines, and the width comes from the container. People can drag the corner to make the box taller but not wider. To turn resizing off, set `resize: "none"` in `style`.

The visible box is a wrapper around a native `textarea`. `className` and `style` apply to the wrapper, `ref` points to the `textarea`, and every other prop, such as `name`, `value` or `maxLength`, goes to the `textarea`.

Put a TextArea in a `Field` with a `FieldLabel` so it has a name, and use a `FieldError` for the error message. `aria-invalid` shows the error colour. `disabled` stops typing and dims the text, while `readOnly` keeps the text selectable, removes the fill and still sends the value with the form. Set `backdrop` when the TextArea sits over an image or other content, and it uses the theme's glass material.

The focus ring appears whenever the cursor is inside the TextArea, however it got there, because typing is the only thing people do in it.

## Not supported

- `emphasis` and `tone` — Every field in a form should look equally important, so a TextArea has no way to stand out from the fields around it.
- `resize` — A TextArea resizes vertically by default. To change that, set `resize` in `style`, which applies to the visible box.
- `cols` — The container sets the width. A width counted in characters would change with every size and density.
- `render` — A TextArea renders two elements, and replacing either one would break the box or the text input inside it.

## Examples

```tsx
import { TextArea } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  backdrop = false,
}: {
  size?: Size;
  backdrop?: boolean;
}) {
  return (
    <TextArea
      size={size}
      backdrop={backdrop}
      rows={3}
      defaultValue="A textarea is a paragraph."
      aria-label="Notes"
    />
  );
}
```

### Sizes

The four steps of `size`, which set the text size, the padding and the corner. The height comes from `rows`. Use size 2 unless the form around it uses another size.

```tsx
import { Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      {sizes.map((size) => (
        <TextArea key={size} size={size} rows={2} aria-label={`Notes, size ${size}`} placeholder={`Size ${size}`} />
      ))}
    </Stack>
  );
}
```

### In a form

A TextArea in a `Field` with a `FieldLabel` and a `FieldDescription`, which connect to the text area for you. The `name` prop sends its value with the form.

```tsx
import { Button, Field, FieldDescription, FieldLabel, Flex, Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Project description</FieldLabel>
        <TextArea rows={4} name="description" placeholder="What is this project for?" />
        <FieldDescription>Members see this on the project overview.</FieldDescription>
      </Field>
      <Flex justify="flex-end">
        <Button emphasis="loud">Save project</Button>
      </Flex>
    </Stack>
  );
}
```

### Controlled

`value` and `onChange` keep the text in your own state, so the description can count the characters left. `maxLength` stops typing at the limit.

```tsx
"use client";

import * as React from "react";
import { Field, FieldDescription, FieldLabel, TextArea } from "@kushagradhawan/kookie-ui-react";

const LIMIT = 160;

export default function Example() {
  const [bio, setBio] = React.useState("Product designer at Northwind Studio.");

  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Bio</FieldLabel>
      <TextArea
        rows={3}
        value={bio}
        maxLength={LIMIT}
        onChange={(event) => setBio(event.target.value)}
      />
      <FieldDescription>
        {LIMIT - bio.length} of {LIMIT} characters left.
      </FieldDescription>
    </Field>
  );
}
```

### Invalid

`aria-invalid` turns the border and the focus ring to the error colour. The message goes in a `FieldError`, so screen readers announce it.

```tsx
import { Field, FieldDescription, FieldError, FieldLabel, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "28rem" }}>
      <FieldLabel>Reason for refund</FieldLabel>
      <TextArea rows={3} defaultValue="Bad" aria-invalid />
      <FieldDescription>Tell us what went wrong with the order.</FieldDescription>
      <FieldError match={true}>Write at least 20 characters.</FieldError>
    </Field>
  );
}
```

### Disabled and read-only

Use `disabled` when the text can't be changed and doesn't matter right now. Use `readOnly` when people need to read and copy the text but not change it, because a read-only value is still sent with the form.

```tsx
import { Field, FieldLabel, Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Internal notes</FieldLabel>
        <TextArea rows={2} disabled defaultValue="Only admins can edit notes on this plan." />
      </Field>
      <Field>
        <FieldLabel>Original request</FieldLabel>
        <TextArea rows={2} readOnly defaultValue="Please move our workspace to the Team plan." />
      </Field>
    </Stack>
  );
}
```

### Resize

People can drag the corner to make a TextArea taller. The second one sets `resize: "none"` in `style` to keep its height fixed, which suits only a layout that can't move.

```tsx
import { Field, FieldLabel, Stack, TextArea } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "28rem" }}>
      <Field>
        <FieldLabel>Release notes</FieldLabel>
        <TextArea rows={3} placeholder="Drag the corner to make this taller." />
      </Field>
      <Field>
        <FieldLabel>Commit message</FieldLabel>
        <TextArea rows={3} style={{ resize: "none" }} placeholder="This one keeps its height." />
      </Field>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the text area sits over other content, such as an image. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the text area, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<textarea>`.
