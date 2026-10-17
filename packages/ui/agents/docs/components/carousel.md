# Carousel

Carousel lets people browse a long row of items that scrolls sideways, with a button at each end.

Job: Browse. Scan a collection and find one item. A leaf: it does one thing.

```tsx
<Carousel aria-label="Covers">
  <CarouselRail fade>
    <Flex gap="4">
      <CarouselItem>…</CarouselItem>
      <CarouselItem>…</CarouselItem>
    </Flex>
  </CarouselRail>
  <CarouselPrevious>‹</CarouselPrevious>
  <CarouselNext>›</CarouselNext>
</Carousel>
```

## Overview

A Carousel shows a row of items that scrolls sideways and comes to rest on an item each time. Use it for a long row of peers that people browse, such as templates, recent projects or covers. When every item fits in the space, use a Grid or a Flex, and for a vertical list that scrolls, use a ScrollArea.

Put a `CarouselRail` inside the `Carousel`, and wrap each item the rail should stop on in a `CarouselItem`. The component doesn't set a width, a gap or an aspect ratio for the items, so set the item width yourself and place the items in a Flex to space them. Give the rail a bounded width, and set `fade` when it runs to the edge of a pane.

Place `CarouselPrevious` and `CarouselNext` anywhere inside the `Carousel`, either in a row above the rail or on each side of it. The package ships no icons, so put your own arrows in the buttons. No scrollbar is drawn, because the buttons and the fade already show that there is more to see.

Scrolling is the browser's own, so the mouse wheel, the trackpad, touch and the keyboard all work as usual. Each button press moves the rail by one item, and a button is disabled when there is nothing more in its direction. The carousel never plays on its own and never loops.

A Carousel renders a group that screen readers announce as a carousel. Name it with `aria-label`, or point `aria-labelledby` at the heading above it. The buttons are named "Previous" and "Next" by default and tell assistive technology which rail they move. A disabled button stays focusable, so keyboard focus isn't lost when the rail reaches an end. On a right-to-left page, the rail starts on the right.

## Not supported

- Autoplay — Content that moves on a timer makes people lose their place, so the rail moves only when someone scrolls it or presses a button.
- Looping — A loop needs cloned items or a fake scroll position. With real ends, a disabled button tells people they have reached the last item.
- Drag to scroll — Touch and trackpads already drag the rail. With a mouse, dragging would get in the way of selecting text and dragging images.
- A width, a gap or an aspect ratio for the items — Every carousel lays out its items differently, so you set the item size yourself and use a Flex for the gap. The component only marks where scrolling comes to rest.
- `orientation` — A carousel always scrolls sideways. For a vertical list that scrolls, use a ScrollArea.
- Dots under the rail — Dots repeat what the rail already shows, each one needs its own accessible name, and people can't count them once there are more than a few.

## Examples

```tsx
import { Carousel, CarouselItem, CarouselNext, CarouselPrevious, CarouselRail, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const COVERS = ["Wan Image to Video", "GPT Image", "Clarity Upscaler", "BiRefNet", "Flux Kontext"];

export default function Example() {
  return (
    <Carousel aria-label="Models">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Text weight="medium">Models</Text>
          <Flex gap="2">
            <CarouselPrevious>‹</CarouselPrevious>
            <CarouselNext>›</CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {COVERS.map((name) => (
              <CarouselItem key={name} style={{ inlineSize: "12rem", flex: "none" }}>
                <Stack gap="2">
                  <div
                    style={{
                      aspectRatio: "4 / 3",
                      borderRadius: "var(--radius-surface-1)",
                      background: "var(--neutral-3)",
                    }}
                  />
                  <Text size="2">{name}</Text>
                </Stack>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
```

### With icons

Arrow icons in `CarouselPrevious` and `CarouselNext`, with an `aria-label` on each. Set your own label when "Previous" and "Next" don't say enough, such as "Previous templates".

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const TEMPLATES = ["Invoice", "Project brief", "Meeting notes", "Release plan", "Weekly report", "Budget"];

