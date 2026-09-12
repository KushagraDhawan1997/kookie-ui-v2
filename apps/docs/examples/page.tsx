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
} from "@kookie-ui/react";

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
