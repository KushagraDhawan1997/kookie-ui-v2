"use client";

/**
 * The motion bench (2026-08-22, Kushagra: "do it in a way where I can iterate fast").
 *
 * Every number the floating and overlay entries are made of is a plain custom property on
 * `:root` — `--floating-fall`, `--overlay-materialize`, and so on — so the whole of both
 * animations can be re-timed at runtime by writing those properties, with no rebuild and no
 * token regeneration. That is what this panel does. Open a menu, drag a slider, open it
 * again.
 *
 * Two things make it honest rather than a second home for the numbers:
 *
 * 1. It READS its baseline off the document, never a copy of `config.ts`. What the sliders
 *    start at is whatever the package currently ships, so this panel cannot go stale and
 *    cannot disagree with the build (the drift every axis list in this app was exported to
 *    end).
 * 2. It writes to `document.documentElement`, not to the canvas `<Theme>`. Popups PORTAL to
 *    the body, so a value written on the canvas would reach every specimen except the ones
 *    being judged.
 *
 * The output is config text, not a saved setting. Nothing here persists: the bench is for
 * finding numbers, and the numbers land in `packages/ui/src/tokens/config.ts` where they
 * have always lived. Delete this file the day the values are judged and nothing else moves.
 *
 * ONE THING TO KNOW BEFORE PASTING (2026-08-22). Shortening the floating clocks is not yet a
 * pure config change: it re-exposes the select's item-aligned jump by a different road. The
 * entry scales the CONTENT down while the box grows, and a scaled element contributes its
 * scaled size to the scrollable overflow — so `scrollHeight` climbs across the flight while
 * `clientHeight` climbs faster. Shorten the box clocks and the two CROSS for a few frames in
 * the middle, the maximum scroll offset is momentarily zero, and the browser clamps the
 * placement away. Measured at roughly a 30% cut: `scrollHeight` 460 → 920 against
 * `clientHeight` 30 → 778, crossing at frames 11–13, and the select law fails on it.
 *
 * So: tune freely here, and the numbers are real. They land in config once that crossing is
 * dealt with — the offset has to stop being a scroll position for the length of the flight.
 */
import * as React from "react";
import { Button, Card, Flex, Heading, Separator, Stack, Text } from "@kookie-ui/react";

/**
 * The tokens, grouped as the config groups them. `key` is the field name in `config.ts`, so
 * the readout below can be pasted straight in — the panel's whole job is to end at a diff.
 *
 * `scaled` marks a distance rather than a clock: those ship as `calc(<n>px * var(--scale))`,
 * so the number has to be swapped inside the expression rather than replacing it.
 */
type Knob = { prop: string; key: string; scaled?: boolean };

const FLOATING: Knob[] = [
  { prop: "--floating-fall", key: "fall" },
  { prop: "--floating-spread", key: "spread" },
  { prop: "--floating-corner", key: "corner" },
  { prop: "--floating-reveal", key: "reveal" },
  { prop: "--floating-reveal-delay", key: "revealDelay" },
  { prop: "--floating-dissolve", key: "dissolve" },
  { prop: "--floating-settle", key: "settle" },
  { prop: "--floating-seed", key: "floatingSeed", scaled: true },
  { prop: "--floating-echo", key: "floatingEcho", scaled: true },
];

const OVERLAY: Knob[] = [
  { prop: "--overlay-materialize", key: "materialize" },
  { prop: "--overlay-fall", key: "fall" },
  { prop: "--overlay-spread", key: "spread" },
  { prop: "--overlay-reveal", key: "reveal" },
  { prop: "--overlay-reveal-delay", key: "revealDelay" },
  { prop: "--overlay-print", key: "print" },
  { prop: "--overlay-dissolve", key: "dissolve" },
  { prop: "--overlay-settle", key: "settle" },
  { prop: "--overlay-seed", key: "overlaySeed", scaled: true },
  { prop: "--overlay-lift", key: "overlayLift", scaled: true },
  { prop: "--overlay-echo", key: "overlayEcho", scaled: true },
];

const ALL = [...FLOATING, ...OVERLAY];

/**
 * A token's number, in the unit the CONFIG states it in — milliseconds for a clock, pixels
 * for a distance.
 *
 * The conversion is the whole reason this is a function rather than a regex at the call site.
 * These tokens are `@property`-registered, so `getComputedStyle` returns a COMPUTED value:
 * `460ms` comes back as `0.46s`, and `calc(44px * var(--scale))` comes back with the scale
 * already resolved. The first cut parsed the leading number and rounded it, which turned
 * every clock into `0s` — the panel wrote real CSS that switched the animations off, and it
 * looked like a working bench until the values were read back.
 */
function readNumber(value: string, scaled: boolean): number {
  const m = value.match(/(-?[\d.]+)\s*(m?s|px)?/);
  if (!m) return 0;
  const n = Number(m[1]);
  return !scaled && m[2] === "s" ? Math.round(n * 1000) : Math.round(n);
}

/**
 * …and back out, always in the unit the config states, never in whatever the computed value
 * happened to use. A distance is rewritten around `var(--scale)` rather than around the
 * resolved factor the computed value carries, so a bench value keeps answering the pointer
 * axis the way the shipped token does.
 */
function writeNumber(n: number, scaled: boolean): string {
  return scaled ? `calc(${n}px * var(--scale))` : `${n}ms`;
}

/** A labelled slider — the panel's one control, so the two multipliers and the eighteen
    individual knobs read as the same kind of thing. */
