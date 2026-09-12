/**
 * Sheet's preview spec, modelled on Dialog's (2026-09-12).
 *
 * What a sheet makes hard is Dialog's problem plus one axis: it is MODAL, so only one can be
 * open and every ladder is read one opening at a time, and it has an EDGE, so each question is
 * asked once per side. Where that bites, the demo says so rather than faking a row with a static
 * pane.
 *
 * What is genuinely Sheet's own, and therefore what these sections are for: the edge it enters
 * from, the corners it keeps and drops, the slide on the drawer's clock, swipe-to-dismiss, the
 * cap that leaves a strip of scrim, and a body that scrolls inside the cap. The seal, the glass
 * ladder, the overlay width ladder and the overlay corner band all arrived from the surface layer
 * already judged on Card and Dialog.
 */
import * as React from "react";
import {
  Button,
  Card,
  Flex,
  Heading,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

type Size = "1" | "2" | "3" | "4";
type Side = "bottom" | "inline-start" | "inline-end";

const SIDES: readonly Side[] = ["bottom", "inline-end", "inline-start"];
const sideLabel = (side: Side) => (side === "bottom" ? "Bottom" : side === "inline-end" ? "Inline end" : "Inline start");

/** A function, not a module const: `themeAxes` is a client module's data and the server route
    imports this file for its slug (card.tsx's note). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** Enough rows that the list genuinely scrolls inside the cap. */
const ACTIVITY = [
  "Shruti Bhatia renamed the project",
  "Deploy 482 finished in 1m 12s",
  "Shruti Bhatia invited 2 members",
  "Preview branch next was created",
  "Deploy 481 failed on step 3",
  "Domain acme.dev was verified",
  "Shruti Bhatia changed the build command",
  "Deploy 480 finished in 58s",
  "Environment variable API_URL was added",
  "Deploy 479 finished in 1m 04s",
  "Shruti Bhatia rotated the deploy key",
  "Deploy 478 finished in 1m 20s",
  "Region was moved to Frankfurt",
  "Deploy 477 finished in 49s",
];

/**
 * ONE canonical body, opened at every size and every side — a filter task, because a sheet
 * holds work beside or over the page. One set of words keeps the judgment on the box.
 */
function Filters({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="6">
      <Stack gap="2">
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Narrow the deploys shown on this page.</SheetDescription>
      </Stack>
      <Stack gap="5">
        <Stack gap="3">
          <Text size="2" weight="medium">
            Environment
          </Text>
          <Select size={size} defaultValue="production" items={{ production: "Production", preview: "Preview" }}>
            <SelectTrigger aria-label="Environment" />
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
            </SelectContent>
          </Select>
        </Stack>
        <Stack gap="3">
          <Text size="2" weight="medium">
            Branch
          </Text>
          <TextField size={size} placeholder="main" aria-label="Branch" />
        </Stack>
      </Stack>
      <Flex gap="3" justify="flex-end">
        <SheetClose render={<Button size={size} emphasis="quiet" bordered>Reset</Button>} />
        <SheetClose render={<Button size={size} tone="accent" emphasis="loud">Apply</Button>} />
      </Flex>
    </Stack>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* One row per edge, because a size index means a different box on each: the whole width of
          a side sheet, and only the maximum width of a bottom sheet (on a window under 768px a
          bottom sheet is the window's width at every index). The content is identical, so what
          moves is width, padding, corner and the two owned text parts. */}
      {SIDES.map((side) => (
        <Demo key={side} label={`${sideLabel(side)} — open each index in turn`}>
          <Flex gap="3" align="center" wrap="wrap">
            {SIZES.map((size) => (
              <Sheet key={size} side={side} size={size as Size}>
                <SheetTrigger render={<Button emphasis="medium">Size {size}</Button>} />
                <SheetContent>
                  <Filters size={size as Size} />
                </SheetContent>
              </Sheet>
            ))}
          </Flex>
        </Demo>
      ))}
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* A sheet's states are closed, arriving, open, being dragged, and leaving. The four routes
          out must read as one gesture: Escape, a press on the scrim, a swipe toward the edge
          (touch, or a mouse drag outside the content), and the Close button. */}
      <Demo label="Arrival and every way out — Escape, the scrim, a swipe, and Reset">
        <Flex gap="3" align="center" wrap="wrap">
          {SIDES.map((side) => (
            <Sheet key={side} side={side}>
              <SheetTrigger render={<Button emphasis="medium">{sideLabel(side)}</Button>} />
              <SheetContent>
                <Filters />
              </SheetContent>
            </Sheet>
          ))}
        </Flex>
      </Demo>
      {/* TALLER THAN THE ROOM: a bottom sheet stops one touch target short of the top, so a strip
          of scrim stays pressable, and its content scrolls inside the panel. A side sheet is the
          window's height and scrolls the same way. The title leaves with the content. */}
      <Demo label="Content taller than the window — the panel caps and its body scrolls">
        <Flex gap="3" align="center" wrap="wrap">
          {(["bottom", "inline-end"] as const).map((side) => (
            <Sheet key={side} side={side}>
              <SheetTrigger render={<Button emphasis="medium">Activity ({sideLabel(side).toLowerCase()})</Button>} />
              <SheetContent>
                <Stack gap="5">
                  <Stack gap="2">
                    <SheetTitle>Activity</SheetTitle>
                    <SheetDescription>Everything that changed in the last week.</SheetDescription>
                  </Stack>
                  <Stack gap="4">
                    {[...ACTIVITY, ...ACTIVITY].map((line, i) => (
                      <Text key={i} size="2">
                        {line}
                      </Text>
                    ))}
                  </Stack>
                  <Flex justify="flex-end">
                    <SheetClose render={<Button emphasis="quiet" bordered>Close</Button>} />
                  </Flex>
                </Stack>
              </SheetContent>
            </Sheet>
          ))}
        </Flex>
      </Demo>
      {/* The other answer: the panel states a height and a ScrollArea placed directly in it pins
          the title and the action row while the list moves. */}
      <Demo label="A panel that stays put while its list moves">
        <Flex gap="3" align="center" wrap="wrap">
          <Sheet side="inline-end">
            <SheetTrigger render={<Button emphasis="medium">Recent activity</Button>} />
            <SheetContent style={{ height: "100%" }}>
              <Stack gap="2">
                <SheetTitle>Recent activity</SheetTitle>
                <SheetDescription>Newest first.</SheetDescription>
              </Stack>
              <ScrollArea>
                <Stack gap="4">
                  {[...ACTIVITY, ...ACTIVITY].map((line, i) => (
                    <Text key={i} size="2">
                      {line}
                    </Text>
                  ))}
                </Stack>
              </ScrollArea>
              <Flex justify="flex-end">
                <SheetClose render={<Button emphasis="quiet" bordered>Close</Button>} />
              </Flex>
            </SheetContent>
          </Sheet>
        </Flex>
      </Demo>
      {/* A sheet driven by app state has no trigger. The panel must be identical to one opened by
          a press, and closing must hand the state back through onOpenChange. */}
      <Demo label="Opened by app state, with no trigger">
        <ControlledSheet />
      </Demo>
    </Stack>
  );
}

