# Avatar Group

AvatarGroup shows several avatars that overlap, with a ring in the surface colour around each one to keep them separate.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<AvatarGroup size="3">
  <Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" />
  <Avatar fallback="KD" />
  <Avatar fallback="+3" />
</AvatarGroup>
```

## Overview

An avatar group shows several avatars in a row, and each one overlaps the one before it. A ring in the surface colour surrounds each avatar, so the circles stay separate.

Use a group to show who has access to something, who is in a meeting or who worked on a file. The overlap is fixed, so for avatars that do not overlap, put them in a `Flex` instead.

Set `size` once on the group, and every avatar inside it that has no size of its own uses it. An avatar that sets its own `size` keeps that size. At sizes 1 to 4, the group is as tall as a Button of the same size.

Each avatar keeps its own `alt`. Leave it empty when the names are written beside the group. When the faces are the only way to see who is there, give each avatar a name, and give the counting avatar a sentence such as "3 more members".

## Not supported

- A maximum count — How many faces to show is a decision for your product. Show the ones you want, then add one more Avatar whose fallback counts the rest, such as +3.
- A spacing prop — The overlap is fixed so that every group looks the same across your app. For avatars that do not overlap, put them in a `Flex` with a `gap`.

## Examples

```tsx
import { Avatar, AvatarGroup, type AvatarSize } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "3",
  backdrop = false,
}: {
  size?: AvatarSize;
  backdrop?: boolean;
}) {
  return (
    <AvatarGroup size={size}>
      <Avatar src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" backdrop={backdrop} />
      <Avatar fallback="KD" backdrop={backdrop} />
      <Avatar fallback="AR" backdrop={backdrop} />
      <Avatar fallback="+3" backdrop={backdrop} />
    </AvatarGroup>
  );
}
```

### Sizes

Set `size` once on the group, and every avatar inside it that has no size of its own uses it. The overlap and the rings grow with the size.

```tsx
import { Avatar, AvatarGroup, Stack } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4", "5"] as const;

// Set `size` once on the group. Every avatar inside that has no size of its own takes it.
export default function Example() {
  return (
    <Stack gap="4" align="start">
      {sizes.map((size) => (
        <AvatarGroup key={size} size={size}>
          <Avatar src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" />
          <Avatar fallback="KD" />
          <Avatar fallback="AR" />
          <Avatar fallback="+2" />
        </AvatarGroup>
      ))}
    </Stack>
  );
}
```

### Counting the rest

The group has no maximum. Decide how many faces to show, then add one more Avatar whose fallback counts the rest and whose `alt` says the count in words.

```tsx
import { Avatar, AvatarGroup } from "@kushagradhawan/kookie-ui-react";

const members = [
  { name: "Shruti Bhatia", initials: "SB" },
  { name: "Kabir Das", initials: "KD" },
  { name: "Anaya Rao", initials: "AR" },
  { name: "Meera Iyer", initials: "MI" },
  { name: "Rohan Gupta", initials: "RG" },
  { name: "Tara Nair", initials: "TN" },
];

const shown = 3;

// The group has no maximum. Decide how many faces to show, and add one more Avatar whose
// fallback counts the rest. Its `alt` says the count in words.
export default function Example() {
  const rest = members.length - shown;
  return (
    <AvatarGroup size="4">
      {members.slice(0, shown).map((member) => (
        <Avatar key={member.name} alt={member.name} fallback={member.initials} />
      ))}
      <Avatar alt={`${rest} more members`} fallback={`+${rest}`} />
    </AvatarGroup>
  );
}
```

### Beside a label

A group usually sits next to text that says what it shows, and often next to an action. At sizes 1 to 4, the avatars line up with a Button of the same size.

```tsx
import { Avatar, AvatarGroup, Button, Flex, Text } from "@kushagradhawan/kookie-ui-react";

// A group usually sits beside words that say what it shows. At sizes 1 to 4 the faces line up
// with a Button at the same size.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <AvatarGroup>
        <Avatar src="/backdrop.jpg" fallback="SB" />
        <Avatar fallback="KD" />
        <Avatar fallback="AR" />
      </AvatarGroup>
      <Text emphasis="medium">Shruti Bhatia and 2 others can edit</Text>
      <Button emphasis="medium">Share</Button>
    </Flex>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The size step for all avatars in the group, from `1` to `9`. |

It also takes every prop of a `<span>`.
