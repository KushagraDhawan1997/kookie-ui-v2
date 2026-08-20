/**
 * Dialog's preview spec — the second component through the per-component structure
 * (2026-08-20, the manual audit's second subject).
 *
 * What a dialog makes hard, stated once here because it shapes half the sections: it is
 * MODAL. Only one can be open, it covers the viewport, and it traps focus — so the axis
 * sweeps every other component reads side by side can only be read one at a time. Where that
 * bites, the demo says so rather than faking a row (a static pane standing in for a panel
 * would be a costume, and this file does not use one).
 *
 * What is genuinely Dialog's own, and therefore what these sections are for: the scrim, the
 * overlay width ladder, the corner one step rounder than a card's, the entry, and what
 * happens when the content is taller than the window. The seal, the glass ladder, the
 * hairline and the radius band all arrived from the surface layer already judged on Card.
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

/** The theme's glass thicknesses, DERIVED from the axis. A function, not a module const:
    `themeAxes` is a client module's data and the server route imports this file for its slug
    (card.tsx's own note — the build fails on a module-scope read). */
/** Enough rows that the list genuinely scrolls — a demo that only scrolls by a hair makes a
    working mechanism look broken (the Card preview's own lesson, 2026-08-20). */
const REGIONS = [
  { city: "Frankfurt", ms: 12 },
  { city: "Amsterdam", ms: 18 },
  { city: "London", ms: 24 },
  { city: "Paris", ms: 27 },
  { city: "Stockholm", ms: 33 },
  { city: "Dublin", ms: 38 },
  { city: "Washington DC", ms: 92 },
  { city: "Cleveland", ms: 104 },
  { city: "Portland", ms: 141 },
  { city: "San Francisco", ms: 148 },
  { city: "São Paulo", ms: 186 },
  { city: "Mumbai", ms: 194 },
  { city: "Singapore", ms: 221 },
  { city: "Tokyo", ms: 235 },
  { city: "Sydney", ms: 268 },
];

const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

type Size = "1" | "2" | "3" | "4";

/**
 * ONE canonical body, opened at every size — a sign-in task, because a dialog is a TASK and
 * not a question (§25's boundary: the two-button question is AlertDialog's, and any control
 * beyond those two buttons makes it this component). Four sets of words would make the
 * judgment about the words; one set makes it about the box.
 *
 * The controls take the dialog's own size index. That is the CALL SITE matching its innards
 * to its container, which is what an app should do — §24 keeps the prop pricing the box
 * alone, so this is a composition decision the specimen demonstrates rather than a behaviour
 * the component provides.
 */
