# Scroll Area

ScrollArea draws its own scrollbars over the browser's native scrolling.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<ScrollArea style={{ height: "10rem" }}>
  …
</ScrollArea>
```

## Overview

Use a ScrollArea when content needs to scroll inside a box, such as a long list in a card or a panel. The browser still does the scrolling, so the wheel, trackpad, touch and keyboard behave as usual, while a slim rounded bar is drawn over the content instead of the browser's own scrollbar.

The bar appears while you scroll or point at the area and is hidden the rest of the time. It takes up no space, and it appears only for a direction that has more content, so you never choose horizontal or vertical.

A ScrollArea needs a limit before it can scroll. Give it a `height` or `maxHeight` through `style`, or put it inside a Shell pane or another container with a fixed height. Without a limit it grows with its content.

Set `fade` to fade the content out at any edge that has more content beyond it. When a ScrollArea is the only child of a `Card` or another surface, it reaches the surface's edges and moves the surface's padding inside itself.

When its content overflows, a ScrollArea is a tab stop, so keyboard users can focus it and scroll with the arrow keys. Name it with `aria-label` or `aria-labelledby`, and screen readers announce it as a region. Set `focusable={false}` only inside a component that already handles scrolling from the keyboard, such as a menu.

## Not supported

- `size` — The scrollbar has one designed thickness. The size of the scrolling area comes from the height you give it.
- `tone` and `emphasis` — A scrollbar only shows where you are in the content, so it carries no colour meaning and nothing to rank.
- `material` — A ScrollArea sits inside a pane, and that pane already uses the theme's material.
- `render` — A ScrollArea is made of several nested elements that must stay in a fixed structure. Wrap it in your own element when you need one around it.
- `orientation` — The scrollbar appears for whichever direction actually overflows, so there is nothing to choose.

## Examples

```tsx
import { ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ScrollArea style={{ height: "160px", width: "20rem" }}>
      <Stack gap="4">
        {Array.from({ length: 12 }, (_, i) => (
          <Text key={i} size="2" emphasis="medium">Row {i + 1} of a list taller than its box.</Text>
        ))}
      </Stack>
    </ScrollArea>
  );
}
```

### Faded edges

With `fade`, the content fades out at an edge while more of it is hidden past that edge. An edge with nothing beyond it does not fade, so the fade shows whether the list continues.

```tsx
import { ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const RELEASES = [
  "Faster search across all projects",
  "Invoices now download as PDF",
  "Dark mode follows the system setting",
  "Keyboard shortcuts for every menu",
  "Shared links expire after 30 days",
  "Audit log export to CSV",
  "Two-factor sign-in with passkeys",
  "Bulk move for archived files",
  "Comments show who edited last",
  "New billing page for team owners",
];

// `fade` makes the content fade out at an edge while more of it is hidden past that edge.
// An edge with nothing behind it does not fade.
export default function Example() {
  return (
    <ScrollArea fade aria-label="Release notes" style={{ height: "12rem", width: "22rem" }}>
      <Stack gap="4">
        {RELEASES.map((note) => (
          <Text key={note} size="2">
            {note}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  );
}
```

### Sideways scrolling

A row of cards that is wider than its box scrolls sideways. ScrollArea shows a bar only for the direction that overflows, so you never choose an orientation.

```tsx
import { Card, Flex, ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const PROJECTS = ["Website", "Mobile app", "Brand kit", "Docs", "Onboarding", "Billing", "Analytics"];

// Content wider than its box scrolls sideways. ScrollArea shows a bar only for the
// direction that overflows, so you do not choose one.
export default function Example() {
  return (
    <ScrollArea aria-label="Recent projects" style={{ width: "24rem" }}>
      <Flex gap="3">
        {PROJECTS.map((name) => (
          <Card key={name} style={{ flexShrink: 0, width: "9rem" }}>
            <Stack gap="1">
              <Text size="2" weight="medium">
                {name}
              </Text>
              <Text size="2" emphasis="medium">
                Edited today
              </Text>
            </Stack>
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  );
}
```

### In a card

When a ScrollArea is the only child of a Card, it reaches the card's edges and moves the card's padding inside itself, so the bar runs along the card's own edge.

```tsx
import { Card, Flex, ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const MEMBERS = [
  ["Shruti Bhatia", "Owner"],
  ["Design team", "Editor"],
  ["Marketing", "Viewer"],
  ["Support", "Viewer"],
  ["Finance", "Viewer"],
  ["Engineering", "Editor"],
  ["Contractors", "Viewer"],
  ["Legal", "Viewer"],
];

// When a ScrollArea is the only child of a Card, it reaches the card's edges and puts the
// card's padding inside itself. The bar then runs along the card's own edge.
export default function Example() {
  return (
    <Card style={{ width: "20rem" }}>
      <ScrollArea aria-label="Members" style={{ maxHeight: "14rem" }}>
        <Stack gap="4">
          {MEMBERS.map(([name, role]) => (
            <Flex key={name} justify="space-between">
              <Text size="2">{name}</Text>
              <Text size="2" emphasis="medium">
                {role}
              </Text>
            </Flex>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
```

### A named scroll region

This ScrollArea is named by the heading above it through `aria-labelledby`, so screen readers announce it as a region that keyboard users can scroll.

```tsx
import { Heading, ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A ScrollArea is a tab stop, so keyboard users can scroll it with the arrow keys. Name it
// with `aria-labelledby` or `aria-label`, and a screen reader announces it as a region.
export default function Example() {
  return (
    <Stack gap="3" width="22rem">
      <Heading size="4" id="terms-heading">
        Terms of service
      </Heading>
      <ScrollArea aria-labelledby="terms-heading" style={{ height: "10rem" }}>
        <Stack gap="4">
          <Text size="2">
            These terms apply to every workspace you create or join. By using the service you
            agree to them.
          </Text>
          <Text size="2">
            You keep ownership of the files you upload. We store them only to provide the
            service to you and your team.
          </Text>
          <Text size="2">
            You can export or delete your data at any time from the settings page. Deleted data
            is removed from backups within 30 days.
          </Text>
          <Text size="2">
            We may change these terms. We tell you by email at least 14 days before a change
            takes effect.
          </Text>
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name of the scroll area. |
| `aria-labelledby?` | `string` | The id of an element that names the scroll area, usually a heading above it. |
| `children?` | `React.ReactNode` | The content that scrolls. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `fade?` | `boolean` | Fades the content at each edge that has more content beyond it. |
| `focusable?` | `boolean` | Whether keyboard users can tab to the scroll area. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved.  |
