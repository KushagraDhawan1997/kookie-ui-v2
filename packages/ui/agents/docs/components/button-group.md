# Button Group

ButtonGroup joins a set of related Buttons into one control.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<ButtonGroup aria-label="Range">
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>
```

## Overview

A ButtonGroup draws a few related Buttons as one control. The outer corners stay rounded, the inner corners become square, and a thin line separates each pair of buttons. Each button still works on its own.

Use a ButtonGroup for a small set of actions on the same thing, such as text styles or moving between pages. To let people pick one value from a set, use a SegmentedControl. For buttons that stay pressed, use a ToggleGroup, and for one main action with a menu of related ones, use a SplitButton.

Put Buttons directly inside the group. `size` on the group sets the size of every button that doesn't set its own, while `tone`, `emphasis` and `bordered` belong to each Button.

A ButtonGroup renders an element with `role="group"`, so give it an `aria-label` that says what the buttons do together. Tab moves through the buttons one at a time. If you want the arrow keys to move between them instead, put the buttons in a Toolbar.

## Not supported

- A separator part — The group draws the line between buttons itself, so you never need to place separators by hand.
- `tone` and `emphasis` on the group — Each Button sets its own `tone` and `emphasis`, because buttons in one group can mean different things. The group only joins them.

## Examples

```tsx
import { Button, ButtonGroup } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ButtonGroup aria-label="Range">
      <Button>Day</Button>
      <Button>Week</Button>
      <Button>Month</Button>
    </ButtonGroup>
  );
}
```

### Sizes

`size` on the group sizes every button inside it, from 1 to 4. A button can still set its own `size`, but mixed sizes in one group rarely look intended.

```tsx
import { Button, ButtonGroup, Stack } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Stack gap="4" align="flex-start">
      {SIZES.map((size) => (
        <ButtonGroup key={size} size={size} aria-label={`View at size ${size}`}>
          <Button>List</Button>
          <Button>Board</Button>
          <Button>Calendar</Button>
        </ButtonGroup>
      ))}
    </Stack>
  );
}
```

### A group of icon buttons

Icon-only buttons make a compact set of formatting actions. Give each button an `aria-label`, and give the group a label of its own as well.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons";
import { Button, ButtonGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ButtonGroup aria-label="Text style">
      <Button iconOnly aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="Underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </ButtonGroup>
  );
}
```

### Quiet buttons with a border

Quiet buttons with `bordered` make a lighter group that suits secondary actions. Where two buttons meet, their borders share one line.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Download01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { Button, ButtonGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ButtonGroup aria-label="File actions">
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Download01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Download
      </Button>
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Duplicate
      </Button>
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Share01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Share
      </Button>
    </ButtonGroup>
  );
}
```

### Previous and next pages

The button that has nowhere to go is disabled. A disabled button keeps its place, so the group has the same shape on every page.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button, ButtonGroup, Flex, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

const PAGES = 3;

export default function Example() {
  const [page, setPage] = React.useState(1);

  return (
    <Flex gap="4" align="center">
      <Text size="2" emphasis="medium">
        Page {page} of {PAGES}
      </Text>
      <ButtonGroup aria-label="Pages">
        <Button
          iconOnly
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
        </Button>
        <Button
          iconOnly
          aria-label="Next page"
          disabled={page === PAGES}
          onClick={() => setPage((p) => p + 1)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
        </Button>
      </ButtonGroup>
    </Flex>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the buttons in the group, from `1` to `4`. |

It also takes every prop of a `<div>`.
