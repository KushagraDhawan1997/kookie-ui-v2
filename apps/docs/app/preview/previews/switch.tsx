/**
 * Switch's preview spec — the mark family's SHIFTED member, and the one component whose
 * headline this week is a STAND-DOWN.
 *
 * The grip has cast a shadow in every world since the day it shipped (2026-08-08), the
 * slider handle's exception inherited with the role rather than re-argued. On 2026-08-24
 * that sentence was narrowed: "always" is about the WORLD — flat and elevated both keep it
 * — and glass is a MATERIAL, the axis the sentence was never about. A pane has one lift, so
 * a grip inside glass is a ridge in it rather than a pebble on it. The pair is the only way
 * to judge either half, which is why Materials opens with the same switch in a glass pane
 * and in a solid one over the same bed, rather than leaving the claim in a comment.
 *
 * What else this page has to prove, beyond the ladder. The one-index shift is REAL and it is
 * inert in exactly one cell (coarse size 4, where the handheld band prices type steps 4 and
 * 5 alike and the switch stands level with the checkbox at its own number) — both directions
 * are law-asserted, so both are drawn. The grip has to survive every state that dims the
 * channel around it, because its POSITION is the control's state and a melted grip erases
 * the state along with the colour. And the crossing has to be watched, not tabulated: the
 * thumb is drawn by both its inline edges on one clock, which is what lets it lean toward
 * where it is going while it is held — so the live demos are several switches at several
 * sizes, with real labels on them.
 */
