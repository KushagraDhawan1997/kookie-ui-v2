/**
 * Slider's preview spec (2026-08-24) — the first INSTRUMENT through the per-component
 * structure, and a page that exists for a reversal shipped the same day.
 *
 * The headline: **a grip inside a glass pane goes flat.** The thumb casts `--grip-cast` on
 * solid ground in every world — flat and elevated both (§5, 2026-08-07, Kushagra: "slider
 * thumb needs elevation always, it's how it should be") — and since 2026-08-24 a pane stands
 * that cast down. "Always" is about the WORLD; glass is a MATERIAL, the axis the sentence was
 * never about. slider.css had stated the escape as a feature ("why one-lift-per-pane cannot
 * strip it") and that comment is amended. The only way to judge either half is the PAIR, so
 * the Materials section opens with the same slider in a glass pane and on solid ground, side
 * by side, over one bed.
 *
 * What else a page makes visible that a law cannot: the ladder read AS a ladder (the strip is
 * exactly as tall as the Button beside it, the grip exactly as wide as the Checkbox), and the
 * two corners that never move — the rail squares at `radius="none"` while the grip holds its
 * circle at every level.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Grid,
  Heading,
  Slider,
  Stack,
  Text,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis (solid is the rung where light stops
    and gets its own cell). A FUNCTION, not a module const: the standalone route imports this
    module on the server for its slug, and `themeAxes` is a client module's data — unreadable
    during server module evaluation. card.tsx carries the same note and the same reason, which
    is also why every section below is a component rather than a module-scope element tree. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** The two pointer worlds. `auto` is an instruction about where to look, not a value anything
    resolves to — pinning is how a desktop judges the coarse world at all. */
const pointerWorlds = () => themeAxes.pointer.filter((p) => p !== "auto");

/** A slider needs a container to have a width: the root is `inline-size: 100%`, because a
    track has no intrinsic width and shrink-wrapping would collapse it to nothing. Every
    specimen below therefore states a width on the Box that owns the row — never on the
    control, which has no prop for it. */
