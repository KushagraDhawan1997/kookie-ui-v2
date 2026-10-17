# Accordion

Accordion stacks sections under headings that people press to show or hide the content.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Accordion multiple defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionPanel>…</AccordionPanel>
  </AccordionItem>
</Accordion>
```

## Overview

An accordion stacks sections one under the other. Each section has a heading that people press to show or hide its content. By default only one section is open at a time, and opening another closes it. Set `multiple` to let several sections stay open.

Use an accordion when a page has several sections and people usually need only one or two of them, such as a list of questions and answers or groups of settings. Use `Tabs` when people switch between views of one thing, and use `NavTree` for navigation with nested levels.

Each heading is as tall as a Button of the same size, and its label underlines under the pointer. The chevron points toward the reading direction while the section is closed and turns down while it is open. The text in a panel starts under the heading's label, so the two line up.

The accordion draws only the thin lines between its sections, with no box around them. Put it in a Card when the sections need an edge. `size` sets the headings and the panel text, and if you leave it unset, the accordion uses the size of the nearest Theme.

Each heading is a real heading element with a button inside it, so a screen reader lists the sections with the other headings on the page. Set `headingLevel` to match your page outline; the default is 3. People press Tab to move between headings and Enter or Space to open or close one, and the button announces whether its section is open.

Set `hiddenUntilFound` on a panel if you want the browser's find-in-page to open a closed section that contains a match.

## Use instead

- `Tabs` when people look at one section at a time.

## Not supported

- A horizontal orientation — Sections placed side by side need a different keyboard model and a different layout, so the accordion is always a vertical stack. Use `Tabs` for side-by-side views.
- `tone` and `emphasis` — The headings carry no meaning that a colour could add, and no section is more important than the others. If some panel text needs a colour, set `tone` on a `Text` inside the panel.
- An icon slot or a custom chevron — The chevron is the one disclosure icon used everywhere in the system, including `NavTree`. A different icon here would give people a second symbol for the same action.
- A border or background of its own — The accordion draws only the lines between its sections, so it fits inside whatever surface holds it. Put it in a Card when the sections need an edge.

## Examples

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  multiple = false,
}: {
  size?: Size;
  multiple?: boolean;
}) {
  return (
    <Accordion
      size={size}
      multiple={multiple}
      defaultValue={["shipping"]}
      style={{ width: "22rem", maxWidth: "100%" }}
    >
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders ship within two business days, tracking by email.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>
          Thirty days from delivery, in the original packaging.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>
          Two years on every part, covering defects and not wear.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

### Sizes

Set `size` on the root to change every heading and panel inside it. Each heading is as tall as a Button of the same size, so the accordion lines up with the controls around it.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

// `size` on the root sets every heading and panel inside it. Each heading stands as tall as a
// Button at the same size.
export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Accordion size={size} defaultValue={["plan"]} style={{ width: "22rem", maxWidth: "100%" }}>
      <AccordionItem value="plan">
        <AccordionTrigger>Plan and billing</AccordionTrigger>
        <AccordionPanel>You are on the Team plan, billed every month.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="seats">
        <AccordionTrigger>Seats</AccordionTrigger>
        <AccordionPanel>Eight of ten seats are in use.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

### Several sections open

Set `multiple` when people need to compare sections, so opening one leaves the others open. List every section that starts open in `defaultValue`, which is an array of item values.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";

// With `multiple`, opening one section leaves the others open. `defaultValue` lists every
// section that starts open.
export default function Example() {
  return (
    <Accordion multiple defaultValue={["email", "push"]} style={{ width: "22rem", maxWidth: "100%" }}>
      <AccordionItem value="email">
        <AccordionTrigger>Email</AccordionTrigger>
        <AccordionPanel>A daily summary of comments and mentions.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="push">
        <AccordionTrigger>Push notifications</AccordionTrigger>
        <AccordionPanel>Direct mentions and review requests only.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="sms">
        <AccordionTrigger>Text messages</AccordionTrigger>
        <AccordionPanel>Security alerts, such as a new sign-in.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

### Controlled

Pass `value` and `onValueChange` when your app decides which sections are open. Here, an Expand all button opens every section and a Collapse all button closes them.

```tsx
"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Flex,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

