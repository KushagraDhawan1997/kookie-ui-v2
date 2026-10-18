# Nav Tree

NavTree shows a site's navigation as sections that open and close, with a link for each page.

Job: Go. Move to another place in the app. A leaf: it does one thing.

```tsx
<NavTree items={chapters} currentId={pathname} defaultExpandedIds={["start"]} />
```

## Overview

Use a NavTree for navigation that is grouped into sections, such as an app's sidebar or a list of documentation chapters. The sidebar on this site is one. When pressing a row should select it rather than go somewhere, use a Tree.

A NavTree takes the same data and draws the same indent and disclosure arrow as a Tree. A node with `children` is a section, which is a button that opens and closes its pages. A node with `href` is a page, which is a real link. A node with neither is plain text, unless you provide `renderLink`.

Set `currentId` to the id of the page that is open, and that row is highlighted and marked with `aria-current="page"`. To render each page as your router's link component, use `renderLink`.

Rows are size 2 by default, and each row is as tall as a Button at the same size. One level of indent is the width of one icon, so it follows `size` too.

The NavTree uses ordinary keyboard navigation: Tab moves between sections and pages, Enter or Space opens and closes a section, and Enter follows a link. Because it renders a plain container, put it inside a `<nav>` element with an `aria-label`.

## Not supported

- `role="tree"` — A tree role tells screen readers to expect selection and arrow-key navigation, which navigation does not have. Sections are buttons and pages are links instead.
- Selection — Navigation has a current page rather than a selection. If people choose rows instead of visiting them, use a Tree.
- Arrow-key navigation — The NavTree holds ordinary links, so Tab moves between them and Enter follows them, as in any other navigation.
- An `indent` prop — One level of indent is always one icon wide at the current size, so the indent follows `size`.

## Examples

```tsx
import { Box, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const chapters: readonly TreeNode[] = [
  {
    id: "start",
    label: "Getting started",
    children: [
      { id: "/start/installation", label: "Installation", href: "#" },
      { id: "/foundations/appearance", label: "Appearance", href: "#" },
    ],
  },
  {
    id: "patterns",
    label: "Patterns",
    children: [
      { id: "/start/composition", label: "Composition", href: "#" },
      { id: "/patterns/forms", label: "Forms", href: "#" },
    ],
  },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <NavTree
        items={chapters}
        defaultExpandedIds={["start"]}
        currentId="/start/installation"
      />
    </Box>
  );
}
```

### In a sidebar

The NavTree sits inside a named `nav` element, so screen readers list it with the page's other landmarks. Top-level pages and sections sit side by side.

```tsx
import { Box, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  { id: "/overview", label: "Overview", href: "#" },
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "/projects/billing", label: "Billing service", href: "#" },
      { id: "/projects/marketing", label: "Marketing site", href: "#" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "/settings/general", label: "General", href: "#" },
      { id: "/settings/members", label: "Members", href: "#" },
      { id: "/settings/billing", label: "Billing", href: "#" },
    ],
  },
];

// NavTree renders a plain container. Put it in a `nav` element with a name,
// so a screen reader lists it with the other landmarks on the page.
export default function Example() {
  return (
    <Box render={<nav aria-label="Workspace" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["settings"]} currentId="/settings/members" />
    </Box>
  );
}
```

### Sizes

The same NavTree at sizes 1 to 3. `size` sets the row height, the text and the indent together, and rows are size 2 by default.

```tsx
import { Box, Grid, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "guides",
    label: "Guides",
    children: [
      { id: "/guides/deploy", label: "Deploy", href: "#" },
      { id: "/guides/domains", label: "Domains", href: "#" },
    ],
  },
  { id: "/changelog", label: "Changelog", href: "#" },
];

const sizes: Size[] = ["1", "2", "3"];

// `size` sets the height of every row, the text and the indent together.
// Rows rest at size 2. Each row is as tall as a Button of the same size.
export default function Example() {
  return (
    <Grid gap="5" columns="repeat(3, minmax(0, 1fr))">
      {sizes.map((size) => (
        <Box key={size} render={<nav aria-label={`Guides at size ${size}`} />}>
          <NavTree
            size={size}
            items={pages}
            defaultExpandedIds={["guides"]}
            currentId="/guides/deploy"
          />
        </Box>
      ))}
    </Grid>
  );
}
```

### With icons

