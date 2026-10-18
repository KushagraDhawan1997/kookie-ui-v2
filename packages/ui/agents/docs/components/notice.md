# Notice

Notice tells people about a condition that is true right now, placed above the part of the page it affects.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Notice tone="warning" action={<Button>Renew</Button>}>
  Your certificate expires in six days.
</Notice>

<Confirmation
  confirmLabel="Run"
  cancelLabel="Not now"
  onConfirm={run}
  onCancel={dismiss}
>
  Run 4 nodes for $0.32?
</Confirmation>
```

## Overview

Use a Notice to tell people about a condition that is true right now, such as an expiring certificate or a failed sync. Put it in the layout, directly above the region it is about. It takes up space and never floats, so it doesn't cover the content it describes.

A Notice stays for as long as the condition is true and never closes on a timer. It isn't a confirmation of something the person just did, because they didn't cause the condition. Give it at most one `action`, which fixes the condition, and pass `onDismiss` to show a ✕ that lets people acknowledge it.

The Notice keeps no state of its own. When someone presses the ✕, your `onDismiss` callback runs and your app removes the Notice. Store that choice wherever it needs to last, such as in user settings, so the Notice stays dismissed after a reload.

A Notice is `neutral` by default. Set `tone` for the kind of condition, such as `warning` or `destructive`, and the fill, the text and a `Button` in the `action` slot all change colour with it. `size` sets the padding, the corner, the text and the ✕, but a `Button` in `action` keeps its own size, so set it to match.

To ask a question instead, use `Confirmation`. It has the same look, with two answer buttons in words: a quiet no and a loud yes. It has no ✕, because closing a question doesn't answer it. Set `busy` while the work starts, and the yes button shows a spinner.

A Notice has `role="status"`, so screen readers read its words when it appears without moving focus. The icon is hidden from screen readers, so the words must carry the meaning. Set `dismissLabel` to name the ✕ in your app's language. Use a `Card` when the message needs a heading and several paragraphs, and a `Dialog` when the person must answer before they continue.

## Not supported

- A position, and a Banner component — Where a message sits depends on the layout around it, so the parent places the Notice. Put it in the layout above the region it describes, or let a `Shell` pin it.
- A toast, or any Notice that disappears on its own — If an action deserves someone's attention, it deserves it before the action runs, not in a message that vanishes afterwards. Show confirmations on the button that did the work instead.
- A title and description — A Notice is a short message, usually one sentence, so it has no fixed title or description parts. When a message needs a heading and paragraphs, use a `Card`.
- More than one action — The `action` slot holds the one action that fixes the condition. Two competing actions would turn the Notice into a small form, which belongs in the page instead.
- Remembering its own dismissal — `onDismiss` is only a callback, and the Notice keeps no state. Your app stores the dismissal, which is the only way it can survive a reload.
- A shadow — A Notice is a strip that sits inside a card or across a page, not a separate layer above it, so it never casts a shadow.
- Built-in icons — The package ships no icons. Pass a glyph from your own icon set to `icon`, and it is hidden from screen readers.
- A ✕ on a Confirmation — A question needs an answer, and closing it doesn't give one. Word the no answer as a button, just like the yes.

## Examples

```tsx
"use client";

import { Button, Notice, Stack, Text } from "@kushagradhawan/kookie-ui-react";
import type { Size, Tone } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "2",
  tone = "neutral",
  backdrop = false,
}: {
  size?: Size;
  tone?: Tone;
  backdrop?: boolean;
}) {
  return (
    <Stack gap="3">
      <Notice
        size={size}
        tone={tone}
        backdrop={backdrop}
        action={<Button size="2">Get more usage</Button>}
        onDismiss={() => {}}
      >
        <Text size="2">Approaching weekly usage limit</Text>
      </Notice>
      <Notice size={size} tone="warning" action={<Button size="2">Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
    </Stack>
  );
}
```

### Tones

Set `tone` for the kind of condition. The fill, the text and a `Button` in the `action` slot all change colour together, so you never colour a word yourself.

```tsx
"use client";

import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      <Notice>Billing moves to the first of the month from next cycle.</Notice>
      <Notice tone="info">A new version of the API is available for this project.</Notice>
      <Notice tone="success">All 14 checks passed on the last deployment.</Notice>
      <Notice tone="warning" action={<Button>Renew</Button>}>
        Your certificate expires in six days.
      </Notice>
      <Notice tone="destructive" action={<Button>Try again</Button>}>
        The last sync failed because the token was revoked.
      </Notice>
    </Stack>
  );
}
```

### With an icon

Pass a glyph from your own icon set to `icon`. It sits before the message, and screen readers skip it, so the words must carry the meaning.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, InformationCircleIcon, WifiDisconnected01Icon } from "@hugeicons/core-free-icons";
import { Notice, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Alert02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      <Notice tone="info" icon={icon(InformationCircleIcon)}>
        Scheduled maintenance runs on Sunday between 02:00 and 03:00 UTC.
      </Notice>
      <Notice tone="warning" icon={icon(Alert02Icon)}>
        This workspace is at 92% of its storage quota.
      </Notice>
      <Notice icon={icon(WifiDisconnected01Icon)}>
        You are offline. Changes save on this device until you reconnect.
      </Notice>
    </Stack>
  );
}
```

