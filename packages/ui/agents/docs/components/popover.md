# Popover

Popover opens a small panel beside the control that opened it, while the rest of the page stays usable.

Job: Focus. Deal with one thing before going on. A leaf: it does one thing.

```tsx
<Popover>
  <PopoverTrigger render={<Button>Rename</Button>} />
  <PopoverContent>
    <PopoverTitle>Rename project</PopoverTitle>
    <PopoverDescription>
      This changes the name everywhere.
    </PopoverDescription>
    <PopoverClose render={<Button emphasis="loud">Save</Button>} />
  </PopoverContent>
</Popover>
```

## Overview

Use a Popover to show a small panel next to a control without blocking the page behind it. It can hold whatever you put in it, such as a short form, a filter panel or a summary of a person.

Each floating component has its own job. A Menu lists actions, and a Select chooses one value. A Dialog holds a task that the person must finish before they continue, and an AlertDialog asks one question. A Tooltip shows a short label for a control.

Pass your own Button to `PopoverTrigger` through `render`, and the panel opens beside it. Set `side` and `align` on `PopoverContent` to choose where the panel prefers to open. When that side has no room, the panel moves to the opposite side, and it always stays on screen.

`size` on `Popover` sets the panel's padding and corner, together with the text size of `PopoverTitle` and `PopoverDescription`. Content that you add keeps the sizes you give it. The panel uses the material that your `Theme` sets, so it is glass when the theme's material is glass and solid otherwise.

Give every panel a `PopoverTitle`, because screen readers announce the panel by its title and read `PopoverDescription` with it. Escape or a press outside the panel closes it and returns focus to the trigger. For a close or save action inside the panel, wrap your own Button in `PopoverClose`. To open and close the panel from your own code, use `open` and `onOpenChange`.

## Use instead

- `Dialog` when the task needs the person's full attention and room away from the page.
- `Tooltip` when the text only names a control, and nobody needs it to finish their task.

## Not supported

- A modal mode — A Popover always leaves the page usable. When the page must wait for an answer, use a Dialog, or an AlertDialog for a single question.
- An arrow — The panel has its own border and opens right beside its trigger, so it is already clear which control it belongs to.
- Free positioning — You choose a preferred side and alignment, and the panel moves itself when that side has no room. Arbitrary coordinates would break that guarantee on small windows.
- A width that matches the trigger — A popover holds a form or a summary, so its width comes from its content rather than from the button that opened it. A Menu or a Select matches its trigger's width instead.
- A built-in close button — Escape and a press outside the panel already close it. If you want a visible button as well, wrap your own Button in `PopoverClose` and place it where your layout needs it.

## Examples

```tsx
import {
  Button,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Popover size={size}>
      <PopoverTrigger render={<Button emphasis="quiet" bordered>Rename</Button>} />
      <PopoverContent>
        <Stack gap="4">
          <Stack gap="1">
            <PopoverTitle>Rename project</PopoverTitle>
            <PopoverDescription>This changes the name everywhere it appears.</PopoverDescription>
          </Stack>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <TextField defaultValue="api-gateway" />
          </Field>
          <Flex gap="3" justify="flex-end">
            <PopoverClose render={<Button emphasis="quiet">Cancel</Button>} />
            <PopoverClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
          </Flex>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
```

### Choosing a side

Each button opens its panel on a different preferred `side`. When the preferred side has no room, such as near the edge of the window, the panel opens on the opposite side instead.

```tsx
import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@kushagradhawan/kookie-ui-react";

const SIDES = ["top", "right", "bottom", "left"] as const;

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {SIDES.map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Open ${side}`}</Button>} />
          <PopoverContent side={side} align="start">
            <PopoverTitle>Preferred side: {side}</PopoverTitle>
            <PopoverDescription>
              The panel moves to the other side when this side has no room.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
```

### Sizes

The same panel at sizes 1 to 4. `size` changes the padding, the corner and the title and description, and any content you add keeps its own size.

```tsx
import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" wrap="wrap">
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Popover key={size} size={size}>
          <PopoverTrigger render={<Button emphasis="quiet" bordered>{`Size ${size}`}</Button>} />
          <PopoverContent>
            <Stack gap="1">
              <PopoverTitle>Share link</PopoverTitle>
              <PopoverDescription>Anyone with the link can view this report.</PopoverDescription>
            </Stack>
          </PopoverContent>
        </Popover>
      ))}
    </Flex>
  );
}
```

### A filter panel

A Popover can hold a small form, here a set of checkboxes. The Reset and Apply buttons are each wrapped in `PopoverClose`, so pressing either one also closes the panel.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Checkbox,
  Field,
  FieldItem,
  FieldLabel,
  Flex,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const STATUSES = ["Queued", "Running", "Failed", "Finished"];

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            emphasis="quiet"
            bordered
            leading={<HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={iconStroke} aria-hidden />}
          >
            Filter
          </Button>
        }
      />
      <PopoverContent align="start">
        <Stack gap="4">
          <PopoverTitle>Filter jobs</PopoverTitle>
          <Field>
            <FieldLabel>Status</FieldLabel>
            <Stack gap="5">
              {STATUSES.map((status) => (
                <FieldItem key={status}>
                  <Checkbox defaultChecked={status !== "Finished"} />
                  <FieldLabel>{status}</FieldLabel>
                </FieldItem>
              ))}
            </Stack>
          </Field>
          <Flex gap="3" justify="flex-end">
            <PopoverClose render={<Button emphasis="quiet">Reset</Button>} />
            <PopoverClose render={<Button emphasis="loud">Apply</Button>} />
          </Flex>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
```

