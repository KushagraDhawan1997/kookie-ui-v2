# Button

Button starts an action, such as saving a form, opening a dialog or deleting a file.

Job: Act. Make something happen. A leaf: it does one thing.

```tsx
<Button tone="accent" emphasis="loud">
  Save changes
</Button>
```

## Overview

Button starts an action, such as saving a form, opening a dialog or deleting a file. You choose what the action means with `tone` and how prominent it is with `emphasis`, and the theme works out the colours.

`emphasis` ranks the actions on a screen. A `loud` button is filled with the tone's solid colour, a `medium` button has a soft fill, and a `quiet` button has no fill. Give each screen or pane one loud button for its main action. Adding `bordered` draws a thin line around the button, which places a quiet button a little above the other quiet ones. The defaults are `medium` emphasis and the `neutral` tone.

Use `tone` for meaning rather than for a colour you like: `destructive` for an action that deletes or removes, `accent` for your brand's main action, and `success` for an action that approves.

`size` sets the height, padding, corner, icon and text size together, so controls at the same size line up in a row. When you don't set it, the button takes the size of the Field or Toolbar it sits in, or else the Theme's size, which is `2`. On a touch screen every size is taller, so buttons stay easy to tap.

Put an icon before the label with `leading`, or after it with `trailing`. For a square button with only an icon, set `iconOnly` and give it an `aria-label`. While an action runs, set `loading`: a spinner takes the place of the leading icon, the label stays, and presses are blocked. When the action finishes, set `done`, and the icon changes to a tick until you set it back to false. A button without an icon shows the tick beside its label, so it grows a little wider.

Button renders a real `<button>`, so Enter and Space press it, and it submits a form when `type` is `submit`. To make it work as a link, pass `render={<a href="/billing" />}`. A screen reader reads the label, or the `aria-label` on an icon-only button, and it doesn't read the tick, so change the label as well when you use `done`, for example from "Copy" to "Copied".

Some neighbouring cases have their own components. For a main action with a menu of related ones, use a SplitButton. To join several buttons into one control, use a ButtonGroup. For something that stays on or off, use a Toggle, and for a link inside a sentence, use a Link.

## Use instead

- `Link` when pressing it takes people to another place.

## Not supported

- `margin` — No component sets the space around itself, because the layout that holds it decides that. Wrap the button in `<Box m>` or use the `gap` of its container.
- `variant` — A variant mixes how loud a button is with what it means, which makes a quiet destructive button impossible. Use `tone` for the meaning and `emphasis` for the loudness.
- A shadow prop — Shadows are set for the whole app by the Theme's `depth`, so buttons across your app always match. No single button can ask for its own.

## Examples

```tsx
import { Button, type Emphasis, type Size, type Tone } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  tone = "accent",
  emphasis = "loud",
  bordered = false,
  loading = false,
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  emphasis?: Emphasis;
  bordered?: boolean;
  loading?: boolean;
  backdrop?: boolean;
}) {
  return (
    <Button
      size={size}
      tone={tone}
      emphasis={emphasis}
      bordered={bordered}
      loading={loading}
      backdrop={backdrop}
    >
      Save changes
    </Button>
  );
}
```

### Emphasis

A row of actions from loud to quiet. Use one loud button for the main action, medium for the others, and quiet for actions such as Cancel. A quiet button with `bordered` sits between quiet and medium.

```tsx
import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud">Publish</Button>
      <Button>Save draft</Button>
      <Button emphasis="quiet" bordered>
        Preview
      </Button>
      <Button emphasis="quiet">Cancel</Button>
    </Flex>
  );
}
```

### Tones

`tone` says what an action does: `accent` for your main brand action, `destructive` for one that deletes, `success` for one that approves. Every tone works at every emphasis.

```tsx
import { Button, Flex, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4">
      <Flex gap="3" wrap="wrap">
        <Button tone="accent" emphasis="loud">
          Upgrade plan
        </Button>
        <Button tone="accent">Compare plans</Button>
        <Button tone="accent" emphasis="quiet">
          View pricing
        </Button>
      </Flex>
      <Flex gap="3" wrap="wrap">
        <Button tone="destructive">Delete project</Button>
        <Button tone="destructive" emphasis="quiet">
          Remove member
        </Button>
        <Button tone="success">Approve invoice</Button>
      </Flex>
    </Stack>
  );
}
```

### Sizes

The four sizes. One `size` sets the height, padding, corner, icon and text together. Use size 2 on most screens, and keep the controls in one row at the same size.