export default function Example() {
  return (
    <Carousel aria-label="Templates">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Text weight="medium">Templates</Text>
          <Flex gap="2">
            <CarouselPrevious aria-label="Previous templates">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext aria-label="Next templates">
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {TEMPLATES.map((name) => (
              <CarouselItem key={name} style={{ inlineSize: "12rem", flex: "none" }}>
                <Card>
                  <Text size="2" weight="medium">
                    {name}
                  </Text>
                </Card>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
```

### Named by the heading above it

`aria-labelledby` points at the heading's `id`, so screen readers announce the same name that sighted people read. Each item here is a Card rendered as a link.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Heading,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [
  { name: "Website redesign", owner: "Shruti Bhatia" },
  { name: "Mobile onboarding", owner: "Shruti Bhatia" },
  { name: "Billing migration", owner: "Shruti Bhatia" },
  { name: "Help centre", owner: "Shruti Bhatia" },
  { name: "Brand refresh", owner: "Shruti Bhatia" },
];

export default function Example() {
  return (
    <Carousel aria-labelledby="recent-projects">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Heading size="5" id="recent-projects" render={<h2 />}>
            Recent projects
          </Heading>
          <Flex gap="2">
            <CarouselPrevious>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext>
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {PROJECTS.map((project) => (
              <CarouselItem key={project.name} style={{ inlineSize: "14rem", flex: "none" }}>
                <Card render={<a href="#project" />}>
                  <Stack gap="1">
                    <Text size="3" weight="medium">
                      {project.name}
                    </Text>
                    <Text size="2" emphasis="medium">
                      {project.owner}
                    </Text>
                  </Stack>
                </Card>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
```

### Buttons at each end of the rail

The buttons sit on each side of the rail in a Flex. Wrap the rail in a Box with `flexGrow="1"` and `minWidth="0"`, so it fills the space between the buttons and can still scroll.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const PLANS = ["Starter", "Team", "Business", "Enterprise", "Education"];

export default function Example() {
  return (
    <Carousel aria-label="Plans">
      <Flex gap="3" align="center">
        <CarouselPrevious aria-label="Previous plans">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
        </CarouselPrevious>
        <Box flexGrow="1" minWidth="0">
          <CarouselRail>
            <Flex gap="3">
              {PLANS.map((plan) => (
                <CarouselItem key={plan} style={{ inlineSize: "10rem", flex: "none" }}>
                  <Card>
                    <Text size="2" weight="medium">
                      {plan}
                    </Text>
                  </Card>
                </CarouselItem>
              ))}
            </Flex>
          </CarouselRail>
        </Box>
        <CarouselNext aria-label="Next plans">
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
        </CarouselNext>
      </Flex>
    </Carousel>
  );
}
```

### Right to left

With `dir="rtl"` on an ancestor, the rail starts on the right and Previous still moves back toward the first item. Point each arrow in the reading direction, as this example does.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const ITEMS = ["الفواتير", "المشاريع", "الأعضاء", "التقارير", "الإعدادات"];

// In a right-to-left page the rail starts on the right. "Previous" still moves toward the
// start, so its arrow points right.
export default function Example() {
  return (
    <Box dir="rtl" lang="ar">
      <Carousel aria-label="الأقسام">
        <Stack gap="4">
          <Flex gap="2">
            <CarouselPrevious aria-label="السابق">
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext aria-label="التالي">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
          <CarouselRail fade>
            <Flex gap="4">
              {ITEMS.map((name) => (
                <CarouselItem key={name} style={{ inlineSize: "10rem", flex: "none" }}>
                  <Card>
                    <Text size="2" weight="medium">
                      {name}
                    </Text>
                  </Card>
                </CarouselItem>
              ))}
            </Flex>
          </CarouselRail>
        </Stack>
      </Carousel>
    </Box>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Naming the carousel

#### Carousel

Carousel lets people browse a long row of items that scrolls sideways, with a button at each end.

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The name of the carousel for screen readers. |
| `aria-labelledby?` | `string` | The id of an element on the page that names the carousel, usually the heading above it. |
| `children?` | `React.ReactNode` | The rail and its buttons. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### The scrolling row

#### CarouselRail

The row that scrolls. It is a ScrollArea whose scrolling comes to rest on items. Give it a bounded width, and set `fade` when it runs to the edge of a pane

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The items. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `fade?` | `boolean` | Fades the content at an edge when more content is past that edge. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### CarouselItem

Marks one item the rail can stop on. It sets no size of its own, so you control the item's width and the space between items

It declares no props of its own. It takes every prop of a `<div>`.

### The buttons

#### CarouselPrevious

A button that moves the rail back by one item. It is disabled at the start of the rail, but it stays focusable

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.

#### CarouselNext

A button that moves the rail forward by one item. It is disabled at the end of the rail, but it stays focusable

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.