function ControlledSheet() {
  const [open, setOpen] = React.useState(false);
  return (
    <Flex gap="3" align="center">
      <Button emphasis="medium" onClick={() => setOpen(true)}>
        Edit details
      </Button>
      <Sheet side="inline-end" open={open} onOpenChange={setOpen}>
        <SheetContent>
          <Stack gap="6">
            <Stack gap="2">
              <SheetTitle>Project details</SheetTitle>
              <SheetDescription>Everyone with access sees these.</SheetDescription>
            </Stack>
            <TextField defaultValue="Acme web" aria-label="Project name" />
            <Flex gap="3" justify="flex-end">
              <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
              <SheetClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
            </Flex>
          </Stack>
        </SheetContent>
      </Sheet>
    </Flex>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The panel against its own scrim on the ordinary page, solid beside every thickness. */}
      <Demo label="Solid beside every thickness — over the page">
        <Flex gap="3" align="center" wrap="wrap">
          <Sheet side="inline-end">
            <SheetTrigger render={<Button emphasis="medium">Solid</Button>} />
            <SheetContent>
              <Filters />
            </SheetContent>
          </Sheet>
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <Sheet side="inline-end">
                <SheetTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                <SheetContent>
                  <Filters />
                </SheetContent>
              </Sheet>
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* Over a photograph: the panel portals to the body, so the scrim covers the window and this
          bed shows through it. Judge whether the glass still reads once the scrim has pushed the
          page back, and whether the flush edge's square corners leave the lens looking right. */}
      <Demo label="The same four over a photograph, from the bottom">
        <BedSurface bed={bed("photo")} minHeight="200px">
          <Flex gap="3" align="center" wrap="wrap">
            <Sheet>
              <SheetTrigger render={<Button emphasis="medium">Solid</Button>} />
              <SheetContent>
                <Filters />
              </SheetContent>
            </Sheet>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Sheet>
                  <SheetTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <SheetContent>
                    <Filters />
                  </SheetContent>
                </Sheet>
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
      {/* Side × material: the veil is priced for a pane, and a full-height side sheet is the
          largest glass box in the system. Hunt for a cell where one edge reads heavier or thinner
          than its solid twin. */}
      <SpecTable
        cols={["Solid", ...glassMaterials().map(cap)]}
        rows={SIDES.map((side) => ({
          label: sideLabel(side),
          cells: [
            <Sheet key="solid" side={side}>
              <SheetTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <SheetContent>
                <Filters />
              </SheetContent>
            </Sheet>,
            ...glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Sheet side={side}>
                  <SheetTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
                  <SheetContent>
                    <Filters />
                  </SheetContent>
                </Sheet>
              </Theme>
            )),
          ],
        }))}
      />
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* What a sheet hosts must not change because it is inside one: a field is the field, a
          switch is the switch, and the rhythm is §15's. */}
      <Demo label="Hosting a real form — the innards must be unchanged by the panel">
        <Sheet side="inline-end" size="3">
          <SheetTrigger render={<Button emphasis="medium">Notification settings</Button>} />
          <SheetContent>
            <Stack gap="6">
              <Stack gap="2">
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>Choose what reaches your inbox.</SheetDescription>
              </Stack>
              <Stack gap="5">
                <Flex gap="3" align="center" justify="space-between">
                  <Text size="2" weight="medium" render={<label htmlFor="sheet-prev-deploys" />}>
                    Failed deploys
                  </Text>
                  <Switch id="sheet-prev-deploys" defaultChecked />
                </Flex>
                <Flex gap="3" align="center" justify="space-between">
                  <Text size="2" weight="medium" render={<label htmlFor="sheet-prev-invites" />}>
                    New members
                  </Text>
                  <Switch id="sheet-prev-invites" />
                </Flex>
                <Stack gap="3">
                  <Text size="2" weight="medium" render={<label htmlFor="sheet-prev-email" />}>
                    Send to
                  </Text>
                  <TextField id="sheet-prev-email" type="email" defaultValue="shruti@acme.dev" />
                </Stack>
              </Stack>
              <Flex gap="3" justify="flex-end">
                <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                <SheetClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
              </Flex>
            </Stack>
          </SheetContent>
        </Sheet>
      </Demo>
      {/* A floating layer inside a modal: a select and a menu open their own portals and must
          paint above a panel that is itself portalled (§20). Open the sheet, then each of these. */}
      <Demo label="A select and a menu opened inside the panel — both must land above it">
        <Sheet>
          <SheetTrigger render={<Button emphasis="medium">Deploy</Button>} />
          <SheetContent>
            <Stack gap="6">
              <Stack gap="2">
                <SheetTitle>Deploy to production</SheetTitle>
                <SheetDescription>Choose a branch and confirm.</SheetDescription>
              </Stack>
              <Flex gap="3" align="center" justify="space-between">
                <Select defaultValue="main" items={{ main: "main", next: "next" }}>
                  <SelectTrigger aria-label="Branch" />
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="next">next</SelectItem>
                  </SelectContent>
                </Select>
                <Menu>
                  <MenuTrigger render={<Button emphasis="quiet" bordered>Options</Button>} />
                  <MenuContent>
                    <MenuItem>Dry run</MenuItem>
                    <MenuItem>Skip cache</MenuItem>
                  </MenuContent>
                </Menu>
              </Flex>
              <Flex gap="3" justify="flex-end">
                <SheetClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                <SheetClose render={<Button tone="accent" emphasis="loud">Deploy</Button>} />
              </Flex>
            </Stack>
          </SheetContent>
        </Sheet>
      </Demo>
      {/* Raised from inside a glass card: the sheet covers the page, not the card, so it must take
          the THEME's material rather than the card's scope. */}
      <Demo label="Opened from a glass card — the panel is the theme's, never the card's">
        <BedSurface bed={bed("photo")} minHeight="200px">
          <Card size="2" backdrop>
            <Stack gap="3">
              <Text size="2" weight="medium">
                Deploy 482
              </Text>
              <Sheet side="inline-end">
                <SheetTrigger render={<Button emphasis="medium">View logs</Button>} />
                <SheetContent>
                  <Filters />
                </SheetContent>
              </Sheet>
            </Stack>
          </Card>
        </BedSurface>
      </Demo>
      {/* SELF-NESTING: refused, Dialog's verdict. An open sheet traps focus and its scrim says the
          page behind it is out of play; a second modal on top contradicts both. A step that needs
          its own panel replaces this one. */}
      <Demo label="Sheet inside a sheet — refused; the verdict, not a demo">
        <Card size="2" style={{ maxWidth: 520 }}>
          <Stack gap="2">
            <Text size="2" weight="medium">
              No sheet opens on a sheet
            </Text>
            <Text size="2" emphasis="medium">
              An open sheet traps focus and its scrim puts the page out of play. A second one would
              contradict both. A step that needs its own panel replaces this one.
            </Text>
          </Stack>
        </Card>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* A list page where the sheet is one action among several: filters beside the list, and
          a person's details from a row. */}
      <Demo label="A deploys page — filters and a member's details from the side">
        <Card size="3" style={{ maxWidth: 640 }}>
          <Stack gap="6">
            <Flex gap="4" align="center" justify="space-between">
              <Stack gap="2">
                <Heading size="6">Deploys</Heading>
                <Text size="3" emphasis="medium">
                  14 this week, 1 failed.
                </Text>
              </Stack>
              <Sheet side="inline-end" size="2">
                <SheetTrigger render={<Button emphasis="quiet" bordered>Filters</Button>} />
                <SheetContent>
                  <Filters />
                </SheetContent>
              </Sheet>
            </Flex>
            <Separator />
            <Flex gap="4" align="center" justify="space-between">
              <Stack gap="1">
                <Text size="2" weight="medium">
                  Shruti Bhatia
                </Text>
                <Text size="2" emphasis="medium">
                  Triggered deploy 482
                </Text>
              </Stack>
              <Sheet side="inline-end" size="2">
                <SheetTrigger render={<Button emphasis="quiet" bordered>View</Button>} />
                <SheetContent>
                  <Stack gap="6">
                    <Stack gap="2">
                      <SheetTitle>Shruti Bhatia</SheetTitle>
                      <SheetDescription>Admin since March.</SheetDescription>
                    </Stack>
                    <Stack gap="4">
                      <Flex justify="space-between">
                        <Text size="2" emphasis="medium">
                          Email
                        </Text>
                        <Text size="2">shruti@acme.dev</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text size="2" emphasis="medium">
                          Deploys this week
                        </Text>
                        <Text size="2">9</Text>
                      </Flex>
                    </Stack>
                    <Flex gap="3" justify="flex-end">
                      <SheetClose render={<Button emphasis="quiet" bordered>Close</Button>} />
                    </Flex>
                  </Stack>
                </SheetContent>
              </Sheet>
            </Flex>
          </Stack>
        </Card>
      </Demo>
      {/* A phone-shaped task from the bottom: sharing, where the sheet rises over the thing being
          shared and the page stays visible above it. */}
      <Demo label="Share from the bottom — drag the window narrow to see it take the whole width">
        <Sheet>
          <SheetTrigger render={<Button tone="accent" emphasis="loud">Share</Button>} />
          <SheetContent>
            <Stack gap="6">
              <Stack gap="2">
                <SheetTitle>Share this project</SheetTitle>
                <SheetDescription>Anyone with the link can view it.</SheetDescription>
              </Stack>
              <TextField readOnly defaultValue="https://acme.dev/p/482" aria-label="Link" />
              <Flex gap="3" justify="flex-end">
                <SheetClose render={<Button emphasis="quiet" bordered>Done</Button>} />
                <SheetClose render={<Button tone="accent" emphasis="loud">Copy link</Button>} />
              </Flex>
            </Stack>
          </SheetContent>
        </Sheet>
      </Demo>
    </Stack>
  );
}

export const sheetPreview: ComponentPreview = {
  slug: "sheet",
  name: "Sheet",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11, Dialog's reason one edge over): tone and emphasis rank things, and a sheet ranks nothing — it is the paper a task is written on. The tone belongs to what it hosts: a destructive button inside carries the meaning. A sheet that IS a status is an AlertDialog.",
    },
    inUse: { body: <InUse /> },
  },
};
