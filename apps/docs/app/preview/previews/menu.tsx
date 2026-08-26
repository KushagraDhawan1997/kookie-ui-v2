/**
 * Menu's preview spec — through the per-component structure 2026-08-22.
 *
 * The old section was three demos: a size column, a glass row and one composed card. What it
 * could not show is most of what a menu is. A menu is the row family's first member and the
 * floating family's first member at once, so it carries two sets of decisions that only
 * appear while it is open — the row's states (highlighted is not hover, checked is a tick and
 * not a louder label, disabled keeps its gutter) and the panel's (it flies out of its
 * trigger, it never scrolls itself, it lands beside a sub-trigger rather than under it).
 *
 * Everything below is arranged so those two sets can be read separately. A row's states are
 * judged in one open panel; the panel's are judged by opening and closing it repeatedly, and
 * by making it too tall or too close to an edge.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  Heading,
  Kbd,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  Separator,
  Stack,
  Text,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { CopyIcon, FolderIcon, MoreIcon, SettingsIcon, TrashIcon, UsersIcon } from "../../icons";
import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** A function, not a module const: the standalone route imports this module on the SERVER for
    its slug, and a module-scope read of client data fails the build (card.tsx's own note). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

type Size = "1" | "2" | "3" | "4";

/**
 * ONE canonical content set, reused wherever the axis under judgment is not the content: a
 * file menu with a group, a keyboard hint, a dead row, two checkables, a radio group, a
 * submenu and a destructive tail. Every row kind the component has, in one panel, so a row
 * that has drifted out of the family is visible against its neighbours rather than in
 * isolation.
 */
function FileMenu() {
  return (
    <>
      <MenuGroup>
        <MenuLabel>File</MenuLabel>
        <MenuItem leading={<CopyIcon />} trailing={<Kbd size="1">⌘D</Kbd>}>
          Duplicate
        </MenuItem>
        <MenuItem leading={<FolderIcon />}>Rename</MenuItem>
        <MenuItem leading={<UsersIcon />} disabled>
          Move to…
        </MenuItem>
      </MenuGroup>
      <Separator />
      <MenuCheckboxItem defaultChecked>Show hidden files</MenuCheckboxItem>
      <MenuCheckboxItem>Compact list</MenuCheckboxItem>
      <Separator />
      <MenuRadioGroup defaultValue="name">
        <MenuLabel>Sort by</MenuLabel>
        <MenuRadioItem value="name">Name</MenuRadioItem>
        <MenuRadioItem value="date">Date modified</MenuRadioItem>
        <MenuRadioItem value="size">Size</MenuRadioItem>
      </MenuRadioGroup>
      <Separator />
      <MenuSub>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PNG</MenuItem>
          <MenuItem>SVG</MenuItem>
          <MenuItem>PDF</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <Separator />
      <MenuItem tone="destructive" leading={<TrashIcon />}>
        Delete…
      </MenuItem>
    </>
  );
}

/** A short menu, for the demos where a fifteen-row panel would be the subject rather than the
    axis — placement, materials, the entry. */
