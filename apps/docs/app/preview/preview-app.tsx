"use client";

/**
 * The playground: the Radix Themes playground's structure in this system's vocabulary. One
 * long page, every component in alphabetical order, dense specimen tables — and the theme
 * panel is OUR panel: every Theme axis (derived from `themeAxes`, so this sentence cannot go stale again — it said seven while the panel rendered nine), switchable in place, landing on one nested
 * <Theme> around the whole canvas so flipping an axis re-renders every specimen at once.
 *
 * Appearance is scoped to the canvas: "inherit" follows the site, light/dark pin it.
 * Contrast writes through the site store instead (html-level), because the generated
 * high-contrast selectors need data-appearance and data-contrast co-located on one element
 * and <html> is the element that always has both. Known edge, accepted: a pinned canvas
 * appearance plus global high contrast splits that co-location inside the pinned canvas.
 */
import * as React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Stack,
  Text,
  Theme,
  windowClassQueries,
  type ThemeProps,
  themeAxes,
  themeDefaults,
} from "@kookie-ui/react";

import { setContrast, useAppearance, type ContrastChoice } from "../appearance";
import { MotionPanel } from "./motion-panel";
import { LensBench } from "./lens-bench";
import { StandaloneLink } from "./component-preview";
import { Showcase } from "./showcase";
import { SECTIONS } from "./specimens";

type Env = {
  appearance: "inherit" | "light" | "dark";
  density: NonNullable<ThemeProps["density"]>;
  pointer: NonNullable<ThemeProps["pointer"]>;
  radius: NonNullable<ThemeProps["radius"]>;
  depth: NonNullable<ThemeProps["depth"]>;
  material: NonNullable<ThemeProps["material"]>;
  size: NonNullable<ThemeProps["size"]>;
};

/** DERIVED from the package, never restated (2026-08-09): this panel held its own copy of
    all six axis defaults, and the day `full` became the system default the playground — the
    one surface whose job is showing what the system does — kept opening at `medium`.
    `appearance` is the one deliberate override: the preview sits inside the docs' own
    appearance and starts by inheriting it. */
const DEFAULT_ENV: Env = {
  appearance: "inherit",
  density: themeDefaults.density,
  pointer: themeDefaults.pointer,
  radius: themeDefaults.radius,
  depth: themeDefaults.depth,
  material: themeDefaults.material,
  size: themeDefaults.size,
};

/** DERIVED, not restated (2026-08-16): this held its own copy of every axis's values, which
    is the same drift `themeDefaults` was exported to end one level up — a copy agrees today
    and goes stale the moment an axis widens, in the one surface whose job is showing what the
    system does. `appearance` is the deliberate exception the DEFAULT_ENV note already records.
    The package now exports `themeAxes`; a docs law fails on a restated list. */
const AXES: { [K in keyof Env]: readonly Env[K][] } = themeAxes;

const CONTRASTS = ["auto", "normal", "high"] as const satisfies readonly ContrastChoice[];

