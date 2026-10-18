# Installation

Setting up takes three steps: adding the package, importing one stylesheet, and wrapping your
app in a `Theme`. You need no config file or build plugin.

## Add the package

`@kushagradhawan/kookie-ui-react` isn't published to npm yet, so for now you build it from the repository:

```bash
git clone https://github.com/KushagraDhawan1997/kookie-ui-v2
cd kookie-ui-v2
pnpm install
pnpm run build
```

The repository is a pnpm workspace that includes every folder under `apps/`, so put your app
there and add the package as a dependency:

```json title="package.json"
{
  "dependencies": {
    "@kushagradhawan/kookie-ui-react": "workspace:*"
  }
}
```

Once the package is on npm, you'll install it with `pnpm add @kushagradhawan/kookie-ui-react` instead, and the
rest of this page stays the same. The package needs React 19 and React DOM 19.

## Import the stylesheet

```tsx
import "@kushagradhawan/kookie-ui-react/styles.css";
```

Import it once, at the root of your app. This one file contains every style the library uses:
the colour and spacing values, the rules that all controls share, and the rules for each
component.

## Wrap your app in a Theme

```tsx
import "@kushagradhawan/kookie-ui-react/styles.css";
import { Theme } from "@kushagradhawan/kookie-ui-react";

export default function App({ children }: { children: React.ReactNode }) {
  return <Theme>{children}</Theme>;
}
```

`Theme` holds eight settings that apply to everything inside it: appearance, radius, density,
depth, material, size, contrast and pointer. Every setting has a default, so a bare `<Theme>`
works. The [Appearance](/foundations/appearance) chapter explains each one.

## Set the page background

The library doesn't paint a background for the page, so set one in your own CSS:

```css
body {
  margin: 0;
  min-height: 100dvh;
  background: var(--color-page);
  color: var(--color-text);
  font-family: var(--font-body);
}
```

If your page is mostly cards, use `--color-ground` instead of `--color-page`. It's slightly
darker than the page in light mode and slightly lighter in dark mode, so the cards stand apart
from the background behind them.

## Set dark mode before the page paints

Your server can't know whether to render the page light or dark, because both the saved choice
and the operating system setting live in the browser. If the server guesses, you get one of two
problems:

- The page shows the wrong colours for a moment.
- React warns that the server and the browser rendered different markup.

To avoid both, put a small script in your `<head>`. It writes the mode onto `<html>` before the
page paints. Then set your root `Theme` to `appearance="inherit"`, so it uses the mode the script
wrote instead of setting its own.

```html
<script>
  (function () {
    var e = document.documentElement;
    var read = function (k) {
      try { return localStorage.getItem(k); } catch (err) { return null; }
    };
    var a = read("kui-appearance");
    var dark = a === "light" ? false
      : a === "dark" ? true
      : matchMedia("(prefers-color-scheme: dark)").matches;
    e.setAttribute("data-appearance", dark ? "dark" : "light");
    var c = read("kui-contrast");
    if (c === "high" || c === "normal") e.setAttribute("data-contrast", c);
  })();
</script>
```

```tsx
<html lang="en" suppressHydrationWarning>
  <head>{/* the script above */}</head>
  <body>
    <Theme appearance="inherit">{children}</Theme>
  </body>
</html>
```

The script reads the stored choice from the `kui-appearance` and `kui-contrast` keys. Store your
own light, dark and contrast toggle under the same keys, or change the names in the script to
match yours.

**Keep the `try` around the storage read only.** Safari throws when someone blocks all cookies,
and the page must still follow the system setting.

**Set both attributes on `<html>`.** High-contrast colours apply only when `data-appearance` and
`data-contrast` are on the same element.

## Point the font tokens at your fonts

The library doesn't ship font files. It uses three font tokens, which you can point at the fonts
your app loads:

```css
:root {
  --font-body: "Inter", system-ui, sans-serif;
  --font-heading: var(--font-body);
  --font-mono: "Berkeley Mono", ui-monospace, monospace;
}
```

If you don't set them, they use the operating system's fonts.

## Check that it works

```tsx
import { Button, Card, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export function Smoke() {
  return (
    <Card>
      <Stack gap="3">
        <Text>This card should have rounded corners and a soft shadow.</Text>
        <Button tone="accent" emphasis="loud">Everything is set up</Button>
      </Stack>
    </Card>
  );
}
```

If the card has rounded corners and a shadow, the stylesheet is loaded. The button should be
near-black in light mode and near-white in dark mode, because the default accent colour is grey.
