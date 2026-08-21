/**
 * AlertDialog's preview spec — the third component through the per-component structure
 * (2026-08-22).
 *
 * The old section showed one delete question at four sizes and nothing else, which left the
 * component's whole argument unjudgeable. What makes an alert different from a dialog is not
 * how it looks — the seal, the scrim, the corner and the glass all arrive from the same
 * layers — it is what it REFUSES: the content is closed, the layout is the system's, the
 * width is fixed per index, outside presses do not dismiss it, and it does not become a
 * sheet on a phone. Every one of those is a thing you can only see by trying to do the
 * refused thing, so most of the demos below are arranged to let you try.
 *
 * The consequence that shapes the sections: because the content is closed, `size` prices
 * EVERYTHING — box, corner, padding, the title's and description's type steps, both buttons
 * (§25). Dialog's size stops at the box. So the Sizes section here is reading a whole
 * composition move, not a padding pick.
 */
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  Separator,
  Stack,
  Text,
  TextField,
  Theme,
  componentAxes,
  themeAxes,
} from "@kookie-ui/react";

import { BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** Functions, not module consts: the standalone route imports this module on the SERVER for
    its slug, and a module-scope read of client data fails the build (card.tsx's own note). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");
const tones = () => componentAxes.tone;

type Size = "1" | "2" | "3" | "4";

/**
 * ONE canonical question, opened at every index — a delete, because that is the case this
 * component mostly exists for, and because a destructive Action is the only tone the family
 * has designed for. Four different questions would make the judgment about the words.
 *
 * Nothing here states a type step or a button rung. That is the point of the section: the
 * caller writes four parts in reading order and the component prices all of them.
 */
function DeleteQuestion() {
  return (
    <>
      <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
      <AlertDialogDescription>
        Every project, member and API key goes with it. This cannot be undone.
      </AlertDialogDescription>
      <AlertDialogCancel>Keep it</AlertDialogCancel>
      <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
    </>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The ladder is read SEQUENTIALLY — an alert is modal, so four of them cannot stand
          side by side and an uneven step has to be caught between two openings. Identical
          words at every index, so everything that moves is the component's own pricing: the
          fixed width (§25, alertWidth 280/320/360/400), the corner, the padding, the title's
          and the description's type steps, and both buttons. */}
      <Demo label="Open each in turn — the box, the type AND the buttons all move with the index">
        <Flex gap="3" align="center" wrap="wrap">
          {SIZES.map((size) => (
            <AlertDialog key={size} size={size as Size}>
              <AlertDialogTrigger render={<Button emphasis="medium">Size {size}</Button>} />
              <AlertDialogContent>
                <DeleteQuestion />
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </Flex>
      </Demo>
      {/* THE PAIR THAT STATES THE DIFFERENCE. A dialog at the same index is wider, and its
          title does not answer the index at all — it states §15's composition steps, because
          its content is the caller's. Open the two in a row at each size: the alert should
          read as the narrower, more insistent thing at every rung. */}
      <Demo label="Alert against dialog at the same index — narrower by design, and its type answers the index">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {SIZES.map((size) => (
            <Stack key={size} gap="2">
              <Text size="1" emphasis="quiet">
                size {size}
              </Text>
              <AlertDialog size={size as Size}>
                <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>Alert</Button>} />
                <AlertDialogContent>
                  <DeleteQuestion />
                </AlertDialogContent>
              </AlertDialog>
              <Dialog size={size as Size}>
                <DialogTrigger render={<Button size="1" emphasis="quiet" bordered>Dialog</Button>} />
                <DialogContent>
                  <Stack gap="6">
                    <Stack gap="2">
                      <DialogTitle>Delete workspace?</DialogTitle>
                      <DialogDescription>
                        Every project, member and API key goes with it.
                      </DialogDescription>
                    </Stack>
                    <Flex gap="3" justify="flex-end">
                      <DialogClose render={<Button size={size as Size} emphasis="quiet" bordered>Keep it</Button>} />
                      <DialogClose render={<Button size={size as Size} tone="destructive" emphasis="loud">Delete</Button>} />
                    </Flex>
                  </Stack>
                </DialogContent>
              </Dialog>
            </Stack>
          ))}
        </Flex>
      </Demo>
      {/* The two ends of the ladder, back to back, because the middle rungs hide a bad step.
          Size 3 IS the confirm card exactly (title 6, body 3) — the anchor the ladder was
          built around, so 1 and 4 are the cells to doubt. */}
      <Demo label="The ends of the ladder — size 3 is the anchor, so doubt 1 and 4">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog size="1">
            <AlertDialogTrigger render={<Button emphasis="quiet" bordered>Smallest</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog size="3">
            <AlertDialogTrigger render={<Button emphasis="quiet" bordered>The anchor</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog size="4">
            <AlertDialogTrigger render={<Button emphasis="quiet" bordered>Largest</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* THE REFUSAL, and it is the first thing to check because it is the one behaviour a
          reader can get wrong by assuming: press the scrim and NOTHING happens (§25 — an
          alert that could be dismissed by clicking elsewhere is a dialog wearing the wrong
          role). Escape still closes, because a keyboard "not now" is the Cancel action by
          another route. The dialog beside it is the control: its scrim dismisses. */}
      <Demo label="Press the scrim on each — the alert refuses, the dialog closes">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Alert — scrim does nothing</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger render={<Button emphasis="quiet" bordered>Dialog — scrim closes it</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Rename workspace</DialogTitle>
                  <DialogDescription>Everyone with access will see the new name.</DialogDescription>
                </Stack>
                <TextField placeholder="Workspace name" aria-label="Workspace name" />
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* INITIAL FOCUS is placed by document order rather than by machinery (§25): Cancel is
          written first, so it reads first, sits on the start side, and is what Base UI focuses.

          OPEN THIS ONE FROM THE KEYBOARD — Tab to the trigger and press Enter. Opening it with
          a mouse shows NOTHING, and that is the system's rule rather than a fault: the ring is
          keyboard-only (§8, the shared control rule), so a pointer user gets focus without a
          ring. Measured 2026-08-22: focus lands on Cancel either way, and `outline-style`
          computes `solid` after a keyboard open and `none` after a mouse one.

          What that leaves visible is worth reading while it is open: the LOUD button is the
          Action, and the button Enter would press is Cancel. They disagree on purpose — the
          APG puts initial focus on the least destructive choice — and after a mouse open there
          is nothing on screen that says so. Recorded as a question, not fixed. */}
      <Demo label="Tab to this and press Enter — the ring lands on the safe side, and a mouse open shows none">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Where does focus land?</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Discard 12 unsaved changes?</AlertDialogTitle>
              <AlertDialogDescription>
                They are not written anywhere else and cannot be recovered.
              </AlertDialogDescription>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction tone="destructive">Discard</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Demo>
      {/* A GATED ACTION: the committing side stood down while the condition is not met, with
          Cancel live beside it — which is what stops a disabled Action from being a trap. The
          pair is the judgment: a dead loud button and a live medium one, side by side in the
          same row, must still read as the same row. */}
      <Demo label="A gate not yet satisfied — Action dead, Cancel live, and the row still reads as a row">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Gated</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Type the workspace name to delete it</AlertDialogTitle>
              <AlertDialogDescription>
                The action stays unavailable until the name matches exactly.
              </AlertDialogDescription>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction tone="destructive" disabled>
                Delete
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
          {/* The other stand-down, and the rarer one: Cancel disabled leaves Escape as the
              only retreat. Here to be seen and mostly not to be used. */}
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="quiet" bordered>Cancel stood down</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Finish the migration?</AlertDialogTitle>
              <AlertDialogDescription>
                Rarely right: Escape is now the only way back out.
              </AlertDialogDescription>
              <AlertDialogCancel disabled>Not now</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Demo>
      {/* WORDS LONGER THAN THE BOX. The width is a designed constant, so long words are the
          box's problem and not the caller's — a question that wraps to three lines and a
          consequence that wraps to five must still put the action row where it always is. */}
      <Demo label="A long question in a fixed box — the row must not move">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog size="2">
            <AlertDialogTrigger render={<Button emphasis="medium">Long words</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>
                Revoke the deployment credentials for staging-eu-west-1?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Every running build using them fails at its next step, scheduled deploys stop
                until a new pair is issued, and the audit log keeps the revocation against your
                name. Issuing a replacement takes about a minute.
              </AlertDialogDescription>
              <AlertDialogCancel>Leave them alone</AlertDialogCancel>
              <AlertDialogAction tone="destructive">Revoke</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Demo>
      {/* THE WINDOW, and it is a deliberate NON-event. Drag the window under 768px: a dialog
          leaves the middle and becomes a sheet on the bottom edge (§24, 2026-08-21); an alert
          stays centred, because a sheet is a surface you work in and an alert is a question
          that stops you. Open both narrow and the difference should be obvious. */}
      <Demo label="Drag the window narrow — the dialog becomes a sheet, the alert stays put">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Alert stays centred</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger render={<Button emphasis="quiet" bordered>Dialog becomes a sheet</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Rename project</DialogTitle>
                  <DialogDescription>Everyone with access will see the new name.</DialogDescription>
                </Stack>
                <TextField placeholder="Project name" aria-label="Project name" />
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* THE ARRIVAL is the alert's own gesture and not the dialog's (§25, the split's whole
          cause): a circle rising from below into a measured box on the elastic spring, with
          the content printing and echoing on the family's clocks — legal here because the
          content is the system's. A dialog's entry is depth instead: 3% in z, no travel.
          Open both, twice each. */}
      <Demo label="The two entries, back to back — the alert materialises, the dialog deepens">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Alert entry</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          <Dialog>
            <DialogTrigger render={<Button emphasis="quiet" bordered>Dialog entry</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Deployment settings</DialogTitle>
                  <DialogDescription>Applied to the next build.</DialogDescription>
                </Stack>
                <TextField placeholder="Build command" aria-label="Build command" />
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button emphasis="quiet" bordered>Cancel</Button>} />
                  <DialogClose render={<Button tone="accent" emphasis="loud">Save</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The panel casts nothing of its own (§24, inherited whole): the scrim IS the
          separation, so what is being read here is whether a veil survives a ground the
          scrim has already darkened. On the plain page first. */}
      <Demo label="Solid beside every thickness — over the page">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog>
            <AlertDialogTrigger render={<Button emphasis="medium">Solid</Button>} />
            <AlertDialogContent>
              <DeleteQuestion />
            </AlertDialogContent>
          </AlertDialog>
          {glassMaterials().map((material) => (
            <Theme key={material} material={material}>
              <AlertDialog>
                <AlertDialogTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                <AlertDialogContent>
                  <DeleteQuestion />
                </AlertDialogContent>
              </AlertDialog>
            </Theme>
          ))}
        </Flex>
      </Demo>
      {/* …and over a photograph, which is the only bed that can answer it. The alert has a
          harder job here than a dialog: its box is smaller, so the veil has less area to
          establish itself, and the two buttons sit right at the pane's edge. */}
      <Demo label="The same four over a photograph — a small pane has less room to be glass in">
        <BedSurface bed={bed("photo")} minHeight="200px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            <AlertDialog>
              <AlertDialogTrigger render={<Button emphasis="medium">Solid</Button>} />
              <AlertDialogContent>
                <DeleteQuestion />
              </AlertDialogContent>
            </AlertDialog>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <AlertDialogContent>
                    <DeleteQuestion />
                  </AlertDialogContent>
                </AlertDialog>
              </Theme>
            ))}
          </Flex>
        </BedSurface>
      </Demo>
      {/* The destructive Action ON glass is its own cell: a loud red fill under a veil is the
          one place the material and the tone are both at full strength, and the words on that
          fill have to survive both. */}
      <Demo label="A destructive action on glass — the loudest fill under the heaviest veil">
        <BedSurface bed={bed("bloom")} minHeight="200px">
          <Flex gap="3" align="center" wrap="wrap" style={{ padding: "var(--layout-space-6)" }}>
            {glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button emphasis="medium">{cap(material)}</Button>} />
                  <AlertDialogContent>
                    <DeleteQuestion />
                  </AlertDialogContent>
                </AlertDialog>
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
      {/* Size × material. The cell to hunt for is a size-1 alert on thick glass: the veil is
          priced for a pane, the box here is 280px wide, and the two buttons take most of it —
          so if any cell reads as a different component it is that one. */}
      <SpecTable
        cols={["Solid", ...glassMaterials().map(cap)]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <AlertDialog key="solid" size={size as Size}>
              <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <AlertDialogContent>
                <DeleteQuestion />
              </AlertDialogContent>
            </AlertDialog>,
            ...glassMaterials().map((material) => (
              <Theme key={material} material={material}>
                <AlertDialog size={size as Size}>
                  <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
                  <AlertDialogContent>
                    <DeleteQuestion />
                  </AlertDialogContent>
                </AlertDialog>
              </Theme>
            )),
          ],
        }))}
      />
      {/* Size × the gated state, because a dead loud button is priced per index too and the
          smallest cell is where a stood-down fill has the least area to stay legible in. */}
      <SpecTable
        cols={["Both live", "Action stood down"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <AlertDialog key="live" size={size as Size}>
              <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <AlertDialogContent>
                <DeleteQuestion />
              </AlertDialogContent>
            </AlertDialog>,
            <AlertDialog key="dead" size={size as Size}>
              <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>Open</Button>} />
              <AlertDialogContent>
                <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  Type the name above to unlock this.
                </AlertDialogDescription>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction tone="destructive" disabled>
                  Delete
                </AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>,
          ],
        }))}
      />
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* WHAT IT HOSTS is a closed question, and stating that IS this section's first answer:
          the four parts are all there is (§25). A confirmation with a type-to-confirm field
          or a "don't ask again" checkbox is a Dialog — the boundary is one control, not a
          matter of degree. Shown as the verdict rather than as a demo, because the component
          will not build the illegal version. */}
      <Demo label="Hosting — the verdict, not a demo">
        <Card size="2" style={{ maxWidth: 520 }}>
          <Stack gap="2">
            <Text size="2" weight="medium">
              An alert hosts four parts and nothing else
            </Text>
            <Text size="2" emphasis="medium">
              Title, description, Cancel, Action. Add one control — a field to type the name
              into, a checkbox that says stop asking — and the thing is a Dialog. That is what
              lets the system own the layout here and animate the words on arrival.
            </Text>
          </Stack>
        </Card>
      </Demo>
      {/* WHERE IT LANDS is the real question, and the ordinary case is that it is raised from
          inside a surface the user was already working in. Nothing about the card should
          change; the alert should read as coming from the page, not from the card. */}
      <Demo label="Raised from inside a card — the card must not change">
        <Card size="3" style={{ maxWidth: 520 }}>
          <Stack gap="5">
            <Stack gap="1">
              <Text size="3" weight="medium">
                staging-eu-west-1
              </Text>
              <Text size="2" emphasis="medium">
                Last deploy 4 hours ago · 12 builds this week
              </Text>
            </Stack>
            <Separator />
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered>
                Pause
              </Button>
              <AlertDialog size="2">
                <AlertDialogTrigger render={<Button tone="destructive" emphasis="medium">Delete environment</Button>} />
                <AlertDialogContent>
                  <AlertDialogTitle>Delete staging-eu-west-1?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Builds, logs and secrets for this environment go with it.
                  </AlertDialogDescription>
                  <AlertDialogCancel>Keep it</AlertDialogCancel>
                  <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            </Flex>
          </Stack>
        </Card>
      </Demo>
      {/* AN ALERT INSIDE A DIALOG is the composition worth checking, and it is legal: a dialog
          hosts work, and confirming a destructive step in that work is exactly what the alert
          is for. Both portal, so §20's stacking frame is what orders them — DOM position, not
          a z-index ladder. Open the dialog, then the alert inside it: the alert's scrim must
          darken the dialog too, because the dialog is now the thing being interrupted. */}
      <Demo label="An alert raised from inside a dialog — its scrim must darken the panel too">
        <Flex gap="3" align="center">
          <Dialog size="3">
            <DialogTrigger render={<Button emphasis="medium">Manage members</Button>} />
            <DialogContent>
              <Stack gap="6">
                <Stack gap="2">
                  <DialogTitle>Manage members</DialogTitle>
                  <DialogDescription>Three people have access to this workspace.</DialogDescription>
                </Stack>
                <Stack gap="4">
                  {["mira@kookie.dev", "sam@kookie.dev", "ally@kookie.dev"].map((email) => (
                    <Flex key={email} gap="4" align="center" justify="space-between">
                      <Text size="2">{email}</Text>
                      <AlertDialog size="2">
                        <AlertDialogTrigger render={<Button size="2" emphasis="quiet" bordered>Remove</Button>} />
                        <AlertDialogContent>
                          <AlertDialogTitle>Remove {email}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They lose access immediately. You can invite them again later.
                          </AlertDialogDescription>
                          <AlertDialogCancel>Keep access</AlertDialogCancel>
                          <AlertDialogAction tone="destructive">Remove</AlertDialogAction>
                        </AlertDialogContent>
                      </AlertDialog>
                    </Flex>
                  ))}
                </Stack>
                <Flex gap="3" justify="flex-end">
                  <DialogClose render={<Button size="3" emphasis="quiet" bordered>Done</Button>} />
                </Flex>
              </Stack>
            </DialogContent>
          </Dialog>
        </Flex>
      </Demo>
      {/* A GLASS ALERT'S CONTENTS: one glass per stack (§10), so the panel spends the backdrop
          and its two buttons resolve on-glass rather than paying for a second filter. The
          judgment is whether the loud Action still reads as the loud one once both buttons
          sit on a translucent pane. */}
      <Demo label="A glass panel's two buttons — the loud one must still be the loud one">
        <Theme material="regular">
          <Flex gap="3" align="center">
            <AlertDialog size="2">
              <AlertDialogTrigger render={<Button emphasis="medium">Glass alert</Button>} />
              <AlertDialogContent>
                <DeleteQuestion />
              </AlertDialogContent>
            </AlertDialog>
          </Flex>
        </Theme>
      </Demo>
      {/* SELF-NESTING gets an explicit verdict, as every component's does — and here it is the
          strongest refusal in the family. A dialog refuses a second dialog because the scrim
          says the page is out of play; an alert refuses a second alert for that reason AND
          because a question raised by answering a question means the first question was not
          the question. */}
      <Demo label="An alert on an alert — refused; the verdict, not a demo">
        <Card size="2" style={{ maxWidth: 520 }}>
          <Stack gap="2">
            <Text size="2" weight="medium">
              No alert opens on an alert
            </Text>
            <Text size="2" emphasis="medium">
              An alert asks one question and closes when it is answered. A second one raised by
              the answer means the first was the wrong question. Ask the whole thing once.
            </Text>
          </Stack>
        </Card>
      </Demo>
    </Stack>
  );
}

