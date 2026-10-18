# Row

Row is one line in a list that people pick from, such as search results or a settings list.

Job: Browse. Scan a collection and find one item. A leaf: it does one thing.

```tsx
<Row current trailing={<Text emphasis="quiet">12</Text>}>
  Environments
</Row>
```

## Overview

Use a Row for one line in a list that people pick from, such as search results, a list of commands, a settings list or a list of files. It looks and behaves like a menu item or a sidebar item. To build the list, put the Rows in a Stack.

Inside a Menu, use `MenuItem` instead. To let someone choose one option from several as a form value, use a RadioGroup. The `current` prop only marks the page or file that is open now: it highlights the Row and sets `aria-current`.

A Row is as tall as a Button at the same `size`, so it lines up with the Buttons around it. Put an icon, an avatar or a tick in `leading`, and a count, a shortcut or a chevron in `trailing`.

A Row renders as a button by default. Pass `render={<a href="…" />}` for a Row that goes to another page, or `render={<div />}` for a Row that only shows information. Set `disabled` to keep a Row visible while it is unavailable, and `tone="destructive"` for the one action that deletes something.

By default a Row lights up when the pointer is over it. When your list moves a highlight with the arrow keys, pass `highlighted` to every Row, even when it is `false`. The Rows then light up only when `highlighted` is true and ignore the pointer.

A Row has no keyboard behaviour of its own. Your list sets the role, such as `listbox` or `list`, and handles the keys, because only the list knows what its Rows mean.

## Not supported

- `emphasis` — The Rows in a list are equals, so none of them should look more important than the others. Use `tone="destructive"` for the one row that deletes something.
- A keyboard model — Only your list knows how its rows should be navigated. Handle the keys in the list and pass `highlighted` to show which row is active.
- A `selected` prop — Choosing one option from several is a form value, so use a RadioGroup for it. Use `current` to mark the page or file that is open.
- A List component — Use a Stack to arrange the rows, and set the list's role yourself, because the right role depends on what the rows mean.
- The shorter height of a menu row — A Row sits next to ordinary Buttons, so it matches their height. The shorter rows belong to menus, which are only open for a moment, so use a Menu when you want them.

## Examples

```tsx
import { Row, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="1" style={{ minWidth: "18rem" }}>
      <Row size={size} current>Overview</Row>
      <Row size={size}>Deployments</Row>
      <Row size={size} trailing={<Text size="2" emphasis="quiet">12</Text>}>Environments</Row>
      <Row size={size} disabled>Billing</Row>
      <Row size={size} tone="destructive">Delete project</Row>
    </Stack>
  );
}
```

### Sizes

The same Row at sizes 1 to 4. `size` sets the height, the text and the icon, and a Row is as tall as a Button at the same size, so a list lines up with a toolbar beside it.

```tsx
import { Row, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ minWidth: "18rem" }}>
      <Row size="1">Deployments at size 1</Row>
      <Row size="2">Deployments at size 2</Row>
      <Row size="3">Deployments at size 3</Row>
      <Row size="4">Deployments at size 4</Row>
    </Stack>
  );
}
```

### Icons, counts and shortcuts

Each Row has an icon in `leading` and a chevron, a file size or a shortcut in `trailing`. The trailing content sits against the far edge of the Row.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, File01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { Kbd, Row, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof File01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "20rem" }}>
      <Row leading={icon(Folder01Icon)} trailing={icon(ArrowRight01Icon)}>
        Invoices
      </Row>
      <Row leading={icon(File01Icon)} trailing={<Text size="2" emphasis="quiet">2.4 MB</Text>}>
        q3-summary.pdf
      </Row>
      <Row leading={icon(File01Icon)} trailing={<Kbd>⌘O</Kbd>}>
        Open recent file
      </Row>
    </Stack>
  );
}
```

### Rows that go to another page

Each Row is passed an anchor through `render`, so it is a real link. The Billing row has `current`, which highlights it and tells screen readers that it is the current item.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Home01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Row, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const LINKS = [
  { href: "#overview", label: "Overview", glyph: Home01Icon },
  { href: "#members", label: "Members", glyph: UserIcon },
  { href: "#billing", label: "Billing", glyph: CreditCardIcon },
  { href: "#settings", label: "Settings", glyph: Settings01Icon },
];

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "16rem" }} render={<nav aria-label="Workspace" />}>
      {LINKS.map((link) => (
        <Row
          key={link.href}
          render={<a href={link.href} />}
          leading={icon(link.glyph)}
          current={link.label === "Billing"}
        >
          {link.label}
        </Row>
      ))}
    </Stack>
  );
}
```

### A highlight moved by the keyboard

Focus stays in the search field while the arrow keys move the highlight through the results. Every Row receives `highlighted`, so the pointer cannot light a second Row at the same time.

```tsx
"use client";

import * as React from "react";
import { Field, FieldLabel, Row, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

const COMMANDS = ["Create project", "Invite a member", "Open billing", "Rotate API key", "Sign out"];

export default function Example() {
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const results = COMMANDS.filter((command) =>
    command.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Stack gap="3" style={{ minWidth: "20rem" }}>
      <Field>
        <FieldLabel>Search commands</FieldLabel>
        <TextField
          value={query}
          placeholder="Type to filter"
          aria-controls="command-results"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(index - 1, 0));
            }
          }}
        />
      </Field>
      <Stack gap="1" id="command-results" role="listbox" aria-label="Commands">
        {results.map((command, index) => (
          <Row
            key={command}
            role="option"
            aria-selected={index === active}
            highlighted={index === active}
            tabIndex={-1}
          >
            {command}
          </Row>
        ))}
      </Stack>
    </Stack>
  );
}
```

### A list you only read

Each Row is rendered as a `<div>`, because these rows show information and do nothing when pressed. The layout stays the same, but there is no hover or focus.

```tsx
import { Card, Heading, Row, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const DETAILS = [
  { label: "Plan", value: "Team" },
  { label: "Seats", value: "12 of 15" },
  { label: "Renews", value: "1 October" },
  { label: "Owner", value: "Shruti Bhatia" },
];

export default function Example() {
  return (
    <Card style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="6">Subscription</Heading>
        <Stack gap="1" role="list">
          {DETAILS.map((detail) => (
            <Row
              key={detail.label}
              render={<div role="listitem" />}
              trailing={<Text size="2" emphasis="medium">{detail.value}</Text>}
            >
              {detail.label}
            </Row>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
```

### An action that deletes

Only the delete action has `tone="destructive"`, which makes it stand out from the ordinary actions above it.

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Delete02Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { Row, Separator, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Copy01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "18rem" }}>
      <Row leading={icon(Share08Icon)} onClick={() => {}}>
        Share project
      </Row>
      <Row leading={icon(Copy01Icon)} onClick={() => {}}>
        Duplicate project
      </Row>
      <Separator />
      <Row leading={icon(Delete02Icon)} tone="destructive" onClick={() => {}}>
        Delete project
      </Row>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `current?` | `boolean` | Marks the row as the current location, such as the page you are on or the open file. |
| `disabled?` | `boolean` | Disables the row. |
| `highlighted?` | `boolean` | Highlights the row from your code. |
| `leading?` | `React.ReactNode` | Content before the label, such as an icon, an avatar or a tick. |
| `render?` | `RenderElement` | Renders the row as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the height of the row. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family of the row. |
| `trailing?` | `React.ReactNode` | Content at the far end of the row, such as a shortcut, a count or a chevron. |

It also takes every prop of a `<button>`.