### Controlled

Use `open` and `onOpenChange` when your code needs to close the panel, such as after a form submits. This example also resets the draft label each time the panel opens.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Field,
  FieldLabel,
  Flex,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("Quarterly report");
  const [draft, setDraft] = React.useState(label);

  return (
    <Stack gap="3" align="start">
      <Text size="2" emphasis="medium">Current label: {label}</Text>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(label);
        }}
      >
        <PopoverTrigger render={<Button emphasis="quiet" bordered>Edit label</Button>} />
        <PopoverContent align="start">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setLabel(draft);
              setOpen(false);
            }}
          >
            <Stack gap="4">
              <PopoverTitle>Edit label</PopoverTitle>
              <Field>
                <FieldLabel>Label</FieldLabel>
                <TextField value={draft} onChange={(event) => setDraft(event.target.value)} />
              </Field>
              <Flex justify="flex-end">
                <Button type="submit" emphasis="loud">
                  Save
                </Button>
              </Flex>
            </Stack>
          </form>
        </PopoverContent>
      </Popover>
    </Stack>
  );
}
```

### A summary of a person

A Popover can show details with no form at all. The title and description name the panel for screen readers, and a Separator divides the header from the details below it.

```tsx
import {
  Avatar,
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Separator,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger render={<Button emphasis="quiet">Shruti Bhatia</Button>} />
      <PopoverContent side="bottom" align="start">
        <Stack gap="4">
          <Flex gap="3" align="center">
            <Avatar fallback="SB" alt="" />
            <Stack gap="1">
              <PopoverTitle>Shruti Bhatia</PopoverTitle>
              <PopoverDescription>Engineering lead, Payments</PopoverDescription>
            </Stack>
          </Flex>
          <Separator />
          <Stack gap="2">
            <Text size="2" emphasis="medium">Owns 6 projects in this workspace.</Text>
            <Text size="2" emphasis="medium">Last active 20 minutes ago.</Text>
          </Stack>
        </Stack>
      </PopoverContent>
    </Popover>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Opening the panel

#### Popover

Popover opens a small panel beside the control that opened it, while the rest of the page stays usable.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The `PopoverTrigger` and the `PopoverContent`, in that order. |
| `defaultOpen?` | `boolean` | Uncontrolled starting state. |
| `onOpenChange?` | `(open: boolean) => void` | Called when the panel opens or closes. |
| `open?` | `boolean` | Controlled open state. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the panel's padding and corner. |

#### PopoverTrigger

The control that opens the panel. Pass your own Button through `render`, and the trigger adds the ARIA attributes and the position that the panel opens beside

| Prop | Type | What it does |
| --- | --- | --- |
| `render?` | `RenderElement` | Usually a Kookie Button: `<PopoverTrigger render={<Button/>}>Filters</PopoverTrigger>`. |

### Placing the panel

#### PopoverContent

The panel itself. It holds your content and accepts the `side` and `align` that you prefer

| Prop | Type | What it does |
| --- | --- | --- |
| `align?` | `"start" \| "center" \| "end"` | How it lines up along that side. |
| `children?` | `React.ReactNode` | The panel's content, and it belongs to you. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `side?` | `"top" \| "right" \| "bottom" \| "left"` | Which side of the trigger to prefer. |
| `sideOffset?` | `number` | The gap from the trigger, in pixels. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<div>`.

### Naming the panel

#### PopoverTitle

The visible heading of the panel, which is also the name that a screen reader announces

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The panel's name. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<h2>`.

#### PopoverDescription

A supporting line that a screen reader reads after the title, so avoid repeating the title's words in it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The supporting text under the title. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<p>`.

### Closing the panel

#### PopoverClose

Closes the panel when pressed. Pass your own Button to it through `render`

| Prop | Type | What it does |
| --- | --- | --- |
| `render?` | `RenderElement` | Usually a Kookie Button: `<PopoverClose render={<Button/>}>Done</PopoverClose>`. |
