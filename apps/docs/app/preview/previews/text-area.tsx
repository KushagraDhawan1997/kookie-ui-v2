/**
 * TextArea's preview spec (2026-08-24) — the field family's growing member, ported through the
 * per-component structure.
 *
 * What this page has to make judgeable, beyond the usual ladder:
 *
 * 1. **The resting gray.** A text area is mostly one flat rectangle of `--dress-field-fill`
 *    with a hairline around it, so this component IS the surface that gray is judged on.
 *    2026-08-24 (Kushagra: "the text field and hairline feel bit darker than they should be")
 *    moved the light edge a4 → a3, which puts it exactly ON the fill; the border still reads
 *    because the border area composites the same alpha twice. The fill itself held at a3 and
 *    is bracketed from both sides (a2 was judged "a bit too light" on 2026-08-17, and dark's
 *    a2 is literally transparent). So the ladder and the TextField comparison below are where
 *    that call gets re-judged, and they exist for that reason.
 *
 * 2. **The frame.** §4 says a non-fixed-height control makes padding the dimension, and the
 *    dimension here is ONE inset on all four sides — reversed on the day it shipped
 *    (2026-08-05, "the frame is the inset"). The first cut derived block padding from the
 *    height token so a one-row box matched a TextField exactly, and the residue read as an
 *    accident the moment a second line existed: 13px at the sides, 9px above in the coarse
 *    world, an asymmetry nobody chose. Every real textarea is a paragraph, so the paragraph
 *    won and a `rows={1}` box now sits taller than a field. That trade is only judgeable side
 *    by side, which is what Sizes does.
 *
 * 3. **The corner.** `full` used to be 9999px riding CSS clamping, which asks the RENDERED
 *    box — right for every control whose height is its token's, wrong the moment one grows.
 *    A three-row textarea came out a stadium with its first line inside the curve. The control
 *    band states the rule now (`--radius-control-N = height / 2`), so Permutations puts a tall
 *    box beside a short one at every level and the corner must not move.
 */
