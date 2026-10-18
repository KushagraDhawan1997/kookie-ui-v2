# Theme

Theme sets light or dark mode, spacing, corners, shadows and material for everything inside it.

Job: Arrange. Place things on the page. This is your job, not the person's. A leaf: it does one thing.

```tsx
<Theme appearance="inherit" density="default" radius="full" depth="elevated">
  …
</Theme>
```

## Overview

A Theme holds the settings that every component inside it uses. There are eight: `appearance`, `density`, `radius`, `contrast`, `pointer`, `depth`, `material` and `size`. Put one Theme at the root of your app, and set only the values you want to change, because the defaults suit most apps.

The defaults are `appearance="light"`, `density="default"`, `radius="full"`, `contrast="normal"`, `pointer="auto"`, `depth="elevated"`, `material="solid"` and `size="2"`. `pointer="auto"` follows the device, so a touch screen gets larger controls and slightly larger reading text.

Themes nest. A Theme inside another changes only the settings you give it and keeps the rest from the theme around it. Use a nested Theme for a dark panel on a light page, or for a compact table inside an app that uses the default density.

`size` sets the size of every control that doesn't set its own, so an app whose controls are all size 3 says so once. It doesn't affect type: `Text` and `Heading` have their own nine-step scale, and `Code`, `Kbd`, `Badge` and `Chip` take the size of the line they sit in.

`contrast="high"` is an accessibility setting that strengthens borders, fills and text so they meet the contrast minimums. Put it on the same element as an `appearance` other than `inherit`. When `contrast` is unset, the theme follows the operating system's `prefers-contrast: more` setting.

A Theme renders a `<div>` to hold its settings, and `render` puts them on an element you already have instead. Never render the root Theme onto `<body>` or `<html>`, because menus, dialogs and other floating panels are added to the body.

## Not supported

- An `accentColor` prop — The accent is one colour for the whole app, set in the colour config, and the full palette is generated from it. A prop that changed it at runtime would mean shipping every possible colour scale.
- A `scaling` prop — Multiplying every size by one factor breaks the designed relationships between them. Use `density`, which switches to designed values for tighter or roomier layouts.
- A shadow or elevation prop on components — Shadows are a choice for the whole app, so individual components have no shadow prop. Use `depth` on the Theme to turn them on or off.
- An outlined or filled style — Cards and fields have one appearance, so screens built by different people match. Use `depth` to choose between raised and flat surfaces.

## Examples

```tsx
import {
  Button,
  Flex,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
} from "@kushagradhawan/kookie-ui-react";

export default function Example({
  density = "default",
  radius = "full",
  depth = "elevated",
}: {
  density?: "compact" | "default" | "comfortable";
  radius?: "none" | "small" | "medium" | "large" | "full";
  depth?: "flat" | "elevated";
}) {
  return (
    <Theme density={density} radius={radius} depth={depth}>
      <Stack gap="4" style={{ minWidth: "18rem" }}>
        <Text size="2" emphasis="medium">
          Every control below takes these three from the theme.
        </Text>
        <TextField placeholder="A field" aria-label="A field" />
        <Flex gap="3" align="center" justify="space-between">
          <Switch defaultChecked aria-label="A switch" />
          <Button emphasis="loud">Save</Button>
        </Flex>
      </Stack>
    </Theme>
  );
}
```

### Light and dark

The same panel in a light and a dark `Theme`. Use `inherit` at the root when a script sets the mode on `<html>` before the first paint, and use `light` or `dark` to fix one section against the rest of the page.

```tsx
import { Button, Flex, Grid, Stack, Surface, Switch, Text, Theme } from "@kushagradhawan/kookie-ui-react";

const APPEARANCES = ["light", "dark"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="4" style={{ minWidth: "30rem" }}>
      {APPEARANCES.map((appearance) => (
        <Theme key={appearance} appearance={appearance}>
          <Surface size="2">
            <Stack gap="4">
              <Flex gap="3" align="center" justify="space-between" render={<label />}>
                <Text size="2">Email digests</Text>
                <Switch defaultChecked />
              </Flex>
              <Button emphasis="loud">Save settings</Button>
            </Stack>
          </Surface>
        </Theme>
      ))}
    </Grid>
  );
}
```

### Density

The same row at `compact`, `default` and `comfortable`. Density changes control heights, padding and gaps, while text and icons keep their size.

```tsx
import { Button, Flex, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const DENSITIES = ["compact", "default", "comfortable"] as const;

export default function Example() {
  return (
    <Stack gap="5" style={{ minWidth: "26rem" }}>
      {DENSITIES.map((density) => (
        <Theme key={density} density={density}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              {density}
            </Text>
            <Flex gap="2">
              <TextField placeholder="Invite by email" aria-label={`Invite by email, ${density}`} />
              <Button>Invite</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Stack>
  );
}
```

### Radius

A field and a button at every `radius` level, from square `none` to fully rounded `full`. Radios, switches and slider thumbs stay round at every level.