function ShortMenu() {
  return (
    <>
      <MenuItem>Duplicate</MenuItem>
      <MenuItem>Rename</MenuItem>
      <Separator />
      <MenuItem tone="destructive">Delete…</MenuItem>
    </>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* Size is on the ROOT, like Button's (§22): one index prices the trigger's rows, their
          type, their padding and the panel's concentric corner. The defect this row exists to
          catch is a size-4 button opening a size-2 dropdown — so read each panel against the
          button that opened it, not against the panel above it. */}
      <SpecTable
        cols={["Trigger + menu"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Menu key="m" size={size as Size}>
              <MenuTrigger render={<Button size={size as Size} emphasis="medium">Actions</Button>} />
              <MenuContent>
                <FileMenu />
              </MenuContent>
            </Menu>,
          ],
        }))}
      />
      {/* A ROW IS NOT A BUTTON, and the ladder says so on purpose: a row's box is its text
          line plus a designed inset per cell, which lands a notch under the button of the same
          index (§21, the shadcn/macOS relationship — no invented floor). Open the menu and
          hold it beside the button that opened it: the row should read as the quieter, denser
          thing without reading as a smaller size. */}
      <Demo label="A row against the button that opened it — a notch under, not a size down">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <Flex gap="3" align="center">
                <Button size={size as Size} emphasis="medium">
                  Duplicate
                </Button>
                <Menu size={size as Size}>
                  <MenuTrigger render={<Button size={size as Size} emphasis="quiet" bordered>Open</Button>} />
                  <MenuContent>
                    <ShortMenu />
                  </MenuContent>
                </Menu>
              </Flex>
            </Stack>
          ))}
        </Flex>
      </Demo>
      {/* THE CORNER is the size fact that is hardest to see and easiest to get wrong: the
          panel's corner is CONCENTRIC — its rows' corner plus its own padding, derived per
          (size × radius level) (§22). Two fixed corners were tried and rejected by eye first.
          Open each panel over the card beside it and read the two radii as one system. */}
      <Demo label="The concentric corner against a card's, at the same index">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <Card size={size as Size} style={{ width: 148 }}>
                <Text size="2">Card</Text>
              </Card>
              <Menu size={size as Size}>
                <MenuTrigger render={<Button size="1" emphasis="quiet" bordered>Open menu</Button>} />
                <MenuContent>
                  <ShortMenu />
                </MenuContent>
              </Menu>
            </Stack>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* THE ROW'S STATES, all in one open panel — which is the only way to judge them, since
          a row's job is to be distinguishable from the row above it. What to read, in order:
          the dead row keeps its icon gutter (it is stood down, not removed); the ticked
          checkable wears --accent-GLYPH on the tick while its label stays neutral (a coloured
          label would read as emphasis, and rows are peers — §21; the glyph role rather than
          --accent-solid, which measures |Lc| 43 against the dark page and misses the 45 floor
          the tick is justified by — so this is the value to judge in dark); the chosen radio
          keeps its dot mounted so the gutter never shifts; and the destructive row is the only
          one carrying a family. */}
      <Demo label="One panel, every row kind — arrow through it, then point at it">
        <Flex gap="3" align="center">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Every row kind</Button>} />
            <MenuContent>
              <FileMenu />
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* HIGHLIGHTED IS NOT HOVER, and this is the demo that shows why it matters: arrow down
          with the keyboard while the pointer rests somewhere over the panel. Exactly ONE row
          is lit — the highlighted one — and the row under the pointer does not fight it. The
          shared rule is keyed on `data-highlighted`, never on `:hover` (§21), and the two
          would produce two lit rows the moment a keyboard and a pointer disagree. */}
      <Demo label="Open with the keyboard, arrow down, leave the pointer over the panel — one lit row only">
        <Flex gap="3" align="center">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Keyboard and pointer at once</Button>} />
            <MenuContent>
              <MenuItem>Open in new tab</MenuItem>
              <MenuItem>Open in new window</MenuItem>
              <MenuItem>Copy link</MenuItem>
              <MenuItem>Copy link with timestamp</MenuItem>
              <MenuItem>Add to reading list</MenuItem>
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* THE ENTRY: the panel does not fade in, it flies out of the thing that was pressed —
          the trigger's own silhouette, photographed on the mount frame, unfurling into the
          panel's real box (§22). Open and close this a few times. What must not happen is a
          box that starts somewhere the trigger never was, or a second press mid-dissolve
          replaying the flight from the trigger again (2026-08-20: a reopen is CAUGHT, not
          replayed — the panel is already on screen and already placed). */}
      <Demo label="Open, dismiss, and press again before it has faded — the second press must catch it">
        <Flex gap="3" align="center" wrap="wrap">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Narrow trigger</Button>} />
            <MenuContent>
              <FileMenu />
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger
              render={
                <Button emphasis="quiet" bordered style={{ minWidth: 320 }}>
                  A much wider trigger, so the flight has further to go
                </Button>
              }
            />
            <MenuContent>
              <ShortMenu />
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* TOO TALL FOR THE WINDOW. The panel itself never scrolls — it keeps its glass, its
          corner and its cast — and a system-owned ScrollArea viewport inside it does the
          moving (2026-08-17). Read the top and bottom edges while scrolling: the corner must
          stay, the rows must clip inside the padding, and a keyboard-focused row's ring must
          not be cut by the scroller. */}
      <Demo label="A menu taller than the window — the panel holds still, its viewport moves">
        <Flex gap="3" align="center">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Jump to file</Button>} />
            <MenuContent>
              <MenuGroup>
                <MenuLabel>Recent</MenuLabel>
                {[
                  "app/layout.tsx", "app/page.tsx", "app/preview/page.tsx",
                  "app/preview/specimens.tsx", "app/preview/showcase.tsx",
                  "packages/ui/src/index.ts", "packages/ui/src/system/surfaces.css",
                  "packages/ui/src/system/recipes.css", "packages/ui/src/system/type.css",
                  "packages/ui/src/tokens/config.ts", "packages/ui/src/tokens/generate.ts",
                  "packages/ui/src/components/menu/menu.tsx",
                  "packages/ui/src/components/menu/menu.css",
                  "packages/ui/src/components/select/select.tsx",
                  "packages/ui/src/components/dialog/dialog.tsx",
                  "docs/DECISIONS.md", "docs/ENGINEERING.md", "docs/LOG.md",
                  "docs/THESIS.md", "docs/REVIEW.md",
                ].map((path) => (
                  <MenuItem key={path}>{path}</MenuItem>
                ))}
              </MenuGroup>
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* PLACEMENT is the only positioning vocabulary that is public (§22): side, align, and
          a designed sideOffset. Everything else — collision handling, the width floor, what
          happens near an edge — is the system's. Open all four and then scroll the page so one
          of them has no room on its preferred side: it must flip, and the flight must start
          from the trigger on the side it actually landed. */}
      <Demo label="The four sides — and scroll the page so one has no room">
        <Flex gap="3" align="center" wrap="wrap">
          {(["bottom", "top", "left", "right"] as const).map((side) => (
            <Menu key={side}>
              <MenuTrigger render={<Button emphasis="quiet" bordered>{cap(side)}</Button>} />
              <MenuContent side={side}>
                <ShortMenu />
              </MenuContent>
            </Menu>
          ))}
        </Flex>
      </Demo>
      {/* A DEAD TRIGGER opens nothing, and it is the button's own disabled state doing the
          work — the menu adds no dress of its own. Beside a live one so the pair reads. */}
      <Demo label="A trigger stood down — the button's own state, nothing added">
        <Flex gap="3" align="center" wrap="wrap">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Live</Button>} />
            <MenuContent>
              <ShortMenu />
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger disabled render={<Button emphasis="medium">Stood down</Button>} />
            <MenuContent>
              <ShortMenu />
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* A menu floats over content by definition, which is the case the material was designed
          for: whatever the panel is covering is what its veil has to defend against. On the
          plain page first, where there is nothing to defend against and the glass has to still
          look deliberate. */}
      <Demo label="Solid beside every thickness — over the page">
        <Flex gap="3" align="center" wrap="wrap">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Solid</Button>} />
            <MenuContent>
              <FileMenu />
            </MenuContent>
          </Menu>
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <Menu>
                <MenuTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                <MenuContent>
                  <FileMenu />
                </MenuContent>
              </Menu>
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* …and over a photograph, which is the bed the material exists for. A menu is the
          hardest case in the family: the rows are TEXT at close spacing, so a veil that lets
          too much through turns a list of words into noise, and the lit row has to stay
          distinguishable from the ones beside it while both are translucent. */}
      <Demo label="The same four over a photograph — rows are text, and text is the hard case">
        <BedSurface bed={bed("photo")} minHeight="220px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            <Menu>
              <MenuTrigger render={<Button emphasis="medium">Solid</Button>} />
              <MenuContent>
                <FileMenu />
              </MenuContent>
            </Menu>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Menu>
                  <MenuTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <MenuContent>
                    <FileMenu />
                  </MenuContent>
                </Menu>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
      {/* A busier bed again, and this time read the ROW WASH rather than the panel: the lit
          row's fill is remapped on glass (2026-08-17), because a wash designed for an opaque
          pane disappears into a translucent one. Arrow down each of these. */}
      <Demo label="Arrow down each — the lit row's wash is remapped on glass">
        <BedSurface bed={bed("swirl")} minHeight="220px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Menu>
                  <MenuTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <MenuContent>
                    <FileMenu />
                  </MenuContent>
                </Menu>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      {/* Size × material: the veil is priced for a pane, and a size-1 panel of dense rows is
          the smallest area in the family for it to establish itself in. The cell to hunt for
          is a small thick-glass menu reading heavier than its large twin. */}
      <SpecTable
        cols={["Solid", ...glassMaterials().map(cap)]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Menu key="solid" size={size as Size}>
              <MenuTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <MenuContent>
                <FileMenu />
              </MenuContent>
            </Menu>,
            ...glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Menu size={size as Size}>
                  <MenuTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
                  <MenuContent>
                    <FileMenu />
                  </MenuContent>
                </Menu>
              </Theme>
            )),
          ],
        }))}
      />
      {/* Size × the submenu, which is the geometry cross no single table holds: the seam
          between a parent panel and its child is padding-dependent, so it is a different
          number in every density and size cell (it was aligned in NONE of six until the 2026-
          08-09 audit). Open "Export as" at each index and read the two panels' meeting edge. */}
      <SpecTable
        cols={["Parent + submenu"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Menu key="sub" size={size as Size}>
              <MenuTrigger render={<Button size="1" emphasis="quiet" bordered>Open, then hover “Export as”</Button>} />
              <MenuContent>
                <FileMenu />
              </MenuContent>
            </Menu>,
          ],
        }))}
      />
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* SELF-NESTING is the one place in this system where the verdict is YES, and it is the
          component's own designed case rather than a tolerated one. Two things to read: the
          child panel lands BESIDE its trigger, not under it — so it flies from the SEAM, not
          from the whole row (2026-08-17: photographing the row started a 92px panel from 353px
          away and the unfurl ran backwards) — and the sub-trigger stays LIT for as long as its
          child is open, because the parent row is still the path you are standing on. */}
      <Demo label="A submenu three deep — each child flies from the seam, each parent stays lit">
        <Flex gap="3" align="center">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Insert</Button>} />
            <MenuContent>
              <MenuItem>Text block</MenuItem>
              <MenuItem>Image</MenuItem>
              <Separator />
              <MenuSub>
                <MenuSubTrigger>Chart</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem>Bar</MenuItem>
                  <MenuItem>Line</MenuItem>
                  <MenuSub>
                    <MenuSubTrigger>Scatter</MenuSubTrigger>
                    <MenuSubContent>
                      <MenuItem>Linear fit</MenuItem>
                      <MenuItem>No fit</MenuItem>
                    </MenuSubContent>
                  </MenuSub>
                </MenuSubContent>
              </MenuSub>
              <MenuSub>
                <MenuSubTrigger>Embed</MenuSubTrigger>
                <MenuSubContent>
                  <MenuItem>Video</MenuItem>
                  <MenuItem>Map</MenuItem>
                  <MenuItem>Code sandbox</MenuItem>
                </MenuSubContent>
              </MenuSub>
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* HOSTED IN A CARD HEADER is the ordinary placement, and what must not change is the
          card: the panel portals to the body, so it is not clipped by the card's own corner
          and it is not part of the card's stacking. Open it and read the panel's corner
          against the card's — the two are the same system at different bands. */}
      <Demo label="A card's overflow menu — the panel escapes the card, and the corners agree">
        <Card size="3" style={{ maxWidth: 420 }}>
          <Flex justify="space-between" align="center" gap="4">
            <Stack gap="1">
              <Text size="2" weight="medium">
                Q3 planning.md
              </Text>
              <Text size="2" emphasis="medium">
                Edited 2 hours ago
              </Text>
            </Stack>
            <Menu>
              <MenuTrigger
                render={
                  <Button emphasis="quiet" iconOnly aria-label="File actions">
                    <MoreIcon />
                  </Button>
                }
              />
              <MenuContent>
                <FileMenu />
              </MenuContent>
            </Menu>
          </Flex>
        </Card>
      </Demo>
      {/* A MENU INSIDE A MODAL is the composition that can actually break: both portal, so
          §20's stacking frame is what orders them — DOM position, not a z-index ladder. Open
          the dialog, then the menu inside it. The panel must land above the dialog's own
          panel, and dismissing the menu must not dismiss the dialog under it. */}
      <Demo label="Opened inside a dialog — above the panel, and Escape closes only the menu">
        <Flex gap="3" align="center">
          <Dialog size="3">
            <DialogTrigger render={<Button emphasis="medium">Deploy</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Deploy to production</DialogTitle>
                  <DialogDescription>Choose what to run before the build.</DialogDescription>
                </Stack>
                <Flex gap="3" align="center" justify="space-between">
                  <Text size="2" weight="medium">
                    Pre-deploy step
                  </Text>
                  <Menu size="3">
                    <MenuTrigger render={<Button size="3" emphasis="quiet" bordered>Options</Button>} />
                    <MenuContent>
                      <MenuCheckboxItem defaultChecked>Run migrations</MenuCheckboxItem>
                      <MenuCheckboxItem>Skip cache</MenuCheckboxItem>
                      <Separator />
                      <MenuItem tone="destructive">Cancel queued builds</MenuItem>
                    </MenuContent>
                  </Menu>
                </Flex>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button size="3" tone="accent" emphasis="loud">Deploy</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* A MENU ON GLASS, hosted by a glass card: one glass per stack (§10), so the CARD spends
          the backdrop and a control inside it resolves solid — but the menu's panel portals
          out of that scope and is glass again, because it floats over the page rather than
          over the card. That reversal is the mechanism working, not a leak. */}
      <Demo label="A glass card's menu — the panel leaves the card's scope and is glass again">
        <Theme material="regular">
          <BedSurface bed={bed("country")} minHeight="220px">
            <Card size="3" backdrop style={{ maxWidth: 380 }}>
              <Flex justify="space-between" align="center" gap="4">
                <Stack gap="1">
                  <Text size="2" weight="medium">
                    Autumn set
                  </Text>
                  <Text size="2" emphasis="medium">
                    24 photographs
                  </Text>
                </Stack>
                <Menu>
                  <MenuTrigger
                    render={
                      <Button emphasis="quiet" iconOnly aria-label="Set actions">
                        <MoreIcon />
                      </Button>
                    }
                  />
                  <MenuContent>
                    <ShortMenu />
                  </MenuContent>
                </Menu>
              </Flex>
            </Card>
          </BedSurface>
        </Theme>
      </Demo>
    </Stack>
  );
}

