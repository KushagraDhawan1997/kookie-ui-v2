# Tabs

Tabs lets people switch between several views of the same subject and shows which view is open.

Job: Go. Move to another place in the app. A leaf: it does one thing.

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="activity">…</TabsPanel>
</Tabs>
```

## Overview

Use Tabs to switch between views of one subject, such as the overview, activity and settings of a project. Selecting a tab shows its panel under the bar, and only one panel shows at a time. To choose a value that changes content in place, such as a list or grid view, use a `SegmentedControl`. For actions, use a `Menu`.

The open tab has full-strength text and a line under it in the accent colour, and the other tabs have muted text. The open tab doesn't get a fill or a heavier weight, because heavier text is wider and the bar would shift each time the tab changed.

Set `size` on `TabsList`, and every tab in the bar uses it. Tabs are always horizontal. To make each tab a link to a separate page, use `render` on `TabsTab`.

A screen reader announces a tab list, its tabs and their panels. Tab moves focus into the bar, the arrow keys move focus between tabs, and Enter or Space opens the focused tab. A disabled tab can still receive focus, but it can't be opened.

## Use instead

- `SegmentedControl` when the options filter or change one view that stays on screen.
- `Accordion` when people may want several sections open, stacked on one page.

## Not supported

- `tone` and `emphasis` — The only thing that sets one tab apart is whether it is open, and the bar already shows that. A colour or a louder style on a tab would compete with it.
- TabsTrigger and TabsContent — In this library a trigger is something that opens a floating layer, such as a menu, and a tab opens nothing. The parts are called `TabsTab` and `TabsPanel`, after the roles a screen reader announces.
- `material` — A tab bar has no background of its own, so there is nothing for the glass material to apply to.
- An indicator part — `TabsList` draws and places the line under the open tab for you, so there is nothing to add and nothing to forget.

## Examples

```tsx
import { Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList size={size}>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
      </TabsList>
    </Tabs>
  );
}
```

### With panels

Give each `TabsPanel` the same `value` as its tab. The panel for the open tab shows and the others are hidden. A panel has no fill or border of its own.

```tsx
import { Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Tabs defaultValue="overview" style={{ maxWidth: "32rem" }}>
      <Stack gap="4">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
          <TabsTab value="settings">Settings</TabsTab>
        </TabsList>
        <TabsPanel value="overview">
          <Text size="3">Website redesign is 64% complete and due on Friday.</Text>
        </TabsPanel>
        <TabsPanel value="activity">
          <Text size="3">Shruti Bhatia uploaded three files an hour ago.</Text>
        </TabsPanel>
        <TabsPanel value="settings">
          <Text size="3">Only project owners can change these settings.</Text>
        </TabsPanel>
      </Stack>
    </Tabs>
  );
}
```

### Sizes

Set `size` on `TabsList` to change the height and text of every tab in the bar. Use size 2 in most places, and match the size of the controls near the bar.

```tsx
import { Stack, Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="5">
      {sizes.map((size) => (
        <Tabs key={size} defaultValue="files">
          <TabsList size={size}>
            <TabsTab value="files">Files</TabsTab>
            <TabsTab value="people">People</TabsTab>
            <TabsTab value="billing">Billing</TabsTab>
          </TabsList>
        </Tabs>
      ))}
    </Stack>
  );
}
```

### Controlled

Pass `value` and `onValueChange` to keep the open tab in your app. Use this when something outside the bar must change the tab, such as a button or the URL. When nothing else depends on it, use `defaultValue`.

```tsx
"use client";

import * as React from "react";
import { Button, Flex, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [tab, setTab] = React.useState("monthly");

  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <Stack gap="4">
          <TabsList>
            <TabsTab value="monthly">Monthly</TabsTab>
            <TabsTab value="yearly">Yearly</TabsTab>
          </TabsList>
          <TabsPanel value="monthly">
            <Text size="3">£20 per seat, billed every month.</Text>
          </TabsPanel>
          <TabsPanel value="yearly">
            <Text size="3">£192 per seat, billed once a year.</Text>
          </TabsPanel>
        </Stack>
      </Tabs>
      <Flex gap="3" align="center">
        <Button onClick={() => setTab("yearly")}>Show yearly price</Button>
        <Text size="2" emphasis="medium">
          Showing: {tab}
        </Text>
      </Flex>
    </Stack>
  );
}
```

### Disabled

Set `disabled` on a `TabsTab` to stop people from opening it. The tab dims but stays in place, so tell people elsewhere why the view isn't available.

```tsx
import { Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTab value="general">General</TabsTab>
        <TabsTab value="members">Members</TabsTab>
        <TabsTab value="sso" disabled>
          Single sign-on
        </TabsTab>
      </TabsList>
    </Tabs>
  );
}
```

### As links

Use `render` with an `a` element when each tab is a separate page, so every tab is a real link with an `href`. Set the open tab from the current page's address.

```tsx
import { Tabs, TabsList, TabsTab } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Tabs defaultValue="/settings/profile">
      <TabsList>
        <TabsTab value="/settings/profile" render={<a href="#profile" />}>
          Profile
        </TabsTab>
        <TabsTab value="/settings/security" render={<a href="#security" />}>
          Security
        </TabsTab>
        <TabsTab value="/settings/billing" render={<a href="#billing" />}>
          Billing
        </TabsTab>
      </TabsList>
    </Tabs>
  );
}
```

### In a card

Put Tabs in a `Card` to switch between views inside one object. The bar has no fill, so the card's fill shows through, and the line under the bar runs the full width of the card's content.

```tsx
import {
  Card,
  Heading,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "28rem" }}>
      <Stack gap="4">
        <Heading size="6">Deployments</Heading>
        <Tabs defaultValue="production">
          <Stack gap="4">
            <TabsList>
              <TabsTab value="production">Production</TabsTab>
              <TabsTab value="preview">Preview</TabsTab>
            </TabsList>
            <TabsPanel value="production">
              <Text size="2" emphasis="medium">
                Last deployed 12 minutes ago by Shruti Bhatia.
              </Text>
            </TabsPanel>
            <TabsPanel value="preview">
              <Text size="2" emphasis="medium">
                Four preview builds are running.
              </Text>
            </TabsPanel>
          </Stack>
        </Tabs>
      </Stack>
    </Card>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Switching between views

#### Tabs

Tabs lets people switch between several views of the same subject and shows which view is open.

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.

#### TabsList

The bar that holds the tabs, with the thin line along its bottom. Set `size` here, and the bar draws the line under the open tab for you

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the tab bar, from `1` to `4`. |

#### TabsTab

One tab. It is as tall as a control of the same size, and it shows that it is open through its text colour and the line under it

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

### What a tab reveals

#### TabsPanel

The content that its tab shows. It draws no box of its own, so put a `Card` inside it if the content needs one

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
