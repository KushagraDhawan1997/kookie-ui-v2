/**
 * Card's preview spec — the first component through the per-component structure
 * (2026-08-19, the manual audit's first subject).
 *
 * What it fixes about the old section: the four sizes were unreadable (identical boxes,
 * identical content — only padding moved, invisibly), pressable cards existed at one size,
 * the composed card at one size, and material behind one image. Every cross Kushagra asked
 * for is here: solid vs each thickness over every standard bed, size × material, and
 * pressable × material × size on both calm and hostile ground.
 */
import * as React from "react";
import { Box, Button, Card, Flex, Grid, Heading, Stack, Text, Theme, themeAxes } from "@kookie-ui/react";

import { BEDS, BedSurface, bed } from "../beds";
import { Demo, SIZES, cap } from "../pieces";
import type { ComponentPreview } from "./types";

/** The theme's glass thicknesses, DERIVED from the axis (solid is the rung where light
    stops, shown as its own cell). A restated list here would go stale the day the axis
    widens — the drift the package exported `themeAxes` to end.

    A FUNCTION, not a module const: the standalone route imports this module on the server
    for its slug, and `themeAxes` is a client module's data — unreadable during server module
    evaluation (the build fails on it). Deferred into render, it only ever runs on the
    client. Same reason every section below is a component, not a module-scope element
    tree that maps over package data. */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/**
 * Per-size type steps for composed card content — AlertDialog's own mapping (title 4/5/6/7,
 * body 2/2/3/3), reused rather than invented: it is the one place the system already ties
 * an innards ladder to a surface size index. v0 for Card, judged by eye.
 */
const TITLE_STEP = { "1": "4", "2": "5", "3": "6", "4": "7" } as const;
const BODY_STEP = { "1": "2", "2": "2", "3": "3", "4": "3" } as const;

/** One card's worth of real words — the same pair everywhere so the only variable is the
    axis under judgment. */
function Blurb({ title = "Nightly build", body = "1,024 laws green in 41s.", titleSize = "2", bodySize = "2" }: {
  title?: string;
  body?: string;
  titleSize?: "1" | "2" | "3" | "4";
  bodySize?: "1" | "2" | "3";
}) {
  return (
    <Stack gap="1">
      <Text size={titleSize} weight="medium">{title}</Text>
      <Text size={bodySize} emphasis="medium">{body}</Text>
    </Stack>
  );
}

