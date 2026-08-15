"use client";

/**
 * The solid-material lab — a SCRATCH surface, never shipped.
 *
 * Judges the proposed lit treatment for the solid material on Card before any of it
 * becomes config: edge derived from the fill (top toward light, bottom toward shadow,
 * ring toward ink), an optional whisper of face light, and the cast as the depth rung's
 * grant. Four sliders write the candidate numbers live; both modes render side by side;
 * the beds are hostile on purpose (white card on the white page is the hard case).
 *
 * When the numbers settle they move into config.ts and this route dies.
 */

import { useState } from "react";
import { Button, Flex, Heading, Slider, Stack, Text, Theme } from "@kookie-ui/react";

import "./lab.css";

type Rung = "r0" | "r1" | "r2";

const COLUMNS: { key: string; label: string; note: string }[] = [
  { key: "solid", label: "Solid", note: "opt-in — matte: light lands, no rim, nothing passes" },
  { key: "thin", label: "Thin", note: "most light passes" },
  { key: "regular", label: "Regular", note: "the proposed default" },
  { key: "thick", label: "Thick", note: "least light passes" },
];

const BEDS: { className: string; label: string }[] = [
  { className: "lab-bed-page", label: "On the page (neutral-2 in light, neutral-1 in dark — the rule)" },
  { className: "lab-bed-white", label: "On pure white (the retired hard case)" },
  { className: "lab-bed-tint", label: "On a tinted bed" },
  { className: "lab-bed-backdrop", label: "On the live backdrop" },
];

const RUNGS: { key: Rung; label: string }[] = [
  { key: "r0", label: "Drawn — glass seals to solid, all four identical" },
  { key: "r1", label: "Stacked — surfaces lit, controls flat" },
  { key: "r2", label: "Lit — same card, the buttons lift" },
];

function CardBody({ tall, muted }: { tall: boolean; muted: string }) {
  return (
    <Stack gap={tall ? "2" : "0"}>
      <Text render={<div />} size="2" weight="semibold">
        Solid
      </Text>
      <Text render={<div />} size="2" emphasis="medium" className={muted}>
        A card sitting on the page.
      </Text>
      {tall ? (
        <>
          <Text render={<div />} size="2" emphasis="medium" className={muted}>
            A taller card holds a real paragraph, so the edge treatment is judged against a
            surface with some body to it — the rim has more face to sit above, and the cast
            has more weight to explain.
          </Text>
          <Text render={<div />} size="2" emphasis="quiet" className={muted}>
            Updated 2 days ago · 4 members
          </Text>
          <Flex gap="2" style={{ paddingBlockStart: 4 }}>
            <Button size="2" tone="accent" emphasis="loud">
              Action
            </Button>
            <Button size="2" emphasis="quiet">
              Dismiss
            </Button>
          </Flex>
        </>
      ) : null}
    </Stack>
  );
}

function LabCard({
  rung,
  material = "solid",
  tinted,
  tall = false,
}: {
  rung: Rung;
  material?: string;
  tinted?: boolean;
  tall?: boolean;
}) {
  // The rung's membership rule, made real: at rung 2 the CONTROLS inside the card join the
  // lit world (nested elevated theme lifts the buttons); the card's own paint is identical
  // to rung 1. Rungs 0 and 1 keep controls flat.
  const glass = material !== "solid";
  return (
    <Theme depth={rung === "r2" ? "elevated" : "flat"}>
      <div
        className={`lab-card lab-mat lab-m-${material}${glass ? " lab-glass" : ""} lab-${rung}${tinted ? " lab-tinted" : ""}${tall ? " lab-tall" : ""}`}
      >
        <CardBody tall={tall} muted={tinted ? "lab-muted" : ""} />
      </div>
    </Theme>
  );
}



type Knobs = { top: number; bot: number; ring: number; grad: number };