function Chips<T extends string>({
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
  // Label above chips, the Radix Theme Panel's own arrangement. Column items stretch, so
  // no containment collapse; the label is bare Text (a span, not a query container).
  //
  // The group and the pressed state are stated in the markup, not left to the fill (audit
  // 2026-08-08). Selection was carried ONLY by tone/emphasis — which resolve to colour — so
  // the current value of every axis was undeterminable to assistive technology (WCAG 4.1.2),
  // and the pointer and contrast groups each offered an "auto" chip with nothing to tell them
  // apart. `aria-pressed` reaches the element because ButtonProps extends the native button's
  // props: the omission was the call site's, not the package's.
  const groupId = `env-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <Stack gap="2">
      <Text size="2" emphasis="quiet" id={groupId}>
        {label}
      </Text>
      <Flex gap="1" align="center" wrap="wrap" role="group" aria-labelledby={groupId}>
        {options.map((option) => (
          <Button
            key={option}
            tone={value === option ? "accent" : "neutral"}
            emphasis={value === option ? "loud" : "medium"}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </Flex>
    </Stack>
  );
}

/**
 * The theme panel, on the right like the reference — and it is a Card, INSIDE the canvas
 * Theme, on purpose twice over: dogfood (the panel is made of the system it drives), and
 * feedback (flip density and the panel's own chips tighten; pick `full` and the panel's
 * corners answer; pin dark and the Card seals dark; elevate and it casts). The panel
 * responding to the panel is the fastest proof the axes are real.
 */
function EnvPanel({ env, onChange }: { env: Env; onChange: (next: Env) => void }) {
  const { contrast } = useAppearance();
  const dirty =
    contrast !== "auto" ||
    (Object.keys(AXES) as (keyof Env)[]).some((k) => env[k] !== DEFAULT_ENV[k]);
  return (
    <Box
      className="pv-panel"
      style={{
        /**
         * PADDED OUTWARD, so the cards inside keep the size and the position they had
         * (2026-08-23, Kushagra: the panel "needs some padding all around or at least no
         * clipping bc shadow isnt visible").
         *
         * This box scrolls, and a scroll container clips at its PADDING box — so with no
         * padding the cards were flush against every edge and the world's own surface cast was
         * cut off on all four sides. The panel is a stack of Cards in an elevated world; a card
         * with no visible lift reads as a flat rectangle, which is the one thing this panel is
         * supposed to demonstrate.
         *
         * The padding is added and then subtracted from the insets and back onto the box, so the
         * CARD is still 340px wide with its right edge 24px from the window — the lane's own
         * reservation is measured from those and does not move.
         *
         * THE NUMBERS ARE THE CAST'S OWN REACH, not a guess. `--surface-chrome` is `--shadow-4`
         * — `0 1px 2px` plus `0 24px 64px -12px` — so the second layer reaches `64/2 - 12` =
         * 20px to each side, `24 + 64/2 - 12` = 44px below, and nothing above (the offset
         * exceeds the blur's own half). Hence three different values: a uniform padding either
         * wastes 20px above the panel or clips the bottom of every card in it.
         */
        boxSizing: "border-box",
        insetInlineEnd: "4px",
        insetBlockStart: "16px",
        width: "380px",
        // The panel's own bottom edge, 4px off the window like its sides — the padding below
        // the last card is INSIDE this, so a scrolled panel still shows that card's lift
        // instead of ending on its border. Measured: the first spelling added the padding to
        // the height instead and overflowed the window by 20px at 600px tall.
        maxHeight: "calc(100dvh - 20px)",
        paddingInline: "20px",
        paddingBlockStart: "8px",
        paddingBlockEnd: "44px",
        overflowY: "auto",
        zIndex: 10,
      }}
      render={<aside aria-label="Environment" />}
    >
      <Card size="2">
        <Stack gap="4">
          <Heading size="2" render={<h2 />}>
            Environment
          </Heading>
          <Chips
            label="appearance"
            value={env.appearance}
            options={AXES.appearance}
            onChange={(appearance) => onChange({ ...env, appearance })}
          />
          <Chips
            label="density"
            value={env.density}
            options={AXES.density}
            onChange={(density) => onChange({ ...env, density })}
          />
          <Chips
            label="pointer"
            value={env.pointer}
            options={AXES.pointer}
            onChange={(pointer) => onChange({ ...env, pointer })}
          />
          <Chips
            label="radius"
            value={env.radius}
            options={AXES.radius}
            onChange={(radius) => onChange({ ...env, radius })}
          />
          <Chips
            label="depth"
            value={env.depth}
            options={AXES.depth}
            onChange={(depth) => onChange({ ...env, depth })}
          />
          <Chips
            label="material"
            value={env.material}
            options={AXES.material}
            onChange={(material) => onChange({ ...env, material })}
          />
          <Chips
            label="size"
            value={env.size}
            options={AXES.size}
            onChange={(size) => onChange({ ...env, size })}
          />
          <Chips label="contrast" value={contrast} options={CONTRASTS} onChange={setContrast} />
          <Separator />
          <Flex gap="1" align="center">
            <Button
              emphasis="quiet"
              bordered
              disabled={!dirty}
              onClick={() => {
                onChange(DEFAULT_ENV);
                setContrast("auto");
              }}
            >
              Reset
            </Button>
            <Button emphasis="quiet" render={<Link href="/" />}>
              Docs
            </Button>
          </Flex>
        </Stack>
      </Card>
      {/* The motion bench sits BESIDE the axis card, not inside it: the axes above are the
          system's public vocabulary and this is the workbench those numbers are judged on.
          It writes to <html> rather than to the canvas Theme, because the panels it exists to
          judge are portalled out of the canvas (see motion-panel.tsx). */}
      <Box style={{ marginBlockStart: "var(--layout-space-4)" }}>
        <Stack gap="3">
          <MotionPanel />
          <LensBench />
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * The panel's lane, and the one media query on this page.
 *
 * The first cut pinned a 300px fixed panel against a hard-coded 364px inline-end reservation
 * at EVERY viewport. Below ~390px the content lane computed to zero behind a panel covering
 * most of the screen, and at exactly 768px — the system's own `narrow` boundary, shipped
 * five days earlier and law-pinned — the lane was 380px against max-content grid tracks that
 * do not shrink, so the page scrolled sideways under the panel (audit 2026-08-08).
 *
 * The boundary is IMPORTED, never retyped: `windowClassQueries.narrow` derives from
 * `windowClass.narrowMax` in the package's config, so this page cannot drift from the class
 * the rest of the system means by "narrow" (§18). Below it the panel stops being an overlay
 * and becomes what it is on a phone — a block at the top of the page — which is also the only
 * arrangement that leaves the specimen tables their full width.
 */
const LANE_CSS = `
.pv-panel { position: fixed; }
.pv-lane { padding-inline-end: 404px; }
@media ${windowClassQueries.narrow} {
  .pv-panel { position: static; width: auto; max-height: none; margin-block-end: var(--layout-space-6); }
  .pv-lane { padding-inline-end: 0; }
}
`;

export function PreviewApp() {
  return (
    <PreviewShell>
      <Stack gap="6">
        <Stack gap="3">
          <Heading size="8" render={<h1 />}>
            Playground
          </Heading>
          <Text emphasis="medium" render={<p />} style={{ maxWidth: "36rem" }}>
            Every shipped component, every axis — and, first, real screens made only of
            them. The panel moves whole worlds, including its own, and nothing on this
            page picks a colour or invents a length.
          </Text>
        </Stack>
        {/* Twenty sections is more than a page can be scrolled through by guess.
            Quiet buttons rendered as anchors: the index is made of the system too.

            The label above the chips is the ENVIRONMENT PANEL's own arrangement, reused
            (2026-08-09): the page already has an idiom for "a labelled group of chips",
            and a second, unlabelled wrap of the same buttons read as stray links under
            the lede rather than as an index. One idiom, twice. */}
        <Stack gap="2" render={<nav aria-label="Sections" />}>
          <Text size="2" emphasis="quiet" id="pv-jump">
            Jump to
          </Text>
          <Flex gap="1" wrap="wrap" aria-labelledby="pv-jump">
            {[{ id: "showcase", name: "Real screens" }, ...SECTIONS].map((section) => (
              <Button
                key={section.id}
                size="1"
                emphasis="quiet"
                render={<a href={`#${section.id}`} />}
              >
                {section.name}
              </Button>
            ))}
          </Flex>
        </Stack>
      </Stack>
      <Showcase />
      {SECTIONS.map((section) => (
        // The boundary is the component, not a borrowed borderTop — the playground
        // dogfoods the hairline it demonstrates. Its own Separator section sits a
        // few boundaries down the very rules that frame it.
        <React.Fragment key={section.id}>
          <Separator />
          <Stack gap="6" render={<section id={section.id} />}>
            <Flex gap="3" align="center" justify="space-between" wrap="wrap">
              <Heading size="7" render={<h2 />}>
                {section.name}
              </Heading>
              {/* A ported component has a standalone page — the one performance checks and
                  deep judging run on. The collection stays the walk-through. */}
              {section.standalone ? <StandaloneLink slug={section.standalone} /> : null}
            </Flex>
            {section.body}
          </Stack>
        </React.Fragment>
      ))}
    </PreviewShell>
  );
}

