# Forms

What do you need from the person, and how do they give it? A form asks for a few values and
saves them with one action. `Field` connects each label, description and error to its control.
You write the words, choose the order and decide what to leave out.

## Label every control with Field

Wrap each control and its label in a `Field`. The `Field` connects them for screen readers. It
also connects a `FieldDescription` and a `FieldError`, so a screen reader reads them when the
control gets focus.
```tsx
import { Field, FieldDescription, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field style={{ maxWidth: "22rem" }}>
      <FieldLabel>Work email</FieldLabel>
      <TextField type="email" />
      <FieldDescription>Receipts and billing notices go here.</FieldDescription>
    </Field>
  );
}
```
Write the parts in this order: label, control, description, error. `Field` sets the gaps and
passes its `size` to every part. Outside a `Field`, point `htmlFor` at the control's `id`.

**A placeholder isn't a label.** It disappears when a person starts to type, and its muted
colour is harder to read. Use a placeholder only for an example of the value.

For checkboxes and radios, wrap each option in a `FieldItem`. It puts the control beside its
label and connects the two.
```tsx
import {
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Radio,
  RadioGroup,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Field>
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
  );
}
```
## Ask only for what you need

Fields have no `emphasis` or `tone`, because every field asks for the same thing: a value. Show
what matters through the label, the order and what you leave out. Set `required` on a control
that must have a value, and in a long form say so in the label too.

To choose from a list, use a `Select`. It sets a value that the form submits, whereas a `Menu`
runs an action and holds no value. Pass `items` to a `Select` whose option labels differ from
their values.

## Group with space

Put related rows closer together than unrelated ones. This is Gestalt proximity, a measured
effect. Make the gap inside a group at least two steps smaller than the gap around it, which is a
judgment. Compare only gaps that run the same way. Don't add a `Separator` or a `Card` where space
already shows the group.

## One button saves the form

Give the form one loud button for the action it exists to do, and make the other buttons medium
or quiet. Put the buttons at the end of the form. Label the main button with what it does:
"Create project", not "Submit".
```tsx
import {
  Button,
  Card,
  Checkbox,
  Field,
  FieldItem,
  FieldLabel,
  Flex,
  Heading,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6">New project</Heading>
          <Text size="3" emphasis="medium">Anyone in the workspace can open it.</Text>
        </Stack>

        <Stack gap="5">
          <Field size="3">
            <FieldLabel>Project name</FieldLabel>
            <TextField required />
          </Field>
          <Field size="3">
            <FieldItem>
              <Checkbox />
              <FieldLabel>Keep it private for now</FieldLabel>
            </FieldItem>
          </Field>
        </Stack>

        <Flex justify="flex-end" gap="3">
          <Button size="3">Cancel</Button>
          <Button size="3" tone="accent" emphasis="loud">Create project</Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```
## When an error appears

By default, a `Field` checks its value when the form is submitted. After that, it checks again on
every change, so the error goes away as soon as the value is correct. To check when the person
leaves the field, set `validationMode="onBlur"` on the `Field`. Don't show an error while someone
types the first characters. In one usability study, people completed a form faster when each
field was checked after they left it than when it was checked while they typed.

Controls have no `invalid` prop. Inside a `Field`, pass `invalid` when your code decides, or use
`validate` and `required` to let the field decide. Outside a `Field`, set `aria-invalid` on the
control. The example below checks when you leave the field.
```tsx
"use client";

import * as React from "react";
import { Field, FieldError, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// Your code decides the field is invalid, here when it loses focus.
export default function Example() {
  const [emailError, setEmailError] = React.useState<string | null>(null);

  return (
    <Field invalid={Boolean(emailError)} style={{ maxWidth: "22rem" }}>
      <FieldLabel>Work email</FieldLabel>
      <TextField
        type="email"
        defaultValue="mira@kookie"
        onBlur={(event) =>
          setEmailError(
            /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(event.currentTarget.value)
              ? null
              : "Add the part after the dot, such as .dev.",
          )
        }
      />
      <FieldError match={Boolean(emailError)}>{emailError}</FieldError>
    </Field>
  );
}
```
The system draws the red border. You write the message. WCAG 3.3.1 requires an error to be
described in text, so every invalid field needs a `FieldError`. A screen reader reads the error
as soon as it appears. Say what to do next, not only what is wrong.

## Write helper text only when it changes a decision

Write helper text only when it tells a person something the label can't: a consequence, a limit,
a scope or the reason a control is disabled.
```tsx
import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Field, FieldDescription, FieldLabel, Flex, Grid, Stack, Text, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Filler. The label already says this.">
        <Field>
          <FieldLabel>Work email</FieldLabel>
          <TextField type="email" />
          <FieldDescription>Enter your work email address.</FieldDescription>
        </Field>
      </Verdict>
      <Verdict ok why="Useful. It gives a scope the label can't carry.">
        <Field>
          <FieldLabel>Work email</FieldLabel>
          <TextField type="email" />
          <FieldDescription>Receipts and billing notices go here.</FieldDescription>
        </Field>
      </Verdict>
    </Grid>
  );
}

// A large mark, then the thing being judged, then why.
function Verdict({ ok, why, children }: { ok: boolean; why: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text tone={ok ? "success" : "destructive"} render={<Flex />}>
        <HugeiconsIcon
          icon={ok ? Tick02Icon : Cancel01Icon}
          size={28}
          strokeWidth={iconStroke}
          aria-label={ok ? "Right" : "Wrong"}
        />
      </Text>
      {children}
      <Text size="2" emphasis="medium">
        {why}
      </Text>
    </Stack>
  );
}
```
Keep helper text at the label's size. `FieldDescription` already uses the muted colour, so it
reads as secondary without getting smaller.
