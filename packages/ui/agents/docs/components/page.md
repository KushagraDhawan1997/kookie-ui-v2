# Page

Page is the screen someone navigated to, with a large title and an optional description at the top.

Job: Go. Move to another place in the app. A pattern: it owns the decisions this job needs.

```tsx
<Page title="Nature Walks" description="Everything collected on the walk.">
  …
</Page>
```

## Overview

Use a Page for each screen someone moves to, such as a settings page or a report. It shows a large title and an optional description at the top, with your content underneath. Set the words with `title` and `description`.

The toolbar above a Page is a separate thing. The row with the navigation button, the back button and the tools stays in place while someone moves from one page to the next, so build it with a `ShellPaneHeader` and a `Toolbar`. The Page is the part that changes with each screen.

Inside a `Shell`, the Page leaves room for the toolbar row above it, whether that row floats over the content or sits in the layout. When the large title scrolls up behind the row, a `ToolbarTitle` in the row shows the same words. That is why `title` must be a string: the same words appear in two places.

A Page has no `size` and no width. Every page in an app uses the same title size, so the pages look like one product, and you set the reading width on the box that holds the Page. Outside a `Shell`, the title shows in place and doesn't collapse into a toolbar.

The title is the page's only `h1`, and screen readers use it as the name of the screen. Use a `Heading` at size 6 or 7 for sections inside the Page. Put actions in the toolbar row, not under the title, and use `mark` to show your app's logo above the title on a front page.

## Not supported

- A heading level — The page title is always the document's one `h1`, because it names the screen. For headings at other levels, use a `Heading` inside the Page.
- `size` — An app has one page title size. If pages used different sizes, parts of one app would look like different products.
- Actions beside the title — Put actions in the toolbar with the other controls. A row of buttons under the title would be a second toolbar, without the toolbar's keyboard support.
- A width — Different pages need different widths, such as a reading column or a wide table, so the Page doesn't limit its line length. Set a maximum width on the box that holds it.
- Collapsing into a toolbar outside a Shell — The title can only collapse into a toolbar row that stays in place over a scrolling region. Outside a `Shell` there is no such row, so the title shows in place.

## Examples