function SignIn({ size = "3" }: { size?: Size }) {
  return (
    <Stack gap="6">
      <Stack gap="2">
        <DialogTitle>Sign in</DialogTitle>
        <DialogDescription>Use your work email to continue.</DialogDescription>
      </Stack>
      <Stack gap="5">
        <TextField size={size} type="email" placeholder="you@company.com" aria-label="Email" />
        <TextField size={size} type="password" placeholder="Password" aria-label="Password" />
      </Stack>
      <Flex gap="3" justify="flex-end">
        <DialogClose render={<Button size={size} emphasis="quiet" bordered>Cancel</Button>} />
        <DialogClose render={<Button size={size} tone="accent" emphasis="loud">Sign in</Button>} />
      </Flex>
    </Stack>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The ladder can only be read SEQUENTIALLY, and saying so is the honest version of
          this section: a modal covers the viewport, so four panels cannot stand side by side
          and an uneven step has to be caught by memory between two openings. The box is the
          whole variable — identical content at every index — and what moves is max width,
          padding and corner (§24, --overlay-w-N and the overlay radius band). */}
      <Demo label="Open each in turn — only the BOX moves: width, padding, corner">
        <Flex gap="3" align="center" wrap="wrap">
          {SIZES.map((size) => (
            <Dialog key={size} size={size as Size}>
              <DialogTrigger render={<Button emphasis="medium">Size {size}</Button>} />
              <DialogContent>
                <SignIn size={size as Size} />
              </DialogContent>
            </Dialog>
          ))}
        </Flex>
      </Demo>
      {/* The corner is the one thing that CAN be compared side by side, because a card wears
          the same size index one band down: a dialog takes the corner of the card one size
          up (§24, radiusOverlay). Two boxes, same index, so the step between the bands is a
          direct read rather than a remembered one. */}
      <Demo label="The overlay corner against the card's, at the same index">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <Card size={size as Size} style={{ width: 148 }}>
                <Text size="2">Card</Text>
              </Card>
              <Dialog size={size as Size}>
                <DialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open dialog</Button>} />
                <DialogContent>
                  <SignIn size={size as Size} />
                </DialogContent>
              </Dialog>
            </Stack>
          ))}
        </Flex>
      </Demo>
      {/* The TYPE does not move with the index, and that is a live open question rather than
          a settled fact (§24: "whether a size-1 dialog deserves a smaller title is open").
          The title and description state §15's composition steps, so a size-1 dialog and a
          size-4 dialog carry the same headline — worth reading against the two boxes above. */}
      <Demo label="Size 1 and size 4 — the box moves, the title does not">
        <Flex gap="3" align="center" wrap="wrap">
          <Dialog size="1">
            <DialogTrigger render={<Button emphasis="quiet" bordered>Smallest</Button>} />
            <DialogContent>
              <SignIn size="1" />
            </DialogContent>
          </Dialog>
          <Dialog size="4">
            <DialogTrigger render={<Button emphasis="quiet" bordered>Largest</Button>} />
            <DialogContent>
              <SignIn size="4" />
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* A dialog's states are not a control's. What it can be is closed, arriving, open, and
          leaving — so the states worth judging are the ENTRY (§24: depth, not distance — 3%
          in z on the poised spring, the content sharing one blur channel) and the two
          dismissal routes, which must feel like the same gesture from either direction. */}
      <Demo label="Arrival and dismissal — open it, then leave by Escape, by the scrim, and by Cancel">
        <Flex gap="3" align="center" wrap="wrap">
          <Dialog>
            <DialogTrigger render={<Button emphasis="medium">Open</Button>} />
            <DialogContent>
              <SignIn />
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* TALLER THAN THE WINDOW is the state nothing else in the system has: the panel
          centres by auto margins inside Base UI's scrollable viewport, so a panel taller than
          the window scrolls the viewport rather than putting its own title out of reach
          (§24). Shrink the window and open this one — the title must stay reachable. */}
      <Demo label="Content taller than the window — the title must stay reachable">
        <Flex gap="3" align="center" wrap="wrap">
          <Dialog>
            <DialogTrigger render={<Button emphasis="medium">Long form</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Connect a repository</DialogTitle>
                  <DialogDescription>Pick a branch and name the environment.</DialogDescription>
                </Stack>
                <Stack gap="5">
                  {["Repository", "Branch", "Environment", "Region", "Build command", "Output directory", "Install command", "Root directory"].map(
                    (label) => (
                      <Stack key={label} gap="3">
                        <Text size="2" weight="medium">
                          {label}
                        </Text>
                        <TextField size="3" placeholder={label} aria-label={label} />
                      </Stack>
                    ),
                  )}
                </Stack>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button size="3" tone="accent" emphasis="loud">Connect</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* The OTHER answer to a long dialog, and the pair is the point: above, the panel grows
          and the viewport scrolls it, so the title leaves the screen with everything else;
          here the panel states a height and the LIST scrolls inside it, so the title and the
          actions stay put. What the system supplies is the plumbing — the scroller runs to the
          panel's own edges, the padding moves inside the viewport, and the action row keeps its
          place — for a call site that writes one height and nothing else (2026-08-21). */}
      <Demo label="A panel that stays put while its list moves">
        <Flex gap="3" align="center" wrap="wrap">
          <Dialog>
            <DialogTrigger render={<Button emphasis="medium">Choose a region</Button>} />
            <DialogContent style={{ maxHeight: "min(32rem, 70dvh)" }}>
              <Stack gap="2">
                <DialogTitle>Choose a region</DialogTitle>
                <DialogDescription>Latency is measured from your last deploy.</DialogDescription>
              </Stack>
              <ScrollArea>
                <Stack gap="1">
                  {REGIONS.map((r) => (
                    <Flex key={r.city} justify="space-between" align="center" py="3">
                      <Text size="2">{r.city}</Text>
                      <Text size="2" emphasis="medium">
                        {r.ms} ms
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </ScrollArea>
              <Flex gap="3" justify="flex-end">
                <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                <DialogClose render={<Button tone="accent" emphasis="loud">Use region</Button>} />
              </Flex>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* The TRIGGER is a Button and answers Button's states, which are judged in Button's own
          section — what belongs here is only that a dialog can be opened from any of them,
          and that the panel is identical however it was opened. */}
      <Demo label="Any trigger opens the same panel — the rung is the call site's">
        <Flex gap="3" align="center" wrap="wrap">
          {(["quiet", "medium", "loud"] as const).map((emphasis) => (
            <Dialog key={emphasis}>
              <DialogTrigger
                render={
                  <Button emphasis={emphasis} tone={emphasis === "loud" ? "accent" : "neutral"}>
                    {cap(emphasis)}
                  </Button>
                }
              />
              <DialogContent>
                <SignIn />
              </DialogContent>
            </Dialog>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The scrim is what a dialog is separated BY — the panel casts nothing of its own
          (§24), so the whole viewport going dark is the arrival. Read the panel against its
          own scrim first, on the ordinary page. */}
      <Demo label="Solid beside every thickness — over the page">
        <Flex gap="3" align="center" wrap="wrap">
          <Dialog>
            <DialogTrigger render={<Button emphasis="medium">Solid</Button>} />
            <DialogContent>
              <SignIn />
            </DialogContent>
          </Dialog>
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <Dialog>
                <DialogTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                <DialogContent>
                  <SignIn />
                </DialogContent>
              </Dialog>
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* …and then over a real photograph, which is the only bed that can answer the question
          the material exists for. The panel portals to the body, so the scrim covers the whole
          window and this bed is what shows THROUGH it — the judgment is whether the glass
          still reads as glass once the scrim has already pushed the page back. */}
      <Demo label="The same four over a photograph — does glass survive its own scrim?">
        <BedSurface bed={bed("photo")} minHeight="200px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            <Dialog>
              <DialogTrigger render={<Button emphasis="medium">Solid</Button>} />
              <DialogContent>
                <SignIn />
              </DialogContent>
            </Dialog>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Dialog>
                  <DialogTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <DialogContent>
                    <SignIn />
                  </DialogContent>
                </Dialog>
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
      {/* Size × material, the cross no single table above holds: the veil is priced for a
          pane, and a size-1 panel is a quarter of a size-4 one's area — so the cell to hunt
          for is a small glass dialog reading heavier (or a large one reading thinner) than
          its solid twin at the same index. */}
      <SpecTable
        cols={["Solid", ...glassMaterials().map(cap)]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Dialog key="solid" size={size as Size}>
              <DialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <DialogContent>
                <SignIn size={size as Size} />
              </DialogContent>
            </Dialog>,
            ...glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <Dialog size={size as Size}>
                  <DialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
                  <DialogContent>
                    <SignIn size={size as Size} />
                  </DialogContent>
                </Dialog>
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
      {/* WHAT A DIALOG HOSTS is the whole question — it is the one surface in the system built
          to hold a working composition, so the thing to judge is that nothing it hosts changes
          because it is inside a panel: a field is the field, a switch is the switch, and the
          rhythm is §15's (groups at 5, a label at 3 from its control). */}
      <Demo label="Hosting a real form — the innards must be unchanged by the panel">
        <Flex gap="3" align="center">
          <Dialog size="3">
            <DialogTrigger render={<Button emphasis="medium">Workspace settings</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Workspace settings</DialogTitle>
                  <DialogDescription>Changes apply to every member.</DialogDescription>
                </Stack>
                <Stack gap="5">
                  <Stack gap="3">
                    <Text size="2" weight="medium" render={<label htmlFor="dlg-prev-name" />}>
                      Name
                    </Text>
                    <TextField id="dlg-prev-name" size="3" defaultValue="Acme Inc" />
                  </Stack>
                  <Flex gap="3" align="center" justify="space-between">
                    <Text size="2" weight="medium" render={<label htmlFor="dlg-prev-2fa" />}>
                      Require two-factor
                    </Text>
                    <Switch id="dlg-prev-2fa" size="3" defaultChecked />
                  </Flex>
                </Stack>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button size="3" tone="accent" emphasis="loud">Save changes</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* A FLOATING LAYER INSIDE A MODAL is the composition that can actually break: a menu
          and a select each open their own portal, and both must paint ABOVE a panel that is
          itself portalled (§20's stacking frame, which orders by DOM position rather than by
          a z-index ladder). Open the dialog, then open each of these inside it. */}
      <Demo label="A select and a menu opened inside the panel — both must land above it">
        <Flex gap="3" align="center">
          <Dialog size="3">
            <DialogTrigger render={<Button emphasis="medium">Deploy</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Deploy to production</DialogTitle>
                  <DialogDescription>Choose a branch and confirm.</DialogDescription>
                </Stack>
                <Stack gap="5">
                  <Stack gap="3">
                    <Text size="2" weight="medium">
                      Branch
                    </Text>
                    <Select size="3" defaultValue="main" items={{ main: "main", next: "next", hotfix: "hotfix" }}>
                      <SelectTrigger aria-label="Branch" />
                      <SelectContent>
                        <SelectItem value="main">main</SelectItem>
                        <SelectItem value="next">next</SelectItem>
                        <SelectItem value="hotfix">hotfix</SelectItem>
                      </SelectContent>
                    </Select>
                  </Stack>
                  <Flex gap="3" align="center" justify="space-between">
                    <Text size="2" weight="medium">
                      More actions
                    </Text>
                    <Menu>
                      <MenuTrigger render={<Button size="3" emphasis="quiet" bordered>Options</Button>} />
                      <MenuContent>
                        <MenuItem>Dry run</MenuItem>
                        <MenuItem>Skip cache</MenuItem>
                        <MenuItem tone="destructive">Cancel queued builds</MenuItem>
                      </MenuContent>
                    </Menu>
                  </Flex>
                </Stack>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button size="3" tone="accent" emphasis="loud">Deploy</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* CONTENT INSIDE A GLASS PANEL — one glass per stack (§10), so the panel spends the
          backdrop and everything below it resolves on-glass rather than paying for a second
          filter. The fields inside must read as part of the pane, never as slabs punched
          through it. */}
      <Demo label="A glass panel's contents — one glass per stack, nothing pays twice">
        <Theme material="regular">
          <Flex gap="3" align="center">
            <Dialog size="3">
              <DialogTrigger render={<Button emphasis="medium">Glass panel</Button>} />
              <DialogContent>
                <SignIn />
              </DialogContent>
            </Dialog>
          </Flex>
        </Theme>
      </Demo>
      {/* SELF-NESTING gets an explicit verdict, as every component's does. A dialog inside a
          dialog is REFUSED by the platform before it is refused by taste: the panel traps
          focus and the scrim states that the page behind it is out of play, so a second
          modal contradicts the first one's whole claim. A step that needs its own confirmation
          is an AlertDialog opened after this one closes, not a panel on top of a panel. */}
      <Demo label="Dialog inside a dialog — refused; the verdict, not a demo">
        <Card size="2" style={{ maxWidth: 520 }}>
          <Stack gap="2">
            <Text size="2" weight="medium">
              No panel opens on a panel
            </Text>
            <Text size="2" emphasis="medium">
              An open dialog traps focus and its scrim says the page behind it is out of play. A
              second one would have to contradict both. A step that needs confirming is an alert
              raised after this panel closes.
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
      {/* The component doing its real job beside its neighbours: a page a consumer would
          ship, where the dialog is one action among several rather than the subject. What is
          being judged is whether the trigger sits at the right loudness in a real row, and
          whether the panel that opens feels like the same surface as the page it came from. */}
      <Demo label="A settings page — the dialog is one action among several">
        <Card size="3" style={{ maxWidth: 640 }}>
          <Stack gap="6">
            <Stack gap="2">
              <Heading size="6">Billing</Heading>
              <Text size="3" emphasis="medium">
                Team plan, renews 1 September.
              </Text>
            </Stack>
            <Separator />
            <Stack gap="5">
              <Flex gap="4" align="center" justify="space-between">
                <Stack gap="1">
                  <Text size="2" weight="medium">
                    Payment method
                  </Text>
                  <Text size="2" emphasis="medium">
                    Visa ending 4242
                  </Text>
                </Stack>
                <Dialog size="2">
                  <DialogTrigger render={<Button emphasis="quiet" bordered>Update</Button>} />
                  <DialogContent>
                    <Stack gap="6">
                      <Stack gap="2">
                        <DialogTitle>Update payment method</DialogTitle>
                        <DialogDescription>Charges apply from the next cycle.</DialogDescription>
                      </Stack>
                      <Stack gap="5">
                        <TextField size="2" placeholder="Card number" aria-label="Card number" />
                        <Flex gap="3">
                          <TextField size="2" placeholder="MM / YY" aria-label="Expiry" />
                          <TextField size="2" placeholder="CVC" aria-label="Security code" />
                        </Flex>
                      </Stack>
                      <Flex gap="3" justify="flex-end">
                        <DialogClose render={<Button size="2" emphasis="quiet" bordered>Cancel</Button>} />
                        <DialogClose render={<Button size="2" tone="accent" emphasis="loud">Save card</Button>} />
                      </Flex>
                    </Stack>
                  </DialogContent>
                </Dialog>
              </Flex>
              <Flex gap="4" align="center" justify="space-between">
                <Stack gap="1">
                  <Text size="2" weight="medium">
                    Billing email
                  </Text>
                  <Text size="2" emphasis="medium">
                    finance@acme.com
                  </Text>
                </Stack>
                <Dialog size="2">
                  <DialogTrigger render={<Button emphasis="quiet" bordered>Change</Button>} />
                  <DialogContent>
                    <Stack gap="6">
                      <Stack gap="2">
                        <DialogTitle>Billing email</DialogTitle>
                        <DialogDescription>Invoices and receipts go here.</DialogDescription>
                      </Stack>
                      <TextField size="2" type="email" defaultValue="finance@acme.com" aria-label="Billing email" />
                      <Flex gap="3" justify="flex-end">
                        <DialogClose render={<Button size="2" emphasis="quiet" bordered>Cancel</Button>} />
                        <DialogClose render={<Button size="2" tone="accent" emphasis="loud">Save</Button>} />
                      </Flex>
                    </Stack>
                  </DialogContent>
                </Dialog>
              </Flex>
            </Stack>
          </Stack>
        </Card>
      </Demo>
      {/* …and the same component over media, where the scrim has the most work to do: the
          page behind is busy, and the panel has to arrive as the only thing being asked
          about. */}
      <Demo label="Raised from a media page — the scrim has to clear a busy ground">
        <BedSurface bed={bed("bloom")} minHeight="280px">
          <Flex align="flex-end" style={{ padding: "var(--layout-space-6)" }}>
            <Box backdrop>
              <Card size="2" backdrop style={{ maxWidth: 380 }}>
                <Stack gap="4">
                  <Stack gap="1">
                    <Text size="3" weight="medium">
                      Autumn set
                    </Text>
                    <Text size="2" emphasis="medium">
                      24 photographs, 1.2 GB
                    </Text>
                  </Stack>
                  <Flex gap="3">
                    <Dialog size="2">
                      <DialogTrigger render={<Button tone="accent" emphasis="loud">Share</Button>} />
                      <DialogContent>
                        <Stack gap="6">
                          <Stack gap="2">
                            <DialogTitle>Share this set</DialogTitle>
                            <DialogDescription>Anyone with the link can view it.</DialogDescription>
                          </Stack>
                          <Stack gap="3">
                            <Text size="2" weight="medium">
                              Who can open it
                            </Text>
                            <Select size="2" defaultValue="link" items={{ link: "Anyone with the link", team: "Only my team" }}>
                              <SelectTrigger aria-label="Who can open it" />
                              <SelectContent>
                                <SelectItem value="link">Anyone with the link</SelectItem>
                                <SelectItem value="team">Only my team</SelectItem>
                              </SelectContent>
                            </Select>
                          </Stack>
                          <Flex gap="3" justify="flex-end">
                            <DialogClose render={<Button size="2" emphasis="quiet" bordered>Done</Button>} />
                            <DialogClose render={<Button size="2" tone="accent" emphasis="loud">Copy link</Button>} />
                          </Flex>
                        </Stack>
                      </DialogContent>
                    </Dialog>
                    <Button emphasis="quiet" bordered>
                      Download
                    </Button>
                  </Flex>
                </Stack>
              </Card>
            </Box>
          </Flex>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

export const dialogPreview: ComponentPreview = {
  slug: "dialog",
  name: "Dialog",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11, Card's own reason one surface up): tone and emphasis rank things, and a panel ranks nothing — it is the paper a task is written on. The tone in a dialog belongs to what it HOSTS: a destructive button inside it carries the meaning, and a whole coloured panel would state an alarm the content has not earned. A modal that IS a status is an AlertDialog.",
    },
    inUse: { body: <InUse /> },
  },
};
