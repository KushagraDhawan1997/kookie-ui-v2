/**
 * TextField's preview spec — the field family's first component through the per-component
 * structure.
 *
 * What this page has to make readable, beyond the usual ladder, is that **the visible control
 * is a WRAPPER around the input**. Every fact worth judging here lives in that gap: the box,
 * the border, the height, the ring and the slots belong to a `<span>`, while the value, the
 * placeholder, the focus and every form behaviour belong to the `<input>` inside it. That
 * arrangement is what makes `leading`/`trailing` real anatomy rather than a convenience — the
 * border cannot stay on the `<input>` once an icon sits inside it — and it is also where the
 * component's four hardest debts are paid (click-to-caret, the slot-aware layout, a hosted
 * control that keeps its own press, and a ring that means "your keystrokes land here").
 *
 * It also has to make one taste call judgeable, which is why the States section opens with a
 * demo about nothing but grey (2026-08-24 — see that section).
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Code,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  Separator,
  Stack,
  Text,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import { LockIcon, MailIcon, SearchIcon, XIcon } from "../../icons";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis (solid is the rung where light stops
    and gets its own cell). A restated list would go stale the day the axis widens.

    A FUNCTION, not a module const: the standalone route imports this module on the server for
    its slug, and `themeAxes` is a client module's data — unreadable during server module
    evaluation. Deferred into render, it only ever runs on the client, which is the same reason
    every section below is a component rather than a module-scope element tree. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

function Sizes() {
  return (
    <Stack gap="6">
      {/* The cell-level read. Identical content in all four, so the only variables are the
          index's own: the height, the inline padding, the corner and the step the value is set
          at. The input contributes no box — no padding, no border, no background of its own —
          which is what keeps this one border and one height however much is inside it. */}
      <Demo label="Identical content — height, padding, corner and the value's own step move together">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center">
              <Box width="20rem">
                <TextField
                  size={size}
                  defaultValue="mira@kookie.dev"
                  aria-label={`Email, size ${size}`}
                />
              </Box>
              <Text size="1" emphasis="quiet">Size {size}</Text>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* The ladder that actually needed a rule (§4, decided 2026-08-04). Before it, a call
          site putting a button in a field had to guess a second size index, and the mapping it
          was being asked to infer was non-uniform and undefined at size 1 — a size-2 field
          hosting a default Button measured 1px of slack, flush to the border, with the field
          grown 2px past its own size token.

          Now ONE designed number per size — `slotInset` — shows above, below and beside the
          hosted control, and the control's height is that inset subtracted rather than a second
          ladder that would drift. What would be wrong here: a button touching the field's
          border, unequal air above and below it, or a field taller than the bare one two rows
          up. On a coarse pointer the hosted control's hit area grows to the CONTAINER's box and
          not to 44 — a nested control that out-targets the thing containing it is worse than
          the small target it was fixing. */}
      <Demo label="A leading icon and a hosted control — one designed inset on all four sides, at every size">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center">
              <Box width="20rem">
                <TextField
                  size={size}
                  defaultValue="audit findings"
                  aria-label={`Search, size ${size}`}
                  leading={<SearchIcon />}
                  trailing={
                    <Button size={size} iconOnly emphasis="quiet" aria-label="Clear search">
                      <XIcon />
                    </Button>
                  }
                />
              </Box>
              <Text size="1" emphasis="quiet">Size {size}</Text>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* A field and the button that submits it are the same box at the same index — same
          height, same corner, same ladder — because the wrapper IS a `.kui-control` and reads
          the shared control family. Read the row ends: a step that drifts shows as two
          different heights in one form row long before it shows in a token. */}
      <Demo label="A field and the button beside it, at every index — one ladder, one box">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="3" align="center">
              <Box width="16rem">
                <TextField size={size} placeholder="Invite by email" aria-label={`Invite, size ${size}`} />
              </Box>
              <Button size={size}>Invite</Button>
              <Text size="1" emphasis="quiet">Size {size}</Text>
            </Flex>
          ))}
        </Stack>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* THE GREY (2026-08-24, Kushagra: "the text field and hairline feel bit darker than they
          should be"). The light edge moved `--neutral-a4` -> `--neutral-a3`, which is the fill's
          own value: the hairline still reads because the border area composites the same alpha
          twice (~13% over a 6.7% fill), and that is a softer line than any ramp step can state.

          The FILL did not move, and the Button in each row is why it could not: a field's
          resting fill in light is ALREADY `--neutral-soft`, the same `--neutral-a3` a medium
          Button rests on. The next step down was judged "a bit too light" in this exact context
          on 2026-08-17, and there is no half step — so a lighter field means moving the ramp,
          not this pair.

          What to read: the field's box against the page it sits on, and the field's box against
          the button beside it at the same index. Those two must read as one grey. */}
      <Demo label="At rest — the field's grey, its hairline, and the medium Button that shares the grey">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center">
              <Box width="22rem">
                <TextField size={size} placeholder="Search the workspace" aria-label={`Resting field, size ${size}`} />
              </Box>
              <Button size={size} emphasis="medium">Save</Button>
              <Text size="1" emphasis="quiet">Size {size}</Text>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* The same call, in both appearances at once, because it was a LIGHT-only change and the
          asymmetry is the thing to check. Dark's fill is fainter than light's (3.4% against
          6.7%) and keeps its `--neutral-a4` edge for definition — a dark field with light's
          edge would have nothing left to bound it.

          The dead field is in the row for the second half of the same change: light's disabled
          border went one step down with the live edge, because the rule is that dead RECEDES
          from live and a3 on a3 made a disabled field byte-identical to a live one at its
          boundary. Both cells pin their appearance, so the pair reads the same whatever the
          panel says; each paints the page's own ground, since a field's grey means nothing
          without the ground it is a step away from. */}
      <Demo label="Light beside dark — the light edge moved and dark did not, and the dead border moved with it">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(["light", "dark"] as const).map((appearance) => (
            <Theme key={appearance} appearance={appearance}>
              <Box
                p="5"
                style={{ background: "var(--color-page)", borderRadius: "var(--radius-surface-3)" }}
              >
                <Stack gap="4">
                  <Text size="1" emphasis="quiet">{cap(appearance)}</Text>
                  <TextField placeholder="Search the workspace" aria-label={`Resting field, ${appearance}`} />
                  <TextField defaultValue="Locked by an admin" disabled aria-label={`Dead field, ${appearance}`} />
                  <Flex gap="3">
                    <Button emphasis="medium">Save</Button>
                    <Button emphasis="medium" disabled>Save</Button>
                  </Flex>
                </Stack>
              </Box>
            </Theme>
          ))}
        </Grid>
      </Demo>

      {/* Every state at every index. The value column is here because a field's value wears
          CONTENT weight — regular, not the control skeleton's medium, which it used to inherit
          through `font: inherit` and never by decision — and a wrong weight shows up beside a
          placeholder, not in isolation. The placeholder is the muted role at full opacity
          (Firefox's own 0.54 is overridden, or it would stack a second fade on a role already
          designed to sit under body copy). */}
      <Demo label="Every state, at every index">
        <SpecTable
          wide
          cols={["Empty", "Value", "Invalid", "Disabled", "Read only"]}
          rows={SIZES.map((size) => ({
            label: `size ${size}`,
            cells: [
              <TextField
                key="empty"
                size={size}
                placeholder="Email"
                aria-label={`Email, size ${size}, empty`}
              />,
              <TextField
                key="value"
                size={size}
                defaultValue="mira@kookie.dev"
                aria-label={`Email, size ${size}, filled`}
              />,
              // Validity is state, never a prop: `aria-invalid` is the standalone spelling and
              // `data-invalid` is what Base UI writes inside a Field.Root. The stylesheet reads
              // both, and the state re-tones the border rather than dimming the value — the
              // thing you have to fix must stay legible. Click into one: the RING re-tones with
              // the border, so the error does not go faint at the exact moment you focus to fix
              // it, and there are never two chromatic signals arguing on one box.
              <TextField
                key="invalid"
                size={size}
                defaultValue="not-an-email"
                aria-invalid="true"
                aria-label={`Email, size ${size}, invalid`}
              />,
              <TextField
                key="disabled"
                size={size}
                defaultValue="Locked"
                disabled
                aria-label={`Email, size ${size}, disabled`}
              />,
              <TextField
                key="readonly"
                size={size}
                defaultValue="ku-8841-veda"
                readOnly
                aria-label={`Reference, size ${size}, read only`}
              />,
            ],
          }))}
        />
      </Demo>

      {/* Live, because a focus is something you do. Click the box anywhere — the padding, the
          leading icon — and the caret lands: that redirect is the wrapper's first debt, and it
          deliberately leaves anything focusable alone, so the Clear button keeps its own press.

          Then tab to that Clear button. The field's ring must go out and the button's own must
          come on. It rings on the INPUT holding focus and not on `:focus-within`, which fired
          for any descendant: tabbing to a hosted control used to light two rings, one nested in
          the other, with the field claiming a focus it did not have. It is not `:focus-visible`
          either — a field's focus is a MODE, so the ring lands whether you clicked or tabbed. */}
      <Demo label="Click the box, then tab to Clear — the ring follows the caret, never the box">
        <Box width="22rem">
          <TextField
            defaultValue="segmented control audit"
            aria-label="Search, focus demo"
            leading={<SearchIcon />}
            trailing={
              <Button iconOnly emphasis="quiet" aria-label="Clear search">
                <XIcon />
              </Button>
            }
          />
        </Box>
      </Demo>

      {/* The three that get confused with each other, side by side and spelled out. `readOnly`
          drops the WELL and only the well: the border still bounds the value, the text stays at
          full contrast because it is content rather than a stood-down label, the caret cursor
          stays because you can still select and copy, and the field is still focusable, in the
          tab order and submitted with the form. Disabled is the other thing entirely — the fill
          recedes, the ink goes flat by tone, hover and press stop firing. Try all three: type
          in the first, try to type in the other two, then select the read-only value. */}
      <Demo label="Live, read only, disabled — three different sentences">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="3" align="flex-start">
          {(
            [
              ["Live", "Ship the audit findings.", {}],
              ["Read only — live, selectable, submitted", "ku-8841-veda", { readOnly: true }],
              ["Disabled — not yours to fill in", "Locked by an admin", { disabled: true }],
            ] as const
          ).map(([label, value, flags]) => (
            <Stack key={label} gap="2">
              <Text size="1" emphasis="quiet">{label}</Text>
              <TextField defaultValue={value} aria-label={label} {...flags} />
            </Stack>
          ))}
        </Grid>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The board: solid beside every thickness, over every standard bed. Each cell pins its
          material with a nested Theme so the board reads the same whatever the panel says. The
          beds are backdrop regions, so expression needs no prop on any field (§10 selectivity).

          Every cell carries its slots on purpose. A veil is where a wrong adornment colour
          shows — an icon sits ON the glass, not on a fill — and the hosted button is where the
          one-glass-per-stack rule is visible: the field spends the backdrop, so the button
          inside it paints its own opaque fill rather than a second veil. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b}>
            <Theme material="solid">
              <Box width="15rem">
                <Stack gap="2">
                  <Text size="1" emphasis="quiet">Solid</Text>
                  <TextField
                    placeholder="Solid"
                    aria-label={`Solid field on ${b.name}`}
                    leading={<SearchIcon />}
                    trailing={
                      <Button iconOnly emphasis="quiet" aria-label="Clear">
                        <XIcon />
                      </Button>
                    }
                  />
                </Stack>
              </Box>
            </Theme>
            {glassMaterials().map((m) => (
              <Theme key={m} material={m}>
                <Box width="15rem">
                  <Stack gap="2">
                    <Text size="1" emphasis="quiet">{cap(m)}</Text>
                    <TextField
                      placeholder={cap(m)}
                      aria-label={`${m} field on ${b.name}`}
                      leading={<SearchIcon />}
                      trailing={
                        <Button iconOnly emphasis="quiet" aria-label="Clear">
                          <XIcon />
                        </Button>
                      }
                    />
                  </Stack>
                </Box>
              </Theme>
            ))}
          </BedSurface>
        </Demo>
      ))}
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      {/* Size × material, over flat illustrated shapes with hard edges — the ground where a
          wrong alpha or a dead blur is most visible. Hunting for a cell that reads as a
          different component: a corner that stops being a corner at one rung, a veil that
          swallows its own placeholder. */}
      <Demo label="Size × material — over the pattern">
        <BedSurface bed={bed("pattern")} minHeight="520px">
          <Stack gap="5" style={{ width: "100%" }}>
            {(["solid", ...glassMaterials()] as const).map((m) => (
              <Theme key={m} material={m}>
                <Stack gap="3">
                  <Text size="1" emphasis="quiet">{cap(m)}</Text>
                  {SIZES.map((size) => (
                    <TextField
                      key={size}
                      size={size}
                      defaultValue={`${cap(m)} · size ${size}`}
                      aria-label={`${m}, size ${size}`}
                      leading={<SearchIcon />}
                    />
                  ))}
                </Stack>
              </Theme>
            ))}
          </Stack>
        </BedSurface>
      </Demo>

      {/* Radius level × side, which is the cross no size table holds (§4, §6, decided
          2026-08-05). Padding is measured at the vertical midline, where a pill is widest, but
          the eye judges the gap at the text's cap line — where the curve has already swung
          inward — so at `full` a bare edge reads crammed at exactly the padding that is correct
          everywhere else. `full` is the default radius, so the top row is the shipped path.

          It is PER SIDE and only a bare side: a side whose content starts with a slot keeps the
          plain padding, because the slot already stands between the text and the curve. The
          pair that decided it is here — a password field compensates its leading edge only, a
          search field with an icon compensates neither. The `medium` row is the control: every
          other level resolves the pill token back to the plain padding, so the split goes inert
          and all three leading insets close up to one number. (The password cell's trailing side
          is tighter in both rows, and that is the hosted-control inset rather than the pill
          rule — a different number for a different reason.) */}
      <Demo label="A bare pill edge pads wider, and only a bare edge — `full` above, `medium` below">
        <Stack gap="5">
          {(["full", "medium"] as const).map((radius) => (
            <Theme key={radius} radius={radius}>
              <Stack gap="3">
                <Text size="1" emphasis="quiet">radius {radius}</Text>
                {SIZES.map((size) => (
                  <Flex key={size} gap="4" align="center" wrap="wrap">
                    <Box width="13rem">
                      <TextField
                        size={size}
                        defaultValue="Bare"
                        aria-label={`Bare, ${radius}, size ${size}`}
                      />
                    </Box>
                    <Box width="13rem">
                      <TextField
                        size={size}
                        defaultValue="Icon"
                        aria-label={`Leading icon, ${radius}, size ${size}`}
                        leading={<SearchIcon />}
                      />
                    </Box>
                    <Box width="15rem">
                      <TextField
                        size={size}
                        type="password"
                        defaultValue="hunter2hunter2"
                        aria-label={`Password, ${radius}, size ${size}`}
                        trailing={<Button size={size} emphasis="quiet">Show</Button>}
                      />
                    </Box>
                  </Flex>
                ))}
              </Stack>
            </Theme>
          ))}
        </Stack>
      </Demo>

      {/* State × material. A glass field wears the material's own translucent edge rather than
          an opaque tone border — a sticker on a pane of light is the tell of glass assembled
          instead of designed. But state outranks glass: invalid and disabled each take that
          edge back, because a validity error you cannot see is not a validity error. Read it
          across: the first two cells should be bounded by light and the last two by pigment,
          and the disabled one should still be the most receded box in the row. */}
      <Demo label="State × material — the glass edge is the field's, until a state needs it back">
        <BedSurface bed={bed("photo")}>
          <Theme material="regular">
            {(
              [
                ["Rest", { placeholder: "Search" }],
                ["Filled", { defaultValue: "audit findings" }],
                ["Invalid", { defaultValue: "not-an-email", "aria-invalid": "true" as const }],
                ["Disabled", { defaultValue: "Locked", disabled: true }],
              ] as const
            ).map(([label, flags]) => (
              <Box key={label} width="13rem">
                <Stack gap="2">
                  <Text size="1" emphasis="quiet">{label}</Text>
                  <TextField aria-label={`Glass field, ${label}`} {...flags} />
                </Stack>
              </Box>
            ))}
          </Theme>
        </BedSurface>
      </Demo>

      {/* A field does NOT cast, in either depth world — the flip that settled it (§5). A well
          is carved into the plane, not raised off it, so a drop shadow under one is a
          contradiction the eye reads immediately. The loud Button is the control — it casts in
          the left cell and not in the right one — and the field is the same box in both. */}
      <Demo label="Elevated beside flat — the button lifts, the field never does">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(["elevated", "flat"] as const).map((depth) => (
            <Theme key={depth} depth={depth}>
              <Stack gap="3">
                <Text size="1" emphasis="quiet">depth {depth}</Text>
                <TextField placeholder="Search the workspace" aria-label={`Field, ${depth}`} />
                <Flex gap="3">
                  <Button tone="accent" emphasis="loud">Search</Button>
                </Flex>
              </Stack>
            </Theme>
          ))}
        </Grid>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* What it HOSTS. Two kinds of thing go in a slot and they are treated differently on
          purpose: a passive adornment (an icon, a currency mark, a unit) keeps the field's
          normal text inset so it lines up with the value beside it, while a hosted CONTROL
          takes the tighter slot inset and derives its box from it.

          Both reach the accessibility tree — a slot's content is appended to the input's
          `aria-describedby`, never replacing what the caller wrote, and it DESCRIBES rather
          than labels: an adornment qualifies the value, it does not name the field. Before
          that, a "$" was announced as loose text somewhere in the form, if at all. */}
      <Demo label="What a slot holds — an adornment lines up with the value, a control gets its own inset">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="4" align="flex-start">
          {(
            [
              ["A leading icon", { leading: <SearchIcon />, placeholder: "Search the workspace" }],
              ["A currency and a unit", { leading: <span>$</span>, trailing: <span>USD</span>, defaultValue: "24.00" }],
              [
                "A hosted reveal",
                {
                  type: "password" as const,
                  defaultValue: "hunter2hunter2",
                  trailing: <Button emphasis="quiet">Show</Button>,
                },
              ],
              [
                "An icon and a hosted clear",
                {
                  leading: <SearchIcon />,
                  defaultValue: "audit findings",
                  trailing: (
                    <Button iconOnly emphasis="quiet" aria-label="Clear search">
                      <XIcon />
                    </Button>
                  ),
                },
              ],
            ] as const
          ).map(([label, flags]) => (
            <Stack key={label} gap="2">
              <Text size="1" emphasis="quiet">{label}</Text>
              <TextField aria-label={label} {...flags} />
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* Where it LANDS, and the component that exists to hold it (§28). A `Field` states the
          index once for the whole unit — the label, the description, the error and the control
          inside it — and it reaches the control through React context, so nothing is passed
          twice. The label's step is the identity: a size-4 field is a size-4 label on a size-4
          box. An explicit `size` on the control still wins, which is what makes a size context
          safe to have at all; the last cell is that rail. */}
      <Demo label="Inside a Field — one index for the label, the description and the box">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <Field key={size} size={size}>
              <FieldLabel>Workspace name</FieldLabel>
              <TextField defaultValue="Kookie" />
              <FieldDescription>Everyone on the team sees this.</FieldDescription>
            </Field>
          ))}
          <Field size="4">
            <FieldLabel>Stated on the control</FieldLabel>
            <TextField size="1" defaultValue="Kookie" />
            <FieldDescription>The field said 4; the control said 1 and kept it.</FieldDescription>
          </Field>
        </Grid>
      </Demo>

      {/* Where it lands on a pane. A field inside a card must not read as a second card: it
          casts nothing, and its corner comes from the control band rather than the card's, so
          it stays a well in a surface instead of a surface in a surface.

          On glass, one glass per stack is STRUCTURAL (§10): the field spends the backdrop, so
          the Clear button inside it resolves solid — no veil of its own and no second blur —
          which is the thing to check in the right-hand card. */}
      <Demo label="On a solid card and on a glass one — the hosted button pays for no second veil">
        <BedSurface bed={bed("country")}>
          {(["solid", "regular"] as const).map((m) => (
            <Theme key={m} material={m}>
              <Card size="3" style={{ width: "18rem" }}>
                <Stack gap="4">
                  <Stack gap="2">
                    <Heading size="4" render={<h3 />}>Invite a teammate</Heading>
                    <Text size="2" emphasis="medium">They get read access to this project.</Text>
                  </Stack>
                  <TextField
                    placeholder="mira@kookie.dev"
                    aria-label={`Invite by email, ${m} card`}
                    leading={<MailIcon />}
                    trailing={
                      <Button iconOnly emphasis="quiet" aria-label="Clear">
                        <XIcon />
                      </Button>
                    }
                  />
                  <Flex justify="flex-end">
                    <Button tone="accent" emphasis="loud">Send invite</Button>
                  </Flex>
                </Stack>
              </Card>
            </Theme>
          ))}
        </BedSurface>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. */}
      <Demo label="A field inside a field — refused, and the slot is what it is refused in favour of">
        <Stack gap="3">
          <Box width="22rem">
            <TextField
              defaultValue="audit findings"
              aria-label="The only field"
              leading={<SearchIcon />}
              trailing={
                <Button iconOnly emphasis="quiet" aria-label="Clear search">
                  <XIcon />
                </Button>
              }
            />
          </Box>
          <Text size="2" emphasis="medium" style={{ maxWidth: "36rem" }}>
            There is no nesting case. A field holds one value and its inside is an{" "}
            <Code>&lt;input&gt;</Code>, which takes no children — the type refuses them, because
            the API promised something the DOM cannot do. What a field can contain is a control
            in a slot, and that one is designed: the hosted box derives from the
            container&rsquo;s index, so a call site never picks a second size, and on a coarse
            pointer its hit area matches the field rather than growing past it.
          </Text>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      <Demo label="Sign in">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Sign in</Heading>
                <Text size="2" emphasis="medium">Use your workspace email.</Text>
              </Stack>
              {/* Gap 5 between fields against the field's own gap inside: a group's insides sit
                  under the rhythm around them, or the column reads flat. */}
              <Stack gap="5">
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <TextField type="email" placeholder="mira@kookie.dev" leading={<MailIcon />} />
                </Field>
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <TextField
                    type="password"
                    defaultValue="hunter2hunter2"
                    leading={<LockIcon />}
                    trailing={<Button emphasis="quiet">Show</Button>}
                  />
                </Field>
              </Stack>
              <Button tone="accent" emphasis="loud" style={{ width: "100%" }}>Continue</Button>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A toolbar search: the field beside the controls it filters, all at one index, which is
          the composition the shared control ladder exists for. */}
      <Demo label="A toolbar — the field standing level with everything beside it">
        <Box maxWidth="38rem">
          <Card size="3">
            <Flex gap="3" align="center" justify="space-between" wrap="wrap">
              <Flex gap="3" align="center" wrap="wrap">
                <Box width="16rem">
                  <TextField
                    placeholder="Filter members"
                    aria-label="Filter members"
                    leading={<SearchIcon />}
                    trailing={
                      <Button iconOnly emphasis="quiet" aria-label="Clear filter">
                        <XIcon />
                      </Button>
                    }
                  />
                </Box>
                <Button emphasis="quiet" bordered>Role</Button>
                <Button emphasis="quiet" bordered>Status</Button>
              </Flex>
              <Button tone="accent" emphasis="loud">Invite</Button>
            </Flex>
          </Card>
        </Box>
      </Demo>

      {/* A form that is doing all three jobs at once: a description, a live error, and an
          adornment carrying a unit the value cannot carry itself. `aria-invalid` is the
          standalone spelling of what a submit sets, so the error renders without a round trip.
          The value stays at full contrast — the thing you must fix is the thing you must read —
          and the border carries the state, with the ring joining it when the caret goes back in. */}
      <Demo label="A billing form — a description, an error, and a unit the value cannot carry">
        <Box maxWidth="28rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Spending limit</Heading>
                <Text size="2" emphasis="medium">We stop new runs when the month reaches it.</Text>
              </Stack>
              <Stack gap="5">
                <Field>
                  <FieldLabel>Monthly cap</FieldLabel>
                  <TextField type="number" defaultValue="240" leading={<span>$</span>} trailing={<span>USD</span>} />
                  <FieldDescription>Billed at the end of each month.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Alert address</FieldLabel>
                  <TextField type="email" defaultValue="billing@kookie" aria-invalid />
                  <FieldDescription>We write here once you pass 80 percent.</FieldDescription>
                  <FieldError match={true}>That address has no domain.</FieldError>
                </Field>
              </Stack>
              <Separator />
              {/* Read only, in the one place it means something: a value the form submits and
                  the person cannot change. It is not disabled — select it and copy it. */}
              <Field>
                <FieldLabel>Account reference</FieldLabel>
                <TextField defaultValue="ku-8841-veda" readOnly />
                <FieldDescription>Quote this if you write to support.</FieldDescription>
              </Field>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Cancel</Button>
                <Button tone="accent" emphasis="loud">Save limit</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const textFieldPreview: ComponentPreview = {
  slug: "text-field",
  name: "Text field",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11): a field has no emphasis and no tone. Loudness ranks actions against their siblings, and a form where one field is louder than the next names nothing a person can act on — a \"loud input\" is not a thing the system can mean. Colour still reaches a field, but only as STATE: invalid re-tones the border and the ring, and disabled stands the whole box down. Both are in the States section, where a state belongs.",
    },
    inUse: { body: <InUse /> },
  },
};
