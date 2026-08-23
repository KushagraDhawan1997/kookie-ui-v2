"use client";

/**
 * The lens bench (2026-08-23, Kushagra: *"I need it to be more glassy! more refracting
 * light"*).
 *
 * Its sibling one file over drives the entry clocks by writing custom properties on the
 * document. The lens cannot be driven that way — it is an SVG filter built in JS from a
 * displacement map, and nothing about it is a custom property. But two of its five levers
 * never touch the map:
 *
 *   `boost`   scales the whole bend         → `feDisplacementMap`'s own `scale`
 *   `fringe`  splits R and B off G          → the three channels' scales, spread around it
 *
 * Both are attributes on filters that already exist in the document, so this panel edits them
 * in place and the change is live on the next paint. The other three — `bezel`, `thickness`
 * and `ior` — are baked into the map's pixels and would need every pane's map regenerated, so
 * they are deliberately not here: what is judged with this bench is HOW MUCH the glass bends
 * and how hard it splits, not the shape of the lip.
 *
 * Honest in the same way the motion bench is: it reads the shipped values off the filters
 * themselves rather than carrying a copy of `refraction.tsx`'s ladder. `scale` on the G
 * channel IS `base`, and R/G − 1 IS the fringe, so both levers can be recovered exactly from
 * any filter in the document and 1.0x restores it.
 *
 * It re-applies to filters minted after a change — a resize, a new pane, a menu opening — via
 * a MutationObserver on the host `<svg>`, because those arrive carrying the config values and
 * would otherwise disagree with the ones already on screen.
 *
 * Nothing persists. The readout is the diff for `refraction.tsx`'s `lens` ladder.
 */
import * as React from "react";
import { Button, Card, Flex, Heading, Stack, Text } from "@kookie-ui/react";

/** The three rungs, in the order the ladder states them. A filter carries no record of which
    rung minted it, so the panel groups by BEND — the rungs are monotone in it by law, and the
    distinct values in the document are therefore the rungs that are on screen. */
type Recovered = { base: number; fringe: number };

function channels(filter: Element): SVGElement[] {
  return [...filter.querySelectorAll<SVGElement>("feDisplacementMap")];
}

/** What a filter is currently set to, read off its own three channels. G is the unsplit bend;
    R sits a fringe above it and B the same below, so either outer channel recovers the split. */
function recover(filter: Element): Recovered | null {
  const [r, g] = channels(filter);
  if (!r || !g) return null;
  const base = parseFloat(g.getAttribute("scale") ?? "");
  const high = parseFloat(r.getAttribute("scale") ?? "");
  if (!Number.isFinite(base) || !Number.isFinite(high) || base === 0) return null;
  return { base, fringe: (high / base - 1) * 100 };
}

function apply(filter: Element, shipped: Recovered, bend: number, fringe: number) {
  const [r, g, b] = channels(filter);
  if (!r || !g || !b) return;
  const base = shipped.base * bend;
  const spread = (shipped.fringe * fringe) / 100;
  r.setAttribute("scale", String(base * (1 + spread)));
  g.setAttribute("scale", String(base));
  b.setAttribute("scale", String(base * (1 - spread)));
}

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
  const id = `lb-${label.replace(/\s+/g, "-").toLowerCase()}`;
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
      {/* A native range, for the reason its twin in the motion bench states: the package's own
          Slider is a judged specimen on this page, and driving the bench with the thing under
          test makes a change to it read as a change to the bench. */}
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

export function LensBench() {
  const [open, setOpen] = React.useState(false);
  const [bend, setBend] = React.useState(1);
  const [fringe, setFringe] = React.useState(1);
  /** The shipped values per filter id, captured the first time each filter is seen — so the
      multipliers are always multiples OF what the package ships, and 1.0x is exact. */
  const shipped = React.useRef(new Map<string, Recovered>());
  const [seen, setSeen] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    const sweep = () => {
      let count = 0;
      for (const filter of document.querySelectorAll("filter[id^='kui-lens']")) {
        const id = filter.id;
        if (!shipped.current.has(id)) {
          const found = recover(filter);
          if (!found) continue;
          shipped.current.set(id, found);
        }
        apply(filter, shipped.current.get(id)!, bend, fringe);
        count += 1;
      }
      setSeen(count);
    };
    sweep();
    // Panes come and go — a resize remints a map, a menu opens, a card is scrolled past — and
    // a filter minted after a drag carries the config values, so it would sit on screen beside
    // the ones this panel has already moved. Watching the host is what keeps the whole document
    // at one setting.
    const host = document.querySelector("svg[aria-hidden='true']");
    if (!host) return;
    const observer = new MutationObserver(sweep);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [open, bend, fringe]);

  const reset = () => {
    setBend(1);
    setFringe(1);
  };

  /**
   * What to change in `refraction.tsx`. The bench moves a MULTIPLIER, and the ladder is stated
   * as physics, so the readout says which lever to move and by how much rather than pretending
   * to hand over three literal rungs it cannot see the names of.
   */
  const readout = () =>
    [
      "// packages/ui/src/system/refraction.tsx — the `lens` ladder",
      "//",
      `// bend  x${Math.round(bend * 100) / 100}  → multiply each rung's \`boost\` (it is 1 on every rung today),`,
      "//        or re-solve `thickness` against a target bend that much higher — the",
      "//        ladder's own comment prefers the second: bought with the model rather",
      "//        than with a multiplier past it.",
      `// fringe x${Math.round(fringe * 100) / 100} → multiply each rung's \`fringe\` (6 / 10 / 16 today):`,
      `//        thin ${Math.round(6 * fringe * 10) / 10}, regular ${Math.round(10 * fringe * 10) / 10}, thick ${Math.round(16 * fringe * 10) / 10}`,
    ].join("\n");

  if (!open) {
    return (
      <Button size="1" emphasis="quiet" bordered onClick={() => setOpen(true)}>
        Lens bench
      </Button>
    );
  }

  return (
    <Card size="2">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="3">
          <Heading size="2" render={<h2 />}>
            Lens bench
          </Heading>
          <Button size="1" emphasis="quiet" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Flex>
        <Text size="1" emphasis="medium">
          Live on every glass pane on the page. Put something busy behind one — the Materials
          section, or a menu over the hostile bed — and drag.
        </Text>

        <Text size="1" emphasis="quiet">
          bend &mdash; how far the glass pushes what is behind it
        </Text>
        <Slider
          label="bend"
          value={bend}
          min={0}
          max={4}
          step={0.05}
          suffix="×"
          onChange={setBend}
        />
        <Text size="1" emphasis="quiet">
          fringe &mdash; how hard the lip splits light into colour
        </Text>
        <Slider
          label="fringe"
          value={fringe}
          min={0}
          max={6}
          step={0.05}
          suffix="×"
          onChange={setFringe}
        />

        <Text size="1" emphasis="quiet">
          {seen} lens{seen === 1 ? "" : "es"} on the page. The lip&rsquo;s WIDTH and the depth
          behind it are baked into each pane&rsquo;s map, so they are not here — tell me a
          number and they land in the ladder.
        </Text>

        <Flex gap="2" align="center" wrap="wrap">
          <Button size="1" emphasis="quiet" bordered onClick={reset}>
            Reset
          </Button>
          <Button
            size="1"
            emphasis="quiet"
            bordered
            onClick={() => void navigator.clipboard?.writeText(readout())}
          >
            Copy notes
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