function Sizes() {
  return (
  <Stack gap="6">
    {/* Identical content in all four, so the only variable is the size's padding and corner
        pick — the cell-level read. */}
    <Demo label="Identical content — only the padding and corner move">
      <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
        {SIZES.map((size) => (
          <Card key={size} size={size}>
            <Blurb title={`Size ${size}`} />
          </Card>
        ))}
      </Grid>
    </Demo>
    {/* The read Kushagra asked for (2026-08-19): a size index you can SEE. The content
        re-prices with the card — title and body ride the same per-size steps AlertDialog
        already ships — so a size-1 card and a size-4 card are different sizes of thing,
        not the same thing with more air. */}
    <Demo label="Content at the size's own type steps — the whole card re-prices">
      <Flex gap="5" wrap="wrap" align="flex-start">
        {SIZES.map((size) => (
          <Box key={size} width="16rem">
            <Card size={size}>
              <Stack gap="2">
                <Heading size={TITLE_STEP[size]} render={<h3 />}>Size {size}</Heading>
                <Text size={BODY_STEP[size]} emphasis="medium">
                  Padding, corner and type move together.
                </Text>
              </Stack>
            </Card>
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
    {/* A card's states exist only when it IS something interactive (§10: render a button and
        the surface notices). Static, button and link at every size — hover, press and
        keyboard-focus the interactive rows; since 2026-08-17 they move like controls, at the
        surface's own distances. */}
    <Demo label="Static, pressable, link — every size; hover, press and focus the last two">
      <Grid columns="repeat(4, minmax(0, 1fr))" gapX="5" gapY="5">
        {SIZES.map((size) => (
          <Card key={size} size={size}>
            <Blurb title={`Static ${size}`} body="A shell. No states." />
          </Card>
        ))}
        {SIZES.map((size) => (
          <Card key={size} size={size} render={<button type="button" />} style={{ textAlign: "left" }}>
            <Blurb title={`Button ${size}`} body="Sinks 1px, shrinks to 0.995." />
          </Card>
        ))}
        {SIZES.map((size) => (
          <Card key={size} size={size} render={<a href="#card" />} style={{ textDecoration: "none" }}>
            <Blurb title={`Link ${size}`} body="No underline; the ring lands." />
          </Card>
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
    {/* The board: solid beside every thickness, over every standard bed. Each cell pins its
        material with a nested Theme so the board reads the same whatever the panel says —
        the panel's material still governs everything OUTSIDE pinned cells. The beds are
        backdrop regions, so expression needs no prop on any card (§10 selectivity). */}
    {BEDS.map((bed) => (
      <Demo key={bed.id} label={bed.name}>
        <BedSurface bed={bed}>
          <Theme material="solid">
            <Card size="2" style={{ width: "170px" }}>
              <Blurb title="Solid" body="Where light stops." />
            </Card>
          </Theme>
          {GLASS.map((m) => (
            <Theme key={m} material={m}>
              <Card size="2" style={{ width: "170px" }}>
                <Blurb title={cap(m)} body="The theme's glass." />
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
    {/* Size × material, over the pattern (Kushagra's pick, 2026-08-19): flat illustrated
        shapes with hard edges — the ground where a wrong alpha or a dead blur is most
        visible. Does the veil hold at every padding and corner pick? */}
    <Demo label="Size × material — over the pattern">
      <BedSurface bed={bed("pattern")} minHeight="520px">
        <Grid columns="repeat(4, minmax(0, max-content))" gapX="5" gapY="5">
          {(["solid", ...GLASS] as const).map((m) =>
            SIZES.map((size) => (
              <Theme key={`${m}-${size}`} material={m}>
                <Card size={size} style={{ width: "150px" }}>
                  <Blurb title={cap(m)} body={`Size ${size}`} bodySize="1" />
                </Card>
              </Theme>
            )),
          )}
        </Grid>
      </BedSurface>
    </Demo>
    {/* Pressable × material × ground: the press physics must read on glass as on solid, on a
        calm ground as over the pattern. Press these. */}
    <Demo label="Pressable × material — calm ground; press them">
      <BedSurface bed={BEDS[0]!}>
        {(["solid", ...GLASS] as const).map((m) => (
          <Theme key={m} material={m}>
            <Card size="2" render={<button type="button" />} style={{ width: "170px", textAlign: "left" }}>
              <Blurb title={cap(m)} body="Pressable." bodySize="1" />
            </Card>
          </Theme>
        ))}
      </BedSurface>
    </Demo>
    <Demo label="Pressable × material — over the pattern; press them">
      <BedSurface bed={bed("pattern")}>
        {(["solid", ...GLASS] as const).map((m) => (
          <Theme key={m} material={m}>
            <Card size="2" render={<button type="button" />} style={{ width: "170px", textAlign: "left" }}>
              <Blurb title={cap(m)} body="Pressable." bodySize="1" />
            </Card>
          </Theme>
        ))}
      </BedSurface>
    </Demo>
  </Stack>
  );
}

function InUse() {
  return (
  <Stack gap="6">
    <Demo label="A confirm card — siblings, not slots">
      <Box maxWidth="26rem">
        <Card size="3">
          <Stack gap="6">
            <Stack gap="2">
              <Heading size="4" render={<h3 />}>Delete workspace</Heading>
              <Text size="2" emphasis="medium">
                Removes every project, member, and API key. This cannot be undone.
              </Text>
            </Stack>
            <Flex gap="3" justify="flex-end">
              <Button emphasis="quiet" bordered>Keep it</Button>
              <Button tone="destructive" emphasis="loud">Delete</Button>
            </Flex>
          </Stack>
        </Card>
      </Box>
    </Demo>
    <Demo label="A card as a link — an article teaser">
      <Box maxWidth="26rem">
        {/* No display workaround: this demo shattered into inline fragments on 2026-08-19,
            which is what closed the 2026-08-06 open item — the surface layer now states
            `display: block` on interactive cards (LOG 2026-08-19). */}
        <Card size="3" render={<a href="#card" />} style={{ textDecoration: "none" }}>
          <Stack gap="2">
            <Heading size="4" render={<h3 />}>The mark family</Heading>
            <Text size="2" emphasis="medium">
              One ladder for every control that is its own mark — and why the box is the
              line box.
            </Text>
            <Text size="2" emphasis="quiet">Read more</Text>
          </Stack>
        </Card>
      </Box>
    </Demo>
  </Stack>
  );
}

export const cardPreview: ComponentPreview = {
  slug: "card",
  name: "Card",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    tones: {
      absent:
        "Refused (§11): tone and emphasis rank actions, and a container ranks nothing — a card has no tone to sweep. A status surface that colors a container is Callout's job.",
    },
    inUse: { body: <InUse /> },
  },
};