function Strip({ width = "18rem", children }: { width?: string; children: React.ReactNode }) {
  return <Box width={width}>{children}</Box>;
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The identity read, and the reason the slider needed NO target mechanism of its own:
          the ROOT is the control, so it rides the control height ladder and the whole strip is
          pressable — the coarse 44 and the 24 floor arrive free (§4, §16). Both neighbours are
          here because both are law-guaranteed equalities: the strip stands exactly as tall as
          the Button at the same index, and the grip is exactly the Checkbox's painted box,
          since the thumb is the mark family's third member. If any row disagrees, one of two
          ladders moved. */}
      <Demo label="Every index — the strip stands as tall as the Button, the grip as wide as the Checkbox">
        <Grid
          columns="72px minmax(0, 1fr) max-content max-content"
          gapX="5"
          gapY="4"
          style={{ alignItems: "center" }}
        >
          <span />
          <Text size="1" emphasis="quiet">Slider</Text>
          <Text size="1" emphasis="quiet">Button</Text>
          <Text size="1" emphasis="quiet">Checkbox</Text>
          {SIZES.map((size) => (
            <React.Fragment key={size}>
              <Text size="1" emphasis="quiet">size {size}</Text>
              <Slider size={size} defaultValue={55} aria-label={`Volume, size ${size}`} />
              <Button size={size}>Reset</Button>
              <Checkbox size={size} defaultChecked aria-label={`Mute, size ${size}`} />
            </React.Fragment>
          ))}
        </Grid>
      </Demo>

      {/* The parts move on ladders of their own, and this is where an uneven step would show.
          The rail is `--slider-track-N` — 4/5/6/7, a designed raw ladder, because the space
          palette has nothing between 4 and 8 (the mark ladder's own wall, one part over). The
          grip is `mark(n)` — 16/20/24/26 in the fine world — which IS the line box of its
          label's type step. So the rail moves by a pixel a step and the handle by four, then
          two at the top; the two ladders are read together here because neither is derived
          from the other.

          A RANGE is the same component: pass an array and a thumb renders per entry, one
          `aria-label` naming both (Base UI adds each thumb's own value text). */}
      <Demo label="One value beside a range — the rail and the grip climb on different ladders">
        <SpecTable
          wide
          cols={["Single value", "Range — one thumb per entry"]}
          rows={SIZES.map((size) => ({
            label: `size ${size}`,
            cells: [
              <Slider key="one" size={size} defaultValue={55} aria-label={`Opacity, size ${size}`} />,
              <Slider key="range" size={size} defaultValue={[20, 65]} aria-label={`Price range, size ${size}`} />,
            ],
          }))}
        />
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* Live, dead and invalid at every index. DEAD is four things at once and the pair is the
          only way to judge any of them: the rail dims (2026-08-17 — it reads `--color-track`
          directly, outside the tone system, so the shared remap never reached it and a dead
          slider kept a full-strength rail), the fill greys through that remap like every fill
          in the system, the grip dims but KEEPS its pigment — a grip is the tick, and its
          position is the value, so greying it out erases the reading — and the cast goes,
          because a dead grip makes no promise.

          INVALID moves only the ring: `aria-invalid` on the root remaps the tone roles, and
          the thumb inherits `--invalid-edge` for the ring it draws on focus. Tab to it. */}
      <Demo label="Live, dead, invalid — hover and press the first, tab to the third">
        <SpecTable
          wide
          cols={["Live", "Disabled", "Invalid — tab to it"]}
          rows={SIZES.map((size) => ({
            label: `size ${size}`,
            cells: [
              <Slider key="live" size={size} defaultValue={55} aria-label={`Live, size ${size}`} />,
              <Slider key="dead" size={size} defaultValue={55} disabled aria-label={`Disabled, size ${size}`} />,
              <Slider key="bad" size={size} defaultValue={55} aria-invalid aria-label={`Invalid, size ${size}`} />,
            ],
          }))}
        />
      </Demo>

      {/* The keyboard and the ring, at the size where both are easiest to read. The ring lands
          on the THUMB and not on the strip — focus is where the keyboard acts, and the arrows
          move the grip. (Mechanically it keys on the hidden range input Base UI nests inside
          the handle.) Tab in, then hold an arrow key. */}
      <Demo label="Tab in — the ring lands on the grip, not on the strip; then hold an arrow key">
        <Strip width="22rem">
          <Slider size="3" defaultValue={40} aria-label="Playback position" />
        </Strip>
      </Demo>

      {/* The drag, which is the state no still image has. Two facts to look for, both §8:
          the grip SQUASHES while held — stamped from the first pointerdown frame, so a grab
          anywhere on the strip squashes it too, and it survives the pointer leaving the strip
          mid-drag — and the TRAVEL is never sprung. During a drag the pointer IS the physics:
          Base UI writes the position inline, and a spring between finger and grip would read
          as lag on a direct manipulation. Scale is the grip's one clock; released, it stands
          back up on the long recovery clock.

          On a RANGE both grips squash while either is held — the stamp is root state. Recorded
          and judged here, which is why the range specimen is in this demo rather than only in
          the ladder above. */}
      <Demo label="Drag one, then drag a range — the grip squashes, the travel does not spring">
        <Stack gap="5">
          <Strip width="22rem">
            <Slider size="4" defaultValue={45} aria-label="Brush size" />
          </Strip>
          <Strip width="22rem">
            <Slider size="4" defaultValue={[25, 70]} aria-label="Trim" />
          </Strip>
        </Stack>
      </Demo>
    </Stack>
  );
}

