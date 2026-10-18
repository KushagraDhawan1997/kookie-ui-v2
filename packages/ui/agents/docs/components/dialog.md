# Dialog

Dialog shows a panel over a dimmed page for a short task that needs a person's full attention.

Job: Focus. Deal with one thing before going on. A leaf: it does one thing.

```tsx
<Dialog>
  <DialogTrigger render={<Button>Rename project</Button>} />
  <DialogContent>
    <DialogTitle>Rename project</DialogTitle>
    <DialogDescription>
      Everyone with access sees the new name.
    </DialogDescription>
    <DialogClose render={<Button emphasis="loud">Save</Button>} />
  </DialogContent>
</Dialog>
```

## Overview

Use a Dialog for a short task that must be finished or cancelled before a person goes back to the page, such as editing settings or renaming a project. To ask a yes-or-no question before a risky action, use `AlertDialog`. For a small panel that leaves the page usable, use `Popover`. For a panel attached to an edge of the window, use `Sheet`.

The panel looks like a `Card` with a slightly rounder corner, and the page behind it is dimmed. In a theme with `depth="elevated"` it has the same shadow as a `Card`, and nothing more, because the dimmed page already shows that the dialog is on top. On a narrow window the panel is attached to the bottom edge of the screen instead of being centred.

Write the layout inside the panel yourself with `Stack` and `Flex`. `size` sets the panel's maximum width, padding and corner, and the text size of `DialogTitle` and `DialogDescription`. Any other text you add keeps its own size. There is no close button in the corner, so put a `DialogClose` button where your layout needs one.

The panel grows with its content. To limit its height, set `maxHeight` in the `style` of `DialogContent` and put a `ScrollArea` inside, so the long content scrolls while the title and the buttons stay in view.

Open a dialog with `DialogTrigger`, or control it with `open` and `onOpenChange`. `onOpenChange` receives the reason for closing, such as `escape-key` or `outside-press`, and you can call `cancel()` to keep the dialog open, for example while a person has unsaved text.

When the dialog opens, focus moves into the panel and Tab stays inside it. Escape or a press outside the panel closes it, and focus then returns to the trigger. A screen reader announces the dialog by its `DialogTitle` and reads the `DialogDescription` with it, so always include a title.

The part names follow shadcn/ui's dialog (MIT), and the behaviour comes from Base UI's Dialog.

## Use instead

- `Popover` when the task is small and the page should stay usable around it.
- `AlertDialog` when the person must answer before going on, such as confirming a loss that cannot be undone. If the action can be undone, do it and offer undo instead of asking.

## Not supported

- `DialogHeader` and `DialogFooter` — A header and a row of actions are layout, so write them with `Stack` and `Flex`. `DialogTitle` and `DialogDescription` exist because a screen reader needs them to name the dialog.
- A prop to choose the presentation, and dragging to close — The window width decides whether the panel is centred or attached to the bottom edge, and it stays the same element either way. Dragging would need code running on every pointer move.
- A height prop — The panel grows with its content. To limit it, set `maxHeight` in the `style` of `DialogContent` and put a `ScrollArea` inside.
- A close button in the corner — Escape and a press outside the panel already close the dialog. Put a `DialogClose` button wherever your layout needs one, usually beside the other actions.
- `modal` and `disablePointerDismissal` — A dialog always keeps focus inside it and stops the page from scrolling. For a panel that leaves the page usable, use `Popover`. To stop an outside press from closing it, use `AlertDialog`.
- A shadow of its own — The dimmed page already shows that the dialog is on top. In a theme with `depth="elevated"` the panel has the same shadow as a `Card`.
- `size` on the title — The dialog's `size` sets the size of the title and the description, so they always match the panel. Other text that you add keeps its own size.

