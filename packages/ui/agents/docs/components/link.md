# Link

Link takes people to another page or another place, inside a sentence or on its own line.

Job: Go. Move to another place in the app. A leaf: it does one thing.

```tsx
<Link href="/plans">the plans on this workspace</Link>
```

## Overview

Use a Link to go somewhere, such as another page, a section or another site. To perform an action, such as saving or deleting, use a `Button`. A Link renders an `<a>` element, and its text stays selectable and wraps across lines like the sentence around it.

Without `size` and `weight`, a link matches the text around it. It uses the `accent` tone by default. Set `tone` when the destination carries a meaning, such as `destructive`, or `neutral` when the link should not draw attention.

A link is always underlined, because colour alone does not identify a link (WCAG 1.4.1) and a touch screen has no hover. The underline is a light grey line, and it changes to the colour of the text when the pointer is over the link.

To use your router's link component, or an anchor with `target` and `rel`, pass it to `render`. Link adds its text styles, underline and focus ring, and the element keeps its own attributes.

Tab moves focus to a link and Enter follows it. A screen reader announces it as a link and uses its text as its name, so write text that makes sense on its own, such as "the plans on this workspace" rather than "click here".

## Use instead

- `Button` when pressing it does something where they are.

## Not supported

- `emphasis` — People need to find a link, and a lower emphasis would fade its colour and make it harder to find. To make a link less prominent, give it a smaller `size`.
- A style for visited links — Browsers hide visited styles from scripts to protect a person's history, so the package cannot test a visited style and does not include one.
- An underline that shows only on hover — A person who cannot tell the link's colour from the text must still find it, and a touch screen has no hover. The underline is always visible, and only its colour changes on hover.
- A larger tap area — WCAG exempts links inside a sentence from the minimum target size, and a link cannot grow a larger area without moving the text around it.

## Examples

```tsx
import { Link, Text } from "@kushagradhawan/kookie-ui-react";
import type { Tone, Weight } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  weight = "regular",
  tone = "accent",
}: {
  weight?: Weight;
  tone?: Tone;
}) {
  return (
    <Text size="3" render={<p />} style={{ maxWidth: "28rem" }}>
      You are using 42 of 100 gigabytes. See{" "}
      <Link href="#plans" weight={weight} tone={tone}>the plans on this workspace</Link> before
      the renewal.
    </Text>
  );
}
```

### Sizes

Links inside sentences of two sizes, with no `size` set, and one standalone link with `size="3"`. Set `size` only when a link stands on its own line.

```tsx
import { Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Inside a sentence, leave `size` unset: the link matches the text around it.
// Set `size` only when the link stands on its own line.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2" render={<p />}>
        Read the <Link href="#terms">terms of service</Link> before you invite guests.
      </Text>
      <Text size="4" render={<p />}>
        Read the <Link href="#terms">terms of service</Link> before you invite guests.
      </Text>
      <Link href="#help" size="3">
        Contact support
      </Link>
    </Stack>
  );
}
```

### Tones

A link in the default `accent` tone, a `destructive` link to a destructive action, and a `neutral` link that should not draw attention.

```tsx
import { Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A link uses the accent tone when you set nothing. Set `tone` when the
// destination has a meaning, such as a destructive action.
export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "28rem" }}>
      <Text size="3" render={<p />}>
        See <Link href="#usage">this month&apos;s usage</Link> for each project.
      </Text>
      <Text size="3" render={<p />}>
        To remove every project and member,{" "}
        <Link href="#delete" tone="destructive">
          delete this workspace
        </Link>
        .
      </Text>
      <Text size="3" render={<p />}>
        <Link href="#changelog" tone="neutral">
          Read the changelog
        </Link>{" "}
        for the full list of changes.
      </Text>
    </Stack>
  );
}
```

### External links

An anchor with `target` and `rel`, passed through `render`, for a page on another site. An icon after the words shows that the link leaves the app.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Link, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

// For a page on another site, pass an anchor with `target` and `rel` through `render`.
// Link adds the type, the underline and the states. The anchor keeps its own attributes.
export default function Example() {
  return (
    <Text size="3" render={<p />} style={{ maxWidth: "28rem" }}>
      Card payments go through{" "}
      <Link render={<a href="https://stripe.com" target="_blank" rel="noreferrer" />}>
        Stripe
        <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={iconStroke} size="1em" aria-hidden />
      </Link>
      . We never store the card number.
    </Text>
  );
}
```

### Standalone links

A column of links outside any sentence, such as in a footer or a help panel. Each link has a size, and a short label names the group.

```tsx
import { Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A column of links that are not inside a sentence. Give them a size, and
// a label above them in the muted ink colour.
export default function Example() {
  return (
    <Stack gap="3">
      <Text size="2" emphasis="medium">
        Resources
      </Text>
      <Stack gap="2" align="flex-start">
        <Link href="#docs" size="3">
          Documentation
        </Link>
        <Link href="#status" size="3">
          System status
        </Link>
        <Link href="#support" size="3">
          Contact support
        </Link>
      </Stack>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `render?` | `RenderElement` | Renders the link as a different element, such as your framework's link component or an `<a>` with `target` and `rel`. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The text size step, from `1` to `9`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | The meaning of the link, which sets the colour of the text and the underline. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | The font weight, by name. |

It also takes every prop of a `<a>`.
