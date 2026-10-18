# Toggle

Toggle is a button that stays pressed until you press it again, for things like bold text or a filter.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<ToggleGroup aria-label="Format" defaultValue={["bold"]}>
  <Toggle value="bold" aria-label="Bold">{icon}</Toggle>
  <Toggle value="italic" aria-label="Italic">{icon}</Toggle>
</ToggleGroup>
```

## Overview

Use a `Toggle` for something that is on or off while you work, such as bold in a formatting bar, a filter, or a panel that you show or hide. When the person must pick exactly one of several options, use a `SegmentedControl`. Use a `Switch` for a saved setting, a `Checkbox` for an option in a form, and a `Button` for an action that runs and finishes.

A Toggle looks and behaves like a `Button`, except that its state sets its style. It is quiet when off and gets a soft fill when pressed, so it has no `emphasis` prop. `tone` gives the toggle a meaning, such as `destructive` when turning it on blocks something.

Use a `ToggleGroup` for several toggles that share one array of pressed values, such as bold, italic and underline. Each toggle in the group still turns on and off by itself. The group has no layout of its own, so use `render` to make it a `Flex` or a `Stack`.

A screen reader announces a Toggle as a button that is pressed or not pressed, and Space or Enter changes it. In a `ToggleGroup`, the whole group is one tab stop, and the arrow keys move focus between the toggles without pressing them. Set `orientation` to `vertical` when the toggles run in a column.

## Use instead

- `Switch` when it is a setting that stays on or off.

## Not supported

- `emphasis` — A Toggle's style shows whether it is on: quiet when off and filled when pressed. Choosing an emphasis could make an unpressed toggle look pressed.
- `loading` — A Toggle changes state at once and never waits for work to finish. Use a `Button` with `loading` for a task that runs, or a `Switch` for a saved setting.
- A single-select group — A group where only one option can be on is a radio group. Use a `SegmentedControl` for that, so a screen reader announces it correctly.
- `render` — A Toggle is always a `button`, because its pressed state is announced through that element's attributes. Swapping the element would lose that announcement.

## Examples

```tsx
import { Flex, Toggle, ToggleGroup } from "@kushagradhawan/kookie-ui-react";
import type { Size, Tone } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  tone = "neutral",
  bordered = false,
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  bordered?: boolean;
  backdrop?: boolean;
}) {
  return (
    <ToggleGroup aria-label="Format" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="bold">
        Bold
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="italic">
        Italic
      </Toggle>
      <Toggle size={size} tone={tone} bordered={bordered} backdrop={backdrop} value="underline">
        Underline
      </Toggle>
    </ToggleGroup>
  );
}
```

### Sizes

`size` has the same four steps as `Button`, and a toggle and a button at the same size are the same height. Use size 2 in most places.

```tsx
import { Flex, Toggle } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Toggle size="1" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="2" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="3" defaultPressed>
        Show hidden files
      </Toggle>
      <Toggle size="4" defaultPressed>
        Show hidden files
      </Toggle>
    </Flex>
  );
}
```

### Icon only

Set `iconOnly` to make the toggle a square around one icon, as in a formatting bar. An icon-only toggle needs an `aria-label`, because the icon has no text for a screen reader.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import { Flex, Toggle, ToggleGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ToggleGroup aria-label="Text style" defaultValue={["bold"]} render={<Flex gap="1" />}>
      <Toggle value="bold" iconOnly aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
      <Toggle value="italic" iconOnly aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
      <Toggle value="underline" iconOnly aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
      </Toggle>
    </ToggleGroup>
  );
}
```

### With icons

Put an icon in `leading` or `trailing` beside the label. The theme sets the icon's size and the gap between it and the text.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, StarIcon } from "@hugeicons/core-free-icons";
import { Flex, Toggle, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="2" wrap="wrap">
      <Toggle
        defaultPressed
        leading={<HugeiconsIcon icon={StarIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Starred only
      </Toggle>
      <Toggle leading={<HugeiconsIcon icon={FilterIcon} strokeWidth={iconStroke} aria-hidden />}>
        Show filters
      </Toggle>
    </Flex>
  );
}
```

### Tones

`tone` sets what the toggle means, and its text and pressed fill take that tone's colour. Use `destructive` when turning the toggle on blocks or removes something.

```tsx
import { Flex, Toggle } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="2" wrap="wrap">
      <Toggle defaultPressed>Neutral</Toggle>
      <Toggle tone="accent" defaultPressed>
        Follow project
      </Toggle>
      <Toggle tone="destructive" defaultPressed>
        Block sign-ins
      </Toggle>
      <Toggle tone="destructive">Block sign-ins</Toggle>
    </Flex>
  );
}
```

### Bordered

Set `bordered` to add a thin border that stays in both states. Use it for a row of filters that should be visible before anyone presses them.

```tsx
import { Flex, Toggle, ToggleGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ToggleGroup aria-label="File types" defaultValue={["pdf"]} render={<Flex gap="2" wrap="wrap" />}>
      <Toggle bordered value="pdf">
        PDF
      </Toggle>
      <Toggle bordered value="images">
        Images
      </Toggle>
      <Toggle bordered value="video">
        Video
      </Toggle>
    </ToggleGroup>
  );
}
```

### Controlled

Pass `pressed` and `onPressedChange` to keep a single toggle's state in your app. For a group, pass `value` and `onValueChange` with an array of the pressed values.

```tsx
"use client";

