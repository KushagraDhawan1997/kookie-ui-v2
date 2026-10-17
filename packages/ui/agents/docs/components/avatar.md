# Avatar

Avatar shows a person, a team or a thing as a small round picture, with initials or a generic figure until the picture loads.

Job: Read. Take in content. A leaf: it does one thing.

```tsx
<Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" badge={<Badge>3</Badge>} />
```

## Overview

An avatar shows a person, a team or a thing as a small round picture. Before the picture loads, or if it fails, the avatar shows its `fallback`, which is usually a person's initials. Without a `fallback`, it shows a generic person icon.

Use `AvatarGroup` to show several avatars that overlap. Use a `Chip` for a word beside a person, such as a role or a status. An avatar does not respond to a press, so for an account menu, put the avatar inside an icon-only Button.

Sizes 1 to 4 match the control heights, so an avatar is as tall as a Button of the same size and grows with density and on touch screens. Sizes 5 to 9 are larger, for a face that stands alone. If you leave `size` unset, the avatar uses the size of its group, and then the size of the nearest Theme.

Pass a `Badge` to `badge` to show a count or a dot at the top-end corner. The avatar positions the badge and cuts a ring in the surface colour around it, so the badge stays separate from the picture.

An avatar is a circle at every radius setting, and its fallback is always grey. Set `backdrop` when content passes behind the avatar, so the fallback uses your Theme's material; a loaded picture covers the material.

`alt` is empty by default, so a screen reader skips the avatar. That is correct when the person's name is written beside it. When the avatar is the only thing that identifies the person, write their name in `alt`, and the fallback then uses the same name.

## Not supported

- A shape prop — An avatar is a circle at every radius setting, so it is always recognisable as a person or a team. For a square picture, use an image in a Card or a Box.
- `emphasis` — No person on the screen is more important than another because of their avatar. Show order and importance with the position and the size of the avatars.
- `tone` — A tone could colour only the initials, which is too weak to identify a person. The picture is what makes one avatar different from the next.
- Built-in status words — Words such as Away or Busy belong to your product, not to the avatar. Use the `badge` prop for a count or a dot, or put a Chip next to the avatar.
- A press — An avatar is not a control. When people need to press a person, put the avatar inside an icon-only Button, which gives it focus and an accessible name.
- A maximum count on the group — How many faces to show is a decision for your product. Show the ones you want, then add one more Avatar whose fallback counts the rest, such as +3.

## Examples

```tsx
import { Avatar, Badge, type AvatarSize } from "@kushagradhawan/kookie-ui-react";

export default function Example({
  size = "4",
  backdrop = false,
  badge = true,
}: {
  size?: AvatarSize;
  backdrop?: boolean;
  badge?: boolean;
}) {
  return (
    <Avatar
      size={size}
      backdrop={backdrop}
      fallback="KD"
      badge={badge ? <Badge>3</Badge> : undefined}
    />
  );
}
```

### Sizes

Sizes 1 to 4 match the control heights. Sizes 5 to 9 are larger, for a face that stands alone, such as in a profile header.

```tsx
import { Avatar, Flex } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

// Sizes 1 to 4 match the control heights. Sizes 5 to 9 are larger, for a face that stands
// alone, such as on a profile page.
export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      {sizes.map((size) => (
        <Avatar key={size} size={size} fallback="SB" />
      ))}
    </Flex>
  );
}
```

### Pictures and fallbacks

The picture shows when it loads. Before it loads, or if it fails as in the last avatar, the `fallback` shows instead. Without a `fallback`, the avatar shows a generic person icon.

```tsx
import { Avatar, Flex } from "@kushagradhawan/kookie-ui-react";

// With a picture, the picture shows. Until it loads, or if it fails, the `fallback` shows
// instead. Without a `fallback`, a generic person glyph shows.
export default function Example() {
  return (
    <Flex gap="4" align="center">
      <Avatar size="6" src="/backdrop.jpg" alt="Shruti Bhatia" fallback="SB" />
      <Avatar size="6" fallback="SB" />
      <Avatar size="6" />
      <Avatar size="6" src="/missing-photo.jpg" alt="Shruti Bhatia" fallback="SB" />
    </Flex>
  );
}
```

