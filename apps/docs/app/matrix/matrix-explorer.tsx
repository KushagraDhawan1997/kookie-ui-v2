"use client";

/**
 * The judging surface the open-questions list keeps deferring to: every shipped control at
 * every (size × density) cell, with the page-wide axes — radius level, pointer world, surface
 * identity, contrast — switchable in place. Taste is the last layer, and this is where the
 * v0 numbers get judged by eye (CLAUDE.md "Then:", DECISIONS §12/§16 open lists).
 *
 * Density, radius, pointer and surfaces land on a nested <Theme> per section — post-mount
 * interactive state, so no SSR concern. Appearance and contrast live on <html> (see
 * appearance-script.ts): contrast must co-locate with appearance for the generated
 * high-contrast selectors to match, so the picker here writes through the same store.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
  TextArea,
  TextField,
  Theme,
  type ThemeProps,
  type Size,
  type Tone,
} from "@kookie-ui/react";

import { setContrast, useAppearance, type ContrastChoice } from "../appearance";
import { PlusIcon, SearchIcon, XIcon } from "../icons";

const SIZES = ["1", "2", "3", "4"] as const satisfies readonly Size[];
const DENSITIES = ["compact", "default", "comfortable"] as const;
const RADII = ["none", "small", "medium", "large", "full"] as const;
const POINTERS = ["auto", "fine", "coarse"] as const;
const SURFACES = ["flat", "elevated"] as const;
const CONTRASTS = ["auto", "normal", "high"] as const satisfies readonly ContrastChoice[];
// The app restates the tone list (the package exports the type, not the value) — docs land,
// where a stale entry fails visibly on this very page.
const TONES = [
  "neutral",
  "accent",
  "blue",
  "green",
  "orange",
  "amber",
  "destructive",
  "success",
  "warning",
  "info",
] as const satisfies readonly Tone[];

function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (next: T) => void;
}) {
  // A row inside a Stack, never an item in a row-Flex: a Box as a shrink-to-fit flex item
  // collapses to zero width under inline-size containment (§2's container decision — see the
  // open-questions entry this page earned). Column items stretch, so the row is full width,
  // and the label takes an explicit width because it is a Box inside a row itself.
  return (
    <Flex gap="1" align="center">
      <Box width="88px" px="2">
        <Text size="1" emphasis="medium">
          {label}
        </Text>
      </Box>
      {options.map((option) => (
        <Button
          key={option}
          size="1"
          tone={value === option ? "accent" : "neutral"}
          emphasis={value === option ? "medium" : "quiet"}
          onClick={() => onChange(option)}
        >
          {option}
        </Button>
      ))}
    </Flex>
  );
}

/** One size's worth of controls — the row every density section repeats four times. */
function SizeRow({ size }: { size: Size }) {
  return (
    <Flex gap="4" align="center" wrap="wrap">
      <Box width="56px">
        <Text size="1" emphasis="medium">
          size {size}
        </Text>
      </Box>
      <Button size={size}>Button</Button>
      <Button size={size} tone="accent" emphasis="loud">
        Primary
      </Button>
      <Button size={size} emphasis="quiet" bordered>
        Quiet
      </Button>
      <Button size={size} leading={<PlusIcon />}>
        New
      </Button>
      <Button size={size} iconOnly emphasis="quiet" aria-label="Search">
        <SearchIcon />
      </Button>
      <Button size={size} loading>
        Saving
      </Button>
      <TextField
        size={size}
        placeholder="Search the docs…"
        leading={<SearchIcon />}
        trailing={
          <Button size={size} iconOnly emphasis="quiet" aria-label="Clear">
            <XIcon />
          </Button>
        }
      />
      <TextArea size={size} rows={2} placeholder="A paragraph of feedback…" style={{ width: "220px" }} />
      <Card size={size}>
        <Text size="2">Card {size}</Text>
      </Card>
    </Flex>
  );
}

