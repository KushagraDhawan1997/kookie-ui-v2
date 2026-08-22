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
 * HOW SHORT THE CLOCKS MAY GO (2026-08-23, re-measured). This paragraph used to say that
 * shortening the floating clocks was not a pure config change, because it re-exposed the
 * select's item-aligned jump: the entry scales the CONTENT down while the box grows, the two
 * sizes cross for a few frames in the middle, the maximum scroll offset is momentarily zero,
 * and the browser clamps the placement away. That is no longer reachable — the placement
 * stopped being a scroll position for the length of the flight (it is carried as a negative
 * margin on the body, which nothing can clamp), so the crossing has nothing to take.
 *
 * Re-measured in a real browser on `/preview/select`, three fixtures (a 48-row list, a short
 * list opening near the window's top edge, a trigger against an edge) at window heights 420
 * and 620, sampling the chosen row's distance from its trigger per frame:
 *
 *   1.00x   offset spread 0, lands 2px off, no movement after landing
 *   0.70x   offset spread 0, lands 3px off, no movement after landing
 *   0.55x   offset spread 0, lands 5px off, 1-2px of creep after landing
 *   0.40x   offset spread 0, lands 4px off, 3-7px of creep after landing
 *
 * So a cut of about a THIRD is free, and the numbers here are real config values. Below
 * roughly 0.6x the panel starts finishing its growth after the entry says it has landed, and
 * the chosen row crawls the last few pixels — small, but it is the reported defect returning
 * in miniature. If a shorter clock is what the eye wants, that is a real bug to fix, not a
 * bound to widen.
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
 * THE SPRINGS, and the reason they are handled differently from everything above.
 *
 * A clock is a number in the document and the panel can simply write a different number. A
 * spring is not: what ships is a `linear()` curve, thirty-odd samples of a damped step
 * response that the generator computed from two numbers in `config.springs` — `zeta`, the
 * damping ratio, and `omega`, the frequency. Those two numbers are nowhere in the document,
 * so a slider over them would need its own copy of them, which is the second home this whole
 * panel exists to avoid.
 *
 * It does not need one. The curve carries them. A damped step response overshoots by exactly
 * `exp(-pi * zeta / sqrt(1 - zeta^2))` and peaks at `pi / (omega * sqrt(1 - zeta^2))`, so
 * reading the curve's highest sample and where it sits inverts back to the pair that made it.
 * Checked against the shipped values: elastic recovers 0.620 / 10.78 against a config of
 * 0.62 / 10.835, poised 0.800 / 8.77 against 0.8 / 8.75. The residual is the peak falling
 * between two samples, and it is smaller than any value anyone would judge by eye.
 *
 * So the baseline still comes off the document, the readout is a real `zeta` that pastes into
 * `config.springs`, and dragging back to 1.0 restores exactly what the package ships.
 */
const SPRINGS = [
  { prop: "--motion-spring-elastic", key: "elastic", note: "menu, select, alert — the entry" },
  { prop: "--motion-spring-poised", key: "poised", note: "dialog — the heavy entry" },
  { prop: "--motion-spring-lively", key: "lively", note: "controls recovering" },
];

type Spring = { zeta: number; omega: number; steps: number };

/**
 * Invert a shipped `linear()` back into the spring that made it. Returns null for a curve with
 * no overshoot inside its own window — `stiff` is one, by design — because there is then no
 * peak to solve from, and equally nothing anyone would call elasticity to remove.
 */
function readSpring(curve: string): Spring | null {
  const open = curve.indexOf("(");
  if (open < 0) return null;
  const body = curve.slice(open + 1, curve.lastIndexOf(")"));
  const points = body.split(",").map((chunk) => Number(chunk.trim().split(/\s+/)[0]));
  if (points.length < 6) return null;
  const steps = points.length - 1;

  let peakAt = 0;
  for (let i = 1; i < points.length; i++) if (points[i]! > points[peakAt]!) peakAt = i;
  if (peakAt === 0 || peakAt === points.length - 1) return null;

  // The peak sits BETWEEN two samples, so it is refined by fitting a parabola through the
  // three around it — without this the recovered omega is out by a few percent, which is
  // enough to make "reset" not quite restore what shipped.
  const [a, b, c] = [points[peakAt - 1]!, points[peakAt]!, points[peakAt + 1]!];
  const curvature = a - 2 * b + c;
  const offset = curvature !== 0 ? (0.5 * (a - c)) / curvature : 0;
  const peak = b - 0.25 * (a - c) * offset;
  if (peak <= 1) return null;

  const ln = Math.log(peak - 1);
  const zeta = -ln / Math.sqrt(Math.PI * Math.PI + ln * ln);
  const omega = Math.PI / (((peakAt + offset) / steps) * Math.sqrt(1 - zeta * zeta));
  return { zeta, omega, steps };
}

/**
 * …and back to a curve. This is `springCurve` in `tokens/generate.ts`, deliberately re-stated
 * rather than imported: that file is a build-time generator reaching into config, and a dev
 * panel importing it would drag the whole token pipeline into the client bundle. The one
 * addition is the critically damped case, which the generator never needs because no shipped
 * spring sits there — at zeta = 1 the damped frequency is zero and the general form divides by
 * it, so the limit is stated instead. That case IS the "no elasticity" end of the slider.
 */
function writeSpring({ zeta, omega, steps }: Spring): string {
  const trim = (n: number, places: number) => String(Number(n.toFixed(places)));
  const critical = zeta >= 0.999;
  const damped = critical ? 0 : omega * Math.sqrt(1 - zeta * zeta);
  const points = ["0"];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = critical
      ? 1 - Math.exp(-omega * t) * (1 + omega * t)
      : 1 -
        Math.exp(-zeta * omega * t) *
          (Math.cos(damped * t) + ((zeta * omega) / damped) * Math.sin(damped * t));
    points.push(`${trim(x, 3)} ${trim(t * 100, 2)}%`);
  }
  points.push("1 100%");
  return `linear(${points.join(", ")})`;
}

