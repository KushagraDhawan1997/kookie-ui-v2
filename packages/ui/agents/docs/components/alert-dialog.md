# Alert Dialog

AlertDialog stops people to confirm an action that is hard to undo, such as a delete.

Job: Focus. Deal with one thing before going on. A leaf: it does one thing.

```tsx
<AlertDialog>
  <AlertDialogTrigger render={<Button>Delete…</Button>} />
  <AlertDialogContent>
    <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
    <AlertDialogDescription>
      Everything in it goes with it.
    </AlertDialogDescription>
    <AlertDialogCancel>Keep it</AlertDialogCancel>
    <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

## Overview

An alert dialog interrupts people to ask a question with two answers, such as "Delete this file?". It holds a title, a description, a cancel button and an action button, and it arranges these parts for you.

Use an alert dialog before an action that is hard to undo. If the panel holds work, such as a form, or needs any control other than the two buttons, use a `Dialog` instead.

Write the question as the title, and say in the description what happens if people go ahead. Give the action a short verb, such as Delete, rather than OK. The two buttons sit side by side while both labels fit on one line, with Cancel on the start side. If a label is too long, the buttons stack with the action on top, so a label never wraps.

A press outside the alert does nothing, because a stray click must not answer the question. Escape closes the alert in the same way as Cancel. Both buttons close the alert when they are pressed.

`size` sets the whole alert: its width, padding, corner, text and buttons. Each size has a fixed width that is narrower than a Dialog of the same size. The page behind the alert dims, and the panel uses the material that your Theme sets.

The alert uses `role="alertdialog"`, so a screen reader announces its title and description when it opens. Focus starts on Cancel, stays inside the alert while it is open, and returns to the trigger when it closes. The part names follow shadcn/ui's alert-dialog (MIT), and the behaviour comes from Base UI.

## Use instead

- `Dialog` when the person is doing a task.

## Not supported

- A width prop — Each size has a fixed width that suits a short question and two buttons. If your content needs more room, it is doing more than asking a question, so use a `Dialog`.
- Closing on an outside press — A stray click must not answer a question that could delete something. People can still press Escape, which works the same as Cancel.
- Header and footer parts — The alert arranges the title, the description and the two buttons itself, so you write the parts in order and need no layout parts. Put Cancel first, because that is the button that gets focus.
- `render` on Cancel and Action — The alert sets the size and position of both buttons, so they cannot become a different element. The action is always the strong button, because it is the only action in the alert.
- Arbitrary `children` — An alert holds only a title, a description and two buttons. If you need a text field, a checkbox or any other control, use a `Dialog`.

## Examples

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <AlertDialog size={size}>
      <AlertDialogTrigger render={<Button tone="destructive" emphasis="medium">Delete workspace…</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
        <AlertDialogDescription>
          Every project, member and API key goes with it. This cannot be undone.
        </AlertDialogDescription>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Sizes

`size` sets the whole alert, including its width, the title, the description and both buttons. Open each one to compare them.

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Flex,
} from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

// `size` sets the whole alert: its width, its padding, the title, the description and both
// buttons. Open each one to compare.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {sizes.map((size) => (
        <AlertDialog key={size} size={size}>
          <AlertDialogTrigger render={<Button emphasis="medium">Size {size}</Button>} />
          <AlertDialogContent>
            <AlertDialogTitle>Leave this project?</AlertDialogTitle>
            <AlertDialogDescription>
              You lose access until an owner invites you again.
            </AlertDialogDescription>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction tone="destructive">Leave</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </Flex>
  );
}
```

### Tones

Give `AlertDialogAction` a `tone` only when the action carries a meaning. Deleting a file uses `destructive`, while publishing a page has no risk and keeps the default tone.

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Flex,
} from "@kushagradhawan/kookie-ui-react";

// Give the action a `tone` only when it carries a meaning. A delete is `destructive`. A
// question with no risk, such as publishing, keeps the default.
export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium">Publish…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Publish this page?</AlertDialogTitle>
          <AlertDialogDescription>
            Everyone with the link can read it. You can unpublish it later.
          </AlertDialogDescription>
          <AlertDialogCancel>Not yet</AlertDialogCancel>
          <AlertDialogAction>Publish</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium" tone="destructive">Delete file…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Delete invoice-0421.pdf?</AlertDialogTitle>
          <AlertDialogDescription>
            The file is removed for every member. This cannot be undone.
          </AlertDialogDescription>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
