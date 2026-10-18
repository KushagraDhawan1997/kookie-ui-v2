# Switch

Switch turns a single setting on or off, and the change takes effect straight away.

Job: Choose. Pick from options you can see or list. A leaf: it does one thing.

```tsx
<Switch id="notify" defaultChecked />
<Text render={<label htmlFor="notify" />}>Notifications</Text>
```

## Overview

Use a Switch for a setting that applies as soon as it changes, with no save button. When the choice waits until a form is submitted, use a `Checkbox` instead.

When it is off, the track is a neutral channel. When it is on, the track fills with the accent colour. A Switch is a little larger than a `Checkbox` of the same size, and it has no `tone` or `emphasis`, so every switch looks the same.

The label is a separate element placed beside the Switch. Use a `Text` rendered as a `label`, with `htmlFor` set to the Switch's `id`. Inside a `Field`, put the Switch in a `FieldItem` with a `FieldLabel` and `FieldDescription`, and they are connected for you.

The area that responds to a press is larger than the track, so a Switch is easy to hit with a finger. On a touch screen the whole Switch grows, but the density setting doesn't change it.

A screen reader announces a Switch as a switch that is on or off, and Space changes it. A hidden checkbox goes with it, so a Switch with a `name` sends its value with a form.

## Use instead

- `Checkbox` when the choice waits for a submit, or is one item in a list of options.
- `Toggle` when it is a tool or a format that stays pressed, such as bold text or a filter.

## Not supported

- `tone` and `emphasis` — A Switch is always neutral when off and uses the accent colour when on, so every switch in an app reads the same way.
- `children` — The label sits beside the Switch rather than inside it, so that the row decides the space between them. Put a `Text` rendered as a `label` next to it.
- `readOnly` — HTML has no read-only switch, so there is no familiar look to copy. Use `disabled` for a setting that can't be changed, as you would with a `Checkbox`.

## Examples

```tsx
import { Flex, Switch, Text, type Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Flex gap="3" align="center">
      <Switch size={size} defaultChecked id="s1" />
      <Text size="2" render={<label htmlFor="s1" />}>
        Notifications
      </Text>
    </Flex>
  );
}
```

### Sizes

`size` sets the height and width of the track, from 1 to 4. At each size a Switch is a little larger than a `Checkbox`. Use size 2 unless the row around it uses another size.

```tsx
import { Flex, Switch, Text } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="6" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Flex key={size} gap="3" align="center">
          <Switch size={size} defaultChecked id={`switch-size-${size}`} />
          <Text size="2" render={<label htmlFor={`switch-size-${size}`} />}>
            Size {size}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
```

### Controlled

Pass `checked` and `onCheckedChange` to keep the state in your app, as here, where the text below changes with the switch. When nothing else depends on the value, use `defaultChecked` instead.

```tsx
"use client";

import * as React from "react";
import { Flex, Stack, Switch, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <Stack gap="2">
      <Flex gap="3" align="center">
        <Switch id="auto-renew" checked={enabled} onCheckedChange={setEnabled} />
        <Text size="2" render={<label htmlFor="auto-renew" />}>
          Renew my plan automatically
        </Text>
      </Flex>
      <Text size="2" emphasis="medium">
        {enabled ? "Your plan renews on 1 October." : "Your plan ends on 1 October."}
      </Text>
    </Stack>
  );
}
```

### Disabled

Set `disabled` to stop a switch from changing. The track dims, but the thumb stays clear, so people can still see whether the setting is on or off.

```tsx
import { Flex, Stack, Switch, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="5">
      <Flex gap="3" align="center">
        <Switch id="sso-off" disabled />
        <Text size="2" render={<label htmlFor="sso-off" />}>
          Require single sign-on
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Switch id="audit-on" disabled defaultChecked />
        <Text size="2" render={<label htmlFor="audit-on" />}>
          Keep an audit log
        </Text>
      </Flex>
    </Stack>
  );
}
```

### With a description

Put each switch in a `FieldItem` with its own `FieldLabel` and `FieldDescription`, and they connect to the switch for you. The outer `FieldLabel` names the whole group.

```tsx
import { Field, FieldDescription, FieldItem, FieldLabel, Stack, Switch } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "24rem" }}>
      <FieldLabel>Email notifications</FieldLabel>
      <Stack gap="4">
        <FieldItem>
          <Switch defaultChecked />
          <FieldLabel>Comments</FieldLabel>
          <FieldDescription>When someone replies to you or mentions you.</FieldDescription>
        </FieldItem>
        <FieldItem>
          <Switch />
          <FieldLabel>Weekly summary</FieldLabel>
          <FieldDescription>A digest of project activity every Monday.</FieldDescription>
        </FieldItem>
      </Stack>
    </Field>
  );
}
```

### A settings card

Put the label at the start of each row and the switch at the end, with a `Separator` between rows. This is the usual layout for a list of account settings.

```tsx
import { Card, Flex, Separator, Stack, Switch, Text } from "@kushagradhawan/kookie-ui-react";

const settings = [
  ["public-profile", "Public profile", "Anyone with the link can see your work.", true],
  ["show-email", "Show email address", "Members of your workspace can see it.", false],
  ["activity", "Share activity status", "Show when you were last active.", true],
] as const;

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        {settings.map(([id, label, description, on], index) => (
          <Stack key={id} gap="4">
            {index > 0 && <Separator />}
            <Flex justify="space-between" align="center" gap="4">
              <Stack gap="1">
                <Text size="3" weight="medium" render={<label htmlFor={id} />}>
                  {label}
                </Text>
                <Text size="2" emphasis="medium">
                  {description}
                </Text>
              </Stack>
              <Switch id={id} defaultChecked={on} />
            </Flex>
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
```

### In a form

Give the switch a `name`, and it sends a value when the form is submitted. A checked switch sends `on`, and an unchecked switch sends nothing.

```tsx
"use client";

import * as React from "react";
import { Button, Flex, Stack, Switch, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [saved, setSaved] = React.useState<string | null>(null);

  return (
    <Stack
      gap="4"
      render={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSaved(data.get("backups") === "on" ? "Nightly backups are on." : "Nightly backups are off.");
          }}
        />
      }
    >
      <Flex gap="3" align="center">
        <Switch id="backups" name="backups" defaultChecked />
        <Text size="2" render={<label htmlFor="backups" />}>
          Run nightly backups
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Button type="submit" emphasis="loud">
          Save settings
        </Button>
        {saved && (
          <Text size="2" emphasis="medium">
            {saved}
          </Text>
        )}
      </Flex>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the switch, from `1` to `4`. |
