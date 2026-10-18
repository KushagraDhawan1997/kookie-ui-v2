# Quickstart

On this page you'll build an invite dialog. Each step starts with a question, and the answer
picks the component.

## Ask what job the screen does

Inviting someone is a short task that needs the person's full attention, so it belongs in a
`Dialog`. A `Popover` would leave the page usable around it, which suits a filter, not a form
someone has to finish.
```tsx
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join.</DialogDescription>
          </Stack>
          {/* the fields go here */}
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet">Cancel</Button>} />
            <Button emphasis="loud">Send invite</Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```
The dialog has one loud button, because it has one main action. Cancel is quiet, and the outer
`Stack` sets every distance.

## Ask for the email

A `Field` connects the label, the description and any error to the control inside it. You write
no `id` and no `htmlFor`.
```tsx
import { Field, FieldDescription, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Email() {
  return (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <TextField type="email" placeholder="mira@kookie.dev" />
      <FieldDescription>Use their work address.</FieldDescription>
    </Field>
  );
}
```
## Ask for the role

There are three roles, and comparing them helps the person choose, so show them all with a
`RadioGroup`. With many options, or no room to show them, a `Select` is right instead. Each
component page's "Use instead" section gives this split.
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

export default function Role() {
  return (
    <Field>
      <FieldLabel>Role</FieldLabel>
      <RadioGroup defaultValue="editor">
        <Stack gap="4">
          <FieldItem>
            <Radio value="viewer" />
            <FieldLabel>Viewer</FieldLabel>
            <FieldDescription>Can read and comment.</FieldDescription>
          </FieldItem>
          <FieldItem>
            <Radio value="editor" />
            <FieldLabel>Editor</FieldLabel>
            <FieldDescription>Can change content.</FieldDescription>
          </FieldItem>
          <FieldItem>
            <Radio value="admin" />
            <FieldLabel>Admin</FieldLabel>
            <FieldDescription>Can manage people and billing.</FieldDescription>
          </FieldItem>
        </Stack>
      </RadioGroup>
    </Field>
  );
}
```
Each `FieldItem` names its own radio and description, so the options need no wiring either.

## Put it together
```tsx
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join.</DialogDescription>
          </Stack>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <TextField type="email" placeholder="mira@kookie.dev" />
            <FieldDescription>Use their work address.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <RadioGroup defaultValue="editor">
              <Stack gap="4">
                <FieldItem>
                  <Radio value="viewer" />
                  <FieldLabel>Viewer</FieldLabel>
                  <FieldDescription>Can read and comment.</FieldDescription>
                </FieldItem>
                <FieldItem>
                  <Radio value="editor" />
                  <FieldLabel>Editor</FieldLabel>
                  <FieldDescription>Can change content.</FieldDescription>
                </FieldItem>
                <FieldItem>
                  <Radio value="admin" />
                  <FieldLabel>Admin</FieldLabel>
                  <FieldDescription>Can manage people and billing.</FieldDescription>
                </FieldItem>
              </Stack>
            </RadioGroup>
          </Field>

          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet">Cancel</Button>} />
            <Button emphasis="loud">Send invite</Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```
## What you didn't write

- **Colours, pixel sizes or breakpoints:** `emphasis` says which button is the main action, and
  the theme works out the colour and size for each pointer and window size.
- **Label wiring:** `Field` and `FieldItem` connect every label and description.
- **Dialog behaviour:** focus, Escape, the scrim and the sheet in a narrow window come with `Dialog`.

## Where to go next

Read [Composition](/start/composition) and the pattern chapters, then browse the
[components](/components) by job.
