# Breadcrumb

Breadcrumb shows where the current page sits in your app, with a link back to each level above it.

Job: Go. Move to another place in the app. A leaf: it does one thing.

```tsx
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbEllipsis items={hidden} />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
  </BreadcrumbItem>
</Breadcrumb>
```

## Overview

Breadcrumb shows the path from the top of your app to the current page. Every crumb before the last one links back to that level, and the last crumb names the current page as plain text.

Use a breadcrumb when pages sit several levels deep, such as folders, projects or settings sections. Don't use it for the steps of a process or for a history of pages you visited. To switch between views at the same level, use Tabs.

Each `BreadcrumbItem` draws the chevron that follows it, and the last item draws none, so you never place separators yourself. When a path is too long to show in full, keep the first crumb and the last few, and pass the levels in between to `BreadcrumbEllipsis` as `items`. The ellipsis is a button that opens a menu of those levels. Give each item an `href`, a `render` element or an `onClick`.

`size` sets the text size of the whole path, and the default is `2`. The colours are fixed: links use the muted text colour, the current page uses the full text colour, and the chevrons are fainter still. All three adjust for dark mode and high contrast.

Breadcrumb renders a `<nav>` landmark holding an ordered list, so a screen reader can find it and read it as a path. The landmark is named "Breadcrumb" unless you set `label`, which is how you name it in your app's language. The current page carries `aria-current="page"`. Tab moves through the links, and the arrow keys move through the ellipsis menu.

## Not supported

- `BreadcrumbSeparator` — Each item draws the chevron after it and the last item draws none, so separators are always in the right place without you adding them.
- `BreadcrumbList` — A breadcrumb is always a landmark that holds a list, so `Breadcrumb` renders both and there is nothing to choose between.
- `tone` and `emphasis` — A breadcrumb shows a location and carries no meaning to colour. Its three text colours are fixed so that every breadcrumb in your app looks the same.
- `maxItems` and any automatic collapse — Only you know which levels matter, so the component never drops any on its own. Render the crumbs you want to keep and pass the rest to `BreadcrumbEllipsis`.
- An ellipsis that does nothing — Three dots suggest there is more to see. `BreadcrumbEllipsis` requires `items`, so it always opens a menu of the hidden levels.
- Role=link and aria-disabled on the current page — The current page is neither a link nor disabled. It is plain text marked with `aria-current`, which is how a screen reader knows you are there.

## Examples

```tsx
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@kushagradhawan/kookie-ui-react";
import type { TypeSize } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: TypeSize }) {
  return (
    <Breadcrumb size={size}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbEllipsis
          items={[
            { label: "Docs", href: "#" },
            { label: "Foundations", href: "#" },
            { label: "Patterns", href: "#" },
          ]}
        />
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Components</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
```

### Sizes

Sizes 1, 2 and 3, set once on `Breadcrumb` and applied to every crumb and chevron. Size 2 suits most page headers, and size 3 works beside a large title.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3"] as const;

export default function Example() {
  return (
    <Stack gap="4">
      {SIZES.map((size) => (
        <Breadcrumb key={size} size={size} label={`Path at size ${size}`}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Website redesign</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      ))}
    </Stack>
  );
}
```

### A path with two levels

A breadcrumb with one link and the current page is still useful, because it gives you one clear way back to the list you came from.

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="#">Billing</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Invoice INV-0042</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
```

### Hidden levels in a menu

The first crumb and the last ones stay visible, and the folders in between open from the ellipsis. Each hidden item here uses `onClick`, for levels your app opens in code rather than by URL.

```tsx
"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

const HIDDEN = ["Clients", "Northwind", "2026", "Quarterly reports"];

export default function Example() {
  const [opened, setOpened] = React.useState<string | null>(null);

  return (
    <Stack gap="4">
      <Breadcrumb label="Folder path">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">All files</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis
            label="Show hidden folders"
            items={HIDDEN.map((name) => ({ label: name, onClick: () => setOpened(name) }))}
          />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Q3</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Revenue summary.pdf</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Text size="2" emphasis="medium">
        {opened ? `Opened the ${opened} folder.` : "Open the menu to go to a hidden folder."}
      </Text>
    </Stack>
  );
}
```

### Above a page title

Put the breadcrumb above the page heading, with the page's actions on the same line as the heading. The last crumb matches the heading, so you can always see where you are.

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Button,
  Flex,
  Heading,
  Stack,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ minWidth: "24rem" }}>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Members</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Shruti Bhatia</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
      <Flex justify="space-between" align="center" gap="4">
        <Heading size="6" render={<h1 />}>
          Shruti Bhatia
        </Heading>
        <Flex gap="2">
          <Button>Reset password</Button>
          <Button emphasis="loud">Edit role</Button>
        </Flex>
      </Flex>
    </Stack>
  );
}
```

### Right to left

Set `dir="rtl"` on the breadcrumb or on any ancestor, and the path reads from the right with the chevrons pointing the other way. Use `label` to name the landmark in the page's language.

```tsx
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@kushagradhawan/kookie-ui-react";

// `dir` is the platform attribute. Set it here or on any ancestor, and the chevrons point
// the other way.
export default function Example() {
  return (
    <Box dir="rtl" lang="ar">
      <Breadcrumb label="مسار الصفحة">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">الرئيسية</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">المشاريع</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>الإعدادات</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    </Box>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Drawing the path

#### Breadcrumb

Breadcrumb shows where the current page sits in your app, with a link back to each level above it.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `label?` | `string` | The accessible name of the `<nav>` landmark. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | Sets the text size of every item in the breadcrumb. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<nav>`.

#### BreadcrumbItem

One level of the path, together with the chevron that follows it. The last item shows no chevron

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<li>`.

### The levels above the current page

#### BreadcrumbLink

A level above the current page, as a link back to it. It uses the muted text colour rather than the accent colour a `Link` uses

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `render?` | `RenderElement` | Renders the link as your framework's own link component, or as an `<a>` with `target` and `rel`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<a>`.

#### BreadcrumbEllipsis

A button that stands in for the hidden levels and opens a menu of them when pressed

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `items` | `BreadcrumbEllipsisItem[]` | The hidden levels, in path order. |
| `label?` | `string` | The accessible name of the ellipsis button. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### The current page

#### BreadcrumbPage

The current page at the end of the path, in the full text colour and marked with `aria-current="page"`. It is plain text, because there is nowhere to go

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<span>`.