### A dismissal you store yourself

`onDismiss` shows the ✕ and tells you when someone presses it. Your app removes the Notice and keeps that choice, here for the session.

```tsx
"use client";

import * as React from "react";
import { Button, Notice, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  // The dismissal is your state. Store it wherever it must survive: here, for the session.
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      {dismissed ? (
        <Button emphasis="quiet" bordered onClick={() => setDismissed(false)}>
          Show the notice again
        </Button>
      ) : (
        <Notice
          tone="info"
          action={<Button>Review changes</Button>}
          onDismiss={() => setDismissed(true)}
          dismissLabel="Hide this notice"
        >
          The team plan now includes audit logs.
        </Notice>
      )}
      <Text size="2" emphasis="medium">
        Audit logs keep 90 days of history for every project in the workspace.
      </Text>
    </Stack>
  );
}
```

### Sizes

`size` changes the padding, the corner, the text and the ✕ together. Choose the size that fits the region the Notice sits above.

```tsx
"use client";

import { Button, Notice, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "40rem" }}>
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Notice
          key={size}
          size={size}
          tone="warning"
          action={<Button>Update card</Button>}
          onDismiss={() => {}}
        >
          The card on file expires this month.
        </Notice>
      ))}
    </Stack>
  );
}
```

### A question with Confirmation

`Confirmation` asks a yes or no question in the same kind of strip. Set `busy` after the yes, so the yes shows a spinner and the no is disabled while the work starts.

```tsx
"use client";

import * as React from "react";
import { Button, Confirmation, Stack, Text } from "@kushagradhawan/kookie-ui-react";

type Step = "asking" | "busy" | "done";

export default function Example() {
  const [step, setStep] = React.useState<Step>("asking");

  const run = () => {
    setStep("busy");
    window.setTimeout(() => setStep("done"), 1200);
  };

  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      {step === "done" ? (
        <Stack gap="3" align="start">
          <Text size="2" emphasis="medium">The backfill is running on 4 nodes.</Text>
          <Button emphasis="quiet" bordered onClick={() => setStep("asking")}>
            Start over
          </Button>
        </Stack>
      ) : (
        <Confirmation
          confirmLabel="Run"
          cancelLabel="Not now"
          busy={step === "busy"}
          onConfirm={run}
          onCancel={() => setStep("done")}
        >
          Run the backfill on 4 nodes for $0.32?
        </Confirmation>
      )}
    </Stack>
  );
}
```

### Above the region it describes

The Notice sits in the layout, directly above the content it is about. It pushes that content down instead of covering it.

```tsx
"use client";

import { Button, Card, Heading, Notice, Row, Stack } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Card style={{ maxWidth: "36rem" }}>
      <Stack gap="4">
        <Heading size="6">Environments</Heading>
        <Notice tone="warning" action={<Button>Reconnect</Button>}>
          Staging lost its database connection 4 minutes ago.
        </Notice>
        <Stack gap="1">
          <Row trailing="Healthy">Production</Row>
          <Row trailing="Offline">Staging</Row>
          <Row trailing="Healthy">Preview</Row>
        </Stack>
      </Stack>
    </Card>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### A condition

#### Notice

Notice tells people about a condition that is true right now, placed above the part of the page it affects.

| Prop | Type | What it does |
| --- | --- | --- |
| `action?` | `React.ReactNode` | One action that fixes the condition, such as "Get more usage". |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the notice, such as a scrolling region. |
| `children` | `React.ReactNode` | The message, usually one sentence. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `dismissLabel?` | `string` | The accessible name of the dismiss button. |
| `icon?` | `React.ReactNode` | An icon shown before the message. |
| `onDismiss?` | `() => void` | Called when the person presses the ✕ dismiss button. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size of the notice: the padding, the corner, the text and the dismiss button. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family, which tells the category of the message. |

### A question

#### Confirmation

A question that waits for a yes or a no. It looks like a Notice, with two worded answer buttons and no ✕

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when content passes behind the confirmation. |
| `busy?` | `boolean` | Shows that the work is starting. |
| `cancelLabel` | `string` | The no, in your words: "Not now". |
| `children` | `React.ReactNode` | The request, in your words: "Run 4 nodes for $0.32?" |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `confirmLabel` | `string` | The yes, in your words: "Run". |
| `icon?` | `React.ReactNode` | An icon from your own icon set, shown before the request. |
| `onCancel` | `() => void` | Called when the person presses the cancel button. |
| `onConfirm` | `() => void` | Called when the person presses the confirm button. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the size of the padding, the corner, the buttons and the text. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family of the request. |