import {
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Field,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  Separator,
  Stack,
  Surface,
  Text,
  TextArea,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis — solid is the rung where light stops
    and gets its own cell. A FUNCTION, not a module const: the standalone route imports this
    module on the server for its slug, and `themeAxes` is a client module's data, unreadable
    during server module evaluation. card.tsx carries the same note and the same reason, which
    is also why every section below is a component rather than a module-scope element tree. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** Every radius level, same derivation and same reason. The default is `full` (2026-08-09), so
    a demo that pins a level is stating what the panel would otherwise be saying. */
const radiusLevels = () => themeAxes.radius;

/** One paragraph's worth of real words. The same sentence everywhere it is not the variable, so
    the only thing moving between cells is the axis under judgment. */
const PARAGRAPH =
  "The submit button stayed disabled after the first upload failed, and reloading did not clear it.";

function Sizes() {
  return (
    <Stack gap="6">
      {/* The cell-level read: identical content and identical row count, so the only variables
          are the size's padding pick, its corner and its type step. The height is NOT one of
          them — three rows of type at four steps is four different heights, which is the point:
          this control's height is content's, and the index prices everything around it. */}
      <Demo label="Identical content at three rows — padding, corner and type move; the height is the content's">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <TextArea
              key={size}
              size={size}
              rows={3}
              defaultValue={`Size ${size}`}
              aria-label={`Note, size ${size}`}
            />
          ))}
        </Grid>
      </Demo>

      {/* THE GRAY, on the page's own plain ground and with nothing else on screen (2026-08-24).
          Empty boxes on purpose: a value or a placeholder gives the eye something to read
          instead of the thing under judgment, and what is being judged is one flat rectangle of
          `--dress-field-fill` with a hairline around it.

          What moved that day is the EDGE, light only: a4 → a3, which puts it exactly on the
          fill. The border area still reads, because it composites the same alpha twice over the
          fill's own — a softer line than any single ramp step can state. The fill did not
          follow it down, and the bracket is why: a2 was judged "a bit too light" in this exact
          context on 2026-08-17, and dark's a2 is transparent, so a lighter field means moving
          a3 itself — a call about the whole ramp rather than about this table. Dark is
          untouched; flip the panel's appearance and the edge there is still one step off its
          fill. */}
      <Demo label="The resting gray at every size, empty, on the plain ground — fill and hairline, nothing else">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <TextArea key={size} size={size} rows={3} aria-label={`Empty, size ${size}`} />
          ))}
        </Grid>
      </Demo>

      {/* The same gray beside the field it has to match. This is a law (both appearances,
          background and border compared component to component) and it is also the read that
          catches the law being satisfied by two wrong values: the family claim is that these
          two are ONE dress, so a difference here is a defect whichever member is at fault.

          Everything except the height must agree at each index — side padding, corner, type
          step, fill, hairline. The height is the one joint the reversal deliberately broke. */}
      <Demo label="Beside a TextField at every size — one gray, one hairline, one corner; only the height differs">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <Stack key={size} gap="3">
              <Text size="1" emphasis="quiet">Size {size}</Text>
              <TextField size={size} aria-label={`Field, size ${size}`} />
              <TextArea size={size} rows={3} aria-label={`Area, size ${size}`} />
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* The accepted cost of "the frame is the inset" (2026-08-05), stated where it is
          visible rather than buried in a doc. A one-row textarea is TALLER than a field at the
          same index, because its block padding is the plain side padding rather than the
          centring residue a fixed-height control has. The identity that used to hold — one row
          sitting exactly where a field's value sits — is gone on purpose: a one-row box is what
          TextField is for, and every real textarea is a paragraph.

          The control height survives as a FLOOR, never a ceiling — a law reads it as
          `min-height`, and a six-row box is taller than it. */}
      <Demo label="rows=1 beside a TextField — taller, and that is the reversal, not a defect">
        <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <Stack key={size} gap="3">
              <Text size="1" emphasis="quiet">Size {size}</Text>
              <TextField size={size} defaultValue="One line" aria-label={`One-line field, size ${size}`} />
              <TextArea size={size} rows={1} defaultValue="One row" aria-label={`One-row area, size ${size}`} />
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* Two independent axes, shown crossing so neither can be mistaken for the other. `size`
          is the index and prices the frame; `rows` is content height and arrives in whole lines
          (a law asserts exactly that — four rows minus one row is three line boxes). So a
          size-1 box can be far taller than a size-4 one, and nothing about that is a size. */}
      <Demo label="size prices the frame, rows states the height — a size-1 box can tower over a size-4">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {([["1", 6], ["4", 2]] as const).map(([size, rows]) => (
            <Box key={size} width="18rem">
              <Stack gap="3">
                <Text size="1" emphasis="quiet">Size {size}, rows {rows}</Text>
                <TextArea size={size} rows={rows} aria-label={`Size ${size} at ${rows} rows`} />
              </Stack>
            </Box>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* The whole state set at every index, because several of these are colour moves a single
          size cannot show drifting. Each specimen carries its own accessible name: a placeholder
          is the accname spec's last-resort fallback and most of these columns have none. */}
      <SpecTable
        wide
        cols={["Placeholder", "Value", "Invalid", "Disabled", "Read only"]}
        rows={SIZES.map((size) => ({
          label: `size ${size}`,
          cells: [
            <TextArea
              key="1"
              size={size}
              rows={2}
              placeholder="Describe what happened…"
              aria-label={`Placeholder, size ${size}`}
            />,
            <TextArea
              key="2"
              size={size}
              rows={2}
              defaultValue="Reloading did not clear it."
              aria-label={`Value, size ${size}`}
            />,
            <TextArea
              key="3"
              size={size}
              rows={2}
              defaultValue="Too short."
              aria-invalid="true"
              aria-label={`Invalid, size ${size}`}
            />,
            <TextArea
              key="4"
              size={size}
              rows={2}
              defaultValue="Locked while the build runs."
              disabled
              aria-label={`Disabled, size ${size}`}
            />,
            <TextArea
              key="5"
              size={size}
              rows={2}
              defaultValue="Signed off by Priya on Tuesday."
              readOnly
              aria-label={`Read only, size ${size}`}
            />,
          ],
        }))}
      />

      {/* Live, because both of these are things you do. HOVER: the fill steps, and the fill is
          the ONE currency this family's hover has — the boundary-stepping rule that used to sit
          beside it died with the fill-first flip (2026-08-17), so a border that also moved would
          be two answers to one question. FOCUS: click into the box. The ring lands on plain
          `:focus`, not `:focus-visible`, because a field's focus is a MODE — you do not press a
          text box, you enter it — and it lands on SELF, since there is no wrapper to hand it to
          and no hosted control that could falsely claim it. */}
      <Demo label="Live — hover the first for the fill step, click into the second for the ring">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Point at this one</Text>
            <TextArea rows={3} defaultValue={PARAGRAPH} aria-label="Hover me" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Click into this one</Text>
            <TextArea rows={3} defaultValue={PARAGRAPH} aria-label="Focus me" />
          </Stack>
        </Grid>
      </Demo>

      {/* Validity is STATE, never a prop, and it arrives by two routes that must paint one
          answer: `aria-invalid` standalone, and Base UI's `data-invalid` inside a Field.Root.
          Both land on this element directly — there is no `:has()` hop, because the control IS
          the element the primitive decorates. The ring moves with the border, which is the one
          place §8 reverses its own one-ring rule: a focused invalid box must not say two
          different things at its two edges. Click into the second cell to see it. */}
      <Demo label="Invalid — the border re-tones, the value stays legible, and the ring follows the border">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Valid</Text>
            <TextArea rows={3} defaultValue="Eight digits, no spaces." aria-label="Valid" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Invalid — click in for the ring</Text>
            <TextArea rows={3} defaultValue="4471" aria-invalid="true" aria-label="Invalid" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Invalid inside a Field — same paint, other route</Text>
            <Field>
              <TextArea rows={3} defaultValue="4471" aria-invalid aria-label="Invalid in a field" />
            </Field>
          </Stack>
        </Grid>
      </Demo>

      {/* DEAD. The words are the thing that moves: a disabled TextArea greys its value, measured
          0.2697 → 0.7625, and the fill stays where a live one's is. That is deliberate and it is
          the library's answer for a text box that is off — grey the words, leave the box — which
          is why a disabled composer that greyed NOTHING was a defect rather than a design
          (2026-08-23), and why the fix there is a copy of what this control already does.

          Two more things move with it and neither is optional: the border recedes (which is what
          took `disabledSteps.light.border` down to a2 on 2026-08-24, following the live edge so
          the dead one does not land exactly on it), and the placeholder stands down too — a hint
          brighter than the value beside it is the half-fix that ships. */}
      <Demo label="Live beside dead — the words grey and the box does not; the placeholder stands down with them">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Live</Text>
            <TextArea rows={3} defaultValue={PARAGRAPH} aria-label="Live" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Disabled — the thread is archived</Text>
            <TextArea rows={3} defaultValue={PARAGRAPH} disabled aria-label="Dead" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Live, empty</Text>
            <TextArea rows={3} placeholder="Describe what happened…" aria-label="Live empty" />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Disabled, empty</Text>
            <TextArea rows={3} placeholder="Describe what happened…" disabled aria-label="Dead empty" />
          </Stack>
        </Grid>
      </Demo>

      {/* READ ONLY is not disabled and must not borrow its vocabulary: the value is live,
          selectable, submitted, and the box still takes focus. What goes is the WELL and only
          the well — the fill drops to transparent, the border and the ink stay exactly where a
          live one's are. The stylesheet guards it with `:not(:disabled)`, because CSS
          `:read-only` matches anything that is not `:read-write` — a disabled control included —
          and without the guard two states would paint one box. All three are here for that
          comparison; click into the middle one, it rings. */}
      <Demo label="Read only drops the well and nothing else — live, read only, disabled">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(
            [
              ["Live", {}],
              ["Read only — no fill, same ink, still focusable", { readOnly: true }],
              ["Disabled — receded fill, dimmed ink, no focus", { disabled: true }],
            ] as const
          ).map(([label, props]) => (
            <Stack key={label} gap="2">
              <Text size="2" emphasis="quiet">{label}</Text>
              <TextArea rows={3} defaultValue={PARAGRAPH} aria-label={label} {...props} />
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* The placeholder is a designed role and not a UA default: the MUTED rung at full
          opacity. It was faint until 2026-08-10, when faint became the exception rung BELOW the
          reading floor — a placeholder is information, not something stood down. The opacity is
          load-bearing on its own: Firefox's 0.54 default would stack a second fade on a colour
          the system already chose. Read this beside the value in the cell next to it. */}
      <Demo label="Placeholder beside value — the muted rung, at full opacity">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <TextArea rows={3} placeholder="Describe what happened…" aria-label="Placeholder" />
          <TextArea rows={3} defaultValue="Describe what happened…" aria-label="The same words, as a value" />
        </Grid>
      </Demo>

      {/* `resize` is the stylesheet's, not the API's: vertical only, because a horizontal handle
          makes the element wider than the column that owns it. It is not a prop and does not get
          one — a prop that renames a raw CSS property earns no row — so `none` and `both` are a
          `style` away, which is what the third cell is. Drag the corners. */}
      <Demo label="Drag the corner — vertical by default; none and both are style, never props">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(
            [
              ["Vertical", "the stylesheet's default", undefined],
              ["None", "style, resize: none", "none"],
              ["Both", "style, resize: both", "both"],
            ] as const
          ).map(([name, note, resize]) => (
            <Stack key={name} gap="2">
              <Text size="2" emphasis="quiet">{name} — {note}</Text>
              <TextArea
                rows={3}
                defaultValue={PARAGRAPH}
                aria-label={`Resize ${name.toLowerCase()}`}
                {...(resize ? { style: { resize } } : {})}
              />
            </Stack>
          ))}
        </Grid>
      </Demo>
    </Stack>
  );
}

function Materials() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* Solid beside every thickness, over every standard bed. Each cell pins its material with
          a nested Theme so the board reads the same whatever the panel says. The beds are already
          backdrop regions, so the prop on each specimen is redundant and stated anyway: it keeps
          a cell self-contained about which of the two spellings it is under judgment through.

          What only a text box can show here is the INK. The veil is priced at the ladder's
          CONTROL cell — a control-scale box re-prices the material, half the pane's blur and a
          leaner alpha (the lab port, 2026-08-17) — and a paragraph of real sentences over a
          hostile bed is where a legible veil and a nearly legible one stop looking alike. A
          one-word specimen cannot make that call. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b}>
            <Theme material="solid">
              <Stack gap="2" style={{ width: "190px" }}>
                <Text size="1" emphasis="quiet">Solid</Text>
                <TextArea backdrop rows={3} defaultValue={PARAGRAPH} aria-label={`Solid on ${b.name}`} />
              </Stack>
            </Theme>
            {GLASS.map((m) => (
              <Theme key={m} material={m}>
                <Stack gap="2" style={{ width: "190px" }}>
                  <Text size="1" emphasis="quiet">{cap(m)}</Text>
                  <TextArea backdrop rows={3} defaultValue={PARAGRAPH} aria-label={`${m} on ${b.name}`} />
                </Stack>
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
      {/* Size × material over the pattern — flat illustrated shapes with hard edges, the ground
          where a wrong alpha or a dead blur is most visible. Hunting for a cell that reads as a
          different component: a corner that stops being a corner at one rung, a veil that
          swallows its own paragraph. */}
      <Demo label="Size × material — over the pattern">
        <BedSurface bed={bed("pattern")} minHeight="auto">
          <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start" style={{ width: "100%" }}>
            {(["solid", ...GLASS] as const).map((m) =>
              SIZES.map((size) => (
                <Theme key={`${m}-${size}`} material={m}>
                  <Stack gap="2">
                    <Text size="1" emphasis="quiet">{cap(m)} · {size}</Text>
                    <TextArea backdrop size={size} rows={3} defaultValue={`${cap(m)} ${size}`} aria-label={`${m}, size ${size}`} />
                  </Stack>
                </Theme>
              )),
            )}
          </Grid>
        </BedSurface>
      </Demo>

      {/* THE CORNER, which is this component's own bug in the system's history (2026-08-05).
          `full` priced the control band at 9999px and let CSS clamping find the capsule — and
          clamping asks the RENDERED box, which is right for every control whose height is its
          token's and wrong the moment one grows. A three-row textarea came out a stadium with
          its first line deep inside the curve and the resize handle floating outside it. The
          band states the rule now: `--radius-control-N` is half the size's control HEIGHT, per
          density and pointer world, so a grown box keeps the one-row curvature.

          Read each column downward: the corner must be identical at one row and at eight, at
          every level, `full` included. `none` squares, and it must square a tall box too. */}
      <Demo label="Radius level × height — the corner is half the height TOKEN, so a grown box never becomes a stadium">
        <Grid columns="repeat(5, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {radiusLevels().map((level) => (
            <Theme key={level} radius={level}>
              <Stack gap="3">
                <Text size="1" emphasis="quiet">{cap(level)}</Text>
                <TextArea rows={1} defaultValue="One" aria-label={`One row at ${level}`} />
                <TextArea rows={8} defaultValue={PARAGRAPH} aria-label={`Eight rows at ${level}`} />
              </Stack>
            </Theme>
          ))}
        </Grid>
      </Demo>

      {/* The other half of `full`, and the exception this control was refused. At `full` the pill
          bump widens the SIDES only — the bump corrects text running sideways into the corner at
          its widest swing, and vertically the curve has flattened to under half a pixel where the
          text starts, so radius never buys height. Read the two boxes as a pair: the sides move,
          the top does not, and the heights are the same. */}
      <Demo label="Medium against full at three rows — the sides take the pill bump, the block inset does not">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(["medium", "full"] as const).map((level) => (
            <Theme key={level} radius={level}>
              <Stack gap="2">
                <Text size="1" emphasis="quiet">{cap(level)}</Text>
                <TextArea rows={3} defaultValue={PARAGRAPH} aria-label={`Three rows at ${level}`} />
              </Stack>
            </Theme>
          ))}
        </Grid>
      </Demo>

      {/* State × material. The veil multiplies its sources, so a state that changes a source has
          to survive the mix: on glass the sources re-point to their OPAQUE twins and the alpha is
          the material's (2026-08-19), which is what stopped a glass field's designed veil from
          collapsing — it measured 4.1% before that fix (audit 2026-08-18). Invalid and disabled
          are the two with somewhere to go wrong: an invalid edge that vanishes into the veil, a
          dead box indistinguishable from a live one. */}
      <Demo label="Rest, invalid, disabled, read only — on glass, over a dark bed">
        <BedSurface bed={bed("bloom")} minHeight="auto">
          <Theme material="regular">
            <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start" style={{ width: "100%" }}>
              {(
                [
                  ["Rest", {}],
                  ["Invalid", { "aria-invalid": "true" as const }],
                  ["Disabled", { disabled: true }],
                  ["Read only", { readOnly: true }],
                ] as const
              ).map(([label, props]) => (
                <Stack key={label} gap="2">
                  <Text size="1" emphasis="quiet">{label}</Text>
                  <TextArea backdrop rows={3} defaultValue={PARAGRAPH} aria-label={`${label} on glass`} {...props} />
                </Stack>
              ))}
            </Grid>
          </Theme>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* WHAT IT HOSTS: nothing, and the absence is the design. This is the anatomy criterion
          (LOG 2026-08-04) asked twice and answered twice. TextField's wrapper is FORCED — put an
          icon inside the border and the border cannot stay on the `<input>`, so a second element
          appears and immediately owes the caret redirect, slot layout and hosted-control focus.
          A textarea has no slots, because an adornment floating over a scrolling paragraph is
          not a designed position; so nothing non-visual forces a second element, the border
          stays on the `<textarea>`, and every one of those wrapper debts simply never exists.

          Shown as the contrast rather than asserted: the field's slots are real anatomy, the
          area's absence is a real refusal, and they are the same decision reaching two answers. */}
      <Demo label="A field hosts; an area does not — the same question, two answers">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">TextField — a wrapper, because a slot forces one</Text>
            <TextField
              aria-label="Search with slots"
              placeholder="Search notes"
              leading={<Text size="2" emphasis="quiet">/</Text>}
              trailing={<Button size="1" emphasis="quiet">Clear</Button>}
            />
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">TextArea — one element, so there is nowhere to put one</Text>
            <TextArea rows={3} defaultValue={PARAGRAPH} aria-label="No slots" />
          </Stack>
        </Grid>
      </Demo>

      {/* WHERE IT LANDS, first: inside a Field (§28), which is the unit that gives one control a
          name, an explanation and an announced error. Nothing here is passed down by hand — the
          label associates by id, the description reaches assistive technology through
          `aria-describedby`, and the field's `size` reaches the control through context. What
          must not change: the box is the same box, and an explicit `size` on the control still
          wins over the unit's, which is the bound that makes a size context safe to have. */}
      <Demo label="Inside a Field — the unit states the index, and a stated size still wins">
        <Box maxWidth="34rem">
          <Stack gap="5">
            <Field size="1">
              <FieldLabel>Release notes</FieldLabel>
              <TextArea rows={3} placeholder="What changed in this build?" />
              <FieldDescription>Markdown is supported. This is shown on the download page.</FieldDescription>
            </Field>
            <Field size="4">
              <FieldLabel>Release notes</FieldLabel>
              <TextArea rows={3} placeholder="What changed in this build?" />
              <FieldDescription>The same field at index four — every part moved together.</FieldDescription>
            </Field>
            <Field size="4">
              <FieldLabel>Release notes</FieldLabel>
              <TextArea size="1" rows={3} placeholder="What changed in this build?" />
              <FieldDescription>A control that states its own size keeps it.</FieldDescription>
            </Field>
          </Stack>
        </Box>
      </Demo>

      {/* WHERE IT LANDS, second: beside its family in a real form. The claim under judgment is
          that a field and an area read as one kind of thing in a column — same gray, same
          hairline, same corner — with only the height saying which is which. Since 2026-08-24
          that hairline is one step lighter in light mode, and a column like this is where a
          hairline that lost too much would show as a box with no boundary at all. */}
      <Demo label="A column of the family — the fields and the area must read as one material">
        <Box maxWidth="34rem">
          <Card size="3">
            <Stack gap="5">
              <Field>
                <FieldLabel>Title</FieldLabel>
                <TextField placeholder="Submit stays disabled after a failed upload" />
              </Field>
              <Field>
                <FieldLabel>Steps to reproduce</FieldLabel>
                <TextArea rows={5} placeholder="1. Upload a file over the size limit…" />
                <FieldDescription>Steps help more than a description of the symptom.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Build</FieldLabel>
                <TextField defaultValue="0.4.2" aria-invalid />
                <FieldError match={true}>That build was never published.</FieldError>
              </Field>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* Inside a glass pane, which is the pane's own rule rather than this control's: a member
          that paints a veil scopes its subtree, so an unmarked member below it resolves solid and
          nothing pays twice (§10, structural since 2026-08-16). The area in this card states no
          `backdrop`, so it is opaque, and that is correct — the card spent the backdrop. */}
      <Demo label="Inside a glass card — one glass per stack, so the area under it is solid">
        <BedSurface bed={bed("photo")}>
          <Theme material="regular">
            <Card size="3" style={{ width: "340px" }}>
              <Stack gap="4">
                <Stack gap="2">
                  <Heading size="4" render={<h3 />}>Tell us more</Heading>
                  <Text size="2" emphasis="medium">The bed shows through the pane, not through this box.</Text>
                </Stack>
                <TextArea rows={4} placeholder="What were you trying to do?" aria-label="Feedback" />
                <Flex gap="3" justify="flex-end">
                  <Button tone="accent" emphasis="loud">Send</Button>
                </Flex>
              </Stack>
            </Card>
          </Theme>
        </BedSurface>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. */}
      <Demo label="A text area inside a text area — impossible, and refused twice over">
        <Stack gap="3">
          <Box maxWidth="34rem">
            <TextArea rows={3} defaultValue={PARAGRAPH} aria-label="The only one there is" />
          </Box>
          <Box maxWidth="34rem">
            <Text size="2" emphasis="medium">
              There is no case. A <Code>&lt;textarea&gt;</Code> holds text and not elements, so the
              platform refuses this before the system has to — and <Code>children</Code> is refused
              by the type anyway, because React&apos;s contract for a form value is{" "}
              <Code>defaultValue</Code> and two spellings for one fact is drift.
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
      {/* The ordinary case, and the one the reversal was decided on: a paragraph. The frame is
          one inset all round, so the words sit the same distance from the top edge as from the
          left one — which is the whole of what 2026-08-05 changed, judged here at real length
          rather than at two words. */}
      <Demo label="A bug report — the shape every argument about this control was made about">
        <Box maxWidth="34rem">
          <Card size="3">
            <Stack gap="5">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Report a problem</Heading>
                <Text size="2" emphasis="medium">
                  We read every one of these. Steps to reproduce help the most.
                </Text>
              </Stack>
              <Field>
                <FieldLabel>What went wrong?</FieldLabel>
                <TextArea rows={5} placeholder="It broke when…" />
              </Field>
              <Field>
                <FieldItem>
                  <Checkbox defaultChecked />
                  <FieldLabel>Attach my last session log</FieldLabel>
                  <FieldDescription>Roughly 40 KB of console output.</FieldDescription>
                </FieldItem>
              </Field>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Cancel</Button>
                <Button tone="accent" emphasis="loud">Send report</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A settings pane: one long-form value among short ones. The interesting part is the
          column, not the control — a description box has to sit in a stack of fields without
          becoming the loudest thing on the pane, which is what the shared gray buys. */}
      <Demo label="A settings pane — one long value among short ones">
        <Box maxWidth="36rem">
          <Card size="3">
            <Stack gap="5">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Project</Heading>
                <Text size="2" emphasis="medium">Shown to everyone with access to this workspace.</Text>
              </Stack>
              <Separator />
              <Field>
                <FieldLabel>Name</FieldLabel>
                <TextField defaultValue="Ledger" />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <TextArea
                  rows={3}
                  defaultValue="Double-entry bookkeeping for small teams, with an audit log that never rewrites history."
                />
                <FieldDescription>Appears under the project name in search.</FieldDescription>
              </Field>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Discard</Button>
                <Button tone="accent" emphasis="loud">Save</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A read-only record beside an editable note — the state that has to stay legible rather
          than merely inert. The value is selectable and submitted, and only the well is gone, so
          the two boxes in this pane say "you cannot change this" and "write here" with one
          difference between them. */}
      <Demo label="A record you cannot edit, above a note you can">
        <Box maxWidth="36rem">
          <Surface size="3" render={<Stack gap="5" />}>
            <Stack gap="2">
              <Heading size="4" render={<h3 />}>Incident 412</Heading>
              <Text size="2" emphasis="medium">Closed on Tuesday by the on-call engineer.</Text>
            </Stack>
            <Field>
              <FieldLabel>Original report</FieldLabel>
              <TextArea
                rows={3}
                readOnly
                defaultValue="Checkout returned 502 for roughly nine minutes. Rolled back and the errors stopped."
              />
            </Field>
            <Field>
              <FieldLabel>Follow-up</FieldLabel>
              <TextArea rows={4} placeholder="What are we changing so this cannot happen again?" />
            </Field>
            <Flex gap="3" justify="flex-end">
              <Button tone="accent" emphasis="loud">Add follow-up</Button>
            </Flex>
          </Surface>
        </Box>
      </Demo>

      {/* The size index doing real work rather than demonstrating itself: a compact form in a
          dense panel, and the same form given room. Both are the same markup with one number
          changed on each Field, which is what the unit's size context is for. */}
      <Demo label="The same form at two indexes — one number changed on the unit, nothing else">
        <Flex gap="5" align="flex-start" wrap="wrap">
          {(["1", "3"] as const).map((size) => (
            <Box key={size} width="20rem">
              <Card size={size === "1" ? "2" : "3"}>
                <Stack gap="4">
                  <Text size={size === "1" ? "2" : "3"} weight="medium">Leave a note</Text>
                  <Field size={size}>
                    <FieldLabel>Note</FieldLabel>
                    <TextArea rows={3} placeholder="Anything the next person should know?" />
                  </Field>
                  <Flex justify="flex-end">
                    <Button size={size === "1" ? "1" : "2"} tone="accent" emphasis="loud">Save</Button>
                  </Flex>
                </Stack>
              </Card>
            </Box>
          ))}
        </Flex>
      </Demo>
    </Stack>
  );
}

export const textAreaPreview: ComponentPreview = {
  slug: "text-area",
  name: "Text area",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused by the type, with TextField's argument verbatim: loudness ranks actions, and a form where one input is louder or redder than the next names nothing. `emphasis` and `tone` are both absent from TextAreaProps, so there is no sweep to render. What a text area does say about itself is state — invalid re-tones its border and its ring through the shared remap, which is in States above, and that is a state rather than a family.",
    },
    inUse: { body: <InUse /> },
  },
};
