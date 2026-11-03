# Row Group

RowGroup is a grouped list: a small label, a card of rows with a divider between each, and an optional note.

Job: Arrange. Place things on the page. This is your job, not the person's. A pattern: it owns the decisions this job needs.

```tsx
<RowGroup label="Notifications" note="We only email you about your projects.">
  <Row render={<label />} trailing={<Switch />}>Email</Row>
</RowGroup>
```

## Overview

Use a RowGroup for a list of settings, or for a section of an inspector. It shows a small label, a card holding the rows with a divider between each pair, and an optional note under the card. The label also names the group for screen readers.

The rows are ordinary `Row`s. For a setting that turns on and off, render the Row as a `label` with a `Switch` in `trailing`, so a press anywhere on the row toggles it. For a row that goes somewhere, render it as a link, or use a `NavigatorLink` inside a `Navigator`.

The dividers start where the rows' text starts, so they separate the items without cutting across the card. Use the note for a consequence or a limit, not to repeat the label.

## Not supported

- Its own row props — The rows are `Row`s with their own props, so there is one way to write a row inside a group and outside one.
- A divider style — The dividers are the system's one hairline. A thicker or full-width divider would read as a break between groups, which is what the space between two RowGroups is for.
- A header action — An action that belongs to the whole group goes in a row of its own, or in the toolbar above the page.

## Example

```tsx
"use client";

import { Row, RowGroup, Stack, Switch } from "@kushagradhawan/kookie-ui-react";

import { ChevronRightIcon } from "../app/icons";

export default function Example() {
  return (
    <Stack gap="6" style={{ maxWidth: "26rem" }}>
      <RowGroup label="Notifications" note="We only email you about your own projects.">
        <Row render={<label />} trailing={<Switch defaultChecked />}>
          Email
        </Row>
        <Row render={<label />} trailing={<Switch />}>
          Push
        </Row>
        <Row render={<label />} trailing={<Switch defaultChecked />}>
          Weekly summary
        </Row>
      </RowGroup>
      <RowGroup label="Account">
        <Row render={<a href="#password" />} trailing={<ChevronRightIcon />}>
          Password
        </Row>
        <Row render={<a href="#export" />} trailing={<ChevronRightIcon />}>
          Export data
        </Row>
        <Row tone="destructive">Sign out</Row>
      </RowGroup>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `React.ReactNode` | The rows, usually `Row`s. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `label?` | `string` | A short label above the rows, such as "Notifications". |
| `note?` | `React.ReactNode` | A sentence under the rows that says something the rows can't: a consequence, a limit or who sees it. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size of the rows' box and dividers. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