import {
  Box,
  Card,
  Checkbox,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Heading,
  SegmentedControl,
  SegmentedItem,
  Slider,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis (solid is the rung where light
    stops, shown as its own cell). A restated list here would go stale the day the axis
    widens.

    A FUNCTION, not a module const: the standalone route imports this module on the server
    for its slug, and `themeAxes` is a client module's data — unreadable during server module
    evaluation. Deferred into render, it only ever runs on the client. Same reason every
    section below is a component. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** The three index pairs where the shift can be READ against a real neighbour: a switch at n
    stands level with a checkbox at n + 1, which is the identity the family is built on. Size
    4 has no checkbox above it, so it is drawn in the pointer demo instead. */
const LEVEL = [
  ["1", "2"],
  ["2", "3"],
  ["3", "4"],
] as const;

/** One settings row: a name, the consequence of turning it on, and the control. The label is
    a real `<label htmlFor>` — the family refuses to draw its own, because a mark sits BESIDE
    its label and the row that owns them both is what spaces them. */
function Setting({ id, label, detail, on = false }: { id: string; label: string; detail: string; on?: boolean }) {
  return (
    <Flex gap="5" align="center" justify="space-between">
      <Stack gap="1">
        <Text size="3" weight="medium" render={<label htmlFor={id} />}>
          {label}
        </Text>
        <Text size="2" emphasis="medium">
          {detail}
        </Text>
      </Stack>
      <Switch id={id} defaultChecked={on} />
    </Flex>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The ladder, both states. The tracks are 34/40/44/48 in the fine world — one designed
          ladder indexed by the mark the track IS, so no pointer world ever got its own
          numbers, and every cell holds 1.67-1.71 of its own height. Left-aligned on purpose:
          the widths have to grow against one edge or an uneven step hides. */}
      <SpecTable
        cols={["Off", "On"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Switch key="off" size={size} aria-label={`Size ${size}, off`} />,
            <Switch key="on" size={size} defaultChecked aria-label={`Size ${size}, on`} />,
          ],
        }))}
      />

      {/* The SHIFT, read against the neighbour it is defined by: the track is mark(n + 1), so
          at the same number a switch stands one step taller than the checkbox — and level
          with the checkbox one size up. Both rows here, because the claim is a pair and one
          row alone would let either half drift. */}
      <Demo label="The same index — the switch stands one step taller">
        <SpecTable
          cols={["Switch", "Checkbox"]}
          rows={SIZES.map((size) => ({
            label: `size ${size}`,
            cells: [
              <Switch key="s" size={size} defaultChecked aria-label={`Switch ${size}`} />,
              <Checkbox key="c" size={size} defaultChecked aria-label={`Checkbox ${size}`} />,
            ],
          }))}
        />
      </Demo>
      <Demo label="One index up — and they stand level, which is what the identity says">
        <Flex gap="6" wrap="wrap" align="center">
          {LEVEL.map(([sw, cb]) => (
            <Flex key={sw} gap="3" align="center">
              <Switch size={sw} defaultChecked aria-label={`Switch ${sw}`} />
              <Checkbox size={cb} defaultChecked aria-label={`Checkbox ${cb}`} />
            </Flex>
          ))}
        </Flex>
      </Demo>

      {/* The recorded wrinkle, drawn rather than excused. The mark ladder is the LINE BOX, and
          §17's handheld band prices type steps 4 and 5 alike — so at coarse size 4 the shift
          has nowhere to go and the switch stands exactly as tall as the checkbox at its own
          number. A law asserts the equality there and the strict rise in the other 7 cells,
          so this cell is a fact about the type band, not a defect. */}
      <Demo label="Size 4 in both pointer worlds — the shift is inert in exactly one cell">
        <Flex gap="6" wrap="wrap" align="flex-start">
          {(["fine", "coarse"] as const).map((pointer) => (
            <Stack key={pointer} gap="3">
              <Text size="2" emphasis="quiet">{cap(pointer)}</Text>
              <Theme pointer={pointer}>
                <Flex gap="3" align="center">
                  <Switch size="4" defaultChecked aria-label={`Switch 4, ${pointer}`} />
                  <Checkbox size="4" defaultChecked aria-label={`Checkbox 4, ${pointer}`} />
                </Flex>
              </Theme>
            </Stack>
          ))}
        </Flex>
      </Demo>

      {/* The whole family at one index, which is what the shared ladder is FOR: a checkbox
          beside a switch beside a slider's grip has to read as the same size of thing, and
          nothing enforces that if each control designs its own pair. */}
      <Demo label="The mark family at size 2 — one ladder, so one weight class">
        <Flex gap="5" align="center" wrap="wrap">
          <Switch size="2" defaultChecked aria-label="Switch" />
          <Checkbox size="2" defaultChecked aria-label="Checkbox" />
          <Slider size="2" defaultValue={60} aria-label="Volume" style={{ width: "160px" }} />
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* Every state at every index. Two of these columns exist because of defects that
          shipped: "On, disabled" is the pair that caught the grip melting into its own
          channel (the first disabled spelling sent the thumb to the track's own remapped
          grey, and "Disabled" and "On, disabled" rendered as one indistinguishable capsule —
          the thumb's POSITION is the state, so erasing it erases the state), and the two
          invalid columns exist because the wash reaches the track and the edge from
          different rules. */}
      <SpecTable
        cols={["Off", "On", "Invalid", "On, invalid", "Disabled", "On, disabled"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Switch key="1" size={size} aria-label={`Size ${size}, off`} />,
            <Switch key="2" size={size} defaultChecked aria-label={`Size ${size}, on`} />,
            <Switch key="3" size={size} aria-invalid="true" aria-label={`Size ${size}, invalid`} />,
            <Switch key="4" size={size} aria-invalid="true" defaultChecked aria-label={`Size ${size}, on and invalid`} />,
            <Switch key="5" size={size} disabled aria-label={`Size ${size}, disabled`} />,
            <Switch key="6" size={size} defaultChecked disabled aria-label={`Size ${size}, on and disabled`} />,
          ],
        }))}
      />

      {/* LIVE, and the only way to judge the movement (§8). The thumb is drawn by BOTH its
          inline edges on one clock: `inset-inline-end: auto` cannot be animated to, so a
          thumb pinned by one edge could only teleport — and because the lean uses the same
          two properties as the crossing, the grip stretches toward where it is going instead
          of collapsing first and then travelling. Hold one down before letting go. Tab
          through them too: the ring is the shared layer's, and it is absent at rest. */}
      <Demo label="Toggle these — and hold one down to see the grip lean before it goes">
        <Flex gap="6" wrap="wrap" align="center">
          {(
            [
              ["1", "sw-live-1", "Wi-Fi", true],
              ["2", "sw-live-2", "Bluetooth", true],
              ["3", "sw-live-3", "AirDrop", false],
              ["4", "sw-live-4", "Hotspot", false],
            ] as const
          ).map(([size, id, label, on]) => (
            <Flex key={id} gap="3" align="center">
              <Switch id={id} size={size} defaultChecked={on} />
              <Text size="2" render={<label htmlFor={id} />}>
                {label}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Demo>

      {/* Live beside dead, both states, so the recorded failure is checkable by eye rather
          than by memory. Dead: the channel dims and the cast goes; the grip stands down too,
          but as --color-thumb at the shared dim factor rather than as the track's own grey —
          a disabled checked checkbox keeps its glyph, and this is the same sentence one
          control over. The one thing that must still read across all four is WHICH SIDE the
          grip is on. */}
      <Demo label="Live beside dead — the channel recedes, the grip stays findable">
        <Flex gap="6" wrap="wrap" align="center">
          {(
            [
              ["Live, off", false, false],
              ["Live, on", true, false],
              ["Dead, off", false, true],
              ["Dead, on", true, true],
            ] as const
          ).map(([label, on, dead]) => (
            <Stack key={label} gap="3">
              <Text size="2" emphasis="quiet">{label}</Text>
              <Switch size="3" defaultChecked={on} disabled={dead} aria-label={label} />
            </Stack>
          ))}
        </Flex>
      </Demo>

      {/* The off state is a WELL — the tone-independent track role, with the edge melted INTO
          it so the box never changes size on a toggle. It does not step under the pointer
          either: a well does not fill, and the state that changes is the thumb's side. Hover
          the off ones and watch nothing happen; that is the design. */}
      <Demo label="Hover the off ones — a channel is felt for, not read">
        <Flex gap="5" align="center" wrap="wrap">
          {SIZES.map((size) => (
            <Switch key={size} size={size} aria-label={`Hover ${size}`} />
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

function Materials() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* TODAY's change (2026-08-24), given the pair it needs. A switch has no material of its
          own — no `material` prop, no `backdrop` prop — so what this section judges is what a
          PANE does to it. The grip's cast stands down inside glass and holds on solid ground:
          one lift per pane, the same stand-down the button casts have always had, which the
          grips walked out of when they left --control-chrome for --grip-cast on 2026-08-17.
          Both panes sit on one bed at one size, because the claim is a difference. */}
      <Demo label="The same switch in a glass pane and in a solid one — the grip's lift is the whole difference">
        <BedSurface bed={bed("photo")}>
          {(["solid", "regular"] as const).map((m) => (
            <Theme key={m} material={m}>
              <Card size="3" style={{ width: "220px" }}>
                <Stack gap="4">
                  <Text size="3" weight="medium">{cap(m)} pane</Text>
                  <Flex gap="5" align="center">
                    <Switch defaultChecked aria-label={`${m} pane, on`} />
                    <Switch aria-label={`${m} pane, off`} />
                  </Flex>
                </Stack>
              </Card>
            </Theme>
          ))}
        </BedSurface>
      </Demo>

      {/* The board: solid beside every thickness, over every standard bed. Each cell pins its
          material with a nested Theme so the board reads the same whatever the panel says.
          The beds are backdrop regions, so the pane expresses the theme's glass with no prop
          on any card (§10 selectivity) — and the switches inside pay nothing for it. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b}>
            {(["solid", ...GLASS] as const).map((m) => (
              <Theme key={m} material={m}>
                <Card size="2" style={{ width: "170px" }}>
                  <Stack gap="3">
                    <Text size="2" weight="medium">{cap(m)}</Text>
                    <Flex gap="4" align="center">
                      <Switch defaultChecked aria-label={`${cap(m)} on ${b.name}, on`} />
                      <Switch aria-label={`${cap(m)} on ${b.name}, off`} />
                    </Flex>
                  </Stack>
                </Card>
              </Theme>
            ))}
          </BedSurface>
        </Demo>
      ))}
    </Stack>
  );
}

function Permutations() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* Size × material, over the pattern (flat illustrated shapes with hard edges — the
          ground where a wrong alpha or a dead blur shows). Hunting for a cell that reads as a
          different component: a capsule that stops being a capsule at one rung, a grip that
          loses its edge against the veil, a channel that disappears at the small indexes. */}
      <Demo label="Size × material — every rung, every index, over the pattern">
        <BedSurface bed={bed("pattern")} minHeight="460px">
          {(["solid", ...GLASS] as const).map((m) => (
            <Theme key={m} material={m}>
              <Card size="2" style={{ width: "150px" }}>
                <Stack gap="4">
                  <Text size="2" weight="medium">{cap(m)}</Text>
                  {SIZES.map((size) => (
                    <Switch key={size} size={size} defaultChecked aria-label={`${cap(m)}, size ${size}`} />
                  ))}
                </Stack>
              </Card>
            </Theme>
          ))}
        </BedSurface>
      </Demo>

      {/* State × material. Dead on glass is the cell worth staring at: the channel is already
          a low-alpha well compositing on a veil, and the grip is standing down at the same
          time — the two must not converge into one flat lozenge, or the switch stops saying
          which side the thumb is on. */}
      <Demo label="Off, on and dead × material — over a saturated bed">
        <BedSurface bed={bed("swirl")} minHeight="300px">
          {(["solid", ...GLASS] as const).map((m) => (
            <Theme key={m} material={m}>
              <Card size="2" style={{ width: "190px" }}>
                <Stack gap="3">
                  <Text size="2" weight="medium">{cap(m)}</Text>
                  <Flex gap="4" align="center" wrap="wrap">
                    <Switch aria-label={`${cap(m)}, off`} />
                    <Switch defaultChecked aria-label={`${cap(m)}, on`} />
                    <Switch disabled defaultChecked aria-label={`${cap(m)}, dead`} />
                  </Flex>
                </Stack>
              </Card>
            </Theme>
          ))}
        </BedSurface>
      </Demo>

      {/* The crossing, on glass. The travel is the same two edges on the same clock whatever
          the pane is made of — press and hold one here, then one on the solid card above, and
          the movement has to read identically. What legitimately differs is only the lift. */}
      <Demo label="Toggle these on glass — the movement must not change with the pane">
        <BedSurface bed={bed("country")}>
          <Theme material="regular">
            <Card size="3" style={{ width: "260px" }}>
              <Stack gap="4">
                {(
                  [
                    ["sw-glass-1", "Live preview", true],
                    ["sw-glass-2", "Snap to grid", false],
                  ] as const
                ).map(([id, label, on]) => (
                  <Flex key={id} gap="5" align="center" justify="space-between">
                    <Text size="3" render={<label htmlFor={id} />}>
                      {label}
                    </Text>
                    <Switch id={id} defaultChecked={on} />
                  </Flex>
                ))}
              </Stack>
            </Card>
          </Theme>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* Where it lands most often, and the composition the mark family was missing until
          FieldItem shipped (2026-08-21): before it, every named mark in this repo was a
          hand-written `id` + `htmlFor` pair at the call site. The Field states the unit's
          index once and it reaches the switch through context — an explicit `size` on the
          control always wins, so nothing is ever re-sized behind a number somebody typed.
          Identical words in all four rows, so the only variable is the index. */}
      <SpecTable
        wide
        cols={["A field item — the label names the switch, and the field prices both"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <Field key="f" size={size}>
              <FieldItem>
                <Switch />
                <FieldLabel>Require two-factor</FieldLabel>
                <FieldDescription>Everyone signs in again at their next visit.</FieldDescription>
              </FieldItem>
            </Field>,
          ],
        }))}
      />

      {/* Hosted in another control's slot — the one place the family's geometry could have
          turned it into something else. The shared hosted floor sets BOTH axes of a mark to
          one square expression, which is right for the three members that ARE squares and
          renders a checkbox with a thumb in it here. The switch gives up its grown target and
          keeps its TRAVEL instead: whatever the slot takes off the height it takes off the
          width, so a tighter slot shortens the channel without stretching its aspect. The
          thumb needs no rule at all — its diameter derives from the box it sits in, so it
          cannot overflow a floored cell. */}
      <Demo label="Hosted in a field's trailing slot — shorter channel, still a switch">
        <Box maxWidth="22rem">
          <Stack gap="4">
            {SIZES.map((size) => (
              <TextField
                key={size}
                size={size}
                defaultValue="staging.kookie.dev"
                aria-label={`Domain, size ${size}`}
                trailing={<Switch aria-label={`Serve this domain, size ${size}`} />}
              />
            ))}
          </Stack>
        </Box>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. */}
      <Demo label="A switch inside a switch — there is no such composition">
        <Stack gap="3">
          <Switch defaultChecked aria-label="The only switch" />
          <Box maxWidth="34rem">
            <Text size="2" emphasis="medium">
              A switch holds nothing. `children` is refused by the type: the thumb is the
              component&rsquo;s one child, and a label is a SIBLING — a mark sits beside its label,
              and the row that owns them both is what spaces them. Nothing can be placed inside
              a switch, so nothing can be another switch.
            </Text>
          </Box>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* The settings list, which is what a switch is for: a change that COMMITS the moment
          it is made, where a checkbox waits for a submit. No separators — distance already
          groups the rows, and a line plus a gap is two dividers doing one job. No loud button
          either, because there is nothing to submit; the checked accent is state, not
          emphasis, so it does not spend the surface's one figure. */}
      <Demo label="A settings list — every row commits on the spot">
        <Box maxWidth="30rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="6" render={<h3 />}>Notifications</Heading>
                <Text size="3" emphasis="medium">
                  Changes take effect immediately.
                </Text>
              </Stack>
              <Stack gap="5">
                <Setting id="sw-use-1" label="Weekly digest" detail="One email, Monday morning." on />
                <Setting id="sw-use-2" label="Deploy failures" detail="Every failed build on the main branch." on />
                <Setting id="sw-use-3" label="Budget alerts" detail="When a project passes its monthly limit." />
                <Setting id="sw-use-4" label="Product news" detail="Roughly once a month." />
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* The instruments together. A switch, a slider and a segmented control are all shaped
          by what they DO rather than dressed — each is a channel with something in it, and
          none of them takes tone or emphasis. Their greys are deliberately not one value: the
          segmented control moved to the field ramp on 2026-08-24 (Kushagra: "No only
          segmented should leave color track"), and the slider rail, the switch's off-track and
          the progress well kept the deeper channel — `--color-track` at neutral-a4 against the
          field fill's a3. What separates a track from a field is the EDGE, not the value: a
          field wears a hairline, a well has none. */}
      <Demo label="A switch beside the other instruments — the wells are one step apart, on purpose">
        <Box maxWidth="30rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="6" render={<h3 />}>Playback</Heading>
                <Text size="3" emphasis="medium">
                  Applies to this device only.
                </Text>
              </Stack>
              <Stack gap="5">
                <Setting id="sw-play-1" label="Autoplay" detail="Start the next episode without asking." on />
                <Flex gap="5" align="center" justify="space-between">
                  <Text size="3" weight="medium">Quality</Text>
                  <SegmentedControl defaultValue="high" aria-label="Quality">
                    <SegmentedItem value="low">Low</SegmentedItem>
                    <SegmentedItem value="high">High</SegmentedItem>
                    <SegmentedItem value="auto">Auto</SegmentedItem>
                  </SegmentedControl>
                </Flex>
                {/* A Text, not a `<label htmlFor>`: a switch is a labelable element and a
                    slider's root is not, so the heading names it through `aria-label` —
                    the same pairing every other slider in this app uses. */}
                <Stack gap="3">
                  <Text size="3" weight="medium">Volume</Text>
                  <Slider defaultValue={70} aria-label="Volume" />
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A switch that GATES what sits under it — the pattern that makes a dead row honest.
          The gated controls state their own disabled, because a switch turns nothing off by
          itself; what the composition owes is that the two read as one unit, which is why the
          gated pair sits closer to its switch than the groups sit to each other. */}
      <Demo label="A switch that gates the rows under it — on, then off">
        <Flex gap="6" wrap="wrap" align="flex-start">
          {(
            [
              ["sw-gate-on", true],
              ["sw-gate-off", false],
            ] as const
          ).map(([id, on]) => (
            <Box key={id} width="20rem">
              <Card size="3">
                <Stack gap="5">
                  <Flex gap="5" align="center" justify="space-between">
                    <Stack gap="1">
                      <Text size="3" weight="medium" render={<label htmlFor={id} />}>
                        Scheduled reports
                      </Text>
                      <Text size="2" emphasis="medium">
                        Sent from the workspace address.
                      </Text>
                    </Stack>
                    <Switch id={id} defaultChecked={on} />
                  </Flex>
                  {/* The gated part is a real Field, so the disabled state is stated ONCE on
                      the unit and the system draws it — the call site invents no dimming of
                      its own. */}
                  <Field disabled={!on}>
                    <FieldLabel>Recipients</FieldLabel>
                    <TextField defaultValue="ops@kookie.dev" />
                    <FieldDescription>Separate several addresses with commas.</FieldDescription>
                  </Field>
                </Stack>
              </Card>
            </Box>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

export const switchPreview: ComponentPreview = {
  slug: "switch",
  name: "Switch",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11): the family's one tone is an IDENTITY, not an axis. A binary control is the accent solid when it is on and a neutral WELL when it is off, so the component stamps `accent` on itself and there is no `tone` prop to sweep — a switch that could be green or orange would be saying something about the setting rather than about its own state. The only other family a switch ever wears arrives from a STATE: `aria-invalid` remaps the tone roles to destructive, which washes the track and draws the invalid edge over the melted one, and it is judged in States beside the rest of them.",
    },
    inUse: { body: <InUse /> },
  },
};