/**
 * The shell every preview route shares (2026-08-19): the canvas Theme, the environment
 * panel, the lane. Extracted the day the per-component pages landed — a standalone page
 * with its own panel copy would be the panel drift the derivation laws exist to catch,
 * one file over.
 */
export function PreviewShell({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = React.useState<Env>(DEFAULT_ENV);

  return (
    <Theme
      {...(env.appearance === "inherit" ? {} : { appearance: env.appearance })}
      density={env.density}
      pointer={env.pointer}
      radius={env.radius}
      depth={env.depth}
      material={env.material}
      size={env.size}
    >
      {/* The canvas paints a page itself so a pinned appearance is a real page, not dark
          specimens floating on a light bed. The panel lives INSIDE the canvas Theme on
          purpose: its glass has to seal against the world it controls — a light toolbar over
          a pinned-dark canvas is unreadable murk (found on sight).

          The page is --color-page (2026-08-25, Kushagra — the role, not a palette step). It
          was --neutral-1 from 2026-08-10 (reversing the seal it was set to on 2026-08-09,
          because a page that is also the seal made every surface argue with its own bed), but
          --color-page did not exist then; the role landed 2026-08-20 and in light it is now
          the seal's own white by his 2026-08-25 call — separation is cast and hairline, which
          is exactly what a real app's page shows, so the judging surface paints the role and
          tracks it. The system still paints no page background of its own — no `.kui-theme`
          rule sets one — so this is the app's call either way. */}
      <style>{LANE_CSS}</style>
      <Box style={{ background: "var(--color-page)", color: "var(--color-text)", minHeight: "100dvh" }}>
        <EnvPanel env={env} onChange={setEnv} />
        <Box px="6" pb="9" className="pv-lane">
          {/* 60rem, not the earlier 1120px: the densest table is ~850px intrinsic, so the wider
              cap bought nothing but a ragged void between the specimens and the panel — the
              page read unconstrained because most of it was empty width (Kushagra, 2026-08-08). */}
          <Box style={{ maxWidth: "60rem", marginInline: "auto" }}>
            <Stack gap="8" pt="8">
              {children}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Theme>
  );
}