/** What a damping ratio actually overshoots by, so the panel can show the bounce as the
    percentage a person sees rather than as the physics constant behind it. */
function overshoot(zeta: number): number {
  if (zeta >= 0.999) return 0;
  return Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta * zeta)) * 100;
}

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
  /** The springs, recovered from the document once, beside the clocks they share a panel with. */
  const [baseSprings, setBaseSprings] = React.useState<Record<string, Spring | null>>({});
  /** 1.0 is what ships; 0 is critically damped, which is the spring with its bounce taken out
      rather than the spring replaced by an ease. Per-spring overrides sit under "Tune each". */
  const [bounce, setBounce] = React.useState(1);
  const [eachZeta, setEachZeta] = React.useState<Record<string, number>>({});
  /** Per-token overrides, in the token's own unit. Absent means "whatever the multipliers
      say", which is what keeps the two layers from fighting. */
  const [each, setEach] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const read: Record<string, string> = {};
    for (const k of ALL) read[k.prop] = cs.getPropertyValue(k.prop).trim();
    setBase(read);
    const sp: Record<string, Spring | null> = {};
    for (const k of SPRINGS) sp[k.prop] = readSpring(cs.getPropertyValue(k.prop).trim());
    setBaseSprings(sp);
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

  /** A damping ratio between what ships and critically damped. At bounce = 1 this IS the
      shipped number, so the reset below restores the curve byte for byte. */
  const zetaOf = (prop: string): number | null => {
    const b = baseSprings[prop];
    if (!b) return null;
    return eachZeta[prop] ?? b.zeta + (1 - b.zeta) * (1 - bounce);
  };

  React.useEffect(() => {
    const root = document.documentElement;
    let wrote = false;
    // AT REST, WRITE NOTHING. The recovered omega carries about half a percent of rounding
    // against the config that produced it, so re-emitting the curve at bounce = 1 would leave
    // the document holding a near-copy of what it already had — close enough to look right and
    // wrong enough to make "reset" a lie. Untouched is exact.
    if (bounce === 1 && !Object.keys(eachZeta).length) return;
    for (const k of SPRINGS) {
      const b = baseSprings[k.prop];
      const z = zetaOf(k.prop);
      if (!b || z === null) continue;
      wrote = true;
      root.style.setProperty(k.prop, writeSpring({ ...b, zeta: z }));
    }
    if (!wrote) return;
    return () => {
      for (const k of SPRINGS) root.style.removeProperty(k.prop);
    };
  }, [baseSprings, bounce, eachZeta]);

  const current = (k: Knob) =>
    each[k.prop] ??
    Math.round(readNumber(base?.[k.prop] ?? "0", !!k.scaled) * (k.scaled ? travel : clock));

  const reset = () => {
    setClock(1);
    setTravel(1);
    setBounce(1);
    setEach({});
    setEachZeta({});
  };

  /** What to paste into config.ts. Grouped exactly as the config groups it, because a readout
      the reader has to re-sort is a readout they will mis-transcribe. */
  const configText = () => {
    const line = (k: Knob) => `  ${k.key}: ${current(k)},`;
    const loose = (k: Knob) => `export const ${k.key} = ${current(k)};`;
    const clocksOf = (set: Knob[]) => set.filter((k) => !k.scaled).map(line).join("\n");
    const sizesOf = (set: Knob[]) => set.filter((k) => k.scaled).map(loose).join("\n");
    const springLines = SPRINGS.map((k) => {
      const b = baseSprings[k.prop];
      const z = zetaOf(k.prop);
      if (!b || z === null) return null;
      return `  ${k.key}: { zeta: ${Number(z.toFixed(3))}, omega: ${Number(b.omega.toFixed(3))}, steps: ${b.steps} },`;
    }).filter(Boolean);
    return [
      "// floatingMotion (§22)",
      clocksOf(FLOATING),
      sizesOf(FLOATING),
      "",
      "// overlayMotion (§24)",
      clocksOf(OVERLAY),
      sizesOf(OVERLAY),
      "",
      "// springs (§8) — omega is recovered from the shipped curve, so it carries a",
      "// rounding of about half a percent against the config it came from.",
      ...springLines,
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
          Floating clocks are safe to about 0.7&times;. Below roughly 0.6&times; a select&rsquo;s
          chosen row crawls the last few pixels after the entry has landed &mdash; judge here
          freely, but a number under that is a bug to fix rather than a value to ship.
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

        <Slider
          label="bounce"
          value={bounce}
          min={0}
          max={1}
          step={0.05}
          suffix="\u00d7"
          onChange={(n) => {
            setBounce(n);
            setEachZeta({});
          }}
        />
        <Text size="1" emphasis="quiet">
          {(() => {
            const z = zetaOf("--motion-spring-elastic");
            if (z === null) return "springs not read yet";
            const o = overshoot(z);
            return o < 0.05
              ? `entry spring \u03b6 ${z.toFixed(2)} \u2014 no overshoot, it arrives and stops`
              : `entry spring \u03b6 ${z.toFixed(2)} \u2014 overshoots ${o.toFixed(1)}%`;
          })()}
        </Text>

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
            <Separator />
            <Text size="1" emphasis="quiet">
              springs — damping ratio. 1.0 is critically damped: no overshoot at all.
            </Text>
            {SPRINGS.map((k) => {
              const z = zetaOf(k.prop);
              if (z === null) return null;
              return (
                <React.Fragment key={k.prop}>
                  <Slider
                    label={`${k.key} \u03b6`}
                    value={z}
                    min={0.4}
                    max={1}
                    step={0.01}
                    suffix=""
                    onChange={(n) => setEachZeta((e) => ({ ...e, [k.prop]: n }))}
                  />
                  <Text size="1" emphasis="quiet">
                    {k.note} — overshoots {overshoot(z).toFixed(1)}%
                  </Text>
                </React.Fragment>
              );
            })}
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