## Examples

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
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Dialog size={size}>
      <DialogTrigger render={<Button emphasis="medium">Rename project</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Everyone with access will see the new name.</DialogDescription>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <DialogClose render={<Button emphasis="loud">Save</Button>} />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```

### In a form

Project settings in a form inside the panel, with `open` held in state. Enter submits the form, and the dialog closes only after the submit handler runs.

```tsx
"use client";

import * as React from "react";
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
  FieldLabel,
  Flex,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

// Control `open` so the dialog closes only after the form is saved. The
// form element wraps the fields and the actions, so Enter submits it.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("Marketing site");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button emphasis="medium">Project settings</Button>} />
      <DialogContent>
        <Stack
          gap="6"
          render={
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            />
          }
        >
          <Stack gap="2">
            <DialogTitle>Project settings</DialogTitle>
            <DialogDescription>Changes apply to everyone in the workspace.</DialogDescription>
          </Stack>
          <Stack gap="5">
            <Field>
              <FieldLabel>Project name</FieldLabel>
              <TextField value={name} onChange={(event) => setName(event.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Custom domain</FieldLabel>
              <TextField placeholder="www.example.com" />
              <FieldDescription>Point a CNAME record at our servers first.</FieldDescription>
            </Field>
          </Stack>
          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
            <Button type="submit" emphasis="loud">
              Save changes
            </Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```

### Controlled

A dialog with no `DialogTrigger`, opened from state when an export finishes. Use this when something other than a button opens the dialog.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

// A dialog does not need a DialogTrigger. Open it from your own state,
// for example after a request finishes or from a keyboard shortcut.
export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Stack gap="3" align="flex-start">
      <Text size="2" emphasis="medium">
        Your export finishes in a few seconds.
      </Text>
      <Button emphasis="medium" onClick={() => window.setTimeout(() => setOpen(true), 800)}>
        Export project data
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Stack gap="6">
            <Stack gap="2">
              <DialogTitle>Export ready</DialogTitle>
              <DialogDescription>
                Your data is ready as a 4.2 MB ZIP file. The link works for 24 hours.
              </DialogDescription>
            </Stack>
            <Flex gap="3" justify="flex-end">
              <DialogClose render={<Button emphasis="quiet" bordered>Later</Button>} />
              <DialogClose render={<Button emphasis="loud">Download</Button>} />
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
```

### Scrolling content

A `maxHeight` on `DialogContent` with a `ScrollArea` around a long list. The list scrolls, and the title and the button stay in view.

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
  ScrollArea,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const CHANGES = [
  "Projects can now have a custom domain.",
  "Invoices download as PDF from the billing page.",
  "Search finds archived projects.",
  "Teams can require single sign-on.",
  "The activity log keeps 90 days of history.",
  "API keys can expire on a date you choose.",
  "Comments support mentions of whole teams.",
  "Exports include file attachments.",
  "Workspace owners can transfer ownership.",
  "Notifications can be paused for a week.",
  "Deploy previews get their own URL.",
  "Dark mode follows your system setting.",
];

// Set a `maxHeight` on DialogContent and put a ScrollArea inside it. The
// list scrolls, and the title and the button stay in view.
export default function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button emphasis="medium">What’s new</Button>} />
      <DialogContent style={{ maxHeight: "28rem" }}>
        <Stack gap="5">
          <Stack gap="2">
            <DialogTitle>What’s new</DialogTitle>
            <DialogDescription>Twelve changes shipped this month.</DialogDescription>
          </Stack>
          <ScrollArea>
            <Stack gap="3">
              {CHANGES.map((change) => (
                <Text key={change}>{change}</Text>
              ))}
            </Stack>
          </ScrollArea>
          <Flex justify="flex-end">
            <DialogClose render={<Button emphasis="loud">Got it</Button>} />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```

### Protect unsaved text

`onOpenChange` calls `cancel()` when Escape or an outside press would close a dialog that holds a draft. The Discard and Send buttons still close it.

```tsx
"use client";

import * as React from "react";
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
  FieldLabel,
  Flex,
  Stack,
  TextArea,
} from "@kushagradhawan/kookie-ui-react";

// `onOpenChange` tells you why the dialog is closing. Call `cancel()` to
// keep it open, for example when Escape or an outside press would lose
// text the person typed.
export default function Example() {
  const [draft, setDraft] = React.useState("");

  return (
    <Dialog
      onOpenChange={(open, details) => {
        const dismissed = details.reason === "escape-key" || details.reason === "outside-press";
        if (!open && dismissed && draft.trim() !== "") details.cancel();
      }}
    >
      <DialogTrigger render={<Button emphasis="medium">Leave feedback</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Leave feedback</DialogTitle>
            <DialogDescription>Escape does not close this dialog while it holds a draft.</DialogDescription>
          </Stack>
          <Field>
            <FieldLabel>Your feedback</FieldLabel>
            <TextArea rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} />
            <FieldDescription>Shruti Bhatia on the product team reads every message.</FieldDescription>
          </Field>
          <Flex gap="3" justify="flex-end">
            <DialogClose
              render={
                <Button emphasis="quiet" bordered onClick={() => setDraft("")}>
                  Discard
                </Button>
              }
            />
            <DialogClose
              render={
                <Button emphasis="loud" onClick={() => setDraft("")}>
                  Send
                </Button>
              }
            />
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
```

### Open from a menu row

A `Menu` row that opens a rename dialog. The dialog sits outside the menu and is opened from state, because the menu closes as soon as the row is chosen.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FieldLabel,
  Flex,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

// A menu row can open a dialog. Keep the dialog outside the menu and
// control it with state, because the menu closes when the row is chosen.
export default function Example() {
  const [renaming, setRenaming] = React.useState(false);

  return (
    <Flex>
      <Menu>
        <MenuTrigger render={<Button emphasis="medium">Project actions</Button>} />
        <MenuContent>
          <MenuItem onClick={() => setRenaming(true)}>Rename…</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem tone="destructive">Delete</MenuItem>
        </MenuContent>
      </Menu>
      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent>
          <Stack gap="6">
            <Stack gap="2">
              <DialogTitle>Rename project</DialogTitle>
              <DialogDescription>Everyone with access will see the new name.</DialogDescription>
            </Stack>
            <Field>
              <FieldLabel>Project name</FieldLabel>
              <TextField defaultValue="Marketing site" />
            </Field>
            <Flex gap="3" justify="flex-end">
              <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
              <DialogClose render={<Button emphasis="loud">Rename</Button>} />
            </Flex>
          </Stack>
        </DialogContent>
      </Dialog>
    </Flex>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Opening the dialog

#### Dialog

Dialog shows a panel over a dimmed page for a short task that needs a person's full attention.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The `DialogTrigger` and the `DialogContent`, in either order. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean, details: OverlayOpenChangeDetails) => void` | Called when the dialog opens or closes. |
| `open?` | `boolean` | Controlled open state. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the panel: its maximum width, padding and corner. |

#### DialogTrigger

The button that opens the dialog, usually `render={<Button />}`. If your own state opens the dialog, you don't need a trigger

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The button's label. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `nativeButton?` | `boolean` | Tells the part if the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Showing the panel

#### DialogContent

The panel. It renders in a portal with your theme settings, dims the page and centres itself. If the panel is taller than the window, the area around it scrolls

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The panel's content. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved.  |

It also takes every prop of a `<div>`.

### Naming the dialog

#### DialogTitle

The heading of the dialog and its accessible name. It renders a heading element, sized by the dialog's `size`

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The dialog's name. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<h2>`.

#### DialogDescription

A line of supporting text in the muted text colour. A screen reader reads it after the title

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The supporting text: what the dialog asks for. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<p>`.

### Closing the dialog

#### DialogClose

A button that closes the dialog. Place it in your layout beside the other actions, usually with `render={<Button />}`

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The button's label. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `nativeButton?` | `boolean` | Tells the part if the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.