function Materials() {
  const GLASS = glassMaterials();
  return (
    <Stack gap="6">
      {/* THE PAIR (2026-08-24). The same control twice at the size where the grip is largest
          and its lift most readable: in a glass pane, and on solid ground. Inside the pane the
          grip is flat — a pane has one lift, and a raised grip on it is a pebble sitting on
          the glass rather than a ridge in it; Apple's liquid glass ships the handle flat, which
          retired the "every platform ships it shadowed in every context" clause that had
          stood in slider.css. On solid ground it still casts in every world, flat and
          elevated alike.

          Nothing else about the control changes, and that is the other half of the read: the
          rail is an ALPHA well (`--color-track`, since 2026-08-17), so it composites against
          whatever the pane's own lighting has done to its ground rather than sitting on it as
          an opaque step. */}
      <Demo label="The same slider in a glass pane and on solid ground — only the grip's lift differs">
        <BedSurface bed={bed("photo")}>
          <Theme material="regular">
            <Card size="3" style={{ width: "240px" }}>
              <Stack gap="3">
                <Text size="2" weight="medium">In the pane</Text>
                <Slider size="4" defaultValue={55} aria-label="In a glass pane" />
              </Stack>
            </Card>
          </Theme>
          <Theme material="solid">
            <Card size="3" style={{ width: "240px" }}>
              <Stack gap="3">
                <Text size="2" weight="medium">On solid ground</Text>
                <Slider size="4" defaultValue={55} aria-label="On solid ground" />
              </Stack>
            </Card>
          </Theme>
        </BedSurface>
      </Demo>

      {/* The board: solid beside every thickness, over every standard bed. The slider itself
          refuses `material` — a 5px line of blur is a 5px line — so what is being judged here
          is never the control's own veil. It is the control INSIDE the veil: does the rail
          still read as a channel once the pane is translucent over that ground, does the
          accent fill hold against a bright band, and is the flat grip still findable at every
          thickness. Each cell pins its material with a nested Theme, so the board reads the
          same whatever the environment panel says. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b}>
            <Theme material="solid">
              <Card size="2" style={{ width: "200px" }}>
                <Stack gap="3">
                  <Text size="2" weight="medium">Solid</Text>
                  <Slider defaultValue={55} aria-label={`Solid on ${b.name}`} />
                </Stack>
              </Card>
            </Theme>
            {GLASS.map((m) => (
              <Theme key={m} material={m}>
                <Card size="2" style={{ width: "200px" }}>
                  <Stack gap="3">
                    <Text size="2" weight="medium">{cap(m)}</Text>
                    <Slider defaultValue={55} aria-label={`${cap(m)} on ${b.name}`} />
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
      {/* Size × material, every cell inside a pane, over the pattern — flat illustrated shapes
          with hard edges, the ground where a wrong alpha or a dead blur shows most. The cell
          nobody sees otherwise is the top-left one: a size-1 grip has the least area in the
          family, and it is where losing the cast could take the handle with it. */}
      <Demo label="Size × material, all in a pane — is the flat grip still findable at size 1?">
        <BedSurface bed={bed("pattern")} minHeight="520px">
          <Grid columns="repeat(4, minmax(0, max-content))" gapX="5" gapY="5">
            {(["solid", ...GLASS] as const).map((m) =>
              SIZES.map((size) => (
                <Theme key={`${m}-${size}`} material={m}>
                  <Card size="2" style={{ width: "190px" }}>
                    <Stack gap="3">
                      <Text size="1" emphasis="quiet">{cap(m)} · size {size}</Text>
                      <Slider size={size} defaultValue={55} aria-label={`${cap(m)}, size ${size}`} />
                    </Stack>
                  </Card>
                </Theme>
              )),
            )}
          </Grid>
        </BedSurface>
      </Demo>

      {/* Radius × size — the cross that holds the component's two corner facts at once, and
          the one no size table can show.

          The GRIP is a circle at every level, `none` included: role semantics (§6), Radio's own
          sentence one control over — a square handle reads as a bead that stuck. It is one of
          the four corners the radius axis never reaches (a radio, this grip, the switch thumb,
          and the track a round thumb nests in). A horizontal capsule was tried 2026-08-07 and
          reverted 2026-08-08, too wide by eye.

          The RAIL is not one of them, which was a defect for a day: it kept its capsule at
          `radius="none"` while the root, the Button and the Checkbox all squared off (audit R8,
          fixed 2026-08-07). It squares now, through `min()` against the control radius — at
          every level that HAS a corner, half a 4-7px rail is far smaller, so those cells are
          byte-identical to what they always were. Read the `none` row against the rest. */}
      <Demo label="Radius × size — the rail squares at `none`, the grip never does">
        <SpecTable
          wide
          cols={SIZES.map((size) => `size ${size}`)}
          rows={themeAxes.radius.map((level) => ({
            label: level,
            cells: SIZES.map((size) => (
              <Theme key={`${level}-${size}`} radius={level}>
                <Slider size={size} defaultValue={55} aria-label={`Radius ${level}, size ${size}`} />
              </Theme>
            )),
          }))}
        />
      </Demo>

      {/* Density × pointer, the two environment axes that price a control's box — asked of the
          one control whose box is not what carries its information.

          What must move: the STRIP, because it is the control and rides the height ladder, so
          the coarse world's 44 arrives here exactly as it does on a Button. And the GRIP, once,
          on the pointer axis — it rises because the TYPE rose (a mark is one line of its
          label), which is the mark family's whole coarse story.

          What must NOT move: the RAIL. `--slider-track-N` is density- and pointer-invariant by
          design — the coarse target is the control's height, not a fatter line (iOS holds 4pt
          against a 28pt thumb) — and density never touches the grip either, because a mark is
          content. Six cells; the rail should be one thickness in all of them. */}
      <Demo label="Density × pointer at one index — the strip moves, the rail must not">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="5">
          {pointerWorlds().map((pointer) =>
            themeAxes.density.map((density) => (
              <Theme key={`${pointer}-${density}`} pointer={pointer} density={density}>
                <Stack gap="3">
                  <Text size="1" emphasis="quiet">{pointer} · {density}</Text>
                  <Slider size="2" defaultValue={55} aria-label={`${pointer} ${density}`} />
                </Stack>
              </Theme>
            )),
          )}
        </Grid>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* THE HOSTING VERDICT, and it is a closed one: a slider hosts NOTHING. The anatomy is
          five elements wired by Base UI — root, control, track, fill, thumb — and none of them
          can move, so `children` and `render` are refused together by the type. There is no
          slot, no leading or trailing adornment, no label part. SELF-NESTING is therefore not
          discouraged but impossible: a slider cannot contain a slider, because it cannot
          contain anything. What a labelled slider is instead is the demo below — a Field.

          A Field states the index once for the whole unit and it reaches the control through
          context (§28); an explicit `size` on the control always wins, so nobody's slider is
          re-sized behind a number they did not type. The third cell is that override, and it
          is the one worth staring at: its label, description and spacing are the field's
          size 4 while the strip is size 1.

          No `aria-label` on any of these three, deliberately: inside a Field the label wires
          itself to the control, and an explicit name here would win over it and leave the
          visible label naming nothing. */}
      <Demo label="Hosted in a Field — the field's size 1, the field's size 4, and size 4 with the control stating its own index">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="5" gapY="5" style={{ alignItems: "start" }}>
          <Field size="1">
            <FieldLabel>Grain</FieldLabel>
            <Slider defaultValue={30} />
            <FieldDescription>Applied after export.</FieldDescription>
          </Field>
          <Field size="4">
            <FieldLabel>Grain</FieldLabel>
            <Slider defaultValue={30} />
            <FieldDescription>Applied after export.</FieldDescription>
          </Field>
          <Field size="4">
            <FieldLabel>Grain</FieldLabel>
            <Slider size="1" defaultValue={30} />
            <FieldDescription>Applied after export.</FieldDescription>
          </Field>
        </Grid>
      </Demo>

      {/* Hosted where it lands, judged for what must NOT change. Same index in all three: on
          the page, in a card, in a glass card over a photograph. The strip's height, the rail's
          thickness and the grip's diameter are the same in every one of them — nothing about a
          slider is priced by what contains it. The ONE thing that changes is the grip's lift,
          in the third cell only, which is exactly the 2026-08-24 rule and the reason the three
          are shown together. */}
      <Demo label="On the page, in a card, in a glass card — only the grip's lift may differ">
        <BedSurface bed={bed("country")}>
          <Box width="220px">
            <Stack gap="3">
              <Text size="2" weight="medium">On the page</Text>
              <Slider size="3" defaultValue={55} aria-label="On the page" />
            </Stack>
          </Box>
          <Theme material="solid">
            <Card size="3" style={{ width: "220px" }}>
              <Stack gap="3">
                <Text size="2" weight="medium">In a card</Text>
                <Slider size="3" defaultValue={55} aria-label="In a card" />
              </Stack>
            </Card>
          </Theme>
          <Theme material="thick">
            <Card size="3" style={{ width: "220px" }}>
              <Stack gap="3">
                <Text size="2" weight="medium">In a glass card</Text>
                <Slider size="3" defaultValue={55} aria-label="In a glass card" />
              </Stack>
            </Card>
          </Theme>
        </BedSurface>
      </Demo>

      {/* The one layout fact, from both ends. The root fills its container's inline size,
          because a track has no intrinsic width, so the Box that owns the row is what decides
          how long the strip is — never a prop here. Everything else holds: same height, same
          rail, same grip, and the handle stays inside the rail's ends at both widths
          (`thumbAlignment="edge"`, a fixed identity rather than a knob). */}
      <Demo label="The container decides the length — and nothing else about the control">
        <Stack gap="5">
          <Strip width="10rem">
            <Slider size="3" defaultValue={55} aria-label="In a narrow column" />
          </Strip>
          <Strip width="34rem">
            <Slider size="3" defaultValue={55} aria-label="In a wide column" />
          </Strip>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* An inspector panel — the slider's most ordinary job, and the composition that shows
          several of them stacked reading as one instrument rather than three.

          No numeric readout, deliberately: a spec file takes no hooks (the structure's own
          rule — a live demo that needs state is its own client component), and a static "24px"
          printed beside a draggable handle stops being true on the first drag. Each row is a
          Field, so the visible label is also the control's accessible name and no slider here
          states one of its own. */}
      <Demo label="An inspector panel — labelled rows, one instrument">
        <Box maxWidth="24rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Drop shadow</Heading>
                <Text size="2" emphasis="medium">Applied to the selected layer.</Text>
              </Stack>
              <Stack gap="5">
                <Field>
                  <FieldLabel>Blur</FieldLabel>
                  <Slider defaultValue={24} max={64} />
                </Field>
                <Field>
                  <FieldLabel>Opacity</FieldLabel>
                  <Slider defaultValue={80} />
                </Field>
                <Field>
                  <FieldLabel>Spread</FieldLabel>
                  <Slider defaultValue={8} max={32} />
                  <FieldDescription>Grows the shadow before the blur is applied.</FieldDescription>
                </Field>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A filter panel — the range slider doing the job it exists for, beside a single-value
          one, so the two read as the same instrument at two arities. One loud action; the
          reset stays ground. */}
      <Demo label="A filter panel — a range beside a single value">
        <Box maxWidth="24rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Filters</Heading>
                <Text size="2" emphasis="medium">Eighty-one stays match today.</Text>
              </Stack>
              <Stack gap="5">
                <Field>
                  <FieldLabel>Nightly rate</FieldLabel>
                  <Slider defaultValue={[45, 210]} max={400} />
                  <FieldDescription>Before taxes and cleaning.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Minimum rating</FieldLabel>
                  <Slider defaultValue={4} max={5} step={1} />
                  <FieldDescription>Whole stars.</FieldDescription>
                </Field>
              </Stack>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Reset</Button>
                <Button tone="accent" emphasis="loud">Show stays</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* The floating editor panel — where the flat grip actually earns itself. A glass
          inspector sits over the thing it is editing, which is the whole reason the pane is
          translucent, and a raised handle on that pane reads as a pebble on the glass. Judge
          this one against the solid card above it. */}
      <Demo label="A glass inspector over the image it edits">
        <BedSurface bed={bed("ink")} minHeight="320px">
          <Theme material="regular">
            <Card size="3" style={{ width: "260px" }}>
              <Stack gap="6">
                <Stack gap="2">
                  <Heading size="4" render={<h3 />}>Adjust</Heading>
                  <Text size="2" emphasis="medium">Changes apply as you drag.</Text>
                </Stack>
                <Stack gap="5">
                  <Field>
                    <FieldLabel>Exposure</FieldLabel>
                    <Slider defaultValue={62} />
                  </Field>
                  <Field>
                    <FieldLabel>Contrast</FieldLabel>
                    <Slider defaultValue={38} />
                  </Field>
                  <Field>
                    <FieldLabel>Saturation</FieldLabel>
                    <Slider defaultValue={50} />
                  </Field>
                </Stack>
              </Stack>
            </Card>
          </Theme>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

export const sliderPreview: ComponentPreview = {
  slug: "slider",
  name: "Slider",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11, TextField's argument at a value control): loudness ranks actions and a value is not an action, so a form where one slider is louder than the next names nothing — the type refuses both `tone` and `emphasis`. The fill's family is a fixed identity instead: the root stamps `data-tone=\"accent\"`, so `--tone-solid` always resolves accent and there is no family to sweep. The rail is deliberately outside the tone system altogether — `--color-track`, the neutral well — which is what keeps §11's \"track low\" neutral under an accent fill, and which the segmented control left on 2026-08-24 while the instruments kept it.",
    },
    inUse: { body: <InUse /> },
  },
};