function Panel({ appearance, knobs }: { appearance: "light" | "dark"; knobs: Knobs }) {
  return (
    <Theme appearance={appearance}>
      <div
        className="lab-panel"
        style={
          {
            "--lab-top-b": knobs.top,
            "--lab-bot-b": knobs.bot,
            "--lab-ring-b": knobs.ring,
            "--lab-grad-b": knobs.grad,
          } as React.CSSProperties
        }
      >
        <Stack gap="0">
          <Flex gap="5" p="6" style={{ paddingBlockEnd: 0 }}>
            {COLUMNS.map((c) => (
              <Stack key={c.key} gap="1" style={{ flex: 1, minWidth: 220 }}>
                <Text size="2" weight="semibold">
                  {c.label}
                </Text>
                <Text size="2" emphasis="medium">
                  {c.note}
                </Text>
              </Stack>
            ))}
          </Flex>
          {BEDS.map((bed) =>
            RUNGS.map((r) => (
              <Stack key={`${bed.className}-${r.key}`} gap="0">
                <Flex p="6" style={{ paddingBlockEnd: 8 }}>
                  <Text size="2" emphasis="quiet">
                    {bed.label} · {r.label}
                  </Text>
                </Flex>
                <div className={`lab-strip ${bed.className}`}>
                  {COLUMNS.map((c) => (
                    <LabCard key={c.key} rung={r.key} material={c.key} tall />
                  ))}
                </div>
              </Stack>
            )),
          )}
          <Stack gap="0">
            <Flex p="6" style={{ paddingBlockEnd: 8 }}>
              <Text size="2" emphasis="quiet">
                Tinted card — the edge must carry the tone, not a grey ring
              </Text>
            </Flex>
            <div className="lab-strip lab-bed-page">
              <div />
              <LabCard rung="r0" tinted />
              <LabCard rung="r1" tinted />
              <LabCard rung="r2" tinted />
            </div>
          </Stack>
        </Stack>
      </div>
    </Theme>
  );
}

function LabSlider({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <Stack gap="1" style={{ flex: 1, minWidth: 180 }}>
      <Flex gap="2" style={{ justifyContent: "space-between" }}>
        <Text size="2" emphasis="medium">
          {label}
        </Text>
        <Text size="2">{value}</Text>
      </Flex>
      <Slider
        aria-label={label}
        min={0}
        max={max}
        step={1}
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </Stack>
  );
}

function KnobRow({
  label,
  knobs,
  onChange,
}: {
  label: string;
  knobs: Knobs;
  onChange: (k: Knobs) => void;
}) {
  return (
    <Flex gap="6" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
      <Text size="2" weight="semibold" style={{ minWidth: 40 }}>
        {label}
      </Text>
      <LabSlider
        label="Top rim (light)"
        value={knobs.top}
        onChange={(v) => onChange({ ...knobs, top: v })}
        max={100}
      />
      <LabSlider
        label="Bottom rim (shadow)"
        value={knobs.bot}
        onChange={(v) => onChange({ ...knobs, bot: v })}
        max={60}
      />
      <LabSlider
        label="Contact shadow (soft)"
        value={knobs.ring}
        onChange={(v) => onChange({ ...knobs, ring: v })}
        max={60}
      />
      <LabSlider
        label="Face light"
        value={knobs.grad}
        onChange={(v) => onChange({ ...knobs, grad: v })}
        max={30}
      />
    </Flex>
  );
}

export default function LabPage() {
  // The candidate numbers, per mode. Each is a percentage the CSS turns into a mix.
  // Defaults judged 2026-08-12 (Kushagra): light leans on the rim and face light,
  // dark keeps the rim modest and drops the bottom shade entirely.
  // LOCKED 2026-08-14 (Kushagra): the edge recipe's judged values.
  const [light, setLight] = useState<Knobs>({ top: 100, bot: 15, ring: 10, grad: 30 });
  const [dark, setDark] = useState<Knobs>({ top: 15, bot: 0, ring: 10, grad: 10 });

  return (
    <div className="lab">
      <div className="lab-controls">
        <Stack gap="3" p="5">
          <Heading size="4">Solid, lit — lab</Heading>
          <KnobRow label="Light" knobs={light} onChange={setLight} />
          <KnobRow label="Dark" knobs={dark} onChange={setDark} />
        </Stack>
      </div>
      <Panel appearance="light" knobs={light} />
      <Panel appearance="dark" knobs={dark} />
    </div>
  );
}