```

### Controlled

An alert that your app raises, such as a warning that a session is ending, needs no trigger. Pass `open` and `onOpenChange`, and set `open` from your own logic.

```tsx
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// An alert raised by app state has no trigger. Pass `open` and `onOpenChange`, and set `open`
// from your own logic. Here a button stands in for a session timer.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState("Signed in as Shruti Bhatia.");
  return (
    <Stack gap="3" align="start">
      <Text emphasis="medium">{status}</Text>
      <Button emphasis="medium" onClick={() => setOpen(true)}>
        Expire session
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Stay signed in?</AlertDialogTitle>
          <AlertDialogDescription>
            Your session ends in two minutes. Unsaved changes are lost if it ends.
          </AlertDialogDescription>
          <AlertDialogCancel onClick={() => setStatus("Signed out.")}>Sign out</AlertDialogCancel>
          <AlertDialogAction onClick={() => setStatus("Session extended by one hour.")}>
            Stay
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Stack>
  );
}
```

### Opened from a menu

A menu item cannot contain a trigger, so the item sets `open` in its `onClick` instead. The menu closes and the alert opens in its place.

```tsx
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
} from "@kushagradhawan/kookie-ui-react";

// A menu row cannot hold a trigger, so the row sets `open` instead. The menu closes, and the
// alert opens in its place.
export default function Example() {
  const [confirming, setConfirming] = React.useState(false);
  return (
    <Flex>
      <Menu>
        <MenuTrigger render={<Button emphasis="medium">Project actions</Button>} />
        <MenuContent>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <Separator />
          <MenuItem tone="destructive" onClick={() => setConfirming(true)}>
            Delete project…
          </MenuItem>
        </MenuContent>
      </Menu>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Marketing site?</AlertDialogTitle>
          <AlertDialogDescription>
            Its deployments, domains and environment variables are removed.
          </AlertDialogDescription>
          <AlertDialogCancel>Keep project</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
```

### Right to left

The alert follows the text direction around it. In a right-to-left region, Cancel sits on the right and the text starts at the right edge, with no extra prop.

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Box,
  Button,
} from "@kushagradhawan/kookie-ui-react";

// The alert follows the direction around its trigger. In a right-to-left region, Cancel sits
// on the right and the text aligns to the right edge. No prop is needed.
export default function Example() {
  return (
    <Box dir="rtl">
      <AlertDialog>
        <AlertDialogTrigger render={<Button emphasis="medium">Remove member…</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Remove Shruti Bhatia?</AlertDialogTitle>
          <AlertDialogDescription>
            She loses access to every project in this workspace.
          </AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Remove</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Asking the question

#### AlertDialog

AlertDialog stops people to confirm an action that is hard to undo, such as a delete.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The `AlertDialogTrigger` and the `AlertDialogContent`. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean, details: OverlayOpenChangeDetails) => void` | Called when the alert opens or closes. |
| `open?` | `boolean` | Controlled open state. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the whole alert. |

#### AlertDialogTrigger

The control that opens the alert, usually written as render={`<Button/>`}. If your app opens the alert from its own state, you do not need a trigger

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The button's label. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns the trigger off, so the alert cannot be raised from here. |
| `nativeButton?` | `boolean` | Tells the trigger if the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Usually a Kookie Button: `<AlertDialogTrigger render={<Button/>}>Delete…</AlertDialogTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Presenting the panel

#### AlertDialogContent

Shows the panel above the page in a portal, dims the page behind it and centres the panel. It also places the title, the description and the buttons for you

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The alert's parts, in reading order: `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`, then `AlertDialogAction`. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved.  |

It also takes every prop of a `<div>`.

### Wording it

#### AlertDialogTitle

The question, shown as a heading and used as the alert's accessible name. The alert's size sets its text size

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The question that the alert asks. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<h2>`.

#### AlertDialogDescription

Tells people what happens if they go ahead. It uses the muted text colour and is the alert's accessible description

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The result of going ahead, such as what is lost and if it can come back. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<p>`.

### The two ways out

#### AlertDialogCancel

The safe way out, shown as a medium Button at the alert's size. Write it first, so it comes first in reading order and gets focus when the alert opens

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The label of the safe choice. "Cancel" is always correct. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns off the Cancel button. |
| `onClick?` | `React.MouseEventHandler<HTMLButtonElement>` | Called on the press, before the alert closes. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

#### AlertDialogAction

The button that goes ahead, always shown as the strong Button at the alert's size. Set tone="destructive" on it when the action deletes something

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The label of the action. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `disabled?` | `boolean` | Turns off the action button, such as until the person types a name to confirm. |
| `onClick?` | `React.MouseEventHandler<HTMLButtonElement>` | Called when the action is pressed. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour meaning of the action button. |

It also takes every prop of a `<button>`.