function Tones() {
  return (
    <Stack gap="6">
      {/* The alert has exactly ONE tone consumer: the Action's fill (§25). Not the panel, not
          the title, not Cancel — a coloured panel would state an alarm the question has not
          earned, and a toned Cancel would make the retreat argue with the commitment.

          Every family is reachable, and only one of them is designed for. Read the sweep for
          what it proves — that the loud rung holds its label contrast in all ten — and then
          read the pair below it, which is the choice an app actually makes. */}
      <Demo label="Every family on the Action — reachable, and only one is designed for">
        <Flex gap="3" align="center" wrap="wrap">
          {tones().map((tone) => (
            <AlertDialog key={tone} size="2">
              <AlertDialogTrigger render={<Button size="1" emphasis="quiet" bordered>{cap(tone)}</Button>} />
              <AlertDialogContent>
                <AlertDialogTitle>Publish this release?</AlertDialogTitle>
                <AlertDialogDescription>
                  The action below is wearing the {tone} family.
                </AlertDialogDescription>
                <AlertDialogCancel>Not yet</AlertDialogCancel>
                <AlertDialogAction tone={tone}>Publish</AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </Flex>
      </Demo>
      {/* The real choice, and the only one the component has an opinion about: destructive
          when the answer cannot be taken back, and the accent identity when it can. Open both
          in a row — the difference should read before the words do. */}
      <Demo label="The choice an app makes — destructive when it cannot be undone, accent when it can">
        <Flex gap="3" align="center" wrap="wrap">
          <AlertDialog size="2">
            <AlertDialogTrigger render={<Button emphasis="medium">Cannot be undone</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Delete 12 files?</AlertDialogTitle>
              <AlertDialogDescription>They do not go to the bin.</AlertDialogDescription>
              <AlertDialogCancel>Keep them</AlertDialogCancel>
              <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog size="2">
            <AlertDialogTrigger render={<Button emphasis="medium">Can be undone</Button>} />
            <AlertDialogContent>
              <AlertDialogTitle>Publish to production?</AlertDialogTitle>
              <AlertDialogDescription>
                The previous build stays available to roll back to.
              </AlertDialogDescription>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction>Publish</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </Flex>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* The component doing its real job: the danger zone at the end of a settings page,
          where the alert is the last thing on the screen rather than the subject of it. What
          is being judged is the trigger's loudness in a real row — a destructive button that
          shouts here would make the whole page feel unsafe. */}
      <Demo label="The end of a settings page — the trigger must not shout">
        <Card size="3" style={{ maxWidth: 640 }}>
          <Stack gap="6">
            <Stack gap="2">
              <Heading size="6">Workspace</Heading>
              <Text size="3" emphasis="medium">
                Acme Inc · 24 members · created March 2024
              </Text>
            </Stack>
            <Separator />
            <Stack gap="5">
              <Flex gap="4" align="center" justify="space-between">
                <Stack gap="1">
                  <Text size="2" weight="medium">
                    Transfer ownership
                  </Text>
                  <Text size="2" emphasis="medium">
                    You keep admin access.
                  </Text>
                </Stack>
                <Button emphasis="quiet" bordered>
                  Transfer
                </Button>
              </Flex>
              <Flex gap="4" align="center" justify="space-between">
                <Stack gap="1">
                  <Text size="2" weight="medium">
                    Delete this workspace
                  </Text>
                  <Text size="2" emphasis="medium">
                    Projects, members and keys go with it.
                  </Text>
                </Stack>
                <AlertDialog size="2">
                  <AlertDialogTrigger render={<Button tone="destructive" emphasis="quiet" bordered>Delete…</Button>} />
                  <AlertDialogContent>
                    <DeleteQuestion />
                  </AlertDialogContent>
                </AlertDialog>
              </Flex>
            </Stack>
          </Stack>
        </Card>
      </Demo>
      {/* A LIST OF ROWS, each with its own question — the case where the alert's title carries
          which row it is about, because by the time the panel is open the row is behind a
          scrim and cannot be re-read. A title naming the widget instead of the thing is the
          defect this demo exists to catch. */}
      <Demo label="A row list — the title must name the row, because the row is behind the scrim">
        <Card size="3" style={{ maxWidth: 640 }}>
          <Stack gap="5">
            <Stack gap="1">
              <Text size="3" weight="medium">
                API keys
              </Text>
              <Text size="2" emphasis="medium">
                Revoking a key takes effect immediately.
              </Text>
            </Stack>
            <Stack gap="4">
              {[
                { name: "CI runner", used: "2 minutes ago" },
                { name: "Local development", used: "3 days ago" },
                { name: "Analytics export", used: "never" },
              ].map((key) => (
                <Flex key={key.name} gap="4" align="center" justify="space-between">
                  <Stack gap="1">
                    <Text size="2" weight="medium">
                      {key.name}
                    </Text>
                    <Text size="2" emphasis="medium">
                      Last used {key.used}
                    </Text>
                  </Stack>
                  <AlertDialog size="2">
                    <AlertDialogTrigger render={<Button size="2" emphasis="quiet" bordered>Revoke</Button>} />
                    <AlertDialogContent>
                      <AlertDialogTitle>Revoke “{key.name}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Anything using this key stops working at its next request.
                      </AlertDialogDescription>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction tone="destructive">Revoke</AlertDialogAction>
                    </AlertDialogContent>
                  </AlertDialog>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </Card>
      </Demo>
      {/* …and over media, where the scrim has the most work to do and the alert's small box
          has the least presence. If an alert is ever going to be lost on a page, it is here. */}
      <Demo label="Raised from a media page — the smallest panel against the busiest ground">
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
                    <Button emphasis="quiet" bordered>
                      Download
                    </Button>
                    <AlertDialog size="2">
                      <AlertDialogTrigger render={<Button tone="destructive" emphasis="medium">Delete set</Button>} />
                      <AlertDialogContent>
                        <AlertDialogTitle>Delete “Autumn set”?</AlertDialogTitle>
                        <AlertDialogDescription>
                          All 24 photographs go with it. They are not in the bin afterwards.
                        </AlertDialogDescription>
                        <AlertDialogCancel>Keep the set</AlertDialogCancel>
                        <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
                      </AlertDialogContent>
                    </AlertDialog>
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

export const alertDialogPreview: ComponentPreview = {
  slug: "alert-dialog",
  name: "Alert dialog",
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
