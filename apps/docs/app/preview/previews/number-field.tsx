/**
 * NumberField's preview spec — the field family's second slotted member through the
 * per-component structure, modelled on TextField's page.
 *
 * What this page has to make readable is that a number field is a TEXT FIELD WHOSE SLOTS ARE
 * SPENT: the wrapper, the dress, the ring and the glass are the field family's, and decrease and
 * increase are ordinary hosted Buttons. So the judging is mostly agreement — the same box as a
 * TextField at every index, the same hosted inset as a clear button — plus the three facts only
 * this component has: the value is centred and tabular, a stepper at its bound stops looking
 * pressable, and a unit is written INTO the value by `format` rather than placed beside it.
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
  NumberField,
  Separator,
  Stack,
  Text,
  TextField,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, SpecTable, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, derived from the axis. A function, not a module const, for
    TextField's reason: `themeAxes` is client data the server route cannot read at import. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

function Sizes() {
  return (
    <Stack gap="6">
      {/* The ladder. Identical value in all four, so the only variables are the index's own:
          the height, the corner, the value's step and the two hosted steppers, whose box is
          derived from the field's inset rather than picked. What would be wrong: a stepper
          touching the border, unequal air above and below it, or a field taller than its row. */}
      <Demo label="Identical value — height, corner, type step and both steppers move together">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="4" align="center">
              {/* A STRETCHING cell, never a pinned box (2026-09-12, the ship audit's N3). A
                  `.kui-control` is inline-flex, so in a plain Box it shrink-wraps to its own
                  intrinsic width — the input's UA `size=20` plus two steppers, measured
                  188/226/261/306 across the index — and a 12rem box is narrower than three of
                  those four, so the field overflowed the caption beside it and the page scrolled
                  sideways on a phone. A Stack is a column, so its child takes its width: the
                  field is HANDED a width and the value takes what the steppers leave, which is
                  what every real form does with a field. */}
              <Stack flexGrow="1" flexBasis="0" minWidth="10rem" maxWidth="16rem">
                <NumberField size={size} defaultValue={12} aria-label={`Seats, size ${size}`} />
              </Stack>
              <Text size="1" emphasis="quiet">Size {size}</Text>
            </Flex>
          ))}
        </Stack>
      </Demo>

      {/* The agreement the component is built on: it wears the same field family as TextField,
          so at one index the two are one box, and the button that submits them stands level. */}
      <Demo label="Beside a TextField and a Button at every index — one ladder, one box">
        {/* Wrapping, because the row's own minimum is wider than a phone: two fields, a button
            and a caption at size 4 cannot stand on one 390px line, and the row that refused to
            wrap put the Add button on top of the increase stepper. */}
        <Stack gap="4">
          {SIZES.map((size) => (
            <Flex key={size} gap="3" align="center" wrap="wrap">
              <Stack flexGrow="1" flexBasis="0" minWidth="12rem" maxWidth="18rem">
                <TextField size={size} defaultValue="Design" aria-label={`Team, size ${size}`} />
              </Stack>
              <Stack flexGrow="1" flexBasis="0" minWidth="10rem" maxWidth="13rem">
                <NumberField size={size} defaultValue={4} min={1} aria-label={`Seats for team, size ${size}`} />
              </Stack>
              <Button size={size}>Add</Button>
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
      {/* THE BOARD IS TWO BOARDS (2026-09-12, the ship audit's N3). Six stretched columns
          divided this page's ~870px between them and left each field 114px wide — under a
          number field's own anatomy, so a size-4 cell rendered its VALUE four pixels wide and
          the one board that exists to show every state showed none of them. Three columns give
          each field ~250px here, and the scrolling region around each board is what keeps a
          phone from scrolling the whole page: the columns keep a usable width at every
          viewport and the board takes its own overflow instead of handing it to the document.

          "At minimum" is the column TextField has no equivalent for: the decrease stepper
          disables at the bound and stays in place, so nothing shifts and the control stops
          promising a press it cannot make. */}
      <Demo label="Empty, a value, and the lower bound — at every index">
        <Box overflowX="auto">
          <Box minWidth="42rem">
            <SpecTable
              wide
              cols={["Empty", "Value", "At minimum"]}
              rows={SIZES.map((size) => ({
                label: `size ${size}`,
                cells: [
                  <NumberField key="empty" size={size} placeholder="Seats" aria-label={`Seats, size ${size}, empty`} />,
                  <NumberField key="value" size={size} defaultValue={12} aria-label={`Seats, size ${size}, filled`} />,
                  <NumberField
                    key="min"
                    size={size}
                    defaultValue={1}
                    min={1}
                    aria-label={`Seats, size ${size}, at minimum`}
                  />,
                ],
              }))}
            />
          </Box>
        </Box>
      </Demo>

      {/* The three that change what the control IS, rather than what it holds. Read only
          disables BOTH steppers and drops the well, exactly as a read-only TextField drops it;
          disabled stands the whole box down; invalid re-tones the border and the ring while the
          value stays at full contrast, because the thing you must fix is the thing you must
          read. */}
      <Demo label="Invalid, disabled and read only — at every index">
        <Box overflowX="auto">
          <Box minWidth="42rem">
            <SpecTable
              wide
              cols={["Invalid", "Disabled", "Read only"]}
              rows={SIZES.map((size) => ({
                label: `size ${size}`,
                cells: [
                  <NumberField
                    key="invalid"
                    size={size}
                    defaultValue={0}
                    aria-invalid="true"
                    aria-label={`Seats, size ${size}, invalid`}
                  />,
                  <NumberField
                    key="disabled"
                    size={size}
                    defaultValue={12}
                    disabled
                    aria-label={`Seats, size ${size}, disabled`}
                  />,
                  <NumberField
                    key="readonly"
                    size={size}
                    defaultValue={12}
                    readOnly
                    aria-label={`Seats, size ${size}, read only`}
                  />,
                ],
              }))}
            />
          </Box>
        </Box>
      </Demo>

      {/* Live, because stepping is something you do. Click the value and use the keyboard:
          the steppers are out of the tab order on purpose, so Tab from here goes to the next
          field rather than to two buttons. Hold a stepper to repeat. Step up to 5 and the
          increase stepper disables; the ring stays on the field the whole time, because a
          mouse press on a stepper puts the caret back in the value. */}
      <Demo label="Arrow keys step by 1, Shift by 10, Alt by 0.1 — bounded 0 to 5">
        <Stack maxWidth="16rem">
          <NumberField defaultValue={3} min={0} max={5} aria-label="Bounded, focus demo" />
        </Stack>
      </Demo>

      {/* The three that get confused, side by side. */}
      <Demo label="Live, read only, disabled — three different sentences">
        <Grid columns="repeat(auto-fill, minmax(14rem, 1fr))" gapX="5" gapY="4" align="flex-start">
          {(
            [
              ["Live", {}],
              ["Read only — selectable, submitted, not steppable", { readOnly: true }],
              ["Disabled — not yours to change", { disabled: true }],
            ] as const
          ).map(([label, flags]) => (
            <Stack key={label} gap="2">
              <Text size="1" emphasis="quiet">{label}</Text>
              <NumberField defaultValue={24} aria-label={label} {...flags} />
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
      {/* Solid beside every thickness, over every standard bed. The steppers are where
          one-glass-per-stack is visible: the field spends the backdrop, so each hosted Button
          resolves on-glass and paints no second veil. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b}>
            {(["solid", ...glassMaterials()] as const).map((m) => (
              <Theme key={m} material={m}>
                {/* 15rem, sized FROM the intrinsic width rather than under it: a default field
                    measures 226px, so the 12rem box this used to be left the increase stepper
                    hanging over the cell beside it on every bed. */}
                <Box width="15rem">
                  <Stack gap="2">
                    <Text size="1" emphasis="quiet">{cap(m)}</Text>
                    <NumberField defaultValue={12} aria-label={`${m} number field on ${b.name}`} />
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
      <Demo label="Size × material — over the pattern">
        <BedSurface bed={bed("pattern")} minHeight="520px">
          <Stack gap="5" style={{ width: "100%" }}>
            {(["solid", ...glassMaterials()] as const).map((m) => (
              <Theme key={m} material={m}>
                <Stack gap="3">
                  <Text size="1" emphasis="quiet">{cap(m)}</Text>
                  <Flex gap="4" align="center" wrap="wrap">
                    {SIZES.map((size) => (
                      <Stack key={size} flexGrow="1" flexBasis="0" minWidth="11rem" maxWidth="18rem">
                        <NumberField size={size} defaultValue={12} aria-label={`${m}, size ${size}`} />
                      </Stack>
                    ))}
                  </Flex>
                </Stack>
              </Theme>
            ))}
          </Stack>
        </BedSurface>
      </Demo>

      {/* Radius level × size. Both edges start with a hosted control, so neither takes the pill
          padding correction — at `full` the steppers sit at the slot inset exactly as a
          TextField's clear button does. The `medium` row is the control. */}
      <Demo label="Radius `full` above, `medium` below — both edges are slots, so neither pads wider">
        <Stack gap="5">
          {(["full", "medium"] as const).map((radius) => (
            <Theme key={radius} radius={radius}>
              <Stack gap="3">
                <Text size="1" emphasis="quiet">radius {radius}</Text>
                <Flex gap="4" align="center" wrap="wrap">
                  {SIZES.map((size) => (
                    <Stack key={size} flexGrow="1" flexBasis="0" minWidth="11rem" maxWidth="18rem">
                      <NumberField size={size} defaultValue={12} aria-label={`${radius}, size ${size}`} />
                    </Stack>
                  ))}
                </Flex>
              </Stack>
            </Theme>
          ))}
        </Stack>
      </Demo>

      {/* Format × locale — the reason the component has no leading or trailing slot. Intl
          writes the unit into the value in the reader's own notation, the value is announced
          with it, and typing "1.250,50" in the German cell parses back to a number. Watch the
          digits hold their width as you step: tabular figures, so nothing jitters. */}
      <Demo label="One field, five formats — the unit is written into the value, never beside it">
        <Grid columns="repeat(auto-fill, minmax(14rem, 1fr))" gapX="5" gapY="4" align="flex-start">
          {(
            [
              ["US dollars", { defaultValue: 1250.5, step: 10, format: { style: "currency", currency: "USD" }, locale: "en-US" }],
              ["Euros, German", { defaultValue: 1250.5, step: 10, format: { style: "currency", currency: "EUR" }, locale: "de-DE" }],
              ["Percent", { defaultValue: 0.25, step: 0.05, min: 0, max: 1, format: { style: "percent" } }],
              ["Days", { defaultValue: 30, min: 1, format: { style: "unit", unit: "day", unitDisplay: "long" } }],
              ["Kilograms, one decimal", { defaultValue: 2.5, step: 0.1, format: { style: "unit", unit: "kilogram", maximumFractionDigits: 1 } }],
            ] as const
          ).map(([label, flags]) => (
            <Stack key={label} gap="2">
              <Text size="1" emphasis="quiet">{label}</Text>
              <NumberField aria-label={label} {...flags} />
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* State × material. State outranks glass: invalid and disabled take the edge back. */}
      <Demo label="State × material — a state takes the glass edge back">
        <BedSurface bed={bed("photo")}>
          <Theme material="regular">
            {(
              [
                ["Rest", { defaultValue: 12 }],
                ["At maximum", { defaultValue: 10, max: 10 }],
                ["Invalid", { defaultValue: 0, "aria-invalid": "true" as const }],
                ["Disabled", { defaultValue: 12, disabled: true }],
              ] as const
            ).map(([label, flags]) => (
              <Stack key={label} gap="2" flexGrow="1" flexBasis="0" minWidth="11rem" maxWidth="16rem">
                <Text size="1" emphasis="quiet">{label}</Text>
                <NumberField aria-label={`Glass number field, ${label}`} {...flags} />
              </Stack>
            ))}
          </Theme>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* Where it lands: inside a Field, which states the index for the label, the description
          and the box at once. An explicit size on the control still wins — the last cell. */}
      <Demo label="Inside a Field — one index for the label, the description and the box">
        <Grid columns="repeat(auto-fill, minmax(15rem, 1fr))" gapX="5" gapY="5" align="flex-start">
          {SIZES.map((size) => (
            <Field key={size} size={size}>
              <FieldLabel>Seats</FieldLabel>
              <NumberField defaultValue={12} min={1} />
              <FieldDescription>Billed per seat.</FieldDescription>
            </Field>
          ))}
          <Field size="4">
            <FieldLabel>Stated on the control</FieldLabel>
            <NumberField size="1" defaultValue={12} />
            <FieldDescription>The field said 4; the control said 1 and kept it.</FieldDescription>
          </Field>
        </Grid>
      </Demo>

      {/* On a pane. A field in a card casts nothing and keeps the control band's corner; on
          glass the steppers resolve on-glass inside the glass field, never a third veil. */}
      <Demo label="On a solid card and on a glass one — the steppers pay for no second veil">
        <BedSurface bed={bed("country")}>
          {(["solid", "regular"] as const).map((m) => (
            <Theme key={m} material={m}>
              <Card size="3" style={{ width: "18rem" }}>
                <Stack gap="4">
                  <Stack gap="2">
                    <Heading size="4" render={<h3 />}>Guests</Heading>
                    <Text size="2" emphasis="medium">Up to eight per booking.</Text>
                  </Stack>
                  <NumberField defaultValue={2} min={1} max={8} aria-label={`Guests, ${m} card`} />
                  <Flex justify="flex-end">
                    <Button tone="accent" emphasis="loud">Reserve</Button>
                  </Flex>
                </Stack>
              </Card>
            </Theme>
          ))}
        </BedSurface>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. */}
      <Demo label="A number field inside a number field — refused, and so are the caller's slots">
        <Stack gap="3">
          <Stack maxWidth="16rem">
            <NumberField defaultValue={12} aria-label="The only number field" />
          </Stack>
          <Text size="2" emphasis="medium" style={{ maxWidth: "36rem" }}>
            There is no nesting case. The inside is an <Code>&lt;input&gt;</Code>, and both slots
            are already spent on the steppers, so there is no <Code>leading</Code> or{" "}
            <Code>trailing</Code> to put anything in. A currency or a unit goes in{" "}
            <Code>format</Code>, where it is written into the value and read back out of it.
          </Text>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      <Demo label="A plan — seats, with the limit it cannot pass">
        <Box maxWidth="26rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Team plan</Heading>
                <Text size="2" emphasis="medium">Shruti Bhatia and 11 others have access.</Text>
              </Stack>
              <Field>
                <FieldLabel>Seats</FieldLabel>
                <NumberField defaultValue={12} min={1} max={200} name="seats" />
                <FieldDescription>Changes apply from the next billing date.</FieldDescription>
              </Field>
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Cancel</Button>
                <Button tone="accent" emphasis="loud">Update seats</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A settings form doing all three jobs: a currency, a unit, and a live error. The value
          stays at full contrast in the invalid field — the thing you must fix is the thing you
          must read. */}
      <Demo label="Usage settings — a currency, a unit, and an error">
        <Box maxWidth="28rem">
          <Card size="3">
            <Stack gap="6">
              <Stack gap="2">
                <Heading size="4" render={<h3 />}>Usage</Heading>
                <Text size="2" emphasis="medium">We stop new runs when the month reaches the cap.</Text>
              </Stack>
              <Stack gap="5">
                <Field>
                  <FieldLabel>Monthly cap</FieldLabel>
                  <NumberField
                    defaultValue={240}
                    min={0}
                    step={10}
                    format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                  />
                  <FieldDescription>Billed at the end of each month.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Log retention</FieldLabel>
                  <NumberField
                    defaultValue={400}
                    min={1}
                    max={365}
                    allowOutOfRange
                    aria-invalid
                    format={{ style: "unit", unit: "day", unitDisplay: "long" }}
                  />
                  <FieldError match={true}>Retention is at most 365 days.</FieldError>
                </Field>
              </Stack>
              <Separator />
              <Flex gap="3" justify="flex-end">
                <Button emphasis="quiet" bordered>Cancel</Button>
                <Button tone="accent" emphasis="loud">Save</Button>
              </Flex>
            </Stack>
          </Card>
        </Box>
      </Demo>

      {/* A row of controls at one index, the composition the shared ladder exists for. */}
      <Demo label="An editor toolbar — the field standing level with the buttons beside it">
        <Box maxWidth="34rem">
          <Card size="3">
            <Flex gap="3" align="center" justify="space-between" wrap="wrap">
              <Flex gap="3" align="center">
                <Button emphasis="quiet" bordered>Fit</Button>
                {/* The compact case, and the one that shows the value's floor doing its job:
                    a zoom field wants to be small, so it is given room to shrink rather than a
                    width under its own anatomy. */}
                <Stack flexGrow="1" flexBasis="0" minWidth="8rem" maxWidth="11rem">
                  <NumberField
                    defaultValue={1}
                    min={0.1}
                    max={4}
                    step={0.1}
                    format={{ style: "percent" }}
                    aria-label="Zoom"
                  />
                </Stack>
              </Flex>
              <Button tone="accent" emphasis="loud">Export</Button>
            </Flex>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const numberFieldPreview: ComponentPreview = {
  slug: "number-field",
  name: "Number field",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11), TextField's refusal verbatim: a field has no emphasis and no tone, because fields do not rank against each other. Colour reaches it only as STATE — invalid re-tones the border and the ring, disabled stands the box down, and a stepper at its bound disables. All three are in the States section.",
    },
    inUse: { body: <InUse /> },
  },
};