function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (next: number) => void;
}) {
  const id = `mb-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <Stack gap="1">
      <Flex justify="space-between" align="baseline" gap="3">
        <Text size="1" emphasis="quiet" render={<label htmlFor={id} />}>
          {label}
        </Text>
        <Text size="1" emphasis="medium">
          {Math.round(value * 100) / 100}
          {suffix}
        </Text>
      </Flex>
      {/* A NATIVE range, deliberately: the package's Slider is a judged specimen on this very
          page, and driving the bench with the thing under test makes a change to it read as a
          change to the bench. Dev chrome, not a composition. */}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ width: "100%" }}
      />
    </Stack>
  );
}

export function MotionPanel() {
  const [open, setOpen] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  /** The shipped values, read once off the document — the baseline every multiplier is a
      multiple OF, so dragging back to 1.0 restores exactly what the package ships. */
  const [base, setBase] = React.useState<Record<string, string> | null>(null);
  const [clock, setClock] = React.useState(1);
  const [travel, setTravel] = React.useState(1);
  /** Per-token overrides, in the token's own unit. Absent means "whatever the multipliers
      say", which is what keeps the two layers from fighting. */
  const [each, setEach] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const read: Record<string, string> = {};
    for (const k of ALL) read[k.prop] = cs.getPropertyValue(k.prop).trim();
    setBase(read);
  }, []);

  /** Every write lands on <html>, because the panels being judged are portalled out of the
      canvas and would never see a value written on it. */
  React.useEffect(() => {
    if (!base) return;
    const root = document.documentElement;
    for (const k of ALL) {
      const shipped = readNumber(base[k.prop]!, !!k.scaled);
      const n = each[k.prop] ?? Math.round(shipped * (k.scaled ? travel : clock));
      root.style.setProperty(k.prop, writeNumber(n, !!k.scaled));
    }
    return () => {
      for (const k of ALL) root.style.removeProperty(k.prop);
    };
  }, [base, clock, travel, each]);

  const current = (k: Knob) =>
    each[k.prop] ??
    Math.round(readNumber(base?.[k.prop] ?? "0", !!k.scaled) * (k.scaled ? travel : clock));

  const reset = () => {
    setClock(1);
    setTravel(1);
    setEach({});
  };

  /** What to paste into config.ts. Grouped exactly as the config groups it, because a readout
      the reader has to re-sort is a readout they will mis-transcribe. */
  const configText = () => {
    const line = (k: Knob) => `  ${k.key}: ${current(k)},`;
    const loose = (k: Knob) => `export const ${k.key} = ${current(k)};`;
    const clocksOf = (set: Knob[]) => set.filter((k) => !k.scaled).map(line).join("\n");
    const sizesOf = (set: Knob[]) => set.filter((k) => k.scaled).map(loose).join("\n");
    return [
      "// floatingMotion (§22)",
      clocksOf(FLOATING),
      sizesOf(FLOATING),
      "",
      "// overlayMotion (§24)",
      clocksOf(OVERLAY),
      sizesOf(OVERLAY),
    ].join("\n");
  };

  if (!open) {
    return (
      <Button size="1" emphasis="quiet" bordered onClick={() => setOpen(true)}>
        Motion bench
      </Button>
    );
  }

  return (
    <Card size="2">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="3">
          <Heading size="2" render={<h2 />}>
            Motion bench
          </Heading>
          <Button size="1" emphasis="quiet" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Flex>
        <Text size="1" emphasis="medium">
          Live, unsaved, and written to the document so portalled panels see it. Open a menu,
          a select or an alert while dragging.
        </Text>
        <Text size="1" emphasis="medium">
          Shorter floating clocks currently re-expose the select&rsquo;s jump on a long list —
          the box outgrows its own scaled content mid-flight and the placement is clamped away.
          Judge here freely; the numbers land in config once that is fixed.
        </Text>

        <Slider
          label="clocks"
          value={clock}
          min={0.3}
          max={1.6}
          step={0.05}
          suffix="×"
          onChange={(n) => {
            setClock(n);
            setEach({});
          }}
        />
        <Slider
          label="travel"
          value={travel}
          min={0.3}
          max={1.6}
          step={0.05}
          suffix="×"
          onChange={(n) => {
            setTravel(n);
            setEach({});
          }}
        />

        <Flex gap="2" align="center" wrap="wrap">
          <Button size="1" emphasis="quiet" bordered onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Hide each" : "Tune each"}
          </Button>
          <Button size="1" emphasis="quiet" bordered onClick={reset}>
            Reset
          </Button>
          <Button
            size="1"
            emphasis="quiet"
            bordered
            onClick={() => void navigator.clipboard?.writeText(configText())}
          >
            Copy config
          </Button>
        </Flex>

        {showAll ? (
          <Stack gap="4">
            <Separator />
            <Text size="1" emphasis="quiet">
              floating — menu, select
            </Text>
            {FLOATING.map((k) => (
              <Slider
                key={k.prop}
                label={k.key}
                value={current(k)}
                min={0}
                max={k.scaled ? 120 : 1200}
                step={k.scaled ? 1 : 10}
                suffix={k.scaled ? "px" : "ms"}
                onChange={(n) => setEach((e) => ({ ...e, [k.prop]: n }))}
              />
            ))}
            <Separator />
            <Text size="1" emphasis="quiet">
              overlay — alert dialog
            </Text>
            {OVERLAY.map((k) => (
              <Slider
                key={k.prop}
                label={k.key}
                value={current(k)}
                min={0}
                max={k.scaled ? 120 : 1200}
                step={k.scaled ? 1 : 10}
                suffix={k.scaled ? "px" : "ms"}
                onChange={(n) => setEach((e) => ({ ...e, [k.prop]: n }))}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