function Tones() {
  return (
    <Stack gap="6">
      {/* The row's tone is a UNION OF ONE — `destructive`, and nothing else (§21). That is not
          an oversight and not a stub: a menu is a list of PEERS, so a palette of coloured rows
          would rank them, and ranking rows inside a dropdown names nothing. The single family
          survives because leaving is not a rank, it is a warning.

          What to judge: the red row against its neighbours at rest, lit, and stood down. Lit,
          it keeps its family rather than falling back to the neutral wash; disabled, it stands
          down like any other row, because dead is dead whatever the row meant. */}
      <Demo label="The one family a row may carry — at rest, lit, and stood down">
        <Flex gap="3" align="center" wrap="wrap">
          <Menu>
            <MenuTrigger render={<Button emphasis="medium">Live</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename</MenuItem>
              <Separator />
              <MenuItem tone="destructive" leading={<TrashIcon />}>
                Move to bin
              </MenuItem>
              <MenuItem tone="destructive">Delete permanently…</MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger render={<Button emphasis="quiet" bordered>With one stood down</Button>} />
            <MenuContent>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>Rename</MenuItem>
              <Separator />
              <MenuItem tone="destructive" leading={<TrashIcon />}>
                Move to bin
              </MenuItem>
              <MenuItem tone="destructive" disabled>
                Delete permanently…
              </MenuItem>
            </MenuContent>
          </Menu>
        </Flex>
      </Demo>
      {/* The same row on glass, which is where a family is hardest to hold: the ink is remapped
          for a translucent pane, so a red that reads correctly on white can go pink or go
          muddy. Both thicknesses, over a bed that fights it. */}
      <Demo label="The destructive row on glass — the family must survive the veil">
        <BedSurface bed={bed("ink")} minHeight="200px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Menu>
                  <MenuTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <MenuContent>
                    <MenuItem>Duplicate</MenuItem>
                    <MenuItem>Rename</MenuItem>
                    <Separator />
                    <MenuItem tone="destructive" leading={<TrashIcon />}>
                      Delete…
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* The ordinary job: one overflow menu per row in a list. What is being judged is
          whether an icon-only trigger reads as pressable at rest without competing with the
          content beside it — a row of loud dots would turn a file list into a control panel. */}
      <Demo label="A file list — one overflow menu per row, and none of them should shout">
        <Card size="3" style={{ maxWidth: 640 }}>
          <Stack gap="5">
            <Flex justify="space-between" align="center" gap="4">
              <Heading size="6">Documents</Heading>
              <Menu size="2">
                <MenuTrigger render={<Button size="2" emphasis="quiet" bordered>View</Button>} />
                <MenuContent>
                  <MenuRadioGroup defaultValue="list">
                    <MenuLabel>Layout</MenuLabel>
                    <MenuRadioItem value="list">List</MenuRadioItem>
                    <MenuRadioItem value="grid">Grid</MenuRadioItem>
                  </MenuRadioGroup>
                  <Separator />
                  <MenuCheckboxItem defaultChecked>Show file sizes</MenuCheckboxItem>
                  <MenuCheckboxItem>Show hidden files</MenuCheckboxItem>
                </MenuContent>
              </Menu>
            </Flex>
            <Stack gap="4">
              {[
                { name: "Q3 planning.md", meta: "12 KB · edited 2 hours ago" },
                { name: "Roadmap.pdf", meta: "1.4 MB · edited yesterday" },
                { name: "Budget.xlsx", meta: "88 KB · edited last week" },
              ].map((file) => (
                <Flex key={file.name} gap="4" align="center" justify="space-between">
                  <Stack gap="1">
                    <Text size="2" weight="medium">
                      {file.name}
                    </Text>
                    <Text size="2" emphasis="medium">
                      {file.meta}
                    </Text>
                  </Stack>
                  <Menu size="2">
                    <MenuTrigger
                      render={
                        <Button size="2" emphasis="quiet" iconOnly aria-label={`Actions for ${file.name}`}>
                          <MoreIcon />
                        </Button>
                      }
                    />
                    <MenuContent>
                      <FileMenu />
                    </MenuContent>
                  </Menu>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Demo>
      {/* A TOOLBAR, where the menu is one control among several and its trigger has to hold
          the same rung as the buttons beside it. The account menu at the end is the other
          common shape: a trigger that is not a button-shaped word at all. */}
      <Demo label="A toolbar — the trigger holds the same rung as the buttons beside it">
        <Card size="2" style={{ maxWidth: 640 }}>
          <Flex gap="3" align="center" justify="space-between">
            <Flex gap="3" align="center">
              <Button emphasis="quiet" bordered leading={<CopyIcon />}>
                Duplicate
              </Button>
              <Button emphasis="quiet" bordered leading={<SettingsIcon />}>
                Configure
              </Button>
              <Menu size="2">
                <MenuTrigger render={<Button size="2" emphasis="quiet" bordered>More</Button>} />
                <MenuContent>
                  <FileMenu />
                </MenuContent>
              </Menu>
            </Flex>
            <Menu size="2">
              <MenuTrigger
                render={
                  <Button size="2" emphasis="quiet" iconOnly aria-label="Account">
                    <UsersIcon />
                  </Button>
                }
              />
              <MenuContent align="end">
                <MenuGroup>
                  <MenuLabel>mira@kookie.dev</MenuLabel>
                  <MenuItem>Account settings</MenuItem>
                  <MenuItem>Billing</MenuItem>
                </MenuGroup>
                <Separator />
                <MenuItem>Sign out</MenuItem>
              </MenuContent>
            </Menu>
          </Flex>
        </Card>
      </Demo>
      {/* …and over media, where the trigger sits on a translucent card and its panel floats
          over the photograph itself. This is the composition the material was built for, and
          it is the one worth checking last. */}
      <Demo label="On a media page — the trigger on glass, the panel over the photograph">
        <BedSurface bed={bed("bloom")} minHeight="280px">
          <Flex align="flex-end" style={{ padding: "var(--layout-space-6)" }}>
            <Box backdrop>
              <Card size="2" backdrop style={{ maxWidth: 380 }}>
                <Flex justify="space-between" align="center" gap="4">
                  <Stack gap="1">
                    <Text size="3" weight="medium">
                      Autumn set
                    </Text>
                    <Text size="2" emphasis="medium">
                      24 photographs, 1.2 GB
                    </Text>
                  </Stack>
                  <Menu size="2">
                    <MenuTrigger
                      render={
                        <Button size="2" emphasis="quiet" iconOnly aria-label="Set actions">
                          <MoreIcon />
                        </Button>
                      }
                    />
                    <MenuContent align="end">
                      <FileMenu />
                    </MenuContent>
                  </Menu>
                </Flex>
              </Card>
            </Box>
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

export const menuPreview: ComponentPreview = {
  slug: "menu",
  name: "Menu",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: { body: <Tones /> },
    inUse: { body: <InUse /> },
  },
};
