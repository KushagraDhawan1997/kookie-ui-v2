# Feedback

What should the person see while your app works, and after it finishes? Your app has four
things to tell them: the work has started, how much of it is done, how it ended, and what went
wrong.

## Four things to say

| What you say | When | What to use |
|---|---|---|
| Busy | The work has started, and you can't say how long it will take | `loading` on the button that started it, or a `Spinner` |
| Progress | You know what fraction is done | `Progress` with a `value` |
| Outcome | The work has finished | Words where the action was, or `done` on the button |
| Error | The work failed, or the input was wrong | The control's invalid state, plus a sentence |

How long the work takes decides what to show. Work that finishes in under one second needs no
indicator. From one second, show that the work is busy. From ten seconds, show a `Progress` with
a real fraction. These are Nielsen's response-time limits, from usability research.

## Keep the label on a busy button

Set `loading` on a `Button` while its action runs. A spinner replaces the leading icon in the
same box, and the label stays, so nothing around it moves. The button keeps its focus, but a
second press does nothing.
```tsx
"use client";

import * as React from "react";
import { Button } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [saving, setSaving] = React.useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Button emphasis="loud" loading={saving} onClick={save}>
      Save changes
    </Button>
  );
}
```
Use a standalone `Spinner` for an area that has nothing to show yet. It takes its colour from the
text around it and its size from the icon size of its container.

## Show progress when you know the fraction

Give `Progress` a number, or `value={null}` when you don't know how much is done. The prop is
required, so an unknown amount is always your choice. Give every bar a name with `aria-label` or
a connected heading, because a bare percentage tells a screen reader user nothing.
```tsx
"use client";

import * as React from "react";
import { Button, Card, Flex, Heading, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const TOTAL = 24;

export default function Example() {
  const [uploaded, setUploaded] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const done = uploaded === TOTAL;

  React.useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => {
      setUploaded((n) => {
        if (n + 1 >= TOTAL) setUploading(false);
        return Math.min(n + 1, TOTAL);
      });
    }, 120);
    return () => clearInterval(timer);
  }, [uploading]);

  const start = () => {
    setUploaded(0);
    setUploading(true);
  };

  return (
    <Card size="3" style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="6">Import files</Heading>

        {done ? (
          <Text size="3" tone="success">Imported {TOTAL} files.</Text>
        ) : (
          <Stack gap="2">
            <Progress value={uploading ? (uploaded / TOTAL) * 100 : null} aria-label="Importing files" />
            <Text size="2" emphasis="medium">
              {uploaded} of {TOTAL} files
            </Text>
          </Stack>
        )}

        <Flex justify="flex-end">
          <Button emphasis="loud" loading={uploading} onClick={start}>
            {done ? "Import again" : "Import"}
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
```
The outcome appears where the bar was. A spinner and an unknown-progress sweep keep moving when a
person asks for reduced motion, only slower, because an indicator that stops looks finished. See
[Motion](/foundations/motion).

## Put the outcome where the action happened

- **Next to the control:** Put a `Text` in the matching tone beside it. Use the past tense of the
  button's verb, so "Publish" leads to "Published", not "Success".
- **On the button:** For an action with no other visible result, such as copy, set `done`. Also
  change the label to "Copied", because a screen reader doesn't announce the tick.
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
Kookie doesn't provide a `Toast`. A toast covers content, disappears before some people can read
it, and is hard to reach with a keyboard. Put each report where it belongs instead: a result
next to its control, a condition that stays true in a `Notice`, and an undo in a control that
people can find again.

## Say it in words, not only in colour

Colour can't be the whole message (WCAG 1.4.1). Add an icon or words. For an error, write a
sentence that says what to do next (WCAG 3.3.1). Choose the tone by its meaning: write `success`,
not `green`. See [Color](/foundations/color).
```tsx
import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Flex, Grid, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Looks right, but says green, not success.">
        <Text size="2" tone="green">Deployed</Text>
      </Verdict>
      <Verdict ok why="Says success, so it stays right if the colours change.">
        <Text size="2" tone="success">Deployed</Text>
      </Verdict>
    </Grid>
  );
}

// A large mark, then the thing being judged, then why.
function Verdict({ ok, why, children }: { ok: boolean; why: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text tone={ok ? "success" : "destructive"} render={<Flex />}>
        <HugeiconsIcon
          icon={ok ? Tick02Icon : Cancel01Icon}
          size={28}
          strokeWidth={iconStroke}
          aria-label={ok ? "Right" : "Wrong"}
        />
      </Text>
      {children}
      <Text size="2" emphasis="medium">
        {why}
      </Text>
    </Stack>
  );
}
```
## Use a Notice for a condition that stays true

Use `Notice` for a condition that is true now and that nobody just caused, such as a trial that
ends soon. It takes space in the layout and never floats, so it can't cover what it's about.
```tsx
"use client";

import * as React from "react";
import { Button, Notice } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  // The dismissal is your state. Store it wherever it must survive.
  const [trialNoticeSeen, setTrialNoticeSeen] = React.useState(false);

  if (trialNoticeSeen) {
    return (
      <Button emphasis="quiet" bordered onClick={() => setTrialNoticeSeen(false)}>
        Show the notice again
      </Button>
    );
  }

  return (
    <Notice
      tone="warning"
      action={<Button>Add a card</Button>}
      onDismiss={() => setTrialNoticeSeen(true)}
    >
      Your trial ends in three days.
    </Notice>
  );
}
```
Set `action` to one button that fixes the condition. Set `onDismiss` to show a close button. The
notice keeps no state, so your app removes it and remembers the choice after a reload.

A notice is a polite status region. A screen reader reads a notice that appears after the page
loads, without interrupting. A notice that is already on screen when the page loads is read in
the normal reading order, like any other text.

A notice about the whole app, such as planned maintenance, goes in a `ShellNotice`. The `Shell`
places it in its own row above the header, across every column. Keep using a `Notice` above the
region for anything about one part of the app. To remember a dismissal across reloads without the
notice showing for a moment first, read the stored choice in a script before the page paints, the
same way you set dark mode. See [Installation](/start/installation).

When you need a yes or a no, use `Confirmation`. It stays until someone presses one of its two
buttons, which you label with `cancelLabel` and `confirmLabel`.
