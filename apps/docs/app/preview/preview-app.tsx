"use client";

/**
 * The playground: the Radix Themes playground's structure in this system's vocabulary. One
 * long page, every component in alphabetical order, dense specimen tables — and the theme
 * panel is OUR panel: the seven Theme axes, switchable in place, landing on one nested
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
  Stack,
  Text,
  Theme,
  windowClassQueries,
  type ThemeProps,
} from "@kookie-ui/react";

import { setContrast, useAppearance, type ContrastChoice } from "../appearance";
import { SECTIONS } from "./specimens";

type Env = {
  appearance: "inherit" | "light" | "dark";
  density: NonNullable<ThemeProps["density"]>;
  pointer: NonNullable<ThemeProps["pointer"]>;
  radius: NonNullable<ThemeProps["radius"]>;
  look: NonNullable<ThemeProps["look"]>;
  surfaces: NonNullable<ThemeProps["surfaces"]>;
};

const DEFAULT_ENV: Env = {
  appearance: "inherit",
  density: "default",
  pointer: "auto",
  radius: "medium",
  look: "outlined",
  surfaces: "flat",
};

const AXES: { [K in keyof Env]: readonly Env[K][] } = {
  appearance: ["inherit", "light", "dark"],
  density: ["compact", "default", "comfortable"],
  pointer: ["auto", "fine", "coarse"],
  radius: ["none", "small", "medium", "large", "full"],
  look: ["outlined", "filled"],
  surfaces: ["flat", "elevated"],
};

const CONTRASTS = ["auto", "normal", "high"] as const satisfies readonly ContrastChoice[];

const hairline = "1px solid var(--color-border)";

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
      <Text size="1" emphasis="quiet" id={groupId}>
        {label}
      </Text>
      <Flex gap="1" align="center" wrap="wrap" role="group" aria-labelledby={groupId}>
        {options.map((option) => (
          <Button
            key={option}
            size="1"
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
        insetInlineEnd: "24px",
        insetBlockStart: "24px",
        width: "300px",
        maxHeight: "calc(100dvh - 48px)",
        overflowY: "auto",
        zIndex: 10,
      }}
      render={<aside aria-label="Environment" />}
    >
      <Card size="2">
        <Stack gap="5">
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
            label="look"
            value={env.look}
            options={AXES.look}
            onChange={(look) => onChange({ ...env, look })}
          />
          <Chips
            label="surfaces"
            value={env.surfaces}
            options={AXES.surfaces}
            onChange={(surfaces) => onChange({ ...env, surfaces })}
          />
          <Chips label="contrast" value={contrast} options={CONTRASTS} onChange={setContrast} />
          <Flex gap="1" align="center">
            <Button
              size="1"
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
            <Button size="1" emphasis="quiet" render={<Link href="/" />}>
              Docs
            </Button>
          </Flex>
        </Stack>
      </Card>
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
.pv-lane { padding-inline-end: 364px; }
@media ${windowClassQueries.narrow} {
  .pv-panel { position: static; width: auto; max-height: none; margin-block-end: var(--layout-space-6); }
  .pv-lane { padding-inline-end: 0; }
}
`;

export function PreviewApp() {
  const [env, setEnv] = React.useState<Env>(DEFAULT_ENV);

  return (
    <Theme
      {...(env.appearance === "inherit" ? {} : { appearance: env.appearance })}
      density={env.density}
      pointer={env.pointer}
      radius={env.radius}
      look={env.look}
      surfaces={env.surfaces}
    >
      {/* The canvas paints the page role itself so a pinned appearance is a real page,
          not dark specimens floating on a light bed. The panel lives INSIDE the canvas
          Theme on purpose: its glass has to seal against the world it controls — a light
          toolbar over a pinned-dark canvas is unreadable murk (found on sight). */}
      <style>{LANE_CSS}</style>
      <Box style={{ background: "var(--neutral-1)", color: "var(--color-text)", minHeight: "100dvh" }}>
        <EnvPanel env={env} onChange={setEnv} />
        <Box px="6" pb="9" className="pv-lane">
          <Box style={{ maxWidth: "1120px", marginInline: "auto" }}>
            <Stack gap="8" pt="7">
              <Stack gap="2">
                <Heading size="6" render={<h1 />}>
                  Playground
                </Heading>
                <Text size="2" emphasis="medium" render={<p />} style={{ maxWidth: "44rem" }}>
                  Every shipped component, every axis. The panel moves whole worlds — including
                  its own — and the specimens below are ordinary call sites that never pick a
                  colour.
                </Text>
              </Stack>
              {SECTIONS.map((section) => (
                <Stack
                  key={section.id}
                  gap="6"
                  pt="7"
                  style={{ borderTop: hairline }}
                  render={<section id={section.id} />}
                >
                  <Heading size="4" render={<h2 />}>
                    {section.name}
                  </Heading>
                  {section.body}
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Theme>
  );
}