export function MatrixExplorer() {
  const [radius, setRadius] = React.useState<NonNullable<ThemeProps["radius"]>>("medium");
  const [pointer, setPointer] = React.useState<NonNullable<ThemeProps["pointer"]>>("auto");
  const [surfaces, setSurfaces] = React.useState<NonNullable<ThemeProps["surfaces"]>>("flat");
  const { contrast } = useAppearance();

  return (
    <Stack gap="7">
      <Stack gap="3">
        <Heading size="6" render={<h1 />}>
          Judging matrix
        </Heading>
        <Text size="2" emphasis="medium" render={<p />} style={{ maxWidth: "44rem" }}>
          Every shipped control at every size × density cell. The pickers move whole worlds:
          radius re-prices the palette, pointer swaps the designed geometry (coarse also lifts
          the handheld type band), surfaces decide whether anything sits up, and contrast is
          the accessibility setting, never a style. Materials are judged against the hostile
          backdrop in the package preview, not here.
        </Text>
      </Stack>

      <Stack gap="2">
        <Picker label="radius" value={radius} options={RADII} onChange={setRadius} />
        <Picker label="pointer" value={pointer} options={POINTERS} onChange={setPointer} />
        <Picker label="surfaces" value={surfaces} options={SURFACES} onChange={setSurfaces} />
        <Picker label="contrast" value={contrast} options={CONTRASTS} onChange={setContrast} />
      </Stack>

      {DENSITIES.map((density) => (
        <Theme
          key={density}
          density={density}
          radius={radius}
          pointer={pointer}
          surfaces={surfaces}
          render={<section />}
        >
          <Stack gap="4">
            <Heading size="3">{density}</Heading>
            {SIZES.map((size) => (
              <SizeRow key={size} size={size} />
            ))}
          </Stack>
        </Theme>
      ))}

      <Theme radius={radius} pointer={pointer} surfaces={surfaces} render={<section />}>
        <Stack gap="4">
          <Heading size="3">tone × emphasis</Heading>
          <Text size="2" emphasis="medium" render={<p />}>
            The full ladder per family at size 2, default density. Loud + bordered is legal and
            useless (§9), so it is not shown.
          </Text>
          <Stack gap="2">
            {TONES.map((tone) => (
              <Flex key={tone} gap="3" align="center" wrap="wrap">
                <Box width="88px">
                  <Text size="1" emphasis="medium">
                    {tone}
                  </Text>
                </Box>
                <Button tone={tone} emphasis="loud">
                  Loud
                </Button>
                <Button tone={tone} emphasis="medium">
                  Medium
                </Button>
                <Button tone={tone} emphasis="medium" bordered>
                  Medium bordered
                </Button>
                <Button tone={tone} emphasis="quiet">
                  Quiet
                </Button>
                <Button tone={tone} emphasis="quiet" bordered>
                  Quiet bordered
                </Button>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Theme>

      {/* The type ramp takes the pointer Theme like everything else on the page, and the
          omission was not cosmetic: this section is the ONLY place the type scale is shown
          as type, and the handheld band rides the pointer axis's own [data-pointer] scopes
          (§17 — pinning `pointer` is how phone type gets judged on a desktop). Outside a
          Theme it sat permanently at the root's `auto`, so clicking `coarse` moved every
          control and left the ramp on the desktop ladder — with the page's own prose,
          "coarse also lifts the handheld type band", printed directly above it. */}
      <Theme radius={radius} pointer={pointer} surfaces={surfaces} render={<section />}>
        <Stack gap="4">
          <Heading size="3">type</Heading>
          <Stack gap="2">
            {(["9", "8", "7", "6", "5", "4", "3", "2", "1"] as const).map((step) => (
              <Flex key={step} gap="4" align="baseline">
                <Box width="56px">
                  <Text size="1" emphasis="medium">
                    {step}
                  </Text>
                </Box>
                <Text size={step}>The quick brown fox jumps over the lazy dog</Text>
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Theme>
    </Stack>
  );
}