const sections = [
  { value: "general", title: "General", body: "Project name, slug and default branch." },
  { value: "members", title: "Members", body: "Eight people have access to this project." },
  { value: "danger", title: "Danger zone", body: "Transfer or delete the project." },
];

// Pass `value` and `onValueChange` when the app decides what is open. Here two buttons open
// and close every section at once.
export default function Example() {
  const [open, setOpen] = React.useState<string[]>(["general"]);
  return (
    <Stack gap="4" style={{ width: "22rem", maxWidth: "100%" }}>
      <Flex gap="2">
        <Button emphasis="medium" onClick={() => setOpen(sections.map((s) => s.value))}>
          Expand all
        </Button>
        <Button emphasis="medium" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </Flex>
      <Accordion multiple value={open} onValueChange={(next) => setOpen(next as string[])}>
        {sections.map((section) => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionPanel>{section.body}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
```

### In a card

The accordion draws only the lines between its sections. Put it in a Card with a Heading when the sections need an edge and a title, as in this list of questions.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Card,
  Heading,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

// The accordion draws no box of its own. Put it in a Card when the sections need an edge.
export default function Example() {
  return (
    <Card style={{ width: "26rem", maxWidth: "100%" }}>
      <Stack gap="3">
        <Heading size="5">Frequently asked questions</Heading>
        <Accordion>
          <AccordionItem value="cancel">
            <AccordionTrigger>Can I cancel at any time?</AccordionTrigger>
            <AccordionPanel>Yes. Your plan stays active until the end of the billing period.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="invoices">
            <AccordionTrigger>Where do I find my invoices?</AccordionTrigger>
            <AccordionPanel>Open Settings, then Billing. Each invoice downloads as a PDF.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="seats">
            <AccordionTrigger>How do I add seats?</AccordionTrigger>
            <AccordionPanel>Invite a person from Members. The next invoice includes the new seat.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Stack>
    </Card>
  );
}
```

### Disabled

Set `disabled` on an item to stop people from opening that one section, while the other sections still open and close.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";

// `disabled` sits on the ITEM, not the root: one section can be
// closed to you while the rest of the list still opens.
export default function Example() {
  return (
    <Accordion defaultValue={["shipping"]} style={{ width: "22rem", maxWidth: "100%" }}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders ship within two business days.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns" disabled>
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days from delivery.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

### Right to left

In a right-to-left region, the chevron points the other way and the panel text starts at the right edge. The accordion follows the `dir` attribute on itself or any ancestor, so you can set it once near the top of your app.

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";

// `dir` is the platform's attribute, not a prop this component
// invented: put it here or on any ancestor and the chevron turns
// and the panel's inset mirrors. Most apps state it once, high up.
export default function Example() {
  return (
    <Accordion dir="rtl" defaultValue={["shipping"]} style={{ width: "22rem", maxWidth: "100%" }}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders ship within two business days.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days to return.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Stacking the sections

#### Accordion

Accordion stacks sections under headings that people press to show or hide the content.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the accordion, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### AccordionItem

One section, which holds a trigger and a panel. Its `value` is the name that the root's `value` and `defaultValue` arrays use

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### Opening and closing one

#### AccordionTrigger

The heading of the section. It renders a heading element at the level you set, with a button inside it that is as tall as a Button of the same size

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `headingLevel?` | `2 \| 3 \| 4 \| 5 \| 6` | The heading level of the trigger, from `2` to `6`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### AccordionPanel

The content of the section, which shows while the section is open. Its text starts under the heading's label and matches the accordion's size

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