```tsx
import { Button, Flex, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const RADII = ["none", "small", "medium", "large", "full"] as const;

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "26rem" }}>
      {RADII.map((radius) => (
        <Theme key={radius} radius={radius}>
          <Flex gap="3" align="center">
            <Text size="2" emphasis="medium" style={{ width: "4rem" }}>
              {radius}
            </Text>
            <TextField placeholder="Project name" aria-label={`Project name, ${radius}`} />
            <Button>Rename</Button>
          </Flex>
        </Theme>
      ))}
    </Stack>
  );
}
```

### Depth

The same card with `depth="flat"` and with the default `elevated`. Flat removes the shadows under cards and raised buttons, and because no component has its own shadow prop, you set this once for the app.

```tsx
import { Button, Card, Grid, Stack, Surface, Text, Theme } from "@kushagradhawan/kookie-ui-react";

const DEPTHS = ["flat", "elevated"] as const;

export default function Example() {
  return (
    <Surface size="3">
      <Grid columns="2" gap="4" style={{ minWidth: "30rem" }}>
        {DEPTHS.map((depth) => (
          <Theme key={depth} depth={depth}>
            <Card size="2">
              <Stack gap="3">
                <Text size="3" weight="medium">
                  Pro plan
                </Text>
                <Text size="2" emphasis="medium">
                  Unlimited projects and ten seats.
                </Text>
                <Button emphasis="loud">Upgrade</Button>
              </Stack>
            </Card>
          </Theme>
        ))}
      </Grid>
    </Surface>
  );
}
```

### High contrast

The same controls at `contrast="normal"` and `contrast="high"`. High contrast strengthens borders, fills and text so they meet the contrast minimums. Compare the field border, the checkbox and the quiet caption.

```tsx
import { Checkbox, Flex, Grid, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const CONTRASTS = ["normal", "high"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="5" style={{ minWidth: "30rem" }}>
      {CONTRASTS.map((contrast) => (
        <Theme key={contrast} appearance="light" contrast={contrast}>
          <Stack gap="3">
            <TextField placeholder="Search settings" aria-label={`Search settings, ${contrast}`} />
            <Flex gap="2" align="center" render={<label />}>
              <Checkbox defaultChecked />
              <Text size="2">Send weekly report</Text>
            </Flex>
            <Text size="2" emphasis="quiet">
              Last sent on Monday.
            </Text>
          </Stack>
        </Theme>
      ))}
    </Grid>
  );
}
```

### Default size

`size` on a `Theme` sets the size of every control that doesn't set its own. The last button in each row sets `size="2"`, so it stays the same when the theme size changes. Text keeps its own scale.

```tsx
import { Button, Flex, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const SIZES = ["2", "3"] as const;

export default function Example() {
  return (
    <Stack gap="5" style={{ minWidth: "26rem" }}>
      {SIZES.map((size) => (
        <Theme key={size} size={size}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              Theme size {size}
            </Text>
            <Flex gap="2">
              <TextField placeholder="Coupon code" aria-label={`Coupon code, theme size ${size}`} />
              <Button>Apply</Button>
              <Button size="2">Remove</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Stack>
  );
}
```

### Nested themes

A dark, compact panel with small corners inside the default theme. A nested `Theme` changes only the settings you give it, and the `Surface` inside gives the panel its own background colour.

```tsx
import { Button, Flex, Stack, Surface, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="4" style={{ minWidth: "28rem" }}>
      <Flex gap="2">
        <TextField placeholder="Search invoices" aria-label="Search invoices" />
        <Button>Export</Button>
      </Flex>
      <Theme appearance="dark" density="compact" radius="small">
        <Surface size="2">
          <Stack gap="3">
            <Text size="2" weight="medium">
              Terminal output
            </Text>
            <Flex gap="2">
              <TextField placeholder="Run a command" aria-label="Run a command" />
              <Button emphasis="loud">Run</Button>
            </Flex>
          </Stack>
        </Surface>
      </Theme>
    </Stack>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `appearance?` | `"inherit" \| "light" \| "dark"` | Sets the colour scheme for this scope: `light`, `dark` or `inherit`. |
| `children?` | `React.ReactNode` | The content that this theme applies to. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `contrast?` | `"normal" \| "high"` | Turns on high contrast for this scope: `normal` or `high`. |
| `density?` | `"compact" \| "default" \| "comfortable"` | Sets how much space the app gives its controls: `compact`, `default` or `comfortable`. |
| `depth?` | `"flat" \| "elevated"` | Sets whether surfaces and raised controls cast shadows: `elevated` or `flat`. |
| `material?` | `"1" \| "2" \| "3" \| "4" \| "5" \| "6" \| "7" \| "8" \| "9"` | Sets the material for every component in this scope. |
| `pointer?` | `"fine" \| "coarse" \| "auto"` | Sets the input type for this scope: `fine`, `coarse` or `auto`. |
| `radius?` | `"none" \| "small" \| "medium" \| "large" \| "full"` | Sets the corner radius for the app: `none`, `small`, `medium`, `large` or `full`. |
| `render?` | `RenderElement` | Renders the theme on an element that you supply, instead of an extra wrapper element. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the default size step for every sized component in this scope. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