```tsx
import {
  Box,
  Chip,
  Flex,
  Heading,
  Page,
  Shell,
  ShellContent,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
} from "@kushagradhawan/kookie-ui-react";

import { CopyIcon, MoreIcon, PanelLeftIcon, SearchIcon } from "../app/icons";

/** One entry in the walk. A local shape, because the specimen's subject is the page around
    these and not the list — the sections exist so there is enough document to scroll. */
const ENTRIES = [
  {
    name: "Sugar maple",
    where: "North path, by the culvert",
    words:
      "Five lobes, the middle three about the same length, and the sinuses rounded rather than cut. The one that gives the syrup, and the one every field guide opens with.",
  },
  {
    name: "Pin oak",
    where: "The clearing",
    words:
      "Deeply cut, almost to the midrib, with bristle tips at every point. The lower branches sweep down instead of up, which is the thing you notice from far off.",
  },
  {
    name: "Paper birch",
    where: "Along the water",
    words:
      "Oval, double-toothed, and small enough to sit in a palm. The bark is what the tree is named for and it peels in sheets whether or not anyone helps it.",
  },
  {
    name: "White ash",
    where: "Back through the gate",
    words:
      "Compound — seven leaflets on one stalk — so what looks like a branch of leaves is a single leaf. Opposite on the twig, which is how you tell it from the walnuts.",
  },
];

export default function Example() {
  return (
    /* THE FRAME FILLS THE BOX IT IS SHOWN IN (§3's `m="bleed"`). A shell is a WINDOW, and a
       window inset inside a card's padding puts its own scrollbar and its own pane edges in
       from the box a reader takes for the app's edge. The value cancels whatever the
       surrounding surface pads, so this is right in any card. */
    <Box height="30rem" m="bleed">
      {/* THE APP STATES ITS OWN SCALE, and here that is the whole of the padding around the
          page. A page has no inset of its own — the measure and the walls are the frame's
          (§46) — so what holds a large title off the window's edge is the PANE's padding,
          which is the app's index. At 3 that is 24px, the band steps with it, and the title
          lines up with the control that opens the nav. */}
      <Shell contained size="3">
        <ShellContent>
          {/* `float` lifts the row out of flow, so the document passes underneath it — which is
              the whole arrangement this component exists for. The pane publishes what the row
              costs, the scroller fades content on its way behind it, and the page below clears
              it by reading the same number. */}
          <ShellPaneHeader float>
            {/* `backdrop` ON THE ROW (§10). The band floats, so the document passes behind
                everything in it — one fact about the space, said once, rather than a prop
                on every control. The row itself is still not a pane and paints nothing; what
                keeps a button legible while a paragraph slides under it is the material the
                button resolves because of this mark. It costs nothing until the app chooses a
                glass material, which is what selectivity means: expression is placement. */}
            <Toolbar backdrop>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Toggle navigation">
                  <PanelLeftIcon />
                </ToolbarButton>
                {/* No words of its own: it says the page's title, once the page's own has
                    scrolled up behind this band. The row states the air around it. */}
                <ToolbarTitle />
              </Flex>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Find in note">
                  <SearchIcon />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Duplicate">
                  <CopyIcon />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="More">
                  <MoreIcon />
                </ToolbarButton>
              </Flex>
            </Toolbar>
          </ShellPaneHeader>

          <ShellScroll fade>
            <Page
              title="Nature Walks"
              description="Everything collected on the walk, in the order it was found."
            >
              {/* The page states its title and its deck; everything under it is an ordinary
                  composition at the house steps (§15) — section headings at 6, body at 3,
                  meta at 2. Nothing here is the page's, which is the point: a Page is a
                  header and a clearance, not a layout. */}
              {ENTRIES.map((entry) => (
                <Stack key={entry.name} gap="3">
                  <Flex align="center" gap="3">
                    <Heading size="6">{entry.name}</Heading>
                    <Chip>{entry.where}</Chip>
                  </Flex>
                  <Text size="3" emphasis="medium">
                    {entry.words}
                  </Text>
                </Stack>
              ))}
              <Text size="2" emphasis="quiet">
                Scroll this frame. The large title goes behind the band above, and the band
                says it again.
              </Text>
            </Page>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

### Outside a Shell

A Page works without a `Shell`. The title and description show in place and don't collapse into a toolbar, and the box around the Page sets the reading width.

```tsx
import { Box, Page, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Outside a Shell there is no band to clear, so the title draws in place and does not collapse.
// The box around the page sets the reading width.
export default function Example() {
  return (
    <Box style={{ maxWidth: "36rem" }}>
      <Page title="Release notes" description="What changed in each version of the desktop app.">
        <Stack gap="3">
          <Text size="3">
            Version 4.2 adds offline editing. Changes you make without a connection sync when you
            reconnect.
          </Text>
          <Text size="3">
            Version 4.1 moves billing settings into the workspace menu, next to members.
          </Text>
        </Stack>
      </Page>
    </Box>
  );
}
```

### A title with no description

Leave out `description` when the title says everything, as on a settings page. The content starts under the title.

```tsx
import { Box, Page, Row, Stack } from "@kushagradhawan/kookie-ui-react";

// A title that says everything needs no description.
export default function Example() {
  return (
    <Box style={{ maxWidth: "32rem" }}>
      <Page title="Settings">
        <Stack gap="1">
          <Row>Profile</Row>
          <Row>Notifications</Row>
          <Row>Security</Row>
          <Row>Connected apps</Row>
        </Stack>
      </Page>
    </Box>
  );
}
```

### With your app's mark

Pass your logo or a large glyph to `mark`, and it sits above the title. Use it on a front page, not on every screen of the app.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { Box, Page, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

// `mark` sits above the title. Use it for your app's own logo on a front page.
export default function Example() {
  return (
    <Box style={{ maxWidth: "36rem" }}>
      <Page
        mark={<HugeiconsIcon icon={Folder01Icon} strokeWidth={iconStroke} size={40} aria-hidden />}
        title="Archive"
        description="Every file your team has shared, sorted by project."
      >
        <Text size="3">Open a project in the sidebar to see its files.</Text>
      </Page>
    </Box>
  );
}
```

### Under a toolbar that doesn't float

Here the `ShellPaneHeader` sits in the layout instead of floating over the content. The Page still leaves the right amount of space, and the `ToolbarTitle` shows the title once it scrolls away.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Flex,
  Heading,
  Page,
  Shell,
  ShellContent,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Share08Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const SECTIONS = [
  { title: "Usage", words: "The project used 1.8 million requests this month, 12% more than last month." },
  { title: "Errors", words: "The error rate stayed under 0.2% on every day except the 14th." },
  { title: "Latency", words: "Median latency was 84 milliseconds. The slowest region was Mumbai." },
  { title: "Cost", words: "Compute cost $412, and storage cost $38, for a total of $450." },
];

// The header sits in flow here, without `float`. The same Page still clears it.
export default function Example() {
  return (
    <Box height="30rem" m="bleed">
      <Shell contained>
        <ShellContent>
          <ShellPaneHeader>
            <Toolbar>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Back to projects">
                  {icon(ArrowLeft01Icon)}
                </ToolbarButton>
                <ToolbarTitle />
              </Flex>
              <ToolbarButton iconOnly aria-label="Share report">
                {icon(Share08Icon)}
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <Page title="Monthly report" description="Payments API, September.">
              {SECTIONS.map((section) => (
                <Stack key={section.title} gap="3">
                  <Heading size="6">{section.title}</Heading>
                  <Text size="3" emphasis="medium">{section.words}</Text>
                </Stack>
              ))}
            </Page>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `description?` | `React.ReactNode` | A sentence under the title that describes the page. |
| `mark?` | `React.ReactNode` | A logo or mark above the title, such as an app's logo on its home page. |
| `title` | `string` | The title of the page. |

It also takes every prop of a `<div>`.