```tsx
import { Button, Flex } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["1", "2", "3", "4"] as const;

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {SIZES.map((size) => (
        <Button key={size} size={size}>
          Invite member
        </Button>
      ))}
    </Flex>
  );
}
```

### With icons

Put an icon before the label with `leading`, or after it with `trailing`. The button sizes the icon for you, so you don't set a width or height on it.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowDown01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud" leading={<HugeiconsIcon icon={Add01Icon} strokeWidth={iconStroke} aria-hidden />}>
        New project
      </Button>
      <Button leading={<HugeiconsIcon icon={Download01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Export CSV
      </Button>
      <Button
        emphasis="quiet"
        trailing={<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Sort by date
      </Button>
    </Flex>
  );
}
```

### Buttons with only an icon

Set `iconOnly` and put the icon in `children`. TypeScript requires an `aria-label` or `aria-labelledby`, because a screen reader can't describe an icon.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon, Settings01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="2" align="center">
      <Button iconOnly emphasis="quiet" aria-label="Edit file">
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Share file">
        <HugeiconsIcon icon={Share01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="File settings">
        <HugeiconsIcon icon={Settings01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly tone="destructive" aria-label="Delete file">
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </Flex>
  );
}
```

### Loading and disabled

`loading` shows a spinner in place of the leading icon and blocks presses while the label stays. `disabled` greys the button out and takes it out of the tab order.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud" loading>
        Saving changes
      </Button>
      <Button loading leading={<HugeiconsIcon icon={Upload01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Uploading
      </Button>
      <Button disabled>Archive project</Button>
      <Button emphasis="quiet" disabled>
        Undo
      </Button>
    </Flex>
  );
}
```

### A copy button that confirms

Set `done` once the action succeeds, and the icon changes to a tick. Your app holds the value and clears it with a timer. Change the label or `aria-label` too, so a screen reader hears the result.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard?.writeText("sk_live_4471");
    setCopied(true);
  };

  return (
    <Flex gap="3" align="center">
      <Button done={copied} onClick={copy} leading={<HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />}>
        {copied ? "Copied" : "Copy API key"}
      </Button>
      <Button iconOnly emphasis="quiet" done={copied} onClick={copy} aria-label={copied ? "Copied" : "Copy API key"}>
        <HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </Flex>
  );
}
```

### A button that goes to a page

Use `render={<a href />}` when the action opens another page. It still looks like a button, but the browser treats it as a link, so people can open it in a new tab.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button
        emphasis="loud"
        render={<a href="#billing" />}
        trailing={<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Go to billing
      </Button>
      <Button emphasis="quiet" render={<a href="#help" />}>
        Read the guide
      </Button>
    </Flex>
  );
}
```

### In a form

Set `type="submit"` on the main action and `type="reset"` on the quiet one. Pressing Enter in the field then submits the form.

```tsx
"use client";

import { Button, Field, FieldLabel, Flex, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack
      gap="5"
      render={<form onSubmit={(event) => event.preventDefault()} />}
      style={{ maxWidth: "24rem" }}
    >
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <TextField name="name" defaultValue="Website redesign" />
      </Field>
      <Flex gap="2" justify="flex-end">
        <Button type="reset" emphasis="quiet">
          Reset
        </Button>
        <Button type="submit" emphasis="loud">
          Create project
        </Button>
      </Flex>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The name of the button for screen readers. |
| `aria-labelledby?` | `string` | The id of an element on the page that names this button. |
| `backdrop?` | `boolean` | Set `backdrop` when the button sits over other content, such as an image. |
| `bordered?` | `boolean` | Adds a thin border. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `done?` | `boolean` | Shows a tick in place of the icon to say that the action finished. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | Sets how prominent the button is next to the buttons beside it. |
| `focusableWhenDisabled?` | `boolean` | Keep focus on the button when it becomes disabled part-way through an interaction. |
| `iconOnly` | `true` | Makes the button square and shows only the icon in `children`. |
| `leading?` | `React.ReactNode` | Content before the label, usually an icon. |
| `loading?` | `boolean` | Shows a spinner and blocks the press while an action runs. |
| `nativeButton?` | `boolean` | Says whether the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Renders the button as a different element, such as a link. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size step of the button, from `1` to `4`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets what the action means, and the theme picks the colour. |
| `trailing?` | `React.ReactNode` | Content after the label, such as a chevron, a count or a control. |

It also takes every prop of a `<button>`.