### With a badge

Pass a `Badge` to the `badge` prop to place it at the top-end corner. A badge with a count shows as a pill, and a badge with no content shows as a dot that needs an `aria-label`.

```tsx
import { Avatar, Badge, Flex } from "@kushagradhawan/kookie-ui-react";

// Pass a `Badge` to `badge` to pin it to the top-end corner. A count shows as a pill. A bare
// badge is a dot, and it needs an `aria-label`.
export default function Example() {
  return (
    <Flex gap="5" align="center">
      <Avatar size="5" fallback="SB" badge={<Badge>4</Badge>} />
      <Avatar size="5" fallback="SB" badge={<Badge tone="success" aria-label="Online" />} />
      <Avatar size="5" fallback="SB" badge={<Badge tone="destructive" aria-label="Needs attention" />} />
    </Flex>
  );
}
```

### Beside a name

When the person's name is written next to the avatar, leave `alt` empty. The picture is then decorative, so a screen reader does not read the name twice.

```tsx
import { Avatar, Flex, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// When the name is written next to the avatar, leave `alt` empty. The picture is then
// decorative, and a screen reader does not say the name twice.
export default function Example() {
  return (
    <Flex gap="3" align="center">
      <Avatar size="4" src="/backdrop.jpg" fallback="SB" />
      <Stack gap="1">
        <Text weight="medium">Shruti Bhatia</Text>
        <Text size="2" emphasis="medium">
          Product designer · Owner
        </Text>
      </Stack>
    </Flex>
  );
}
```

### In a row of controls

At sizes 1 to 4, an avatar is as tall as a control of the same size, so it lines up with a TextField and a Button in one row.

```tsx
import { Avatar, Button, Flex, TextField } from "@kushagradhawan/kookie-ui-react";

// At sizes 1 to 4 an avatar is as tall as a control at the same size, so it lines up in a
// row of buttons and fields.
export default function Example() {
  return (
    <Flex gap="2" align="center" style={{ minWidth: "24rem" }}>
      <Avatar fallback="SB" />
      <TextField aria-label="Comment" placeholder="Add a comment…" />
      <Button emphasis="medium">Post</Button>
    </Flex>
  );
}
```

### As a menu trigger

An avatar does not respond to a press. To open an account menu, put the avatar in an icon-only Button, which gives it the accessible name. The avatar fills the button.

```tsx
import { Avatar, Button, Flex, Menu, MenuContent, MenuItem, MenuTrigger, Separator } from "@kushagradhawan/kookie-ui-react";

// An avatar does not respond to a press. For an account menu, put the avatar in an icon-only
// Button. The avatar fills the button, and the button carries the accessible name.
export default function Example() {
  return (
    <Flex>
      <Menu>
        <MenuTrigger
          render={
            <Button iconOnly emphasis="quiet" aria-label="Account menu for Shruti Bhatia">
              <Avatar src="/backdrop.jpg" fallback="SB" />
            </Button>
          }
        />
        <MenuContent>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Settings</MenuItem>
          <Separator />
          <MenuItem>Sign out</MenuItem>
        </MenuContent>
      </Menu>
    </Flex>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `alt?` | `string` | The text alternative for the picture. |
| `backdrop?` | `boolean` | Set `backdrop` when the avatar sits over other content, such as an image. |
| `badge?` | `React.ReactNode` | A `Badge` in the top-end corner of the avatar, such as a count or a dot. |
| `fallback?` | `React.ReactNode` | The content that shows when there is no picture, usually initials. |
| `size?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | The size step of the avatar, from `1` to `9`. |
| `src?` | `string` | The picture. |

It also takes every prop of a `<span>`.