Each node has an icon in `leading`, shown after the disclosure arrow. The icon follows the row's size, so you do not size it yourself.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book02Icon,
  CodeIcon,
  Home01Icon,
  PaintBrush01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { Box, NavTree, iconStroke, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const pages: readonly TreeNode[] = [
  { id: "/", label: "Home", href: "#", leading: icon(Home01Icon) },
  {
    id: "docs",
    label: "Documentation",
    leading: icon(Book02Icon),
    children: [
      { id: "/docs/start", label: "Getting started", href: "#", leading: icon(Rocket01Icon) },
      { id: "/docs/theming", label: "Theming", href: "#", leading: icon(PaintBrush01Icon) },
      { id: "/docs/api", label: "API reference", href: "#", leading: icon(CodeIcon) },
    ],
  },
];

// Set `leading` on a node to show an icon after the disclosure arrow.
// The icon takes the row's size, so you set no size on it.
export default function Example() {
  return (
    <Box render={<nav aria-label="Documentation" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["docs"]} currentId="/docs/theming" />
    </Box>
  );
}
```

### Controlled

The open sections live in the example's own state through `expandedIds` and `onExpandedChange`, so the two buttons can open or close every section at once.

```tsx
"use client";

import * as React from "react";
import { Box, Button, Flex, NavTree, Stack, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "projects",
    label: "Projects",
    children: [
      { id: "/projects/billing", label: "Billing service", href: "#" },
      { id: "/projects/docs", label: "Docs", href: "#" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "/settings/general", label: "General", href: "#" },
      { id: "/settings/members", label: "Members", href: "#" },
    ],
  },
];

const sections = ["projects", "settings"];

// Pass `expandedIds` and `onExpandedChange` to keep the open sections in your
// own state. Here two buttons open or close every section at once.
export default function Example() {
  const [expanded, setExpanded] = React.useState<string[]>(["projects"]);

  return (
    <Stack gap="4" style={{ width: "18rem" }}>
      <Flex gap="2">
        <Button onClick={() => setExpanded(sections)}>Expand all</Button>
        <Button onClick={() => setExpanded([])}>Collapse all</Button>
      </Flex>
      <Box render={<nav aria-label="Workspace" />}>
        <NavTree
          items={pages}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          currentId="/projects/billing"
        />
      </Box>
    </Stack>
  );
}
```

### Router links

`renderLink` returns the element that each page renders as, which in a real app is your router's link component. Here the link updates `currentId` instead of navigating.

```tsx
"use client";

import * as React from "react";
import { Box, NavTree, Stack, Text, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "account",
    label: "Account",
    children: [
      { id: "/account/profile", label: "Profile", href: "/account/profile" },
      { id: "/account/security", label: "Security", href: "/account/security" },
      { id: "/account/billing", label: "Billing", href: "/account/billing" },
    ],
  },
];

// `renderLink` returns the element each page renders as, such as your router's
// link component. This one updates `currentId` in place of a real navigation.
export default function Example() {
  const [current, setCurrent] = React.useState("/account/profile");

  return (
    <Stack gap="3" style={{ width: "18rem" }}>
      <Box render={<nav aria-label="Account" />}>
        <NavTree
          items={pages}
          defaultExpandedIds={["account"]}
          currentId={current}
          renderLink={(node) => (
            <a
              href={node.href}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(node.id);
              }}
            />
          )}
        />
      </Box>
      <Text size="2" emphasis="medium">
        Current page: {current}
      </Text>
    </Stack>
  );
}
```

### Right to left

Inside `dir="rtl"`, the indent moves to the right edge and the disclosure arrow points the other way.

```tsx
import { Box, NavTree, type TreeNode } from "@kushagradhawan/kookie-ui-react";

const pages: readonly TreeNode[] = [
  {
    id: "settings",
    label: "الإعدادات",
    children: [
      { id: "/settings/general", label: "عام", href: "#" },
      { id: "/settings/members", label: "الأعضاء", href: "#" },
    ],
  },
  { id: "/help", label: "المساعدة", href: "#" },
];

// Set `dir="rtl"` on the NavTree or on any ancestor. The indent moves to the
// right edge, and the disclosure arrow turns to point the other way.
export default function Example() {
  return (
    <Box dir="rtl" render={<nav aria-label="الإعدادات" />} style={{ width: "16rem" }}>
      <NavTree items={pages} defaultExpandedIds={["settings"]} currentId="/settings/members" />
    </Box>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `currentId?` | `string \| null` | The id of the node for the current page. |
| `defaultExpandedIds?` | `readonly string[]` | Uncontrolled starting expansion. |
| `expandedIds?` | `readonly string[]` | Controlled expansion, paired with `onExpandedChange`. |
| `items` | `readonly TreeNode[]` | The hierarchy, as data. |
| `onExpandedChange?` | `(ids: string[]) => void` | Fires when a section opens or closes, with the whole expanded set. |
| `renderLink?` | `(node: TreeNode) => RenderElement` | Renders each leaf as your router's link, for example `renderLink={(node) => <Link href={node.href!} />}`. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the rows. |

It also takes every prop of a `<div>`.
