# Principles

An AI agent can make a screen look good. It cannot make fifty screens agree, because it answers
every question again on every screen. Kookie is a system of patterns, carried by components, that
answers those questions once and keeps the answers correct.

## Correct over popular

Kookie chooses what is right over what is easy to adopt. Two things decide what is right: the
research on how people see and use interfaces, and whether products built on Kookie are better.

## Function over appearance

Kookie separates components by what they do, not by how they look. Components that look alike
but do different jobs stay separate, with their own names and props.
```tsx
import {
  Flex,
  SegmentedControl,
  SegmentedItem,
  Stack,
  Tabs,
  TabsList,
  TabsTab,
} from "@kushagradhawan/kookie-ui-react";

export default function Lookalikes() {
  return (
    <Stack gap="7">
      <Flex justify="center">
        <Tabs defaultValue="usage">
          <TabsList>
            <TabsTab value="usage">Usage</TabsTab>
            <TabsTab value="invoices">Invoices</TabsTab>
            <TabsTab value="limits">Limits</TabsTab>
          </TabsList>
        </Tabs>
      </Flex>
      <Flex justify="center">
        <SegmentedControl
          defaultValue="month"
          aria-label="Date range"
        >
          <SegmentedItem value="day">Day</SegmentedItem>
          <SegmentedItem value="week">Week</SegmentedItem>
          <SegmentedItem value="month">Month</SegmentedItem>
        </SegmentedControl>
      </Flex>
    </Stack>
  );
}
```
`Tabs` moves you to another view. A `SegmentedControl` sets a value and leaves the content in
place. The [components](/components) index groups every component by its job.

## Patterns before components

A pattern is a problem that recurs, with a known solution. A component is a pattern packaged for
reuse. Some patterns coordinate several parts, such as an app frame. Kookie ships these as one
coordinator, like `Shell`, that arranges its parts, so no part has to control the container
around it.

## Measured limits and judgments

Some answers are measured. Readable text always meets the reading contrast floor, and no setting
lowers it. Under a touch pointer, controls grow to 44 pixels by default, and `pointer` can change
that. Borders meet the contrast floor only with `contrast="high"`, or when the person asks for
more contrast. Fitts's law is a model, not a limit: it informs the sizes Kookie picks.
Everything else, such as corner radius or the accent hue, is a judgment, and Kookie never
presents it as a measurement.

## Answer each question once

Consistency is cheaper than inconsistency. Kookie answers each design question in one place, so a
component takes a meaning instead of a value.

```tsx
<Button tone="destructive" emphasis="loud">
  Delete project
</Button>
```

## The right thing by default

The correct result is what you get when you don't think about it. In a narrow window, a dialog
becomes a sheet with no prop. Under a touch pointer, targets and text grow, and hover effects do
not stick after a tap. Where the answer depends on your product, Kookie gives you the tool and
makes no decision.

Kookie teaches through defaults and type errors, and keeps hard limits for the few floors it
enforces.

## The trade-off

Kookie gives you fewer overrides. In return, your screens stay consistent as the app grows.
`style` and `className` remain available, and both are easy to find in a review.
