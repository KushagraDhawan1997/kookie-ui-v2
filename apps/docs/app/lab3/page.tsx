"use client";

/**
 * Lab 3 — the LOCKED Stacked recipe (lab 1, 2026-08-14) rendered in lab 2's scenes,
 * so the lock and the free-reign recipe are judged on identical ground. SCRATCH.
 */

import { Button, Flex, Heading, Stack, Text, Theme } from "@kookie-ui/react";

import "./lab3.css";

function CardText({ title, line }: { title: string; line: string }) {
  return (
    <Stack gap="1">
      <Text render={<div />} size="3" weight="semibold">
        {title}
      </Text>
      <Text render={<div />} size="2" emphasis="medium">
        {line}
      </Text>
    </Stack>
  );
}

function HeroCard({
  material,
  title,
  line,
  actions = false,
}: {
  material: string;
  title: string;
  line: string;
  actions?: boolean;
}) {
  const glass = material !== "solid";
  return (
    <div className={`l3-card ${glass ? `l3-glass l3-${material}` : "l3-solid"}`}>
      <Stack gap="3">
        <CardText title={title} line={line} />
        {actions ? (
          <Flex gap="2">
            <Button size="2" tone="accent" emphasis="loud">
              Open
            </Button>
            <Button size="2" emphasis="quiet">
              Later
            </Button>
          </Flex>
        ) : null}
      </Stack>
    </div>
  );
}

const TILES = [
  "linear-gradient(135deg, var(--blue-9), var(--blue-11))",
  "linear-gradient(135deg, var(--orange-9), var(--amber-9))",
  "linear-gradient(135deg, var(--green-9), var(--blue-9))",
  "linear-gradient(135deg, var(--amber-9), var(--orange-11))",
  "linear-gradient(135deg, var(--blue-11), var(--green-9))",
  "linear-gradient(135deg, var(--orange-11), var(--blue-9))",
];

function River() {
  const run = [...TILES, ...TILES];
  return (
    <div className="l3-scene">
      <div className="l3-track">
        {run.map((bg, i) => (
          <div key={i} className="l3-tile" style={{ background: bg }} />
        ))}
      </div>
      <div className="l3-toolbar l3-glass l3-regular">
        <Button size="2" emphasis="quiet">
          Library
        </Button>
        <Button size="2" emphasis="quiet">
          For You
        </Button>
        <Button size="2" tone="accent" emphasis="loud">
          Play
        </Button>
      </div>
    </div>
  );
}

function Panel({ appearance }: { appearance: "light" | "dark" }) {
  return (
    <Theme appearance={appearance}>
      <div className="l3-panel">
        <div className="l3-strip-label">
          <Text size="2" emphasis="quiet">
            The backdrop drifts — the locked recipe at its most alive
          </Text>
        </div>
        <div className="l3-hero">
          <HeroCard material="thin" title="Quick Look" line="Thin — the lightest touch." />
          <HeroCard
            material="regular"
            title="Now Playing"
            line="Regular — the default, as locked."
            actions
          />
          <HeroCard
            material="thick"
            title="Notifications"
            line="Thick — the most protected read."
          />
          <HeroCard material="solid" title="Details" line="Solid — matte. Light lands, none passes." />
        </div>
        <div className="l3-strip-label">
          <Text size="2" emphasis="quiet">
            The river — content slides under the glass
          </Text>
        </div>
        <River />
        <div className="l3-strip-label">
          <Text size="2" emphasis="quiet">
            Tinted glass — the locked edge on a toned veil
          </Text>
        </div>
        <div className="l3-hero">
          <div className="l3-card l3-glass l3-regular l3-tint l3-tint-blue">
            <CardText title="Calendar" line="Wednesday, 3 events." />
          </div>
          <div className="l3-card l3-glass l3-regular l3-tint l3-tint-green">
            <CardText title="Fitness" line="Ring closed. 12,400 steps." />
          </div>
          <div className="l3-card l3-glass l3-regular l3-tint l3-tint-orange">
            <CardText title="Timer" line="14:32 remaining." />
          </div>
        </div>
        <div className="l3-strip-label">
          <Text size="2" emphasis="quiet">
            The calm bed — glass over nothing quietly reads as solid
          </Text>
        </div>
        <div className="l3-calm">
          <HeroCard material="regular" title="Regular" line="On a calm page." actions />
          <HeroCard material="solid" title="Solid" line="On a calm page." actions />
        </div>
      </div>
    </Theme>
  );
}

export default function Lab3Page() {
  return (
    <div className="l3">
      <Stack gap="2" p="5">
        <Heading size="4">The locked recipe — lab 3</Heading>
        <Text size="2" emphasis="medium">
          Lab 1&apos;s lock, verbatim, in lab 2&apos;s scenes: uniform 100% ring in light, 15% in
          dark, plain blur with no saturation, diffuse blast by opacity, matte solid.
        </Text>
      </Stack>
      <Panel appearance="light" />
      <Panel appearance="dark" />
    </div>
  );
}