import * as React from "react";
import { Flex, Stack, Text, Toggle, ToggleGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [muted, setMuted] = React.useState(false);
  const [days, setDays] = React.useState<string[]>(["mon", "wed"]);

  return (
    <Stack gap="4">
      <Flex gap="3" align="center">
        <Toggle pressed={muted} onPressedChange={setMuted}>
          Mute notifications
        </Toggle>
        <Text size="2" emphasis="medium">
          {muted ? "Notifications are muted." : "Notifications are on."}
        </Text>
      </Flex>
      <ToggleGroup
        aria-label="Backup days"
        value={days}
        onValueChange={(value) => setDays(value)}
        render={<Flex gap="1" />}
      >
        <Toggle value="mon">Mon</Toggle>
        <Toggle value="tue">Tue</Toggle>
        <Toggle value="wed">Wed</Toggle>
        <Toggle value="thu">Thu</Toggle>
        <Toggle value="fri">Fri</Toggle>
      </ToggleGroup>
      <Text size="2" emphasis="medium">
        Backups run on {days.length} {days.length === 1 ? "day" : "days"} a week.
      </Text>
    </Stack>
  );
}
```

### Disabled

Set `disabled` on a toggle to stop presses and grey it out, whether it is pressed or not. Set `disabled` on a `ToggleGroup` to disable every toggle in it.

```tsx
import { Flex, Toggle, ToggleGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="4" wrap="wrap" align="center">
      <Toggle disabled>Auto-save</Toggle>
      <Toggle disabled defaultPressed>
        Auto-save
      </Toggle>
      <ToggleGroup aria-label="Export formats" disabled defaultValue={["csv"]} render={<Flex gap="1" />}>
        <Toggle value="csv">CSV</Toggle>
        <Toggle value="json">JSON</Toggle>
      </ToggleGroup>
    </Flex>
  );
}
```

### Vertical group

Set `orientation="vertical"` on a `ToggleGroup` when the toggles run in a column, so the up and down arrow keys move focus. The column itself comes from the `Stack` passed to `render`.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Comment01Icon, ListViewIcon } from "@hugeicons/core-free-icons";
import { Stack, Toggle, ToggleGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ToggleGroup
      aria-label="Panels"
      orientation="vertical"
      defaultValue={["outline"]}
      render={<Stack gap="1" align="start" />}
    >
      <Toggle value="outline" leading={<HugeiconsIcon icon={ListViewIcon} strokeWidth={iconStroke} aria-hidden />}>
        Outline
      </Toggle>
      <Toggle value="comments" leading={<HugeiconsIcon icon={Comment01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Comments
      </Toggle>
      <Toggle value="history" leading={<HugeiconsIcon icon={Clock01Icon} strokeWidth={iconStroke} aria-hidden />}>
        History
      </Toggle>
    </ToggleGroup>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### A button that stays pressed

#### Toggle

Toggle is a button that stays pressed until you press it again, for things like bold text or a filter.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The name of the button for screen readers. |
| `aria-labelledby?` | `string` | The id of an element on the page that names this button. |
| `backdrop?` | `boolean` | Set `backdrop` when the toggle sits over other content, such as an image. |
| `bordered?` | `boolean` | Adds a thin border. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `defaultPressed?` | `boolean` | Whether the toggle starts on. |
| `iconOnly` | `true` | Makes the button square and shows only the icon in `children`. |
| `leading?` | `React.ReactNode` | The slot before the label, usually an icon. |
| `onPressedChange?` | `(pressed: boolean) => void` | Fires when the pressed state changes, with the new state. |
| `pressed?` | `boolean` | Whether the toggle is on. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the toggle, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The meaning of the toggle's state, which sets its colour. |
| `trailing?` | `React.ReactNode` | The slot after the label. |
| `value?` | `string` | The value this toggle contributes to a `ToggleGroup`. |

It also takes every prop of a `<button>`.

### Sharing one state across several

#### ToggleGroup

Holds a set of toggles that share one array of pressed values, with arrow-key movement between them. It has no layout of its own, so use `render` to make it a `Flex` or `Stack`

| Prop | Type | What it does |
| --- | --- | --- |
| `orientation?` | `"horizontal" \| "vertical"` | The direction in which the arrow keys move focus. |
