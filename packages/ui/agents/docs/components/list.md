# List

List shows items of text as a bulleted list or a numbered list.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<List>
  <ListItem>Invite your team</ListItem>
  <ListItem>
    Deploy the first build
    <List>
      <ListItem>Preview builds run on every push</ListItem>
    </List>
  </ListItem>
</List>
```

## Overview

Use a List for items of text, such as the features of a plan or the steps of a task. For items with no markers, use `Stack`. For items with icons or actions, use `Row`. For items that each have several values, use `Table`.

Set `ordered` when the order of the items matters, such as steps to follow or a ranking, and the List renders an `<ol>` with numbers. Otherwise it renders a `<ul>` with bullets. On a numbered list, `start` and `reversed` change what the numbers say. A bulleted list does not accept them.

A List accepts the same `size`, `weight`, `emphasis` and `tone` props as `Text`, and the default size is 3. The space for the markers grows with the text size. Bullets always use the faint text colour, so they stay in the background, while numbers use the same colour as the words, because people read and refer to them.

To nest a list, put a List inside a `ListItem`. It indents one level and takes the text size of the item, so it needs no props.

A screen reader announces a list and the number of items in it.

## Not supported

- A custom marker — The list type sets the marker: bullets for a bulleted list and numbers for a numbered one. For no markers, use a `Stack`. For icons, use `Row`.
- `render` — `ordered` chooses between `<ul>` and `<ol>`. Any other element would not be announced as a list by a screen reader.
- A `gap` or density prop — The space between items is set by the theme, so every list in your app has the same spacing. To change it for the whole app, set the theme's density.
- A description list — A `<dl>` pairs terms with their details, which is a different structure from a list of items. It is planned as a separate component.

## Examples

```tsx
import { List, ListItem } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <List size="3">
      <ListItem>Invite your team</ListItem>
      <ListItem>Connect a repository</ListItem>
      <ListItem>
        Deploy the first build
        {/* A list inside an item states no step: it takes the one the item sits at. */}
        <List>
          <ListItem>Preview builds run on every push</ListItem>
          <ListItem>Production builds run on main</ListItem>
        </List>
      </ListItem>
    </List>
  );
}
```

### Numbered lists

`ordered` on a list of setup steps. Use it when the order is information, and a screen reader then announces a numbered list.

```tsx
import { List, ListItem } from "@kushagradhawan/kookie-ui-react";

// Set `ordered` when the order is information, such as steps to follow.
// A screen reader then announces a numbered list.
export default function Example() {
  return (
    <List ordered>
      <ListItem>Open the project settings</ListItem>
      <ListItem>Choose the domain tab</ListItem>
      <ListItem>Add the DNS record we show you</ListItem>
      <ListItem>Wait for the check to pass</ListItem>
    </List>
  );
}
```

### Continued numbering

Two numbered lists with a paragraph between them, and `start={3}` on the second. The numbers stay correct when a person refers to a step.

```tsx
import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Use `start` to continue the numbers after a paragraph. The numbers stay
// correct when a person copies the steps or cites one of them.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <List ordered>
        <ListItem>Export your data from the old workspace</ListItem>
        <ListItem>Create the new workspace</ListItem>
      </List>
      <Text size="3" render={<p />}>
        Wait for the confirmation email before you continue.
      </Text>
      <List ordered start={3}>
        <ListItem>Import the export file</ListItem>
        <ListItem>Invite your team again</ListItem>
      </List>
    </Stack>
  );
}
```

### Sizes

The same list at sizes 2, 3 and 4. `size` uses the same scale as `Text`, and the space for the markers grows with it.

```tsx
import { List, ListItem, Stack } from "@kushagradhawan/kookie-ui-react";

// `size` picks a step on the same scale Text uses. The room for the marker
// and the space between items grow with the step.
export default function Example() {
  return (
    <Stack gap="5">
      <List size="2">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
      <List size="3">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
      <List size="4">
        <ListItem>Unlimited projects</ListItem>
        <ListItem>Preview builds on every push</ListItem>
      </List>
    </Stack>
  );
}
```

### Emphasis

A list of details at `emphasis="medium"` under a main statement. The words use a quieter colour, and the bullets stay faint.

```tsx
import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour of the words. Use `medium` for a list of
// details under a main statement. Numbers take the colour of the words.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Your trial ends in 3 days
      </Text>
      <List size="3" emphasis="medium">
        <ListItem>Projects stay in read-only mode</ListItem>
        <ListItem>Members keep access to their files</ListItem>
        <ListItem>Deploys stop until you choose a plan</ListItem>
      </List>
    </Stack>
  );
}
```

### Tones

A `destructive` list of what a delete removes. Use a tone when the whole list carries one meaning, and the words and the markers both change colour.

```tsx
import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// `tone` moves the words and the markers to that colour family.
// Use it when the whole list carries one meaning, such as what a delete removes.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      <Text size="3" weight="medium">
        Deleting this project also removes:
      </Text>
      <List size="3" tone="destructive">
        <ListItem>12 deployments and their logs</ListItem>
        <ListItem>3 custom domains</ListItem>
        <ListItem>All environment variables</ListItem>
      </List>
    </Stack>
  );
}
```

### In a card

A list of plan features between a card's title and its button. The card sets the padding, and a `Stack` sets the space between the parts.

```tsx
import { Button, Card, Heading, List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A list inside a card, between the title and the action. The card sets
// the padding, and the Stack sets the space between the parts.
export default function Example() {
  return (
    <Card size="3" style={{ maxWidth: "22rem" }}>
      <Stack gap="4">
        <Stack gap="1">
          <Heading size="6" render={<h3 />}>
            Team plan
          </Heading>
          <Text size="3" emphasis="medium">
            For groups that ship together.
          </Text>
        </Stack>
        <List size="3">
          <ListItem>Up to 25 members</ListItem>
          <ListItem>Shared environment variables</ListItem>
          <ListItem>Priority support</ListItem>
        </List>
        <Button emphasis="loud">Choose Team</Button>
      </Stack>
    </Card>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Creating the list

#### List

List shows items of text as a bulleted list or a numbered list.

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `emphasis?` | `"loud" \| "medium" \| "quiet"` | Sets how strong the text colour is. |
| `ordered?` | `false` | Renders a bulleted `<ul>`. |
| `reversed?` | `never` | Not available on a bulleted list, because bullets have no order to reverse. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | Sets the text size, from `1` to `9`. |
| `start?` | `never` | Not available on a bulleted list, because there is no number to start from. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family of the words and the markers. |
| `weight?` | `"regular" \| "medium" \| "semibold"` | Sets the font weight. |

It also takes every prop of a `<ul>`.

### Adding one item

#### ListItem

One item, rendered as an `<li>`. It uses the text size, weight and colour of its list, and a List placed inside it indents one level

It declares no props of its own. It takes every prop of a `<li>`.
